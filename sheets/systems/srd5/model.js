// The 5E character: only what the player chose. Every computed number comes from derive().
// sanitize() copies an untrusted object field by field into a fresh default, checking type and range.

import { ABILITY_IDS } from "./data/rules.js";

export const SCHEMA_VERSION = 1;
// Migrations: MIGRATIONS[v] turns a version-v character into version v+1. None yet.
export const MIGRATIONS = {};

const zeroAbilities = () => Object.fromEntries(ABILITY_IDS.map((a) => [a, 0]));

export function defaultCharacter() {
  return {
    name: "", player: "", alignment: "", xp: 0, level: 1,
    classId: "", subclassId: "", backgroundId: "", speciesId: "", size: "",
    abilityMethod: "",    // "" = not chosen yet: every score-based number shows "—"
    baseScores: Object.fromEntries(ABILITY_IDS.map((a) => [a, 8])),
    rolls: [],
    backgroundBonus: zeroAbilities(),
    choices: {},          // "<scope>:<choiceId>" → string[]   (scope: class, subclass, species, background)
    feats: {},            // slot → { id, increase: {ability: n}, picks: string[], ability: "", text: "" }
    languages: [],
    equipment: { classOption: "", backgroundOption: "" },
    armorId: "", shield: false,
    attacks: [],          // { weaponId } or { name, bonus, damage, notes }
    inventory: [],        // { name, qty }
    coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    hp: { current: null, temp: 0, method: "fixed", rolls: {} },   // current null = at maximum
    hitDiceSpent: 0,
    deathSaves: { successes: 0, failures: 0 },
    heroicInspiration: false,
    used: {},             // resource id → uses spent
    slotsUsed: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    pactSlotsUsed: 0,
    spells: [],           // { name, level, prepared }
    notes: { appearance: "", backstory: "", notes: "", proficiencies: "" },
    freeEdit: false,
  };
}

// ---------- sanitize: untrusted → clean ----------

const LIMITS = { text: 200, longText: 20000, list: 200 };
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const str = (v, max = LIMITS.text) => (typeof v === "string" ? v.slice(0, max) : undefined);
const id = (v) => (typeof v === "string" && /^[a-z0-9-]{1,60}$/.test(v) ? v : undefined);
const int = (v, min, max) => (Number.isInteger(v) && v >= min && v <= max ? v : undefined);
const bool = (v) => (typeof v === "boolean" ? v : undefined);
const set = (target, key, value) => { if (value !== undefined) target[key] = value; };
const strList = (v, max = LIMITS.text) => (Array.isArray(v)
  ? v.slice(0, LIMITS.list).filter((x) => typeof x === "string").map((x) => x.slice(0, max)) : undefined);
// Own enumerable keys only, never prototype keys like "__proto__".
const entries = (v) => (isObj(v) ? Object.keys(v).filter((k) => k !== "__proto__" && k !== "constructor" && k !== "prototype").slice(0, LIMITS.list).map((k) => [k, v[k]]) : []);
const KEY = /^[a-z0-9:@-]{1,80}$/;

export function sanitize(raw) {
  const c = defaultCharacter();
  if (!isObj(raw)) return c;
  set(c, "name", str(raw.name));
  set(c, "player", str(raw.player));
  set(c, "alignment", str(raw.alignment, 40));
  set(c, "xp", int(raw.xp, 0, 10_000_000));
  set(c, "level", int(raw.level, 1, 20));
  for (const k of ["classId", "subclassId", "backgroundId", "speciesId", "armorId"]) set(c, k, id(raw[k]) ?? (raw[k] === "" ? "" : undefined));
  set(c, "size", str(raw.size, 20));
  if (["", "standard", "point-cost", "roll", "manual"].includes(raw.abilityMethod)) c.abilityMethod = raw.abilityMethod;
  for (const a of ABILITY_IDS) {
    set(c.baseScores, a, int(raw.baseScores?.[a], 1, 30));
    set(c.backgroundBonus, a, int(raw.backgroundBonus?.[a], 0, 2));
  }
  if (Array.isArray(raw.rolls)) c.rolls = raw.rolls.slice(0, 6).filter((n) => int(n, 3, 18) !== undefined);
  for (const [k, v] of entries(raw.choices)) if (KEY.test(k)) { const list = strList(v, 80); if (list) c.choices[k] = list; }
  for (const [k, v] of entries(raw.feats)) {
    if (!KEY.test(k) || !isObj(v)) continue;
    const f = { id: id(v.id) ?? "", increase: {}, picks: strList(v.picks, 80) ?? [], ability: "", text: str(v.text, 2000) ?? "" };
    for (const a of ABILITY_IDS) set(f.increase, a, int(v.increase?.[a], 1, 2));
    if (ABILITY_IDS.includes(v.ability)) f.ability = v.ability;
    if (v.pattern === "2" || v.pattern === "1-1") f.pattern = v.pattern; // which ASI pattern the player picked
    if (["Cleric", "Druid", "Wizard"].includes(v.list)) f.list = v.list;  // Magic Initiate's spell list (p.87)
    c.feats[k] = f;
  }
  c.languages = (strList(raw.languages, 40) ?? []).slice(0, 20);
  if (isObj(raw.equipment)) {
    set(c.equipment, "classOption", ["A", "B", "C", ""].includes(raw.equipment.classOption) ? raw.equipment.classOption : undefined);
    set(c.equipment, "backgroundOption", ["A", "B", ""].includes(raw.equipment.backgroundOption) ? raw.equipment.backgroundOption : undefined);
  }
  set(c, "shield", bool(raw.shield));
  if (Array.isArray(raw.attacks)) {
    c.attacks = raw.attacks.slice(0, 50).filter(isObj).map((a) => (id(a.weaponId)
      ? { weaponId: a.weaponId }
      : { name: str(a.name, 80) ?? "", bonus: str(a.bonus, 20) ?? "", damage: str(a.damage, 80) ?? "", notes: str(a.notes, 200) ?? "" }));
  }
  if (Array.isArray(raw.inventory)) {
    c.inventory = raw.inventory.slice(0, LIMITS.list).filter(isObj)
      .map((it) => ({ name: str(it.name, 120) ?? "", qty: int(it.qty, 0, 100000) ?? 1 }));
  }
  for (const k of Object.keys(c.coins)) set(c.coins, k, int(raw.coins?.[k], 0, 10_000_000));
  if (isObj(raw.hp)) {
    c.hp.current = raw.hp.current === null ? null : (int(raw.hp.current, 0, 10000) ?? null);
    set(c.hp, "temp", int(raw.hp.temp, 0, 10000));
    if (raw.hp.method === "fixed" || raw.hp.method === "rolled") c.hp.method = raw.hp.method;
    for (const [k, v] of entries(raw.hp.rolls)) if (/^(?:[2-9]|1\d|20)$/.test(k) && int(v, 1, 12) !== undefined) c.hp.rolls[k] = v;
  }
  set(c, "hitDiceSpent", int(raw.hitDiceSpent, 0, 20));
  set(c.deathSaves, "successes", int(raw.deathSaves?.successes, 0, 3));
  set(c.deathSaves, "failures", int(raw.deathSaves?.failures, 0, 3));
  set(c, "heroicInspiration", bool(raw.heroicInspiration));
  for (const [k, v] of entries(raw.used)) if (id(k) && int(v, 0, 1000) !== undefined) c.used[k] = v;
  if (Array.isArray(raw.slotsUsed)) c.slotsUsed = c.slotsUsed.map((_, i) => int(raw.slotsUsed[i], 0, 20) ?? 0);
  set(c, "pactSlotsUsed", int(raw.pactSlotsUsed, 0, 10));
  if (Array.isArray(raw.spells)) {
    c.spells = raw.spells.slice(0, LIMITS.list).filter(isObj)
      .map((s) => ({ name: str(s.name, 80) ?? "", level: int(s.level, 0, 9) ?? 0, prepared: bool(s.prepared) ?? false }));
  }
  for (const k of Object.keys(c.notes)) set(c.notes, k, str(raw.notes?.[k], LIMITS.longText));
  set(c, "freeEdit", bool(raw.freeEdit));
  return c;
}

/** What goes in a saved file: the character's choices, never derived numbers. */
export const toSaveData = (c) => structuredClone(c);
