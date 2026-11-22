// Monk, from the 3.5 System Reference Document (Open Game Content, OGL 1.0a): Classes I, Monk.
export default {
  id: "monk",
  name: "Monk",
  cite: "Classes I, Monk",
  alignment: { allowed: ["Lawful Good", "Lawful Neutral", "Lawful Evil"], text: "Any lawful" },
  hitDie: 8,
  bab: "average",
  saves: { fort: "good", ref: "good", will: "good" },
  skillPoints: 4, // "(4 + Int modifier) x4" at 1st level, "4 + Int modifier" after
  classSkills: [
    "balance", "climb", "concentration", "craft", "diplomacy", "escape-artist", "hide", "jump",
    "knowledge-arcana", "knowledge-religion", "listen", "move-silently", "perform", "profession",
    "sense-motive", "spot", "swim", "tumble",
  ],
  proficiencies: {
    // "club, crossbow (light or heavy), dagger, handaxe, javelin, kama, nunchaku, quarterstaff, sai, shuriken, siangham, and sling"
    // Shuriken is printed "Shuriken (5)" in Equipment, Table: Weapons, hence the id.
    simple: false, martial: false,
    weapons: ["club", "crossbow-light", "crossbow-heavy", "dagger", "handaxe", "javelin", "kama", "nunchaku", "quarterstaff", "sai", "shuriken", "siangham", "sling"],
    armor: [], shields: "none",
    text: "Club, crossbow (light or heavy), dagger, handaxe, javelin, kama, nunchaku, quarterstaff, sai, shuriken, siangham, and sling. No armor or shields.",
  },
  // Table: The Monk. bab is the first (highest) attack bonus of the row.
  table: [
    { bab: 0, fort: 2, ref: 2, will: 2, special: ["Bonus feat", "Flurry of blows", "Unarmed strike"] },
    { bab: 1, fort: 3, ref: 3, will: 3, special: ["Bonus feat", "Evasion"] },
    { bab: 2, fort: 3, ref: 3, will: 3, special: ["Still mind"] },
    { bab: 3, fort: 4, ref: 4, will: 4, special: ["Ki strike (magic)", "Slow fall 20 ft."] },
    { bab: 3, fort: 4, ref: 4, will: 4, special: ["Purity of body"] },
    { bab: 4, fort: 5, ref: 5, will: 5, special: ["Bonus feat", "Slow fall 30 ft."] },
    { bab: 5, fort: 5, ref: 5, will: 5, special: ["Wholeness of body"] },
    { bab: 6, fort: 6, ref: 6, will: 6, special: ["Slow fall 40 ft."] },
    { bab: 6, fort: 6, ref: 6, will: 6, special: ["Improved evasion"] },
    { bab: 7, fort: 7, ref: 7, will: 7, special: ["Ki strike (lawful)", "Slow fall 50 ft."] },
    { bab: 8, fort: 7, ref: 7, will: 7, special: ["Diamond body", "Greater flurry"] },
    { bab: 9, fort: 8, ref: 8, will: 8, special: ["Abundant step", "Slow fall 60 ft."] },
    { bab: 9, fort: 8, ref: 8, will: 8, special: ["Diamond soul"] },
    { bab: 10, fort: 9, ref: 9, will: 9, special: ["Slow fall 70 ft."] },
    { bab: 11, fort: 9, ref: 9, will: 9, special: ["Quivering palm"] },
    { bab: 12, fort: 10, ref: 10, will: 10, special: ["Ki strike (adamantine)", "Slow fall 80 ft."] },
    { bab: 12, fort: 10, ref: 10, will: 10, special: ["Timeless body", "Tongue of the sun and moon"] },
    { bab: 13, fort: 11, ref: 11, will: 11, special: ["Slow fall 90 ft."] },
    { bab: 14, fort: 11, ref: 11, will: 11, special: ["Empty body"] },
    { bab: 15, fort: 12, ref: 12, will: 12, special: ["Perfect self", "Slow fall any distance"] },
  ],
  spells: null,
  // "At 1st level, a monk may select either Improved Grapple or Stunning Fist … At 2nd level … Combat Reflexes or
  // Deflect Arrows … At 6th level … Improved Disarm or Improved Trip … A monk need not have any of the prerequisites"
  bonusFeats: [
    { levels: [1], from: { feats: ["improved-grapple", "stunning-fist"] }, ignorePrereqs: true, label: "Monk bonus feat", cite: "Classes I, Monk, Bonus Feat" },
    { levels: [2], from: { feats: ["combat-reflexes", "deflect-arrows"] }, ignorePrereqs: true, label: "Monk bonus feat", cite: "Classes I, Monk, Bonus Feat" },
    { levels: [6], from: { feats: ["improved-disarm", "improved-trip"] }, ignorePrereqs: true, label: "Monk bonus feat", cite: "Classes I, Monk, Bonus Feat" },
  ],
  // "At 1st level, a monk gains Improved Unarmed Strike as a bonus feat."
  grantedFeats: [
    { level: 1, feat: "improved-unarmed-strike", cite: "Classes I, Monk, Unarmed Strike" },
  ],
  resources: [
    // "as if using the spell dimension door, once per day"
    { id: "abundant-step", name: "Abundant step", per: "day", fromLevel: 12, uses: { byLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1] }, cite: "Classes I, Monk, Abundant Step" },
    // "She can use this quivering palm attack once a week"
    { id: "quivering-palm", name: "Quivering palm", per: "week", fromLevel: 15, uses: { byLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1] }, cite: "Classes I, Monk, Quivering Palm" },
    // "the total number of rounds spent in an ethereal state does not exceed her monk level" (per day)
    { id: "empty-body", name: "Empty body (rounds)", per: "day", fromLevel: 19, uses: { classLevel: true }, cite: "Classes I, Monk, Empty Body" },
  ],
  choices: [],
  effects: [
    // "When unarmored and unencumbered, the monk adds her Wisdom bonus (if any) to her AC."
    { kind: "ac-ability", ability: "wis", when: "unarmored", fromLevel: 1, cite: "Classes I, Monk, AC Bonus" },
    // Table: The Monk, AC Bonus column.
    { kind: "ac-bonus", byLevel: [0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4], when: "unarmored", cite: "Classes I, Table: The Monk; Monk, AC Bonus" },
    // Table: The Monk, Unarmored Speed Bonus column (ft.).
    { kind: "speed", byLevel: [0, 0, 10, 10, 10, 20, 20, 20, 30, 30, 30, 40, 40, 40, 50, 50, 50, 60, 60, 60], when: "unarmored", cite: "Classes I, Table: The Monk; Monk, Fast Movement" },
    // Table: The Monk, Unarmed Damage column (Medium monks, footnote 1).
    { kind: "unarmed-damage", byLevel: ["1d6", "1d6", "1d6", "1d8", "1d8", "1d8", "1d8", "1d10", "1d10", "1d10", "1d10", "2d6", "2d6", "2d6", "2d6", "2d8", "2d8", "2d8", "2d8", "2d10"], cite: "Classes I, Table: The Monk" },
    // Table: Small or Large Monk Unarmed Damage, Small column: 1st–3rd 1d4, 4th–7th 1d6, 8th–11th 1d8,
    // 12th–15th 1d10, 16th–19th 2d6, 20th 2d8.
    { kind: "unarmed-damage-small", byLevel: ["1d4", "1d4", "1d4", "1d6", "1d6", "1d6", "1d6", "1d8", "1d8", "1d8", "1d8", "1d10", "1d10", "1d10", "1d10", "2d6", "2d6", "2d6", "2d6", "2d8"], cite: "Classes I, Table: Small or Large Monk Unarmed Damage" },
    // Table: The Monk, Flurry of Blows Attack Bonus column (the SRD's en-dash minus written as "-").
    { kind: "flurry", byLevel: ["-2/-2", "-1/-1", "+0/+0", "+1/+1", "+2/+2", "+3/+3", "+4/+4", "+5/+5/+0", "+6/+6/+1", "+7/+7/+2", "+8/+8/+8/+3", "+9/+9/+9/+4", "+9/+9/+9/+4", "+10/+10/+10/+5", "+11/+11/+11/+6/+1", "+12/+12/+12/+7/+2", "+12/+12/+12/+7/+2", "+13/+13/+13/+8/+3", "+14/+14/+14/+9/+4", "+15/+15/+15/+10/+5"], cite: "Classes I, Table: The Monk; Monk, Flurry of Blows" },
  ],
  restrictions: [
    { kind: "ex-member-alignment", text: "A monk who becomes nonlawful cannot gain new levels as a monk but retains all monk abilities.", cite: "Classes I, Monk, Ex-Monks" },
    { kind: "no-new-levels-after-other-class", text: "A monk who gains a new class or (if already multiclass) raises another class by a level may never again raise her monk level, though she retains all her monk abilities.", cite: "Classes I, Monk, Ex-Monks" },
  ],
  todo: [
    "AC bonus, fast movement and flurry of blows are also lost when using a shield or carrying a medium or heavy load, and the AC bonuses are lost when immobilized or helpless; the effects only check \"unarmored\" (Classes I, Monk, Weapon and Armor Proficiency; AC Bonus; Fast Movement).",
    "The Wisdom bonus to AC applies only if positive (\"her Wisdom bonus (if any)\"); the ac-ability effect must not subtract a penalty (Classes I, Monk, AC Bonus).",
    "Flurry of blows: only unarmed strikes or special monk weapons (kama, nunchaku, quarterstaff, sai, shuriken, siangham), full attack action, Strength bonus (not x1-1/2 or x1/2) on damage; not checked (Classes I, Monk, Flurry of Blows).",
    "Large monk unarmed damage (Table: Small or Large Monk Unarmed Damage, Large column) is not stored: no player race in the SRD is Large.",
    "Still mind: +2 on saves against enchantment spells and effects, conditional (Classes I, Monk, Still Mind).",
    "Wholeness of body heals up to twice the monk level in hit points per day, split as she likes; no pool kind fits (Classes I, Monk, Wholeness of Body).",
    "Diamond soul: spell resistance = monk level + 10 from 13th; not computed (Classes I, Monk, Diamond Soul).",
    "Quivering palm save DC = 10 + 1/2 monk level + Wis modifier; not computed (Classes I, Monk, Quivering Palm).",
    "Abundant step caster level is half the monk level (rounded down); not computed (Classes I, Monk, Abundant Step).",
    "Perfect self: damage reduction 10/magic and outsider type at 20th, shown in the table only (Classes I, Monk, Perfect Self).",
    "Ki strike, slow fall, evasion, improved evasion, purity of body, diamond body, timeless body and tongue of the sun and moon are shown in the table only (Classes I, Monk).",
  ],
};
