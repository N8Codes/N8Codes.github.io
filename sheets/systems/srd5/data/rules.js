// Core numbers from the System Reference Document 5.2.1 (CC-BY-4.0).
// Page numbers are the SRD's printed pages. Plain data only.

export const ABILITIES = [
  { id: "str", name: "Strength", short: "STR" },
  { id: "dex", name: "Dexterity", short: "DEX" },
  { id: "con", name: "Constitution", short: "CON" },
  { id: "int", name: "Intelligence", short: "INT" },
  { id: "wis", name: "Wisdom", short: "WIS" },
  { id: "cha", name: "Charisma", short: "CHA" },
];
export const ABILITY_IDS = ABILITIES.map((a) => a.id);

// Skills table, p.9 ("Skill" and "Ability" columns).
export const SKILLS = [
  { id: "acrobatics", name: "Acrobatics", ability: "dex" },
  { id: "animal-handling", name: "Animal Handling", ability: "wis" },
  { id: "arcana", name: "Arcana", ability: "int" },
  { id: "athletics", name: "Athletics", ability: "str" },
  { id: "deception", name: "Deception", ability: "cha" },
  { id: "history", name: "History", ability: "int" },
  { id: "insight", name: "Insight", ability: "wis" },
  { id: "intimidation", name: "Intimidation", ability: "cha" },
  { id: "investigation", name: "Investigation", ability: "int" },
  { id: "medicine", name: "Medicine", ability: "wis" },
  { id: "nature", name: "Nature", ability: "int" },
  { id: "perception", name: "Perception", ability: "wis" },
  { id: "performance", name: "Performance", ability: "cha" },
  { id: "persuasion", name: "Persuasion", ability: "cha" },
  { id: "religion", name: "Religion", ability: "int" },
  { id: "sleight-of-hand", name: "Sleight of Hand", ability: "dex" },
  { id: "stealth", name: "Stealth", ability: "dex" },
  { id: "survival", name: "Survival", ability: "wis" },
];
export const SKILL_IDS = SKILLS.map((s) => s.id);

// Character Advancement table, p.23: XP needed for each level 1..20.
export const XP_FOR_LEVEL = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

// Character Advancement table, p.23 (same as the Proficiency Bonus table, p.8).
export const proficiencyBonus = (level) => 2 + Math.floor((level - 1) / 4);

// Ability Scores and Modifiers table, p.21: 3 → −4 … 20 → +5, i.e. (score − 10) / 2 rounded down.
export const abilityModifier = (score) => Math.floor((score - 10) / 2);

// Generate Your Scores, p.21.
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
export const POINT_BUY_BUDGET = 27;
// Ability Score Point Costs table, p.21.
export const POINT_COSTS = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

// Standard Array by Class table, p.21, in STR DEX CON INT WIS CHA order.
export const STANDARD_ARRAY_BY_CLASS = {
  barbarian: [15, 13, 14, 10, 12, 8],
  bard: [8, 14, 12, 13, 10, 15],
  cleric: [14, 8, 13, 10, 15, 12],
  druid: [8, 12, 14, 13, 15, 10],
  fighter: [15, 14, 13, 8, 10, 12],
  monk: [12, 15, 13, 10, 14, 8],
  paladin: [15, 10, 13, 8, 12, 14],
  ranger: [12, 15, 13, 8, 14, 10],
  rogue: [12, 15, 13, 14, 10, 8],
  sorcerer: [10, 13, 14, 8, 12, 15],
  warlock: [8, 14, 13, 12, 10, 15],
  wizard: [8, 12, 13, 15, 14, 10],
};

// Adjust Ability Scores, p.21 and p.83: a background's increases can't raise a score above 20.
export const BACKGROUND_INCREASE_CAP = 20;
// Ability Score Improvement feat, p.87: "can't increase an ability score above 20".
export const ASI_CAP = 20;
// Epic Boon feats, p.88: "to a maximum of 30".
export const EPIC_BOON_CAP = 30;

// Standard Languages table, p.20 (1d12; Common is always known). Rare Languages table, p.20.
export const STANDARD_LANGUAGES = [
  { id: "common-sign-language", name: "Common Sign Language", roll: [1] },
  { id: "draconic", name: "Draconic", roll: [2] },
  { id: "dwarvish", name: "Dwarvish", roll: [3, 4] },
  { id: "elvish", name: "Elvish", roll: [5, 6] },
  { id: "giant", name: "Giant", roll: [7] },
  { id: "gnomish", name: "Gnomish", roll: [8] },
  { id: "goblin", name: "Goblin", roll: [9] },
  { id: "halfling", name: "Halfling", roll: [10, 11] },
  { id: "orc", name: "Orc", roll: [12] },
];
export const RARE_LANGUAGES = ["Abyssal", "Celestial", "Deep Speech", "Druidic", "Infernal",
  "Primordial", "Sylvan", "Thieves' Cant", "Undercommon"];
// Choose Languages, p.20: Common plus two from the Standard Languages table.
export const LANGUAGE_CHOICES = 2;

// The Nine Alignments, p.21–22.
export const ALIGNMENTS = ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "Neutral",
  "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"];

// Level 1 Hit Points by Class (p.22) and Fixed Hit Points by Class (p.23), keyed by hit die.
// The tables give 12/10/8/6 at level 1 (the die's maximum) and 7/6/5/4 per later level.
export const HP_LEVEL_1 = { 12: 12, 10: 10, 8: 8, 6: 6 };
export const HP_FIXED_PER_LEVEL = { 12: 7, 10: 6, 8: 5, 6: 4 };
