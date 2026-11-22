// The 3.5 character: only what the player chose. Every computed number comes from derive().
// sanitize() copies an untrusted object field by field into a fresh default, checking type and range.
//
// Multiclassing is one list: levels[i] is character level i + 1 and records the class taken at that level,
// the Hit Die rolled for it, the skill points spent at it, and (at levels 4, 8, …) the ability raised.

import { ABILITY_IDS, SKILL_IDS, MAX_LEVEL } from "./data/rules.js";

export const SCHEMA_VERSION = 1;
// Migrations: MIGRATIONS[v] turns a version-v character into version v+1. None yet.
export const MIGRATIONS = {};

export const newLevel = (classId = "") => ({ classId, hp: null, skills: {}, increase: "" });

export function defaultCharacter() {
  return {
    name: "", player: "", alignment: "", deity: "", xp: 0,
    raceId: "",
    baseScores: Object.fromEntries(ABILITY_IDS.map((a) => [a, null])), // null = not entered yet: numbers show "—"
    levels: [newLevel()],
    feats: {},            // slot key → { id, detail }
    choices: {},          // "<classId>:<choiceId>" → string[]
    skillNames: { "craft-1": "", "craft-2": "", "perform-1": "", "perform-2": "", "profession-1": "", "profession-2": "" },
    languages: [],        // languages beyond the race's automatic ones
    armorId: "", shieldId: "",
    attacks: [],          // { weaponId, rating? } or { name, bonus, damage, notes } (rating: a composite bow's strength rating)
    inventory: [],        // { name, qty, weight }
    coins: { cp: 0, sp: 0, gp: 0, pp: 0 },
    hp: { current: null, temp: 0, nonlethal: 0 },   // current null = at maximum
    used: {},             // resource key → uses spent
    slotsUsed: {},        // classId → [10] spell slots spent per spell level
    spells: [],           // { classId, name, level, prepared, domain } (domain: a cleric's domain-slot spell)
    // In play (saved like current HP): rage on, the inspire courage bonus received (0 = none), and the favored enemy
    // being fought (an option id from the ranger's favored enemy choices, "" = none).
    active: { rage: false, courage: 0, favoredEnemy: "" },
    notes: { appearance: "", backstory: "", notes: "" },
    freeEdit: false,
  };
}

// ---------- sanitize: untrusted → clean ----------

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const str = (v, max = 200) => (typeof v === "string" ? v.slice(0, max) : undefined);
const id = (v) => (typeof v === "string" && /^[a-z0-9-]{1,60}$/.test(v) ? v : undefined);
const idOrEmpty = (v) => (v === "" ? "" : id(v));
const int = (v, min, max) => (Number.isInteger(v) && v >= min && v <= max ? v : undefined);
const bool = (v) => (typeof v === "boolean" ? v : undefined);
const set = (target, key, value) => { if (value !== undefined) target[key] = value; };
// Own enumerable keys only, never prototype keys like "__proto__".
const entries = (v, limit = 200) => (isObj(v) ? Object.keys(v).filter((k) => k !== "__proto__" && k !== "constructor" && k !== "prototype").slice(0, limit).map((k) => [k, v[k]]) : []);
const KEY = /^[a-z0-9:-]{1,80}$/;

function cleanLevel(raw) {
  const lv = newLevel();
  if (!isObj(raw)) return lv;
  set(lv, "classId", idOrEmpty(raw.classId));
  if (raw.hp === null) lv.hp = null; else set(lv, "hp", int(raw.hp, 1, 12));
  for (const [k, v] of entries(raw.skills)) if (SKILL_IDS.includes(k) && int(v, 0, 200) !== undefined && v > 0) lv.skills[k] = v;
  if (raw.increase === "" || ABILITY_IDS.includes(raw.increase)) lv.increase = raw.increase;
  return lv;
}

export function sanitize(raw) {
  const c = defaultCharacter();
  if (!isObj(raw)) return c;
  set(c, "name", str(raw.name));
  set(c, "player", str(raw.player));
  set(c, "alignment", str(raw.alignment, 40));
  set(c, "deity", str(raw.deity, 80));
  set(c, "xp", int(raw.xp, 0, 100_000_000));
  set(c, "raceId", idOrEmpty(raw.raceId));
  for (const a of ABILITY_IDS) {
    const v = raw.baseScores?.[a];
    if (v === null) c.baseScores[a] = null; else set(c.baseScores, a, int(v, 1, 99));
  }
  if (Array.isArray(raw.levels) && raw.levels.length) c.levels = raw.levels.slice(0, MAX_LEVEL).map(cleanLevel);
  for (const [k, v] of entries(raw.feats)) {
    if (!KEY.test(k) || !isObj(v)) continue;
    c.feats[k] = { id: idOrEmpty(v.id) ?? "", detail: str(v.detail, 80) ?? "" };
  }
  for (const [k, v] of entries(raw.choices)) {
    if (!KEY.test(k) || !Array.isArray(v)) continue;
    c.choices[k] = v.slice(0, 20).filter((x) => typeof x === "string").map((x) => x.slice(0, 200));
  }
  for (const k of Object.keys(c.skillNames)) set(c.skillNames, k, str(raw.skillNames?.[k], 60));
  if (Array.isArray(raw.languages)) c.languages = raw.languages.slice(0, 30).filter((x) => typeof x === "string").map((x) => x.slice(0, 40));
  set(c, "armorId", idOrEmpty(raw.armorId));
  set(c, "shieldId", idOrEmpty(raw.shieldId));
  if (Array.isArray(raw.attacks)) {
    c.attacks = raw.attacks.slice(0, 50).filter(isObj).map((a) => (id(a.weaponId)
      ? (int(a.rating, 0, 10) !== undefined ? { weaponId: a.weaponId, rating: a.rating } : { weaponId: a.weaponId })
      : { name: str(a.name, 80) ?? "", bonus: str(a.bonus, 30) ?? "", damage: str(a.damage, 80) ?? "", notes: str(a.notes, 200) ?? "" }));
  }
  if (Array.isArray(raw.inventory)) {
    c.inventory = raw.inventory.slice(0, 200).filter(isObj)
      .map((it) => ({ name: str(it.name, 120) ?? "", qty: int(it.qty, 0, 100000) ?? 1, weight: typeof it.weight === "number" && Number.isFinite(it.weight) && it.weight >= 0 && it.weight <= 100000 ? it.weight : 0 }));
  }
  for (const k of Object.keys(c.coins)) set(c.coins, k, int(raw.coins?.[k], 0, 100_000_000));
  if (isObj(raw.hp)) {
    c.hp.current = raw.hp.current === null ? null : (int(raw.hp.current, -1000, 10000) ?? null);
    set(c.hp, "temp", int(raw.hp.temp, 0, 10000));
    set(c.hp, "nonlethal", int(raw.hp.nonlethal, 0, 10000));
  }
  for (const [k, v] of entries(raw.used)) if (KEY.test(k) && int(v, 0, 10000) !== undefined) c.used[k] = v;
  for (const [k, v] of entries(raw.slotsUsed, 20)) {
    if (!id(k) || !Array.isArray(v)) continue;
    c.slotsUsed[k] = Array.from({ length: 10 }, (_, i) => int(v[i], 0, 100) ?? 0);
  }
  if (Array.isArray(raw.spells)) {
    c.spells = raw.spells.slice(0, 400).filter(isObj).map((s) => ({
      classId: idOrEmpty(s.classId) ?? "", name: str(s.name, 80) ?? "", level: int(s.level, 0, 9) ?? 0, prepared: int(s.prepared, 0, 20) ?? 0, domain: bool(s.domain) ?? false,
    }));
  }
  if (isObj(raw.active)) {
    set(c.active, "rage", bool(raw.active.rage));
    set(c.active, "courage", int(raw.active.courage, 0, 4));
    set(c.active, "favoredEnemy", idOrEmpty(raw.active.favoredEnemy));
  }
  for (const k of Object.keys(c.notes)) set(c.notes, k, str(raw.notes?.[k], 20000));
  set(c, "freeEdit", bool(raw.freeEdit));
  return c;
}

/** What goes in a saved file: the character's choices, never derived numbers. */
export const toSaveData = (c) => structuredClone(c);
