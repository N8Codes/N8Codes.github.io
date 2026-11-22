// Tests for the 3.5 SRD character sheet. Run from the repo root:  node --test '_tests/*.test.mjs'
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import "./dom-stub.mjs";
import srd35 from "../sheets/systems/srd35/index.js";
import srd5 from "../sheets/systems/srd5/index.js";
import { CLASSES } from "../sheets/systems/srd35/data/classes.js";
import { FEATS, featById } from "../sheets/systems/srd35/data/feats.js";
import { WEAPONS, weaponById } from "../sheets/systems/srd35/data/equipment.js";
import { RACES } from "../sheets/systems/srd35/data/races.js";
import { BAB, SAVE, SKILL_IDS, bonusSpells, expandSkills, carryingCapacity, iterativeAttacks } from "../sheets/systems/srd35/data/rules.js";
import { newLevel } from "../sheets/systems/srd35/model.js";
import { exportEnvelope, importEnvelope, ImportRefused } from "../sheets/core/files.js";
import { decideEdit } from "../sheets/core/edits.js";
import { OGL_TEXT } from "../sheets/systems/srd35/license.js";

const { defaultCharacter, derive, validate, randomCharacter, sanitize } = srd35;
const errorsOf = (c) => validate(c, derive(c)).filter((p) => p.severity === "error");
const level = (classId, extra = {}) => ({ ...newLevel(classId), ...extra });

/** Bram: Dwarf Fighter 1, scale mail and heavy wooden shield, dwarven waraxe. Worked by hand from the SRD. */
function bram() {
  const c = defaultCharacter();
  Object.assign(c, { name: "Bram", raceId: "dwarf", alignment: "Lawful Neutral",
    baseScores: { str: 15, dex: 13, con: 14, int: 10, wis: 12, cha: 8 },
    levels: [level("fighter", { skills: { climb: 4, intimidate: 4 } })],
    feats: { "level-1": { id: "power-attack", detail: "" }, "fighter-1": { id: "weapon-focus", detail: "waraxe-dwarven" } },
    armorId: "scale-mail", shieldId: "shield-heavy-wooden", attacks: [{ weaponId: "waraxe-dwarven" }] });
  return c;
}

/** Pip: Halfling Rogue 2 / Wizard 1. Multiclass base attack, saves, skill points, cross-class ranks. */
function pip() {
  const c = defaultCharacter();
  Object.assign(c, { name: "Pip", raceId: "halfling", alignment: "Chaotic Neutral",
    baseScores: { str: 10, dex: 15, con: 12, int: 14, wis: 10, cha: 13 },
    levels: [
      level("rogue", { skills: { hide: 4, "move-silently": 4, spot: 4, listen: 4, search: 4, "disable-device": 4, "open-lock": 4, tumble: 4, bluff: 4, "sleight-of-hand": 4 } }),
      level("rogue", { hp: 4, skills: { hide: 1, "move-silently": 1, spot: 1, listen: 1, search: 1, tumble: 1, bluff: 1, "disable-device": 1, "open-lock": 1, "sleight-of-hand": 1 } }),
      level("wizard", { hp: 3, skills: { spellcraft: 2, hide: 1, "knowledge-arcana": 1 } }),
    ],
    feats: { "level-1": { id: "dodge", detail: "" }, "level-3": { id: "mobility", detail: "" } },
    languages: ["Elven", "Gnome"] });
  return c;
}

/** Sela: Human Monk 1. */
function sela() {
  const c = defaultCharacter();
  Object.assign(c, { name: "Sela", raceId: "human", alignment: "Lawful Neutral",
    baseScores: { str: 12, dex: 14, con: 12, int: 10, wis: 15, cha: 8 },
    levels: [level("monk", { skills: { tumble: 4, balance: 4, jump: 4, "move-silently": 4, hide: 4 } })],
    feats: { "level-1": { id: "dodge", detail: "" }, human: { id: "improved-initiative", detail: "" }, "monk-1": { id: "stunning-fist", detail: "" } },
    languages: [] });
  return c;
}

// ---------- reference characters ----------

test("Bram (Dwarf Fighter 1) matches the hand-worked numbers", () => {
  const d = derive(bram());
  assert.deepEqual(d.scores, { str: 15, dex: 13, con: 16, int: 10, wis: 12, cha: 6 }); // Races, Dwarves: +2 Con, −2 Cha
  assert.equal(d.hpMax, 13);           // d10 maximum + Con 3
  assert.equal(d.bab, 1);
  assert.deepEqual([d.saves.fort.total, d.saves.ref.total, d.saves.will.total], [5, 1, 1]);
  assert.equal(d.ac, 17);              // 10 + scale mail 4 + heavy shield 2 + Dex 1 (max 3)
  assert.equal(d.touch, 11);
  assert.equal(d.flatFooted, 16);
  assert.equal(d.speed, 20);           // dwarves aren't slowed by medium armor
  assert.equal(d.grapple, 3);
  assert.equal(d.points[0], 8);        // (2 + Int 0) × 4
  assert.equal(d.skills.climb.total, 0);       // 4 ranks + Str 2 − armor 6
  assert.equal(d.skills.intimidate.total, 2);  // 4 ranks − Cha 2
  assert.deepEqual(d.attacks[0].attacks, [4]); // BAB 1 + Str 2 + Weapon Focus 1 (proficient through weapon familiarity)
  assert.equal(d.attacks[0].damage, "1d10+2");
  assert.deepEqual(errorsOf(bram()), []);
});

test("Pip (Halfling Rogue 2 / Wizard 1): multiclass sums, cross-class half ranks, bonus spells", () => {
  const c = pip();
  const d = derive(c);
  assert.deepEqual(d.scores, { str: 8, dex: 17, con: 12, int: 14, wis: 10, cha: 13 });
  assert.equal(d.bab, 1);                       // rogue 2: +1, wizard 1: +0
  assert.deepEqual([d.baseSaves.fort, d.baseSaves.ref, d.baseSaves.will], [0, 3, 2]);
  assert.deepEqual([d.saves.fort.total, d.saves.ref.total, d.saves.will.total], [2, 7, 3]); // + abilities + halfling 1
  assert.equal(d.hpMax, 16);                    // (6+1) + (4+1) + (3+1)
  assert.equal(d.ac, 14);                       // 10 + Dex 3 + Small 1
  assert.equal(d.grapple, -4);                  // 1 − 1 − 4
  assert.deepEqual(d.points, [40, 10, 4]);      // (8+2)×4, 8+2, 2+2
  assert.equal(d.ranks.hide, 5.5);              // 4 + 1 (rogue) + ½ (cross-class at the wizard level)
  assert.equal(d.skills.hide.total, 12);        // 5 + Dex 3 + size 4
  assert.equal(d.skills["move-silently"].total, 10); // 5 + Dex 3 + halfling 2
  assert.equal(d.skills.spellcraft.total, 4);   // 2 + Int 2
  const wiz = d.casting.find((x) => x.cls.id === "wizard");
  assert.deepEqual([wiz.levels[0].total, wiz.levels[1].total, wiz.levels[1].dc], [3, 2, 13]); // 3; 1 + 1 bonus (Int +2); 10 + 1 + 2
  assert.equal(d.sneakAttack, "+1d6");
  assert.ok(d.feats.some((f) => f.feat.id === "scribe-scroll"));
  assert.deepEqual(errorsOf(c), []);
});

test("Sela (Human Monk 1): Wisdom to AC unarmored, monk unarmed damage, waived bonus-feat prerequisites", () => {
  const c = sela();
  const d = derive(c);
  assert.equal(d.ac, 14);                       // 10 + Dex 2 + Wis 2
  assert.equal(d.touch, 14);
  assert.equal(d.flatFooted, 12);
  assert.equal(d.unarmed.damage, "1d6+1");
  assert.equal(d.flurry, "-2/-2");
  assert.equal(d.initiative, 6);                // Dex 2 + Improved Initiative 4
  assert.deepEqual([d.saves.fort.total, d.saves.ref.total, d.saves.will.total], [3, 4, 4]);
  assert.equal(d.points[0], 20);                // (4 + 0 + human 1) × 4
  assert.deepEqual(errorsOf(c), []);            // Stunning Fist as a monk bonus feat ignores its prerequisites
  c.armorId = "leather";
  assert.equal(derive(c).ac, 14 - 2 + 2);       // armor 2 replaces the Wisdom bonus
});

// ---------- rules and refusals ----------

test("ranks over the cap and skill points over the budget are refused; taking points back always works", () => {
  const c = bram();
  const over = structuredClone(c); over.levels[0].skills.climb = 5;
  const v = decideEdit(srd35, c, over, ["skills.1", "skill.climb"]);
  assert.equal(v.accept, false);
  assert.match(v.message, /Climb can have at most 4 ranks at level 1|has 8 skill points/);
  const back = structuredClone(over); back.levels[0].skills.climb = 4;
  assert.equal(decideEdit(srd35, over, back, ["skills.1", "skill.climb"]).accept, true);
});

test("feat prerequisites are checked at the level the feat is taken", () => {
  const c = pip();
  c.feats["level-1"] = { id: "mobility", detail: "" };
  c.feats["level-3"] = { id: "dodge", detail: "" };
  assert.ok(errorsOf(c).some((p) => p.field === "feat:level-1" && /Dodge/.test(p.message)));
  const weak = bram(); weak.baseScores.str = 12;
  assert.ok(errorsOf(weak).some((p) => /Power Attack needs Strength 13/.test(p.message)));
  const notFighter = bram(); notFighter.feats["fighter-1"] = { id: "toughness", detail: "" };
  assert.ok(errorsOf(notFighter).some((p) => p.field === "feat:fighter-1"));
});

test("class alignment rules and the monk/paladin multiclass lock", () => {
  const c = sela();
  const pal = structuredClone(c); pal.alignment = "Chaotic Good"; pal.levels[0].classId = "paladin";
  assert.ok(errorsOf(pal).some((p) => /Paladin must be lawful good/.test(p.message)));
  const m = sela(); m.levels.push(level("fighter", { hp: 5 }), level("monk", { hp: 4 }));
  assert.ok(errorsOf(m).some((p) => p.field === "level.3.class" && /can't raise/.test(p.message)));
});

test("Hit Die rolls, ability increases and levels stay in range", () => {
  const c = bram();
  c.levels.push(level("fighter", { hp: 11 }));
  assert.ok(errorsOf(c).some((p) => p.field === "level.2.hp"));
  c.levels[1].hp = 10; c.levels.push(level("fighter", { hp: 1 }), level("fighter", { hp: 7, increase: "str" }));
  const d = derive(c);
  assert.equal(d.scores.str, 16);
  assert.equal(d.hpMax, 13 + 13 + 4 + 10);   // Con +3 each level
  assert.equal(d.bab, 4);
  const bad = structuredClone(c); bad.levels[1].increase = "dex";
  assert.ok(errorsOf(bad).some((p) => p.field === "level.2.increase"));
});

test("bonus spells follow the SRD table, and a cleric gets a domain slot", () => {
  // Basics, Table: Ability Modifiers and Bonus Spells, rows +1, +5, +8, +9, +17 (1st–9th).
  const rows = { 1: [1, 0, 0, 0, 0, 0, 0, 0, 0], 5: [2, 1, 1, 1, 1, 0, 0, 0, 0], 8: [2, 2, 2, 2, 1, 1, 1, 1, 0], 9: [3, 2, 2, 2, 2, 1, 1, 1, 1], 17: [5, 4, 4, 4, 4, 3, 3, 3, 3] };
  for (const [m, want] of Object.entries(rows)) assert.deepEqual(Array.from({ length: 9 }, (_, i) => bonusSpells(Number(m), i + 1)), want, `modifier +${m}`);
  const c = sela(); c.alignment = "Neutral Good"; c.levels = [level("cleric")]; c.feats = {}; c.choices = { "cleric:domains": ["good", "healing"] };
  const cl = derive(c).casting[0];
  assert.deepEqual([cl.levels[0].total, cl.levels[1].total], [3, 3]); // 3; 1 + 1 bonus (Wis +2) + 1 domain
});

test("tables: class progressions match the patterns; 20 rows; ids resolve", () => {
  assert.equal(CLASSES.length, 11);
  for (const cls of CLASSES) {
    assert.equal(cls.table.length, 20, cls.id);
    cls.table.forEach((row, i) => {
      assert.equal(row.bab, BAB[cls.bab](i + 1), `${cls.id} ${i + 1} bab`);
      for (const s of ["fort", "ref", "will"]) assert.equal(row[s], SAVE[cls.saves[s]](i + 1), `${cls.id} ${i + 1} ${s}`);
    });
    if (cls.spells) for (const t of [cls.spells.perDay, cls.spells.known].filter(Boolean)) { assert.equal(t.length, 20); for (const r of t) assert.equal(r.length, 10); }
    for (const w of cls.proficiencies.weapons) assert.ok(weaponById(w), `${cls.id} weapon ${w}`);
    for (const s of expandSkills(cls.classSkills)) assert.ok(SKILL_IDS.includes(s), `${cls.id} skill ${s}`);
    for (const g of cls.grantedFeats) assert.ok(featById(g.feat), `${cls.id} feat ${g.feat}`);
    for (const b of cls.bonusFeats) for (const f of b.from.feats || []) assert.ok(featById(f), `${cls.id} bonus ${f}`);
  }
  for (const r of RACES) for (const w of [...r.bonusWeapons, ...r.weaponFamiliarity]) assert.ok(weaponById(w), `${r.id} ${w}`);
  for (const f of FEATS) for (const p of f.prereq.feats || []) assert.ok(featById(p), `${f.id} needs ${p}`);
  assert.deepEqual(iterativeAttacks(16), [16, 11, 6, 1]);
  assert.deepEqual(carryingCapacity(10), [33, 66, 100]);
  assert.deepEqual(carryingCapacity(30), [532, 1064, 1600]); // Tremendous Strength: the 20 row × 4
  assert.deepEqual(carryingCapacity(10, "Small"), [24, 49, 75]);
});

// ---------- files ----------

test("export then import gives identical JSON; the OGL travels with the file", () => {
  for (const c of [bram(), pip(), sela(), randomCharacter({ levels: Array(12).fill(0) })]) {
    const text = exportEnvelope(srd35, c);
    const back = importEnvelope(text, srd35, { srd35, srd5 });
    assert.deepEqual(srd35.toSaveData(back), srd35.toSaveData(c));
    assert.ok(JSON.parse(text).license.includes("OPEN GAME LICENSE Version 1.0a"));
  }
  const c = pip(); c.inventory.push({ name: "Rope", qty: 1, weight: 10 }); c.inventory.splice(0, 1);
  assert.deepEqual(importEnvelope(exportEnvelope(srd35, c), srd35, {}), sanitize(structuredClone(c)));
});

test("hostile files: wrong system refused, junk cleaned, never trusted", () => {
  assert.throws(() => importEnvelope(exportEnvelope(srd5, srd5.defaultCharacter()), srd35, { srd35, srd5 }), ImportRefused);
  const evil = { format: "n8codes-character-sheet", schemaVersion: 1, system: "srd35", character: {
    name: "<img src=x onerror=alert(1)>", raceId: "../../etc", baseScores: { str: "99999", dex: -4, con: 1e9 },
    levels: [{ classId: "fighter", hp: 999, skills: { climb: 1e6, __proto__: { polluted: true }, "not-a-skill": 3 }, increase: "luck" }],
    feats: { "__proto__": { id: "x" }, "level-1": { id: "<b>", detail: 5 } }, choices: { "a:b": [1, "ok"] }, spells: [{ classId: "wizard", name: 3, level: 12 }] } };
  const c = importEnvelope(JSON.stringify(evil), srd35, {});
  assert.equal(c.name, "<img src=x onerror=alert(1)>"); // kept as text; the views only ever set textContent
  assert.equal(c.raceId, "");
  assert.deepEqual(c.baseScores, { str: null, dex: null, con: null, int: null, wis: null, cha: null });
  assert.deepEqual(c.levels[0], { classId: "fighter", hp: null, skills: {}, increase: "" });
  assert.equal({}.polluted, undefined);
  assert.equal(c.feats["level-1"].id, "");
  assert.deepEqual(c.choices["a:b"], ["ok"]);
  assert.deepEqual(c.spells[0], { classId: "wizard", name: "", level: 0, prepared: 0, domain: false });
});

test("fuzz: corrupted files never crash the rules, the views or the printout", () => {
  const junk = [null, 0, -1, 1e9, "x", "", [], {}, [1, 2], { a: 1 }, true, "__proto__", NaN];
  const keys = ["name", "raceId", "baseScores", "levels", "feats", "choices", "skillNames", "languages", "armorId", "shieldId", "attacks", "inventory", "coins", "hp", "used", "slotsUsed", "spells", "notes", "freeEdit", "alignment"];
  const ctxFor = (c) => { const d = derive(c); return { c, d, all: validate(c, d), step: 0, edit() {}, editText() {}, refresh() {}, setStep() {}, setStatus() {}, messagesFor: () => [] }; };
  for (let i = 0; i < 1200; i++) {
    const raw = structuredClone(i % 2 ? pip() : bram());
    for (let n = 0; n < 3; n++) {
      const k = keys[Math.floor(Math.random() * keys.length)];
      raw[k] = junk[Math.floor(Math.random() * junk.length)];
      if (Array.isArray(raw.levels) && raw.levels[0] && typeof raw.levels[0] === "object") raw.levels[0][["classId", "hp", "skills", "increase"][n]] = junk[i % junk.length];
    }
    const c = sanitize(raw);
    const ctx = ctxFor(c);
    srd35.toText(c, ctx.d);
    srd35.renderSheet(ctx);
    for (let s = 0; s < srd35.guidedSteps.length; s++) srd35.renderGuided({ ...ctx, step: s });
  }
});

// ---------- random characters and views ----------

test("random characters at every level pass every rule check", () => {
  for (let i = 0; i < 600; i++) {
    const c = randomCharacter({ levels: Array(1 + (i % 20)).fill(0) });
    const errs = errorsOf(c);
    assert.deepEqual(errs, [], `${c.raceId} ${c.levels[0].classId} ${c.levels.length}: ${JSON.stringify(errs)}`);
  }
});

test("a new character shows unknown numbers, not zeros, and both views render", () => {
  const c = defaultCharacter();
  const d = derive(c);
  assert.equal(d.scoresKnown, false);
  assert.equal(d.hpMax, null);
  assert.equal(d.mod.str, null);
  const ctx = { c, d, all: validate(c, d), step: 0, edit() {}, editText() {}, refresh() {}, setStep() {}, setStatus() {}, messagesFor: () => [] };
  srd35.renderSheet(ctx);
  for (let s = 0; s < srd35.guidedSteps.length; s++) srd35.renderGuided({ ...ctx, step: s });
  assert.match(srd35.toText(c, d), /END OF LICENSE/);
});

// ---------- license line ----------

test("no Product Identity or trademark in the 3.5 sheet's own content, and no markup sinks", async () => {
  const dir = new URL("../sheets/systems/srd35/", import.meta.url);
  const files = [];
  for (const sub of ["", "data/", "classes/"]) for (const f of await readdir(new URL(sub, dir))) if (f.endsWith(".js")) files.push(new URL(sub + f, dir));
  // The license file quotes the OGL itself, which names its owner; everything else must stay clear (OGL Section 7).
  const banned = /Dungeons\s*&\s*Dragons|\bD&D\b|d20 System|Wizards of the Coast|Player.s Handbook|Dungeon Master|Monster Manual|Forgotten Realms|Faer[uû]n|innerHTML|insertAdjacentHTML|outerHTML/;
  for (const f of files) {
    if (f.pathname.endsWith("/license.js")) continue;
    const text = await readFile(f, "utf8");
    assert.doesNotMatch(text, banned, f.pathname);
  }
  assert.match(OGL_TEXT, /^OPEN GAME LICENSE Version 1\.0a[\s\S]*15\. COPYRIGHT NOTICE[\s\S]*System Reference Document Copyright 2000-2003[\s\S]*END OF LICENSE$/);
  assert.equal(srd35.label.includes("D&D") || srd35.subtitle.includes("D&D"), false);
});

// ---------- languages and spells known (review, 2026-11-22) ----------

test("languages: Intelligence bonus from the race list, Speak Language for anything else, Druidic for druids only", () => {
  const c = pip(); // Halfling, Int 14 at 1st level: two bonus languages from Dwarven, Elven, Gnome, Goblin, Orc (or Draconic as a wizard)
  assert.deepEqual(errorsOf(c), []);
  const off = pip(); off.languages = ["Elven", "Undercommon"];
  assert.ok(errorsOf(off).some((p) => p.field === "languages" && /Undercommon/.test(p.message)));
  off.levels[1].skills["speak-language"] = 1; // cross-class for a rogue: ½ rank, no language yet
  assert.ok(errorsOf(off).some((p) => p.field === "languages"));
  off.levels[1].skills["speak-language"] = 2; // a full rank of Speak Language pays for it
  assert.deepEqual(errorsOf(off).filter((p) => p.field === "languages"), []);
  const many = pip(); many.languages = ["Elven", "Gnome", "Orc"];
  assert.ok(errorsOf(many).some((p) => p.field === "languages" && /2 extra languages/.test(p.message)));
  const secret = sela(); secret.baseScores.int = 12; secret.languages = ["Druidic"];
  assert.ok(errorsOf(secret).some((p) => /secret language/.test(p.message)));
  const druid = sela(); druid.alignment = "Neutral"; druid.levels = [level("druid")]; druid.feats = { "level-1": { id: "alertness", detail: "" }, human: { id: "iron-will", detail: "" } };
  assert.ok(derive(druid).autoLanguages.includes("Druidic"));
});

test("spontaneous casters can't list more spells than they know", () => {
  const c = sela(); c.alignment = "Chaotic Good"; c.baseScores.cha = 16; c.levels = [level("sorcerer")]; c.feats = { "level-1": { id: "alertness", detail: "" }, human: { id: "iron-will", detail: "" } };
  const known = derive(c).casting[0].levels;
  assert.deepEqual([known[0].known, known[1].known], [4, 2]); // Classes II, Table: Sorcerer Spells Known, 1st level
  c.spells = ["Magic Missile", "Shield"].map((name) => ({ classId: "sorcerer", name, level: 1, prepared: 0 }));
  assert.deepEqual(errorsOf(c).filter((p) => p.field === "spells.sorcerer"), []);
  c.spells.push({ classId: "sorcerer", name: "Sleep", level: 1, prepared: 0 });
  assert.ok(errorsOf(c).some((p) => p.field === "spells.sorcerer" && /knows 2 spells of level 1/.test(p.message)));
  c.spells.push({ classId: "sorcerer", name: "Web", level: 2, prepared: 0 });
  assert.ok(errorsOf(c).some((p) => /can't cast level 2 spells yet/.test(p.message)));
});

// ---------- Phase 3: spells and class details (2026-11-22) ----------

test("rage adds Strength and Constitution, Will and −2 AC, and its hit points; only barbarians rage", () => {
  const c = bram(); c.levels[0].classId = "barbarian"; c.alignment = "Chaotic Neutral"; c.feats = { "level-1": { id: "power-attack", detail: "" } };
  c.armorId = "hide"; c.shieldId = "";
  const calm = derive(c);
  c.active.rage = true;
  const mad = derive(c);
  assert.equal(mad.scores.str, calm.scores.str + 4);
  assert.equal(mad.hpMax, calm.hpMax + 2);           // +4 Con = +2 hit points per level (Classes I, Barbarian, Rage)
  assert.equal(mad.saves.will.total, calm.saves.will.total + 2);
  assert.equal(mad.ac, calm.ac - 2);
  const notBarb = bram(); notBarb.active.rage = true;
  assert.ok(errorsOf(notBarb).some((p) => p.field === "active.rage"));
});

test("encumbrance: a medium load caps Dex at +3, adds −3 checks and slows a human to 20 ft", () => {
  const c = sela(); c.baseScores.dex = 18; c.baseScores.str = 10; // carrying capacity 33/66/100
  c.inventory = [{ name: "Sacks of grain", qty: 1, weight: 50 }];
  const d = derive(c);
  assert.equal(d.load, "medium");
  assert.equal(d.speed, 20);
  assert.equal(d.ac, 10 + 3);                     // Dex +4 capped at +3; the monk's Wisdom bonus needs a light load
  assert.equal(d.skills.climb.parts.find((p) => p.label === "armor").amount, -3);
});

test("composite bows add Strength up to their rating, −2 to hit above it", () => {
  const c = bram(); c.attacks = [{ weaponId: "longbow-composite", rating: 1 }];
  let a = derive(c).attacks[0];
  assert.equal(a.damage, "1d8+1");                 // Str +2, rating +1
  c.attacks[0].rating = 3;
  a = derive(c).attacks[0];
  assert.equal(a.damage, "1d8+2");
  assert.ok(a.notes.some((n) => /−2/.test(n)));
});

test("domains: class skills, War domain Weapon Focus, and the domain slot holds a domain spell only", () => {
  const c = sela(); c.alignment = "Neutral Good"; c.levels = [level("cleric")]; c.feats = { "level-1": { id: "alertness", detail: "" }, human: { id: "iron-will", detail: "" } };
  c.choices = { "cleric:domains": ["trickery", "war"], "cleric:war-weapon": ["longsword"] };
  const d = derive(c);
  assert.ok(d.skills.hide.classSkill && d.skills.bluff.classSkill);
  assert.ok(d.feats.some((f) => f.feat.id === "weapon-focus" && f.detail === "longsword"));
  assert.ok(d.weaponProf.has("longsword"));                     // clerics lack martial weapons; the War domain grants this one
  c.spells = [{ classId: "cleric", name: "Magic Weapon", level: 1, prepared: 1, domain: true }, { classId: "cleric", name: "Bless", level: 1, prepared: 2, domain: false }];
  assert.deepEqual(errorsOf(c).filter((p) => p.field.startsWith("spells")), []);
  c.spells.push({ classId: "cleric", name: "Disguise Self", level: 1, prepared: 1, domain: true });
  assert.ok(errorsOf(c).some((p) => /1 domain spell of level 1/.test(p.message)));
  c.spells = [{ classId: "cleric", name: "Fireball", level: 1, prepared: 1, domain: false }];
  assert.ok(errorsOf(c).some((p) => /isn't on the cleric list/.test(p.message)));
});

test("favored enemies: +2 each, +2 more where the ranger puts each increase; no repeats", () => {
  const c = sela(); c.alignment = "Neutral Good"; c.levels = Array.from({ length: 5 }, (_, i) => level("ranger", i ? { hp: 5 } : {}));
  c.choices = { "ranger:favored-enemy-1": ["undead"], "ranger:favored-enemy-5": ["giant"], "ranger:favored-enemy-boost-5": ["undead"] };
  const d = derive(c);
  assert.deepEqual(d.favoredEnemies.map((f) => [f.id, f.bonus]), [["undead", 4], ["giant", 2]]);
  c.active.favoredEnemy = "undead";
  assert.equal(derive(c).fighting.bonus, 4);
  c.choices["ranger:favored-enemy-5"] = ["undead"];
  assert.ok(errorsOf(c).some((p) => /different type/.test(p.message)));
});

test("wizard specialists: no spells from prohibited schools, and the extra slot is the specialty", () => {
  const c = pip(); c.levels = [level("wizard", { skills: { spellcraft: 4, "knowledge-arcana": 4, concentration: 4, "decipher-script": 4, search: 4 } })]; c.feats = { "level-1": { id: "dodge", detail: "" } };
  c.choices = { "wizard:specialization": ["evocation"], "wizard:prohibited-schools": ["enchantment", "necromancy"] };
  c.spells = [{ classId: "wizard", name: "Sleep", level: 1, prepared: 1, domain: false }];
  assert.ok(errorsOf(c).some((p) => /Sleep is enchantment/.test(p.message)));
  const lv1 = derive(c).casting[0].levels[1];
  assert.equal(lv1.total, 1 + 1 + 1);       // table 1 + Int +2 bonus 1 + specialist 1
  c.spells = [{ classId: "wizard", name: "Shield", level: 1, prepared: 3, domain: false }];
  assert.ok(errorsOf(c).some((p) => /extra spell must be evocation/.test(p.message)));
  c.spells = [{ classId: "wizard", name: "Shield", level: 1, prepared: 2, domain: false }, { classId: "wizard", name: "Magic Missile", level: 1, prepared: 1, domain: false }];
  assert.deepEqual(errorsOf(c).filter((p) => p.field.startsWith("spells")), []);
});

test("class ability numbers: turning, lay on hands, smite, trap sense", () => {
  const c = sela(); c.alignment = "Lawful Good"; c.baseScores.cha = 14; c.levels = Array.from({ length: 4 }, (_, i) => level("paladin", i ? { hp: 6 } : {}));
  const ab = Object.fromEntries(derive(c).abilities.map((a) => [a.name, a.value]));
  assert.match(ab["Turning"], /check 1d20\+2 · damage 2d6\+3/);   // paladin 4: turning level 1; Cha +2
  assert.match(ab["Lay on hands"], /^8 hit points/);              // 4 × Cha +2
  assert.match(ab["Smite evil"], /\+2 on the attack roll, \+4 damage/);
  const r = pip(); r.levels.push(level("rogue", { hp: 3 }));       // rogue 3
  assert.match(Object.fromEntries(derive(r).abilities.map((a) => [a.name, a.value]))["Trap sense"], /^\+1/);
});

test("feats built on a choice need the same choice: Weapon Specialization on Weapon Focus with that weapon", () => {
  const c = bram(); c.levels.push(level("fighter", { hp: 6 }), level("fighter", { hp: 6 }), level("fighter", { hp: 6, increase: "str" }));
  c.feats["fighter-4"] = { id: "weapon-specialization", detail: "battleaxe" };
  assert.ok(errorsOf(c).some((p) => p.field === "feat:fighter-4" && /Weapon Focus with the same weapon/.test(p.message)));
  c.feats["fighter-4"].detail = "waraxe-dwarven";
  assert.ok(!errorsOf(c).some((p) => p.field === "feat:fighter-4"));
});

test("weapon feats take only the weapons they allow", () => {
  const c = bram();
  c.feats["level-1"] = { id: "rapid-reload", detail: "javelin" };
  assert.ok(errorsOf(c).some((p) => /Rapid Reload is for a light, heavy or hand crossbow/.test(p.message)));
  c.feats["level-1"] = { id: "exotic-weapon-proficiency", detail: "longsword" };
  assert.ok(errorsOf(c).some((p) => /isn't an exotic weapon/.test(p.message)));
  c.feats["level-1"] = { id: "exotic-weapon-proficiency", detail: "chain-spiked" };
  assert.ok(!errorsOf(c).some((p) => p.field === "feat:level-1"));
  c.feats["level-1"] = { id: "martial-weapon-proficiency", detail: "dagger" };
  assert.ok(errorsOf(c).some((p) => /isn't a martial weapon/.test(p.message)));
});
