// Fighter, from the 3.5 System Reference Document (Open Game Content, OGL 1.0a): Classes I, Fighter.
export default {
  id: "fighter",
  name: "Fighter",
  cite: "Classes I, Fighter",
  alignment: { allowed: null, text: "Any" },
  hitDie: 10,
  bab: "good",
  saves: { fort: "good", ref: "poor", will: "poor" },
  skillPoints: 2, // "(2 + Int modifier) x4" at 1st level, "2 + Int modifier" after
  classSkills: ["climb", "craft", "handle-animal", "intimidate", "jump", "ride", "swim"],
  proficiencies: {
    simple: true, martial: true, weapons: [],
    armor: ["light", "medium", "heavy"], shields: "all",
    text: "All simple and martial weapons, all armor (heavy, medium, and light) and shields (including tower shields).",
  },
  // Table: The Fighter. bab is the first (highest) attack bonus of the row.
  table: [
    { bab: 1, fort: 2, ref: 0, will: 0, special: ["Bonus feat"] },
    { bab: 2, fort: 3, ref: 0, will: 0, special: ["Bonus feat"] },
    { bab: 3, fort: 3, ref: 1, will: 1, special: [] },
    { bab: 4, fort: 4, ref: 1, will: 1, special: ["Bonus feat"] },
    { bab: 5, fort: 4, ref: 1, will: 1, special: [] },
    { bab: 6, fort: 5, ref: 2, will: 2, special: ["Bonus feat"] },
    { bab: 7, fort: 5, ref: 2, will: 2, special: [] },
    { bab: 8, fort: 6, ref: 2, will: 2, special: ["Bonus feat"] },
    { bab: 9, fort: 6, ref: 3, will: 3, special: [] },
    { bab: 10, fort: 7, ref: 3, will: 3, special: ["Bonus feat"] },
    { bab: 11, fort: 7, ref: 3, will: 3, special: [] },
    { bab: 12, fort: 8, ref: 4, will: 4, special: ["Bonus feat"] },
    { bab: 13, fort: 8, ref: 4, will: 4, special: [] },
    { bab: 14, fort: 9, ref: 4, will: 4, special: ["Bonus feat"] },
    { bab: 15, fort: 9, ref: 5, will: 5, special: [] },
    { bab: 16, fort: 10, ref: 5, will: 5, special: ["Bonus feat"] },
    { bab: 17, fort: 10, ref: 5, will: 5, special: [] },
    { bab: 18, fort: 11, ref: 6, will: 6, special: ["Bonus feat"] },
    { bab: 19, fort: 11, ref: 6, will: 6, special: [] },
    { bab: 20, fort: 12, ref: 6, will: 6, special: ["Bonus feat"] },
  ],
  spells: null,
  // "Bonus Feats: At 1st level … and every two fighter levels thereafter … drawn from the feats noted as
  // fighter bonus feats. A fighter must still meet all prerequisites."
  bonusFeats: [
    { levels: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20], from: { type: "fighter" }, ignorePrereqs: false, label: "Fighter bonus feat", cite: "Classes I, Fighter, Bonus Feats" },
  ],
  grantedFeats: [],
  resources: [],
  choices: [],
  effects: [],
  restrictions: [],
  todo: [],
};
