// Core numbers from the 3.5 System Reference Document (Open Game Content, OGL 1.0a).
// Cites name the SRD file and section, e.g. "Basics, Ability Modifiers" (the SRD has no page numbers).
// Plain data and small formulas only.

export const ABILITIES = [
  { id: "str", name: "Strength", short: "STR" },
  { id: "dex", name: "Dexterity", short: "DEX" },
  { id: "con", name: "Constitution", short: "CON" },
  { id: "int", name: "Intelligence", short: "INT" },
  { id: "wis", name: "Wisdom", short: "WIS" },
  { id: "cha", name: "Charisma", short: "CHA" },
];
export const ABILITY_IDS = ABILITIES.map((a) => a.id);
export const abilityName = (id) => ABILITIES.find((a) => a.id === id)?.name ?? id;

// Basics, Table: Ability Modifiers and Bonus Spells: 10–11 → 0, 12–13 → +1, 8–9 → −1, …
export const abilityModifier = (score) => Math.floor((score - 10) / 2);

/**
 * Basics, Table: Ability Modifiers and Bonus Spells. Bonus spells of a spell level (1–9) for an
 * ability modifier: none below that level, then one more for every 4 points of modifier above it
 * (+1 → one 1st; +5 → two 1st, one each 2nd–5th; +9 → three 1st …). Checked row by row in the tests.
 * No bonus 0-level spells (the table's 0 column is "—").
 */
export const bonusSpells = (mod, spellLevel) => (spellLevel < 1 || mod < spellLevel ? 0 : Math.floor((mod - spellLevel) / 4) + 1);
// Basics, Abilities and Spellcasters: "The minimum … score needed to cast a … spell is 10 + the spell's level."
export const minScoreToCast = (spellLevel) => 10 + spellLevel;

// Skills I and II: each skill's key ability, "trained only", and "armor check penalty" (Swim takes it double).
// Knowledge lists ten "typical fields of study" (Skills II, Knowledge); each is its own skill.
// Craft, Perform and Profession are open-ended: the sheet gives two named lines of each (`sub`).
export const SKILLS = [
  { id: "appraise", name: "Appraise", ability: "int" },
  { id: "balance", name: "Balance", ability: "dex", acp: 1 },
  { id: "bluff", name: "Bluff", ability: "cha" },
  { id: "climb", name: "Climb", ability: "str", acp: 1 },
  { id: "concentration", name: "Concentration", ability: "con" },
  { id: "craft-1", name: "Craft", ability: "int", sub: "craft" },
  { id: "craft-2", name: "Craft", ability: "int", sub: "craft" },
  { id: "decipher-script", name: "Decipher Script", ability: "int", trained: true },
  { id: "diplomacy", name: "Diplomacy", ability: "cha" },
  { id: "disable-device", name: "Disable Device", ability: "int", trained: true },
  { id: "disguise", name: "Disguise", ability: "cha" },
  { id: "escape-artist", name: "Escape Artist", ability: "dex", acp: 1 },
  { id: "forgery", name: "Forgery", ability: "int" },
  { id: "gather-information", name: "Gather Information", ability: "cha" },
  { id: "handle-animal", name: "Handle Animal", ability: "cha", trained: true },
  { id: "heal", name: "Heal", ability: "wis" },
  { id: "hide", name: "Hide", ability: "dex", acp: 1 },
  { id: "intimidate", name: "Intimidate", ability: "cha" },
  { id: "jump", name: "Jump", ability: "str", acp: 1 },
  { id: "knowledge-arcana", name: "Knowledge (arcana)", ability: "int", trained: true, group: "knowledge" },
  { id: "knowledge-architecture", name: "Knowledge (architecture and engineering)", ability: "int", trained: true, group: "knowledge" },
  { id: "knowledge-dungeoneering", name: "Knowledge (dungeoneering)", ability: "int", trained: true, group: "knowledge" },
  { id: "knowledge-geography", name: "Knowledge (geography)", ability: "int", trained: true, group: "knowledge" },
  { id: "knowledge-history", name: "Knowledge (history)", ability: "int", trained: true, group: "knowledge" },
  { id: "knowledge-local", name: "Knowledge (local)", ability: "int", trained: true, group: "knowledge" },
  { id: "knowledge-nature", name: "Knowledge (nature)", ability: "int", trained: true, group: "knowledge" },
  { id: "knowledge-nobility", name: "Knowledge (nobility and royalty)", ability: "int", trained: true, group: "knowledge" },
  { id: "knowledge-religion", name: "Knowledge (religion)", ability: "int", trained: true, group: "knowledge" },
  { id: "knowledge-planes", name: "Knowledge (the planes)", ability: "int", trained: true, group: "knowledge" },
  { id: "listen", name: "Listen", ability: "wis" },
  { id: "move-silently", name: "Move Silently", ability: "dex", acp: 1 },
  { id: "open-lock", name: "Open Lock", ability: "dex", trained: true },
  { id: "perform-1", name: "Perform", ability: "cha", sub: "perform" },
  { id: "perform-2", name: "Perform", ability: "cha", sub: "perform" },
  { id: "profession-1", name: "Profession", ability: "wis", trained: true, sub: "profession" },
  { id: "profession-2", name: "Profession", ability: "wis", trained: true, sub: "profession" },
  { id: "ride", name: "Ride", ability: "dex" },
  { id: "search", name: "Search", ability: "int" },
  { id: "sense-motive", name: "Sense Motive", ability: "wis" },
  { id: "sleight-of-hand", name: "Sleight of Hand", ability: "dex", trained: true, acp: 1 },
  { id: "speak-language", name: "Speak Language", ability: null, trained: true },
  { id: "spellcraft", name: "Spellcraft", ability: "int", trained: true },
  { id: "spot", name: "Spot", ability: "wis" },
  { id: "survival", name: "Survival", ability: "wis" },
  { id: "swim", name: "Swim", ability: "str", acp: 2 }, // Skills II, Swim, Special: "double the normal armor check penalty"
  { id: "tumble", name: "Tumble", ability: "dex", trained: true, acp: 1 },
  { id: "use-magic-device", name: "Use Magic Device", ability: "cha", trained: true },
  { id: "use-rope", name: "Use Rope", ability: "dex" },
];
export const SKILL_IDS = SKILLS.map((s) => s.id);
export const skillById = (id) => SKILLS.find((s) => s.id === id);

/**
 * Class skill lists name skills the SRD way; these expand the group names to the sheet's skill ids.
 * "craft" → every Craft line, "knowledge" → all ten fields ("Knowledge (all skills, taken individually)").
 */
export function expandSkills(list) {
  const out = [];
  for (const s of list) {
    if (s === "craft" || s === "perform" || s === "profession") out.push(...SKILLS.filter((x) => x.sub === s).map((x) => x.id));
    else if (s === "knowledge") out.push(...SKILLS.filter((x) => x.group === "knowledge").map((x) => x.id));
    else out.push(s);
  }
  return [...new Set(out)];
}

/**
 * Skill synergies that always apply (Skills I and II, each skill's "Synergy" line): 5 or more ranks in
 * `from` gives +2 on `to`. Synergies that apply only in some situations are listed in SITUATIONAL_SYNERGIES
 * and shown as notes, never added to the total.
 */
export const SYNERGIES = [
  { from: "bluff", to: "diplomacy", cite: "Skills I, Bluff" },
  { from: "bluff", to: "intimidate", cite: "Skills I, Bluff" },
  { from: "bluff", to: "sleight-of-hand", cite: "Skills I, Bluff" },
  { from: "handle-animal", to: "ride", cite: "Skills I, Handle Animal" },
  { from: "jump", to: "tumble", cite: "Skills II, Jump" },
  { from: "knowledge-arcana", to: "spellcraft", cite: "Skills II, Knowledge" },
  { from: "knowledge-local", to: "gather-information", cite: "Skills II, Knowledge" },
  { from: "knowledge-nobility", to: "diplomacy", cite: "Skills II, Knowledge" },
  { from: "sense-motive", to: "diplomacy", cite: "Skills II, Sense Motive" },
  { from: "survival", to: "knowledge-nature", cite: "Skills II, Survival" },
  { from: "tumble", to: "balance", cite: "Skills II, Tumble" },
  { from: "tumble", to: "jump", cite: "Skills II, Tumble" },
];
export const SITUATIONAL_SYNERGIES = [
  { from: "bluff", text: "+2 on Disguise checks to act in character while observed", cite: "Skills I, Bluff" },
  { from: "craft", text: "+2 on Appraise checks for items made with that Craft skill", cite: "Skills I, Appraise" },
  { from: "decipher-script", text: "+2 on Use Magic Device checks involving scrolls", cite: "Skills I, Decipher Script" },
  { from: "escape-artist", text: "+2 on Use Rope checks to bind someone", cite: "Skills I, Escape Artist" },
  { from: "handle-animal", text: "+2 on wild empathy checks", cite: "Skills I, Handle Animal" },
  { from: "knowledge-architecture", text: "+2 on Search checks for secret doors or hidden compartments", cite: "Skills II, Knowledge" },
  { from: "knowledge-dungeoneering", text: "+2 on Survival checks underground", cite: "Skills II, Knowledge" },
  { from: "knowledge-geography", text: "+2 on Survival checks to avoid getting lost or natural hazards", cite: "Skills II, Knowledge" },
  { from: "knowledge-history", text: "+2 on bardic knowledge checks", cite: "Skills II, Knowledge" },
  { from: "knowledge-nature", text: "+2 on Survival checks in aboveground natural environments", cite: "Skills II, Knowledge" },
  { from: "knowledge-planes", text: "+2 on Survival checks on other planes", cite: "Skills II, Knowledge" },
  { from: "knowledge-religion", text: "+2 on turning checks against undead", cite: "Skills II, Knowledge" },
  { from: "search", text: "+2 on Survival checks to find or follow tracks", cite: "Skills II, Search" },
  { from: "spellcraft", text: "+2 on Use Magic Device checks related to scrolls", cite: "Skills II, Spellcraft" },
  { from: "use-rope", text: "+2 on Climb checks with a rope", cite: "Skills II, Use Rope" },
];

// Skills I, Skills Summary: class skill max ranks = character level + 3; cross-class = half (not rounded).
export const maxClassRanks = (characterLevel) => characterLevel + 3;
export const maxCrossClassRanks = (characterLevel) => (characterLevel + 3) / 2;

// Base attack and base saves. Every class table in Classes I and II follows one of these patterns;
// the tests check each class file's own transcribed table against them, row by row.
export const BAB = {
  good: (lv) => lv,                       // fighter, barbarian, paladin, ranger
  average: (lv) => Math.floor((3 * lv) / 4), // bard, cleric, druid, monk, rogue
  poor: (lv) => Math.floor(lv / 2),       // sorcerer, wizard
};
export const SAVE = {
  good: (lv) => 2 + Math.floor(lv / 2),
  poor: (lv) => Math.floor(lv / 3),
};
// Combat I, Attack Bonus / Classes II, Multiclass Characters: "+6 or higher provides … multiple attacks":
// one more attack at −5 for every 5 points of base attack bonus above 0, up to four at +16.
export const iterativeAttacks = (bab) => {
  const out = [bab];
  for (let next = bab - 5; next > 0 && out.length < 4; next -= 5) out.push(next);
  return out;
};

// Owner rulings (2026-11-22), resting on the SRD lines quoted:
//  - Epic Level Basics: "Every character gains one feat … at every level divisible by three" and
//    "Upon gaining any level divisible by four, a character increases one of his or her ability scores by 1 point."
//  - Races, Human: "1 extra feat at 1st level" implies the ordinary 1st-level feat; the owner ruled it in.
export const featLevel = (characterLevel) => characterLevel === 1 || characterLevel % 3 === 0;
export const abilityIncreaseLevel = (characterLevel) => characterLevel % 4 === 0;
// Owner ruling (2026-11-22): Hit Points are the Hit Die's maximum at character level 1, rolled after.
// Basics, Constitution: the Constitution modifier applies to each Hit Die, "a character always gains at least
// 1 hit point each time he or she advances in level".
export const MAX_LEVEL = 20;

// Description, alignment: the nine alignments.
export const ALIGNMENTS = ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "Neutral",
  "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"];

// Combat I, Table: Size Modifiers (Small and Medium are the only sizes of the SRD's player races).
// Attack and AC +1 for Small; grapple −4 (Combat II, Grapple); Hide +4 (Skills II, Hide).
export const SIZES = {
  Medium: { attack: 0, ac: 0, grapple: 0, hide: 0 },
  Small: { attack: 1, ac: 1, grapple: -4, hide: 4 },
};

// Carrying and Exploration, Table: Carrying Capacity (Medium; Small is ×3/4, "Bigger and Smaller Creatures"), light / medium / heavy load maxima in lb, STR 1–29.
export const CARRYING = [
  null, [3, 6, 10], [6, 13, 20], [10, 20, 30], [13, 26, 40], [16, 33, 50], [20, 40, 60], [23, 46, 70], [26, 53, 80], [30, 60, 90],
  [33, 66, 100], [38, 76, 115], [43, 86, 130], [50, 100, 150], [58, 116, 175], [66, 133, 200], [76, 153, 230], [86, 173, 260],
  [100, 200, 300], [116, 233, 350], [133, 266, 400], [153, 306, 460], [173, 346, 520], [200, 400, 600], [233, 466, 700],
  [266, 533, 800], [306, 613, 920], [346, 693, 1040], [400, 800, 1200], [466, 933, 1400],
];
/** Light/medium/heavy load in lb for a Strength score (above 29: "Tremendous Strength", the 20–29 row with the same ones digit, ×4 per ten points). */
export function carryingCapacity(str, size = "Medium") {
  if (!Number.isInteger(str) || str < 1) return null;
  let s = str, mult = 1;
  while (s > 29) { s -= 10; mult *= 4; }
  const k = size === "Small" ? 0.75 : 1;
  return CARRYING[s].map((n) => Math.floor(n * mult * k));
}
