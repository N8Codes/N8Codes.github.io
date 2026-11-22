// Character Backgrounds, SRD 5.2.1 p.83. Plain data only.
// Each background: three abilities for the +2/+1 or +1/+1/+1 increase (p.83 "Ability Scores"),
// an Origin feat, two skills, one tool, and a choice of equipment package A or 50 GP.

export const BACKGROUNDS = [
  {
    id: "acolyte", name: "Acolyte", cite: "p.83",
    abilities: ["int", "wis", "cha"],
    feat: { id: "magic-initiate", variant: "Cleric" },
    skills: ["insight", "religion"],
    tool: { fixed: "Calligrapher's Supplies" },
    equipment: [
      { option: "A", items: [{ name: "Calligrapher's Supplies", qty: 1 }, { name: "Book (prayers)", qty: 1 },
        { name: "Holy Symbol", qty: 1 }, { name: "Parchment (sheets)", qty: 10 }, { name: "Robe", qty: 1 }], gp: 8 },
      { option: "B", items: [], gp: 50 },
    ],
  },
  {
    id: "criminal", name: "Criminal", cite: "p.83",
    abilities: ["dex", "con", "int"],
    feat: { id: "alert" },
    skills: ["sleight-of-hand", "stealth"],
    tool: { fixed: "Thieves' Tools" },
    equipment: [
      { option: "A", items: [{ name: "Dagger", qty: 2 }, { name: "Thieves' Tools", qty: 1 }, { name: "Crowbar", qty: 1 },
        { name: "Pouch", qty: 2 }, { name: "Traveler's Clothes", qty: 1 }], gp: 16 },
      { option: "B", items: [], gp: 50 },
    ],
  },
  {
    id: "sage", name: "Sage", cite: "p.83",
    abilities: ["con", "int", "wis"],
    feat: { id: "magic-initiate", variant: "Wizard" },
    skills: ["arcana", "history"],
    tool: { fixed: "Calligrapher's Supplies" },
    equipment: [
      { option: "A", items: [{ name: "Quarterstaff", qty: 1 }, { name: "Calligrapher's Supplies", qty: 1 },
        { name: "Book (history)", qty: 1 }, { name: "Parchment (sheets)", qty: 8 }, { name: "Robe", qty: 1 }], gp: 8 },
      { option: "B", items: [], gp: 50 },
    ],
  },
  {
    id: "soldier", name: "Soldier", cite: "p.83",
    abilities: ["str", "dex", "con"],
    feat: { id: "savage-attacker" },
    skills: ["athletics", "intimidation"],
    // "Choose one kind of Gaming Set"; package A's Gaming Set is "same as above".
    tool: { choose: "gaming-set" },
    equipment: [
      { option: "A", items: [{ name: "Spear", qty: 1 }, { name: "Shortbow", qty: 1 }, { name: "Arrows", qty: 20 },
        { name: "Gaming Set (same as tool)", qty: 1 }, { name: "Healer's Kit", qty: 1 }, { name: "Quiver", qty: 1 },
        { name: "Traveler's Clothes", qty: 1 }], gp: 14 },
      { option: "B", items: [], gp: 50 },
    ],
  },
];
