// SRD 5.2.1 (CC-BY-4.0) — Barbarian class data. Plain data; see class-schema.md.
export default {
  id: "barbarian",
  name: "Barbarian",
  cite: "p.28–30",
  // Class Overview table, p.19
  primaryAbilities: ["str"],
  primaryJoin: null,
  complexity: "Average",
  hitDie: 12, // "D12 per Barbarian level", p.28
  savingThrows: ["str", "con"],
  skillChoices: { count: 2, from: ["animal-handling", "athletics", "intimidation", "nature", "perception", "survival"] },
  weapons: { simple: true, martial: true, martialWithProperty: [] },
  weaponsText: "Simple and Martial weapons",
  armor: ["light", "medium", "shield"],
  tools: { text: null, choose: 0 }, // Core Barbarian Traits has no tool row, p.28
  startingEquipment: [
    { option: "A", items: [{ name: "Greataxe", qty: 1 }, { name: "Handaxe", qty: 4 }, { name: "Explorer's Pack", qty: 1 }], gp: 15 },
    { option: "B", items: [], gp: 75 },
  ],
  // Barbarian Features table, p.28
  features: {
    1: ["Rage", "Unarmored Defense", "Weapon Mastery"],
    2: ["Danger Sense", "Reckless Attack"],
    3: ["Barbarian Subclass", "Primal Knowledge"],
    4: ["Ability Score Improvement"],
    5: ["Extra Attack", "Fast Movement"],
    6: ["Subclass feature"],
    7: ["Feral Instinct", "Instinctive Pounce"],
    8: ["Ability Score Improvement"],
    9: ["Brutal Strike"],
    10: ["Subclass feature"],
    11: ["Relentless Rage"],
    12: ["Ability Score Improvement"],
    13: ["Improved Brutal Strike"],
    14: ["Subclass feature"],
    15: ["Persistent Rage"],
    16: ["Ability Score Improvement"],
    17: ["Improved Brutal Strike"],
    18: ["Indomitable Might"],
    19: ["Epic Boon"],
    20: ["Primal Champion"],
  },
  columns: {
    rages: { label: "Rages", values: [2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6] },
    rageDamage: { label: "Rage Damage", values: ["+2", "+2", "+2", "+2", "+2", "+2", "+2", "+2", "+3", "+3", "+3", "+3", "+3", "+3", "+3", "+4", "+4", "+4", "+4", "+4"] },
    weaponMastery: { label: "Weapon Mastery", values: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] },
  },
  asiLevels: [4, 8, 12, 16],
  epicBoonLevel: 19,
  subclassLevel: 3,

  resources: [
    { id: "rage", name: "Rage", level: 1, uses: { column: "rages" },
      recharge: "Short Rest: one use; Long Rest: all", cite: "p.28, Level 1: Rage" },
    { id: "persistent-rage", name: "Persistent Rage", level: 15, uses: { fixed: 1 },
      recharge: "Long Rest", cite: "p.30, Level 15: Persistent Rage" },
  ],

  choices: [
    { id: "class-skills", level: 1, kind: "skill-proficiency", count: 2, from: "skillChoices", cite: "p.28" },
    { id: "weapon-mastery", level: 1, kind: "weapon-mastery", filter: "melee", /* "Simple or Martial Melee weapons" */ count: { column: "weaponMastery" }, cite: "p.29, Level 1: Weapon Mastery" },
    { id: "primal-knowledge", level: 3, kind: "skill-proficiency", count: 1, from: "skillChoices", cite: "p.29, Level 3: Primal Knowledge" },
  ],

  effects: [
    { type: "ac-base", level: 1, base: 10, abilities: ["dex", "con"], requires: "no-armor", shieldAllowed: true, cite: "p.29, Level 1: Unarmored Defense" },
    { type: "speed", level: 5, bonus: 10, requires: "no-heavy-armor", cite: "p.29, Level 5: Fast Movement" },
    { type: "ability-increase", level: 20, abilities: { str: 4, con: 4 }, max: 25, cite: "p.30, Level 20: Primal Champion" },
  ],

  spellcasting: null,

  subclass: {
    id: "path-of-the-berserker", name: "Path of the Berserker", cite: "p.30",
    features: {
      3: ["Frenzy"],
      6: ["Mindless Rage"],
      10: ["Retaliation"],
      14: ["Intimidating Presence"],
    },
    resources: [
      { id: "intimidating-presence", name: "Intimidating Presence", level: 14, uses: { fixed: 1 },
        recharge: "Long Rest, or expend a use of Rage to restore it", cite: "p.30, Level 14: Intimidating Presence" },
    ],
    choices: [],
    effects: [],
    todo: [
      "Frenzy (p.30): extra damage is a number of d6s equal to the Rage Damage bonus (column rageDamage); no effect type for a derived damage die.",
      "Intimidating Presence (p.30): save DC is 8 + Strength modifier + Proficiency Bonus; no effect type for a feature save DC.",
    ],
  },

  todo: [
    "Hit points (p.22–23): level 1 = 12 + Con. modifier; fixed per later level = 7 + Con. modifier. The schema has only hitDie.",
    "Rage (p.28–29): Rage Damage applies only while raging, to Strength-based attacks; Rage also gives Resistance to Bludgeoning, Piercing and Slashing and Advantage on Strength checks/saves. No effect type for conditional (rage-only) bonuses.",
    "Rage cannot be entered while wearing Heavy armor (p.28).",
    "Danger Sense (p.29): Advantage on Dexterity saving throws unless Incapacitated. Feral Instinct (p.29): Advantage on Initiative rolls. No effect type for advantage.",
    "Brutal Strike (p.29): extra 1d10 damage, increased to 2d10 at level 17 (p.30, Improved Brutal Strike); two effects per use at 17. Not a table column.",
    "Relentless Rage (p.30): DC 10 Constitution save, +5 per use after the first, resets on a Short or Long Rest; HP becomes twice Barbarian level. A DC tracker the schema can't express.",
    "Persistent Rage (p.30) is modelled as a 1-use Long Rest resource (regain all Rage uses on rolling Initiative).",
    "Indomitable Might (p.30): use Strength score in place of a lower Strength check/save total; no effect type.",
  ],
};
