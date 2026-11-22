// Open Game Content under the Open Game License v1.0a (see license.js): the game rules in this file and the code that holds or computes them.
// "Roll random character" for the 3.5 sheet. Every pick is equally likely (the 2026-11-21 ruling for 5E, kept here):
// race, class, an alignment the class allows, options, feats. The SRD gives no way to make ability scores, so a random
// character rolls 4d6 and keeps the highest three for each (owner ruling, 2026-11-22), placed in order. The result passes the same validate() as a hand-built character.

import { ABILITY_IDS, SKILLS, ALIGNMENTS, abilityIncreaseLevel, maxClassRanks, maxCrossClassRanks } from "./data/rules.js";
import { CLASSES, classById } from "./data/classes.js";
import { RACES, LANGUAGES, SECRET_LANGUAGES } from "./data/races.js";
import { FEATS, featById } from "./data/feats.js";
import { WEAPONS, ARMOR } from "./data/equipment.js";
import { rollDie, roll4d6KeepHighest3, pick, pickN } from "../../core/dice.js";
import { defaultCharacter, newLevel } from "./model.js";
import { derive, featSlots, featsTaken, skillPointsByLevel, classSkillsOf, scoresAt } from "./derive.js";
import { slotAllows, unmetPrereqs, weaponChoiceProblem } from "./validate.js";
import { listFor } from "./data/spells.js";

const SCHOOLS = ["abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation"];

/** A random character with as many levels as the one on screen, keeping its name, player and notes. */
export function randomCharacter(keep = {}) {
  const c = defaultCharacter();
  Object.assign(c, { name: keep.name ?? "", player: keep.player ?? "", notes: keep.notes ?? c.notes, deity: keep.deity ?? "" });
  const levels = Math.max(1, Math.min(20, Array.isArray(keep.levels) ? keep.levels.length : 1));
  const race = pick(RACES);
  const cls = pick(CLASSES);
  c.raceId = race.id;
  c.alignment = pick(cls.alignment.allowed ?? ALIGNMENTS);
  for (const a of ABILITY_IDS) c.baseScores[a] = roll4d6KeepHighest3();
  c.levels = Array.from({ length: levels }, () => newLevel(cls.id));
  c.levels.forEach((lv, i) => {
    if (i > 0) lv.hp = rollDie(cls.hitDie);
    if (abilityIncreaseLevel(i + 1)) lv.increase = pick(ABILITY_IDS);
  });

  // Class choices (options picked at random; optional ones half the time; text left for the player).
  for (const ch of cls.choices || []) {
    if (ch.kind !== "option" || ch.level > levels) continue;
    // Optional choices are made half the time; a specialist always names the schools given up.
    const forced = cls.id === "wizard" && ch.id === "prohibited-schools";
    if (ch.optional && !forced && Math.random() < 0.5) continue;
    let options = (ch.options || []).map((o) => o.id);
    let count = ch.count;
    if (cls.id === "wizard" && ch.id === "prohibited-schools") {
      const spec = (c.choices["wizard:specialization"] || [])[0];
      if (!spec) continue;
      options = options.filter((o) => o !== spec);
      count = spec === "divination" ? 1 : ch.count;
    }
    // Rogue special abilities and ranger favored enemies are each a new pick.
    if (cls.id === "rogue" || /^favored-enemy-\d+$/.test(ch.id)) options = options.filter((o) => !Object.entries(c.choices).some(([k, v]) => k.startsWith(`${cls.id}:`) && v.includes(o)));
    c.choices[`${cls.id}:${ch.id}`] = pickN(options, Math.min(count, options.length));
  }

  // Choices that appear once others are made: favored-enemy increases, the War domain's weapon.
  for (const ch of derive(c).choices) {
    if (c.choices[ch.key]?.length || ch.optional) continue;
    if (ch.kind === "option" && ch.options.length) c.choices[ch.key] = [pick(ch.options).id];
    if (ch.kind === "weapon") c.choices[ch.key] = [pick(WEAPONS.filter((w) => !w.ammo && w.id !== "unarmed-strike")).id];
  }
  spendSkills(c, cls);
  for (const slot of featSlots(c)) if (!slot.fixed) c.feats[slot.key] = randomFeat(c, slot);
  // Languages: as many as allowed, from the race's list (any for "any"), never the secret one.
  const d = derive(c);
  const pool = (d.bonusLanguagePool === "any" ? LANGUAGES : d.bonusLanguagePool).filter((l) => !d.autoLanguages.includes(l) && !SECRET_LANGUAGES.includes(l));
  c.languages = pickN(pool, Math.min(pool.length, d.bonusLanguageCount));

  // Gear: armor and shield the class is trained with (or none), and one weapon it's proficient with.
  const armorKinds = cls.proficiencies.armor;
  const armors = ARMOR.filter((a) => armorKinds.includes(a.kind));
  if (armors.length && Math.random() < 0.8) c.armorId = pick(armors).id;
  const shields = ARMOR.filter((a) => a.kind === "shield" && (cls.proficiencies.shields === "all" || (cls.proficiencies.shields === "no-tower" && a.id !== "shield-tower")));
  if (shields.length && Math.random() < 0.5) c.shieldId = pick(shields).id;
  const weapons = WEAPONS.filter((w) => !w.ammo && w.id !== "unarmed-strike" && d.weaponProf.has(w.id));
  if (weapons.length) c.attacks = [{ weaponId: pick(weapons).id }];
  fillSpells(c);
  return c;
}

/** Spells from the class list: as many as known (bard, sorcerer) or one prepared per slot (the rest, wizards from their
 * own schools; a cleric's domain slot holds a domain spell). */
function fillSpells(c) {
  const d = derive(c);
  for (const sc of d.casting) {
    const list = listFor(sc.cls.id);
    const prohibited = c.choices["wizard:prohibited-schools"] || [];
    const spec = (c.choices["wizard:specialization"] || [])[0];
    sc.levels.forEach((lv, L) => {
      if (!lv || !lv.canCast) return;
      const pool = (list[L] || []).filter((x) => !(sc.cls.id === "wizard" && x.school && prohibited.includes(x.school)));
      if (!pool.length) return;
      if (!sc.prepares) {
        for (const x of pickN(pool, Math.min(lv.known ?? 0, pool.length))) c.spells.push({ classId: sc.cls.id, name: x.name, level: L, prepared: 0, domain: false });
        return;
      }
      let slots = lv.total;
      if (sc.cls.id === "cleric" && lv.extra) {
        const dom = d.domains.flatMap((dm) => dm.spells).filter((x) => x.level === L);
        if (dom.length) { c.spells.push({ classId: "cleric", name: pick(dom).name, level: L, prepared: 1, domain: true }); }
        slots -= lv.extra;
      }
      // A specialist's extra slot goes to a spell of the specialty school.
      if (spec && sc.cls.id === "wizard") {
        const own = pool.filter((x) => x.school === spec);
        if (own.length) { c.spells.push({ classId: "wizard", name: pick(own).name, level: L, prepared: 1, domain: false }); slots -= 1; }
      }
      for (let k = 0; k < slots; k++) {
        const x = pick(pool);
        const have = c.spells.find((y) => y.classId === sc.cls.id && y.level === L && y.name === x.name && !y.domain);
        if (have) have.prepared += 1; else c.spells.push({ classId: sc.cls.id, name: x.name, level: L, prepared: 1, domain: false });
      }
    });
  }
}

/** Spend every level's points one at a time on skills with room, class skills of that level first. */
function spendSkills(c, cls) {
  const points = skillPointsByLevel(c);
  const own = new Set(classSkillsOf(cls));
  const ranks = Object.fromEntries(SKILLS.map((s) => [s.id, 0]));
  const usable = SKILLS.filter((s) => !s.sub && s.id !== "speak-language");
  c.levels.forEach((lv, i) => {
    const L = i + 1;
    for (let p = 0; p < (points[i] ?? 0); p++) {
      const room = (s) => ranks[s.id] + (own.has(s.id) ? 1 : 0.5) <= (own.has(s.id) ? maxClassRanks(L) : maxCrossClassRanks(L));
      const classOnes = usable.filter((s) => own.has(s.id) && room(s));
      const any = classOnes.length ? classOnes : usable.filter(room);
      if (!any.length) break;
      const s = pick(any);
      lv.skills[s.id] = (lv.skills[s.id] || 0) + 1;
      ranks[s.id] += own.has(s.id) ? 1 : 0.5;
    }
  });
}

function randomFeat(c, slot) {
  const taken = Object.values(c.feats).map((f) => f.id);
  const fixed = featSlots(c).filter((s) => s.fixed).map((s) => s.fixed);
  const options = FEATS.filter((f) => !(slot.exclude || []).includes(f.id) && slotAllows(slot, f) && (f.multiple || (!taken.includes(f.id) && !fixed.includes(f.id)))
    && (slot.ignorePrereqs || unmetPrereqs(c, f, slot.level, slot.key).length === 0));
  if (!options.length) return { id: "", detail: "" };
  const feat = pick(options);
  let detail = "";
  // Weapon feats pick only weapons the feat allows (see weaponChoiceProblem).
  const prof = derive(c).weaponProf;
  const str = scoresAt(c, slot.level).str;
  const weaponPool = WEAPONS.filter((w) => !w.ammo && w.id !== "unarmed-strike" && !weaponChoiceProblem(feat, w, prof, str));
  if (feat.detail === "weapon" && !weaponPool.length) return randomFeat(c, { ...slot, exclude: [...(slot.exclude || []), feat.id] });
  if (feat.detail === "weapon") detail = pick(weaponPool).id;
  else if (feat.detail === "skill") detail = pick(SKILLS.filter((s) => !s.sub)).id;
  else if (feat.detail === "school") detail = pick(SCHOOLS);
  // A feat built on another with the same kind of choice (Weapon Specialization on Weapon Focus) takes its choice.
  const base = (feat.prereq?.feats || []).map((f) => featById(f)).find((f) => f?.detail && f.detail === feat.detail);
  if (base) {
    const held = featsTaken(c).filter((t) => t.feat.id === base.id && t.slot.level <= slot.level).map((t) => t.detail).filter(Boolean);
    if (held.length) detail = pick(held);
  }
  // A repeatable feat needs a different choice each time.
  if (feat.multiple && feat.detail) {
    const used = Object.values(c.feats).filter((f) => f.id === feat.id).map((f) => f.detail);
    for (let tries = 0; used.includes(detail) && tries < 50; tries++) {
      detail = feat.detail === "weapon" ? pick(weaponPool).id : feat.detail === "skill" ? pick(SKILLS.filter((s) => !s.sub)).id : pick(SCHOOLS);
    }
  }
  // Every allowed choice already taken: pick another feat.
  if (feat.multiple && feat.detail && Object.values(c.feats).some((f) => f.id === feat.id && f.detail === detail)) {
    return randomFeat(c, { ...slot, exclude: [...(slot.exclude || []), feat.id] });
  }
  // The prerequisite check with the choice made (e.g. no Weapon Focus to build on yet): try another feat.
  if (!slot.ignorePrereqs && unmetPrereqs(c, feat, slot.level, slot.key, detail).length) {
    return randomFeat(c, { ...slot, exclude: [...(slot.exclude || []), feat.id] });
  }
  return { id: feat.id, detail };
}

export { classById };
