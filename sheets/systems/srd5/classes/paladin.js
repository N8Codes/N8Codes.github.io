// Paladin, from the System Reference Document 5.2.1 (CC-BY-4.0), p.53–57.
export default {
  id: "paladin",
  name: "Paladin",
  cite: "p.53–57",
  // Class Overview table, p.19
  primaryAbilities: ["str", "cha"],
  primaryJoin: "and",
  complexity: "Average",
  hitDie: 10, // "D10 per Paladin level", p.53
  savingThrows: ["wis", "cha"],
  skillChoices: { count: 2, from: ["athletics", "insight", "intimidation", "medicine", "persuasion", "religion"] },
  weapons: { simple: true, martial: true, martialWithProperty: [] },
  weaponsText: "Simple and Martial weapons",
  armor: ["light", "medium", "heavy", "shield"],
  tools: { text: "", choose: 0 }, // the Core Paladin Traits table has no Tool Proficiencies row, p.53
  startingEquipment: [
    {
      option: "A",
      items: [
        { name: "Chain Mail", qty: 1 },
        { name: "Shield", qty: 1 },
        { name: "Longsword", qty: 1 },
        { name: "Javelin", qty: 6 },
        { name: "Holy Symbol", qty: 1 },
        { name: "Priest's Pack", qty: 1 },
      ],
      gp: 9,
    },
    { option: "B", items: [], gp: 150 },
  ],
  // Paladin Features table, p.53
  features: {
    1: ["Lay On Hands", "Spellcasting", "Weapon Mastery"],
    2: ["Fighting Style", "Paladin's Smite"],
    3: ["Channel Divinity", "Paladin Subclass"],
    4: ["Ability Score Improvement"],
    5: ["Extra Attack", "Faithful Steed"],
    6: ["Aura of Protection"],
    7: ["Subclass feature"],
    8: ["Ability Score Improvement"],
    9: ["Abjure Foes"],
    10: ["Aura of Courage"],
    11: ["Radiant Strikes"],
    12: ["Ability Score Improvement"],
    13: [],
    14: ["Restoring Touch"],
    15: ["Subclass feature"],
    16: ["Ability Score Improvement"],
    17: [],
    18: ["Aura Expansion"],
    19: ["Epic Boon"],
    20: ["Subclass feature"],
  },
  columns: {
    channelDivinity: { label: "Channel Divinity", values: ["—", "—", 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3] },
    preparedSpells: { label: "Prepared Spells", values: [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15] },
  },
  asiLevels: [4, 8, 12, 16], // p.53 table; p.55, Level 4: Ability Score Improvement
  epicBoonLevel: 19,
  subclassLevel: 3,

  resources: [
    { id: "lay-on-hands", name: "Lay On Hands", level: 1,
      uses: { perClassLevel: 5 },
      recharge: "Long Rest: all",
      cite: "p.53, Level 1: Lay On Hands (a pool of Hit Points, five times Paladin level)" },
    { id: "paladins-smite", name: "Paladin's Smite", level: 2,
      uses: { fixed: 1 },
      recharge: "Long Rest",
      cite: "p.54, Level 2: Paladin's Smite (Divine Smite without a slot)" },
    { id: "channel-divinity", name: "Channel Divinity", level: 3,
      uses: { column: "channelDivinity" },
      recharge: "Short Rest: one use; Long Rest: all",
      cite: "p.54, Level 3: Channel Divinity" },
    { id: "faithful-steed", name: "Faithful Steed", level: 5,
      uses: { fixed: 1 },
      recharge: "Long Rest",
      cite: "p.55, Level 5: Faithful Steed (Find Steed without a slot)" },
  ],

  choices: [
    { id: "class-skills", level: 1, kind: "skill-proficiency", count: 2, from: "skillChoices", cite: "p.53" },
    { id: "weapon-mastery", level: 1, kind: "weapon-mastery", filter: "proficient", /* "weapons with which you have proficiency" */ count: 2, cite: "p.54, Level 1: Weapon Mastery" },
    { id: "fighting-style", level: 2, kind: "feat", category: "fighting-style", count: 1, cite: "p.54, Level 2: Fighting Style" },
  ],

  effects: [],

  spellcasting: {
    ability: "cha", level: 1, cite: "p.54, Level 1: Spellcasting",
    cantrips: null,
    prepared: { column: "preparedSpells" },
    // Paladin Features table, p.53: slot levels 1..5 printed, 6..9 always 0
    slots: [
      [2, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 0, 0, 0, 0, 0, 0, 0, 0],
      [4, 2, 0, 0, 0, 0, 0, 0, 0],
      [4, 2, 0, 0, 0, 0, 0, 0, 0],
      [4, 3, 0, 0, 0, 0, 0, 0, 0],
      [4, 3, 0, 0, 0, 0, 0, 0, 0],
      [4, 3, 2, 0, 0, 0, 0, 0, 0],
      [4, 3, 2, 0, 0, 0, 0, 0, 0],
      [4, 3, 3, 0, 0, 0, 0, 0, 0],
      [4, 3, 3, 0, 0, 0, 0, 0, 0],
      [4, 3, 3, 1, 0, 0, 0, 0, 0],
      [4, 3, 3, 1, 0, 0, 0, 0, 0],
      [4, 3, 3, 2, 0, 0, 0, 0, 0],
      [4, 3, 3, 2, 0, 0, 0, 0, 0],
      [4, 3, 3, 3, 1, 0, 0, 0, 0],
      [4, 3, 3, 3, 1, 0, 0, 0, 0],
      [4, 3, 3, 3, 2, 0, 0, 0, 0],
      [4, 3, 3, 3, 2, 0, 0, 0, 0],
    ],
    pact: null,
  },

  subclass: {
    id: "oath-of-devotion", name: "Oath of Devotion", cite: "p.56–57",
    features: {
      3: ["Oath of Devotion Spells", "Sacred Weapon"],
      7: ["Aura of Devotion"],
      15: ["Smite of Protection"],
      20: ["Holy Nimbus"],
    },
    resources: [
      { id: "holy-nimbus", name: "Holy Nimbus", level: 20,
        uses: { fixed: 1 },
        recharge: "Long Rest (or expend a level 5 spell slot)",
        cite: "p.57, Level 20: Holy Nimbus" },
    ],
    choices: [],
    effects: [],
    todo: [
      "Oath of Devotion Spells (p.56) are always prepared and don't count against Prepared Spells; no effect type for always-prepared spells. Table: level 3 Protection from Evil and Good, Shield of Faith; 5 Aid, Zone of Truth; 9 Beacon of Hope, Dispel Magic; 13 Freedom of Movement, Guardian of Faith; 17 Commune, Flame Strike.",
      "Sacred Weapon (p.56) spends a Channel Divinity use; it shares the class 'channel-divinity' resource rather than having its own.",
    ],
  },

  todo: [
    "Fighting Style (p.54): instead of a Fighting Style feat the player may take the Blessed Warrior option (two Cleric cantrips, Charisma as their ability, counted as Paladin spells). The 'feat' choice kind can't express that alternative.",
    "Paladin's Smite (p.54) and Faithful Steed (p.55): Divine Smite and Find Steed are always prepared and don't count against Prepared Spells; no effect type for always-prepared spells.",
    "Aura of Protection (p.55, level 6): bonus to saving throws equal to Charisma modifier (minimum +1) for you and allies in a 10-foot Emanation (30 feet from level 18, Aura Expansion). No effect type for a save bonus.",
    "Abjure Foes (p.55, level 9) spends a Channel Divinity use; it shares the 'channel-divinity' resource.",
    "Channel Divinity gains its third use at Paladin level 11 (p.54); the table column already shows 3 from level 11.",
  ],
};
