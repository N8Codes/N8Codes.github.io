// SRD 5.2.1 Warlock, extracted from the System Reference Document 5.2.1 (CC-BY-4.0), p.70–76.
export default {
  id: "warlock",
  name: "Warlock",
  cite: "p.70–76",
  // Class Overview table, p.19–20
  primaryAbilities: ["cha"],
  primaryJoin: null,
  complexity: "High",
  hitDie: 8, // "D8 per Warlock level", p.70
  savingThrows: ["wis", "cha"], // p.70
  skillChoices: {
    count: 2,
    from: ["arcana", "deception", "history", "intimidation", "investigation", "nature", "religion"],
  }, // p.70
  weapons: { simple: true, martial: false, martialWithProperty: [] },
  weaponsText: "Simple weapons", // p.70
  armor: ["light"], // "Light armor", p.70
  tools: { text: null, choose: 0 }, // Core Warlock Traits table has no tool row, p.70
  startingEquipment: [
    {
      option: "A",
      items: [
        { name: "Leather Armor", qty: 1 },
        { name: "Sickle", qty: 1 },
        { name: "Dagger", qty: 2 },
        { name: "Arcane Focus (orb)", qty: 1 },
        { name: "Book (occult lore)", qty: 1 },
        { name: "Scholar’s Pack", qty: 1 },
      ],
      gp: 15,
    },
    { option: "B", items: [], gp: 100 },
  ], // p.70

  // Warlock Features table, p.71
  features: {
    1: ["Eldritch Invocations", "Pact Magic"],
    2: ["Magical Cunning"],
    3: ["Warlock Subclass"],
    4: ["Ability Score Improvement"],
    5: [],
    6: ["Subclass feature"],
    7: [],
    8: ["Ability Score Improvement"],
    9: ["Contact Patron"],
    10: ["Subclass feature"],
    11: ["Mystic Arcanum (level 6 spell)"],
    12: ["Ability Score Improvement"],
    13: ["Mystic Arcanum (level 7 spell)"],
    14: ["Subclass feature"],
    15: ["Mystic Arcanum (level 8 spell)"],
    16: ["Ability Score Improvement"],
    17: ["Mystic Arcanum (level 9 spell)"],
    18: [],
    19: ["Epic Boon"],
    20: ["Eldritch Master"],
  },
  // Warlock Features table, p.71
  columns: {
    invocations: {
      label: "Eldritch Invocations",
      values: [1, 3, 3, 3, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10],
    },
    cantrips: {
      label: "Cantrips",
      values: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    },
    preparedSpells: {
      label: "Prepared Spells",
      values: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
    },
    spellSlots: {
      label: "Spell Slots",
      values: [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4],
    },
    slotLevel: {
      label: "Slot Level",
      values: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    },
  },
  asiLevels: [4, 8, 12, 16], // p.71 table; p.72, Level 4: Ability Score Improvement
  epicBoonLevel: 19, // p.72
  subclassLevel: 3, // p.72

  resources: [
    { id: "magical-cunning", name: "Magical Cunning", level: 2,
      uses: { fixed: 1 },
      recharge: "Long Rest",
      cite: "p.72, Level 2: Magical Cunning" },
    { id: "contact-patron", name: "Contact Patron", level: 9,
      uses: { fixed: 1 },
      recharge: "Long Rest",
      cite: "p.72, Level 9: Contact Patron" },
    { id: "mystic-arcanum-6", name: "Mystic Arcanum (level 6 spell)", level: 11,
      uses: { fixed: 1 }, recharge: "Long Rest", cite: "p.72, Level 11: Mystic Arcanum" },
    { id: "mystic-arcanum-7", name: "Mystic Arcanum (level 7 spell)", level: 13,
      uses: { fixed: 1 }, recharge: "Long Rest", cite: "p.72, Level 11: Mystic Arcanum" },
    { id: "mystic-arcanum-8", name: "Mystic Arcanum (level 8 spell)", level: 15,
      uses: { fixed: 1 }, recharge: "Long Rest", cite: "p.72, Level 11: Mystic Arcanum" },
    { id: "mystic-arcanum-9", name: "Mystic Arcanum (level 9 spell)", level: 17,
      uses: { fixed: 1 }, recharge: "Long Rest", cite: "p.72, Level 11: Mystic Arcanum" },
  ],

  choices: [
    { id: "class-skills", level: 1, kind: "skill-proficiency", count: 2, from: "skillChoices", cite: "p.70" },
    { id: "eldritch-invocations", level: 1, kind: "text", label: "Eldritch Invocations",
      count: { column: "invocations" },
      cite: "p.70–71, Level 1: Eldritch Invocations; options p.72–" },
    { id: "mystic-arcanum-6", level: 11, kind: "text", label: "Mystic Arcanum: level 6 Warlock spell",
      count: 1, cite: "p.72, Level 11: Mystic Arcanum" },
    { id: "mystic-arcanum-7", level: 13, kind: "text", label: "Mystic Arcanum: level 7 Warlock spell",
      count: 1, cite: "p.72, Level 11: Mystic Arcanum" },
    { id: "mystic-arcanum-8", level: 15, kind: "text", label: "Mystic Arcanum: level 8 Warlock spell",
      count: 1, cite: "p.72, Level 11: Mystic Arcanum" },
    { id: "mystic-arcanum-9", level: 17, kind: "text", label: "Mystic Arcanum: level 9 Warlock spell",
      count: 1, cite: "p.72, Level 11: Mystic Arcanum" },
  ],

  effects: [],

  spellcasting: {
    ability: "cha", level: 1, cite: "p.71–72, Level 1: Pact Magic",
    cantrips: { column: "cantrips" },
    prepared: { column: "preparedSpells" },
    slots: null,
    pact: { slots: { column: "spellSlots" }, slotLevel: { column: "slotLevel" } },
  },

  subclass: {
    id: "fiend-patron", name: "Fiend Patron", cite: "p.76",
    features: {
      3: ["Dark One’s Blessing", "Fiend Spells"],
      6: ["Dark One’s Own Luck"],
      10: ["Fiendish Resilience"],
      14: ["Hurl Through Hell"],
    },
    resources: [
      { id: "dark-ones-own-luck", name: "Dark One’s Own Luck", level: 6,
        uses: { ability: "cha", min: 1 },
        recharge: "Long Rest: all",
        cite: "p.76, Level 6: Dark One’s Own Luck" },
      { id: "hurl-through-hell", name: "Hurl Through Hell", level: 14,
        uses: { fixed: 1 },
        recharge: "Long Rest (or expend a Pact Magic spell slot to restore)",
        cite: "p.76, Level 14: Hurl Through Hell" },
    ],
    choices: [],
    effects: [],
    todo: [
      "Fiend Spells (always prepared, p.76): level 3 Burning Hands, Command, Scorching Ray, Suggestion; level 5 Fireball, Stinking Cloud; level 7 Fire Shield, Wall of Fire; level 9 Geas, Insect Plague. No effect type for always-prepared spells.",
      "Fiendish Resilience (p.76): choose one damage type other than Force on each Short or Long Rest and gain Resistance to it. Re-choosable per rest and no resistance effect type, so not modelled as a choice.",
      "Dark One’s Blessing (p.76): Temporary Hit Points = Cha modifier + Warlock level (min 1) on reducing an enemy to 0 HP; could be shown as a derived number but there is no effect type for it.",
    ],
  },

  todo: [
    "Pact Magic slots recharge on a Short or Long Rest (p.71); the format has no field for slot recharge.",
    "Magical Cunning (p.72) regains Pact Magic slots up to half the maximum (round up); Eldritch Master (level 20, p.72) makes it regain all of them. Amount not modelled.",
    "Contact Patron (p.72): Contact Other Plane is always prepared; the free casting is the once-per-Long-Rest resource.",
    "Multiclassing into Warlock grants Light armor training (p.70); the format has no multiclass fields.",
  ],
};
