// Monk, from the System Reference Document 5.2.1 (CC-BY-4.0), p.49–52.
export default {
  id: "monk",
  name: "Monk",
  cite: "p.49–52",
  // Class Overview table, p.19
  primaryAbilities: ["dex", "wis"],
  primaryJoin: "and",
  complexity: "High",
  hitDie: 8, // "D8 per Monk level", p.49
  savingThrows: ["str", "dex"],
  skillChoices: {
    count: 2,
    from: ["acrobatics", "athletics", "history", "insight", "religion", "stealth"],
  },
  weapons: { simple: true, martial: false, martialWithProperty: ["light"] },
  weaponsText: "Simple weapons and Martial weapons that have the Light property",
  armor: [],
  tools: { text: "Choose one type of Artisan's Tools or Musical Instrument (see “Equipment”)", choose: 1 },
  startingEquipment: [
    {
      option: "A",
      items: [
        { name: "Spear", qty: 1 },
        { name: "Dagger", qty: 5 },
        { name: "Artisan's Tools or Musical Instrument chosen for the tool proficiency above", qty: 1 },
        { name: "Explorer's Pack", qty: 1 },
      ],
      gp: 11,
    },
    { option: "B", items: [], gp: 50 },
  ],
  // Monk Features table, p.50
  features: {
    1: ["Martial Arts", "Unarmored Defense"],
    2: ["Monk's Focus", "Unarmored Movement", "Uncanny Metabolism"],
    3: ["Deflect Attacks", "Monk Subclass"],
    4: ["Ability Score Improvement", "Slow Fall"],
    5: ["Extra Attack", "Stunning Strike"],
    6: ["Empowered Strikes", "Subclass feature"],
    7: ["Evasion"],
    8: ["Ability Score Improvement"],
    9: ["Acrobatic Movement"],
    10: ["Heightened Focus", "Self-Restoration"],
    11: ["Subclass feature"],
    12: ["Ability Score Improvement"],
    13: ["Deflect Energy"],
    14: ["Disciplined Survivor"],
    15: ["Perfect Focus"],
    16: ["Ability Score Improvement"],
    17: ["Subclass feature"],
    18: ["Superior Defense"],
    19: ["Epic Boon"],
    20: ["Body and Mind"],
  },
  columns: {
    martialArts: {
      label: "Martial Arts",
      values: ["1d6", "1d6", "1d6", "1d6", "1d8", "1d8", "1d8", "1d8", "1d8", "1d8",
        "1d10", "1d10", "1d10", "1d10", "1d10", "1d10", "1d12", "1d12", "1d12", "1d12"],
    },
    focusPoints: {
      label: "Focus Points",
      values: ["—", 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    },
    unarmoredMovement: {
      label: "Unarmored Movement",
      values: ["—", "+10 ft.", "+10 ft.", "+10 ft.", "+10 ft.", "+15 ft.", "+15 ft.", "+15 ft.", "+15 ft.", "+20 ft.",
        "+20 ft.", "+20 ft.", "+20 ft.", "+25 ft.", "+25 ft.", "+25 ft.", "+25 ft.", "+30 ft.", "+30 ft.", "+30 ft."],
    },
  },
  asiLevels: [4, 8, 12, 16], // p.51, Level 4: Ability Score Improvement
  epicBoonLevel: 19,
  subclassLevel: 3,

  resources: [
    {
      id: "focus-points", name: "Focus Points", level: 2,
      uses: { column: "focusPoints" },
      recharge: "Short or Long Rest: all",
      cite: "p.50, Level 2: Monk's Focus",
    },
    {
      id: "uncanny-metabolism", name: "Uncanny Metabolism", level: 2,
      uses: { fixed: 1 },
      recharge: "Long Rest",
      cite: "p.51, Level 2: Uncanny Metabolism",
    },
  ],

  choices: [
    { id: "class-skills", level: 1, kind: "skill-proficiency", count: 2, from: "skillChoices", cite: "p.49" },
    { id: "class-tool", level: 1, kind: "tool", count: 1, label: "One type of Artisan's Tools or Musical Instrument", from: ["artisans-tools", "musical-instruments"], cite: "p.49" },
  ],

  effects: [
    { type: "ac-base", level: 1, base: 10, abilities: ["dex", "wis"], requires: "no-armor", shieldAllowed: false, cite: "p.50, Level 1: Unarmored Defense" },
    {
      type: "speed", level: 2, requires: "no-armor-no-shield",
      values: [0, 10, 10, 10, 10, 15, 15, 15, 15, 20, 20, 20, 20, 25, 25, 25, 25, 30, 30, 30],
      cite: "p.50 Unarmored Movement column; p.51, Level 2: Unarmored Movement",
    },
    { type: "save-proficiency", level: 14, abilities: ["str", "dex", "con", "int", "wis", "cha"], cite: "p.52, Level 14: Disciplined Survivor" },
    { type: "ability-increase", level: 20, abilities: { dex: 4, wis: 4 }, max: 25, cite: "p.52, Level 20: Body and Mind" },
  ],

  spellcasting: null,

  subclass: {
    id: "warrior-of-the-open-hand", name: "Warrior of the Open Hand", cite: "p.52",
    features: {
      3: ["Open Hand Technique"],
      6: ["Wholeness of Body"],
      11: ["Fleet Step"],
      17: ["Quivering Palm"],
    },
    resources: [
      {
        id: "wholeness-of-body", name: "Wholeness of Body", level: 6,
        uses: { ability: "wis", min: 1 },
        recharge: "Long Rest",
        cite: "p.52, Level 6: Wholeness of Body",
      },
    ],
    choices: [],
    effects: [],
    todo: [
      "Quivering Palm (level 17) costs 4 Focus Points; 10d12 Force damage on a failed Con save; vibrations last days equal to Monk level (p.52). No effect type.",
      "Wholeness of Body heals Martial Arts die + Wis modifier (minimum 1) (p.52). No effect type.",
    ],
  },

  todo: [
    "Core Monk Traits table (p.49) is jumbled in the extracted text: the Weapon/Tool/Armor headers print on one line followed by 'None'. Read as Armor Training: None; Weapons: Simple weapons and Martial weapons that have the Light property; Tools: one Artisan's Tools or Musical Instrument. Consistent with Unarmored Defense and the starting equipment, but worth a glance at the PDF.",
    "Unarmored Movement requires no armor AND no Shield (p.51); used requires: \"no-armor-no-shield\", a token not in the schema's examples.",
    "Level 1 Hit Points 8 + Con. modifier (p.22) and fixed 5 + Con. modifier per level (p.23): no field in the format; both tables' cells are jumbled in the extracted text and were matched by row order (Barbarian / Fighter-Paladin-Ranger / Bard-Cleric-Druid-Monk-Rogue-Warlock / Sorcerer-Wizard).",
    "Martial Arts (p.50): Monk weapons are Simple Melee weapons and Martial Melee weapons with the Light property; while unarmored and without a Shield, may use Dex instead of Str for attack and damage with Unarmed Strikes and Monk weapons, and for Grapple/Shove save DC; Martial Arts die replaces their damage. No effect type.",
    "Focus save DC = 8 + Wis modifier + Proficiency Bonus (p.50). No effect type.",
    "Attacks per Attack action: 2 at level 5 (Extra Attack, p.52). No effect type.",
    "Focus costs: Flurry of Blows, Patient Defense, Step of the Wind, Stunning Strike, Deflect Attacks redirect and Disciplined Survivor reroll 1 each; Superior Defense 3 (p.50–52). Perfect Focus (level 15) refills to 4 on Initiative if 3 or fewer (p.52).",
    "Deflect Attacks reduces damage by 1d10 + Dex modifier + Monk level; Slow Fall reduces fall damage by 5 × Monk level; Uncanny Metabolism heals Martial Arts die + Monk level (p.51–52). No effect type.",
  ],
};
