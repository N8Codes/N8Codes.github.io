// Open Game Content under the Open Game License v1.0a (see license.js): the game rules in this file and the code that holds or computes them.
// validate(character, derived) → [{ field, message, severity }]
//   severity "error": breaks a rule. The sheet refuses the edit that causes it (unless Free edit is on).
//   severity "todo":  a choice still to make. Shown in Guided mode; never blocks anything.
// Rules cite the 3.5 System Reference Document by file and section.

import { ABILITY_IDS, SKILLS, SKILL_IDS, ALIGNMENTS, abilityName, abilityIncreaseLevel, MAX_LEVEL } from "./data/rules.js";
import { classById } from "./data/classes.js";
import { featById, FEATS } from "./data/feats.js";
import { weaponById, armorById } from "./data/equipment.js";
import { LANGUAGES, SECRET_LANGUAGES } from "./data/races.js";
import { classLevelsAt, scoresAt, babFor, featSlots, featsTaken, skillRanks } from "./derive.js";
import { listFor } from "./data/spells.js";

const norm = (name) => String(name).trim().toLowerCase().replace(/[’']/g, "'");
/** The SRD list entry for a spell name at a level, or null. */
export const findSpell = (list, name, level) => (list?.[level] || []).find((x) => norm(x.name) === norm(name)) || null;

const skillName = (c, id) => {
  const s = SKILLS.find((x) => x.id === id);
  if (!s) return id;
  return s.sub && c.skillNames[id] ? `${s.name} (${c.skillNames[id]})` : s.name;
};
const fmtRanks = (n) => (Number.isInteger(n) ? String(n) : `${Math.floor(n)}½`);

/** The feats a slot may hold: any, a fighter-bonus-feat type, or a listed set. */
export function slotAllows(slot, feat) {
  const from = slot.from;
  if (!from) return true;
  if (from.type && feat.types.includes(from.type)) return true;
  if (Array.isArray(from.types) && from.types.some((t) => feat.types.includes(t))) return true;
  if (Array.isArray(from.feats) && from.feats.includes(feat.id)) return true;
  return false;
}

/**
 * Why a weapon can't be the choice for a weapon feat, or "" (Feats): Rapid Reload names a crossbow, Exotic and Martial
 * Weapon Proficiency name a weapon of that category (Exotic: Str 13 for the bastard sword or dwarven waraxe), and every
 * feat whose prerequisite is "Proficiency with selected weapon" needs that proficiency.
 */
export function weaponChoiceProblem(feat, weapon, weaponProf, str) {
  if (!weapon) return "Pick a weapon from the Weapons table.";
  if (feat.id === "rapid-reload" && !/^crossbow-(light|heavy|hand)$/.test(weapon.id)) return "Rapid Reload is for a light, heavy or hand crossbow (Feats, Rapid Reload).";
  if (feat.id === "exotic-weapon-proficiency") {
    if (weapon.category !== "exotic") return `The ${weapon.name} isn't an exotic weapon (Feats, Exotic Weapon Proficiency).`;
    if (["sword-bastard", "waraxe-dwarven"].includes(weapon.id) && (str ?? 0) < 13) return `The ${weapon.name} needs Strength 13 for this feat (Feats, Exotic Weapon Proficiency).`;
  }
  if (feat.id === "martial-weapon-proficiency" && weapon.category !== "martial") return `The ${weapon.name} isn't a martial weapon (Feats, Martial Weapon Proficiency).`;
  if (/proficien/i.test(feat.prereq?.other || "") && feat.id !== "exotic-weapon-proficiency" && !weaponProf.has(weapon.id)) return `${feat.name} needs proficiency with the ${weapon.name} (Feats, ${feat.name}).`;
  return "";
}

/** Why a feat's prerequisites aren't met at a character level, or [] if they are (Feats, Prerequisites). */
export function unmetPrereqs(c, feat, level, slotKey, detail = "") {
  const pre = feat.prereq || {};
  const out = [];
  const scores = scoresAt(c, level);
  const classLevels = classLevelsAt(c, level);
  for (const [a, n] of Object.entries(pre.abilities || {})) if (scores[a] === null || scores[a] < n) out.push(`${abilityName(a)} ${n}`);
  if (pre.bab && babFor(classLevels) < pre.bab) out.push(`base attack bonus +${pre.bab}`);
  // "A character can gain a feat at the same level at which he or she gains the prerequisite": feats from
  // this level or earlier count, but not the feat in this same slot.
  const slots = featSlots(c).filter((s) => s.level <= level && s.key !== slotKey);
  const taken = featsTaken(c, slots);
  const held = taken.map((f) => f.feat.id);
  for (const f of pre.feats || []) {
    const need = featById(f);
    if (!held.includes(f)) { out.push(need?.name ?? f); continue; }
    // A prerequisite feat with the same kind of choice must match it: Weapon Specialization needs "Weapon Focus with
    // selected weapon", Greater Spell Focus needs Spell Focus in that school (Feats).
    if (detail && need?.detail && need.detail === feat.detail && !taken.some((t) => t.feat.id === f && t.detail === detail)) {
      out.push(`${need.name} with the same ${need.detail}`);
    }
  }
  if (pre.skills) {
    const { ranks } = skillRanks({ ...c, levels: c.levels.slice(0, level) });
    for (const [s, n] of Object.entries(pre.skills)) if (Math.floor(ranks[s] ?? 0) < n) out.push(`${n} ranks in ${skillName(c, s)}`);
  }
  for (const [cls, n] of Object.entries(pre.classLevel || {})) if ((classLevels[cls] || 0) < n) out.push(`${classById(cls)?.name ?? cls} level ${n}`);
  if (pre.casterLevel) {
    // Caster level from the spellcasting classes held at that level (Classes I and II; half for paladin and ranger).
    const cl = Math.max(0, ...Object.entries(classLevels).map(([id, n]) => {
      const sp = classById(id).spells;
      if (!sp) return 0;
      const row = sp.perDay[n - 1] || [];
      if (row.every((x) => x === null)) return 0;
      return sp.casterLevel === "half" ? Math.floor(n / 2) : n;
    }));
    if (cl < pre.casterLevel) out.push(`caster level ${pre.casterLevel}`);
  }
  return out;
}

export function validate(c, d) {
  const out = [];
  const err = (field, message) => out.push({ field, message, severity: "error" });
  const todo = (field, message) => out.push({ field, message, severity: "todo" });

  // ---- Basics ----
  if (!d.race) todo("raceId", "Choose a race.");
  if (c.alignment && !ALIGNMENTS.includes(c.alignment)) err("alignment", "Pick one of the nine alignments (Description, Alignment).");
  if (!c.alignment) todo("alignment", "Choose an alignment.");
  if (!Array.isArray(c.levels) || c.levels.length < 1 || c.levels.length > MAX_LEVEL) err("levels", `A character has 1 to ${MAX_LEVEL} levels here (epic levels aren't covered).`);

  // ---- Ability scores: entered by the player (owner ruling, 2026-11-22: typed in; the SRD gives no method) ----
  for (const a of ABILITY_IDS) {
    const v = c.baseScores[a];
    if (v === null || v === undefined) todo(`abilities.${a}`, `Enter your ${abilityName(a)} score.`);
    else if (!Number.isInteger(v) || v < 1) err(`abilities.${a}`, `${abilityName(a)} must be at least 1 (Abilities and Conditions, Ability Score Loss: 0 means helpless, paralyzed, dead or unconscious).`);
  }
  c.levels.forEach((lv, i) => {
    const L = i + 1;
    const key = `level.${L}.increase`;
    if (abilityIncreaseLevel(L)) {
      if (!lv.increase) todo(key, `Level ${L}: choose an ability score to raise by 1 (Epic Level Basics, Ability Increases).`);
      else if (!ABILITY_IDS.includes(lv.increase)) err(key, "Pick one of the six abilities.");
    } else if (lv.increase) err(key, `Ability increases come at levels 4, 8, 12, 16 and 20 only (Epic Level Basics, Ability Increases).`);
  });

  // ---- Classes and levels ----
  let otherAfter = {}; // class id → true once a level of another class has been taken after it
  const seen = new Set();
  c.levels.forEach((lv, i) => {
    const L = i + 1;
    const field = `level.${L}.class`;
    const cls = classById(lv.classId);
    if (!lv.classId) { todo(field, `Level ${L}: choose a class.`); return; }
    if (!cls) { err(field, "That class isn't in the 3.5 SRD."); return; }
    // Classes I, Monk / Classes II, Paladin: a multiclass monk or paladin "may never again raise" that class.
    const locked = (cls.restrictions || []).some((r) => r.kind === "no-new-levels-after-other-class");
    if (locked && otherAfter[cls.id]) err(field, `After taking a level in another class, a ${cls.name} can't raise ${cls.name.toLowerCase()} levels again (${cls.cite}).`);
    for (const id of seen) if (id !== cls.id) otherAfter[id] = true;
    seen.add(cls.id);
    // Alignment requirements (each class's "Alignment:" line).
    if (c.alignment && cls.alignment?.allowed && !cls.alignment.allowed.includes(c.alignment)) {
      err(field, `A ${cls.name} must be ${cls.alignment.text.toLowerCase()} (${cls.cite}).`);
    }
    // Hit Die rolls after character level 1 (owner ruling: maximum at level 1, rolled after).
    if (L > 1) {
      if (lv.hp === null || lv.hp === undefined) todo(`level.${L}.hp`, `Level ${L}: enter your d${cls.hitDie} Hit Die roll.`);
      else if (lv.hp < 1 || lv.hp > cls.hitDie) err(`level.${L}.hp`, `A d${cls.hitDie} rolls 1 to ${cls.hitDie}.`);
    }
  });
  if (c.alignment) {
    // An alignment change after the levels are set is refused at the alignment field too.
    for (const cls of d.classes) if (cls.alignment?.allowed && !cls.alignment.allowed.includes(c.alignment)) err("alignment", `A ${cls.name} must be ${cls.alignment.text.toLowerCase()} (${cls.cite}).`);
  }

  // ---- Skills (Skills I, Skills Summary) ----
  c.levels.forEach((lv, i) => {
    const L = i + 1;
    const avail = d.points[i];
    const spent = d.spent[i];
    const field = `skills.${L}`;
    if (avail === null) { if (spent) err(field, `Level ${L}: choose a class and enter Intelligence before spending skill points.`); return; }
    if (spent > avail) err(field, `Level ${L} has ${avail} skill points; ${spent} are spent.`);
    else if (spent < avail) todo(field, `Level ${L}: ${avail - spent} skill point${avail - spent === 1 ? "" : "s"} left to spend ("You can't save skill points to spend later").`);
  });
  for (const o of d.overMax) {
    err(`skill.${o.skill}`, `${skillName(c, o.skill)} can have at most ${fmtRanks(o.max)} ranks at level ${o.level}; it has ${fmtRanks(o.ranks)} (Skills I: level + 3 for a class skill, half that otherwise).`);
  }
  for (const s of SKILLS) if (s.sub && d.ranks[s.id] > 0 && !c.skillNames[s.id]) todo(`skill.${s.id}`, `Name the ${s.name} skill you're training (e.g. ${s.sub === "craft" ? "alchemy" : s.sub === "perform" ? "oratory" : "sailor"}).`);

  // ---- Feats (Feats, Prerequisites) ----
  const taken = [];
  for (const slot of d.slots) {
    const field = `feat:${slot.key}`;
    const id = slot.fixed || c.feats[slot.key]?.id;
    if (!id) { todo(field, `Choose your ${slot.label}.`); continue; }
    const feat = featById(id);
    if (!feat) { err(field, "That feat isn't in the 3.5 SRD."); continue; }
    const detail = slot.fixed ? "" : (c.feats[slot.key]?.detail || "");
    if (!slot.fixed) {
      if (!slotAllows(slot, feat)) err(field, `${slot.label}: ${feat.name} isn't one of the feats this slot allows (${slot.cite || "SRD"}).`);
      if (!slot.ignorePrereqs) {
        const missing = unmetPrereqs(c, feat, slot.level, slot.key, detail);
        if (missing.length) err(field, `${feat.name} needs ${missing.join(", ")} (Feats, ${feat.name}).`);
      }
      if (feat.detail && !detail) todo(field, `${feat.name}: choose the ${feat.detail}.`);
      if (feat.detail === "weapon" && detail) {
        // Proficiency granted by this same feat doesn't count toward itself.
        const problem = weaponChoiceProblem(feat, weaponById(detail), d.weaponProf, scoresAt(c, slot.level).str);
        if (problem) err(field, problem);
      }
      if (feat.detail === "skill" && detail && !SKILL_IDS.includes(detail)) err(field, "Pick a skill.");
    }
    // Feats taken twice: only those that say they can be taken multiple times, and never twice with the same choice.
    // Repeatable feats with no choice attached (Toughness, Extra Turning) simply stack.
    const same = taken.find((t) => t.id === feat.id && (!feat.multiple || (feat.detail && t.detail === detail)));
    if (same) err(field, feat.multiple ? `You already have ${feat.name} for that choice.` : `${feat.name} can be taken only once.`);
    taken.push({ id: feat.id, detail });
  }
  for (const k of Object.keys(c.feats)) if (c.feats[k]?.id && !d.slots.some((s) => s.key === k)) todo(`feat:${k}`, "This feat slot isn't available with these levels; it's ignored.");

  // ---- Class choices ----
  for (const ch of d.choices) {
    const field = `choice:${ch.key}`;
    const list = c.choices[ch.key] || [];
    let count = ch.count;
    // Classes II, Wizard: a diviner gives up only one school.
    if (ch.cls.id === "wizard" && ch.id === "prohibited-schools") {
      const spec = (c.choices["wizard:specialization"] || [])[0];
      if (!spec) { if (list.length) err(field, "Prohibited schools are chosen only by a specialist (Classes II, Wizard)."); continue; }
      count = spec === "divination" ? 1 : ch.count;
      if (list.includes(spec)) err(field, "A wizard can't prohibit the specialty school (Classes II, Wizard).");
    }
    if (new Set(list).size !== list.length) err(field, "Each pick can be chosen only once.");
    if (ch.kind === "option") {
      for (const v of list) if (!(ch.options || []).some((o) => o.id === v)) err(field, "Pick one of the listed options.");
    }
    if (ch.kind === "weapon") for (const v of list) if (!weaponById(v)) err(field, "Pick a weapon from the Weapons table.");
    if (list.length > count) err(field, `${ch.label || ch.id}: ${count} to choose; ${list.length} are chosen (${ch.cite || ch.cls.cite}).`);
    else if (list.length < count && !ch.optional && ch.kind !== "text") todo(field, `${ch.cls.name}: choose ${ch.label || ch.id}${count > 1 ? ` (${count - list.length} more)` : ""}.`);
  }

  // Favored enemies: each one is a new type (Classes II, Ranger: "an additional favored enemy").
  const enemies = Object.entries(c.choices).filter(([k]) => /^ranger:favored-enemy-\d+$/.test(k) && d.choices.some((x) => x.key === k)).flatMap(([, v]) => v);
  if (new Set(enemies).size !== enemies.length) err("choice:ranger:favored-enemy-5", "Each favored enemy must be a different type (Classes II, Ranger, Favored Enemy).");

  // ---- In play ----
  if (c.active?.rage && !d.classLevels.barbarian) err("active.rage", "Only a barbarian can rage (Classes I, Barbarian, Rage).");

  // ---- Languages (Races, Race and Languages; Skills II, Speak Language) ----
  const extra = c.languages.filter((l) => !d.autoLanguages.includes(l));
  if (new Set(c.languages).size !== c.languages.length) err("languages", "Each language can be chosen only once.");
  for (const l of c.languages) {
    if (!LANGUAGES.includes(l)) err("languages", `${l} isn't on the SRD's language table (Skills II, Speak Language).`);
    else if (SECRET_LANGUAGES.includes(l) && !d.classLevels.druid) err("languages", `${l} is a secret language (Races, Race and Languages).`);
  }
  const allowed = d.bonusLanguageCount + d.speakLanguageRanks;
  if (extra.length > allowed) err("languages", `You know ${allowed} extra language${allowed === 1 ? "" : "s"} (Intelligence bonus at 1st level, plus ranks in Speak Language); ${extra.length} are chosen.`);
  else {
    // Bonus languages for Intelligence come from the race's list (plus class languages); Speak Language buys any.
    const offList = d.bonusLanguagePool === "any" ? [] : extra.filter((l) => !d.bonusLanguagePool.includes(l));
    if (offList.length > d.speakLanguageRanks) err("languages", `${offList.join(", ")} isn't one of your race's bonus languages; learning it takes a rank in Speak Language (Skills II, Speak Language).`);
    if (extra.length < allowed) todo("languages", `Choose ${allowed - extra.length} more language${allowed - extra.length === 1 ? "" : "s"}.`);
  }

  // ---- Hit points and trackers ----
  // Abilities and Conditions: dying at −1 to −9, dead at −10.
  if (d.hpMax !== null && c.hp.current !== null && c.hp.current > d.hpMax) err("hp.current", `Hit points can't go above the maximum, ${d.hpMax}.`);
  if (c.hp.current !== null && c.hp.current < -10) err("hp.current", "At −10 hit points a character is dead (Abilities and Conditions, Dead).");
  for (const r of d.resources) if (r.used > r.max) err(`used.${r.key}`, `${r.name} has ${r.max} uses.`);
  for (const sc of d.casting) {
    sc.used.forEach((u, L) => { const lv = sc.levels[L]; if (u > (lv?.total ?? 0)) err(`slots.${sc.cls.id}.${L}`, `${sc.cls.name} has ${lv?.total ?? 0} spells of level ${L} per day.`); });
    const mine = c.spells.filter((s) => s.classId === sc.cls.id && s.name);
    // Every spell comes from the class's own list (Spell List I and II), a cleric's domain slot from one of the two
    // domains, and a specialist wizard never casts from a prohibited school (Classes II, Wizard).
    const list = listFor(sc.cls.id);
    const prohibited = sc.cls.id === "wizard" ? (c.choices["wizard:prohibited-schools"] || []) : [];
    for (const s of mine) {
      if (s.domain) {
        if (sc.cls.id !== "cleric") { err(`spells.${sc.cls.id}`, `${s.name}: only a cleric has domain spells.`); continue; }
        if (!d.domains.some((dm) => dm.spells.some((x) => x.level === s.level && norm(x.name) === norm(s.name)))) {
          err(`spells.${sc.cls.id}`, `${s.name} isn't a level ${s.level} spell of your domains (Spell List I, Cleric Domains).`);
        }
        continue;
      }
      const entry = findSpell(list, s.name, s.level);
      if (!entry) err(`spells.${sc.cls.id}`, `${s.name} isn't on the ${sc.cls.name.toLowerCase()} list at level ${s.level} (Spell List ${["bard", "cleric"].includes(sc.cls.id) ? "I" : "II"}).`);
      else if (entry.school && prohibited.includes(entry.school)) err(`spells.${sc.cls.id}`, `${s.name} is ${entry.school}, a school you gave up (Classes II, Wizard).`);
    }
    for (let L = 0; L <= 9; L++) {
      const lv = sc.levels[L];
      const atLevel = mine.filter((s) => s.level === L);
      if (!lv && atLevel.length) { err(`spells.${sc.cls.id}`, `${sc.cls.name} level ${sc.n} can't cast level ${L} spells yet.`); continue; }
      if (!lv) continue;
      if (!sc.prepares && lv.known !== null && atLevel.length > lv.known) err(`spells.${sc.cls.id}`, `${sc.cls.name} level ${sc.n} knows ${lv.known} spells of level ${L}; ${atLevel.length} are listed (${sc.cite}).`);
      const prepared = atLevel.filter((x) => !x.domain).reduce((s, x) => s + (x.prepared || 0), 0);
      const inDomain = atLevel.filter((x) => x.domain).reduce((s, x) => s + (x.prepared || 0), 0);
      // The domain slot holds a domain spell only (Classes I, Cleric, Spells); the rest of the slots hold anything.
      const domainSlots = sc.cls.id === "cleric" && lv.canCast ? lv.extra : 0;
      if (inDomain > domainSlots) err(`spells.${sc.cls.id}`, `A cleric prepares ${domainSlots} domain spell${domainSlots === 1 ? "" : "s"} of level ${L}; ${inDomain} are prepared.`);
      // Classes II, Wizard: the specialist's extra slot holds a spell "of her specialty school".
      const spec = sc.cls.id === "wizard" ? (c.choices["wizard:specialization"] || [])[0] : "";
      if (spec && lv.canCast) {
        const offSchool = atLevel.filter((x) => findSpell(list, x.name, L)?.school !== spec).reduce((s, x) => s + (x.prepared || 0), 0);
        if (offSchool > lv.total - 1) err(`spells.${sc.cls.id}`, `Only ${lv.total - 1} level ${L} spells can be from outside ${spec}; the specialist's extra spell must be ${spec} (Classes II, Wizard).`);
      }
      if (sc.prepares && prepared > lv.total - domainSlots) err(`spells.${sc.cls.id}`, `${sc.cls.name} prepares ${lv.total - domainSlots} spells of level ${L} a day${domainSlots ? " besides the domain spell" : ""}; ${prepared} are prepared.`);
    }
  }
  for (const s of c.spells) if (s.classId && !d.classLevels[s.classId]) todo("spells", `"${s.name || "A spell"}" belongs to a class this character doesn't have.`);

  // ---- Equipment ----
  if (c.armorId && (!armorById(c.armorId) || !["light", "medium", "heavy"].includes(armorById(c.armorId).kind))) err("armorId", "Pick armor from the Armor table.");
  if (c.shieldId && armorById(c.shieldId)?.kind !== "shield") err("shieldId", "Pick a shield from the Armor and Shields table.");
  return out;
}

export { FEATS };
