// The twelve SRD 5.2.1 classes, one data file each (p.28–82).
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
import warlock from "../classes/warlock.js";
import wizard from "../classes/wizard.js";

export const CLASSES = [barbarian, bard, cleric, druid, fighter, monk, paladin, ranger, rogue, sorcerer, warlock, wizard];
export const classById = (id) => CLASSES.find((c) => c.id === id);
