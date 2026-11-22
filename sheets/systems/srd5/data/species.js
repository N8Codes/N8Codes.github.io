// Character Species, SRD 5.2.1 p.83–86. Plain data only: size, speed, trait names, and the
// parts of each trait that set a number, a use count, or a choice on the sheet.
// "level" is character level. Uses "proficiencyBonus" mean "a number of times equal to your Proficiency Bonus".

const LONG = "Long Rest: all";
const SHORT_OR_LONG = "Short or Long Rest: all";

export const SPECIES = [
  {
    id: "dragonborn", name: "Dragonborn", cite: "p.84",
    sizes: ["Medium"], speed: 30, darkvision: 60,
    traits: ["Draconic Ancestry", "Breath Weapon", "Damage Resistance", "Darkvision", "Draconic Flight"],
    choices: [{
      id: "draconic-ancestry", label: "Draconic Ancestry", kind: "option", cite: "p.84",
      // Draconic Ancestors table, p.84
      options: [
        { id: "black", name: "Black (Acid)", resistance: "Acid" },
        { id: "blue", name: "Blue (Lightning)", resistance: "Lightning" },
        { id: "brass", name: "Brass (Fire)", resistance: "Fire" },
        { id: "bronze", name: "Bronze (Lightning)", resistance: "Lightning" },
        { id: "copper", name: "Copper (Acid)", resistance: "Acid" },
        { id: "gold", name: "Gold (Fire)", resistance: "Fire" },
        { id: "green", name: "Green (Poison)", resistance: "Poison" },
        { id: "red", name: "Red (Fire)", resistance: "Fire" },
        { id: "silver", name: "Silver (Cold)", resistance: "Cold" },
        { id: "white", name: "White (Cold)", resistance: "Cold" },
      ],
    }],
    resources: [
      // Breath Weapon, p.84: uses = Proficiency Bonus, regained on a Long Rest.
      { id: "breath-weapon", name: "Breath Weapon", level: 1, uses: { proficiencyBonus: true }, recharge: LONG, cite: "p.84" },
      // Draconic Flight, p.84: from level 5, once per Long Rest.
      { id: "draconic-flight", name: "Draconic Flight", level: 5, uses: { fixed: 1 }, recharge: LONG, cite: "p.84" },
    ],
    // Breath Weapon, p.84: save DC 8 + CON modifier + Proficiency Bonus; 1d10, 2d10 at 5, 3d10 at 11, 4d10 at 17.
    saveDCs: [{ name: "Breath Weapon", ability: "con", damageByLevel: { 1: "1d10", 5: "2d10", 11: "3d10", 17: "4d10" } }],
  },
  {
    id: "dwarf", name: "Dwarf", cite: "p.84",
    sizes: ["Medium"], speed: 30, darkvision: 120,
    traits: ["Darkvision", "Dwarven Resilience", "Dwarven Toughness", "Stonecunning"],
    resistances: ["Poison"],
    // Dwarven Toughness, p.84: HP maximum +1, and +1 again whenever you gain a level.
    effects: [{ type: "hp-bonus", perCharacterLevel: 1, cite: "p.84" }],
    resources: [{ id: "stonecunning", name: "Stonecunning", level: 1, uses: { proficiencyBonus: true }, recharge: LONG, cite: "p.84" }],
  },
  {
    id: "elf", name: "Elf", cite: "p.84–85",
    sizes: ["Medium"], speed: 30, darkvision: 60,
    traits: ["Darkvision", "Elven Lineage", "Fey Ancestry", "Keen Senses", "Trance"],
    choices: [
      {
        id: "elven-lineage", label: "Elven Lineage", kind: "option", cite: "p.85",
        // Elven Lineages table, p.85
        options: [
          { id: "drow", name: "Drow", darkvision: 120, cantrip: "Dancing Lights", spells: { 3: "Faerie Fire", 5: "Darkness" } },
          { id: "high-elf", name: "High Elf", cantrip: "Prestidigitation", spells: { 3: "Detect Magic", 5: "Misty Step" } },
          { id: "wood-elf", name: "Wood Elf", speed: 35, cantrip: "Druidcraft", spells: { 3: "Longstrider", 5: "Pass without Trace" } },
        ],
      },
      { id: "lineage-ability", label: "Spellcasting ability for lineage spells", kind: "ability", options: ["int", "wis", "cha"], cite: "p.85" },
      // Keen Senses, p.85: proficiency in Insight, Perception, or Survival.
      { id: "keen-senses", label: "Keen Senses skill", kind: "skill-proficiency", count: 1, from: ["insight", "perception", "survival"], cite: "p.85" },
    ],
    // Elven Lineage, p.84: each lineage spell can be cast once without a slot per Long Rest.
    resources: [
      { id: "lineage-spell-3", name: "Lineage spell (level 3)", level: 3, uses: { fixed: 1 }, recharge: LONG, cite: "p.84" },
      { id: "lineage-spell-5", name: "Lineage spell (level 5)", level: 5, uses: { fixed: 1 }, recharge: LONG, cite: "p.84" },
    ],
  },
  {
    id: "gnome", name: "Gnome", cite: "p.85",
    sizes: ["Small"], speed: 30, darkvision: 60,
    traits: ["Darkvision", "Gnomish Cunning", "Gnomish Lineage"],
    choices: [
      {
        id: "gnomish-lineage", label: "Gnomish Lineage", kind: "option", cite: "p.85",
        options: [
          { id: "forest-gnome", name: "Forest Gnome", cantrip: "Minor Illusion", alwaysPrepared: "Speak with Animals" },
          { id: "rock-gnome", name: "Rock Gnome", cantrip: "Mending and Prestidigitation" },
        ],
      },
      { id: "lineage-ability", label: "Spellcasting ability for lineage spells", kind: "ability", options: ["int", "wis", "cha"], cite: "p.85" },
    ],
    // Forest Gnome, p.85: Speak with Animals without a slot, Proficiency Bonus times per Long Rest.
    resources: [{ id: "speak-with-animals", name: "Speak with Animals (Forest Gnome)", level: 1, uses: { proficiencyBonus: true },
      recharge: LONG, requiresOption: { choice: "gnomish-lineage", option: "forest-gnome" }, cite: "p.85" }],
  },
  {
    id: "goliath", name: "Goliath", cite: "p.85–86",
    sizes: ["Medium"], speed: 35,
    traits: ["Giant Ancestry", "Large Form", "Powerful Build"],
    choices: [{
      id: "giant-ancestry", label: "Giant Ancestry", kind: "option", cite: "p.85",
      options: [
        { id: "clouds-jaunt", name: "Cloud's Jaunt (Cloud Giant)" },
        { id: "fires-burn", name: "Fire's Burn (Fire Giant)" },
        { id: "frosts-chill", name: "Frost's Chill (Frost Giant)" },
        { id: "hills-tumble", name: "Hill's Tumble (Hill Giant)" },
        { id: "stones-endurance", name: "Stone's Endurance (Stone Giant)" },
        { id: "storms-thunder", name: "Storm's Thunder (Storm Giant)" },
      ],
    }],
    resources: [
      { id: "giant-ancestry", name: "Giant Ancestry", level: 1, uses: { proficiencyBonus: true }, recharge: LONG, cite: "p.85" },
      { id: "large-form", name: "Large Form", level: 5, uses: { fixed: 1 }, recharge: LONG, cite: "p.86" },
    ],
  },
  {
    id: "halfling", name: "Halfling", cite: "p.86",
    sizes: ["Small"], speed: 30,
    traits: ["Brave", "Halfling Nimbleness", "Luck", "Naturally Stealthy"],
  },
  {
    id: "human", name: "Human", cite: "p.86",
    sizes: ["Medium", "Small"], speed: 30,
    traits: ["Resourceful", "Skillful", "Versatile"],
    choices: [
      // Skillful, p.86: proficiency in one skill of your choice.
      { id: "skillful", label: "Skillful skill", kind: "skill-proficiency", count: 1, from: "any", cite: "p.86" },
      // Versatile, p.86: an Origin feat of your choice (Skilled is recommended).
      { id: "versatile", label: "Versatile Origin feat", kind: "feat", category: "origin", count: 1, cite: "p.86" },
    ],
  },
  {
    id: "orc", name: "Orc", cite: "p.86",
    sizes: ["Medium"], speed: 30, darkvision: 120,
    traits: ["Adrenaline Rush", "Darkvision", "Relentless Endurance"],
    resources: [
      // Adrenaline Rush, p.86: Proficiency Bonus uses, all regained on a Short or Long Rest.
      { id: "adrenaline-rush", name: "Adrenaline Rush", level: 1, uses: { proficiencyBonus: true }, recharge: SHORT_OR_LONG, cite: "p.86" },
      { id: "relentless-endurance", name: "Relentless Endurance", level: 1, uses: { fixed: 1 }, recharge: LONG, cite: "p.86" },
    ],
  },
  {
    id: "tiefling", name: "Tiefling", cite: "p.86",
    sizes: ["Medium", "Small"], speed: 30, darkvision: 60,
    traits: ["Darkvision", "Fiendish Legacy", "Otherworldly Presence"],
    choices: [
      {
        id: "fiendish-legacy", label: "Fiendish Legacy", kind: "option", cite: "p.86",
        // Fiendish Legacies table, p.86
        options: [
          { id: "abyssal", name: "Abyssal", resistance: "Poison", cantrip: "Poison Spray", spells: { 3: "Ray of Sickness", 5: "Hold Person" } },
          { id: "chthonic", name: "Chthonic", resistance: "Necrotic", cantrip: "Chill Touch", spells: { 3: "False Life", 5: "Ray of Enfeeblement" } },
          { id: "infernal", name: "Infernal", resistance: "Fire", cantrip: "Fire Bolt", spells: { 3: "Hellish Rebuke", 5: "Darkness" } },
        ],
      },
      { id: "lineage-ability", label: "Spellcasting ability for legacy spells", kind: "ability", options: ["int", "wis", "cha"], cite: "p.86" },
    ],
    resources: [
      { id: "legacy-spell-3", name: "Legacy spell (level 3)", level: 3, uses: { fixed: 1 }, recharge: LONG, cite: "p.86" },
      { id: "legacy-spell-5", name: "Legacy spell (level 5)", level: 5, uses: { fixed: 1 }, recharge: LONG, cite: "p.86" },
    ],
  },
];

export const speciesById = (id) => SPECIES.find((s) => s.id === id);
