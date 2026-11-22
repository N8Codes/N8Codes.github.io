// SRD 5.2.1 (CC-BY-4.0) — Bard class data. Plain data; see class-schema.md.
export default {
  id: "bard",
  name: "Bard",
  cite: "p.31–35",
  // Class Overview table, p.19
  primaryAbilities: ["cha"],
  primaryJoin: null,
  complexity: "High",
  hitDie: 8, // "D8 per Bard level", p.31
  savingThrows: ["dex", "cha"],
  skillChoices: { count: 3, from: "any" },
  weapons: { simple: true, martial: false, martialWithProperty: [] },
  weaponsText: "Simple weapons",
  armor: ["light"],
  tools: { text: "Choose 3 Musical Instruments (see “Equipment”)", choose: 3 },
  startingEquipment: [
    { option: "A", items: [{ name: "Leather Armor", qty: 1 }, { name: "Dagger", qty: 2 }, { name: "Musical Instrument of your choice", qty: 1 }, { name: "Entertainer's Pack", qty: 1 }], gp: 19 },
    { option: "B", items: [], gp: 90 },
  ],
  // Bard Features table, p.31 ("—" rows = no features)
  features: {
    1: ["Bardic Inspiration", "Spellcasting"],
    2: ["Expertise", "Jack of All Trades"],
    3: ["Bard Subclass"],
    4: ["Ability Score Improvement"],
    5: ["Font of Inspiration"],
    6: ["Subclass feature"],
    7: ["Countercharm"],
    8: ["Ability Score Improvement"],
    9: ["Expertise"],
    10: ["Magical Secrets"],
    11: [],
    12: ["Ability Score Improvement"],
    13: [],
    14: ["Subclass feature"],
    15: [],
    16: ["Ability Score Improvement"],
    17: [],
    18: ["Superior Inspiration"],
    19: ["Epic Boon"],
    20: ["Words of Creation"],
  },
  columns: {
    bardicDie: { label: "Bardic Die", values: ["D6", "D6", "D6", "D6", "D8", "D8", "D8", "D8", "D8", "D10", "D10", "D10", "D10", "D10", "D12", "D12", "D12", "D12", "D12", "D12"] },
    cantrips: { label: "Cantrips", values: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] },
    preparedSpells: { label: "Prepared Spells", values: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22] },
  },
  asiLevels: [4, 8, 12, 16],
  epicBoonLevel: 19,
  subclassLevel: 3,

  resources: [
    { id: "bardic-inspiration", name: "Bardic Inspiration", level: 1, uses: { ability: "cha", min: 1 },
      recharge: "Long Rest: all (Short or Long Rest: all from level 5)", cite: "p.32, Level 1: Bardic Inspiration; p.32, Level 5: Font of Inspiration" },
  ],

  choices: [
    { id: "class-skills", level: 1, kind: "skill-proficiency", count: 3, from: "skillChoices", cite: "p.31" },
    { id: "musical-instruments", level: 1, kind: "tool", count: 3, label: "Musical Instruments", from: ["musical-instruments"], cite: "p.31" },
    { id: "expertise-2", level: 2, kind: "skill-expertise", count: 2, from: "proficient-skills", cite: "p.32, Level 2: Expertise" },
    { id: "expertise-9", level: 9, kind: "skill-expertise", count: 2, from: "proficient-skills", cite: "p.32, Level 2: Expertise" },
  ],

  effects: [
    { type: "half-proficiency-unskilled", level: 2, cite: "p.32, Level 2: Jack of All Trades" },
  ],

  spellcasting: {
    ability: "cha", level: 1, cite: "p.32, Level 1: Spellcasting",
    cantrips: { column: "cantrips" }, prepared: { column: "preparedSpells" },
    // Bard Features table, p.31: slot levels 1..9
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
    id: "college-of-lore", name: "College of Lore", cite: "p.35",
    features: {
      3: ["Bonus Proficiencies", "Cutting Words"],
      6: ["Magical Discoveries"],
      14: ["Peerless Skill"],
    },
    resources: [],
    choices: [
      { id: "lore-bonus-proficiencies", level: 3, kind: "skill-proficiency", count: 3, from: "any", cite: "p.35, Level 3: Bonus Proficiencies" },
      { id: "magical-discoveries", level: 6, kind: "text", count: 2, label: "Magical Discoveries spells (Cleric, Druid or Wizard lists; always prepared)", cite: "p.35, Level 6: Magical Discoveries" },
    ],
    effects: [],
    todo: [
      "Cutting Words (p.35) and Peerless Skill (p.35) spend Bardic Inspiration uses; no extra resource needed.",
      "Magical Discoveries (p.35): the two spells are always prepared and don't count against Prepared Spells; each must be a cantrip or of a level the Bard has slots for. No effect type for always-prepared spells.",
    ],
  },

  todo: [
    "Hit points (p.22–23): level 1 = 8 + Con. modifier; fixed per later level = 5 + Con. modifier. The schema has only hitDie.",
    "Bardic Die column is stored as printed in the table (\"D6\"…\"D12\"); the feature text writes d6/d8/d10/d12 (p.32).",
    "Font of Inspiration (p.32): from level 5 Bardic Inspiration recharges on a Short or Long Rest, and a spell slot can be spent to regain one use. The resource's recharge can't change by level in the schema, so it is written in the recharge text.",
    "Superior Inspiration (p.33): on rolling Initiative, regain Bardic Inspiration uses up to two. Not modelled.",
    "Magical Secrets (p.33): from level 10, new prepared spells may come from the Bard, Cleric, Druid and Wizard lists. Spell-list widening has no field.",
    "Words of Creation (p.33): Power Word Heal and Power Word Kill always prepared at level 20. No field for always-prepared spells.",
    "Spellcasting focus is a Musical Instrument; prepared spells change by one on each Bard level gain (p.32). Bard spell list is on p.33–35 (not extracted here).",
  ],
};
