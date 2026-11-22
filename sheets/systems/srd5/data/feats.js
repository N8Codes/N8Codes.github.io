// Feats, SRD 5.2.1 p.87–88. Plain data only; names, categories, prerequisites and the
// parts of each benefit that change a number or need a choice on the sheet.

export const FEATS = [
  // Origin feats, p.87
  { id: "alert", name: "Alert", category: "origin", cite: "p.87",
    effects: [{ type: "initiative-bonus", proficiencyBonus: true }] },
  { id: "magic-initiate", name: "Magic Initiate", category: "origin", cite: "p.87", repeatable: true,
    // Two cantrips and one level 1 spell from the Cleric, Druid or Wizard list; INT, WIS or CHA as the ability.
    choices: [
      { id: "list", kind: "option", options: ["Cleric", "Druid", "Wizard"], fixedByBackground: true },
      { id: "ability", kind: "ability", options: ["int", "wis", "cha"] },
      { id: "spells", kind: "text", label: "Two cantrips and one level 1 spell" },
    ] },
  { id: "savage-attacker", name: "Savage Attacker", category: "origin", cite: "p.87" },
  { id: "skilled", name: "Skilled", category: "origin", cite: "p.87", repeatable: true,
    // "proficiency in any combination of three skills or tools of your choice"
    choices: [{ id: "picks", kind: "skill-or-tool", count: 3 }] },

  // General feats, p.87
  { id: "ability-score-improvement", name: "Ability Score Improvement", category: "general", cite: "p.87",
    repeatable: true, prerequisite: { level: 4 },
    // "Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1.
    // This feat can't increase an ability score above 20."
    choices: [{ id: "increase", kind: "ability-increase", patterns: [[2], [1, 1]], cap: 20 }] },
  { id: "grappler", name: "Grappler", category: "general", cite: "p.87",
    prerequisite: { level: 4, anyAbility: { str: 13, dex: 13 } },
    choices: [{ id: "increase", kind: "ability-increase", patterns: [[1]], from: ["str", "dex"], cap: 20 }] },

  // Fighting Style feats, p.87–88 (prerequisite: Fighting Style feature)
  { id: "archery", name: "Archery", category: "fighting-style", cite: "p.87",
    effects: [{ type: "attack-bonus", bonus: 2, weapons: "ranged" }] },
  { id: "defense", name: "Defense", category: "fighting-style", cite: "p.88",
    effects: [{ type: "ac-bonus", bonus: 1, requires: "wearing-armor" }] },
  { id: "great-weapon-fighting", name: "Great Weapon Fighting", category: "fighting-style", cite: "p.88" },
  { id: "two-weapon-fighting", name: "Two-Weapon Fighting", category: "fighting-style", cite: "p.88" },

  // Epic Boon feats, p.88 (prerequisite: level 19+); each raises one score by 1, to a maximum of 30.
  { id: "boon-of-combat-prowess", name: "Boon of Combat Prowess", category: "epic-boon", cite: "p.88",
    prerequisite: { level: 19 }, choices: [{ id: "increase", kind: "ability-increase", patterns: [[1]], cap: 30 }] },
  { id: "boon-of-dimensional-travel", name: "Boon of Dimensional Travel", category: "epic-boon", cite: "p.88",
    prerequisite: { level: 19 }, choices: [{ id: "increase", kind: "ability-increase", patterns: [[1]], cap: 30 }] },
  { id: "boon-of-fate", name: "Boon of Fate", category: "epic-boon", cite: "p.88",
    prerequisite: { level: 19 }, choices: [{ id: "increase", kind: "ability-increase", patterns: [[1]], cap: 30 }] },
  { id: "boon-of-irresistible-offense", name: "Boon of Irresistible Offense", category: "epic-boon", cite: "p.88",
    prerequisite: { level: 19 },
    choices: [{ id: "increase", kind: "ability-increase", patterns: [[1]], from: ["str", "dex"], cap: 30 }] },
  { id: "boon-of-spell-recall", name: "Boon of Spell Recall", category: "epic-boon", cite: "p.88",
    prerequisite: { level: 19, spellcasting: true },
    choices: [{ id: "increase", kind: "ability-increase", patterns: [[1]], from: ["int", "wis", "cha"], cap: 30 }] },
  { id: "boon-of-the-night-spirit", name: "Boon of the Night Spirit", category: "epic-boon", cite: "p.88",
    prerequisite: { level: 19 }, choices: [{ id: "increase", kind: "ability-increase", patterns: [[1]], cap: 30 }] },
  { id: "boon-of-truesight", name: "Boon of Truesight", category: "epic-boon", cite: "p.88",
    prerequisite: { level: 19 }, choices: [{ id: "increase", kind: "ability-increase", patterns: [[1]], cap: 30 }] },
];

export const featById = (id) => FEATS.find((f) => f.id === id);
