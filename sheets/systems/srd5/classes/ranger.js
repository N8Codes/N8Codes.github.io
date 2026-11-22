// Ranger, from the System Reference Document 5.2.1 (CC-BY-4.0), p.57–61.
export default {
  id: "ranger",
  name: "Ranger",
  cite: "p.57–61",
  // Class Overview table, p.19
  primaryAbilities: ["dex", "wis"],
  primaryJoin: "and",
  complexity: "Average",
  hitDie: 10, // "D10 per Ranger level", p.57
  savingThrows: ["str", "dex"],
  skillChoices: {
    count: 3,
    from: ["animal-handling", "athletics", "insight", "investigation", "nature", "perception", "stealth", "survival"],
  },
  weapons: { simple: true, martial: true, martialWithProperty: [] },
  weaponsText: "Simple and Martial weapons",
  armor: ["light", "medium", "shield"],
  tools: { text: "", choose: 0 }, // the Core Ranger Traits table has no Tool Proficiencies row, p.57
  startingEquipment: [
    {
      option: "A",
      items: [
        { name: "Studded Leather Armor", qty: 1 },
        { name: "Scimitar", qty: 1 },
        { name: "Shortsword", qty: 1 },
        { name: "Longbow", qty: 1 },
        { name: "Arrow", qty: 20 },
        { name: "Quiver", qty: 1 },
        { name: "Druidic Focus (sprig of mistletoe)", qty: 1 },
        { name: "Explorer's Pack", qty: 1 },
      ],
      gp: 7,
    },
    { option: "B", items: [], gp: 150 },
  ],
  // Ranger Features table, p.58
  features: {
    1: ["Spellcasting", "Favored Enemy", "Weapon Mastery"],
    2: ["Deft Explorer", "Fighting Style"],
    3: ["Ranger Subclass"],
    4: ["Ability Score Improvement"],
    5: ["Extra Attack"],
    6: ["Roving"],
    7: ["Subclass feature"],
    8: ["Ability Score Improvement"],
    9: ["Expertise"],
    10: ["Tireless"],
    11: ["Subclass feature"],
    12: ["Ability Score Improvement"],
    13: ["Relentless Hunter"],
    14: ["Nature's Veil"],
    15: ["Subclass feature"],
    16: ["Ability Score Improvement"],
    17: ["Precise Hunter"],
    18: ["Feral Senses"],
    19: ["Epic Boon"],
    20: ["Foe Slayer"],
  },
  columns: {
    favoredEnemy: { label: "Favored Enemy", values: [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6] },
    preparedSpells: { label: "Prepared Spells", values: [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15] },
  },
  asiLevels: [4, 8, 12, 16], // p.58 table; p.59, Level 4: Ability Score Improvement
  epicBoonLevel: 19,
  subclassLevel: 3,

  resources: [
    { id: "favored-enemy", name: "Favored Enemy", level: 1,
      uses: { column: "favoredEnemy" },
      recharge: "Long Rest: all",
      cite: "p.58, Level 1: Favored Enemy (Hunter's Mark without a slot)" },
    { id: "tireless", name: "Tireless", level: 10,
      uses: { ability: "wis", min: 1 },
      recharge: "Long Rest: all",
      cite: "p.59, Level 10: Tireless (Temporary Hit Points)" },
    { id: "natures-veil", name: "Nature's Veil", level: 14,
      uses: { ability: "wis", min: 1 },
      recharge: "Long Rest: all",
      cite: "p.59, Level 14: Nature's Veil" },
  ],

  choices: [
    { id: "class-skills", level: 1, kind: "skill-proficiency", count: 3, from: "skillChoices", cite: "p.57" },
    { id: "weapon-mastery", level: 1, kind: "weapon-mastery", filter: "proficient", /* "weapons with which you have proficiency" */ count: 2, cite: "p.58–59, Level 1: Weapon Mastery" },
    { id: "deft-explorer-expertise", level: 2, kind: "skill-expertise", count: 1, from: "proficient-skills", cite: "p.59, Level 2: Deft Explorer" },
    { id: "deft-explorer-languages", level: 2, kind: "language", count: 2, cite: "p.59, Level 2: Deft Explorer" },
    { id: "fighting-style", level: 2, kind: "feat", category: "fighting-style", count: 1, cite: "p.59, Level 2: Fighting Style" },
    { id: "expertise", level: 9, kind: "skill-expertise", count: 2, from: "proficient-skills", cite: "p.59, Level 9: Expertise" },
  ],

  effects: [
    { type: "speed", level: 6, bonus: 10, requires: "no-heavy-armor", cite: "p.59, Level 6: Roving" },
  ],

  spellcasting: {
    ability: "wis", level: 1, cite: "p.57–58, Level 1: Spellcasting",
    cantrips: null,
    prepared: { column: "preparedSpells" },
    // Ranger Features table, p.58: slot levels 1..5 printed, 6..9 always 0
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
    id: "hunter", name: "Hunter", cite: "p.61",
    features: {
      3: ["Hunter's Lore", "Hunter's Prey"],
      7: ["Defensive Tactics"],
      11: ["Superior Hunter's Prey"],
      15: ["Superior Hunter's Defense"],
    },
    resources: [],
    choices: [
      { id: "hunters-prey", level: 3, kind: "option", count: 1, cite: "p.61, Level 3: Hunter's Prey",
        options: [
          { id: "colossus-slayer", name: "Colossus Slayer", effects: [] },
          { id: "horde-breaker", name: "Horde Breaker", effects: [] },
        ] },
      { id: "defensive-tactics", level: 7, kind: "option", count: 1, cite: "p.61, Level 7: Defensive Tactics",
        options: [
          { id: "escape-the-horde", name: "Escape the Horde", effects: [] },
          { id: "multiattack-defense", name: "Multiattack Defense", effects: [] },
        ] },
    ],
    effects: [],
    todo: [
      "Hunter's Prey and Defensive Tactics (p.61): the chosen option can be swapped for the other whenever the player finishes a Short or Long Rest, so the sheet should let it change freely.",
    ],
  },

  todo: [
    "Fighting Style (p.59): instead of a Fighting Style feat the player may take the Druidic Warrior option (two Druid cantrips, Wisdom as their ability, counted as Ranger spells). The 'feat' choice kind can't express that alternative.",
    "Favored Enemy (p.58): Hunter's Mark is always prepared and doesn't count against Prepared Spells; no effect type for always-prepared spells.",
    "Roving (p.59, level 6): also grants a Climb Speed and a Swim Speed equal to your Speed; no effect type for climb/swim speeds.",
    "Feral Senses (p.59, level 18): Blindsight with a range of 30 feet; no effect type for senses.",
    "Tireless (p.59, level 10): the 'tireless' resource counts uses of the Temporary Hit Points action (1d8 + Wisdom modifier, minimum 1 each); Decrease Exhaustion on a Short Rest is not modelled.",
  ],
};
