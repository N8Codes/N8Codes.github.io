// Fighter, from the System Reference Document 5.2.1 (CC-BY-4.0), p.47–49.
export default {
  id: "fighter",
  name: "Fighter",
  cite: "p.47–49",
  // Class Overview table, p.19
  primaryAbilities: ["str", "dex"],
  primaryJoin: "or",
  complexity: "Low",
  hitDie: 10, // "D10 per Fighter level", p.47
  savingThrows: ["str", "con"],
  skillChoices: {
    count: 2,
    from: ["acrobatics", "animal-handling", "athletics", "history", "insight", "intimidation", "persuasion", "perception", "survival"],
  },
  weapons: { simple: true, martial: true, martialWithProperty: [] },
  weaponsText: "Simple and Martial weapons",
  armor: ["light", "medium", "heavy", "shield"],
  tools: { text: "", choose: 0 },
  startingEquipment: [
    {
      option: "A",
      items: [
        { name: "Chain Mail", qty: 1 },
        { name: "Greatsword", qty: 1 },
        { name: "Flail", qty: 1 },
        { name: "Javelin", qty: 8 },
        { name: "Dungeoneer's Pack", qty: 1 },
      ],
      gp: 4,
    },
    {
      option: "B",
      items: [
        { name: "Studded Leather Armor", qty: 1 },
        { name: "Scimitar", qty: 1 },
        { name: "Shortsword", qty: 1 },
        { name: "Longbow", qty: 1 },
        { name: "Arrow", qty: 20 },
        { name: "Quiver", qty: 1 },
        { name: "Dungeoneer's Pack", qty: 1 },
      ],
      gp: 11,
    },
    { option: "C", items: [], gp: 155 },
  ],
  // Fighter Features table, p.47
  features: {
    1: ["Fighting Style", "Second Wind", "Weapon Mastery"],
    2: ["Action Surge (one use)", "Tactical Mind"],
    3: ["Fighter Subclass"],
    4: ["Ability Score Improvement"],
    5: ["Extra Attack", "Tactical Shift"],
    6: ["Ability Score Improvement"],
    7: ["Subclass feature"],
    8: ["Ability Score Improvement"],
    9: ["Indomitable (one use)", "Tactical Master"],
    10: ["Subclass feature"],
    11: ["Two Extra Attacks"],
    12: ["Ability Score Improvement"],
    13: ["Indomitable (two uses)", "Studied Attacks"],
    14: ["Ability Score Improvement"],
    15: ["Subclass feature"],
    16: ["Ability Score Improvement"],
    17: ["Action Surge (two uses)", "Indomitable (three uses)"],
    18: ["Subclass feature"],
    19: ["Epic Boon"],
    20: ["Three Extra Attacks"],
  },
  columns: {
    secondWind: { label: "Second Wind", values: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] },
    weaponMastery: { label: "Weapon Mastery", values: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6] },
  },
  asiLevels: [4, 6, 8, 12, 14, 16], // p.48, Level 4: Ability Score Improvement
  epicBoonLevel: 19,
  subclassLevel: 3,

  resources: [
    {
      id: "second-wind", name: "Second Wind", level: 1,
      uses: { column: "secondWind" },
      recharge: "Short Rest: one use; Long Rest: all",
      cite: "p.48, Level 1: Second Wind",
    },
    {
      id: "action-surge", name: "Action Surge", level: 2,
      uses: { byLevel: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2] },
      recharge: "Short or Long Rest: all",
      cite: "p.48, Level 2: Action Surge",
    },
    {
      id: "indomitable", name: "Indomitable", level: 9,
      uses: { byLevel: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3] },
      recharge: "Long Rest",
      cite: "p.48, Level 9: Indomitable",
    },
  ],

  choices: [
    { id: "class-skills", level: 1, kind: "skill-proficiency", count: 2, from: "skillChoices", cite: "p.47" },
    { id: "fighting-style", level: 1, kind: "feat", category: "fighting-style", count: 1, cite: "p.47, Level 1: Fighting Style" },
    { id: "weapon-mastery", level: 1, kind: "weapon-mastery", count: { column: "weaponMastery" }, cite: "p.48, Level 1: Weapon Mastery" },
  ],

  effects: [],

  spellcasting: null,

  subclass: {
    id: "champion", name: "Champion", cite: "p.49",
    features: {
      3: ["Improved Critical", "Remarkable Athlete"],
      7: ["Additional Fighting Style"],
      10: ["Heroic Warrior"],
      15: ["Superior Critical"],
      18: ["Survivor"],
    },
    resources: [],
    choices: [
      { id: "additional-fighting-style", level: 7, kind: "feat", category: "fighting-style", count: 1, cite: "p.49, Level 7: Additional Fighting Style" },
    ],
    effects: [],
    todo: [
      "Critical Hit range with weapons and Unarmed Strikes: 19–20 at level 3 (Improved Critical), 18–20 at level 15 (Superior Critical) (p.49). No effect type.",
      "Remarkable Athlete (level 3): Advantage on Initiative rolls and Strength (Athletics) checks (p.49). No effect type for Advantage.",
      "Survivor (level 18): Advantage on Death Saving Throws, 18–20 counts as 20; Heroic Rally regains 5 + Con. modifier HP at turn start while Bloodied (p.49). No effect type.",
    ],
  },

  todo: [
    "The Core Fighter Traits table (p.47) has no Tool Proficiencies row; tools left as empty text with choose 0.",
    "Level 1 Hit Points 10 + Con. modifier (p.22) and fixed 6 + Con. modifier per level (p.23): no field in the format; both tables' cells are jumbled in the extracted text and were matched by row order (Barbarian / Fighter-Paladin-Ranger / Bard-Cleric-Druid-Monk-Rogue-Warlock / Sorcerer-Wizard).",
    "Attacks per Attack action: 2 at level 5, 3 at level 11, 4 at level 20 (p.48). No effect type.",
    "Second Wind heals 1d10 + Fighter level; Tactical Mind spends a Second Wind use for +1d10 to a failed ability check (p.48). No effect type.",
    "Indomitable reroll adds a bonus equal to Fighter level (p.48). No effect type.",
    "Fighting Style feat can be swapped whenever you gain a Fighter level; one Weapon Mastery choice can be changed after each Long Rest (p.47–48).",
  ],
};
