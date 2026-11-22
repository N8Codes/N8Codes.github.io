// Open Game Content under the Open Game License v1.0a (see license.js): the game rules in this file and the code that holds or computes them.
// The eleven classes of the 3.5 System Reference Document (Classes I and II), one data file each.
import barbarian from "../classes/barbarian.js";
import bard from "../classes/bard.js";
import cleric from "../classes/cleric.js";
import druid from "../classes/druid.js";
import fighter from "../classes/fighter.js";
import monk from "../classes/monk.js";
import paladin from "../classes/paladin.js";
import ranger from "../classes/ranger.js";
import rogue from "../classes/rogue.js";
import sorcerer from "../classes/sorcerer.js";
import wizard from "../classes/wizard.js";

export const CLASSES = [barbarian, bard, cleric, druid, fighter, monk, paladin, ranger, rogue, sorcerer, wizard];
export const classById = (id) => CLASSES.find((c) => c.id === id);
