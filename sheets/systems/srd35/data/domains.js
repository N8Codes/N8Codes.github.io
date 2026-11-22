// Generated from the 3.5 SRD spell lists (Spell List I and II, Open Game Content, OGL 1.0a) by a script in the
// session scratchpad; do not edit by hand without checking the SRD. "the DM" became "the GM" (Product Identity).
// Each domain: granted power (SRD text), its nine domain spells, and what the sheet computes from it:
// classSkills (added to the cleric list), resources (uses per day: a number, "3+cha" or "level" = cleric level),
// casterLevelBonus (+1 caster level for that kind of spell), weaponChoice (War: the deity's favored weapon),
// numbers (a computed line shown with the power).
export const DOMAINS = [
 {
  "id": "air",
  "name": "Air",
  "power": "Turn or destroy earth creatures as a good cleric turns undead. Rebuke, command, or bolster air creatures as an evil cleric rebukes undead. Use these abilities a total number of times per day equal to 3 + your Charisma modifier. This granted power is a supernatural ability.",
  "spells": [
   {
    "name": "Obscuring Mist",
    "summary": "Fog surrounds you.",
    "level": 1
   },
   {
    "name": "Wind Wall",
    "summary": "Deflects arrows, smaller creatures, and gases.",
    "level": 2
   },
   {
    "name": "Gaseous Form",
    "summary": "Subject becomes insubstantial and can fly slowly.",
    "level": 3
   },
   {
    "name": "Air Walk",
    "summary": "Subject treads on air as if solid (climb at 45-degree angle).",
    "level": 4
   },
   {
    "name": "Control Winds",
    "summary": "Change wind direction and speed.",
    "level": 5
   },
   {
    "name": "Chain Lightning",
    "summary": "1d6/level damage; 1 secondary bolt/level each deals half damage.",
    "level": 6
   },
   {
    "name": "Control Weather",
    "summary": "Changes weather in local area.",
    "level": 7
   },
   {
    "name": "Whirlwind",
    "summary": "Cyclone deals damage and can pick up creatures.",
    "level": 8
   },
   {
    "name": "Elemental Swarm",
    "summary": "Summons multiple elementals.",
    "star": "*",
    "level": 9
   }
  ],
  "notes": [
   "*Cast as an air spell only."
  ],
  "cite": "Spell List I, Air Domain",
  "resources": [
   {
    "id": "turn-earth",
    "name": "Turn earth / rebuke air creatures (Air domain)",
    "uses": "3+cha"
   }
  ]
 },
 {
  "id": "animal",
  "name": "Animal",
  "power": "You can use speak with animals once per day as a spell-like ability. Add Knowledge (nature) to your list of cleric class skills.",
  "spells": [
   {
    "name": "Calm Animals",
    "summary": "Calms (2d4 + level) HD of animals.",
    "level": 1
   },
   {
    "name": "Hold Animal",
    "summary": "Paralyzes one animal for 1 round/level.",
    "level": 2
   },
   {
    "name": "Dominate Animal",
    "summary": "Subject animal obeys silent mental commands.",
    "level": 3
   },
   {
    "name": "Summon Nature’s Ally IV",
    "summary": "Calls creature to fight.",
    "star": "*",
    "level": 4
   },
   {
    "name": "Commune with Nature",
    "summary": "Learn about terrain for 1 mile/level.",
    "level": 5
   },
   {
    "name": "Antilife Shell",
    "summary": "10-ft. field hedges out living creatures.",
    "level": 6
   },
   {
    "name": "Animal Shapes",
    "summary": "One ally/level polymorphs into chosen animal.",
    "level": 7
   },
   {
    "name": "Summon Nature’s Ally VIII",
    "summary": "Calls creature to fight.",
    "star": "*",
    "level": 8
   },
   {
    "name": "Shapechange",
    "summary": "Transforms you into any creature, and change forms once per round.",
    "marks": "F",
    "level": 9
   }
  ],
  "notes": [
   "*Can only summon animals."
  ],
  "cite": "Spell List I, Animal Domain",
  "classSkills": [
   "knowledge-nature"
  ],
  "resources": [
   {
    "id": "speak-with-animals",
    "name": "Speak with animals (Animal domain)",
    "uses": 1
   }
  ]
 },
 {
  "id": "chaos",
  "name": "Chaos",
  "power": "You cast chaos spells at +1 caster level.",
  "spells": [
   {
    "name": "Protection from Law",
    "summary": "+2 to AC and saves, counter mind control, hedge out elementals and outsiders.",
    "level": 1
   },
   {
    "name": "Shatter",
    "summary": "Sonic vibration damages objects or crystalline creatures.",
    "level": 2
   },
   {
    "name": "Magic Circle against Law",
    "summary": "As protection spells, but 10-ft. radius and 10 min./level.",
    "level": 3
   },
   {
    "name": "Chaos Hammer",
    "summary": "Damages and staggers lawful creatures.",
    "level": 4
   },
   {
    "name": "Dispel Law",
    "summary": "+4 bonus against attacks by lawful creatures.",
    "level": 5
   },
   {
    "name": "Animate Objects",
    "summary": "Objects attack your foes.",
    "level": 6
   },
   {
    "name": "Word of Chaos",
    "summary": "Kills, confuses, stuns, or deafens nonchaotic subjects.",
    "level": 7
   },
   {
    "name": "Cloak of Chaos",
    "summary": "+4 to AC, +4 resistance, SR 25 against lawful spells.",
    "marks": "F",
    "level": 8
   },
   {
    "name": "Summon Monster IX",
    "summary": "Calls extraplanar creature to fight for you.",
    "star": "*",
    "level": 9
   }
  ],
  "notes": [
   "*Cast as a chaos spell only."
  ],
  "cite": "Spell List I, Chaos Domain",
  "casterLevelBonus": "chaos"
 },
 {
  "id": "death",
  "name": "Death",
  "power": "You may use a death touch once per day. Your death touch is a supernatural ability that produces a death effect. You must succeed on a melee touch attack against a living creature (using the rules for touch spells). When you touch, roll 1d6 per cleric level you possess. If the total at least equals the creature’s current hit points, it dies (no save).",
  "spells": [
   {
    "name": "Cause Fear",
    "summary": "One creature of 5 HD or less flees for 1d4 rounds.",
    "level": 1
   },
   {
    "name": "Death Knell",
    "summary": "Kill dying creature and gain 1d8 temporary hp, +2 to Str, and +1 caster level.",
    "level": 2
   },
   {
    "name": "Animate Dead",
    "summary": "Creates undead skeletons and zombies.",
    "marks": "M",
    "level": 3
   },
   {
    "name": "Death Ward",
    "summary": "Grants immunity to death spells and negative energy effects.",
    "level": 4
   },
   {
    "name": "Slay Living",
    "summary": "Touch attack kills subject.",
    "level": 5
   },
   {
    "name": "Create Undead",
    "summary": "Create ghouls, ghasts, mummies, or mohrgs.",
    "marks": "M",
    "level": 6
   },
   {
    "name": "Destruction",
    "summary": "Kills subject and destroys remains.",
    "marks": "F",
    "level": 7
   },
   {
    "name": "Create Greater Undead",
    "summary": "Create shadows, wraiths, spectres, r devourers.",
    "marks": "M",
    "level": 8
   },
   {
    "name": "Wail of the Banshee",
    "summary": "Kills one creature/level.",
    "level": 9
   }
  ],
  "notes": [],
  "cite": "Spell List I, Death Domain",
  "resources": [
   {
    "id": "death-touch",
    "name": "Death touch (Death domain)",
    "uses": 1
   }
  ],
  "numbers": "death"
 },
 {
  "id": "destruction",
  "name": "Destruction",
  "power": "You gain the smite power, the supernatural ability to make a single melee attack with a +4 bonus on attack rolls and a bonus on damage rolls equal to your cleric level (if you hit). You must declare the smite before making the attack. This ability is usable once per day.",
  "spells": [
   {
    "name": "Inflict Light Wounds",
    "summary": "Touch attack, 1d8 damage +1/level (max +5).",
    "level": 1
   },
   {
    "name": "Shatter",
    "summary": "Sonic vibration damages objects or crystalline creatures.",
    "level": 2
   },
   {
    "name": "Contagion",
    "summary": "Infects subject with chosen disease.",
    "level": 3
   },
   {
    "name": "Inflict Critical Wounds",
    "summary": "Touch attack, 4d8 damage +1/level (max +20).",
    "level": 4
   },
   {
    "name": "Inflict Light Wounds, Mass",
    "summary": "Deals 1d8 damage +1/level to any creatures.",
    "level": 5
   },
   {
    "name": "Harm",
    "summary": "Deals 10 points/level damage to target.",
    "level": 6
   },
   {
    "name": "Disintegrate",
    "summary": "Makes one creature or object vanish.",
    "level": 7
   },
   {
    "name": "Earthquake",
    "summary": "Intense tremor shakes 80-ft.-radius.",
    "level": 8
   },
   {
    "name": "Implosion",
    "summary": "Kills one creature/round.",
    "level": 9
   }
  ],
  "notes": [],
  "cite": "Spell List I, Destruction Domain",
  "resources": [
   {
    "id": "smite",
    "name": "Smite (Destruction domain)",
    "uses": 1
   }
  ],
  "numbers": "destruction"
 },
 {
  "id": "earth",
  "name": "Earth",
  "power": "Turn or destroy air creatures as a good cleric turns undead. Rebuke, command, or bolster earth creatures as an evil cleric rebukes undead. Use these abilities a total number of times per day equal to 3 + your Charisma modifier. This granted power is a supernatural ability.",
  "spells": [
   {
    "name": "Magic Stone",
    "summary": "Three stones become +1 projectiles, 1d6 +1 damage.",
    "level": 1
   },
   {
    "name": "Soften Earth and Stone",
    "summary": "Turns stone to clay or dirt to sand or mud.",
    "level": 2
   },
   {
    "name": "Stone Shape",
    "summary": "Sculpts stone into any shape.",
    "level": 3
   },
   {
    "name": "Spike Stones",
    "summary": "Creatures in area take 1d8 damage, may be lowed.",
    "level": 4
   },
   {
    "name": "Wall of Stone",
    "summary": "Creates a stone wall that can be shaped.",
    "level": 5
   },
   {
    "name": "Stoneskin",
    "summary": "Ignore 10 points of damage per attack.",
    "marks": "M",
    "level": 6
   },
   {
    "name": "Earthquake",
    "summary": "Intense tremor shakes 80-ft.-radius.",
    "level": 7
   },
   {
    "name": "Iron Body",
    "summary": "Your body becomes living iron.",
    "level": 8
   },
   {
    "name": "Elemental Swarm",
    "summary": "Summons multiple elementals.",
    "star": "*",
    "level": 9
   }
  ],
  "notes": [
   "*Cast as an earth spell only."
  ],
  "cite": "Spell List I, Earth Domain",
  "resources": [
   {
    "id": "turn-air",
    "name": "Turn air / rebuke earth creatures (Earth domain)",
    "uses": "3+cha"
   }
  ]
 },
 {
  "id": "evil",
  "name": "Evil",
  "power": "You cast evil spells at +1 caster level.",
  "spells": [
   {
    "name": "Protection from Good",
    "summary": "+2 to AC and saves, counter mind control, hedge out elementals and outsiders.",
    "level": 1
   },
   {
    "name": "Desecrate",
    "summary": "Fills area with negative energy, making undead stronger.",
    "marks": "M",
    "level": 2
   },
   {
    "name": "Magic Circle against Good",
    "summary": "As protection spells, but 10-ft. radius and 10 min./level.",
    "level": 3
   },
   {
    "name": "Unholy Blight",
    "summary": "Damages and sickens good creatures.",
    "level": 4
   },
   {
    "name": "Dispel Good",
    "summary": "+4 bonus against attacks by good creatures.",
    "level": 5
   },
   {
    "name": "Create Undead",
    "summary": "Create ghouls, ghasts, mummies, or mohrgs.",
    "marks": "M",
    "level": 6
   },
   {
    "name": "Blasphemy",
    "summary": "Kills, paralyzes, weakens, or dazes nonevil subjects.",
    "level": 7
   },
   {
    "name": "Unholy Aura",
    "summary": "+4 to AC, +4 resistance, SR 25 against good spells.",
    "marks": "F",
    "level": 8
   },
   {
    "name": "Summon Monster IX",
    "summary": "Calls extraplanar creature to fight for you.",
    "star": "*",
    "level": 9
   }
  ],
  "notes": [
   "*Cast as an evil spell only."
  ],
  "cite": "Spell List I, Evil Domain",
  "casterLevelBonus": "evil"
 },
 {
  "id": "fire",
  "name": "Fire",
  "power": "Turn or destroy water creatures as a good cleric turns undead. Rebuke, command, or bolster fire creatures as an evil cleric rebukes undead. Use these abilities a total number of times per day equal to 3 + your Charisma modifier. This granted power is a supernatural ability.",
  "spells": [
   {
    "name": "Burning Hands",
    "summary": "1d4/level fire damage (max 5d4).",
    "level": 1
   },
   {
    "name": "Produce Flame",
    "summary": "1d6 damage +1/ level, touch or thrown.",
    "level": 2
   },
   {
    "name": "Resist Energy",
    "summary": "Ignores 10 (or more) points of damage/attack from specified energy type.",
    "star": "*",
    "level": 3
   },
   {
    "name": "Wall of Fire",
    "summary": "Deals 2d4 fire damage out to 10 ft. and 1d4 out to 20 ft. Passing through wall deals 2d6 damage +1/level.",
    "level": 4
   },
   {
    "name": "Fire Shield",
    "summary": "Creatures attacking you take fire damage; you’re protected from heat or cold.",
    "level": 5
   },
   {
    "name": "Fire Seeds",
    "summary": "Acorns and berries become grenades and bombs.",
    "level": 6
   },
   {
    "name": "Fire Storm",
    "summary": "Deals 1d6/level fire damage.",
    "level": 7
   },
   {
    "name": "Incendiary Cloud",
    "summary": "Cloud deals 4d6 fire damage/round.",
    "level": 8
   },
   {
    "name": "Elemental Swarm",
    "summary": "Summons multiple elementals.",
    "star": "**",
    "level": 9
   }
  ],
  "notes": [
   "*Resist cold or fire only.",
   "**Cast as a fire spell only."
  ],
  "cite": "Spell List I, Fire Domain",
  "resources": [
   {
    "id": "turn-water",
    "name": "Turn water / rebuke fire creatures (Fire domain)",
    "uses": "3+cha"
   }
  ]
 },
 {
  "id": "good",
  "name": "Good",
  "power": "You cast good spells at +1 caster level.",
  "spells": [
   {
    "name": "Protection from Evil",
    "summary": "+2 to AC and saves, counter mind control, hedge out elementals and outsiders.",
    "level": 1
   },
   {
    "name": "Aid",
    "summary": "+1 on attack rolls, +1 on saves against fear, 1d8 temporary hp +1/level (max +10).",
    "level": 2
   },
   {
    "name": "Magic Circle against Evil",
    "summary": "As protection spells, but 10-ft. radius and 10 min./level.",
    "level": 3
   },
   {
    "name": "Holy Smite",
    "summary": "Damages and blinds evil creatures.",
    "level": 4
   },
   {
    "name": "Dispel Evil",
    "summary": "+4 bonus against attacks by evil creatures.",
    "level": 5
   },
   {
    "name": "Blade Barrier",
    "summary": "Wall of blades deals 1d6/level damage.",
    "level": 6
   },
   {
    "name": "Holy Word",
    "summary": "Kills, paralyzes, slows, or deafens nongood subjects.",
    "marks": "F",
    "level": 7
   },
   {
    "name": "Holy Aura",
    "summary": "+4 to AC, +4 resistance, and SR 25 against evil spells.",
    "level": 8
   },
   {
    "name": "Summon Monster IX",
    "summary": "Calls extraplanar creature to fight for you.",
    "star": "*",
    "level": 9
   }
  ],
  "notes": [
   "*Cast as a good spell only."
  ],
  "cite": "Spell List I, Good Domain",
  "casterLevelBonus": "good"
 },
 {
  "id": "healing",
  "name": "Healing",
  "power": "You cast healing spells at +1 caster level.",
  "spells": [
   {
    "name": "Cure Light Wounds",
    "summary": "Cures 1d8 damage +1/level (max +5).",
    "level": 1
   },
   {
    "name": "Cure Moderate Wounds",
    "summary": "Cures 2d8 damage +1/level (max +10).",
    "level": 2
   },
   {
    "name": "Cure Serious Wounds",
    "summary": "Cures 3d8 damage +1/level (max +15).",
    "level": 3
   },
   {
    "name": "Cure Critical Wounds",
    "summary": "Cures 4d8 damage +1/level (max +20).",
    "level": 4
   },
   {
    "name": "Cure Light Wounds, Mass",
    "summary": "Cures 1d8 damage +1/level (max +25) for many creatures.",
    "level": 5
   },
   {
    "name": "Heal",
    "summary": "Cures 10 points/level of damage, all diseases and mental conditions.",
    "level": 6
   },
   {
    "name": "Regenerate",
    "summary": "Subject’s severed limbs grow back, cures 4d8 damage +1/level (max +35).",
    "level": 7
   },
   {
    "name": "Cure Critical Wounds, Mass",
    "summary": "Cures 4d8 damage +1/level (max +40) for many creatures.",
    "level": 8
   },
   {
    "name": "Heal, Mass",
    "summary": "As heal, but with several subjects.",
    "level": 9
   }
  ],
  "notes": [],
  "cite": "Spell List I, Healing Domain",
  "casterLevelBonus": "healing"
 },
 {
  "id": "knowledge",
  "name": "Knowledge",
  "power": "Add all Knowledge skills to your list of cleric class skills. You cast divination spells at +1 caster level.",
  "spells": [
   {
    "name": "Detect Secret Doors",
    "summary": "Reveals hidden doors within 60 ft.",
    "level": 1
   },
   {
    "name": "Detect Thoughts",
    "summary": "Allows “listening” to surface thoughts.",
    "level": 2
   },
   {
    "name": "Clairaudience/Clairvoyance",
    "summary": "Hear or see at a distance for 1 min./level.",
    "level": 3
   },
   {
    "name": "Divination",
    "summary": "Provides useful advice for specific proposed actions.",
    "marks": "M",
    "level": 4
   },
   {
    "name": "True Seeing",
    "summary": "Lets you see all things as they really are.",
    "marks": "M",
    "level": 5
   },
   {
    "name": "Find the Path",
    "summary": "Shows most direct way to a location.",
    "level": 6
   },
   {
    "name": "Legend Lore M",
    "summary": "Lets you learn tales about a person, place, or thing.",
    "marks": "F",
    "level": 7
   },
   {
    "name": "Discern Location",
    "summary": "Reveals exact location of creature or object.",
    "level": 8
   },
   {
    "name": "Foresight",
    "summary": "“Sixth sense” warns of impending danger.",
    "level": 9
   }
  ],
  "notes": [],
  "cite": "Spell List I, Knowledge Domain",
  "classSkills": [
   "knowledge"
  ],
  "casterLevelBonus": "divination"
 },
 {
  "id": "law",
  "name": "Law",
  "power": "You cast law spells at +1 caster level.",
  "spells": [
   {
    "name": "Protection from Chaos",
    "summary": "+2 to AC and saves, counter mind control, hedge out elementals and outsiders.",
    "level": 1
   },
   {
    "name": "Calm Emotions",
    "summary": "Calms creatures, negating emotion effects.",
    "level": 2
   },
   {
    "name": "Magic Circle against Chaos",
    "summary": "As protection spells, but 10-ft. radius and 10 min./level.",
    "level": 3
   },
   {
    "name": "Order’s Wrath",
    "summary": "Damages and dazes chaotic creatures.",
    "level": 4
   },
   {
    "name": "Dispel Chaos",
    "summary": "+4 bonus against attacks by chaotic creatures.",
    "level": 5
   },
   {
    "name": "Hold Monster",
    "summary": "As hold person, but any creature.",
    "level": 6
   },
   {
    "name": "Dictum",
    "summary": "Kills, paralyzes, slows, or deafens nonlawful subjects.",
    "level": 7
   },
   {
    "name": "Shield of Law",
    "summary": "+4 to AC, +4 resistance, and SR 25 against chaotic spells.",
    "marks": "F",
    "level": 8
   },
   {
    "name": "Summon Monster IX",
    "summary": "Calls extraplanar creature to fight for you.",
    "star": "*",
    "level": 9
   }
  ],
  "notes": [
   "*Cast as a law spell only."
  ],
  "cite": "Spell List I, Law Domain",
  "casterLevelBonus": "law"
 },
 {
  "id": "luck",
  "name": "Luck",
  "power": "You gain the power of good fortune, which is usable once per day. This extraordinary ability allows you to reroll one roll that you have just made before the GM declares whether the roll results in success or failure. You must take the result of the reroll, even if it’s worse than the original roll.",
  "spells": [
   {
    "name": "Entropic Shield",
    "summary": "Ranged attacks against you have 20% miss chance.",
    "level": 1
   },
   {
    "name": "Aid",
    "summary": "+1 on attack rolls, +1 against fear, 1d8 temporary hp +1/level (max +10).",
    "level": 2
   },
   {
    "name": "Protection from Energy",
    "summary": "Absorb 12 points/level of damage from one kind of energy.",
    "level": 3
   },
   {
    "name": "Freedom of Movement",
    "summary": "Subject moves normally despite impediments.",
    "level": 4
   },
   {
    "name": "Break Enchantment",
    "summary": "Frees subjects from enchantments, alterations, curses, and petrification.",
    "level": 5
   },
   {
    "name": "Mislead",
    "summary": "Turns you invisible and creates illusory double.",
    "level": 6
   },
   {
    "name": "Spell Turning",
    "summary": "Reflect 1d4+6 spell levels back at caster.",
    "level": 7
   },
   {
    "name": "Moment of Prescience",
    "summary": "You gain insight bonus on single attack roll, check, or save.",
    "level": 8
   },
   {
    "name": "Miracle",
    "summary": "Requests a deity’s intercession.",
    "marks": "X",
    "level": 9
   }
  ],
  "notes": [],
  "cite": "Spell List I, Luck Domain",
  "resources": [
   {
    "id": "good-fortune",
    "name": "Good fortune reroll (Luck domain)",
    "uses": 1
   }
  ]
 },
 {
  "id": "magic",
  "name": "Magic",
  "power": "Use scrolls, wands, and other devices with spell completion or spell trigger activation as a wizard of one-half your cleric level (at least 1st level). For the purpose of using a scroll or other magic device, if you are also a wizard, actual wizard levels and these effective wizard levels stack.",
  "spells": [
   {
    "name": "Magic Aura",
    "summary": "Alters object’s magic aura.",
    "level": 1
   },
   {
    "name": "Identify",
    "summary": "Determines properties of magic item.",
    "level": 2
   },
   {
    "name": "Dispel Magic",
    "summary": "Cancels magical spells and effects.",
    "level": 3
   },
   {
    "name": "Imbue with Spell Ability",
    "summary": "Transfer spells to subject.",
    "level": 4
   },
   {
    "name": "Spell Resistance",
    "summary": "Subject gains SR 12 + level.",
    "level": 5
   },
   {
    "name": "Antimagic Field",
    "summary": "Negates magic within 10 ft.",
    "level": 6
   },
   {
    "name": "Spell Turning",
    "summary": "Reflect 1d4+6 spell levels back at caster.",
    "level": 7
   },
   {
    "name": "Protection from Spells M",
    "summary": "Confers +8 resistance bonus.",
    "marks": "F",
    "level": 8
   },
   {
    "name": "Mage’s Disjunction",
    "summary": "Dispels magic, disenchants magic items.",
    "level": 9
   }
  ],
  "notes": [],
  "cite": "Spell List I, Magic Domain",
  "numbers": "magic"
 },
 {
  "id": "plant",
  "name": "Plant",
  "power": "Rebuke or command plant creatures as an evil cleric rebukes or commands undead. Use this ability a total number of times per day equal to 3 + your Charisma modifier. This granted power is a supernatural ability. Add Knowledge (nature) to your list of cleric class skills.",
  "spells": [
   {
    "name": "Entangle",
    "summary": "Plants entangle everyone in 40-ft.-radius.",
    "level": 1
   },
   {
    "name": "Barkskin",
    "summary": "Grants +2 (or higher) enhancement to natural armor.",
    "level": 2
   },
   {
    "name": "Plant Growth",
    "summary": "Grows vegetation, improves crops.",
    "level": 3
   },
   {
    "name": "Command Plants",
    "summary": "Sway the actions of one or more plant creatures.",
    "level": 4
   },
   {
    "name": "Wall of Thorns",
    "summary": "Thorns damage anyone who tries to pass.",
    "level": 5
   },
   {
    "name": "Repel Wood",
    "summary": "Pushes away wooden objects.",
    "level": 6
   },
   {
    "name": "Animate Plants",
    "summary": "One or more trees animate and fight for you.",
    "level": 7
   },
   {
    "name": "Control Plants",
    "summary": "Control actions of one or more plant creatures.",
    "level": 8
   },
   {
    "name": "Shambler",
    "summary": "Summons 1d4+2 shambling mounds to fight for you.",
    "level": 9
   }
  ],
  "notes": [],
  "cite": "Spell List I, Plant Domain",
  "classSkills": [
   "knowledge-nature"
  ],
  "resources": [
   {
    "id": "rebuke-plants",
    "name": "Rebuke or command plants (Plant domain)",
    "uses": "3+cha"
   }
  ]
 },
 {
  "id": "protection",
  "name": "Protection",
  "power": "You can generate a protective ward as a supernatural ability. Grant someone you touch a resistance bonus equal to your cleric level on his or her next saving throw. Activating this power is a standard action. The protective ward is an abjuration effect with a duration of 1 hour that is usable once per day.",
  "spells": [
   {
    "name": "Sanctuary",
    "summary": "Opponents can’t attack you, and you can’t attack.",
    "level": 1
   },
   {
    "name": "Shield Other",
    "summary": "You take half of subject’s damage.",
    "marks": "F",
    "level": 2
   },
   {
    "name": "Protection from Energy",
    "summary": "Absorb 12 points/level of damage from one kind of energy.",
    "level": 3
   },
   {
    "name": "Spell Immunity",
    "summary": "Subject is immune to one spell per four levels.",
    "level": 4
   },
   {
    "name": "Spell Resistance",
    "summary": "Subject gains SR 12 + level.",
    "level": 5
   },
   {
    "name": "Antimagic Field",
    "summary": "Negates magic within 10 ft.",
    "level": 6
   },
   {
    "name": "Repulsion",
    "summary": "Creatures can’t approach you.",
    "level": 7
   },
   {
    "name": "Mind Blank",
    "summary": "Subject is immune to mental/emotional magic and scrying.",
    "level": 8
   },
   {
    "name": "Prismatic Sphere",
    "summary": "As prismatic wall, but surrounds on all sides.",
    "level": 9
   }
  ],
  "notes": [],
  "cite": "Spell List I, Protection Domain",
  "resources": [
   {
    "id": "ward",
    "name": "Protective ward (Protection domain)",
    "uses": 1
   }
  ],
  "numbers": "protection"
 },
 {
  "id": "strength",
  "name": "Strength",
  "power": "You can perform a feat of strength as a supernatural ability. You gain an enhancement bonus to Strength equal to your cleric level. Activating the power is a free action, the power lasts 1 round, and it is usable once per day.",
  "spells": [
   {
    "name": "Enlarge Person",
    "summary": "Humanoid creature doubles in size.",
    "level": 1
   },
   {
    "name": "Bull’s Strength",
    "summary": "Subject gains +4 to Str for 1 min./level.",
    "level": 2
   },
   {
    "name": "Magic Vestment",
    "summary": "Armor or shield gains +1 enhancement per four levels.",
    "level": 3
   },
   {
    "name": "Spell Immunity",
    "summary": "Subject is immune to one spell per four levels.",
    "level": 4
   },
   {
    "name": "Righteous Might",
    "summary": "Your size increases, and you gain combat bonuses.",
    "level": 5
   },
   {
    "name": "Stoneskin",
    "summary": "Ignore 10 points of damage per attack.",
    "marks": "M",
    "level": 6
   },
   {
    "name": "Grasping Hand",
    "summary": "Large hand provides cover, pushes, or grapples.",
    "level": 7
   },
   {
    "name": "Clenched Fist",
    "summary": "Large hand provides cover, pushes, or attacks your foes.",
    "level": 8
   },
   {
    "name": "Crushing Hand",
    "summary": "Large hand provides cover, pushes, or crushes your foes.",
    "level": 9
   }
  ],
  "notes": [],
  "cite": "Spell List I, Strength Domain",
  "resources": [
   {
    "id": "feat-of-strength",
    "name": "Feat of strength (Strength domain)",
    "uses": 1
   }
  ],
  "numbers": "strength"
 },
 {
  "id": "sun",
  "name": "Sun",
  "power": "Once per day, you can perform a greater turning against undead in place of a regular turning. The greater turning is like a normal turning except that the undead creatures that would be turned are destroyed instead.",
  "spells": [
   {
    "name": "Endure Elements",
    "summary": "Exist comfortably in hot or cold environments.",
    "level": 1
   },
   {
    "name": "Heat Metal",
    "summary": "Make metal so hot it damages those who touch it.",
    "level": 2
   },
   {
    "name": "Searing Light",
    "summary": "Ray deals 1d8/two levels, more against undead.",
    "level": 3
   },
   {
    "name": "Fire Shield",
    "summary": "Creatures attacking you take fire damage; you’re protected from heat or cold.",
    "level": 4
   },
   {
    "name": "Flame Strike",
    "summary": "Smite foes with divine fire (1d6/level damage).",
    "level": 5
   },
   {
    "name": "Fire Seeds",
    "summary": "Acorns and berries become grenades and bombs.",
    "level": 6
   },
   {
    "name": "Sunbeam",
    "summary": "Beam blinds and deals 4d6 damage.",
    "level": 7
   },
   {
    "name": "Sunburst",
    "summary": "Blinds all within 10 ft., deals 6d6 damage.",
    "level": 8
   },
   {
    "name": "Prismatic Sphere",
    "summary": "As prismatic wall, but surrounds on all sides.",
    "level": 9
   }
  ],
  "notes": [],
  "cite": "Spell List I, Sun Domain",
  "resources": [
   {
    "id": "greater-turning",
    "name": "Greater turning (Sun domain)",
    "uses": 1
   }
  ]
 },
 {
  "id": "travel",
  "name": "Travel",
  "power": "For a total time per day of 1 round per cleric level you possess, you can act normally regardless of magical effects that impede movement as if you were affected by the spell freedom of movement. This effect occurs automatically as soon as it applies, lasts until it runs out or is no longer needed, and can operate multiple times per day (up to the total daily limit of rounds). This granted power is a supernatural ability. Add Survival to your list of cleric class skills.",
  "spells": [
   {
    "name": "Longstrider",
    "summary": "Increases your speed.",
    "level": 1
   },
   {
    "name": "Locate Object",
    "summary": "Senses direction toward object (specific or type).",
    "level": 2
   },
   {
    "name": "Fly",
    "summary": "Subject flies at speed of 60 ft.",
    "level": 3
   },
   {
    "name": "Dimension Door",
    "summary": "Teleports you short distance.",
    "level": 4
   },
   {
    "name": "Teleport",
    "summary": "Instantly transports you as far as 100 miles/level.",
    "level": 5
   },
   {
    "name": "Find the Path",
    "summary": "Shows most direct way to a location.",
    "level": 6
   },
   {
    "name": "Teleport, Greater",
    "summary": "As teleport, but no range limit and no off-target arrival.",
    "level": 7
   },
   {
    "name": "Phase Door",
    "summary": "Creates an invisible passage through wood or stone.",
    "level": 8
   },
   {
    "name": "Astral Projection",
    "summary": "Projects you and companions onto Astral Plane.",
    "marks": "M",
    "level": 9
   }
  ],
  "notes": [],
  "cite": "Spell List I, Travel Domain",
  "classSkills": [
   "survival"
  ],
  "resources": [
   {
    "id": "freedom",
    "name": "Freedom of movement rounds (Travel domain)",
    "uses": "level"
   }
  ]
 },
 {
  "id": "trickery",
  "name": "Trickery",
  "power": "Add Bluff, Disguise, and Hide to your list of cleric class skills.",
  "spells": [
   {
    "name": "Disguise Self",
    "summary": "Disguise own appearance.",
    "level": 1
   },
   {
    "name": "Invisibility",
    "summary": "Subject invisible 1 min./level or until it attacks.",
    "level": 2
   },
   {
    "name": "Nondetection",
    "summary": "Hides subject from divination, scrying.",
    "marks": "M",
    "level": 3
   },
   {
    "name": "Confusion",
    "summary": "Subjects behave oddly for 1 round/level.",
    "level": 4
   },
   {
    "name": "False Vision",
    "summary": "Fools scrying with an illusion.",
    "marks": "M",
    "level": 5
   },
   {
    "name": "Mislead",
    "summary": "Turns you invisible and creates illusory double.",
    "level": 6
   },
   {
    "name": "Screen",
    "summary": "Illusion hides area from vision, scrying.",
    "level": 7
   },
   {
    "name": "Polymorph Any Object",
    "summary": "Changes any subject into anything else.",
    "level": 8
   },
   {
    "name": "Time Stop",
    "summary": "You act freely for 1d4+1 rounds.",
    "level": 9
   }
  ],
  "notes": [],
  "cite": "Spell List I, Trickery Domain",
  "classSkills": [
   "bluff",
   "disguise",
   "hide"
  ]
 },
 {
  "id": "war",
  "name": "War",
  "power": "Free Martial Weapon Proficiency with deity’s favored weapon (if necessary) and Weapon Focus with the deity’s favored weapon.",
  "spells": [
   {
    "name": "Magic Weapon",
    "summary": "Weapon gains +1 bonus.",
    "level": 1
   },
   {
    "name": "Spiritual Weapon",
    "summary": "Magical weapon attacks on its own.",
    "level": 2
   },
   {
    "name": "Magic Vestment",
    "summary": "Armor or shield gains +1 enhancement per four levels.",
    "level": 3
   },
   {
    "name": "Divine Power",
    "summary": "You gain attack bonus, +6 to Str, and 1 hp/level.",
    "level": 4
   },
   {
    "name": "Flame Strike",
    "summary": "Smite foes with divine fire (1d6/level damage).",
    "level": 5
   },
   {
    "name": "Blade Barrier",
    "summary": "Wall of blades deals 1d6/level damage.",
    "level": 6
   },
   {
    "name": "Power Word Blind",
    "summary": "Blinds creature with 200 hp or less.",
    "level": 7
   },
   {
    "name": "Power Word Stun",
    "summary": "Stuns creature with 150 hp or less.",
    "level": 8
   },
   {
    "name": "Power Word Kill",
    "summary": "Kills creature with 100 hp or less.",
    "level": 9
   }
  ],
  "notes": [],
  "cite": "Spell List I, War Domain",
  "weaponChoice": true
 },
 {
  "id": "water",
  "name": "Water",
  "power": "Turn or destroy fire creatures as a good cleric turns undead. Rebuke, command, or bolster water creatures as an evil cleric rebukes undead. Use these abilities a total number of times per day equal to 3 + your Charisma modifier. This granted power is a supernatural ability.",
  "spells": [
   {
    "name": "Obscuring Mist",
    "summary": "Fog surrounds you.",
    "level": 1
   },
   {
    "name": "Fog Cloud",
    "summary": "Fog obscures vision.",
    "level": 2
   },
   {
    "name": "Water Breathing",
    "summary": "Subjects can breathe underwater.",
    "level": 3
   },
   {
    "name": "Control Water",
    "summary": "Raises or lowers bodies of water.",
    "level": 4
   },
   {
    "name": "Ice Storm",
    "summary": "Hail deals 5d6 damage in cylinder 40 ft. across.",
    "level": 5
   },
   {
    "name": "Cone of Cold",
    "summary": "1d6/level cold damage.",
    "level": 6
   },
   {
    "name": "Acid Fog",
    "summary": "Fog deals acid damage.",
    "level": 7
   },
   {
    "name": "Horrid Wilting",
    "summary": "Deals 1d6/level damage within 30 ft.",
    "level": 8
   },
   {
    "name": "Elemental Swarm",
    "summary": "Summons multiple elementals.",
    "star": "*",
    "level": 9
   }
  ],
  "notes": [
   "*Cast as a water spell only."
  ],
  "cite": "Spell List I, Water Domain",
  "resources": [
   {
    "id": "turn-fire",
    "name": "Turn fire / rebuke water creatures (Water domain)",
    "uses": "3+cha"
   }
  ]
 }
];

export const domainById = (id) => DOMAINS.find((x) => x.id === id);
