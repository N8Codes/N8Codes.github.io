// Barbarian, from the 3.5 System Reference Document (Open Game Content, OGL 1.0a): Classes I, Barbarian.
export default {
  id: "barbarian",
  name: "Barbarian",
  cite: "Classes I, Barbarian",
  alignment: {
    allowed: ["Neutral Good", "Chaotic Good", "Neutral", "Chaotic Neutral", "Neutral Evil", "Chaotic Evil"],
    text: "Any nonlawful",
  },
  hitDie: 12,
  bab: "good",
  saves: { fort: "good", ref: "poor", will: "poor" },
  skillPoints: 4, // "(4 + Int modifier) x4" at 1st level, "4 + Int modifier" after
  classSkills: ["climb", "craft", "handle-animal", "intimidate", "jump", "listen", "ride", "survival", "swim"],
  proficiencies: {
    simple: true, martial: true, weapons: [],
    armor: ["light", "medium"], shields: "no-tower",
    text: "All simple and martial weapons, light armor, medium armor, and shields (except tower shields).",
  },
  // Table: The Barbarian. bab is the first (highest) attack bonus of the row.
  table: [
    { bab: 1, fort: 2, ref: 0, will: 0, special: ["Fast movement", "Illiteracy", "Rage 1/day"] },
    { bab: 2, fort: 3, ref: 0, will: 0, special: ["Uncanny dodge"] },
    { bab: 3, fort: 3, ref: 1, will: 1, special: ["Trap sense +1"] },
    { bab: 4, fort: 4, ref: 1, will: 1, special: ["Rage 2/day"] },
    { bab: 5, fort: 4, ref: 1, will: 1, special: ["Improved uncanny dodge"] },
    { bab: 6, fort: 5, ref: 2, will: 2, special: ["Trap sense +2"] },
    { bab: 7, fort: 5, ref: 2, will: 2, special: ["Damage reduction 1/—"] },
    { bab: 8, fort: 6, ref: 2, will: 2, special: ["Rage 3/day"] },
    { bab: 9, fort: 6, ref: 3, will: 3, special: ["Trap sense +3"] },
    { bab: 10, fort: 7, ref: 3, will: 3, special: ["Damage reduction 2/—"] },
    { bab: 11, fort: 7, ref: 3, will: 3, special: ["Greater rage"] },
    { bab: 12, fort: 8, ref: 4, will: 4, special: ["Rage 4/day", "Trap sense +4"] },
    { bab: 13, fort: 8, ref: 4, will: 4, special: ["Damage reduction 3/—"] },
    { bab: 14, fort: 9, ref: 4, will: 4, special: ["Indomitable will"] },
    { bab: 15, fort: 9, ref: 5, will: 5, special: ["Trap sense +5"] },
    { bab: 16, fort: 10, ref: 5, will: 5, special: ["Damage reduction 4/—", "Rage 5/day"] },
    { bab: 17, fort: 10, ref: 5, will: 5, special: ["Tireless rage"] },
    { bab: 18, fort: 11, ref: 6, will: 6, special: ["Trap sense +6"] },
    { bab: 19, fort: 11, ref: 6, will: 6, special: ["Damage reduction 5/—"] },
    { bab: 20, fort: 12, ref: 6, will: 6, special: ["Mighty rage", "Rage 6/day"] },
  ],
  spells: null,
  bonusFeats: [],
  grantedFeats: [],
  // "At 1st level he can use his rage ability once per day. At 4th level and every four levels thereafter,
  // he can use it one additional time per day (to a maximum of six times per day at 20th level)."
  resources: [
    { id: "rage", name: "Rage", per: "day", fromLevel: 1, uses: { byLevel: [1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6] }, cite: "Classes I, Barbarian, Rage" },
  ],
  choices: [],
  effects: [
    // "+10 feet … only when he is wearing no armor, light armor, or medium armor and not carrying a heavy load."
    { kind: "speed", byLevel: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], when: "not-heavy-armor", cite: "Classes I, Barbarian, Fast Movement" },
  ],
  restrictions: [
    { kind: "ex-member-alignment", text: "A barbarian who becomes lawful loses the ability to rage and cannot gain more levels as a barbarian; he keeps his other class benefits.", cite: "Classes I, Barbarian, Ex-Barbarians" },
  ],
  todo: [
    "Illiteracy: a barbarian cannot read or write until he spends 2 skill points to gain literacy in all languages he speaks; a level in any other class grants literacy automatically (Classes I, Barbarian, Illiteracy).",
    "Fast movement is also lost while carrying a heavy load; the speed effect only checks armor (Classes I, Barbarian, Fast Movement).",
    "Rage numbers are not applied: +4 Str, +4 Con, +2 morale on Will saves, -2 AC (greater rage +6/+6/+3 at 11th, mighty rage +8/+8/+4 at 20th), lasting 3 + the raised Con modifier rounds, fatigued afterwards until 17th level (Classes I, Barbarian, Rage, Greater Rage, Mighty Rage, Tireless Rage).",
    "Trap sense (+1 at 3rd, +1 per three levels after, to Reflex saves and dodge AC against traps) is conditional and not added to totals (Classes I, Barbarian, Trap Sense).",
    "Damage reduction (1/— at 7th, +1 at 10th, 13th, 16th and 19th) is shown in the table only (Classes I, Barbarian, Damage Reduction).",
    "Uncanny dodge from two classes becomes improved uncanny dodge, and the levels stack for flanking; not modelled (Classes I, Barbarian, Uncanny Dodge, Improved Uncanny Dodge).",
    "Indomitable will: +4 on Will saves against enchantment spells while raging, conditional (Classes I, Barbarian, Indomitable Will).",
  ],
};
