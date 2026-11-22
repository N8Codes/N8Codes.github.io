// Wizard, from the 3.5 System Reference Document (Open Game Content, OGL 1.0a): Classes II, Wizard; School Specialization.

// "The eight schools of arcane magic are abjuration, conjuration, divination, enchantment, evocation, illusion, necromancy, and transmutation."
const SCHOOLS = [
  { id: "abjuration", name: "Abjuration" },
  { id: "conjuration", name: "Conjuration" },
  { id: "divination", name: "Divination" },
  { id: "enchantment", name: "Enchantment" },
  { id: "evocation", name: "Evocation" },
  { id: "illusion", name: "Illusion" },
  { id: "necromancy", name: "Necromancy" },
  { id: "transmutation", name: "Transmutation" },
];

export default {
  id: "wizard",
  name: "Wizard",
  cite: "Classes II, Wizard",
  alignment: { allowed: null, text: "Any" },
  hitDie: 4,
  bab: "poor",
  saves: { fort: "poor", ref: "poor", will: "good" },
  skillPoints: 2, // "(2 + Int modifier) x4" at 1st level, "2 + Int modifier" after
  classSkills: ["concentration", "craft", "decipher-script", "knowledge", "profession", "spellcraft"],
  proficiencies: {
    // "the club, dagger, heavy crossbow, light crossbow, and quarterstaff" (Equipment, Table: Weapons names)
    simple: false, martial: false, weapons: ["club", "dagger", "crossbow-heavy", "crossbow-light", "quarterstaff"],
    armor: [], shields: "none",
    text: "Club, dagger, heavy crossbow, light crossbow, and quarterstaff; no armor or shields.",
  },
  // Table: The Wizard. bab is the first (highest) attack bonus of the row.
  table: [
    { bab: 0, fort: 0, ref: 0, will: 2, special: ["Summon familiar", "Scribe Scroll"] },
    { bab: 1, fort: 0, ref: 0, will: 3, special: [] },
    { bab: 1, fort: 1, ref: 1, will: 3, special: [] },
    { bab: 2, fort: 1, ref: 1, will: 4, special: [] },
    { bab: 2, fort: 1, ref: 1, will: 4, special: ["Bonus feat"] },
    { bab: 3, fort: 2, ref: 2, will: 5, special: [] },
    { bab: 3, fort: 2, ref: 2, will: 5, special: [] },
    { bab: 4, fort: 2, ref: 2, will: 6, special: [] },
    { bab: 4, fort: 3, ref: 3, will: 6, special: [] },
    { bab: 5, fort: 3, ref: 3, will: 7, special: ["Bonus feat"] },
    { bab: 5, fort: 3, ref: 3, will: 7, special: [] },
    { bab: 6, fort: 4, ref: 4, will: 8, special: [] },
    { bab: 6, fort: 4, ref: 4, will: 8, special: [] },
    { bab: 7, fort: 4, ref: 4, will: 9, special: [] },
    { bab: 7, fort: 5, ref: 5, will: 9, special: ["Bonus feat"] },
    { bab: 8, fort: 5, ref: 5, will: 10, special: [] },
    { bab: 8, fort: 5, ref: 5, will: 10, special: [] },
    { bab: 9, fort: 6, ref: 6, will: 11, special: [] },
    { bab: 9, fort: 6, ref: 6, will: 11, special: [] },
    { bab: 10, fort: 6, ref: 6, will: 12, special: ["Bonus feat"] },
  ],
  spells: {
    ability: "int", kind: "arcane", prepares: true,
    casterLevel: "class",
    // Table: The Wizard, Spells per Day (0–9th).
    perDay: [
      [3, 1, null, null, null, null, null, null, null, null],
      [4, 2, null, null, null, null, null, null, null, null],
      [4, 2, 1, null, null, null, null, null, null, null],
      [4, 3, 2, null, null, null, null, null, null, null],
      [4, 3, 2, 1, null, null, null, null, null, null],
      [4, 3, 3, 2, null, null, null, null, null, null],
      [4, 4, 3, 2, 1, null, null, null, null, null],
      [4, 4, 3, 3, 2, null, null, null, null, null],
      [4, 4, 4, 3, 2, 1, null, null, null, null],
      [4, 4, 4, 3, 3, 2, null, null, null, null],
      [4, 4, 4, 4, 3, 2, 1, null, null, null],
      [4, 4, 4, 4, 3, 3, 2, null, null, null],
      [4, 4, 4, 4, 4, 3, 2, 1, null, null],
      [4, 4, 4, 4, 4, 3, 3, 2, null, null],
      [4, 4, 4, 4, 4, 4, 3, 2, 1, null],
      [4, 4, 4, 4, 4, 4, 3, 3, 2, null],
      [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],
      [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],
      [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    ],
    known: null,
    cite: "Classes II, Table: The Wizard; Wizard, Spells; School Specialization",
    notes: [
      "A specialist wizard can prepare one additional spell of her specialty school per spell level each day.",
      "Spellbook: all 0-level spells (except prohibited schools) plus three 1st-level spells, one more 1st-level spell per point of Intelligence bonus, and two new spells at each wizard level.",
    ],
  },
  // "At 5th, 10th, 15th, and 20th level … she can choose a metamagic feat, an item creation feat, or Spell Mastery.
  // The wizard must still meet all prerequisites for a bonus feat, including caster level minimums."
  bonusFeats: [
    { levels: [5, 10, 15, 20], from: { types: ["metamagic", "item-creation"], feats: ["spell-mastery"] }, ignorePrereqs: false,
      label: "Wizard bonus feat", cite: "Classes II, Wizard, Bonus Feats" },
  ],
  grantedFeats: [
    { level: 1, feat: "scribe-scroll", cite: "Classes II, Wizard, Scribe Scroll" },
  ],
  resources: [],
  choices: [
    // "The wizard must choose whether to specialize and, if she does so, choose her specialty at 1st level."
    { id: "specialization", level: 1, kind: "option", count: 1, label: "Specialty school", optional: true, options: SCHOOLS,
      cite: "Classes II, School Specialization" },
    // "she must also give up two other schools of magic … A wizard can never give up divination to fulfill this requirement."
    { id: "prohibited-schools", level: 1, kind: "option", count: 2, label: "Prohibited schools", optional: true,
      options: [SCHOOLS[0], SCHOOLS[1], SCHOOLS[3], SCHOOLS[4], SCHOOLS[5], SCHOOLS[6], SCHOOLS[7]], // every school but divination
      cite: "Classes II, School Specialization" },
    // "A wizard can obtain a familiar in exactly the same manner as a sorcerer can."
    { id: "familiar", level: 1, kind: "text", count: 1, label: "Familiar", optional: true, cite: "Classes II, Wizard, Familiar; Familiars" },
  ],
  effects: [],
  restrictions: [],
  todo: [
    "Prohibited schools apply only to a specialist, must not include the specialty school, and a divination specialist gives up only one school (count 1, not 2). Neither school choice can change later.",
    "A specialist gets +2 on Spellcraft checks to learn spells of her specialty school (conditional, not added).",
    "Prohibited-school spells are unavailable (not even from scrolls or wands); no spell list is modelled yet.",
    "Bonus languages: a wizard may substitute Draconic for one of her race's bonus languages.",
    "Familiar: the master's bonus from the familiar's kind applies only within 1 mile and is not added; familiar abilities by master level are not modelled.",
    "Armor causes arcane spell failure for spells with somatic components; not modelled here.",
  ],
};
