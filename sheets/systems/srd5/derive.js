// derive(character) → every number on the sheet, computed from the player's choices.
// It never writes back into the character. Rules cite SRD 5.2.1 printed pages.

import {
  ABILITIES, ABILITY_IDS, SKILLS, proficiencyBonus, abilityModifier, POINT_COSTS,
  HP_LEVEL_1, HP_FIXED_PER_LEVEL, STANDARD_LANGUAGES, BACKGROUND_INCREASE_CAP,
} from "./data/rules.js";
import { classById } from "./data/classes.js";
import { BACKGROUNDS } from "./data/backgrounds.js";
import { speciesById } from "./data/species.js";
import { featById } from "./data/feats.js";
import { WEAPONS, weaponById, armorById, SHIELD_BONUS, ARTISANS_TOOLS, MUSICAL_INSTRUMENTS, GAMING_SETS, ALL_TOOLS } from "./data/equipment.js";

export const backgroundById = (id) => BACKGROUNDS.find((b) => b.id === id);

/** A table column's value at a level (columns hold 20 values; "—" counts as 0). */
export function columnValue(cls, column, level) {
  const v = cls?.columns?.[column]?.values?.[level - 1];
  return typeof v === "number" ? v : v;
}
const asNumber = (v) => (typeof v === "number" ? v : 0);

/** A choice's count at a level: a number, { column }, or { byLevel }. */
export function choiceCount(cls, count, level) {
  if (typeof count === "number") return count;
  if (count?.column) return asNumber(columnValue(cls, count.column, level));
  if (count?.byLevel) return count.byLevel[level - 1] ?? 0;
  return 0;
}

/**
 * The choices the character must make right now, with where they come from.
 * key: the storage key in character.choices (or feats for kind "feat").
 */
export function activeChoices(c) {
  const out = [];
  const cls = classById(c.classId);
  const level = c.level;
  if (cls) {
    for (const ch of cls.choices || []) if (ch.level <= level) out.push({ ...ch, scope: "class", key: `class:${ch.id}`, source: cls.name, count: choiceCount(cls, ch.count, level) });
    if (cls.subclass && c.subclassId === cls.subclass.id && level >= cls.subclassLevel) {
      for (const ch of cls.subclass.choices || []) if (ch.level <= level) out.push({ ...ch, scope: "subclass", key: `subclass:${ch.id}`, source: cls.subclass.name, count: choiceCount(cls, ch.count, level) });
    }
  }
  const sp = speciesById(c.speciesId);
  if (sp) for (const ch of sp.choices || []) out.push({ ...ch, scope: "species", key: `species:${ch.id}`, source: sp.name, count: ch.count ?? 1 });
  const bg = backgroundById(c.backgroundId);
  // Soldier: "Choose one kind of Gaming Set" (p.83).
  if (bg?.tool?.choose === "gaming-set") out.push({ id: "tool", kind: "tool", label: "Gaming Set", from: ["gaming-sets"], scope: "background", key: "background:tool", source: bg.name, count: 1, cite: bg.cite });
  return out;
}

/** The feat slots this character has, each with what may fill it. */
export function featSlots(c) {
  const slots = [];
  const bg = backgroundById(c.backgroundId);
  // A background gives a specified Origin feat (p.83).
  if (bg) slots.push({ key: "background", label: `${bg.name} feat`, fixed: bg.feat.id, variant: bg.feat.variant, source: bg.name, cite: bg.cite });
  for (const ch of activeChoices(c)) {
    if (ch.kind !== "feat") continue;
    for (let i = 0; i < ch.count; i++) slots.push({ key: ch.count > 1 ? `${ch.key}@${i + 1}` : ch.key, label: ch.label || (ch.category === "fighting-style" ? "Fighting Style feat" : "Feat"), category: ch.category, source: ch.source, cite: ch.cite });
  }
  const cls = classById(c.classId);
  if (cls) {
    // Ability Score Improvement: "the Ability Score Improvement feat or another feat of your choice for which you qualify".
    for (const lv of cls.asiLevels || []) if (lv <= c.level) slots.push({ key: `level-${lv}`, label: `Level ${lv} feat`, level: lv, defaultFeat: "ability-score-improvement", source: cls.name });
    // Epic Boon: "an Epic Boon feat or another feat of your choice for which you qualify".
    if (cls.epicBoonLevel && cls.epicBoonLevel <= c.level) slots.push({ key: `level-${cls.epicBoonLevel}`, label: `Level ${cls.epicBoonLevel} feat (Epic Boon)`, level: cls.epicBoonLevel, defaultCategory: "epic-boon", source: cls.name });
  }
  return slots;
}

/** Tool names a "tool" choice may pick from. */
export function toolOptions(from) {
  if (!from) return ALL_TOOLS;
  return from.flatMap((f) => (f === "musical-instruments" ? MUSICAL_INSTRUMENTS : f === "artisans-tools" ? ARTISANS_TOOLS : f === "gaming-sets" ? GAMING_SETS : []));
}

/** Weapons a Weapon Mastery choice may name: by the class's text (Barbarian melee only; Paladin, Ranger, Rogue proficient only). */
export function masteryOptions(choice, d) {
  if (choice.filter === "melee") return WEAPONS.filter((w) => w.kind === "melee");
  if (choice.filter === "proficient") return WEAPONS.filter((w) => d.weaponProficient(w));
  return WEAPONS;
}

/** Skills a skill-proficiency choice may pick: the class list, an explicit list, or any skill ("any"). */
export function skillPool(choice, cls) {
  const from = choice.from === "skillChoices" ? cls?.skillChoices?.from : choice.from;
  return Array.isArray(from) ? from : SKILLS.map((s) => s.id);
}

const picks = (c, key) => c.choices[key] || [];
const optionOf = (c, key, choice) => (choice.options || []).find((o) => o.id === picks(c, key)[0]);

/** Ability scores step by step: base → background → feats (in level order) → class capstones. */
export function abilityScores(c) {
  const bg = backgroundById(c.backgroundId);
  const steps = Object.fromEntries(ABILITY_IDS.map((a) => [a, [{ label: "Base", amount: c.baseScores[a] }]]));
  const score = { ...c.baseScores };
  for (const a of ABILITY_IDS) {
    const n = c.backgroundBonus[a] || 0;
    if (n) { score[a] += n; steps[a].push({ label: bg ? bg.name : "Background", amount: n }); }
  }
  const afterBackground = { ...score };
  const slotOrder = featSlots(c).sort((x, y) => (x.level || 0) - (y.level || 0));
  for (const slot of slotOrder) {
    const f = c.feats[slot.key];
    const feat = featById(slot.fixed || f?.id);
    if (!feat || !f) continue;
    for (const a of ABILITY_IDS) {
      const n = f.increase?.[a] || 0;
      if (n) { score[a] += n; steps[a].push({ label: feat.name, amount: n }); }
    }
  }
  // Class capstones, e.g. Primal Champion (p.30): "increase by 4, to a maximum of 25".
  for (const e of classEffects(c).filter((x) => x.type === "ability-increase")) {
    for (const [a, n] of Object.entries(e.abilities)) {
      const raised = Math.max(score[a], Math.min(score[a] + n, e.max));
      if (raised !== score[a]) { steps[a].push({ label: e.name || "Class feature", amount: raised - score[a] }); score[a] = raised; }
    }
  }
  return { score, afterBackground, steps };
}

/** Class and subclass effects active at this level, plus effects from chosen options. */
export function classEffects(c) {
  const cls = classById(c.classId);
  if (!cls) return [];
  const out = [];
  const take = (list) => { for (const e of list || []) if ((e.level ?? 1) <= c.level) out.push({ name: featureName(e), ...e }); };
  take(cls.effects);
  const subOn = cls.subclass && c.subclassId === cls.subclass.id && c.level >= cls.subclassLevel;
  if (subOn) take(cls.subclass.effects);
  for (const ch of activeChoices(c)) {
    if (ch.kind !== "option" || (ch.scope !== "class" && ch.scope !== "subclass")) continue;
    const opt = optionOf(c, ch.key, ch);
    if (opt) take((opt.effects || []).map((e) => ({ level: ch.level, ...e })));
  }
  return out;
}

/** Everything the sheet shows. */
export function derive(c) {
  const cls = classById(c.classId);
  const sub = cls && cls.subclass && c.subclassId === cls.subclass.id && c.level >= cls.subclassLevel ? cls.subclass : null;
  const bg = backgroundById(c.backgroundId);
  const sp = speciesById(c.speciesId);
  const level = c.level;
  // Character Advancement table, p.23.
  const pb = proficiencyBonus(level);
  const effects = classEffects(c);
  const choices = activeChoices(c);
  const slots = featSlots(c);
  const feats = slots.map((s) => ({ slot: s, feat: featById(s.fixed || c.feats[s.key]?.id), data: c.feats[s.key] })).filter((x) => x.feat);
  const featEffects = feats.flatMap((x) => (x.feat.effects || []).map((e) => ({ ...e, name: x.feat.name })));

  // ---- Ability scores and modifiers (p.21) ----
  const ab = abilityScores(c);
  const scores = ab.score;
  const mod = Object.fromEntries(ABILITY_IDS.map((a) => [a, abilityModifier(scores[a])]));

  // ---- Point cost (p.21) ----
  const pointsSpent = ABILITY_IDS.reduce((sum, a) => sum + (POINT_COSTS[c.baseScores[a]] ?? 0), 0);

  // ---- Saving throws (p.22, Fill In Numbers) ----
  const saveProf = new Set(cls ? cls.savingThrows : []);
  for (const e of effects.filter((x) => x.type === "save-proficiency")) (e.abilities === "all" ? ABILITY_IDS : e.abilities).forEach((a) => saveProf.add(a));
  const saves = Object.fromEntries(ABILITY_IDS.map((a) => [a, { proficient: saveProf.has(a), total: mod[a] + (saveProf.has(a) ? pb : 0) }]));

  // ---- Skills: proficiency sources, Expertise (Rules Glossary), Jack of All Trades (Bard p.32) ----
  const skillSources = Object.fromEntries(SKILLS.map((s) => [s.id, []]));
  // Own keys only: a file can name any string as a skill, including "constructor" or "__proto__".
  const addSkill = (skillId, source) => { if (Object.hasOwn(skillSources, skillId)) skillSources[skillId].push(source); };
  if (bg) bg.skills.forEach((s) => addSkill(s, bg.name));
  const toolList = [];
  for (const ch of choices) {
    const list = picks(c, ch.key);
    if (ch.kind === "skill-proficiency") list.forEach((s) => addSkill(s, ch.source === cls?.name && ch.id === "class-skills" ? cls.name : (ch.label || ch.source)));
    if (ch.kind === "tool") list.forEach((t) => toolList.push({ name: t, source: ch.source }));
  }
  for (const x of feats) {
    if (x.feat.id === "skilled") for (const p of x.data?.picks || []) {
      if (p.startsWith("skill:")) addSkill(p.slice(6), "Skilled"); else if (p.startsWith("tool:")) toolList.push({ name: p.slice(5), source: "Skilled" });
    }
  }
  const expertise = new Set();
  for (const ch of choices.filter((x) => x.kind === "skill-expertise")) picks(c, ch.key).forEach((s) => expertise.add(s));
  const jack = effects.some((e) => e.type === "half-proficiency-unskilled");
  const skillBonuses = effects.filter((e) => e.type === "skill-bonus");
  const skills = Object.fromEntries(SKILLS.map((s) => {
    const proficient = skillSources[s.id].length > 0;
    const hasExpertise = proficient && expertise.has(s.id);
    let total = mod[s.ability] + (hasExpertise ? 2 * pb : proficient ? pb : jack ? Math.floor(pb / 2) : 0);
    // e.g. Thaumaturge (Cleric p.37): add Wisdom modifier (minimum +1) to Arcana and Religion checks.
    for (const b of skillBonuses) if (b.skills.includes(s.id)) total += Math.max(mod[b.ability], b.min ?? -Infinity);
    return [s.id, { proficient, expertise: hasExpertise, sources: skillSources[s.id], total, ability: s.ability }];
  }));

  // ---- Training: weapons and armor (Core Traits tables; Divine/Primal Order options) ----
  const armorTraining = new Set(cls ? cls.armor : []);
  effects.filter((e) => e.type === "armor-training").forEach((e) => e.kinds.forEach((k) => armorTraining.add(k)));
  const martialTraining = (cls?.weapons?.martial ?? false) || effects.some((e) => e.type === "weapon-training" && e.martial);
  const weaponProficient = (w) => {
    if (!cls) return false;
    if (w.category === "simple") return cls.weapons.simple;
    if (martialTraining) return true;
    return (cls.weapons.martialWithProperty || []).some((p) => w.properties.includes(p));
  };

  // ---- Armor Class (p.22 and Rules Glossary "Armor Class": choose one base calculation) ----
  const armor = armorById(c.armorId);
  const shieldUsable = c.shield && armorTraining.has("shield"); // Shield, p.92: only with training
  const candidates = [];
  if (armor) {
    const dex = armor.dexMax === null ? mod.dex : Math.min(mod.dex, armor.dexMax);
    candidates.push({ label: armor.name, value: armor.base + dex, shieldAllowed: true });
  } else {
    candidates.push({ label: "10 + DEX", value: 10 + mod.dex, shieldAllowed: true });
    for (const e of effects.filter((x) => x.type === "ac-base")) {
      if (e.requires === "no-armor" || e.requires === "no-armor-no-shield") {
        if (!e.shieldAllowed && c.shield) continue;
        candidates.push({ label: `${e.base} + ${e.abilities.map((a) => a.toUpperCase()).join(" + ")}`, value: e.base + e.abilities.reduce((s, a) => s + mod[a], 0), shieldAllowed: e.shieldAllowed });
      }
    }
  }
  const best = candidates.reduce((x, y) => (y.value > x.value ? y : x));
  const acParts = [{ label: best.label, amount: best.value }];
  if (shieldUsable && best.shieldAllowed) acParts.push({ label: "Shield", amount: SHIELD_BONUS });
  for (const e of featEffects.filter((x) => x.type === "ac-bonus")) {
    // Defense (p.88): +1 while wearing Light, Medium, or Heavy armor.
    if (e.requires === "wearing-armor" && !armor) continue;
    acParts.push({ label: e.name, amount: e.bonus });
  }
  const ac = acParts.reduce((s, p) => s + p.amount, 0);

  // ---- Speed (species; class features; armor Strength, p.92) ----
  const lineage = sp && (sp.choices || []).find((ch) => ch.id === "elven-lineage");
  const lineageOpt = lineage ? optionOf(c, "species:elven-lineage", lineage) : null;
  const speedParts = [];
  if (sp) speedParts.push({ label: lineageOpt?.speed ? lineageOpt.name : sp.name, amount: lineageOpt?.speed ?? sp.speed });
  const heavy = armor?.kind === "heavy";
  for (const e of effects.filter((x) => x.type === "speed")) {
    const ok = e.requires === "no-heavy-armor" ? !heavy : e.requires === "no-armor-no-shield" ? !armor && !c.shield : e.requires === "no-armor" ? !armor : true;
    const amount = e.values ? e.values[level - 1] : e.bonus;
    if (ok && amount) speedParts.push({ label: e.name || "Class feature", amount });
  }
  if (armor?.strength && scores.str < armor.strength) speedParts.push({ label: `${armor.name} needs STR ${armor.strength}`, amount: -10 });
  const speed = speedParts.reduce((s, p) => s + p.amount, 0);

  // ---- Initiative (p.22: Dexterity modifier; Alert adds Proficiency Bonus, p.87) ----
  const initParts = [{ label: "DEX", amount: mod.dex }];
  for (const e of featEffects.filter((x) => x.type === "initiative-bonus")) initParts.push({ label: e.name, amount: e.proficiencyBonus ? pb : 0 });
  const initiative = initParts.reduce((s, p) => s + p.amount, 0);

  // ---- Hit points (p.22 level 1; p.23 each later level: fixed value or roll, + CON, minimum 1) ----
  const die = cls?.hitDie ?? 0;
  const hpParts = [];
  if (cls) {
    hpParts.push({ label: "Level 1", amount: HP_LEVEL_1[die] + mod.con });
    for (let lv = 2; lv <= level; lv++) {
      const rolled = c.hp.method === "rolled" ? c.hp.rolls[lv] : undefined;
      const base = rolled ?? HP_FIXED_PER_LEVEL[die];
      hpParts.push({ label: `Level ${lv}${rolled ? " (rolled)" : ""}`, amount: Math.max(1, base + mod.con) });
    }
    for (const e of effects.filter((x) => x.type === "hp-bonus")) hpParts.push({ label: e.name || "Class feature", amount: e.perClassLevel ? e.perClassLevel * level : e.fixed || 0 });
  }
  // Dwarven Toughness (p.84): +1 per character level.
  for (const e of sp?.effects || []) if (e.type === "hp-bonus") hpParts.push({ label: "Dwarven Toughness", amount: e.perCharacterLevel * level });
  const hpMax = hpParts.reduce((s, p) => s + p.amount, 0);
  // Current HP: null means full; otherwise kept, and shown no higher than the maximum (Rules Glossary "Hit Points").
  const hpCurrent = c.hp.current === null ? hpMax : Math.min(c.hp.current, hpMax);

  // ---- Passive Perception (p.22): 10 + Wisdom (Perception) check modifier ----
  const passivePerception = 10 + skills.perception.total;

  // ---- Attacks (p.22: melee STR + PB, ranged DEX + PB; Finesse p.90; Thrown p.90; Martial Arts p.50) ----
  const monkArts = cls?.id === "monk" && !armor && !c.shield;
  const archery = featEffects.find((e) => e.type === "attack-bonus" && e.weapons === "ranged");
  const masteries = new Set(choices.filter((x) => x.kind === "weapon-mastery").flatMap((x) => picks(c, x.key)));
  const attacks = c.attacks.map((row, index) => {
    const w = row.weaponId ? weaponById(row.weaponId) : null;
    if (!w) return { index, custom: true, name: row.name, bonus: row.bonus, damage: row.damage, notes: row.notes };
    const monkWeapon = monkArts && w.kind === "melee" && (w.category === "simple" || w.properties.includes("light"));
    let ability = w.kind === "ranged" ? "dex" : "str";
    if (w.properties.includes("finesse") || monkWeapon) ability = mod.dex > mod.str ? "dex" : "str";
    const proficient = weaponProficient(w);
    const bonus = mod[ability] + (proficient ? pb : 0) + (archery && w.kind === "ranged" ? archery.bonus : 0);
    let dieText = w.damage;
    if (monkWeapon) { const ma = columnValue(cls, "martialArts", level); if (typeof ma === "string" && dieSize(ma) > dieSize(w.damage)) dieText = ma; }
    const damage = `${dieText}${mod[ability] ? (mod[ability] > 0 ? "+" : "") + mod[ability] : ""} ${w.type}`;
    const notes = [w.versatile ? `Versatile ${w.versatile}` : "", w.range ? `Range ${w.range}` : "", proficient ? "" : "Not proficient"].filter(Boolean);
    return { index, custom: false, name: w.name, weaponId: w.id, ability, proficient, bonus, damage, mastery: masteries.has(w.id) ? w.mastery : "", notes };
  });
  // Unarmed Strike (Rules Glossary): STR + PB to hit, 1 + STR Bludgeoning; Monks use the Martial Arts die and may use DEX (p.50).
  const unarmedAbility = monkArts && mod.dex > mod.str ? "dex" : "str";
  const unarmedDie = monkArts ? columnValue(cls, "martialArts", level) : "1";
  const unarmed = { name: "Unarmed Strike", bonus: mod[unarmedAbility] + pb,
    damage: monkArts ? `${unarmedDie}${signedPlain(mod[unarmedAbility])} Bludgeoning` : `${1 + mod.str} Bludgeoning` };

  // ---- Spellcasting (p.22–23 formulas; class tables) ----
  let spellcasting = null;
  if (cls?.spellcasting && level >= (cls.spellcasting.level ?? 1)) {
    const sc = cls.spellcasting;
    const m = mod[sc.ability];
    spellcasting = {
      ability: sc.ability, mod: m,
      saveDC: 8 + m + pb,     // "Spell save DC = 8 + spellcasting ability modifier + Proficiency Bonus"
      attack: m + pb,         // "Spell attack bonus = spellcasting ability modifier + Proficiency Bonus"
      cantrips: sc.cantrips ? asNumber(columnValue(cls, sc.cantrips.column, level)) : 0,
      prepared: sc.prepared ? asNumber(columnValue(cls, sc.prepared.column, level)) : 0,
      slots: sc.slots ? sc.slots[level - 1] : [0, 0, 0, 0, 0, 0, 0, 0, 0],
      pact: sc.pact ? { slots: asNumber(columnValue(cls, sc.pact.slots.column, level)), slotLevel: asNumber(columnValue(cls, sc.pact.slotLevel.column, level)) } : null,
      cite: sc.cite,
    };
  }

  // ---- Limited-use features ----
  const resources = [];
  const addResource = (r, source) => {
    if ((r.level ?? 1) > level) return;
    if (r.requiresOption && picks(c, `species:${r.requiresOption.choice}`)[0] !== r.requiresOption.option) return;
    const u = r.uses;
    const max = u.column ? asNumber(columnValue(cls, u.column, level))
      : u.ability ? Math.max(mod[u.ability], u.min ?? -Infinity)
      : u.perClassLevel ? u.perClassLevel * level
      : u.fixed ? u.fixed
      : u.proficiencyBonus ? pb
      : u.byLevel ? u.byLevel[level - 1] ?? 0 : 0;
    if (max <= 0) return;
    resources.push({ id: r.id, name: r.name, max, used: Math.min(c.used[r.id] || 0, max), recharge: r.recharge, source, cite: r.cite });
  };
  if (cls) (cls.resources || []).forEach((r) => addResource(r, cls.name));
  if (sub) (sub.resources || []).forEach((r) => addResource(r, sub.name));
  if (sp) (sp.resources || []).forEach((r) => addResource(r, sp.name));

  // ---- Features and traits ----
  const features = [];
  if (cls) for (let lv = 1; lv <= level; lv++) {
    for (const name of cls.features[lv] || []) {
      if (/^Subclass feature$/i.test(name) && sub) continue;
      features.push({ level: lv, name, source: cls.name });
    }
    if (sub) for (const name of sub.features[lv] || []) features.push({ level: lv, name, source: sub.name });
  }
  const traits = sp ? [...sp.traits] : [];
  // Breath Weapon (p.84): Dexterity save DC 8 + CON modifier + Proficiency Bonus; damage dice by character level.
  const speciesDCs = (sp?.saveDCs || []).map((s) => ({ name: s.name, dc: 8 + mod[s.ability] + pb,
    damage: Object.entries(s.damageByLevel).filter(([lv]) => Number(lv) <= level).pop()?.[1] ?? "" }));

  // ---- Senses, resistances, languages, tools ----
  const darkvision = lineageOpt?.darkvision ?? sp?.darkvision ?? 0;
  const resistances = [...(sp?.resistances || [])];
  for (const ch of choices.filter((x) => x.scope === "species" && x.kind === "option")) {
    const o = optionOf(c, ch.key, ch);
    if (o?.resistance) resistances.push(o.resistance);
  }
  const languages = ["Common", ...c.languages.map((l) => STANDARD_LANGUAGES.find((s) => s.id === l)?.name ?? l)];
  for (const e of effects.filter((x) => x.type === "language")) languages.push(...e.names);
  for (const ch of choices.filter((x) => x.kind === "language")) languages.push(...picks(c, ch.key));
  if (bg?.tool?.fixed) toolList.unshift({ name: bg.tool.fixed, source: bg.name });
  if (cls?.tools?.text && !cls.tools.choose) toolList.unshift({ name: cls.tools.text, source: cls.name });

  return {
    // Until the player picks how to make the scores, every number built on them is unknown ("—").
    scoresKnown: c.abilityMethod !== "",
    cls, sub, bg, sp, level, pb, scores, mod, abilitySteps: ab.steps, afterBackground: ab.afterBackground,
    pointsSpent, saves, skills, expertise, jack, ac, acParts, speed, speedParts, size: c.size || (sp?.sizes.length === 1 ? sp.sizes[0] : ""),
    initiative, initParts, hpMax, hpParts, hpCurrent, hitDie: die, passivePerception,
    armor, armorTraining, martialTraining, weaponProficient, shieldUsable,
    attacks, unarmed, spellcasting, resources, features, traits, speciesDCs, feats, slots, choices,
    darkvision, resistances, languages, tools: toolList,
    weaponsText: cls ? cls.weaponsText + (martialTraining && !cls.weapons.martial ? "; Martial weapons" : "") : "",
    xpForNext: null,
  };
}

/** "p.29, Level 5: Fast Movement" → "Fast Movement". */
const featureName = (e) => (/Level \d+: (.+)$/.exec(e.cite || "")?.[1]) || undefined;
const dieSize = (d) => { const m = /d(\d+)/.exec(d || ""); return m ? Number(m[1]) : 1; };
const signedPlain = (n) => (n > 0 ? `+${n}` : n < 0 ? `${n}` : "");

export const abilityName = (id) => ABILITIES.find((a) => a.id === id)?.name ?? id;
export { BACKGROUND_INCREASE_CAP };
