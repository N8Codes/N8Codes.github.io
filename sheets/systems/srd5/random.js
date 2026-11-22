// "Roll random character". Ruling (2026-11-21): every pick is equally likely.
// The SRD has no roll table for class, species or background, so each is picked from the SRD's
// own lists with equal chance. Ability scores use the SRD's method (4d6, keep the highest three, p.21),
// placed on the abilities at random. Languages use the Standard Languages table (1d12, p.20), rerolling
// repeats. The result passes the same validate() as a hand-built character.

import { ABILITY_IDS, SKILL_IDS, STANDARD_LANGUAGES, RARE_LANGUAGES, ASI_CAP, EPIC_BOON_CAP } from "./data/rules.js";
import { CLASSES } from "./data/classes.js";
import { SPECIES } from "./data/species.js";
import { BACKGROUNDS } from "./data/backgrounds.js";
import { FEATS } from "./data/feats.js";
import { WEAPONS, ARMOR } from "./data/equipment.js";
import { rollDie, roll4d6KeepHighest3, pick, pickN, shuffle } from "../../core/dice.js";
import { defaultCharacter } from "./model.js";
import { derive, activeChoices, featSlots, toolOptions, masteryOptions, skillPool } from "./derive.js";

/** Roll a new character at the given level, keeping the name, player and notes passed in. */
export function randomCharacter(keep = {}) {
  const c = defaultCharacter();
  Object.assign(c, { name: keep.name ?? "", player: keep.player ?? "", notes: keep.notes ?? c.notes, level: keep.level ?? 1, alignment: keep.alignment ?? "" });
  const cls = pick(CLASSES), sp = pick(SPECIES), bg = pick(BACKGROUNDS);
  c.classId = cls.id; c.speciesId = sp.id; c.backgroundId = bg.id;
  c.size = pick(sp.sizes);
  if (cls.subclass && c.level >= cls.subclassLevel) c.subclassId = cls.subclass.id;

  // Scores: six rolls of 4d6 keep 3, each placed on an ability at random.
  c.abilityMethod = "roll";
  c.rolls = Array.from({ length: 6 }, roll4d6KeepHighest3);
  const order = shuffle(ABILITY_IDS);
  order.forEach((a, i) => { c.baseScores[a] = c.rolls[i]; });
  // Background increase: +2/+1 or +1/+1/+1, picked with equal chance, on the background's abilities.
  if (Math.random() < 0.5) { const [two, one] = pickN(bg.abilities, 2); c.backgroundBonus[two] = 2; c.backgroundBonus[one] = 1; }
  else bg.abilities.forEach((a) => { c.backgroundBonus[a] = 1; });

  // Languages: two rolls on the Standard Languages table, rerolling repeats.
  while (c.languages.length < 2) {
    const roll = rollDie(12);
    const lang = STANDARD_LANGUAGES.find((l) => l.roll.includes(roll));
    if (!c.languages.includes(lang.id)) c.languages.push(lang.id);
  }

  // Choices appear as others are made (a species option, a subclass), so fill until nothing changes.
  for (let pass = 0; pass < 4; pass++) {
    for (const ch of activeChoices(c)) {
      if (ch.kind === "feat" || ch.kind === "text" || (c.choices[ch.key] || []).length) continue;
      const pool = choicePool(ch, c, derive(c)); // fresh each time: earlier picks change what's proficient
      if (pool.length) c.choices[ch.key] = pickN(pool, Math.min(ch.count, pool.length));
    }
    for (const slot of featSlots(c)) if (!c.feats[slot.key]) c.feats[slot.key] = randomFeat(slot, c);
  }

  applyEquipment(c, pick(cls.startingEquipment).option, pick(bg.equipment).option);
  return c;
}

function choicePool(ch, c, d) {
  const proficient = SKILL_IDS.filter((s) => d.skills[s].proficient);
  switch (ch.kind) {
    case "skill-proficiency": {
      const from = skillPool(ch, d.cls);
      const fresh = from.filter((s) => !proficient.includes(s));
      return fresh.length >= ch.count ? fresh : from;
    }
    case "skill-expertise": {
      const taken = d.choices.filter((x) => x.kind === "skill-expertise").flatMap((x) => c.choices[x.key] || []);
      return proficient.filter((s) => !taken.includes(s) && (!Array.isArray(ch.from) || ch.from.includes(s)));
    }
    case "option": return (ch.options || []).map((o) => o.id);
    case "ability": return ch.options;
    case "tool": return toolOptions(ch.from);
    case "weapon-mastery": return masteryOptions(ch, d).map((w) => w.id);
    case "language": {
      const known = d.languages;
      return [...STANDARD_LANGUAGES.map((l) => l.name), ...RARE_LANGUAGES].filter((l) => !known.includes(l));
    }
    default: return [];
  }
}

function randomFeat(slot, c) {
  const d = derive(c);
  const f = { id: "", increase: {}, picks: [], ability: "", text: "" };
  // A feat can be taken only once unless it's Repeatable (p.87).
  const taken = new Set(featSlots(c).map((s) => s.fixed || c.feats[s.key]?.id).filter(Boolean));
  const open = (x) => x.repeatable || !taken.has(x.id);
  let feat;
  if (slot.fixed) feat = FEATS.find((x) => x.id === slot.fixed);
  else if (slot.category) feat = pick(FEATS.filter((x) => x.category === slot.category && open(x)));
  else if (slot.defaultCategory === "epic-boon") feat = pick(FEATS.filter((x) => x.category === "epic-boon" && open(x) && (!x.prerequisite?.spellcasting || d.cls?.spellcasting)));
  else feat = FEATS.find((x) => x.id === "ability-score-improvement");
  if (!slot.fixed) f.id = feat.id;
  const inc = feat.choices?.find((x) => x.kind === "ability-increase");
  if (inc) {
    const cap = inc.cap ?? ASI_CAP;
    const room = (a) => cap - (d.scores[a] ?? 0);
    const from = (inc.from || ABILITY_IDS);
    const pattern = pick(inc.patterns.filter((p) => from.filter((a) => room(a) >= p[0]).length >= p.length));
    if (pattern) pickN(from.filter((a) => room(a) >= pattern[0]), pattern.length).forEach((a, i) => { f.increase[a] = pattern[i]; });
  }
  if (feat.id === "skilled") {
    const fresh = SKILL_IDS.filter((s) => !d.skills[s].proficient);
    f.picks = pickN(fresh, 3).map((s) => `skill:${s}`);
  }
  if (feat.id === "magic-initiate") {
    f.ability = pick(["int", "wis", "cha"]);
    // A different list each time (p.87): skip any list already taken.
    if (!slot.variant) {
      const used = featSlots(c).filter((s) => (s.fixed || c.feats[s.key]?.id) === "magic-initiate").map((s) => s.variant || c.feats[s.key]?.list).filter(Boolean);
      f.list = pick(["Cleric", "Druid", "Wizard"].filter((l) => !used.includes(l)));
    }
  }
  return f;
}

/**
 * Starting equipment (class p.28–82 "Starting Equipment"; background p.83): replace the inventory and coins
 * with the chosen packages, wear the first armor, take up a Shield, and list the weapons as attacks.
 */
export function applyEquipment(c, classOption, backgroundOption) {
  const cls = CLASSES.find((x) => x.id === c.classId);
  const bg = BACKGROUNDS.find((x) => x.id === c.backgroundId);
  c.equipment = { classOption: classOption || "", backgroundOption: backgroundOption || "" };
  const packs = [cls?.startingEquipment.find((p) => p.option === classOption), bg?.equipment.find((p) => p.option === backgroundOption)].filter(Boolean);
  c.inventory = packs.flatMap((p) => p.items.map((it) => ({ name: it.name, qty: it.qty })));
  c.coins = { cp: 0, sp: 0, ep: 0, gp: packs.reduce((s, p) => s + p.gp, 0), pp: 0 };
  const names = c.inventory.map((it) => it.name.toLowerCase());
  const armor = ARMOR.find((a) => names.includes(a.name.toLowerCase()));
  c.armorId = armor ? armor.id : "";
  c.shield = names.includes("shield");
  const weapons = WEAPONS.filter((w) => names.some((n) => n === w.name.toLowerCase() || n === `${w.name.toLowerCase()}s`));
  c.attacks = weapons.map((w) => ({ weaponId: w.id }));
  return c;
}

export { EPIC_BOON_CAP };
