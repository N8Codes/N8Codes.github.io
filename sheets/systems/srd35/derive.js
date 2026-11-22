// Open Game Content under the Open Game License v1.0a (see license.js): the game rules in this file and the code that holds or computes them.
// derive(character) → every computed number on the 3.5 sheet. Pure: it never changes the character.
// Rules cite the 3.5 System Reference Document by file and section (it has no page numbers).

import { ABILITY_IDS, SKILLS, SKILL_IDS, abilityModifier, abilityName, bonusSpells, minScoreToCast, expandSkills,
  SYNERGIES, SITUATIONAL_SYNERGIES, maxClassRanks, maxCrossClassRanks, BAB, SAVE, iterativeAttacks, featLevel,
  abilityIncreaseLevel, SIZES, carryingCapacity } from "./data/rules.js";
import { CLASSES, classById } from "./data/classes.js";
import { raceById, CLASS_LANGUAGES } from "./data/races.js";
import { featById } from "./data/feats.js";
import { weaponById, armorById } from "./data/equipment.js";
import { domainById } from "./data/domains.js";

export { abilityName };

// ---------- per-level helpers ----------

/** Class levels held after the first n character levels: { fighter: 2, rogue: 1 }. */
export function classLevelsAt(c, n = c.levels.length) {
  const out = {};
  for (const lv of c.levels.slice(0, n)) if (lv.classId && classById(lv.classId)) out[lv.classId] = (out[lv.classId] || 0) + 1;
  return out;
}

/**
 * Ability scores after the first n character levels: base + racial adjustment + the +1 increases taken by then
 * (Epic Level Basics: "Upon gaining any level divisible by four … increases one of his or her ability scores by 1").
 * null when the base score hasn't been entered.
 */
export function scoresAt(c, n = c.levels.length) {
  const race = raceById(c.raceId);
  const out = {};
  for (const a of ABILITY_IDS) {
    const base = c.baseScores[a];
    if (base === null || base === undefined) { out[a] = null; continue; }
    let s = base + (race?.abilities?.[a] || 0);
    // Races, Half-Orcs: "A half-orc's starting Intelligence score is always at least 3."
    if (a === "int" && race?.minInt) s = Math.max(race.minInt, s);
    for (let i = 0; i < Math.min(n, c.levels.length); i++) if (abilityIncreaseLevel(i + 1) && c.levels[i].increase === a) s += 1;
    out[a] = s;
  }
  return out;
}

const modOf = (score) => (score === null ? null : abilityModifier(score));

/** Base attack bonus: the sum over classes (Classes II, Multiclass Characters). */
export function babFor(classLevels) {
  return Object.entries(classLevels).reduce((sum, [id, n]) => sum + BAB[classById(id).bab](n), 0);
}
/** Base save bonuses: the sum over classes. */
export function baseSavesFor(classLevels) {
  const out = { fort: 0, ref: 0, will: 0 };
  for (const [id, n] of Object.entries(classLevels)) for (const s of Object.keys(out)) out[s] += SAVE[classById(id).saves[s]](n);
  return out;
}

/**
 * Skill ids that are class skills for this class (Craft, Knowledge, … expanded). For a cleric, the chosen domains'
 * granted powers add skills ("Add Knowledge (nature) to your list of cleric class skills", Spell List I, Cleric Domains).
 */
export function classSkillsOf(cls, c = null) {
  if (!cls) return [];
  const extra = cls.id === "cleric" && c ? chosenDomains(c).flatMap((d) => d.classSkills || []) : [];
  return expandSkills([...cls.classSkills, ...extra]);
}

/** The cleric's chosen domains (Classes I, Cleric, Deity, Domains: two). */
export const chosenDomains = (c) => (c.levels.some((lv) => lv.classId === "cleric") ? (c.choices["cleric:domains"] || []).map(domainById).filter(Boolean) : []);
/** War domain: the deity's favored weapon (a weapon id), chosen with the domain. */
export const warWeapon = (c) => (chosenDomains(c).some((d) => d.weaponChoice) ? ((c.choices["cleric:war-weapon"] || [])[0] || "") : "");

// ---------- feat slots ----------

/**
 * Every feat the character has or must choose, in character-level order.
 *  - general: character level 1 and every level divisible by 3 (Classes I, Fighter: "the feat that any 1st-level
 *    character gets"; Epic Level Basics: "one feat … at every level divisible by three").
 *  - Human: one extra at 1st level (Races, Humans).
 *  - class bonus feats and granted feats, at the class level the class table gives them.
 *  - feats granted by a class choice (ranger combat style), and the rogue's "feat" special ability.
 */
export function featSlots(c) {
  const slots = [];
  const race = raceById(c.raceId);
  const count = {};
  c.levels.forEach((lv, i) => {
    const L = i + 1;
    if (featLevel(L)) slots.push({ key: `level-${L}`, label: `Feat (level ${L})`, level: L, from: null, ignorePrereqs: false, source: `Character level ${L}` });
    if (L === 1 && race?.bonusFeat) slots.push({ key: "human", label: "Human bonus feat", level: 1, from: null, ignorePrereqs: false, source: race.name });
    const cls = classById(lv.classId);
    if (!cls) return;
    const k = (count[cls.id] = (count[cls.id] || 0) + 1);
    for (const b of cls.bonusFeats || []) {
      if (b.levels.includes(k)) slots.push({ key: `${cls.id}-${k}`, label: `${b.label} (${cls.name} ${k})`, level: L, from: b.from, ignorePrereqs: Boolean(b.ignorePrereqs), source: `${cls.name} ${k}`, cite: b.cite });
    }
    for (const g of cls.grantedFeats || []) {
      if (g.level === k) slots.push({ key: `${cls.id}-granted-${g.feat}`, label: featById(g.feat)?.name ?? g.feat, level: L, fixed: g.feat, source: `${cls.name} ${k}`, cite: g.cite });
    }
    // War domain (Spell List I): "Free Martial Weapon Proficiency with deity's favored weapon (if necessary) and Weapon
    // Focus with the deity's favored weapon", from the cleric's first level.
    if (cls.id === "cleric" && k === 1 && warWeapon(c)) {
      slots.push({ key: "cleric-war-weapon-focus", label: "Weapon Focus", level: L, fixed: "weapon-focus", fixedDetail: warWeapon(c), source: "War domain", cite: "Spell List I, War Domain" });
    }
    for (const ch of cls.choices || []) {
      if (ch.kind !== "option") continue;
      const picked = (c.choices[`${cls.id}:${ch.id}`] || [])[0];
      const opt = (ch.options || []).find((o) => o.id === picked);
      if (ch.level <= k) for (const g of opt?.grants || []) {
        if (g.level === k) slots.push({ key: `${cls.id}-${ch.id}-${g.feat}`, label: featById(g.feat)?.name ?? g.feat, level: L, fixed: g.feat, source: `${cls.name} ${k}, ${opt.name}`, cite: ch.cite, ignorePrereqs: true });
      }
      if (ch.level === k && picked === "feat") slots.push({ key: `${cls.id}-${ch.id}`, label: `Feat (${cls.name} ${k} special ability)`, level: L, from: null, ignorePrereqs: false, source: `${cls.name} ${k}`, cite: ch.cite });
    }
  });
  return slots;
}

/** The feats the character has: [{ slot, feat, detail }] (chosen or fixed; unknown ids left out). */
export function featsTaken(c, slots = featSlots(c)) {
  const out = [];
  for (const s of slots) {
    const id = s.fixed || c.feats[s.key]?.id;
    const feat = id ? featById(id) : null;
    if (feat) out.push({ slot: s, feat, detail: s.fixed ? (s.fixedDetail || "") : (c.feats[s.key]?.detail || "") });
  }
  return out;
}

// ---------- skills ----------

/** Skill points available at each character level (Classes I and II, each class's "Skill Points" lines; Races, Humans). */
export function skillPointsByLevel(c) {
  const race = raceById(c.raceId);
  return c.levels.map((lv, i) => {
    const cls = classById(lv.classId);
    if (!cls) return null;
    // Basics, Intelligence: "always gets at least 1 skill point per level"; INT as of this level. Owner ruling
    // (2026-11-22): the +1 increase taken at this level counts for this level's points; earlier levels are not
    // recounted ("does not retroactively get additional skill points").
    const int = scoresAt(c, i + 1).int;
    if (int === null) return null;
    let n = Math.max(1, cls.skillPoints + abilityModifier(int));
    if (race?.bonusSkillPoints) n += 1;
    return i === 0 ? n * 4 : n;
  });
}

/**
 * Ranks in every skill, and the limit checks per level. Skills I, Skills Summary: a point buys 1 rank in a class
 * skill of the class taken at that level, half a rank otherwise; the maximum is character level + 3 if the skill is
 * a class skill for any class held, half that if not.
 */
export function skillRanks(c) {
  const ranks = Object.fromEntries(SKILL_IDS.map((s) => [s, 0]));
  const overMax = [];          // { level, skill, ranks, max }
  const classSkillAny = new Set();
  c.levels.forEach((lv, i) => {
    const cls = classById(lv.classId);
    const own = new Set(classSkillsOf(cls, c));
    for (const s of own) classSkillAny.add(s);
    for (const [s, pts] of Object.entries(lv.skills || {})) {
      if (!(s in ranks)) continue;
      ranks[s] += own.has(s) ? pts : pts / 2;
    }
    const L = i + 1;
    for (const s of SKILL_IDS) {
      const max = classSkillAny.has(s) ? maxClassRanks(L) : maxCrossClassRanks(L);
      if (ranks[s] > max) overMax.push({ level: L, skill: s, ranks: ranks[s], max });
    }
  });
  return { ranks, overMax, classSkillAny };
}

// ---------- the whole derivation ----------

export function derive(c) {
  const race = raceById(c.raceId);
  const size = race?.size ?? "Medium";
  const sz = SIZES[size];
  const level = c.levels.length;
  const classLevels = classLevelsAt(c);
  const classes = Object.keys(classLevels).map(classById);
  const scores = scoresAt(c);
  // Classes I, Barbarian, Rage / Greater Rage (11th) / Mighty Rage (20th): +4/+6/+8 Strength and Constitution,
  // +2/+3/+4 morale on Will saves, −2 AC. Only while the "Raging" switch is on.
  const barbarian = classLevels.barbarian || 0;
  const rage = c.active?.rage && barbarian ? (barbarian >= 20 ? { ab: 8, will: 4 } : barbarian >= 11 ? { ab: 6, will: 3 } : { ab: 4, will: 2 }) : null;
  if (rage) for (const a of ["str", "con"]) if (scores[a] !== null) scores[a] += rage.ab;
  const scoresKnown = ABILITY_IDS.every((a) => scores[a] !== null);
  const mod = Object.fromEntries(ABILITY_IDS.map((a) => [a, modOf(scores[a])]));
  const abilitySteps = Object.fromEntries(ABILITY_IDS.map((a) => {
    const steps = [];
    if (race?.abilities?.[a]) steps.push({ label: race.name, amount: race.abilities[a] });
    const incs = c.levels.map((lv, i) => (abilityIncreaseLevel(i + 1) && lv.increase === a ? i + 1 : 0)).filter(Boolean);
    if (incs.length) steps.push({ label: `level ${incs.join(", ")}`, amount: incs.length });
    if (rage && (a === "str" || a === "con")) steps.push({ label: "rage", amount: rage.ab });
    return [a, steps];
  }));

  const slots = featSlots(c);
  const feats = featsTaken(c, slots);
  const effects = feats.flatMap((f) => (f.feat.effects || []).map((e) => ({ ...e, feat: f.feat, detail: f.detail })));
  const has = (id) => feats.some((f) => f.feat.id === id);

  // Class effects, active at the class level they start.
  const classEffects = [];
  for (const cls of classes) {
    const n = classLevels[cls.id];
    for (const e of cls.effects || []) if (!e.fromLevel || n >= e.fromLevel) classEffects.push({ ...e, cls, n });
  }

  // ---- Base attack, saves ----
  const bab = babFor(classLevels);
  const baseSaves = baseSavesFor(classLevels);

  // ---- Armor ----
  const armor = armorById(c.armorId) && armorById(c.armorId).kind !== "shield" ? armorById(c.armorId) : null;
  const shield = armorById(c.shieldId)?.kind === "shield" ? armorById(c.shieldId) : null;
  const armorProf = armorProficiencies(classes, feats);
  const armorProficient = !armor || armorProf.has(armor.kind);
  const shieldProficient = !shield || armorProf.has(shield.id === "shield-tower" ? "tower" : "shield");
  // Carrying and Exploration, Weight: armor, weapons and gear all count; Table: Carrying Loads sets the limits of a
  // medium (max Dex +3, check −3) or heavy (max Dex +1, check −6) load; "use the worse figure … Do not stack".
  const carrying = scores.str === null ? null : carryingCapacity(scores.str, size);
  const carried = Math.round(((armor?.weight || 0) + (shield?.weight || 0)
    + c.attacks.reduce((sum, a) => sum + (weaponById(a.weaponId)?.weight || 0), 0)
    + c.inventory.reduce((sum, it) => sum + it.qty * it.weight, 0)) * 10) / 10;
  const load = !carrying ? "light" : carried <= carrying[0] ? "light" : carried <= carrying[1] ? "medium" : carried <= carrying[2] ? "heavy" : "overloaded";
  const LOAD = { medium: { maxDex: 3, acp: -3 }, heavy: { maxDex: 1, acp: -6 }, overloaded: { maxDex: 0, acp: -6 } };
  // Monk AC and fast movement need no armor, no shield and a light load (Classes I, Monk).
  const unarmored = !armor && !shield && load === "light";
  // Equipment, Armor: max Dex bonus is the lowest limit worn; armor check penalties of armor and shield add.
  const maxDexList = [armor?.maxDex, shield?.maxDex, LOAD[load]?.maxDex].filter((x) => x !== null && x !== undefined);
  const maxDex = maxDexList.length ? Math.min(...maxDexList) : null;
  const acp = Math.min((armor?.acp || 0) + (shield?.acp || 0), LOAD[load]?.acp ?? 0);
  const asf = (armor?.asf || 0) + (shield?.asf || 0);

  // ---- Armor Class (Combat I, Armor Class) ----
  const dexToAc = mod.dex === null ? null : (maxDex === null ? mod.dex : Math.min(mod.dex, maxDex));
  const acParts = [{ label: "base", amount: 10 }];
  if (armor) acParts.push({ label: armor.name, amount: armor.ac });
  if (shield) acParts.push({ label: shield.name, amount: shield.ac });
  if (dexToAc !== null && dexToAc !== 0) acParts.push({ label: "DEX", amount: dexToAc });
  if (sz.ac) acParts.push({ label: "size", amount: sz.ac });
  const touchExtra = [];
  if (rage) { const p = { label: "rage", amount: -2 }; acParts.push(p); touchExtra.push(p); }
  for (const e of classEffects) {
    if (e.kind === "ac-ability" && (!e.when || (e.when === "unarmored" && unarmored)) && mod[e.ability] !== null && mod[e.ability] > 0) {
      const p = { label: `${abilityName(e.ability).slice(0, 3).toUpperCase()} (${e.cls.name})`, amount: mod[e.ability] };
      acParts.push(p); touchExtra.push(p);
    }
    if (e.kind === "ac-bonus" && (!e.when || (e.when === "unarmored" && unarmored))) {
      const v = e.byLevel?.[e.n - 1] || 0;
      if (v) { const p = { label: `${e.cls.name} AC bonus`, amount: v }; acParts.push(p); touchExtra.push(p); }
    }
  }
  const ac = acParts.reduce((s, p) => s + p.amount, 0);
  const touch = 10 + (dexToAc ?? 0) + sz.ac + touchExtra.reduce((s, p) => s + p.amount, 0);
  const flatFooted = ac - Math.max(0, dexToAc ?? 0);

  // ---- Saves (Combat I, Saving Throws): base + ability + race + feats + class effects ----
  const saveAbility = { fort: "con", ref: "dex", will: "wis" };
  const saves = {};
  for (const s of ["fort", "ref", "will"]) {
    const parts = [{ label: "base", amount: baseSaves[s] }];
    if (mod[saveAbility[s]] !== null) parts.push({ label: saveAbility[s].toUpperCase(), amount: mod[saveAbility[s]] });
    if (race?.saveBonus) parts.push({ label: race.name, amount: race.saveBonus });
    for (const e of effects) if (e.kind === "save-bonus" && e.save === s) parts.push({ label: e.feat.name, amount: e.amount });
    for (const e of classEffects) if (e.kind === "save-ability" && mod[e.ability] !== null && mod[e.ability] > 0) parts.push({ label: `${e.cls.name} (${e.ability.toUpperCase()})`, amount: mod[e.ability] });
    if (rage && s === "will") parts.push({ label: "rage", amount: rage.will });
    saves[s] = { total: parts.reduce((x, p) => x + p.amount, 0), parts };
  }

  // ---- Initiative, grapple, speed ----
  const initParts = mod.dex === null ? [] : [{ label: "DEX", amount: mod.dex }];
  for (const e of effects) if (e.kind === "initiative") initParts.push({ label: e.feat.name, amount: e.amount });
  const initiative = initParts.reduce((s, p) => s + p.amount, 0);
  // Combat II, Grapple: base attack bonus + Strength modifier + special size modifier.
  const grapple = bab + (mod.str ?? 0) + sz.grapple;
  // Equipment, Table: Armor and Shields speed columns; Races, Dwarves: not slowed by armor.
  const baseSpeed = race?.speed ?? 30;
  const slowedByArmor = armor && (armor.kind === "medium" || armor.kind === "heavy");
  const slowedByLoad = load !== "light";
  const speedParts = [{ label: race ? race.name : "base", amount: baseSpeed }];
  // Table: Carrying Loads: 30 ft. → 20 ft., 20 ft. → 15 ft. for a medium or heavy load, the same as for armor.
  if ((slowedByArmor || slowedByLoad) && !race?.noArmorSlowdown) {
    speedParts.push({ label: slowedByLoad && !slowedByArmor ? `${load} load` : armor.name, amount: (baseSpeed === 20 ? 15 : 20) - baseSpeed });
  }
  for (const e of classEffects) {
    if (e.kind !== "speed") continue;
    // Barbarian fast movement: not in heavy armor or with a heavy load (Classes I, Barbarian, Fast Movement).
    const ok = e.when === "unarmored" ? unarmored : e.when === "not-heavy-armor" ? armor?.kind !== "heavy" && load !== "heavy" && load !== "overloaded" : true;
    const v = e.byLevel?.[e.n - 1] || 0;
    if (ok && v) speedParts.push({ label: e.cls.name, amount: v });
  }
  const speed = speedParts.reduce((s, p) => s + p.amount, 0);

  // ---- Hit points: max Hit Die at character level 1 (owner ruling), rolls after; CON each level, minimum 1 ----
  const hpParts = [];
  let hpMax = null;
  const hpKnown = Boolean(classById(c.levels[0]?.classId)) && mod.con !== null;
  if (hpKnown) {
    let total = 0;
    c.levels.forEach((lv, i) => {
      const cls = classById(lv.classId);
      if (!cls) return;
      const die = i === 0 ? cls.hitDie : (lv.hp ?? 0);
      if (i > 0 && !lv.hp) return; // not rolled yet: counted when entered
      total += Math.max(1, die + mod.con);
    });
    const toughness = effects.filter((e) => e.kind === "hp").reduce((s, e) => s + e.amount, 0);
    hpParts.push({ label: "Hit Dice + CON", amount: total });
    if (toughness) hpParts.push({ label: "Toughness", amount: toughness });
    hpMax = total + toughness;
  }
  const hpCurrent = c.hp.current === null ? hpMax : c.hp.current;

  // ---- Skills ----
  const { ranks, overMax, classSkillAny } = skillRanks(c);
  const points = skillPointsByLevel(c);
  const spent = c.levels.map((lv) => Object.values(lv.skills || {}).reduce((s, n) => s + n, 0));
  const skills = {};
  for (const s of SKILLS) {
    const parts = [];
    const r = Math.floor(ranks[s.id]);
    if (r) parts.push({ label: "ranks", amount: r });
    if (s.ability && mod[s.ability] !== null && mod[s.ability] !== 0) parts.push({ label: s.ability.toUpperCase(), amount: mod[s.ability] });
    const racial = race?.skillBonuses?.[s.id];
    if (racial) parts.push({ label: race.name, amount: racial });
    if (s.id === "hide" && sz.hide) parts.push({ label: "size", amount: sz.hide });
    for (const syn of SYNERGIES) if (syn.to === s.id && ranks[syn.from] >= 5) parts.push({ label: `synergy`, amount: 2 });
    for (const e of effects) {
      if (e.kind === "skill-bonus" && e.skills.includes(s.id)) parts.push({ label: e.feat.name, amount: e.amount });
      if (e.kind === "skill-focus" && e.detail === s.id) parts.push({ label: e.feat.name, amount: e.amount });
    }
    for (const e of classEffects) if (e.kind === "skill-bonus" && e.skills.includes(s.id)) parts.push({ label: e.cls.name, amount: e.amount });
    if (s.acp && acp) parts.push({ label: "armor", amount: acp * s.acp });
    const total = parts.reduce((x, p) => x + p.amount, 0);
    skills[s.id] = {
      ranks: ranks[s.id], total, parts, classSkill: classSkillAny.has(s.id),
      usable: !s.trained || ranks[s.id] >= 1,  // Skills I: trained-only skills need at least 1 rank
      known: s.ability === null || mod[s.ability] !== null,
    };
  }
  const situational = SITUATIONAL_SYNERGIES.filter((x) => (x.from === "craft" ? ["craft-1", "craft-2"].some((k) => ranks[k] >= 5) : ranks[x.from] >= 5));

  // ---- Languages (Races, Race and Languages; Skills II, Speak Language) ----
  const autoLanguages = [...(race?.languages ?? ["Common"])];
  if (classLevels.druid) autoLanguages.push("Druidic"); // Classes I, Druid: druids know Druidic
  const intAt1 = scoresAt(c, 1).int;
  const bonusLanguageCount = intAt1 === null ? 0 : Math.max(0, abilityModifier(intAt1));
  const bonusLanguagePool = race?.bonusLanguages === "any" ? "any" : [...new Set([...(race?.bonusLanguages ?? []), ...classes.flatMap((x) => CLASS_LANGUAGES[x.id] ?? [])])];
  const speakLanguageRanks = Math.floor(ranks["speak-language"]);

  // ---- Weapons and attacks (Combat I, Attack Bonus; Basics, Strength) ----
  const weaponProf = weaponProficiencies(classes, feats, race);
  // War domain: "Free Martial Weapon Proficiency with deity's favored weapon (if necessary)" (Spell List I).
  if (warWeapon(c)) weaponProf.add(warWeapon(c));
  const attackSeq = iterativeAttacks(bab);
  // Inspire courage received (Classes I, Bard): a morale bonus on attack and weapon damage rolls.
  const courage = c.active?.courage || 0;
  const attacks = c.attacks.map((a, index) => (a.weaponId ? weaponAttack(a.weaponId, index, a.rating) : { index, custom: true, ...a }));
  function weaponAttack(weaponId, index, rating) {
    const w = weaponById(weaponId);
    if (!w) return { index, custom: true, name: "(unknown weapon)", bonus: "", damage: "", notes: "" };
    const ranged = w.kind === "ranged";
    const finesse = has("weapon-finesse") && !ranged && (w.kind === "light" || ["rapier", "whip", "chain-spiked"].includes(w.id));
    const notes = [];
    let abil = ranged ? "dex" : "str";
    if (finesse && mod.dex !== null && mod.str !== null && mod.dex > mod.str) { abil = "dex"; notes.push("Weapon Finesse"); }
    let bonus = (mod[abil] ?? 0) + sz.attack;
    if (!weaponProf.has(w.id)) { bonus -= 4; notes.push("not proficient (−4)"); }
    if (!armorProficient) { bonus += armor.acp; notes.push(`armor not proficient (${armor.acp})`); }
    if (!shieldProficient) { bonus += shield.acp; notes.push(`shield not proficient (${shield.acp})`); }
    if (race?.id === "halfling" && (w.thrown || w.id === "sling")) { bonus += 1; notes.push("halfling +1"); }
    for (const e of effects) if (e.kind === "weapon-attack" && e.detail === w.id) { bonus += e.amount; notes.push(e.feat.name); }
    if (courage) { bonus += courage; notes.push(`inspire courage +${courage}`); }
    const composite = /-composite$/.test(w.id);
    // Equipment, composite bows: Strength bonus to damage up to the bow's strength rating; −2 to attack if your
    // Strength bonus is lower than the rating.
    if (composite && (rating || 0) > Math.max(0, mod.str ?? 0)) { bonus -= 2; notes.push(`Strength below the bow's rating +${rating} (−2)`); }
    // Damage: Strength to melee and thrown weapons and slings; 1½× with a two-handed melee weapon; a bow that
    // isn't composite takes a Strength penalty but not a bonus (Basics, Strength).
    let strDmg = 0;
    const strMod = mod.str ?? 0;
    if (!ranged || w.thrown) strDmg = w.kind === "two-handed" && strMod > 0 ? Math.floor(strMod * 1.5) : strMod;
    else if (w.id === "sling") strDmg = strMod;
    else if (composite) strDmg = strMod < 0 ? strMod : Math.min(strMod, rating || 0);
    else if (/bow/.test(w.id) && !/crossbow/.test(w.id)) strDmg = Math.min(0, strMod);
    for (const e of effects) if (e.kind === "weapon-damage" && e.detail === w.id) strDmg += e.amount;
    strDmg += courage;
    const dice = size === "Small" ? w.dmgS : w.dmgM;
    return { index, custom: false, weapon: w, name: w.name, attacks: attackSeq.map((b) => b + bonus), bonus, composite, rating: rating || 0,
      damage: `${dice}${strDmg ? (strDmg > 0 ? `+${strDmg}` : `−${-strDmg}`) : ""}`, critical: w.critical, notes };
  }
  // Unarmed strike (Equipment, Table: Weapons: 1d2 Small, 1d3 Medium, nonlethal); the monk column replaces it.
  const monkDmg = classEffects.find((e) => e.kind === (size === "Small" ? "unarmed-damage-small" : "unarmed-damage")) ?? classEffects.find((e) => e.kind === "unarmed-damage");
  const unarmedDice = monkDmg ? monkDmg.byLevel[monkDmg.n - 1] : (size === "Small" ? "1d2" : "1d3");
  const unarmedDmg = (mod.str ?? 0) + courage;
  const unarmed = { name: "Unarmed strike", attacks: attackSeq.map((b) => b + (mod.str ?? 0) + sz.attack + courage), damage: `${unarmedDice}${unarmedDmg ? (unarmedDmg > 0 ? `+${unarmedDmg}` : `−${-unarmedDmg}`) : ""}`, nonlethal: !monkDmg && !has("improved-unarmed-strike") };
  const flurryE = classEffects.find((e) => e.kind === "flurry");
  const flurry = flurryE ? flurryE.byLevel[flurryE.n - 1] : null;
  const sneakE = classEffects.find((e) => e.kind === "sneak-attack");
  const sneakAttack = sneakE ? sneakE.byLevel[sneakE.n - 1] : null;

  // ---- Class features, choices, resources ----
  const features = [];
  const choices = [];
  const resources = [];
  for (const cls of classes) {
    const n = classLevels[cls.id];
    cls.table.slice(0, n).forEach((row, i) => { for (const f of row.special || []) features.push({ level: i + 1, cls, name: f }); });
    for (const ch of cls.choices || []) if (ch.level <= n) choices.push({ ...ch, key: `${cls.id}:${ch.id}`, cls });
    for (const r of cls.resources || []) {
      if (r.fromLevel && n < r.fromLevel) continue;
      const max = resourceMax(r.uses, n, mod);
      if (max === null || max <= 0) continue;
      const key = `${cls.id}:${r.id}`;
      resources.push({ ...r, key, cls, max, used: c.used[key] || 0 });
    }
    // Ranger favored enemy (Classes II, Ranger): at 5th, 10th, 15th and 20th level "the bonus against any one favored
    // enemy (including the one just selected, if so desired) increases by 2". Offered as a choice per interval.
    if (cls.id === "ranger") for (const L of [5, 10, 15, 20]) {
      if (n < L) continue;
      const options = favoredEnemyPicks(c, L).map((id) => ({ id, name: favoredEnemyName(id) }));
      choices.push({ id: `favored-enemy-boost-${L}`, level: L, kind: "option", count: 1, label: `+2 against one favored enemy (level ${L})`, options, key: `ranger:favored-enemy-boost-${L}`, cls, cite: "Classes II, Ranger, Favored Enemy" });
    }
  }

  // ---- Cleric domains (Spell List I, Cleric Domains) ----
  const domains = chosenDomains(c);
  const clericLevel = classLevels.cleric || 0;
  for (const dm of domains) {
    for (const r of dm.resources || []) {
      const max = r.uses === "3+cha" ? (mod.cha === null ? null : Math.max(0, 3 + mod.cha)) : r.uses === "level" ? clericLevel : r.uses;
      if (!max) continue;
      const key = `domain:${r.id}`;
      resources.push({ id: r.id, name: r.name, per: "day", key, cls: classById("cleric"), max, used: c.used[key] || 0, cite: dm.cite });
    }
  }
  if (domains.some((dm) => dm.weaponChoice)) {
    const cleric = classById("cleric");
    choices.push({ id: "war-weapon", level: 1, kind: "weapon", count: 1, label: "War domain: your deity's favored weapon", key: "cleric:war-weapon", cls: cleric, cite: "Spell List I, War Domain" });
  }
  const domainLines = domains.map((dm) => ({ domain: dm, line: domainNumbers(dm, clericLevel) }));

  // ---- Favored enemies and their bonuses ----
  const favoredEnemies = [];
  if (classLevels.ranger) {
    const bonus = {};
    for (const id of favoredEnemyPicks(c, classLevels.ranger)) bonus[id] = 2;
    for (const L of [5, 10, 15, 20]) {
      if (classLevels.ranger < L) continue;
      const t = (c.choices[`ranger:favored-enemy-boost-${L}`] || [])[0];
      if (t && t in bonus) bonus[t] += 2;
    }
    for (const [id, b] of Object.entries(bonus)) favoredEnemies.push({ id, name: favoredEnemyName(id), bonus: b });
  }
  const fighting = favoredEnemies.find((f) => f.id === c.active?.favoredEnemy) || null;

  // ---- Class abilities worked out as numbers ----
  const abilities = classAbilities({ c, classLevels, mod, ranks, level, has, rage, barbarian });

  // ---- Spellcasting, one block per casting class (Classes I and II; Basics, Table: Ability Modifiers and Bonus Spells) ----
  const casting = [];
  for (const cls of classes) {
    const sp = cls.spells;
    if (!sp) continue;
    const n = classLevels[cls.id];
    const row = sp.perDay[n - 1] || [];
    if (row.every((x) => x === null)) continue; // e.g. a paladin or ranger below 4th level
    const score = scores[sp.ability];
    const m = modOf(score);
    const casterLevel = sp.casterLevel === "half" ? Math.floor(n / 2) : n;
    const levels = row.map((base, L) => {
      if (base === null) return null;
      const canCast = score === null || score >= minScoreToCast(L);
      const bonus = m === null ? 0 : bonusSpells(m, L);
      const extra = extraSlots(cls, c, L);
      return { level: L, base, bonus, extra, total: canCast ? base + bonus + extra : 0, canCast,
        known: sp.known ? (sp.known[n - 1]?.[L] ?? null) : null, dc: m === null ? null : 10 + L + m };
    });
    const notes = [...(sp.notes || [])];
    if (cls.id === "cleric") for (const dm of domains) if (dm.casterLevelBonus) notes.push(`${dm.name} domain: ${dm.casterLevelBonus} spells at caster level ${casterLevel + 1}.`);
    // Equipment, Arcane Spell Failure; Classes I, Bard: no failure for bard spells in light armor (shields still count).
    let failure = 0;
    if (sp.kind === "arcane") failure = cls.id === "bard" && (!armor || armor.kind === "light") ? (shield?.asf || 0) : asf;
    casting.push({ cls, n, ability: sp.ability, mod: m, casterLevel, levels, prepares: sp.prepares, kind: sp.kind, notes, cite: sp.cite, failure,
      used: c.slotsUsed[cls.id] || Array(10).fill(0) });
  }

  return {
    race, size, sz, level, classLevels, classes, scores, scoresKnown, mod, abilitySteps,
    bab, attackSeq, baseSaves, saves, initiative, initParts, grapple, speed, speedParts,
    armor, shield, armorProf, armorProficient, shieldProficient, maxDex, acp, asf, ac, acParts, touch, flatFooted,
    hpKnown, hpMax, hpCurrent, hpParts,
    slots, feats, has, ranks, overMax, points, spent, skills, situational,
    autoLanguages, bonusLanguageCount, bonusLanguagePool, speakLanguageRanks,
    weaponProf, attacks, unarmed, flurry, sneakAttack,
    features, choices, resources, casting, domains, domainLines, favoredEnemies, fighting, abilities, rage, courage,
    carrying, carried, load,
    darkvision: race?.darkvision || 0, lowLight: Boolean(race?.lowLight),
  };
}

/** USES from a class resource (see the class file format): byLevel, classLevel, base + ability, ability × level. */
export function resourceMax(uses, n, mod) {
  if (!uses) return null;
  if (Array.isArray(uses.byLevel)) return uses.byLevel[n - 1] ?? 0;
  if (uses.classLevel) return n;
  if (uses.timesClassLevel) return mod[uses.ability] === null ? null : Math.max(0, mod[uses.ability]) * n;
  if (uses.ability) return mod[uses.ability] === null ? null : Math.max(0, (uses.base || 0) + mod[uses.ability]);
  return null;
}

/**
 * Slots beyond the table and ability bonus: a cleric's domain slot at each spell level 1–9 (Classes I, Cleric), and a
 * specialist wizard's extra slot per spell level (Classes II, Wizard), when the class file's notes say so.
 */
function extraSlots(cls, c, L) {
  if (cls.id === "cleric" && L >= 1) return 1;
  if (cls.id === "wizard" && (c.choices["wizard:specialization"] || [])[0]) return 1;
  return 0;
}

/** Armor kinds the character is trained with: "light", "medium", "heavy", "shield", "tower". */
function armorProficiencies(classes, feats) {
  const out = new Set();
  for (const cls of classes) {
    for (const k of cls.proficiencies?.armor || []) out.add(k);
    if (cls.proficiencies?.shields === "all") { out.add("shield"); out.add("tower"); }
    if (cls.proficiencies?.shields === "no-tower") out.add("shield");
  }
  for (const f of feats) for (const e of f.feat.effects || []) {
    if (e.kind !== "proficiency") continue;
    if (e.armor) out.add(e.armor);
    if (e.shield) out.add(e.shield);
  }
  return out;
}

/** Weapon ids the character is proficient with (classes, race, feats). */
function weaponProficiencies(classes, feats, race) {
  // Imported lazily to keep the dependency one-way.
  const out = new Set(["unarmed-strike"]);
  const all = weaponList();
  let simple = false, martial = false;
  for (const cls of classes) {
    if (cls.proficiencies?.simple) simple = true;
    if (cls.proficiencies?.martial) martial = true;
    for (const w of cls.proficiencies?.weapons || []) out.add(w);
  }
  for (const f of feats) for (const e of f.feat.effects || []) {
    if (e.kind !== "proficiency" || !e.weapons) continue;
    if (e.weapons === "simple") simple = true;
    else if (f.detail) out.add(f.detail);
  }
  for (const w of race?.bonusWeapons || []) out.add(w);
  // Races, Dwarves/Gnomes "Weapon Familiarity": treat these exotic weapons as martial.
  if (martial) for (const w of race?.weaponFamiliarity || []) out.add(w);
  for (const w of all) {
    if (simple && w.category === "simple") out.add(w.id);
    if (martial && w.category === "martial") out.add(w.id);
  }
  return out;
}
import { WEAPONS } from "./data/equipment.js";
const weaponList = () => WEAPONS;

export const ALL_CLASSES = CLASSES;

// ---------- favored enemies ----------

import { CLASSES as ALL } from "./data/classes.js";
const FE_CHOICES = () => ALL.find((x) => x.id === "ranger")?.choices.filter((ch) => /^favored-enemy-\d+$/.test(ch.id)) || [];
/** Favored enemies chosen at ranger levels up to n. */
export const favoredEnemyPicks = (c, n) => FE_CHOICES().filter((ch) => ch.level <= n).map((ch) => (c.choices[`ranger:${ch.id}`] || [])[0]).filter(Boolean);
export const favoredEnemyName = (id) => FE_CHOICES()[0]?.options.find((o) => o.id === id)?.name ?? id;

// ---------- domain numbers ----------

/** The computed line for a domain power with a number in it (Spell List I, each domain's Granted Power). */
function domainNumbers(dm, clericLevel) {
  switch (dm.numbers) {
    case "death": return `Death touch: ${clericLevel}d6 against the creature's current hit points.`;
    case "destruction": return `Smite: +4 on the attack roll, +${clericLevel} damage.`;
    case "protection": return `Protective ward: +${clericLevel} resistance bonus on the target's next saving throw.`;
    case "strength": return `Feat of strength: +${clericLevel} enhancement bonus to Strength for 1 round.`;
    case "magic": return `Uses scrolls, wands and similar items as a ${Math.max(1, Math.floor(clericLevel / 2))}th-level wizard.`;
    default: return "";
  }
}

// ---------- class abilities as numbers ----------

/**
 * Numbers the class text gives a formula for, shown in one list (each cites its rule):
 * turning, bardic knowledge, wild empathy, lay on hands, smite evil, stunning fist, inspire courage, rage, trap sense.
 */
function classAbilities({ c, classLevels, mod, ranks, level, has, rage, barbarian }) {
  const out = [];
  const sg = (n) => (n >= 0 ? `+${n}` : `−${-n}`);
  const cha = mod.cha ?? 0;
  const cl = classLevels;
  // Classes II, Multiclass Characters: "her effective turning level is her cleric level plus her paladin level minus 3".
  const turnLevel = (cl.cleric || 0) + ((cl.paladin || 0) >= 4 ? cl.paladin - 3 : 0);
  if (turnLevel > 0 && mod.cha !== null) {
    const syn = ranks["knowledge-religion"] >= 5 ? 2 : 0; // Skills II, Knowledge (religion) synergy
    out.push({ name: "Turning", value: `check 1d20${sg(cha + syn)} · damage 2d6${sg(turnLevel + cha)} · turning level ${turnLevel}`, cite: "Combat II, Turn or Rebuke Undead; Table: Turning Undead" });
  }
  if (cl.bard && mod.int !== null) {
    const syn = ranks["knowledge-history"] >= 5 ? 2 : 0;
    out.push({ name: "Bardic knowledge", value: `1d20${sg(cl.bard + mod.int + syn)}`, cite: "Classes I, Bard, Bardic Knowledge" });
  }
  if (cl.bard) {
    const n = cl.bard >= 20 ? 4 : cl.bard >= 14 ? 3 : cl.bard >= 8 ? 2 : 1;
    out.push({ name: "Inspire courage", value: `allies get +${n} morale on attack and weapon damage rolls and on saves against charm and fear (needs 3 ranks in a Perform skill)`, cite: "Classes I, Bard, Inspire Courage" });
  }
  if (mod.cha !== null) {
    const syn = ranks["handle-animal"] >= 5 ? 2 : 0; // Skills I, Handle Animal synergy on wild empathy
    if (cl.druid) out.push({ name: "Wild empathy (druid)", value: `1d20${sg(cl.druid + cha + syn)}`, cite: "Classes I, Druid, Wild Empathy" });
    if (cl.ranger) out.push({ name: "Wild empathy (ranger)", value: `1d20${sg(cl.ranger + Math.max(0, cha) + syn)}`, cite: "Classes II, Ranger, Wild Empathy" });
  }
  if (cl.paladin && mod.cha !== null) {
    out.push({ name: "Smite evil", value: `+${Math.max(0, cha)} on the attack roll, +${cl.paladin} damage`, cite: "Classes II, Paladin, Smite Evil" });
    if (cl.paladin >= 2) out.push({ name: "Lay on hands", value: `${Math.max(0, cha) * cl.paladin} hit points a day`, cite: "Classes II, Paladin, Lay on Hands" });
  }
  if (has("stunning-fist") && mod.wis !== null) {
    // Feats, Stunning Fist: once per day per four levels; a monk uses it once per monk level plus one per four other levels.
    const other = level - (cl.monk || 0);
    const uses = cl.monk ? cl.monk + Math.floor(other / 4) : Math.floor(level / 4);
    out.push({ name: "Stunning fist", value: `Fortitude DC ${10 + Math.floor(level / 2) + mod.wis}, ${uses} a day`, cite: "Feats, Stunning Fist" });
  }
  if (barbarian) {
    const r = barbarian >= 20 ? [8, 4] : barbarian >= 11 ? [6, 3] : [4, 2];
    out.push({ name: rage ? "Raging" : "Rage", value: `+${r[0]} Strength and Constitution, +${r[1]} on Will saves, −2 AC${rage ? " (applied now)" : ""}`, cite: "Classes I, Barbarian, Rage" });
  }
  // Trap sense: +1 at 3rd level and every three levels; barbarian and rogue bonuses stack.
  const trap = Math.floor((cl.barbarian || 0) / 3) + Math.floor((cl.rogue || 0) / 3);
  if (trap) out.push({ name: "Trap sense", value: `+${trap} on Reflex saves and dodge bonus to AC against traps`, cite: "Classes I, Barbarian / Classes II, Rogue, Trap Sense" });
  return out;
}
