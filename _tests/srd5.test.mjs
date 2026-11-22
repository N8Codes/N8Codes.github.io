// Tests for the 5E character sheet. Run from the repo root:  node --test _tests/
// (_tests/ starts with an underscore, so GitHub Pages' Jekyll build doesn't publish it.)
import test from "node:test";
import assert from "node:assert/strict";
import "./dom-stub.mjs";
import srd5 from "../sheets/systems/srd5/index.js";
import { CLASSES } from "../sheets/systems/srd5/data/classes.js";
import { exportEnvelope, importEnvelope, ImportRefused, FORMAT } from "../sheets/core/files.js";
import { decideEdit } from "../sheets/core/edits.js";
import { rollDie, roll4d6KeepHighest3 } from "../sheets/core/dice.js";
import { STEPS } from "../sheets/systems/srd5/views.js";

const { defaultCharacter, derive, validate, randomCharacter, sanitize } = srd5;
const errorsOf = (c) => validate(c, derive(c)).filter((p) => p.severity === "error");

/** Mira Thorn: Human Fighter 1, Soldier, the Fighter's suggested spread +2 STR / +1 CON. */
function mira() {
  const c = defaultCharacter();
  Object.assign(c, {
    name: "Mira Thorn", classId: "fighter", backgroundId: "soldier", speciesId: "human", size: "Medium", alignment: "Neutral Good",
    abilityMethod: "point-cost", baseScores: { str: 15, dex: 14, con: 13, int: 8, wis: 10, cha: 12 },
    backgroundBonus: { str: 2, dex: 0, con: 1, int: 0, wis: 0, cha: 0 }, languages: ["dwarvish", "orc"],
    armorId: "chain-mail", attacks: [{ weaponId: "greatsword" }, { weaponId: "javelin" }, { weaponId: "shortbow" }],
  });
  c.choices = { "class:class-skills": ["perception", "survival"], "class:weapon-mastery": ["greatsword", "flail", "javelin"],
    "species:skillful": ["insight"], "background:tool": ["Gaming Set (dice)"] };
  c.feats = { background: { id: "", increase: {}, picks: [], ability: "", text: "" },
    "class:fighting-style": { id: "defense", increase: {}, picks: [], ability: "", text: "" },
    "species:versatile": { id: "skilled", increase: {}, picks: ["skill:acrobatics", "skill:history", "skill:persuasion"], ability: "", text: "" } };
  return c;
}

// ---------- reference characters, worked out by hand from the SRD ----------

test("Mira (Fighter 1) matches the hand-worked numbers", () => {
  const d = derive(mira());
  assert.deepEqual(d.scores, { str: 17, dex: 14, con: 14, int: 8, wis: 10, cha: 12 });
  assert.deepEqual(d.mod, { str: 3, dex: 2, con: 2, int: -1, wis: 0, cha: 1 });
  assert.equal(d.pb, 2);                // p.23
  assert.equal(d.ac, 17);               // Chain Mail 16 (p.92) + Defense 1 (p.88)
  assert.equal(d.initiative, 2);
  assert.equal(d.speed, 30);            // Human, p.86; Chain Mail needs STR 13, met
  assert.equal(d.hpMax, 12);            // 10 + CON 2, p.22
  assert.equal(d.passivePerception, 12); // 10 + WIS 0 + PB 2, p.22
  assert.equal(d.saves.str.total, 5);
  assert.equal(d.saves.con.total, 4);
  assert.equal(d.saves.dex.total, 2);
  const prof = Object.fromEntries(Object.entries(d.skills).filter(([, v]) => v.proficient).map(([k, v]) => [k, v.total]));
  assert.deepEqual(prof, { acrobatics: 4, athletics: 5, history: 1, insight: 2, intimidation: 3, perception: 2, persuasion: 3, survival: 2 });
  assert.deepEqual(d.attacks.map((a) => [a.name, a.bonus, a.damage, a.mastery]), [
    ["Greatsword", 5, "2d6+3 Slashing", "Graze"], ["Javelin", 5, "1d6+3 Piercing", "Slow"], ["Shortbow", 4, "1d6+2 Piercing", ""]]);
  assert.deepEqual(d.unarmed, { name: "Unarmed Strike", bonus: 5, damage: "4 Bludgeoning" });
  assert.deepEqual(d.resources.map((r) => [r.name, r.max]), [["Second Wind", 2]]);
  assert.deepEqual(validate(mira(), d), []);
});

test("Dwarf Barbarian 5: Unarmored Defense, Fast Movement, Dwarven Toughness, Rages", () => {
  const c = defaultCharacter();
  Object.assign(c, { classId: "barbarian", subclassId: "path-of-the-berserker", backgroundId: "soldier", speciesId: "dwarf", size: "Medium", level: 5,
    abilityMethod: "standard", baseScores: { str: 15, dex: 13, con: 14, int: 10, wis: 12, cha: 8 }, backgroundBonus: { str: 2, dex: 0, con: 1, int: 0, wis: 0, cha: 0 } });
  const d = derive(c);
  assert.deepEqual(d.mod, { str: 3, dex: 1, con: 2, int: 0, wis: 1, cha: -1 });
  assert.equal(d.pb, 3);
  // 12 + 2 at level 1 (p.22), then 4 × (7 + 2) (p.23), + 5 for Dwarven Toughness (p.84)
  assert.equal(d.hpMax, 14 + 36 + 5);
  assert.equal(d.ac, 13);               // 10 + DEX 1 + CON 2 (p.29)
  assert.equal(d.speed, 40);            // 30 + Fast Movement 10 (p.29)
  assert.equal(derive({ ...c, armorId: "chain-mail" }).speed, 30); // heavy armor: no Fast Movement
  assert.equal(derive({ ...c, shield: true }).ac, 15); // Barbarian may use a Shield (p.29)
  assert.equal(d.saves.str.total, 6);
  assert.equal(d.resources.find((r) => r.id === "rage").max, 3);
  assert.equal(d.darkvision, 120);
});

test("High Elf Wizard 1: spell save DC, attack, slots, cantrips, prepared", () => {
  const c = defaultCharacter();
  Object.assign(c, { classId: "wizard", backgroundId: "sage", speciesId: "elf", size: "Medium",
    abilityMethod: "standard", baseScores: { str: 8, dex: 12, con: 13, int: 15, wis: 14, cha: 10 }, backgroundBonus: { str: 0, dex: 0, con: 1, int: 2, wis: 0, cha: 0 } });
  c.choices["species:elven-lineage"] = ["high-elf"];
  const d = derive(c);
  assert.equal(d.mod.int, 3);
  assert.equal(d.spellcasting.saveDC, 13); // 8 + 3 + 2 (p.23)
  assert.equal(d.spellcasting.attack, 5);  // 3 + 2 (p.23)
  assert.equal(d.spellcasting.cantrips, 3); // Wizard table, p.77
  assert.equal(d.spellcasting.prepared, 4);
  assert.deepEqual(d.spellcasting.slots, [2, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(d.hpMax, 8);                 // 6 + CON 2 (p.22)
  assert.equal(d.ac, 11);                   // 10 + DEX 1
});

test("Monk 2: Unarmored Defense (no Shield), Unarmored Movement, Martial Arts with DEX", () => {
  const c = defaultCharacter();
  Object.assign(c, { classId: "monk", backgroundId: "criminal", speciesId: "human", size: "Medium", level: 2, abilityMethod: "standard",
    baseScores: { str: 12, dex: 15, con: 13, int: 10, wis: 14, cha: 8 }, backgroundBonus: { str: 0, dex: 2, con: 1, int: 0, wis: 0, cha: 0 }, attacks: [{ weaponId: "spear" }] });
  const d = derive(c);
  assert.equal(d.ac, 10 + 3 + 2);           // DEX 17 → +3, WIS 14 → +2 (p.50)
  assert.equal(d.speed, 40);                // 30 + 10 at level 2 (p.50)
  assert.equal(derive({ ...c, shield: true }).ac, 10 + 3); // Monk Unarmored Defense needs no Shield; plain 10 + DEX
  assert.equal(d.attacks[0].bonus, 3 + 2);  // DEX for a Monk weapon (p.50)
  assert.equal(d.attacks[0].damage, "1d6+3 Piercing");
  assert.equal(d.initiative, 3 + 2);        // Alert from Criminal adds PB (p.87)
});

// ---------- rules that refuse, and the way back ----------

test("point cost: over budget is refused with the limit named; lowering is always accepted", () => {
  const c = mira();
  const over = structuredClone(c); over.baseScores.int = 9;
  const verdict = decideEdit(srd5, c, over, ["abilities.int", "abilities"]);
  assert.equal(verdict.accept, false);
  assert.match(verdict.message, /27 points/);
  const broken = structuredClone(c); broken.baseScores.wis = 14;       // e.g. an old file, 5 over budget
  const lower = structuredClone(broken); lower.baseScores.wis = 13;
  assert.equal(decideEdit(srd5, broken, lower, ["abilities.wis", "abilities"]).accept, true);
  assert.equal(decideEdit(srd5, c, { ...over, freeEdit: true }, ["abilities.int", "abilities"]).accept, true); // Free edit
});

test("background increase only on the background's abilities, and never above 20", () => {
  const c = mira();
  c.backgroundBonus = { str: 0, dex: 0, con: 1, int: 0, wis: 2, cha: 0 };
  assert.ok(errorsOf(c).some((e) => e.field === "backgroundBonus" && /Soldier can raise only/.test(e.message)));
  const roll = mira(); roll.abilityMethod = "roll"; roll.rolls = [18, 14, 13, 12, 10, 8]; roll.baseScores = { str: 18, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };
  roll.backgroundBonus = { str: 2, dex: 0, con: 1, int: 0, wis: 0, cha: 0 };
  assert.equal(errorsOf(roll).length, 0); // 18 + 2 = 20 is allowed
  roll.feats["level-4"] = { id: "ability-score-improvement", increase: { str: 2 }, picks: [], ability: "", text: "" };
  roll.level = 4;
  assert.ok(errorsOf(roll).some((e) => /above 20/.test(e.message))); // ASI can't pass 20 (p.87)
});

test("class skills: too many, or one not on the list, are rule errors", () => {
  const c = mira();
  c.choices["class:class-skills"] = ["perception", "survival", "animal-handling"];
  assert.ok(errorsOf(c).some((e) => e.field === "choice:class:class-skills"));
  c.choices["class:class-skills"] = ["perception", "arcana"];
  assert.ok(errorsOf(c).some((e) => /Arcana isn't one of the skills/.test(e.message)));
});

test("Hit Points stay between 0 and the maximum; current HP is kept when the maximum drops", () => {
  const c = mira();
  c.hp.current = 13;
  assert.ok(errorsOf(c).some((e) => e.field === "hp.current"));
  c.hp.current = 9;
  const weaker = { ...c, baseScores: { ...c.baseScores, con: 8 } , abilityMethod: "manual", freeEdit: true };
  assert.equal(derive(weaker).hpCurrent, Math.min(9, derive(weaker).hpMax));
  assert.equal(c.hp.current, 9); // derive never writes back
});

// ---------- files ----------

test("export then import gives identical JSON, including after adding and removing rows", () => {
  const c = mira();
  c.inventory = [{ name: "Rope", qty: 1 }, { name: "Torch", qty: 5 }];
  c.inventory.splice(0, 1);
  c.attacks.push({ name: "Fire Bolt", bonus: "+5", damage: "1d10 Fire", notes: "" });
  c.attacks.splice(1, 1);
  c.spells = [{ name: "Shield", level: 1, prepared: true }];
  const text = exportEnvelope(srd5, c);
  const back = importEnvelope(text, srd5);
  const strip = (t) => { const o = JSON.parse(t); delete o.exported; return o; };
  assert.deepEqual(strip(exportEnvelope(srd5, back)), strip(text));
  for (let i = 0; i < 300; i++) {
    const r = randomCharacter({ level: 1 + (i % 20) });
    assert.deepEqual(strip(exportEnvelope(srd5, importEnvelope(exportEnvelope(srd5, r), srd5))), strip(exportEnvelope(srd5, r)));
  }
});

test("hostile files: refused or cleaned, never trusted", () => {
  const env = (character, extra = {}) => JSON.stringify({ format: FORMAT, schemaVersion: 1, system: "srd5", systemVersion: "SRD 5.2.1", character, ...extra });
  assert.throws(() => importEnvelope("<html>", srd5), ImportRefused);
  assert.throws(() => importEnvelope(JSON.stringify({ format: "other" }), srd5), ImportRefused);
  assert.throws(() => importEnvelope(env({}, { system: "pathfinder" }), srd5), /game system this page doesn't have/);
  assert.throws(() => importEnvelope(env({}, { schemaVersion: 99 }), srd5), /newer version/);
  assert.throws(() => importEnvelope(env({}, { schemaVersion: "1" }), srd5), /version/);
  assert.throws(() => importEnvelope("x".repeat(1_000_001), srd5), /too large/);
  // "PROTO" becomes a real "__proto__" key in the JSON text, the way a hostile file would carry it.
  const evilText = env({
    name: '<img src=x onerror="alert(1)">', level: 99, xp: -5, classId: "../../etc", baseScores: { str: 99999, dex: "18", con: 12 },
    choices: { PROTO: ["polluted"], "class:class-skills": ["perception", { toString: 1 }] }, hp: { current: "full", temp: -3 },
    inventory: [{ name: "Sword", qty: 1e9 }], notes: { notes: 5 }, PROTO: { polluted: true },
  }).replaceAll('"PROTO"', '"__proto__"');
  assert.match(evilText, /"__proto__"/);
  const evil = importEnvelope(evilText, srd5);
  assert.equal(evil.name, '<img src=x onerror="alert(1)">'); // kept as plain text; the page only ever sets textContent/value
  assert.equal(evil.level, 1);
  assert.equal(evil.xp, 0);
  assert.equal(evil.classId, "");
  assert.equal(evil.baseScores.str, 8);
  assert.equal(evil.baseScores.dex, 8);
  assert.equal(evil.baseScores.con, 12);
  assert.deepEqual(evil.choices["class:class-skills"], ["perception"]);
  assert.equal(Object.hasOwn(evil.choices, "__proto__"), false);
  assert.equal({}.polluted, undefined);
  assert.equal(evil.hp.current, null);
  assert.equal(evil.hp.temp, 0);
  assert.equal(evil.inventory[0].qty, 1);
  assert.equal(evil.notes.notes, "");
});

test("no code path writes markup: the 5E views never touch innerHTML", async () => {
  const { readFile } = await import("node:fs/promises");
  for (const f of ["../sheets/core/ui.js", "../sheets/core/app.js", "../sheets/systems/srd5/components.js", "../sheets/systems/srd5/views.js"]) {
    const src = await readFile(new URL(f, import.meta.url), "utf8");
    assert.doesNotMatch(src, /innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function/, f);
  }
});

// ---------- random characters and dice ----------

test("random characters at every level pass every rule check, complete", () => {
  for (let i = 0; i < 2000; i++) {
    const c = randomCharacter({ level: 1 + (i % 20) });
    assert.deepEqual(validate(c, derive(c)), [], `level ${c.level} ${c.classId}`);
  }
});

test("dice: a d20 shows every face 1..20 and nothing else; 4d6 keep 3 stays in 3..18", () => {
  const faces = new Set();
  for (let i = 0; i < 20000; i++) faces.add(rollDie(20));
  assert.equal(faces.size, 20);
  assert.equal(Math.min(...faces), 1);
  assert.equal(Math.max(...faces), 20);
  const totals = new Set();
  for (let i = 0; i < 20000; i++) totals.add(roll4d6KeepHighest3());
  assert.equal(Math.min(...totals), 3);
  assert.equal(Math.max(...totals), 18);
});

// ---------- class data, checked against the shape of the SRD tables ----------

test("class tables: 20 levels, 20 values per column, 9 slot levels, ASI levels in the features", () => {
  for (const cls of CLASSES) {
    assert.equal(Object.keys(cls.features).length, 20, cls.id);
    for (const [k, col] of Object.entries(cls.columns)) assert.equal(col.values.length, 20, `${cls.id}.${k}`);
    if (cls.spellcasting?.slots) {
      assert.equal(cls.spellcasting.slots.length, 20, cls.id);
      for (const row of cls.spellcasting.slots) assert.equal(row.length, 9, cls.id);
    }
    for (const lv of cls.asiLevels) assert.ok(cls.features[lv].includes("Ability Score Improvement"), `${cls.id} ${lv}`);
    assert.ok([6, 8, 10, 12].includes(cls.hitDie), cls.id);
  }
});

// ---------- the views render without errors, in both modes and every step ----------

test("both views render for empty, reference and random characters", () => {
  const ctxFor = (c, step = 0) => {
    const d = derive(c);
    const all = validate(c, d);
    return { c, d, all, free: c.freeEdit, step, edit: () => true, editText: () => {}, setStep: () => {}, setStatus: () => {},
      messagesFor: (k) => all.filter((p) => p.field === k).map((p) => ({ text: p.message, kind: p.severity })), problemsMatching: () => [] };
  };
  const chars = [defaultCharacter(), mira(), ...Array.from({ length: 60 }, (_, i) => randomCharacter({ level: 1 + (i % 20) }))];
  for (const c of chars) {
    srd5.renderSheet(ctxFor(c));
    for (let s = 0; s < STEPS.length; s++) srd5.renderGuided(ctxFor(c, s));
    assert.ok(srd5.toText(c, derive(c)).includes("SRD 5.2.1"));
  }
});

test("a new character has no scores yet: score-based numbers are unknown, not −1", () => {
  const c = defaultCharacter();
  const d = derive(c);
  assert.equal(c.abilityMethod, "");
  assert.equal(d.scoresKnown, false);
  assert.ok(validate(c, d).some((p) => p.field === "abilities" && p.severity === "todo"));
  const text = srd5.toText(c, d);
  assert.match(text, /Ability scores: not chosen yet/);
  assert.doesNotMatch(text, /AC 9|Initiative -1/);
  assert.equal(derive({ ...c, abilityMethod: "point-cost" }).scoresKnown, true); // point cost starts at 8, a real score
});

test("skills are ticked in the skill list: background skills locked, class picks go to the class choice", () => {
  const edits = [];
  const c = mira();
  c.choices["class:class-skills"] = ["perception"]; // one Fighter pick left
  const d = derive(c);
  const all = validate(c, d);
  const ctx = { c, d, all, step: 0, edit: (key, fn) => { const next = structuredClone(c); fn(next); edits.push({ key, next }); return true; },
    editText: () => {}, setStep: () => {}, setStatus: () => {}, messagesFor: () => [], problemsMatching: () => [] };
  const tree = srd5.renderSheet(ctx);
  const find = (node, id) => (node.id === id ? node : (node.childNodes || []).map((n) => find(n, id)).find(Boolean));
  const athletics = find(tree, "f-skill-athletics"), survival = find(tree, "f-skill-survival");
  assert.equal(athletics.disabled, true);                 // Soldier's, fixed (p.83)
  assert.equal(athletics.checked, true);
  assert.ok(!survival.disabled);                          // on the Fighter list (p.47); unset means enabled
  survival.checked = true;
  survival.listeners.change[0]({ target: survival });
  assert.equal(edits[0].key, "choice:class:class-skills");
  assert.deepEqual(edits[0].next.choices["class:class-skills"], ["perception", "survival"]);
});

test("fuzz: hostile and corrupted files never crash the rules, the views or the printout", () => {
  const nasty = ["__proto__", "constructor", "toString", "prototype", "hasOwnProperty", "", "x".repeat(300), "<b>", "skill:__proto__", "tool:constructor", "-1", "NaN"];
  let seed = 42;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2 ** 31; return seed / 2 ** 31; };
  const any = (depth = 0) => {
    const r = rnd();
    if (r < 0.15) return nasty[Math.floor(rnd() * nasty.length)];
    if (r < 0.3) return Math.floor(rnd() * 60) - 20;
    if (r < 0.38) return rnd() < 0.5;
    if (r < 0.43) return null;
    if (depth > 2) return "a";
    if (r < 0.7) return Array.from({ length: Math.floor(rnd() * 4) }, () => any(depth + 1));
    return Object.fromEntries(Array.from({ length: Math.floor(rnd() * 4) }, () => [nasty[Math.floor(rnd() * nasty.length)], any(depth + 1)]));
  };
  const ctxFor = (c, step) => {
    const d = derive(c), all = validate(c, d);
    return { c, d, all, step, edit: () => true, editText: () => {}, setStep: () => {}, setStatus: () => {}, messagesFor: () => [], problemsMatching: () => [] };
  };
  const fields = Object.keys(defaultCharacter());
  for (let i = 0; i < 1500; i++) {
    const base = i % 2 ? randomCharacter({ level: 1 + (i % 20) }) : {};
    const raw = structuredClone(base);
    for (const f of fields) if (rnd() < 0.3) raw[f] = any();
    // Plant hostile keys and picks where the sheet reads them.
    raw.choices = { ...(raw.choices || {}), "class:class-skills": [nasty[i % nasty.length]], "species:skillful": [nasty[(i + 3) % nasty.length]] };
    raw.feats = { ...(raw.feats || {}), "species:versatile": { id: "skilled", picks: [nasty[i % nasty.length], "skill:__proto__"] } };
    const text = JSON.stringify({ format: FORMAT, schemaVersion: 1, system: "srd5", systemVersion: "SRD 5.2.1", character: raw }).replaceAll('"PROTO"', '"__proto__"');
    const c = importEnvelope(text, srd5);
    const d = derive(c);
    validate(c, d);
    srd5.renderSheet(ctxFor(c, 0));
    srd5.renderGuided(ctxFor(c, i % STEPS.length));
    srd5.toText(c, d);
  }
  assert.equal({}.polluted, undefined);
});

test("review fixes: Fighting Style feat in a level slot, Grappler at the time taken, Magic Initiate lists, Breath Weapon DC", () => {
  // A Fighter has the Fighting Style feature, so a Fighting Style feat may fill a level 4 slot (p.87–88).
  const f = mira(); f.level = 4;
  f.feats["level-4"] = { id: "archery", increase: {}, picks: [], ability: "", text: "" };
  assert.deepEqual(errorsOf(f).filter((e) => e.field === "feat:level-4"), []);
  const w = defaultCharacter(); Object.assign(w, { classId: "wizard", level: 4, abilityMethod: "standard", baseScores: { str: 8, dex: 12, con: 13, int: 15, wis: 14, cha: 10 } });
  w.feats["level-4"] = { id: "archery", increase: {}, picks: [], ability: "", text: "" };
  assert.ok(errorsOf(w).some((e) => /Fighting Style feature/.test(e.message))); // a Wizard has none
  // Grappler needs STR or DEX 13 when taken; a later +2 STR doesn't fix an earlier pick (p.87).
  const g = mira(); g.level = 6;
  g.baseScores = { str: 12, dex: 10, con: 15, int: 13, wis: 14, cha: 8 };    // STR 12, DEX 11 after Soldier: neither is 13
  g.backgroundBonus = { str: 0, dex: 1, con: 2, int: 0, wis: 0, cha: 0 };
  g.feats["level-4"] = { id: "grappler", increase: { str: 1 }, picks: [], ability: "", text: "" };
  g.feats["level-6"] = { id: "ability-score-improvement", increase: { str: 2 }, picks: [], ability: "", text: "" };
  assert.ok(errorsOf(g).some((e) => e.field === "feat:level-4" && /Grappler needs/.test(e.message)));
  // Magic Initiate twice on the same list is refused (p.87).
  const h = defaultCharacter();
  Object.assign(h, { classId: "cleric", backgroundId: "acolyte", speciesId: "human", size: "Medium", abilityMethod: "standard", baseScores: { str: 14, dex: 8, con: 13, int: 10, wis: 15, cha: 12 } });
  h.feats["species:versatile"] = { id: "magic-initiate", increase: {}, picks: [], ability: "wis", text: "", list: "Cleric" };
  assert.ok(errorsOf(h).some((e) => /different spell list/.test(e.message)));
  h.feats["species:versatile"].list = "Druid";
  assert.ok(!errorsOf(h).some((e) => /different spell list/.test(e.message)));
  assert.equal(importEnvelope(exportEnvelope(srd5, h), srd5).feats["species:versatile"].list, "Druid");
  // Breath Weapon: DC 8 + CON + PB, 2d10 at level 5 (p.84).
  const b = defaultCharacter(); Object.assign(b, { classId: "fighter", speciesId: "dragonborn", level: 5, abilityMethod: "standard", baseScores: { str: 15, dex: 14, con: 13, int: 8, wis: 10, cha: 12 } });
  assert.deepEqual(derive(b).speciesDCs, [{ name: "Breath Weapon", dc: 8 + 1 + 3, damage: "2d10" }]);
});
