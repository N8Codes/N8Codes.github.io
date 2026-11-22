// Rogue, from the 3.5 System Reference Document (Open Game Content, OGL 1.0a): Classes II, Rogue.

// "a special ability of her choice from among the following options" … "Feat: A rogue may gain a bonus feat in place of a special ability."
const SPECIAL_ABILITIES = [
  { id: "crippling-strike", name: "Crippling strike" },
  { id: "defensive-roll", name: "Defensive roll" },
  { id: "improved-evasion", name: "Improved evasion" },
  { id: "opportunist", name: "Opportunist" },
  { id: "skill-mastery", name: "Skill mastery" },
  { id: "slippery-mind", name: "Slippery mind" },
  { id: "feat", name: "Feat" },
];
const SA_CITE = "Classes II, Rogue, Special Abilities";

export default {
  id: "rogue",
  name: "Rogue",
  cite: "Classes II, Rogue",
  alignment: { allowed: null, text: "Any" },
  hitDie: 6,
  bab: "average",
  saves: { fort: "poor", ref: "good", will: "poor" },
  skillPoints: 8, // "(8 + Int modifier) x4" at 1st level, "8 + Int modifier" after
  classSkills: ["appraise", "balance", "bluff", "climb", "craft", "decipher-script", "diplomacy", "disable-device", "disguise",
    "escape-artist", "forgery", "gather-information", "hide", "intimidate", "jump", "knowledge-local", "listen",
    "move-silently", "open-lock", "perform", "profession", "search", "sense-motive", "sleight-of-hand", "spot", "swim",
    "tumble", "use-magic-device", "use-rope"],
  proficiencies: {
    // "plus the hand crossbow, rapier, sap, shortbow, and short sword" (Equipment, Table: Weapons names)
    simple: true, martial: false, weapons: ["crossbow-hand", "rapier", "sap", "shortbow", "sword-short"],
    armor: ["light"], shields: "none",
    text: "All simple weapons, plus the hand crossbow, rapier, sap, shortbow, and short sword; light armor; no shields.",
  },
  // Table: The Rogue. bab is the first (highest) attack bonus of the row; "—" in Special → no features.
  table: [
    { bab: 0, fort: 0, ref: 2, will: 0, special: ["Sneak attack +1d6", "Trapfinding"] },
    { bab: 1, fort: 0, ref: 3, will: 0, special: ["Evasion"] },
    { bab: 2, fort: 1, ref: 3, will: 1, special: ["Sneak attack +2d6", "Trap sense +1"] },
    { bab: 3, fort: 1, ref: 4, will: 1, special: ["Uncanny dodge"] },
    { bab: 3, fort: 1, ref: 4, will: 1, special: ["Sneak attack +3d6"] },
    { bab: 4, fort: 2, ref: 5, will: 2, special: ["Trap sense +2"] },
    { bab: 5, fort: 2, ref: 5, will: 2, special: ["Sneak attack +4d6"] },
    { bab: 6, fort: 2, ref: 6, will: 2, special: ["Improved uncanny dodge"] },
    { bab: 6, fort: 3, ref: 6, will: 3, special: ["Sneak attack +5d6", "Trap sense +3"] },
    { bab: 7, fort: 3, ref: 7, will: 3, special: ["Special ability"] },
    { bab: 8, fort: 3, ref: 7, will: 3, special: ["Sneak attack +6d6"] },
    { bab: 9, fort: 4, ref: 8, will: 4, special: ["Trap sense +4"] },
    { bab: 9, fort: 4, ref: 8, will: 4, special: ["Sneak attack +7d6", "Special ability"] },
    { bab: 10, fort: 4, ref: 9, will: 4, special: [] },
    { bab: 11, fort: 5, ref: 9, will: 5, special: ["Sneak attack +8d6", "Trap sense +5"] },
    { bab: 12, fort: 5, ref: 10, will: 5, special: ["Special ability"] },
    { bab: 12, fort: 5, ref: 10, will: 5, special: ["Sneak attack +9d6"] },
    { bab: 13, fort: 6, ref: 11, will: 6, special: ["Trap sense +6"] },
    { bab: 14, fort: 6, ref: 11, will: 6, special: ["Sneak attack +10d6", "Special ability"] },
    { bab: 15, fort: 6, ref: 12, will: 6, special: [] },
  ],
  spells: null,
  bonusFeats: [],
  grantedFeats: [],
  resources: [],
  choices: [
    // "On attaining 10th level, and at every three levels thereafter (13th, 16th, and 19th)"
    { id: "special-ability-10", level: 10, kind: "option", count: 1, label: "Special ability", options: SPECIAL_ABILITIES, cite: SA_CITE },
    { id: "special-ability-13", level: 13, kind: "option", count: 1, label: "Special ability", options: SPECIAL_ABILITIES, cite: SA_CITE },
    { id: "special-ability-16", level: 16, kind: "option", count: 1, label: "Special ability", options: SPECIAL_ABILITIES, cite: SA_CITE },
    { id: "special-ability-19", level: 19, kind: "option", count: 1, label: "Special ability", options: SPECIAL_ABILITIES, cite: SA_CITE },
  ],
  effects: [
    // "1d6 at 1st level, and it increases by 1d6 every two rogue levels thereafter" (as on Table: The Rogue)
    { kind: "sneak-attack",
      byLevel: ["+1d6", "+1d6", "+2d6", "+2d6", "+3d6", "+3d6", "+4d6", "+4d6", "+5d6", "+5d6",
        "+6d6", "+6d6", "+7d6", "+7d6", "+8d6", "+8d6", "+9d6", "+9d6", "+10d6", "+10d6"],
      cite: "Classes II, Table: The Rogue; Rogue, Sneak Attack" },
  ],
  restrictions: [],
  todo: [
    "Trap sense (+1 at 3rd rising to +6 at 18th, on Reflex saves to avoid traps and dodge AC against traps) is conditional and not added; trap sense from several classes stacks.",
    "Choosing \"Feat\" as a special ability gives one bonus feat; the SRD names no list for it, so the feat picker should allow any feat whose prerequisites are met.",
    "Skill mastery picks 3 + Intelligence modifier skills (take 10 under stress) and may be taken more than once; the skill picks are not modelled. The text does not say whether the other special abilities can repeat.",
    "Uncanny dodge from another class turns into improved uncanny dodge, and levels of classes granting uncanny dodge stack for flanking; multiclass interplay is not modelled.",
    "Evasion works only in light or no armor and not when helpless; improved evasion not when helpless; defensive roll is once per day. None of these is computed.",
  ],
};
