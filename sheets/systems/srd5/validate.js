// validate(character, derived) → [{ field, message, severity }]
//   severity "error": breaks a rule. The sheet refuses the edit that causes it (unless Free edit is on)
//                     and shows it in red next to the field (amber with Free edit).
//   severity "todo":  a choice still to make. Shown quietly; never blocks anything.
// Every rule cites SRD 5.2.1 printed pages.

import { ABILITY_IDS, SKILL_IDS, SKILLS, POINT_COSTS, POINT_BUY_BUDGET, STANDARD_ARRAY, ALIGNMENTS,
  STANDARD_LANGUAGES, RARE_LANGUAGES, LANGUAGE_CHOICES, BACKGROUND_INCREASE_CAP, XP_FOR_LEVEL } from "./data/rules.js";
import { FEATS, featById } from "./data/feats.js";
import { WEAPONS, ARMOR } from "./data/equipment.js";
import { classById } from "./data/classes.js";
import { abilityName, toolOptions, masteryOptions, skillPool } from "./derive.js";

const skillName = (id) => SKILLS.find((s) => s.id === id)?.name ?? id;
const sameMultiset = (a, b) => a.length === b.length && [...a].sort((x, y) => x - y).every((v, i) => v === [...b].sort((x, y) => x - y)[i]);

export function validate(c, d) {
  const out = [];
  const err = (field, message) => out.push({ field, message, severity: "error" });
  const todo = (field, message) => out.push({ field, message, severity: "todo" });

  // ---- Basics ----
  if (!d.cls) todo("classId", "Choose a class.");
  if (!d.bg) todo("backgroundId", "Choose a background.");
  if (!d.sp) todo("speciesId", "Choose a species.");
  if (c.alignment && !ALIGNMENTS.includes(c.alignment)) err("alignment", "Pick one of the nine alignments (p.21).");
  if (d.sp && c.size && !d.sp.sizes.includes(c.size)) err("size", `${d.sp.name} can be ${d.sp.sizes.join(" or ")} only (p.${d.sp.cite.replace(/^p\./, "")}).`);
  if (d.sp && d.sp.sizes.length > 1 && !c.size) todo("size", `Choose ${d.sp.sizes.join(" or ")} for your ${d.sp.name}.`);
  // Level Advancement, p.23: XP reaches a level; levels go 1 to 20.
  if (!Number.isInteger(c.level) || c.level < 1 || c.level > 20) err("level", "Level goes from 1 to 20 (p.23).");
  else if (c.xp < XP_FOR_LEVEL[c.level - 1] && c.xp > 0) todo("xp", `Level ${c.level} usually starts at ${XP_FOR_LEVEL[c.level - 1].toLocaleString("en")} XP (p.23).`);
  if (d.cls?.subclass && c.subclassId && c.level < d.cls.subclassLevel) err("subclassId", `A ${d.cls.name} chooses a subclass at level ${d.cls.subclassLevel} (p.${d.cls.cite.replace(/^p\./, "").split("–")[0]}).`);
  if (d.cls?.subclass && !c.subclassId && c.level >= d.cls.subclassLevel) todo("subclassId", `Choose your ${d.cls.name} subclass.`);
  if (c.subclassId && d.cls?.subclass && c.subclassId !== d.cls.subclass.id) err("subclassId", `That subclass doesn't belong to the ${d.cls.name}.`);

  // ---- Ability scores (p.21) ----
  const base = ABILITY_IDS.map((a) => c.baseScores[a]);
  if (c.abilityMethod === "") todo("abilities", "Choose how to make your six ability scores.");
  if (c.abilityMethod === "point-cost") {
    for (const a of ABILITY_IDS) {
      if (!(c.baseScores[a] in POINT_COSTS)) err(`abilities.${a}`, `Point cost scores go from 8 to 15 (p.21).`);
    }
    if (d.pointsSpent > POINT_BUY_BUDGET) err("abilities", `Only ${POINT_BUY_BUDGET} points to spend; these cost ${d.pointsSpent} (p.21).`);
  } else if (c.abilityMethod === "standard") {
    if (!sameMultiset(base, STANDARD_ARRAY)) err("abilities", "The standard array is 15, 14, 13, 12, 10, 8, each used once (p.21).");
  } else if (c.abilityMethod === "roll") {
    if (c.rolls.length < 6) todo("abilities", "Roll your six scores (4d6, keep the highest three).");
    else if (!sameMultiset(base, c.rolls)) err("abilities", `Use your six rolls once each: ${c.rolls.join(", ")} (p.21).`);
  } else if (c.abilityMethod === "manual" && !c.freeEdit) {
    err("abilities", "Typing any score you like needs Free edit. The rules use the standard array, point cost, or rolling (p.21).");
  }

  // Background increase (p.21, p.83): +2 and +1 to two listed abilities, or +1 to all three; not above 20.
  if (d.bg) {
    const given = ABILITY_IDS.filter((a) => c.backgroundBonus[a] > 0);
    const stray = given.filter((a) => !d.bg.abilities.includes(a));
    if (stray.length) err("backgroundBonus", `${d.bg.name} can raise only ${d.bg.abilities.map(abilityName).join(", ")} (p.83).`);
    const amounts = given.map((a) => c.backgroundBonus[a]).sort((x, y) => y - x).join(",");
    if (amounts === "2,1" || amounts === "1,1,1") {
      for (const a of given) if (d.afterBackground[a] > BACKGROUND_INCREASE_CAP) err("backgroundBonus", `The background increase can't raise ${abilityName(a)} above 20 (p.21).`);
    } else if (["", "2", "1", "1,1"].includes(amounts)) {
      todo("backgroundBonus", `Give ${d.bg.name}'s increase: +2 and +1, or +1 to all three of ${d.bg.abilities.map(abilityName).join(", ")}.`);
    } else {
      err("backgroundBonus", "A background gives +2 to one and +1 to another, or +1 to all three (p.83).");
    }
  } else if (ABILITY_IDS.some((a) => c.backgroundBonus[a])) {
    err("backgroundBonus", "Choose a background before giving its ability increase.");
  }

  // ---- Choices (class, subclass, species, background) ----
  const allProficient = new Set(SKILL_IDS.filter((s) => d.skills[s].proficient));
  for (const ch of d.choices) {
    if (ch.kind === "feat") continue; // feat slots are checked below
    const list = c.choices[ch.key] || [];
    const field = `choice:${ch.key}`;
    const label = ch.label || ch.id.replace(/-/g, " ");
    if (new Set(list).size !== list.length) err(field, "Each pick can be chosen only once.");
    if (list.length > ch.count) err(field, `${ch.source} gives ${ch.count} here; ${list.length} are chosen. Remove one first (${ch.cite || "SRD"}).`);
    else if (list.length < ch.count && ch.kind !== "text") todo(field, `${ch.source}: choose ${ch.count - list.length} more (${label}).`);
    if (ch.kind === "skill-proficiency") {
      const allowed = skillPool(ch, d.cls);
      for (const s of list) if (!allowed.includes(s)) err(field, `${skillName(s)} isn't one of the skills ${ch.source} offers here (${ch.cite || "SRD"}).`);
    }
    if (ch.kind === "skill-expertise") {
      // Expertise (Rules Glossary): only in a skill you're proficient in, never twice in the same skill.
      for (const s of list) {
        if (!allProficient.has(s)) err(field, `Expertise needs proficiency in ${skillName(s)} first (Rules Glossary, Expertise).`);
        if (Array.isArray(ch.from) && !ch.from.includes(s)) err(field, `${skillName(s)} isn't one of the skills this feature allows (${ch.cite || "SRD"}).`);
      }
    }
    if (ch.kind === "option" && list.length && !(ch.options || []).some((o) => o.id === list[0])) err(field, "Pick one of the listed options.");
    if (ch.kind === "ability" && list.length && !ch.options.includes(list[0])) err(field, "Pick one of the listed abilities.");
    if (ch.kind === "tool") { const ok = toolOptions(ch.from); for (const t of list) if (!ok.includes(t)) err(field, `${t} isn't one of the tools offered here (${ch.cite || "SRD"}).`); }
    if (ch.kind === "weapon-mastery") {
      const ok = masteryOptions(ch, d).map((x) => x.id);
      for (const w of list) {
        if (!WEAPONS.some((x) => x.id === w)) err(field, "Pick a weapon from the Weapons table (p.91).");
        else if (!ok.includes(w)) err(field, ch.filter === "melee" ? `${d.cls.name} Weapon Mastery covers Simple or Martial Melee weapons only (${ch.cite}).` : `Weapon Mastery covers weapons you're proficient with (${ch.cite}).`);
      }
    }
    if (ch.kind === "language") for (const l of list) if (!STANDARD_LANGUAGES.some((x) => x.name === l) && !RARE_LANGUAGES.includes(l)) err(field, `${l} isn't on the language tables (p.20).`);
  }
  // Expertise can't be taken twice in one skill (Rules Glossary, Expertise).
  const expertisePicks = d.choices.filter((x) => x.kind === "skill-expertise").flatMap((x) => c.choices[x.key] || []);
  if (new Set(expertisePicks).size !== expertisePicks.length) err("expertise", "You can't have Expertise in the same skill twice (Rules Glossary, Expertise).");

  // ---- Languages (p.20): Common plus two from the Standard Languages table ----
  if (new Set(c.languages).size !== c.languages.length) err("languages", "Each language can be chosen only once.");
  for (const l of c.languages) if (!STANDARD_LANGUAGES.some((x) => x.id === l)) err("languages", "Choose from the Standard Languages table (p.20).");
  if (c.languages.length > LANGUAGE_CHOICES) err("languages", `Common plus ${LANGUAGE_CHOICES} languages at creation (p.20).`);
  else if (c.languages.length < LANGUAGE_CHOICES) todo("languages", `Choose ${LANGUAGE_CHOICES - c.languages.length} more language${LANGUAGE_CHOICES - c.languages.length > 1 ? "s" : ""}.`);

  // ---- Feats (p.87): category, prerequisites, repeatable, ability increases ----
  const taken = new Map();
  // Fighting Style feats need the Fighting Style feature (p.88): any active fighting-style choice gives it.
  const hasFightingStyle = d.choices.some((ch) => ch.kind === "feat" && ch.category === "fighting-style");
  const initiateLists = [];
  for (const slot of d.slots) {
    const f = c.feats[slot.key];
    const field = `feat:${slot.key}`;
    const featId = slot.fixed || f?.id;
    if (!featId) { todo(field, `Choose your ${slot.label}.`); continue; }
    const feat = featById(featId);
    if (!feat) { err(field, "That feat isn't in the SRD."); continue; }
    if (slot.category && feat.category !== slot.category) err(field, `This must be a ${slot.category.replace(/-/g, " ")} feat (p.87, "Category").`);
    // A slot with no category takes a feat from any category you qualify for (p.87, "Category").
    if (!slot.category && feat.category === "fighting-style" && !hasFightingStyle) err(field, "Fighting Style feats need the Fighting Style feature (p.88).");
    const pre = feat.prerequisite || {};
    if (pre.level && (slot.level ?? c.level) < pre.level) err(field, `${feat.name} needs level ${pre.level}+ (p.87).`);
    // "To take a feat, you must meet any prerequisite" (p.87): the scores when this feat was taken.
    if (pre.anyAbility && !Object.entries(pre.anyAbility).some(([a, n]) => scoreBefore(c, d, slot, a) >= n)) {
      err(field, `${feat.name} needs ${Object.entries(pre.anyAbility).map(([a, n]) => `${abilityName(a)} ${n}+`).join(" or ")} (p.87).`);
    }
    if (pre.spellcasting && !d.cls?.spellcasting) err(field, `${feat.name} needs the Spellcasting feature (p.88).`);
    if (taken.has(feat.id) && !feat.repeatable) err(field, `${feat.name} can be taken only once (p.87, "Repeatable").`);
    taken.set(feat.id, true);
    // Ability increases from the feat.
    const inc = feat.choices?.find((x) => x.kind === "ability-increase");
    const amounts = ABILITY_IDS.filter((a) => f?.increase?.[a]).map((a) => f.increase[a]).sort((x, y) => y - x);
    if (inc) {
      const fits = inc.patterns.some((p) => p.join(",") === amounts.join(","));
      if (!amounts.length) todo(field, `${feat.name}: choose which ability score to increase.`);
      else if (!fits) err(field, inc.patterns.length > 1 ? `${feat.name}: +2 to one score, or +1 to two (p.87).` : `${feat.name}: +1 to one score (p.87–88).`);
      for (const a of ABILITY_IDS) {
        if (!f?.increase?.[a]) continue;
        if (inc.from && !inc.from.includes(a)) err(field, `${feat.name} can raise only ${inc.from.map(abilityName).join(" or ")}.`);
      }
      // Cap: "can't increase an ability score above 20" (ASI, p.87), "to a maximum of 30" (Epic Boons, p.88).
      for (const a of ABILITY_IDS) if (f?.increase?.[a] && scoreBefore(c, d, slot, a) + f.increase[a] > inc.cap) err(field, `${feat.name} can't raise ${abilityName(a)} above ${inc.cap}.`);
    } else if (amounts.length) err(field, `${feat.name} doesn't increase ability scores.`);
    // Skilled (p.87): three skills or tools.
    if (feat.id === "skilled") {
      const list = f?.picks || [];
      if (list.length > 3) err(field, "Skilled gives three skills or tools (p.87).");
      else if (list.length < 3) todo(field, `Skilled: choose ${3 - list.length} more skills or tools.`);
      if (new Set(list).size !== list.length) err(field, "Each pick can be chosen only once.");
    }
    if (feat.id === "magic-initiate") {
      if (f && f.ability && !["int", "wis", "cha"].includes(f.ability)) err(field, "Magic Initiate uses Intelligence, Wisdom, or Charisma (p.87).");
      // Repeatable, "but you must choose a different spell list each time" (p.87).
      const list = slot.variant || f?.list;
      if (!list) todo(field, "Magic Initiate: choose the Cleric, Druid or Wizard spell list.");
      else if (initiateLists.includes(list)) err(field, `Magic Initiate needs a different spell list each time; ${list} is already taken (p.87).`);
      else initiateLists.push(list);
    }
  }
  for (const k of Object.keys(c.feats)) if (!d.slots.some((s) => s.key === k) && c.feats[k]?.id) todo(`feat:${k}`, "This feat slot isn't available at this level; it's ignored.");

  // ---- Hit points and trackers ----
  // Rules Glossary, Hit Points: no more than the maximum and no less than 0.
  if (c.hp.current !== null && c.hp.current > d.hpMax) err("hp.current", `Hit Points can't go above the maximum, ${d.hpMax} (Rules Glossary, Hit Points).`);
  if (c.hp.current !== null && c.hp.current < 0) err("hp.current", "Hit Points can't go below 0 (Rules Glossary, Hit Points).");
  if (c.hp.temp < 0) err("hp.temp", "Temporary Hit Points can't be negative.");
  if (c.hp.method === "rolled" && d.cls) {
    for (let lv = 2; lv <= c.level; lv++) {
      const r = c.hp.rolls[lv];
      if (r === undefined) todo("hp.rolls", `Enter your Hit Die roll for level ${lv}, or use the fixed value.`);
      else if (r < 1 || r > d.hitDie) err("hp.rolls", `A d${d.hitDie} rolls 1 to ${d.hitDie} (p.23).`);
    }
  }
  if (c.hitDiceSpent > c.level) err("hitDiceSpent", `You have ${c.level} Hit Point Dice at level ${c.level} (p.22–23).`);
  for (const r of d.resources) if ((c.used[r.id] || 0) > r.max) err(`used.${r.id}`, `${r.name} has ${r.max} uses.`);
  if (d.spellcasting) {
    c.slotsUsed.forEach((u, i) => { if (u > (d.spellcasting.slots[i] || 0)) err(`slots.${i + 1}`, `You have ${d.spellcasting.slots[i] || 0} level ${i + 1} slots.`); });
    if (d.spellcasting.pact && c.pactSlotsUsed > d.spellcasting.pact.slots) err("slots.pact", `You have ${d.spellcasting.pact.slots} Pact Magic slots.`);
    const cantrips = c.spells.filter((s) => s.name && s.level === 0).length;
    const prepared = c.spells.filter((s) => s.name && s.level > 0 && s.prepared).length;
    if (cantrips > d.spellcasting.cantrips) err("spells", `${d.cls.name} level ${c.level} knows ${d.spellcasting.cantrips} cantrips; ${cantrips} are listed (${d.spellcasting.cite}).`);
    if (prepared > d.spellcasting.prepared) err("spells", `${d.cls.name} level ${c.level} prepares ${d.spellcasting.prepared} spells; ${prepared} are marked prepared (${d.spellcasting.cite}).`);
  }

  // ---- Equipment ----
  if (c.armorId && !ARMOR.some((a) => a.id === c.armorId)) err("armorId", "Pick armor from the Armor table (p.92).");
  return out;
}

/** An ability score just before a given feat slot's own increase (for caps). */
function scoreBefore(c, d, slot, a) {
  let s = d.afterBackground[a];
  for (const other of d.slots.slice().sort((x, y) => (x.level || 0) - (y.level || 0))) {
    if (other.key === slot.key) break;
    s += c.feats[other.key]?.increase?.[a] || 0;
  }
  return s;
}

export const FEAT_LIST = FEATS;
export { classById };
