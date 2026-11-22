// 3.5 SRD weapons and armor, transcribed from the System Reference Document 3.5
// (Open Game Content, OGL 1.0a), file Equipment.
// Weapons: Equipment, Table: Weapons (category = Simple/Martial/Exotic heading, kind = the
// Unarmed / Light / One-Handed / Two-Handed / Ranged subheading). Values as printed; the SRD text
// prints critical multipliers with a plain "x" (e.g. "19–20/x2"), kept as printed.
// Footnote marks from the table (4 reach, 5 double, 3 nonlethal) are stripped from names and dice;
// special flags come from Equipment, Weapon Descriptions. Weight "—" and range "—" → 0.
// thrown: melee weapons with a range increment, plus ranged ones named in Equipment, Thrown Weapons.

export const WEAPONS = [
  // simple / unarmed
  { id: "gauntlet", name: "Gauntlet", category: "simple", kind: "unarmed", cost: "2 gp", dmgS: "1d2", dmgM: "1d3", critical: "x2", range: 0, weight: 1, type: "Bludgeoning" },
  { id: "unarmed-strike", name: "Unarmed strike", category: "simple", kind: "unarmed", cost: "—", dmgS: "1d2", dmgM: "1d3", critical: "x2", range: 0, weight: 0, type: "Bludgeoning" }, // footnote 3: deals nonlethal damage
  // simple / light
  { id: "dagger", name: "Dagger", category: "simple", kind: "light", cost: "2 gp", dmgS: "1d3", dmgM: "1d4", critical: "19–20/x2", range: 10, weight: 1, type: "Piercing or slashing", thrown: true },
  { id: "dagger-punching", name: "Dagger, punching", category: "simple", kind: "light", cost: "2 gp", dmgS: "1d3", dmgM: "1d4", critical: "x3", range: 0, weight: 1, type: "Piercing" },
  { id: "gauntlet-spiked", name: "Gauntlet, spiked", category: "simple", kind: "light", cost: "5 gp", dmgS: "1d3", dmgM: "1d4", critical: "x2", range: 0, weight: 1, type: "Piercing" },
  { id: "mace-light", name: "Mace, light", category: "simple", kind: "light", cost: "5 gp", dmgS: "1d4", dmgM: "1d6", critical: "x2", range: 0, weight: 4, type: "Bludgeoning" },
  { id: "sickle", name: "Sickle", category: "simple", kind: "light", cost: "6 gp", dmgS: "1d4", dmgM: "1d6", critical: "x2", range: 0, weight: 2, type: "Slashing", special: ["trip"] },
  // simple / one-handed
  { id: "club", name: "Club", category: "simple", kind: "one-handed", cost: "—", dmgS: "1d4", dmgM: "1d6", critical: "x2", range: 10, weight: 3, type: "Bludgeoning", thrown: true },
  { id: "mace-heavy", name: "Mace, heavy", category: "simple", kind: "one-handed", cost: "12 gp", dmgS: "1d6", dmgM: "1d8", critical: "x2", range: 0, weight: 8, type: "Bludgeoning" },
  { id: "morningstar", name: "Morningstar", category: "simple", kind: "one-handed", cost: "8 gp", dmgS: "1d6", dmgM: "1d8", critical: "x2", range: 0, weight: 6, type: "Bludgeoning and piercing" },
  { id: "shortspear", name: "Shortspear", category: "simple", kind: "one-handed", cost: "1 gp", dmgS: "1d4", dmgM: "1d6", critical: "x2", range: 20, weight: 3, type: "Piercing", thrown: true },
  // simple / two-handed
  { id: "longspear", name: "Longspear", category: "simple", kind: "two-handed", cost: "5 gp", dmgS: "1d6", dmgM: "1d8", critical: "x3", range: 0, weight: 9, type: "Piercing", special: ["reach", "brace"] },
  { id: "quarterstaff", name: "Quarterstaff", category: "simple", kind: "two-handed", cost: "—", dmgS: "1d4/1d4", dmgM: "1d6/1d6", critical: "x2", range: 0, weight: 4, type: "Bludgeoning", special: ["double", "monk"] },
  { id: "spear", name: "Spear", category: "simple", kind: "two-handed", cost: "2 gp", dmgS: "1d6", dmgM: "1d8", critical: "x3", range: 20, weight: 6, type: "Piercing", thrown: true, special: ["brace"] },
  // simple / ranged
  { id: "crossbow-heavy", name: "Crossbow, heavy", category: "simple", kind: "ranged", cost: "50 gp", dmgS: "1d8", dmgM: "1d10", critical: "19–20/x2", range: 120, weight: 8, type: "Piercing" },
  { id: "bolts-crossbow-10", name: "Bolts, crossbow (10)", category: "simple", kind: "ranged", cost: "1 gp", dmgS: "—", dmgM: "—", critical: "—", range: 0, weight: 1, type: "—", ammo: true }, // listed under each launcher that uses it; one entry kept
  { id: "crossbow-light", name: "Crossbow, light", category: "simple", kind: "ranged", cost: "35 gp", dmgS: "1d6", dmgM: "1d8", critical: "19–20/x2", range: 80, weight: 4, type: "Piercing" },
  { id: "dart", name: "Dart", category: "simple", kind: "ranged", cost: "5 sp", dmgS: "1d3", dmgM: "1d4", critical: "x2", range: 20, weight: 0.5, type: "Piercing", thrown: true },
  { id: "javelin", name: "Javelin", category: "simple", kind: "ranged", cost: "1 gp", dmgS: "1d4", dmgM: "1d6", critical: "x2", range: 30, weight: 2, type: "Piercing", thrown: true },
  { id: "sling", name: "Sling", category: "simple", kind: "ranged", cost: "—", dmgS: "1d3", dmgM: "1d4", critical: "x2", range: 50, weight: 0, type: "Bludgeoning" },
  { id: "bullets-sling-10", name: "Bullets, sling (10)", category: "simple", kind: "ranged", cost: "1 sp", dmgS: "—", dmgM: "—", critical: "—", range: 0, weight: 5, type: "—", ammo: true }, // listed under each launcher that uses it; one entry kept
  // martial / light
  { id: "axe-throwing", name: "Axe, throwing", category: "martial", kind: "light", cost: "8 gp", dmgS: "1d4", dmgM: "1d6", critical: "x2", range: 10, weight: 2, type: "Slashing", thrown: true },
  { id: "hammer-light", name: "Hammer, light", category: "martial", kind: "light", cost: "1 gp", dmgS: "1d3", dmgM: "1d4", critical: "x2", range: 20, weight: 2, type: "Bludgeoning", thrown: true },
  { id: "handaxe", name: "Handaxe", category: "martial", kind: "light", cost: "6 gp", dmgS: "1d4", dmgM: "1d6", critical: "x3", range: 0, weight: 3, type: "Slashing" },
  { id: "kukri", name: "Kukri", category: "martial", kind: "light", cost: "8 gp", dmgS: "1d3", dmgM: "1d4", critical: "18–20/x2", range: 0, weight: 2, type: "Slashing" },
  { id: "pick-light", name: "Pick, light", category: "martial", kind: "light", cost: "4 gp", dmgS: "1d3", dmgM: "1d4", critical: "x4", range: 0, weight: 3, type: "Piercing" },
  { id: "sap", name: "Sap", category: "martial", kind: "light", cost: "1 gp", dmgS: "1d4", dmgM: "1d6", critical: "x2", range: 0, weight: 2, type: "Bludgeoning" }, // footnote 3: deals nonlethal damage
  { id: "shield-light", name: "Shield, light", category: "martial", kind: "light", cost: "special", dmgS: "1d2", dmgM: "1d3", critical: "x2", range: 0, weight: 0, type: "Bludgeoning" }, // cost and weight "special": see the armor or shield
  { id: "spiked-armor", name: "Spiked armor", category: "martial", kind: "light", cost: "special", dmgS: "1d4", dmgM: "1d6", critical: "x2", range: 0, weight: 0, type: "Piercing" }, // cost and weight "special": see the armor or shield
  { id: "spiked-shield-light", name: "Spiked shield, light", category: "martial", kind: "light", cost: "special", dmgS: "1d3", dmgM: "1d4", critical: "x2", range: 0, weight: 0, type: "Piercing" }, // cost and weight "special": see the armor or shield
  { id: "sword-short", name: "Sword, short", category: "martial", kind: "light", cost: "10 gp", dmgS: "1d4", dmgM: "1d6", critical: "19–20/x2", range: 0, weight: 2, type: "Piercing" },
  // martial / one-handed
  { id: "battleaxe", name: "Battleaxe", category: "martial", kind: "one-handed", cost: "10 gp", dmgS: "1d6", dmgM: "1d8", critical: "x3", range: 0, weight: 6, type: "Slashing" },
  { id: "flail", name: "Flail", category: "martial", kind: "one-handed", cost: "8 gp", dmgS: "1d6", dmgM: "1d8", critical: "x2", range: 0, weight: 5, type: "Bludgeoning", special: ["trip", "disarm"] },
  { id: "longsword", name: "Longsword", category: "martial", kind: "one-handed", cost: "15 gp", dmgS: "1d6", dmgM: "1d8", critical: "19–20/x2", range: 0, weight: 4, type: "Slashing" },
  { id: "pick-heavy", name: "Pick, heavy", category: "martial", kind: "one-handed", cost: "8 gp", dmgS: "1d4", dmgM: "1d6", critical: "x4", range: 0, weight: 6, type: "Piercing" },
  { id: "rapier", name: "Rapier", category: "martial", kind: "one-handed", cost: "20 gp", dmgS: "1d4", dmgM: "1d6", critical: "18–20/x2", range: 0, weight: 2, type: "Piercing" },
  { id: "scimitar", name: "Scimitar", category: "martial", kind: "one-handed", cost: "15 gp", dmgS: "1d4", dmgM: "1d6", critical: "18–20/x2", range: 0, weight: 4, type: "Slashing" },
  { id: "shield-heavy", name: "Shield, heavy", category: "martial", kind: "one-handed", cost: "special", dmgS: "1d3", dmgM: "1d4", critical: "x2", range: 0, weight: 0, type: "Bludgeoning" }, // cost and weight "special": see the armor or shield
  { id: "spiked-shield-heavy", name: "Spiked shield, heavy", category: "martial", kind: "one-handed", cost: "special", dmgS: "1d4", dmgM: "1d6", critical: "x2", range: 0, weight: 0, type: "Piercing" }, // cost and weight "special": see the armor or shield
  { id: "trident", name: "Trident", category: "martial", kind: "one-handed", cost: "15 gp", dmgS: "1d6", dmgM: "1d8", critical: "x2", range: 10, weight: 4, type: "Piercing", thrown: true, special: ["brace"] },
  { id: "warhammer", name: "Warhammer", category: "martial", kind: "one-handed", cost: "12 gp", dmgS: "1d6", dmgM: "1d8", critical: "x3", range: 0, weight: 5, type: "Bludgeoning" },
  // martial / two-handed
  { id: "falchion", name: "Falchion", category: "martial", kind: "two-handed", cost: "75 gp", dmgS: "1d6", dmgM: "2d4", critical: "18–20/x2", range: 0, weight: 8, type: "Slashing" },
  { id: "glaive", name: "Glaive", category: "martial", kind: "two-handed", cost: "8 gp", dmgS: "1d8", dmgM: "1d10", critical: "x3", range: 0, weight: 10, type: "Slashing", special: ["reach"] },
  { id: "greataxe", name: "Greataxe", category: "martial", kind: "two-handed", cost: "20 gp", dmgS: "1d10", dmgM: "1d12", critical: "x3", range: 0, weight: 12, type: "Slashing" },
  { id: "greatclub", name: "Greatclub", category: "martial", kind: "two-handed", cost: "5 gp", dmgS: "1d8", dmgM: "1d10", critical: "x2", range: 0, weight: 8, type: "Bludgeoning" },
  { id: "flail-heavy", name: "Flail, heavy", category: "martial", kind: "two-handed", cost: "15 gp", dmgS: "1d8", dmgM: "1d10", critical: "19–20/x2", range: 0, weight: 10, type: "Bludgeoning", special: ["trip", "disarm"] },
  { id: "greatsword", name: "Greatsword", category: "martial", kind: "two-handed", cost: "50 gp", dmgS: "1d10", dmgM: "2d6", critical: "19–20/x2", range: 0, weight: 8, type: "Slashing" },
  { id: "guisarme", name: "Guisarme", category: "martial", kind: "two-handed", cost: "9 gp", dmgS: "1d6", dmgM: "2d4", critical: "x3", range: 0, weight: 12, type: "Slashing", special: ["reach", "trip"] },
  { id: "halberd", name: "Halberd", category: "martial", kind: "two-handed", cost: "10 gp", dmgS: "1d8", dmgM: "1d10", critical: "x3", range: 0, weight: 12, type: "Piercing or slashing", special: ["trip", "brace"] },
  { id: "lance", name: "Lance", category: "martial", kind: "two-handed", cost: "10 gp", dmgS: "1d6", dmgM: "1d8", critical: "x3", range: 0, weight: 10, type: "Piercing", special: ["reach"] },
  { id: "ranseur", name: "Ranseur", category: "martial", kind: "two-handed", cost: "10 gp", dmgS: "1d6", dmgM: "2d4", critical: "x3", range: 0, weight: 12, type: "Piercing", special: ["reach", "disarm"] },
  { id: "scythe", name: "Scythe", category: "martial", kind: "two-handed", cost: "18 gp", dmgS: "1d6", dmgM: "2d4", critical: "x4", range: 0, weight: 10, type: "Piercing or slashing", special: ["trip"] },
  // martial / ranged
  { id: "longbow", name: "Longbow", category: "martial", kind: "ranged", cost: "75 gp", dmgS: "1d6", dmgM: "1d8", critical: "x3", range: 100, weight: 3, type: "Piercing" },
  { id: "arrows-20", name: "Arrows (20)", category: "martial", kind: "ranged", cost: "1 gp", dmgS: "—", dmgM: "—", critical: "—", range: 0, weight: 3, type: "—", ammo: true }, // listed under each launcher that uses it; one entry kept
  { id: "longbow-composite", name: "Longbow, composite", category: "martial", kind: "ranged", cost: "100 gp", dmgS: "1d6", dmgM: "1d8", critical: "x3", range: 110, weight: 3, type: "Piercing" },
  { id: "shortbow", name: "Shortbow", category: "martial", kind: "ranged", cost: "30 gp", dmgS: "1d4", dmgM: "1d6", critical: "x3", range: 60, weight: 2, type: "Piercing" },
  { id: "shortbow-composite", name: "Shortbow, composite", category: "martial", kind: "ranged", cost: "75 gp", dmgS: "1d4", dmgM: "1d6", critical: "x3", range: 70, weight: 2, type: "Piercing" },
  // exotic / light
  { id: "kama", name: "Kama", category: "exotic", kind: "light", cost: "2 gp", dmgS: "1d4", dmgM: "1d6", critical: "x2", range: 0, weight: 2, type: "Slashing", special: ["trip", "monk"] },
  { id: "nunchaku", name: "Nunchaku", category: "exotic", kind: "light", cost: "2 gp", dmgS: "1d4", dmgM: "1d6", critical: "x2", range: 0, weight: 2, type: "Bludgeoning", special: ["disarm", "monk"] },
  { id: "sai", name: "Sai", category: "exotic", kind: "light", cost: "1 gp", dmgS: "1d3", dmgM: "1d4", critical: "x2", range: 10, weight: 1, type: "Bludgeoning", thrown: true, special: ["disarm", "monk"] },
  { id: "siangham", name: "Siangham", category: "exotic", kind: "light", cost: "3 gp", dmgS: "1d4", dmgM: "1d6", critical: "x2", range: 0, weight: 1, type: "Piercing", special: ["monk"] },
  // exotic / one-handed
  { id: "sword-bastard", name: "Sword, bastard", category: "exotic", kind: "one-handed", cost: "35 gp", dmgS: "1d8", dmgM: "1d10", critical: "19–20/x2", range: 0, weight: 6, type: "Slashing" },
  { id: "waraxe-dwarven", name: "Waraxe, dwarven", category: "exotic", kind: "one-handed", cost: "30 gp", dmgS: "1d8", dmgM: "1d10", critical: "x3", range: 0, weight: 8, type: "Slashing" },
  { id: "whip", name: "Whip", category: "exotic", kind: "one-handed", cost: "1 gp", dmgS: "1d2", dmgM: "1d3", critical: "x2", range: 0, weight: 2, type: "Slashing", special: ["reach", "trip", "disarm"] }, // footnote 3: deals nonlethal damage; range cell blank in the extraction; whip has no range increment (15-ft. reach, see description)
  // exotic / two-handed
  { id: "axe-orc-double", name: "Axe, orc double", category: "exotic", kind: "two-handed", cost: "60 gp", dmgS: "1d6/1d6", dmgM: "1d8/1d8", critical: "x3", range: 0, weight: 15, type: "Slashing", special: ["double"] },
  { id: "chain-spiked", name: "Chain, spiked", category: "exotic", kind: "two-handed", cost: "25 gp", dmgS: "1d6", dmgM: "2d4", critical: "x2", range: 0, weight: 10, type: "Piercing", special: ["reach", "trip", "disarm"] },
  { id: "flail-dire", name: "Flail, dire", category: "exotic", kind: "two-handed", cost: "90 gp", dmgS: "1d6/1d6", dmgM: "1d8/1d8", critical: "x2", range: 0, weight: 10, type: "Bludgeoning", special: ["double", "trip", "disarm"] },
  { id: "hammer-gnome-hooked", name: "Hammer, gnome hooked", category: "exotic", kind: "two-handed", cost: "20 gp", dmgS: "1d6/1d4", dmgM: "1d8/1d6", critical: "x3/x4", range: 0, weight: 6, type: "Bludgeoning and piercing", special: ["double", "trip"] },
  { id: "sword-two-bladed", name: "Sword, two-bladed", category: "exotic", kind: "two-handed", cost: "100 gp", dmgS: "1d6/1d6", dmgM: "1d8/1d8", critical: "19–20/x2", range: 0, weight: 10, type: "Slashing", special: ["double"] },
  { id: "urgrosh-dwarven", name: "Urgrosh, dwarven", category: "exotic", kind: "two-handed", cost: "50 gp", dmgS: "1d6/1d4", dmgM: "1d8/1d6", critical: "x3", range: 0, weight: 12, type: "Slashing or piercing", special: ["double", "brace"] },
  // exotic / ranged
  { id: "bolas", name: "Bolas", category: "exotic", kind: "ranged", cost: "5 gp", dmgS: "1d3", dmgM: "1d4", critical: "x2", range: 10, weight: 2, type: "Bludgeoning", special: ["trip"] }, // footnote 3: deals nonlethal damage; TODO: not named in the SRD's Thrown Weapons list; thrown flag left off
  { id: "crossbow-hand", name: "Crossbow, hand", category: "exotic", kind: "ranged", cost: "100 gp", dmgS: "1d3", dmgM: "1d4", critical: "19–20/x2", range: 30, weight: 2, type: "Piercing" },
  { id: "bolts-10", name: "Bolts (10)", category: "exotic", kind: "ranged", cost: "1 gp", dmgS: "—", dmgM: "—", critical: "—", range: 0, weight: 1, type: "—", ammo: true }, // listed under each launcher that uses it; one entry kept
  { id: "crossbow-repeating-heavy", name: "Crossbow, repeating heavy", category: "exotic", kind: "ranged", cost: "400 gp", dmgS: "1d8", dmgM: "1d10", critical: "19–20/x2", range: 120, weight: 12, type: "Piercing" },
  { id: "bolts-5", name: "Bolts (5)", category: "exotic", kind: "ranged", cost: "1 gp", dmgS: "—", dmgM: "—", critical: "—", range: 0, weight: 1, type: "—", ammo: true }, // one empty cell lost in the extraction; restored as —; listed under each launcher that uses it; one entry kept
  { id: "crossbow-repeating-light", name: "Crossbow, repeating light", category: "exotic", kind: "ranged", cost: "250 gp", dmgS: "1d6", dmgM: "1d8", critical: "19–20/x2", range: 80, weight: 6, type: "Piercing" },
  { id: "net", name: "Net", category: "exotic", kind: "ranged", cost: "20 gp", dmgS: "—", dmgM: "—", critical: "—", range: 10, weight: 6, type: "—", thrown: true }, // one empty cell lost in the extraction; restored as —
  { id: "shuriken", name: "Shuriken (5)", category: "exotic", kind: "ranged", cost: "1 gp", dmgS: "1", dmgM: "1d2", critical: "x2", range: 10, weight: 0.5, type: "Piercing", thrown: true, special: ["monk"] },
];

// Equipment, Table: Armor and Shields. maxDex "—" → null; ACP and arcane spell failure as numbers;
// speed30/speed20 = the (30 ft.) and (20 ft.) speed columns; weight in lb. for Medium wearers.
export const ARMOR = [
  { id: "padded", name: "Padded", kind: "light", cost: "5 gp", ac: 1, maxDex: 8, acp: 0, asf: 5, speed30: 30, speed20: 20, weight: 10 },
  { id: "leather", name: "Leather", kind: "light", cost: "10 gp", ac: 2, maxDex: 6, acp: 0, asf: 10, speed30: 30, speed20: 20, weight: 15 },
  { id: "studded-leather", name: "Studded leather", kind: "light", cost: "25 gp", ac: 3, maxDex: 5, acp: -1, asf: 15, speed30: 30, speed20: 20, weight: 20 },
  { id: "chain-shirt", name: "Chain shirt", kind: "light", cost: "100 gp", ac: 4, maxDex: 4, acp: -2, asf: 20, speed30: 30, speed20: 20, weight: 25 },
  { id: "hide", name: "Hide", kind: "medium", cost: "15 gp", ac: 3, maxDex: 4, acp: -3, asf: 20, speed30: 20, speed20: 15, weight: 25 },
  { id: "scale-mail", name: "Scale mail", kind: "medium", cost: "50 gp", ac: 4, maxDex: 3, acp: -4, asf: 25, speed30: 20, speed20: 15, weight: 30 },
  { id: "chainmail", name: "Chainmail", kind: "medium", cost: "150 gp", ac: 5, maxDex: 2, acp: -5, asf: 30, speed30: 20, speed20: 15, weight: 40 },
  { id: "breastplate", name: "Breastplate", kind: "medium", cost: "200 gp", ac: 5, maxDex: 3, acp: -4, asf: 25, speed30: 20, speed20: 15, weight: 30 },
  { id: "splint-mail", name: "Splint mail", kind: "heavy", cost: "200 gp", ac: 6, maxDex: 0, acp: -7, asf: 40, speed30: 20, speed20: 15, weight: 45 }, // footnote 2: runs at only triple speed
  { id: "banded-mail", name: "Banded mail", kind: "heavy", cost: "250 gp", ac: 6, maxDex: 1, acp: -6, asf: 35, speed30: 20, speed20: 15, weight: 35 }, // footnote 2: runs at only triple speed
  { id: "half-plate", name: "Half-plate", kind: "heavy", cost: "600 gp", ac: 7, maxDex: 0, acp: -7, asf: 40, speed30: 20, speed20: 15, weight: 50 }, // footnote 2: runs at only triple speed
  { id: "full-plate", name: "Full plate", kind: "heavy", cost: "1,500 gp", ac: 8, maxDex: 1, acp: -6, asf: 35, speed30: 20, speed20: 15, weight: 50 }, // footnote 2: runs at only triple speed
  { id: "buckler", name: "Buckler", kind: "shield", cost: "15 gp", ac: 1, maxDex: null, acp: -1, asf: 5, speed30: null, speed20: null, weight: 5 }, // speed — (shields do not affect speed)
  { id: "shield-light-wooden", name: "Shield, light wooden", kind: "shield", cost: "3 gp", ac: 1, maxDex: null, acp: -1, asf: 5, speed30: null, speed20: null, weight: 5 }, // speed — (shields do not affect speed)
  { id: "shield-light-steel", name: "Shield, light steel", kind: "shield", cost: "9 gp", ac: 1, maxDex: null, acp: -1, asf: 5, speed30: null, speed20: null, weight: 6 }, // speed — (shields do not affect speed)
  { id: "shield-heavy-wooden", name: "Shield, heavy wooden", kind: "shield", cost: "7 gp", ac: 2, maxDex: null, acp: -2, asf: 15, speed30: null, speed20: null, weight: 10 }, // speed — (shields do not affect speed)
  { id: "shield-heavy-steel", name: "Shield, heavy steel", kind: "shield", cost: "20 gp", ac: 2, maxDex: null, acp: -2, asf: 15, speed30: null, speed20: null, weight: 15 }, // speed — (shields do not affect speed)
  { id: "shield-tower", name: "Shield, tower", kind: "shield", cost: "30 gp", ac: 4, maxDex: 2, acp: -10, asf: 50, speed30: null, speed20: null, weight: 45 }, // footnote 3: a tower shield can instead grant cover; speed — (shields do not affect speed)
  { id: "armor-spikes", name: "Armor spikes", kind: "extra", cost: "+50 gp", ac: 0, maxDex: null, acp: 0, asf: 0, speed30: null, speed20: null, weight: 10 }, // — cells → 0 / null; cost and weight are added to the armor or shield
  { id: "gauntlet-locked", name: "Gauntlet, locked", kind: "extra", cost: "8 gp", ac: 0, maxDex: null, acp: 0, asf: 0, speed30: null, speed20: null, weight: 5 }, // ACP printed "Special" → 0; spell failure cell holds only footnote 4, "Hand not free to cast spells." → 0; weight applies only with a breastplate, light armor or no armor (Armor Descriptions, Gauntlet, Locked)
  { id: "shield-spikes", name: "Shield spikes", kind: "extra", cost: "+10 gp", ac: 0, maxDex: null, acp: 0, asf: 0, speed30: null, speed20: null, weight: 5 }, // — cells → 0 / null; cost and weight are added to the armor or shield
];

export const ARMOR_RULES_CITE = "Equipment, Armor Qualities; Table: Armor and Shields; Armor Descriptions";

export const weaponById = (id) => WEAPONS.find((w) => w.id === id);
export const armorById = (id) => ARMOR.find((a) => a.id === id);
