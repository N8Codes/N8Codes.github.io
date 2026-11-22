// Rogue, from the System Reference Document 5.2.1 (CC-BY-4.0), p.61–64.
export default {
  id: "rogue",
  name: "Rogue",
  cite: "p.61–64",
  // Class Overview table, p.19–20
  primaryAbilities: ["dex"],
  primaryJoin: null,
  complexity: "Low",
  hitDie: 8, // "D8 per Rogue level", p.61
  savingThrows: ["dex", "int"],
  skillChoices: {
    count: 4,
    from: ["acrobatics", "athletics", "deception", "insight", "intimidation", "investigation", "perception",
      "persuasion", "sleight-of-hand", "stealth"],
  },
  weapons: { simple: true, martial: false, martialWithProperty: ["finesse", "light"] },
  weaponsText: "Simple weapons and Martial weapons that have the Finesse or Light property",
  armor: ["light"],
  tools: { text: "Thieves' Tools", choose: 0 },
  startingEquipment: [
    {
      option: "A",
      items: [
        { name: "Leather Armor", qty: 1 },
        { name: "Dagger", qty: 2 },
        { name: "Shortsword", qty: 1 },
        { name: "Shortbow", qty: 1 },
        { name: "Arrow", qty: 20 },
        { name: "Quiver", qty: 1 },
        { name: "Thieves' Tools", qty: 1 },
        { name: "Burglar's Pack", qty: 1 },
      ],
      gp: 8,
    },
    { option: "B", items: [], gp: 100 },
  ],
  // Rogue Features table, p.62
  features: {
    1: ["Expertise", "Sneak Attack", "Thieves' Cant", "Weapon Mastery"],
    2: ["Cunning Action"],
    3: ["Rogue Subclass", "Steady Aim"],
    4: ["Ability Score Improvement"],
    5: ["Cunning Strike", "Uncanny Dodge"],
    6: ["Expertise"],
    7: ["Evasion", "Reliable Talent"],
    8: ["Ability Score Improvement"],
    9: ["Subclass feature"],
    10: ["Ability Score Improvement"],
    11: ["Improved Cunning Strike"],
    12: ["Ability Score Improvement"],
    13: ["Subclass feature"],
    14: ["Devious Strikes"],
    15: ["Slippery Mind"],
    16: ["Ability Score Improvement"],
    17: ["Subclass feature"],
    18: ["Elusive"],
    19: ["Epic Boon"],
    20: ["Stroke of Luck"],
  },
  columns: {
    sneakAttack: {
      label: "Sneak Attack",
      values: ["1d6", "1d6", "2d6", "2d6", "3d6", "3d6", "4d6", "4d6", "5d6", "5d6",
        "6d6", "6d6", "7d6", "7d6", "8d6", "8d6", "9d6", "9d6", "10d6", "10d6"],
    },
  },
  asiLevels: [4, 8, 10, 12, 16], // p.62 table; p.63, Level 4: Ability Score Improvement
  epicBoonLevel: 19,
  subclassLevel: 3,

  resources: [
    { id: "stroke-of-luck", name: "Stroke of Luck", level: 20,
      uses: { fixed: 1 },
      recharge: "Short or Long Rest",
      cite: "p.63, Level 20: Stroke of Luck" },
  ],

  choices: [
    { id: "class-skills", level: 1, kind: "skill-proficiency", count: 4, from: "skillChoices", cite: "p.61" },
    { id: "expertise-1", level: 1, kind: "skill-expertise", count: 2, from: "proficient-skills", cite: "p.61, Level 1: Expertise" },
    { id: "thieves-cant-language", level: 1, kind: "language", count: 1, cite: "p.62, Level 1: Thieves' Cant" },
    { id: "weapon-mastery", level: 1, kind: "weapon-mastery", filter: "proficient", /* "weapons with which you have proficiency" */ count: 2, cite: "p.62, Level 1: Weapon Mastery" },
    { id: "expertise-6", level: 6, kind: "skill-expertise", count: 2, from: "proficient-skills", cite: "p.61, Level 1: Expertise (Rogue level 6)" },
  ],

  effects: [
    { type: "language", level: 1, names: ["Thieves' Cant"], cite: "p.62, Level 1: Thieves' Cant" },
    { type: "save-proficiency", level: 15, abilities: ["wis", "cha"], cite: "p.63, Level 15: Slippery Mind" },
  ],

  spellcasting: null,

  subclass: {
    id: "thief", name: "Thief", cite: "p.64",
    features: {
      3: ["Fast Hands", "Second-Story Work"],
      9: ["Supreme Sneak"],
      13: ["Use Magic Device"],
      17: ["Thief's Reflexes"],
    },
    resources: [],
    choices: [],
    effects: [],
    todo: [
      "Second-Story Work (p.64, level 3): Climber grants a Climb Speed equal to your Speed; no effect type for climb speed. Jumper (jump distance from Dexterity) is not modelled.",
      "Use Magic Device (p.64, level 13): attune to up to four magic items at once; no effect type for the attunement limit.",
    ],
  },

  todo: [
    "Cunning Strike (p.63): the save DC is 8 + Dexterity modifier + Proficiency Bonus; no effect type for a feature save DC.",
    "Reliable Talent (p.63, level 7): treat a d20 roll of 9 or lower as 10 on checks using a skill or tool proficiency; would matter only if the sheet rolls dice.",
  ],
};
