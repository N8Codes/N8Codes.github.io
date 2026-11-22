// SRD 5.2.1 (CC-BY-4.0) — Cleric class data. Plain data; see class-schema.md.
export default {
  id: "cleric",
  name: "Cleric",
  cite: "p.36–40",
  // Class Overview table, p.19
  primaryAbilities: ["wis"],
  primaryJoin: null,
  complexity: "Average",
  hitDie: 8, // "D8 per Cleric level", p.36
  savingThrows: ["wis", "cha"],
  skillChoices: { count: 2, from: ["history", "insight", "medicine", "persuasion", "religion"] },
  weapons: { simple: true, martial: false, martialWithProperty: [] },
  weaponsText: "Simple weapons",
  armor: ["light", "medium", "shield"],
  tools: { text: null, choose: 0 }, // Core Cleric Traits has no tool row, p.36
  startingEquipment: [
    { option: "A", items: [{ name: "Chain Shirt", qty: 1 }, { name: "Shield", qty: 1 }, { name: "Mace", qty: 1 }, { name: "Holy Symbol", qty: 1 }, { name: "Priest's Pack", qty: 1 }], gp: 7 },
    { option: "B", items: [], gp: 110 },
  ],
  // Cleric Features table, p.36 ("—" rows = no features)
  features: {
    1: ["Spellcasting", "Divine Order"],
    2: ["Channel Divinity"],
    3: ["Cleric Subclass"],
    4: ["Ability Score Improvement"],
    5: ["Sear Undead"],
    6: ["Subclass feature"],
    7: ["Blessed Strikes"],
    8: ["Ability Score Improvement"],
    9: [],
    10: ["Divine Intervention"],
    11: [],
    12: ["Ability Score Improvement"],
    13: [],
    14: ["Improved Blessed Strikes"],
    15: [],
    16: ["Ability Score Improvement"],
    17: ["Subclass feature"],
    18: [],
    19: ["Epic Boon"],
    20: ["Greater Divine Intervention"],
  },
  columns: {
    channelDivinity: { label: "Channel Divinity", values: ["—", 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4] },
    cantrips: { label: "Cantrips", values: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] },
    preparedSpells: { label: "Prepared Spells", values: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22] },
  },
  asiLevels: [4, 8, 12, 16],
  epicBoonLevel: 19,
  subclassLevel: 3,

  resources: [
    { id: "channel-divinity", name: "Channel Divinity", level: 2, uses: { column: "channelDivinity" },
      recharge: "Short Rest: one use; Long Rest: all", cite: "p.37, Level 2: Channel Divinity" },
    { id: "divine-intervention", name: "Divine Intervention", level: 10, uses: { fixed: 1 },
      recharge: "Long Rest (2d4 Long Rests if Wish was chosen, level 20)", cite: "p.38, Level 10: Divine Intervention; Level 20: Greater Divine Intervention" },
  ],

  choices: [
    { id: "class-skills", level: 1, kind: "skill-proficiency", count: 2, from: "skillChoices", cite: "p.36" },
    { id: "divine-order", level: 1, kind: "option", count: 1, cite: "p.37, Level 1: Divine Order",
      options: [
        { id: "protector", name: "Protector", effects: [
          { type: "weapon-training", level: 1, martial: true, cite: "p.37, Divine Order: Protector" },
          { type: "armor-training", level: 1, kinds: ["heavy"], cite: "p.37, Divine Order: Protector" },
        ] },
        { id: "thaumaturge", name: "Thaumaturge", effects: [
          { type: "skill-bonus", level: 1, skills: ["arcana", "religion"], ability: "wis", min: 1, cite: "p.37, Divine Order: Thaumaturge" },
        ] },
      ] },
    { id: "blessed-strikes", level: 7, kind: "option", count: 1, cite: "p.38, Level 7: Blessed Strikes",
      options: [
        { id: "divine-strike", name: "Divine Strike", effects: [] },
        { id: "potent-spellcasting", name: "Potent Spellcasting", effects: [] },
      ] },
  ],

  effects: [],

  spellcasting: {
    ability: "wis", level: 1, cite: "p.36–37, Level 1: Spellcasting",
    cantrips: { column: "cantrips" }, prepared: { column: "preparedSpells" },
    // Cleric Features table, p.36: slot levels 1..9
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
    id: "life-domain", name: "Life Domain", cite: "p.40",
    features: {
      3: ["Disciple of Life", "Life Domain Spells", "Preserve Life"],
      6: ["Blessed Healer"],
      17: ["Supreme Healing"],
    },
    resources: [],
    choices: [],
    effects: [],
    todo: [
      "Life Domain Spells (p.40), always prepared, not counted against Prepared Spells (p.37): level 3 Aid, Bless, Cure Wounds, Lesser Restoration; level 5 Mass Healing Word, Revivify; level 7 Aura of Life, Death Ward; level 9 Greater Restoration, Mass Cure Wounds. No field for always-prepared spells.",
      "Preserve Life (p.40) spends a Channel Divinity use; restores five times Cleric level HP, divided among Bloodied creatures, up to half each one's HP maximum.",
      "Disciple of Life and Blessed Healer (p.40): extra healing of 2 + the spell slot's level. Supreme Healing (p.40): healing dice use their maximum. Not modelled.",
    ],
  },

  todo: [
    "Hit points (p.22–23): level 1 = 8 + Con. modifier; fixed per later level = 5 + Con. modifier. The schema has only hitDie.",
    "Divine Order: Thaumaturge (p.37) also grants one extra cantrip from the Cleric list; no effect type adds to the cantrip count.",
    "Channel Divinity column is \"—\" at level 1 (printed dash); the resource starts at level 2.",
    "Divine Spark (p.37): 1d8 + Wis modifier, rising to 2d8 at level 7, 3d8 at 13, 4d8 at 18. Channel Divinity save DC = this class's spell save DC. Not a table column.",
    "Sear Undead (p.37): d8s equal to Wis modifier (minimum 1d8). Not modelled.",
    "Blessed Strikes (p.38): Divine Strike 1d8 extra damage (2d8 at level 14, Improved Blessed Strikes); Potent Spellcasting adds Wis modifier to Cleric cantrip damage, and at 14 grants Temporary HP equal to twice Wis modifier. No effect types for these.",
    "Divine Intervention (p.38): cast a Cleric spell of level 5 or lower without a slot. Greater Divine Intervention (level 20) adds Wish, after which the recharge is 2d4 Long Rests. The resource recharge text notes this.",
    "Prepared spells can be changed on any Long Rest (p.37); spellcasting focus is a Holy Symbol. Cleric spell list is on p.38–40 (not extracted here).",
  ],
};
