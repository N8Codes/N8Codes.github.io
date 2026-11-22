// SRD 5.2.1 Sorcerer, extracted from the System Reference Document 5.2.1 (CC-BY-4.0), p.64–70.
export default {
  id: "sorcerer",
  name: "Sorcerer",
  cite: "p.64–70",
  // Class Overview table, p.19–20
  primaryAbilities: ["cha"],
  primaryJoin: null,
  complexity: "High",
  hitDie: 6, // "D6 per Sorcerer level", p.64
  savingThrows: ["con", "cha"], // p.64
  skillChoices: {
    count: 2,
    from: ["arcana", "deception", "insight", "intimidation", "persuasion", "religion"],
  }, // p.64
  weapons: { simple: true, martial: false, martialWithProperty: [] },
  weaponsText: "Simple weapons", // p.64
  armor: [], // "Armor Training None", p.64
  tools: { text: null, choose: 0 }, // Core Sorcerer Traits table has no tool row, p.64
  startingEquipment: [
    {
      option: "A",
      items: [
        { name: "Spear", qty: 1 },
        { name: "Dagger", qty: 2 },
        { name: "Arcane Focus (crystal)", qty: 1 },
        { name: "Dungeoneer’s Pack", qty: 1 },
      ],
      gp: 28,
    },
    { option: "B", items: [], gp: 50 },
  ], // p.64

  // Sorcerer Features table, p.65
  features: {
    1: ["Spellcasting", "Innate Sorcery"],
    2: ["Font of Magic", "Metamagic"],
    3: ["Sorcerer Subclass"],
    4: ["Ability Score Improvement"],
    5: ["Sorcerous Restoration"],
    6: ["Subclass feature"],
    7: ["Sorcery Incarnate"],
    8: ["Ability Score Improvement"],
    9: [],
    10: ["Metamagic"],
    11: [],
    12: ["Ability Score Improvement"],
    13: [],
    14: ["Subclass feature"],
    15: [],
    16: ["Ability Score Improvement"],
    17: ["Metamagic"],
    18: ["Subclass feature"],
    19: ["Epic Boon"],
    20: ["Arcane Apotheosis"],
  },
  // Sorcerer Features table, p.65
  columns: {
    sorceryPoints: {
      label: "Sorcery Points",
      values: ["—", 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    },
    cantrips: {
      label: "Cantrips",
      values: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    },
    preparedSpells: {
      label: "Prepared Spells",
      values: [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
    },
  },
  asiLevels: [4, 8, 12, 16], // p.65 table; p.66, Level 4: Ability Score Improvement
  epicBoonLevel: 19, // p.66
  subclassLevel: 3, // p.66

  resources: [
    { id: "innate-sorcery", name: "Innate Sorcery", level: 1,
      uses: { fixed: 2 },
      recharge: "Long Rest: all",
      cite: "p.66, Level 1: Innate Sorcery" },
    { id: "sorcery-points", name: "Sorcery Points", level: 2,
      uses: { column: "sorceryPoints" },
      recharge: "Long Rest: all",
      cite: "p.66, Level 2: Font of Magic" },
    { id: "sorcerous-restoration", name: "Sorcerous Restoration", level: 5,
      uses: { fixed: 1 },
      recharge: "Long Rest",
      cite: "p.66, Level 5: Sorcerous Restoration" },
  ],

  choices: [
    { id: "class-skills", level: 1, kind: "skill-proficiency", count: 2, from: "skillChoices", cite: "p.64" },
    // Two options at level 2, two more at 10, two more at 17.
    { id: "metamagic", level: 2, kind: "text", label: "Metamagic options",
      count: { byLevel: [0, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 6, 6, 6, 6] },
      cite: "p.66, Level 2: Metamagic; options p.66–67" },
  ],

  effects: [],

  spellcasting: {
    ability: "cha", level: 1, cite: "p.64–65, Level 1: Spellcasting",
    cantrips: { column: "cantrips" },
    prepared: { column: "preparedSpells" },
    // Sorcerer Features table, p.65: slot levels 1..9
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
    id: "draconic-sorcery", name: "Draconic Sorcery", cite: "p.69–70",
    features: {
      3: ["Draconic Resilience", "Draconic Spells"],
      6: ["Elemental Affinity"],
      14: ["Dragon Wings"],
      18: ["Dragon Companion"],
    },
    resources: [
      { id: "dragon-wings", name: "Dragon Wings", level: 14,
        uses: { fixed: 1 },
        recharge: "Long Rest (or spend 3 Sorcery Points to restore)",
        cite: "p.70, Level 14: Dragon Wings" },
      { id: "dragon-companion", name: "Dragon Companion", level: 18,
        uses: { fixed: 1 },
        recharge: "Long Rest",
        cite: "p.70, Level 18: Dragon Companion" },
    ],
    choices: [
      { id: "elemental-affinity", level: 6, kind: "option", count: 1,
        options: [
          { id: "acid", name: "Acid", effects: [] },
          { id: "cold", name: "Cold", effects: [] },
          { id: "fire", name: "Fire", effects: [] },
          { id: "lightning", name: "Lightning", effects: [] },
          { id: "poison", name: "Poison", effects: [] },
        ],
        cite: "p.70, Level 6: Elemental Affinity" },
    ],
    effects: [
      // "+3, and +1 whenever you gain another Sorcerer level" = 1 per Sorcerer level from level 3 on.
      { type: "hp-bonus", level: 3, perClassLevel: 1, cite: "p.69, Level 3: Draconic Resilience" },
      { type: "ac-base", level: 3, base: 10, abilities: ["dex", "cha"], requires: "no-armor",
        // The text limits armor only ("While you aren't wearing armor"), so a Shield's +2 still applies.
        // (Barbarian's Unarmored Defense allows a Shield and the Monk's forbids one, both explicitly; this one is silent.)
        shieldAllowed: true, cite: "p.69, Level 3: Draconic Resilience" },
    ],
    todo: [
      "Draconic Resilience HP: the SRD says +3 at level 3 and +1 per later Sorcerer level; modelled as perClassLevel: 1 from level 3, which gives the same total (p.69).",
      "Draconic Resilience AC: the SRD says only 'While you aren't wearing armor'; it does not say whether a Shield is allowed. shieldAllowed: true: the Shield's +2 applies, since only armor is ruled out (p.69).",
      "Draconic Spells (always prepared, p.70): level 3 Alter Self, Chromatic Orb, Command, Dragon’s Breath; level 5 Fear, Fly; level 7 Arcane Eye, Charm Monster; level 9 Legend Lore, Summon Dragon. No effect type for always-prepared spells.",
      "Elemental Affinity (p.70): Resistance to the chosen damage type, and add Cha modifier to one damage roll of spells of that type. No effect type for resistance, so options carry no effects.",
      "Dragon Wings (p.70): Fly Speed 60 feet while active; no effect type for a temporary fly speed.",
    ],
  },

  todo: [
    "Font of Magic (p.66): Creating Spell Slots table (slot level / Sorcery Point cost / min. Sorcerer level): 1/2/2, 2/3/3, 3/5/5, 4/6/7, 5/7/9; slots created vanish on a Long Rest. Converting a slot gives Sorcery Points equal to its level. Not expressible in this format.",
    "Sorcerous Restoration (p.66): regains Sorcery Points up to half Sorcerer level (round down) on a Short Rest; the amount isn't modelled, only the once-per-Long-Rest use.",
    "Sorcery Incarnate (p.66): Innate Sorcery can be used with no uses left by spending 2 Sorcery Points.",
    "Metamagic count uses { byLevel } (2 at level 2, 4 at 10, 6 at 17, p.66), since the table has no Metamagic column.",
    "Sorcery Points column is '—' at level 1 (p.65); the sorcery-points resource is gained at level 2.",
  ],
};
