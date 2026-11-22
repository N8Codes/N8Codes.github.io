// Druid, from the 3.5 System Reference Document (Open Game Content, OGL 1.0a): Classes I, Druid.
export default {
  id: "druid",
  name: "Druid",
  cite: "Classes I, Druid",
  alignment: {
    allowed: ["Neutral Good", "Lawful Neutral", "Neutral", "Chaotic Neutral", "Neutral Evil"],
    text: "Neutral good, lawful neutral, neutral, chaotic neutral, or neutral evil",
  },
  hitDie: 8,
  bab: "average",
  saves: { fort: "good", ref: "poor", will: "good" },
  skillPoints: 4, // "(4 + Int modifier) x4" at 1st level, "4 + Int modifier" after
  classSkills: [
    "concentration", "craft", "diplomacy", "handle-animal", "heal", "knowledge-nature", "listen",
    "profession", "ride", "spellcraft", "spot", "survival", "swim",
  ],
  proficiencies: {
    // "club, dagger, dart, quarterstaff, scimitar, sickle, shortspear, sling, and spear"
    simple: false, martial: false,
    weapons: ["club", "dagger", "dart", "quarterstaff", "scimitar", "sickle", "shortspear", "sling", "spear"],
    armor: ["light", "medium"], shields: "no-tower",
    text: "Club, dagger, dart, quarterstaff, scimitar, sickle, shortspear, sling, and spear; light and medium armor (no metal: padded, leather, or hide) and shields except tower shields (wooden only).",
  },
  // Table: The Druid. bab is the first (highest) attack bonus of the row.
  table: [
    { bab: 0, fort: 2, ref: 0, will: 2, special: ["Animal companion", "Nature sense", "Wild empathy"] },
    { bab: 1, fort: 3, ref: 0, will: 3, special: ["Woodland stride"] },
    { bab: 2, fort: 3, ref: 1, will: 3, special: ["Trackless step"] },
    { bab: 3, fort: 4, ref: 1, will: 4, special: ["Resist nature’s lure"] },
    { bab: 3, fort: 4, ref: 1, will: 4, special: ["Wild shape (1/day)"] },
    { bab: 4, fort: 5, ref: 2, will: 5, special: ["Wild shape (2/day)"] },
    { bab: 5, fort: 5, ref: 2, will: 5, special: ["Wild shape (3/day)"] },
    { bab: 6, fort: 6, ref: 2, will: 6, special: ["Wild shape (Large)"] },
    { bab: 6, fort: 6, ref: 3, will: 6, special: ["Venom immunity"] },
    { bab: 7, fort: 7, ref: 3, will: 7, special: ["Wild shape (4/day)"] },
    { bab: 8, fort: 7, ref: 3, will: 7, special: ["Wild shape (Tiny)"] },
    { bab: 9, fort: 8, ref: 4, will: 8, special: ["Wild shape (plant)"] },
    { bab: 9, fort: 8, ref: 4, will: 8, special: ["A thousand faces"] },
    { bab: 10, fort: 9, ref: 4, will: 9, special: ["Wild shape (5/day)"] },
    { bab: 11, fort: 9, ref: 5, will: 9, special: ["Timeless body", "Wild shape (Huge)"] },
    { bab: 12, fort: 10, ref: 5, will: 10, special: ["Wild shape (elemental 1/day)"] },
    { bab: 12, fort: 10, ref: 5, will: 10, special: [] },
    { bab: 13, fort: 11, ref: 6, will: 11, special: ["Wild shape (6/day, elemental 2/day)"] },
    { bab: 14, fort: 11, ref: 6, will: 11, special: [] },
    { bab: 15, fort: 12, ref: 6, will: 12, special: ["Wild shape (elemental 3/day, Huge elemental)"] },
  ],
  spells: {
    ability: "wis", kind: "divine", prepares: true, casterLevel: "class",
    // Table: The Druid, Spells per Day.
    perDay: [
      [3, 1, null, null, null, null, null, null, null, null],
      [4, 2, null, null, null, null, null, null, null, null],
      [4, 2, 1, null, null, null, null, null, null, null],
      [5, 3, 2, null, null, null, null, null, null, null],
      [5, 3, 2, 1, null, null, null, null, null, null],
      [5, 3, 3, 2, null, null, null, null, null, null],
      [6, 4, 3, 2, 1, null, null, null, null, null],
      [6, 4, 3, 3, 2, null, null, null, null, null],
      [6, 4, 4, 3, 2, 1, null, null, null, null],
      [6, 4, 4, 3, 3, 2, null, null, null, null],
      [6, 5, 4, 4, 3, 2, 1, null, null, null],
      [6, 5, 4, 4, 3, 3, 2, null, null, null],
      [6, 5, 5, 4, 4, 3, 2, 1, null, null],
      [6, 5, 5, 4, 4, 3, 3, 2, null, null],
      [6, 5, 5, 5, 4, 4, 3, 2, 1, null],
      [6, 5, 5, 5, 4, 4, 3, 3, 2, null],
      [6, 5, 5, 5, 5, 4, 4, 3, 2, 1],
      [6, 5, 5, 5, 5, 4, 4, 3, 3, 2],
      [6, 5, 5, 5, 5, 5, 4, 4, 3, 3],
      [6, 5, 5, 5, 5, 5, 4, 4, 4, 4],
    ],
    known: null,
    cite: "Classes I, Table: The Druid",
    notes: [
      "A druid has no domain spells or granted powers (Classes I, Druid, Spells).",
    ],
  },
  bonusFeats: [],
  grantedFeats: [],
  resources: [
    // "once per day" at 5th; more uses at 6th, 7th, 10th, 14th, and 18th "as noted on Table: The Druid".
    { id: "wild-shape", name: "Wild shape", per: "day", fromLevel: 5, uses: { byLevel: [0, 0, 0, 0, 1, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6] }, cite: "Classes I, Druid, Wild Shape" },
    // Elemental forms: once per day at 16th, twice at 18th, three times at 20th, "in addition to her normal wild shape usage".
    { id: "wild-shape-elemental", name: "Wild shape (elemental)", per: "day", fromLevel: 16, uses: { byLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3] }, cite: "Classes I, Druid, Wild Shape" },
  ],
  choices: [
    // "A druid may begin play with an animal companion selected from the following list"
    { id: "animal-companion", level: 1, kind: "text", count: 1, label: "Animal companion", optional: true, cite: "Classes I, Druid, Animal Companion" },
  ],
  effects: [
    // "A druid gains a +2 bonus on Knowledge (nature) and Survival checks."
    { kind: "skill-bonus", skills: ["knowledge-nature", "survival"], amount: 2, fromLevel: 1, cite: "Classes I, Druid, Nature Sense" },
  ],
  restrictions: [
    { kind: "ex-member-alignment", text: "A druid who changes to a prohibited alignment (or ceases to revere nature, or teaches Druidic to a nondruid) loses all spells and druid abilities and cannot gain druid levels until she atones.", cite: "Classes I, Druid, Ex-Druids" },
  ],
  todo: [
    "Spontaneous casting: a druid can lose a prepared spell to cast a summon nature's ally spell of the same level or lower; not modelled (Classes I, Druid, Spontaneous Casting).",
    "Prohibited armor and shields: only padded, leather or hide armor and wooden shields; wearing metal armor or a metal shield stops druid spells and supernatural or spell-like class abilities for 24 hours. Not checked against the armor worn (Classes I, Druid, Weapon and Armor Proficiency).",
    "Proficiency with the natural attacks of any wild shape form is not modelled (Classes I, Druid, Weapon and Armor Proficiency).",
    "The animal companion's list, its advancement table and the alternative lists from 4th level are not modelled; the companion is a free-text field (Classes I, Druid, Animal Companion; The Druid's Animal Companion).",
    "Druidic is a free bonus language and Sylvan a bonus language option; not added to languages (Classes I, Druid, Bonus Languages).",
    "Wild empathy check = 1d20 + druid level + Cha modifier (-4 for magical beasts with Int 1 or 2); not computed (Classes I, Druid, Wild Empathy).",
    "Resist nature's lure: +4 on saves against the spell-like abilities of fey, conditional (Classes I, Druid, Resist Nature's Lure).",
    "Wild shape form sizes (Small/Medium at 5th, Large at 8th, Tiny at 11th, plant at 12th, Huge at 15th, Huge elemental at 20th) and the form's Hit Dice limit are shown in the table only (Classes I, Druid, Wild Shape).",
    "A druid can't cast spells of an alignment opposed to her own or her deity's; not checked (Classes I, Druid, Chaotic, Evil, Good, and Lawful Spells).",
  ],
};
