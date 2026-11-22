// The seven races of the 3.5 System Reference Document (Open Game Content, OGL 1.0a): Races.
// Only unconditional numbers are effects; everything situational is listed as a trait for the player.

// Skills II, Speak Language: Common Languages and Their Alphabets ("Druidic" is the druids' secret language).
export const LANGUAGES = ["Abyssal", "Aquan", "Auran", "Celestial", "Common", "Draconic", "Druidic", "Dwarven", "Elven",
  "Giant", "Gnome", "Goblin", "Gnoll", "Halfling", "Ignan", "Infernal", "Orc", "Sylvan", "Terran", "Undercommon"];
export const SECRET_LANGUAGES = ["Druidic"];
// Races, Class-Related Languages: these classes may pick these as bonus languages whatever their race.
export const CLASS_LANGUAGES = { cleric: ["Abyssal", "Celestial", "Infernal"], druid: ["Sylvan"], wizard: ["Draconic"] };

const ANY = "any";

export const RACES = [
  {
    id: "human", name: "Human", cite: "Races, Humans",
    abilities: {}, size: "Medium", speed: 30,
    bonusFeat: true,         // "1 extra feat at 1st level"
    bonusSkillPoints: true,  // "4 extra skill points at 1st level and 1 extra skill point at each additional level"
    languages: ["Common"], bonusLanguages: ANY,
    favoredClass: "highest", favoredText: "Any (the highest-level class)",
    skillBonuses: {}, saveBonus: 0, darkvision: 0, lowLight: false,
    weaponFamiliarity: [], bonusWeapons: [],
    traits: [],
  },
  {
    id: "dwarf", name: "Dwarf", cite: "Races, Dwarves",
    abilities: { con: 2, cha: -2 }, size: "Medium", speed: 20,
    // "dwarves can move at this speed even when wearing medium or heavy armor or when carrying a medium or heavy load"
    noArmorSlowdown: true,
    languages: ["Common", "Dwarven"], bonusLanguages: ["Giant", "Gnome", "Goblin", "Orc", "Terran", "Undercommon"],
    favoredClass: "fighter", favoredText: "Fighter",
    skillBonuses: {}, saveBonus: 0, darkvision: 60, lowLight: false,
    weaponFamiliarity: ["waraxe-dwarven", "urgrosh-dwarven"], bonusWeapons: [],
    traits: ["Darkvision 60 ft.", "Stonecunning: +2 racial bonus on Search checks to notice unusual stonework",
      "Stability: +4 on ability checks to resist bull rush or trip while standing on the ground",
      "+2 racial bonus on saves against poison", "+2 racial bonus on saves against spells and spell-like effects",
      "+1 racial bonus on attack rolls against orcs and goblinoids", "+4 dodge bonus to AC against monsters of the giant type",
      "+2 racial bonus on Appraise and Craft checks related to stone or metal",
      "Speed is not reduced by medium or heavy armor or load"],
  },
  {
    id: "elf", name: "Elf", cite: "Races, Elves",
    abilities: { dex: 2, con: -2 }, size: "Medium", speed: 30,
    languages: ["Common", "Elven"], bonusLanguages: ["Draconic", "Gnoll", "Gnome", "Goblin", "Orc", "Sylvan"],
    favoredClass: "wizard", favoredText: "Wizard",
    skillBonuses: { listen: 2, search: 2, spot: 2 }, saveBonus: 0, darkvision: 0, lowLight: true,
    weaponFamiliarity: [],
    // "Martial Weapon Proficiency feats for the longsword, rapier, longbow (including composite longbow), and shortbow
    // (including composite shortbow) as bonus feats."
    bonusWeapons: ["longsword", "rapier", "longbow", "longbow-composite", "shortbow", "shortbow-composite"],
    traits: ["Immune to magic sleep effects", "+2 racial bonus on saves against enchantment spells or effects", "Low-light vision",
      "Entitled to a Search check when passing within 5 feet of a secret or concealed door"],
  },
  {
    id: "gnome", name: "Gnome", cite: "Races, Gnomes",
    abilities: { con: 2, str: -2 }, size: "Small", speed: 20,
    languages: ["Common", "Gnome"], bonusLanguages: ["Draconic", "Dwarven", "Elven", "Giant", "Goblin", "Orc"],
    favoredClass: "bard", favoredText: "Bard",
    skillBonuses: { listen: 2 }, saveBonus: 0, darkvision: 0, lowLight: true,
    weaponFamiliarity: ["hammer-gnome-hooked"], bonusWeapons: [],
    traits: ["Low-light vision", "+2 racial bonus on saves against illusions", "+1 to the DC of saves against illusion spells the gnome casts",
      "+1 racial bonus on attack rolls against kobolds and goblinoids", "+4 dodge bonus to AC against monsters of the giant type",
      "+2 racial bonus on Craft (alchemy) checks",
      "Spell-like abilities: 1/day speak with animals (burrowing mammal only, 1 minute); with Charisma 10 or more, also 1/day dancing lights, ghost sound, prestidigitation (caster level 1st; save DC 10 + Cha modifier + spell level)"],
  },
  {
    id: "half-elf", name: "Half-Elf", cite: "Races, Half-Elves",
    abilities: {}, size: "Medium", speed: 30,
    languages: ["Common", "Elven"], bonusLanguages: ANY,
    favoredClass: "highest", favoredText: "Any (the highest-level class)",
    skillBonuses: { listen: 1, search: 1, spot: 1, diplomacy: 2, "gather-information": 2 }, saveBonus: 0, darkvision: 0, lowLight: true,
    weaponFamiliarity: [], bonusWeapons: [],
    traits: ["Immune to sleep spells and similar magical effects", "+2 racial bonus on saves against enchantment spells or effects", "Low-light vision",
      "Elven blood: counts as an elf for all effects related to race"],
  },
  {
    id: "half-orc", name: "Half-Orc", cite: "Races, Half-Orcs",
    // "A half-orc's starting Intelligence score is always at least 3."
    abilities: { str: 2, int: -2, cha: -2 }, minInt: 3, size: "Medium", speed: 30,
    languages: ["Common", "Orc"], bonusLanguages: ["Draconic", "Giant", "Gnoll", "Goblin", "Abyssal"],
    favoredClass: "barbarian", favoredText: "Barbarian",
    skillBonuses: {}, saveBonus: 0, darkvision: 60, lowLight: false,
    weaponFamiliarity: [], bonusWeapons: [],
    traits: ["Darkvision 60 ft.", "Orc blood: counts as an orc for all effects related to race"],
  },
  {
    id: "halfling", name: "Halfling", cite: "Races, Halflings",
    abilities: { dex: 2, str: -2 }, size: "Small", speed: 20,
    languages: ["Common", "Halfling"], bonusLanguages: ["Dwarven", "Elven", "Gnome", "Goblin", "Orc"],
    favoredClass: "rogue", favoredText: "Rogue",
    skillBonuses: { climb: 2, jump: 2, "move-silently": 2, listen: 2 }, saveBonus: 1, darkvision: 0, lowLight: false,
    weaponFamiliarity: [], bonusWeapons: [],
    traits: ["+1 racial bonus on all saving throws (added)", "+2 morale bonus on saves against fear (stacks with the +1)",
      "+1 racial bonus on attack rolls with thrown weapons and slings"],
  },
];
export const raceById = (id) => RACES.find((r) => r.id === id);
