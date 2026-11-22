// Druid, from the System Reference Document 5.2.1 (CC-BY-4.0), p.41–46.
export default {
  id: "druid",
  name: "Druid",
  cite: "p.41–46",
  // Class Overview table, p.19
  primaryAbilities: ["wis"],
  primaryJoin: null,
  complexity: "High",
  hitDie: 8, // "D8 per Druid level", p.41
  savingThrows: ["int", "wis"],
  skillChoices: {
    count: 2,
    from: ["animal-handling", "arcana", "insight", "medicine", "nature", "perception", "religion", "survival"],
  },
  weapons: { simple: true, martial: false, martialWithProperty: [] },
  weaponsText: "Simple weapons",
  armor: ["light", "shield"],
  tools: { text: "Herbalism Kit", choose: 0 },
  startingEquipment: [
    {
      option: "A",
      items: [
        { name: "Leather Armor", qty: 1 },
        { name: "Shield", qty: 1 },
        { name: "Sickle", qty: 1 },
        { name: "Druidic Focus (Quarterstaff)", qty: 1 },
        { name: "Explorer's Pack", qty: 1 },
        { name: "Herbalism Kit", qty: 1 },
      ],
      gp: 9,
    },
    { option: "B", items: [], gp: 50 },
  ],
  // Druid Features table, p.41
  features: {
    1: ["Spellcasting", "Druidic", "Primal Order"],
    2: ["Wild Shape", "Wild Companion"],
    3: ["Druid Subclass"],
    4: ["Ability Score Improvement"],
    5: ["Wild Resurgence"],
    6: ["Subclass feature"],
    7: ["Elemental Fury"],
    8: ["Ability Score Improvement"],
    9: [],
    10: ["Subclass feature"],
    11: [],
    12: ["Ability Score Improvement"],
    13: [],
    14: ["Subclass feature"],
    15: ["Improved Elemental Fury"],
    16: ["Ability Score Improvement"],
    17: [],
    18: ["Beast Spells"],
    19: ["Epic Boon"],
    20: ["Archdruid"],
  },
  columns: {
    wildShape: { label: "Wild Shape", values: ["—", 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4] },
    cantrips: { label: "Cantrips", values: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] },
    preparedSpells: {
      label: "Prepared Spells",
      values: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
    },
  },
  asiLevels: [4, 8, 12, 16], // p.43, Level 4: Ability Score Improvement
  epicBoonLevel: 19,
  subclassLevel: 3,

  resources: [
    {
      id: "wild-shape", name: "Wild Shape", level: 2,
      uses: { column: "wildShape" },
      recharge: "Short Rest: one use; Long Rest: all",
      cite: "p.42, Level 2: Wild Shape",
    },
    {
      id: "wild-resurgence-slot", name: "Wild Resurgence (Wild Shape to level 1 slot)", level: 5,
      uses: { fixed: 1 },
      recharge: "Long Rest",
      cite: "p.43, Level 5: Wild Resurgence",
    },
    {
      id: "nature-magician", name: "Archdruid: Nature Magician", level: 20,
      uses: { fixed: 1 },
      recharge: "Long Rest",
      cite: "p.43, Level 20: Archdruid",
    },
  ],

  choices: [
    { id: "class-skills", level: 1, kind: "skill-proficiency", count: 2, from: "skillChoices", cite: "p.41" },
    {
      id: "primal-order", level: 1, kind: "option", count: 1, cite: "p.42, Level 1: Primal Order",
      options: [
        {
          id: "magician", name: "Magician",
          effects: [
            { type: "skill-bonus", level: 1, skills: ["arcana", "nature"], ability: "wis", min: 1, cite: "p.42, Level 1: Primal Order" },
          ],
        },
        {
          id: "warden", name: "Warden",
          effects: [
            { type: "weapon-training", level: 1, martial: true, cite: "p.42, Level 1: Primal Order" },
            { type: "armor-training", level: 1, kinds: ["medium"], cite: "p.42, Level 1: Primal Order" },
          ],
        },
      ],
    },
    {
      id: "elemental-fury", level: 7, kind: "option", count: 1, cite: "p.43, Level 7: Elemental Fury",
      options: [
        { id: "potent-spellcasting", name: "Potent Spellcasting", effects: [] },
        { id: "primal-strike", name: "Primal Strike", effects: [] },
      ],
    },
  ],

  effects: [
    { type: "language", level: 1, names: ["Druidic"], cite: "p.42, Level 1: Druidic" },
  ],

  spellcasting: {
    ability: "wis", level: 1, cite: "p.41–42, Level 1: Spellcasting",
    cantrips: { column: "cantrips" },
    prepared: { column: "preparedSpells" },
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
    id: "circle-of-the-land", name: "Circle of the Land", cite: "p.46",
    features: {
      3: ["Circle of the Land Spells", "Land's Aid"],
      6: ["Natural Recovery"],
      10: ["Nature's Ward"],
      14: ["Nature's Sanctuary"],
    },
    resources: [
      {
        id: "natural-recovery-spell", name: "Natural Recovery (free Circle spell)", level: 6,
        uses: { fixed: 1 },
        recharge: "Long Rest",
        cite: "p.46, Level 6: Natural Recovery",
      },
      {
        id: "natural-recovery-slots", name: "Natural Recovery (recover slots on Short Rest)", level: 6,
        uses: { fixed: 1 },
        recharge: "Long Rest",
        cite: "p.46, Level 6: Natural Recovery",
      },
    ],
    choices: [
      {
        id: "land-type", level: 3, kind: "option", count: 1, cite: "p.46, Level 3: Circle of the Land Spells",
        options: [
          { id: "arid", name: "Arid", effects: [] },
          { id: "polar", name: "Polar", effects: [] },
          { id: "temperate", name: "Temperate", effects: [] },
          { id: "tropical", name: "Tropical", effects: [] },
        ],
      },
    ],
    effects: [],
    todo: [
      "Land type is re-chosen after every Long Rest, not once (p.46, Level 3: Circle of the Land Spells); the 'option' choice format has no way to say it changes.",
      "Circle Spells, always prepared for Druid level and lower, by land (p.46): Arid 3 Blur, Burning Hands, Fire Bolt; 5 Fireball; 7 Blight; 9 Wall of Stone. Polar 3 Fog Cloud, Hold Person, Ray of Frost; 5 Sleet Storm; 7 Ice Storm; 9 Cone of Cold. Temperate 3 Misty Step, Shocking Grasp, Sleep; 5 Lightning Bolt; 7 Freedom of Movement; 9 Tree Stride. Tropical 3 Acid Splash, Ray of Sickness, Web; 5 Stinking Cloud; 7 Polymorph; 9 Insect Plague. No format for always-prepared spells.",
      "Land's Aid and Nature's Sanctuary each spend a Wild Shape use; Land's Aid dice are 2d6, 3d6 at Druid level 10, 4d6 at 14 (p.46). No column/effect type for this.",
      "Natural Recovery slot recovery: combined level up to half Druid level (round up), none level 6+ (p.46). No effect type.",
      "Nature's Ward (level 10): immune to Poisoned; Resistance by land — Arid Fire, Polar Cold, Temperate Lightning, Tropical Poison (p.46). No effect type for immunity/resistance.",
    ],
  },

  todo: [
    "Level 1 Hit Points 8 + Con. modifier (p.22) and fixed 5 + Con. modifier per level (p.23): no field in the format; both tables' cells are jumbled in the extracted text and were matched by row order (Barbarian / Fighter-Paladin-Ranger / Bard-Cleric-Druid-Monk-Rogue-Warlock / Sorcerer-Wizard).",
    "Primal Order Magician also grants one extra cantrip from the Druid spell list (p.42); no effect type for an extra cantrip.",
    "Druidic: you always have Speak with Animals prepared (p.42); no format for always-prepared spells.",
    "Wild Shape Known Forms / Beast Shapes table (p.42): level 2: 4 forms, max CR 1/4, no Fly Speed; level 4: 6 forms, max CR 1/2, no Fly Speed; level 8: 8 forms, max CR 1, Fly Speed. Forms can be swapped after a Long Rest. Not modelled as a choice because the count changes by level outside the class table.",
    "Wild Shape lasts hours equal to half Druid level and grants Temporary Hit Points equal to Druid level (p.42–43); no effect type.",
    "Wild Companion (level 2) spends a spell slot or Wild Shape use to cast Find Familiar (p.43).",
    "Wild Resurgence also lets you regain a Wild Shape use by spending a spell slot once per turn when you have none (p.43); only the once-per-Long-Rest slot conversion is tracked as a resource.",
    "Archdruid (level 20): Evergreen Wild Shape regains one Wild Shape use on Initiative when you have none; Nature Magician converts Wild Shape uses into one spell slot, 2 spell levels per use (p.43).",
    "Elemental Fury Primal Strike extra damage 1d8, 2d8 from Improved Elemental Fury at level 15; Potent Spellcasting adds Wis modifier to Druid cantrip damage, +300 ft. range at level 15 (p.43). No effect types.",
    "Spellcasting Focus: Druidic Focus (p.42).",
  ],
};
