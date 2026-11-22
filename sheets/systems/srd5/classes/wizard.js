// SRD 5.2.1 Wizard, extracted from the System Reference Document 5.2.1 (CC-BY-4.0), p.77–82.
export default {
  id: "wizard",
  name: "Wizard",
  cite: "p.77–82",
  // Class Overview table, p.19–20
  primaryAbilities: ["int"],
  primaryJoin: null,
  complexity: "Average",
  hitDie: 6, // "D6 per Wizard level", p.77
  savingThrows: ["int", "wis"], // p.77
  skillChoices: {
    count: 2,
    from: ["arcana", "history", "insight", "investigation", "medicine", "nature", "religion"],
  }, // p.77
  weapons: { simple: true, martial: false, martialWithProperty: [] },
  weaponsText: "Simple weapons", // p.77
  armor: [], // "Armor Training None", p.77
  tools: { text: null, choose: 0 }, // Core Wizard Traits table has no tool row, p.77
  startingEquipment: [
    {
      option: "A",
      items: [
        { name: "Dagger", qty: 2 },
        { name: "Arcane Focus (Quarterstaff)", qty: 1 },
        { name: "Robe", qty: 1 },
        { name: "Spellbook", qty: 1 },
        { name: "Scholar’s Pack", qty: 1 },
      ],
      gp: 5,
    },
    { option: "B", items: [], gp: 55 },
  ], // p.77

  // Wizard Features table, p.77
  features: {
    1: ["Spellcasting", "Ritual Adept", "Arcane Recovery"],
    2: ["Scholar"],
    3: ["Wizard Subclass"],
    4: ["Ability Score Improvement"],
    5: ["Memorize Spell"],
    6: ["Subclass feature"],
    7: [],
    8: ["Ability Score Improvement"],
    9: [],
    10: ["Subclass feature"],
    11: [],
    12: ["Ability Score Improvement"],
    13: [],
    14: ["Subclass feature"],
    15: [],
    16: ["Ability Score Improvement"],
    17: [],
    18: ["Spell Mastery"],
    19: ["Epic Boon"],
    20: ["Signature Spells"],
  },
  // Wizard Features table, p.77
  columns: {
    cantrips: {
      label: "Cantrips",
      values: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    },
    preparedSpells: {
      label: "Prepared Spells",
      values: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25],
    },
  },
  asiLevels: [4, 8, 12, 16], // p.77 table; p.79, Level 4: Ability Score Improvement
  epicBoonLevel: 19, // p.79
  subclassLevel: 3, // p.78

  resources: [
    { id: "arcane-recovery", name: "Arcane Recovery", level: 1,
      uses: { fixed: 1 },
      recharge: "Long Rest",
      cite: "p.79, Level 1: Arcane Recovery" },
    { id: "signature-spells", name: "Signature Spells", level: 20,
      uses: { fixed: 2 },
      recharge: "Short or Long Rest",
      cite: "p.79, Level 20: Signature Spells" },
  ],

  choices: [
    { id: "class-skills", level: 1, kind: "skill-proficiency", count: 2, from: "skillChoices", cite: "p.77" },
    { id: "scholar", level: 2, kind: "skill-expertise", count: 1,
      from: ["arcana", "history", "investigation", "medicine", "nature", "religion"],
      cite: "p.79, Level 2: Scholar" },
    { id: "spell-mastery", level: 18, kind: "text", label: "Spell Mastery: one level 1 and one level 2 spell (casting time of an action)",
      count: 2, cite: "p.79, Level 18: Spell Mastery" },
    { id: "signature-spells", level: 20, kind: "text", label: "Signature Spells: two level 3 spells",
      count: 2, cite: "p.79, Level 20: Signature Spells" },
  ],

  effects: [],

  spellcasting: {
    ability: "int", level: 1, cite: "p.77–78, Level 1: Spellcasting",
    cantrips: { column: "cantrips" },
    prepared: { column: "preparedSpells" },
    // Wizard Features table, p.77: slot levels 1..9
    slots: [
      [2, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 0, 0, 0, 0, 0, 0, 0, 0],
      [4, 2, 0, 0, 0, 0, 0, 0, 0],
      [4, 3, 0, 0, 0, 0, 0, 0, 0],
      [4, 3, 2, 0, 0, 0, 0, 0, 0],
      [4, 3, 3, 0, 0, 0, 0, 0, 0],
      [4, 3, 3, 1, 0, 0, 0, 0, 0],
      [4, 3, 3, 2, 0, 0, 0, 0, 0],
      [4, 3, 3, 3, 1, 0, 0, 0, 0],
      [4, 3, 3, 3, 2, 0, 0, 0, 0],
      [4, 3, 3, 3, 2, 1, 0, 0, 0],
      [4, 3, 3, 3, 2, 1, 0, 0, 0],
      [4, 3, 3, 3, 2, 1, 1, 0, 0],
      [4, 3, 3, 3, 2, 1, 1, 0, 0],
      [4, 3, 3, 3, 2, 1, 1, 1, 0],
      [4, 3, 3, 3, 2, 1, 1, 1, 0],
      [4, 3, 3, 3, 2, 1, 1, 1, 1],
      [4, 3, 3, 3, 3, 1, 1, 1, 1],
      [4, 3, 3, 3, 3, 2, 1, 1, 1],
      [4, 3, 3, 3, 3, 2, 2, 1, 1],
    ],
    pact: null,
  },

  subclass: {
    id: "evoker", name: "Evoker", cite: "p.82",
    features: {
      3: ["Evocation Savant", "Potent Cantrip"],
      6: ["Sculpt Spells"],
      10: ["Empowered Evocation"],
      14: ["Overchannel"],
    },
    resources: [
      { id: "overchannel", name: "Overchannel (no-damage use)", level: 14,
        uses: { fixed: 1 },
        recharge: "Long Rest",
        cite: "p.82, Level 14: Overchannel" },
    ],
    choices: [
      { id: "evocation-savant", level: 3, kind: "text",
        label: "Evocation Savant: two Evocation Wizard spells of level 2 or lower, added to the spellbook",
        count: 2, cite: "p.82, Level 3: Evocation Savant" },
    ],
    effects: [],
    todo: [
      "Overchannel (p.82): only the first use per Long Rest is free; each further use before a Long Rest deals 2d12 Necrotic per slot level, +1d12 per level for each repeat. Modelled as a single free use only.",
      "Evocation Savant (p.82): also one free Evocation spell added to the spellbook whenever the Wizard gains a new level of spell slots; not modelled.",
    ],
  },

  todo: [
    "Spellbook (p.78): starts with six level 1 Wizard spells, plus two Wizard spells per Wizard level after 1; the format has no spellbook field.",
    "Scholar (p.79): the chosen skill must be one the Wizard is already proficient in, from the listed six; the format's 'from' can't express both conditions together.",
    "Arcane Recovery (p.79): recovers slots with combined level up to half Wizard level (round up), none level 6+, after a Short Rest; amount not modelled.",
    "Signature Spells (p.79): each of the two spells can be cast once at level 3 without a slot; modelled as 2 uses, but the uses are per spell, not a shared pool.",
    "Spell Mastery (p.79) and Signature Spells (p.79): the chosen spells are always prepared; no effect type for always-prepared spells.",
  ],
};
