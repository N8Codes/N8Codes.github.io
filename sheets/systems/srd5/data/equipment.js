// Weapons table (p.91), Armor table (p.92) and tool names (p.93–94), SRD 5.2.1. Plain data only.
// Properties are stored as ids; "thrown"/"ammunition" ranges are kept as printed.

const w = (id, name, category, kind, damage, type, properties, mastery, extra = {}) =>
  ({ id, name, category, kind, damage, type, properties, mastery, ...extra });

export const WEAPONS = [
  // Simple Melee Weapons
  w("club", "Club", "simple", "melee", "1d4", "Bludgeoning", ["light"], "Slow"),
  w("dagger", "Dagger", "simple", "melee", "1d4", "Piercing", ["finesse", "light", "thrown"], "Nick", { range: "20/60" }),
  w("greatclub", "Greatclub", "simple", "melee", "1d8", "Bludgeoning", ["two-handed"], "Push"),
  w("handaxe", "Handaxe", "simple", "melee", "1d6", "Slashing", ["light", "thrown"], "Vex", { range: "20/60" }),
  w("javelin", "Javelin", "simple", "melee", "1d6", "Piercing", ["thrown"], "Slow", { range: "30/120" }),
  w("light-hammer", "Light Hammer", "simple", "melee", "1d4", "Bludgeoning", ["light", "thrown"], "Nick", { range: "20/60" }),
  w("mace", "Mace", "simple", "melee", "1d6", "Bludgeoning", [], "Sap"),
  w("quarterstaff", "Quarterstaff", "simple", "melee", "1d6", "Bludgeoning", ["versatile"], "Topple", { versatile: "1d8" }),
  w("sickle", "Sickle", "simple", "melee", "1d4", "Slashing", ["light"], "Nick"),
  w("spear", "Spear", "simple", "melee", "1d6", "Piercing", ["thrown", "versatile"], "Sap", { range: "20/60", versatile: "1d8" }),
  // Simple Ranged Weapons
  w("dart", "Dart", "simple", "ranged", "1d4", "Piercing", ["finesse", "thrown"], "Vex", { range: "20/60" }),
  w("light-crossbow", "Light Crossbow", "simple", "ranged", "1d8", "Piercing", ["ammunition", "loading", "two-handed"], "Slow", { range: "80/320" }),
  w("shortbow", "Shortbow", "simple", "ranged", "1d6", "Piercing", ["ammunition", "two-handed"], "Vex", { range: "80/320" }),
  w("sling", "Sling", "simple", "ranged", "1d4", "Bludgeoning", ["ammunition"], "Slow", { range: "30/120" }),
  // Martial Melee Weapons
  w("battleaxe", "Battleaxe", "martial", "melee", "1d8", "Slashing", ["versatile"], "Topple", { versatile: "1d10" }),
  w("flail", "Flail", "martial", "melee", "1d8", "Bludgeoning", [], "Sap"),
  w("glaive", "Glaive", "martial", "melee", "1d10", "Slashing", ["heavy", "reach", "two-handed"], "Graze"),
  w("greataxe", "Greataxe", "martial", "melee", "1d12", "Slashing", ["heavy", "two-handed"], "Cleave"),
  w("greatsword", "Greatsword", "martial", "melee", "2d6", "Slashing", ["heavy", "two-handed"], "Graze"),
  w("halberd", "Halberd", "martial", "melee", "1d10", "Slashing", ["heavy", "reach", "two-handed"], "Cleave"),
  w("lance", "Lance", "martial", "melee", "1d10", "Piercing", ["heavy", "reach", "two-handed"], "Topple"),
  w("longsword", "Longsword", "martial", "melee", "1d8", "Slashing", ["versatile"], "Sap", { versatile: "1d10" }),
  w("maul", "Maul", "martial", "melee", "2d6", "Bludgeoning", ["heavy", "two-handed"], "Topple"),
  w("morningstar", "Morningstar", "martial", "melee", "1d8", "Piercing", [], "Sap"),
  w("pike", "Pike", "martial", "melee", "1d10", "Piercing", ["heavy", "reach", "two-handed"], "Push"),
  w("rapier", "Rapier", "martial", "melee", "1d8", "Piercing", ["finesse"], "Vex"),
  w("scimitar", "Scimitar", "martial", "melee", "1d6", "Slashing", ["finesse", "light"], "Nick"),
  w("shortsword", "Shortsword", "martial", "melee", "1d6", "Piercing", ["finesse", "light"], "Vex"),
  w("trident", "Trident", "martial", "melee", "1d8", "Piercing", ["thrown", "versatile"], "Topple", { range: "20/60", versatile: "1d10" }),
  w("warhammer", "Warhammer", "martial", "melee", "1d8", "Bludgeoning", ["versatile"], "Push", { versatile: "1d10" }),
  w("war-pick", "War Pick", "martial", "melee", "1d8", "Piercing", ["versatile"], "Sap", { versatile: "1d10" }),
  w("whip", "Whip", "martial", "melee", "1d4", "Slashing", ["finesse", "reach"], "Slow"),
  // Martial Ranged Weapons
  w("blowgun", "Blowgun", "martial", "ranged", "1", "Piercing", ["ammunition", "loading"], "Vex", { range: "25/100" }),
  w("hand-crossbow", "Hand Crossbow", "martial", "ranged", "1d6", "Piercing", ["ammunition", "light", "loading"], "Vex", { range: "30/120" }),
  w("heavy-crossbow", "Heavy Crossbow", "martial", "ranged", "1d10", "Piercing", ["ammunition", "heavy", "loading", "two-handed"], "Push", { range: "100/400" }),
  w("longbow", "Longbow", "martial", "ranged", "1d8", "Piercing", ["ammunition", "heavy", "two-handed"], "Slow", { range: "150/600" }),
  w("musket", "Musket", "martial", "ranged", "1d12", "Piercing", ["ammunition", "loading", "two-handed"], "Slow", { range: "40/120" }),
  w("pistol", "Pistol", "martial", "ranged", "1d10", "Piercing", ["ammunition", "loading"], "Vex", { range: "30/90" }),
];

// Armor table, p.92. base: the AC; dexMax: null = full Dex modifier, 0 = none, 2 = "max 2".
// strength: the Strength score below which Speed drops by 10 feet (p.92 "Strength").
export const ARMOR = [
  { id: "padded-armor", name: "Padded Armor", kind: "light", base: 11, dexMax: null, strength: null, stealthDisadvantage: true },
  { id: "leather-armor", name: "Leather Armor", kind: "light", base: 11, dexMax: null, strength: null, stealthDisadvantage: false },
  { id: "studded-leather-armor", name: "Studded Leather Armor", kind: "light", base: 12, dexMax: null, strength: null, stealthDisadvantage: false },
  { id: "hide-armor", name: "Hide Armor", kind: "medium", base: 12, dexMax: 2, strength: null, stealthDisadvantage: false },
  { id: "chain-shirt", name: "Chain Shirt", kind: "medium", base: 13, dexMax: 2, strength: null, stealthDisadvantage: false },
  { id: "scale-mail", name: "Scale Mail", kind: "medium", base: 14, dexMax: 2, strength: null, stealthDisadvantage: true },
  { id: "breastplate", name: "Breastplate", kind: "medium", base: 14, dexMax: 2, strength: null, stealthDisadvantage: false },
  { id: "half-plate-armor", name: "Half Plate Armor", kind: "medium", base: 15, dexMax: 2, strength: null, stealthDisadvantage: true },
  { id: "ring-mail", name: "Ring Mail", kind: "heavy", base: 14, dexMax: 0, strength: null, stealthDisadvantage: true },
  { id: "chain-mail", name: "Chain Mail", kind: "heavy", base: 16, dexMax: 0, strength: 13, stealthDisadvantage: true },
  { id: "splint-armor", name: "Splint Armor", kind: "heavy", base: 17, dexMax: 0, strength: 15, stealthDisadvantage: true },
  { id: "plate-armor", name: "Plate Armor", kind: "heavy", base: 18, dexMax: 0, strength: 15, stealthDisadvantage: true },
];
// Shield, p.92: +2 AC, only with Shield training.
export const SHIELD_BONUS = 2;

// Tools, p.93–94: Artisan's Tools, then the other tools; Gaming Set and Musical Instrument variants.
export const ARTISANS_TOOLS = ["Alchemist's Supplies", "Brewer's Supplies", "Calligrapher's Supplies", "Carpenter's Tools",
  "Cartographer's Tools", "Cobbler's Tools", "Cook's Utensils", "Glassblower's Tools", "Jeweler's Tools",
  "Leatherworker's Tools", "Mason's Tools", "Painter's Supplies", "Potter's Tools", "Smith's Tools", "Tinker's Tools",
  "Weaver's Tools", "Woodcarver's Tools"];
export const GAMING_SETS = ["Gaming Set (dice)", "Gaming Set (dragonchess)", "Gaming Set (playing cards)", "Gaming Set (three-dragon ante)"];
export const MUSICAL_INSTRUMENTS = ["Bagpipes", "Drum", "Dulcimer", "Flute", "Horn", "Lute", "Lyre", "Pan Flute", "Shawm", "Viol"];
export const OTHER_TOOLS = ["Disguise Kit", "Forgery Kit", "Herbalism Kit", "Navigator's Tools", "Poisoner's Kit", "Thieves' Tools"];
export const ALL_TOOLS = [...ARTISANS_TOOLS, ...OTHER_TOOLS, ...GAMING_SETS, ...MUSICAL_INSTRUMENTS];

export const weaponById = (id) => WEAPONS.find((x) => x.id === id);
export const armorById = (id) => ARMOR.find((x) => x.id === id);
