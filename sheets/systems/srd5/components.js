// Building blocks for the 5E sheet, shared by the whole sheet and the guided steps.
// Every value reaches the page as text; edits go through ctx.edit so the rules check them.

import { el, card, fieldId, fieldMessage, fieldAttrs, select, signed, labelled } from "../../core/ui.js";
import { ABILITIES, ABILITY_IDS, SKILLS, POINT_COSTS, POINT_BUY_BUDGET, STANDARD_ARRAY, STANDARD_ARRAY_BY_CLASS,
  STANDARD_LANGUAGES, RARE_LANGUAGES, LANGUAGE_CHOICES, ALIGNMENTS, XP_FOR_LEVEL } from "./data/rules.js";
import { CLASSES, classById } from "./data/classes.js";
import { SPECIES } from "./data/species.js";
import { BACKGROUNDS } from "./data/backgrounds.js";
import { FEATS, featById } from "./data/feats.js";
import { WEAPONS, ARMOR, ALL_TOOLS } from "./data/equipment.js";
import { toolOptions, masteryOptions, skillPool, abilityName } from "./derive.js";
import { applyEquipment } from "./random.js";
import { roll4d6KeepHighest3 } from "../../core/dice.js";

/** A number that depends on the ability scores: "—" until the scores exist. */
const known = (d, text) => (d.scoresKnown ? text : "\u2014");

const skillName = (id) => SKILLS.find((s) => s.id === id)?.name ?? id;
const toInt = (v, fallback = 0) => { const n = Number.parseInt(v, 10); return Number.isFinite(n) ? n : fallback; };

// ---------- generic pieces ----------

/** Checkbox list for "choose N": options [{ value, label, hint }]. */
export function pickList(ctx, { key, legend, options, max, list, toggle }) {
  const chosen = list ?? [];
  return el("fieldset", { className: "pick" },
    el("legend", {}, legend, el("span", { className: "count" }, ` ${chosen.length} of ${max} chosen`)),
    el("div", { className: "pick-grid" }, options.map((o) => {
      const id = fieldId(`${key}-${o.value}`);
      return el("label", { className: "pick-item", htmlFor: id },
        el("input", { type: "checkbox", id, checked: chosen.includes(o.value), aria: { describedby: fieldId(key) + "-msg" },
          on: { change: (e) => ctx.edit(key, (c) => toggle(c, o.value, e.target.checked)) } }),
        el("span", {}, o.label), o.hint ? el("small", {}, o.hint) : null);
    })),
    fieldMessage(ctx, key));
}

const toggleIn = (arr, value, on) => (on ? (arr.includes(value) ? arr : [...arr, value]) : arr.filter((v) => v !== value));

export function explain(text, cite) {
  return el("p", { className: "explain" }, text, cite ? el("span", { className: "cite" }, cite) : null);
}

// ---------- identity ----------

export function identity(ctx) {
  const { c } = ctx;
  const textInput = (key, label, value, set) => labelled(ctx, key, label,
    el("input", { ...fieldAttrs(ctx, key), type: "text", value, maxlength: 200, on: { input: (e) => ctx.editText((ch) => set(ch, e.target.value)) } }));
  return el("div", { className: "identity" },
    el("div", { className: "top" },
      textInput("name", "Character name", c.name, (ch, v) => { ch.name = v; }),
      classSelect(ctx),
      subclassSelect(ctx),
      labelled(ctx, "level", "Level", el("input", { ...fieldAttrs(ctx, "level"), type: "number", min: 1, max: 20, value: c.level,
        on: { change: (e) => ctx.edit("level", (ch) => { ch.level = toInt(e.target.value, ch.level); }) } })),
      labelled(ctx, "xp", "XP", el("input", { ...fieldAttrs(ctx, "xp", { className: "wide" }), type: "number", min: 0, value: c.xp,
        on: { change: (e) => ctx.edit("xp", (ch) => { ch.xp = Math.max(0, toInt(e.target.value)); }) } }))),
    el("div", { className: "top2" },
      backgroundSelect(ctx), speciesSelect(ctx),
      labelled(ctx, "alignment", "Alignment", select({ ...fieldAttrs(ctx, "alignment"), on: { change: (e) => ctx.edit("alignment", (ch) => { ch.alignment = e.target.value; }) } },
        ALIGNMENTS.map((a) => ({ value: a, label: a })), c.alignment, "—")),
      sizeSelect(ctx),
      textInput("player", "Player", c.player, (ch, v) => { ch.player = v; })));
}

export function classSelect(ctx) {
  return labelled(ctx, "classId", "Class", select({ ...fieldAttrs(ctx, "classId"), on: { change: (e) => ctx.edit("classId", (ch) => setClass(ch, e.target.value)) } },
    CLASSES.map((x) => ({ value: x.id, label: x.name })), ctx.c.classId, "Choose…"));
}
export function setClass(ch, id) {
  if (ch.classId === id) return;
  ch.classId = id;
  ch.subclassId = "";
  for (const k of Object.keys(ch.choices)) if (k.startsWith("class:") || k.startsWith("subclass:")) delete ch.choices[k];
  for (const k of Object.keys(ch.feats)) if (k.startsWith("class:") || k.startsWith("subclass:") || k.startsWith("level-")) delete ch.feats[k];
  ch.equipment.classOption = "";
  ch.used = {};
  ch.slotsUsed = ch.slotsUsed.map(() => 0);
  ch.pactSlotsUsed = 0;
  const cls = classById(id);
  if (cls?.subclass && ch.level >= cls.subclassLevel) ch.subclassId = cls.subclass.id;
}

export function subclassSelect(ctx) {
  const { c, d } = ctx;
  const cls = d.cls;
  const sub = cls?.subclass;
  const available = sub && c.level >= cls.subclassLevel;
  return labelled(ctx, "subclassId", "Subclass", select({ ...fieldAttrs(ctx, "subclassId"), disabled: !available,
    on: { change: (e) => ctx.edit("subclassId", (ch) => { ch.subclassId = e.target.value; if (!e.target.value) for (const k of Object.keys(ch.choices)) if (k.startsWith("subclass:")) delete ch.choices[k]; }) } },
  sub ? [{ value: sub.id, label: sub.name }] : [], c.subclassId, available ? "Choose…" : cls ? `From level ${cls.subclassLevel}` : "—"));
}

export function backgroundSelect(ctx) {
  return labelled(ctx, "backgroundId", "Background", select({ ...fieldAttrs(ctx, "backgroundId"), on: { change: (e) => ctx.edit("backgroundId", (ch) => setBackground(ch, e.target.value)) } },
    BACKGROUNDS.map((b) => ({ value: b.id, label: b.name })), ctx.c.backgroundId, "Choose…"));
}
export function setBackground(ch, id) {
  if (ch.backgroundId === id) return;
  ch.backgroundId = id;
  for (const a of ABILITY_IDS) ch.backgroundBonus[a] = 0;
  delete ch.choices["background:tool"];
  ch.feats.background = { id: "", increase: {}, picks: [], ability: "", text: "" };
  ch.equipment.backgroundOption = "";
}

export function speciesSelect(ctx) {
  return labelled(ctx, "speciesId", "Species", select({ ...fieldAttrs(ctx, "speciesId"), on: { change: (e) => ctx.edit("speciesId", (ch) => setSpecies(ch, e.target.value)) } },
    SPECIES.map((s) => ({ value: s.id, label: s.name })), ctx.c.speciesId, "Choose…"));
}
export function setSpecies(ch, id) {
  if (ch.speciesId === id) return;
  ch.speciesId = id;
  for (const k of Object.keys(ch.choices)) if (k.startsWith("species:")) delete ch.choices[k];
  for (const k of Object.keys(ch.feats)) if (k.startsWith("species:")) delete ch.feats[k];
  const sp = SPECIES.find((s) => s.id === id);
  ch.size = sp && sp.sizes.length === 1 ? sp.sizes[0] : "";
}

export function sizeSelect(ctx) {
  const sp = ctx.d.sp;
  const sizes = sp ? sp.sizes : ["Medium", "Small"];
  return labelled(ctx, "size", "Size", select({ ...fieldAttrs(ctx, "size"), disabled: sp && sizes.length === 1,
    on: { change: (e) => ctx.edit("size", (ch) => { ch.size = e.target.value; }) } }, sizes.map((s) => ({ value: s, label: s })), ctx.d.size, sizes.length > 1 ? "Choose…" : undefined));
}

// ---------- ability scores ----------

const METHODS = [
  { value: "standard", label: "Standard array (15, 14, 13, 12, 10, 8)" },
  { value: "point-cost", label: `Point cost (${POINT_BUY_BUDGET} points)` },
  { value: "roll", label: "Roll 4d6, keep the highest 3" },
  { value: "manual", label: "Type any scores (needs Free edit)" },
];

export function abilityMethod(ctx) {
  const { c, d } = ctx;
  const suggestion = d.cls ? STANDARD_ARRAY_BY_CLASS[d.cls.id] : null;
  return el("div", { className: "method-row" },
    labelled(ctx, "abilities.method", "How to make the six scores", select({ id: fieldId("abilities.method"),
      on: { change: (e) => ctx.edit(["abilities", "abilities.method"], (ch) => setMethod(ch, e.target.value)) } }, METHODS, c.abilityMethod, c.abilityMethod ? undefined : "Choose…")),
    c.abilityMethod === "roll" ? el("button", { type: "button", className: "btn", on: { click: () => {
      if (c.rolls.length && !confirm("Roll six new scores? Your current rolls will be replaced.")) return;
      ctx.edit("abilities", (ch) => { ch.rolls = Array.from({ length: 6 }, roll4d6KeepHighest3); ABILITY_IDS.forEach((a, i) => { ch.baseScores[a] = ch.rolls[i]; }); });
    } } }, c.rolls.length ? "Roll again" : "Roll six scores") : null,
    suggestion && (c.abilityMethod === "standard" || c.abilityMethod === "point-cost")
      ? el("button", { type: "button", className: "btn", on: { click: () => ctx.edit("abilities", (ch) => { ABILITY_IDS.forEach((a, i) => { ch.baseScores[a] = suggestion[i]; }); }) } },
        `Use the ${d.cls.name}'s suggested spread`) : null,
    c.abilityMethod === "point-cost" ? el("p", { className: "meter" }, el("strong", {}, String(POINT_BUY_BUDGET - d.pointsSpent)), ` of ${POINT_BUY_BUDGET} points left`,
      el("span", { className: "cite" }, "Ability Score Point Costs, p.21: 8 costs 0 … 15 costs 9")) : null,
    c.abilityMethod === "roll" && c.rolls.length ? el("p", { className: "cite" }, `Your rolls: ${c.rolls.join(", ")}. Place each one once.`) : null,
    fieldMessage(ctx, "abilities"));
}

function setMethod(ch, method) {
  ch.abilityMethod = method;
  if (method === "point-cost") ABILITY_IDS.forEach((a) => { ch.baseScores[a] = 8; });
  if (method === "standard") ABILITY_IDS.forEach((a, i) => { ch.baseScores[a] = (STANDARD_ARRAY_BY_CLASS[ch.classId] ?? STANDARD_ARRAY)[i]; });
  if (method === "roll") { if (ch.rolls.length === 6) ABILITY_IDS.forEach((a, i) => { ch.baseScores[a] = ch.rolls[i]; }); }
}

/** The base-score control for one ability, by method. */
export function baseControl(ctx, a, { compact = false } = {}) {
  const { c } = ctx;
  const key = `abilities.${a}`;
  const name = abilityName(a);
  const keys = [key, "abilities"];
  if (c.abilityMethod === "") return el("span", { className: "base-val", id: fieldId(key) }, "\u2014");
  if (c.abilityMethod === "point-cost") {
    const v = c.baseScores[a];
    return el("div", { className: "stepper" },
      el("button", { type: "button", className: "btn small", aria: { label: `Lower ${name}` }, disabled: v <= 8, on: { click: () => ctx.edit(keys, (ch) => { ch.baseScores[a] -= 1; }) } }, "−"),
      el("span", { className: "base-val", id: fieldId(key) }, String(v)),
      el("button", { type: "button", className: "btn small", aria: { label: `Raise ${name}` }, disabled: v >= 15, on: { click: () => ctx.edit(keys, (ch) => { ch.baseScores[a] += 1; }) } }, "+"),
      compact ? null : el("small", { className: "cite" }, `costs ${POINT_COSTS[v] ?? "—"}`));
  }
  if (c.abilityMethod === "standard" || c.abilityMethod === "roll") {
    const pool = c.abilityMethod === "standard" ? STANDARD_ARRAY : c.rolls;
    if (!pool.length) return el("span", { className: "cite" }, "Roll first");
    const values = [...new Set(pool)].sort((x, y) => y - x);
    // Picking a value another ability holds swaps the two, so each value stays used once.
    return select({ ...fieldAttrs(ctx, key, { className: "base-select" }), aria: { label: `${name} base score` },
      on: { change: (e) => ctx.edit(keys, (ch) => swapInto(ch, a, toInt(e.target.value))) } },
    values.map((v) => ({ value: String(v), label: String(v) })), String(c.baseScores[a]));
  }
  return el("input", { ...fieldAttrs(ctx, key), type: "number", min: 1, max: 30, value: c.baseScores[a], aria: { label: `${name} base score` },
    on: { change: (e) => ctx.edit(keys, (ch) => { ch.baseScores[a] = Math.min(30, Math.max(1, toInt(e.target.value, ch.baseScores[a]))); }) } });
}

function swapInto(ch, a, value) {
  const holder = ABILITY_IDS.find((x) => x !== a && ch.baseScores[x] === value);
  if (holder) ch.baseScores[holder] = ch.baseScores[a];
  ch.baseScores[a] = value;
}

/**
 * One ability block: label, modifier ring, and ONE score. With no bonuses the score itself is the control.
 * With bonuses (background, feats) the final score is shown big, and the line under it reads
 * "15 base + 2 Soldier", where 15 is the control.
 */
export function abilityBlock(ctx, a) {
  const { c, d } = ctx;
  const info = ABILITIES.find((x) => x.id === a);
  const bonuses = d.abilitySteps[a].slice(1);
  const modText = known(d, signed(d.mod[a]));
  let body;
  if (!d.scoresKnown) body = el("div", { className: "score" }, "\u2014");
  else if (!bonuses.length) body = el("div", { className: "score-edit" }, baseControl(ctx, a, { compact: true }));
  else body = [el("div", { className: "score" }, String(d.scores[a])),
    el("div", { className: "src from" }, baseControl(ctx, a, { compact: true }), el("span", {}, " base"),
      bonuses.map((s) => el("span", {}, ` ${signed(s.amount)} ${s.label}`)))];
  return el("div", { className: "ability" },
    el("div", { className: "name" }, info.short),
    el("div", { className: "mod", aria: { label: `${info.name} modifier ${modText}` } }, modText),
    body,
    fieldMessage(ctx, `abilities.${a}`));
}

export function backgroundIncrease(ctx) {
  const { c, d } = ctx;
  const bg = d.bg;
  if (!bg) return el("p", { className: "todo" }, "Choose a background first: it decides which three abilities can rise.");
  const given = ABILITY_IDS.filter((a) => c.backgroundBonus[a] > 0);
  const pattern = given.length === 3 ? "1-1-1" : "2-1";
  const two = ABILITY_IDS.find((a) => c.backgroundBonus[a] === 2) ?? "";
  const one = pattern === "2-1" ? (ABILITY_IDS.find((a) => c.backgroundBonus[a] === 1) ?? "") : "";
  const opts = bg.abilities.map((a) => ({ value: a, label: abilityName(a) }));
  const set = (fn) => ctx.edit("backgroundBonus", (ch) => { fn(ch); });
  return el("div", { className: "bg-inc" },
    el("p", { className: "cite" }, `${bg.name} lists ${bg.abilities.map(abilityName).join(", ")}. Give +2 to one and +1 to another, or +1 to all three. No score can go above 20 (p.21, p.83).`),
    el("div", { className: "method", role: "group", aria: { label: "Increase pattern" } },
      el("button", { type: "button", className: pattern === "2-1" && given.length ? "btn primary" : "btn", aria: { pressed: String(pattern === "2-1" && given.length > 0) },
        on: { click: () => set((ch) => { ABILITY_IDS.forEach((a) => { ch.backgroundBonus[a] = 0; }); }) } }, "+2 / +1"),
      el("button", { type: "button", className: pattern === "1-1-1" ? "btn primary" : "btn", aria: { pressed: String(pattern === "1-1-1") },
        on: { click: () => set((ch) => { ABILITY_IDS.forEach((a) => { ch.backgroundBonus[a] = bg.abilities.includes(a) ? 1 : 0; }); }) } }, "+1 / +1 / +1")),
    pattern === "2-1" ? el("div", { className: "row" },
      labelled(ctx, "bg-two", "+2 to", select({ id: fieldId("bg-two"), on: { change: (e) => set((ch) => { assignBonus(ch, e.target.value, 2, bg); }) } }, opts, two, "Choose…")),
      labelled(ctx, "bg-one", "+1 to", select({ id: fieldId("bg-one"), on: { change: (e) => set((ch) => { assignBonus(ch, e.target.value, 1, bg); }) } }, opts, one, "Choose…"))) : null,
    fieldMessage(ctx, "backgroundBonus"));
}

function assignBonus(ch, ability, amount, bg) {
  for (const a of ABILITY_IDS) if (ch.backgroundBonus[a] === amount || !bg.abilities.includes(a)) ch.backgroundBonus[a] = 0;
  if (ch.backgroundBonus[ability] && ch.backgroundBonus[ability] !== amount) ch.backgroundBonus[ability] = 0;
  if (ability) ch.backgroundBonus[ability] = amount;
}

// ---------- saves and skills ----------

/**
 * Who can grant each skill: the open skill-proficiency choices (class, subclass, species).
 * Background skills are fixed. Ticking a skill adds it to the first choice that offers it and has room;
 * if every choice that offers it is full, the edit goes to the first one and the rules refuse it,
 * saying how many that choice gives.
 */
function skillPickers(ctx) {
  const { c, d } = ctx;
  const choices = d.choices.filter((ch) => ch.kind === "skill-proficiency");
  const pool = (ch) => skillPool(ch, d.cls);
  const holder = (skill) => choices.find((ch) => (c.choices[ch.key] || []).includes(skill));
  const target = (skill) => {
    const offering = choices.filter((ch) => pool(ch).includes(skill));
    return offering.find((ch) => (c.choices[ch.key] || []).length < ch.count) ?? offering[0];
  };
  return { choices, holder, target };
}

export function savesAndSkills(ctx, { interactive = false } = {}) {
  const { c, d } = ctx;
  const pickers = interactive ? skillPickers(ctx) : null;
  const skillRow = (s) => {
    const k = d.skills[s.id];
    const abbr = ABILITIES.find((x) => x.id === s.ability).short;
    const tag = el("span", { className: "a" }, [abbr, ...k.sources, k.expertise ? "Expertise" : ""].filter(Boolean).join(" · "));
    if (!pickers) return el("li", {},
      el("span", { className: k.expertise ? "dot on x2" : k.proficient ? "dot on" : "dot", aria: { hidden: "true" } }),
      el("span", { className: "v" }, known(d, signed(k.total))), s.name, tag);
    const held = pickers.holder(s.id);
    const fixed = k.proficient && !held;                 // background, Skilled feat: not changed here
    const target = held ?? pickers.target(s.id);
    const id = fieldId(`skill-${s.id}`);
    const box = el("input", { type: "checkbox", id, checked: k.proficient, disabled: fixed || !target,
      title: fixed ? `From ${k.sources.join(", ")}` : !target ? "None of your choices offers this skill" : undefined,
      aria: { describedby: target ? fieldId(`choice:${target.key}`) + "-msg" : undefined },
      on: { change: (e) => ctx.edit(`choice:${target.key}`, (ch) => {
        const now = ch.choices[target.key] || [];
        ch.choices[target.key] = e.target.checked ? [...now, s.id] : now.filter((x) => x !== s.id);
      }) } });
    return el("li", { className: fixed ? "fixed" : target ? "pickable" : "locked" },
      el("label", { className: "skill-pick", htmlFor: id }, box, el("span", { className: "v" }, known(d, signed(k.total))), s.name), tag);
  };
  return el("div", {},
    el("div", { className: "prof-line" },
      el("span", {}, el("span", { className: "lbl" }, "Proficiency Bonus "), el("span", { className: "big" }, signed(d.pb)), el("span", { className: "cite" }, ` level ${c.level}, p.23`)),
      el("label", { className: "switch", htmlFor: "f-heroic" }, el("input", { type: "checkbox", id: "f-heroic", checked: c.heroicInspiration,
        on: { change: (e) => ctx.edit("heroicInspiration", (ch) => { ch.heroicInspiration = e.target.checked; }) } }), "Heroic Inspiration")),
    el("h3", { className: "sub-h" }, "Saving throws"),
    el("ul", { className: "list" }, ABILITIES.map((a) => el("li", {},
      el("span", { className: d.saves[a.id].proficient ? "dot on" : "dot", aria: { hidden: "true" } }),
      el("span", { className: "v" }, known(d, signed(d.saves[a.id].total))), a.name,
      d.saves[a.id].proficient ? el("span", { className: "a" }, "proficient") : null))),
    el("h3", { className: "sub-h" }, "Skills",
      pickers ? pickers.choices.map((ch) => el("span", { className: "pick-count" }, ` ${ch.source} ${(c.choices[ch.key] || []).length}/${ch.count}`)) : null),
    el("ul", { className: "list skills" }, SKILLS.map(skillRow)),
    pickers ? pickers.choices.map((ch) => fieldMessage(ctx, `choice:${ch.key}`)) : null,
    fieldMessage(ctx, "expertise"));
}

// ---------- choices from class, subclass, species, background ----------

export function choiceEditor(ctx, ch) {
  const { c, d } = ctx;
  const key = `choice:${ch.key}`;
  const list = c.choices[ch.key] || [];
  const toggle = (chr, value, on) => {
    const now = chr.choices[ch.key] || [];
    chr.choices[ch.key] = ch.count === 1 && on ? [value] : toggleIn(now, value, on);
  };
  const legend = `${ch.label || labelFor(ch)} (${ch.source})`;
  switch (ch.kind) {
    case "skill-proficiency":
      return pickList(ctx, { key, legend, max: ch.count, list, toggle,
        options: skillPool(ch, d.cls).map((s) => ({ value: s, label: skillName(s), hint: d.skills[s].proficient && !list.includes(s) ? "already proficient" : "" })) });
    case "skill-expertise": {
      const pool = SKILLS.map((s) => s.id).filter((s) => (d.skills[s].proficient || list.includes(s)) && (!Array.isArray(ch.from) || ch.from.includes(s)));
      return pickList(ctx, { key, legend: `${legend}: Expertise`, max: ch.count, list, toggle, options: pool.map((s) => ({ value: s, label: skillName(s) })) });
    }
    case "tool": {
      const pool = toolOptions(ch.from);
      return pickList(ctx, { key, legend, max: ch.count, list, toggle, options: pool.map((t) => ({ value: t, label: t })) });
    }
    case "weapon-mastery":
      return pickList(ctx, { key, legend: `${legend}: Weapon Mastery`, max: ch.count, list, toggle,
        options: masteryOptions(ch, d).map((w) => ({ value: w.id, label: w.name, hint: w.mastery })) });
    case "language": {
      const known = d.languages.filter((l) => !list.includes(l));
      const pool = [...STANDARD_LANGUAGES.map((l) => l.name), ...RARE_LANGUAGES].filter((l) => !known.includes(l));
      return pickList(ctx, { key, legend, max: ch.count, list, toggle, options: pool.map((l) => ({ value: l, label: l })) });
    }
    case "option":
    case "ability": {
      const opts = ch.kind === "ability" ? ch.options.map((a) => ({ value: a, label: abilityName(a) })) : ch.options.map((o) => ({ value: o.id, label: o.name }));
      return labelled(ctx, key, legend, select({ ...fieldAttrs(ctx, key), on: { change: (e) => ctx.edit(key, (chr) => { chr.choices[ch.key] = e.target.value ? [e.target.value] : []; }) } }, opts, list[0] ?? "", "Choose…"));
    }
    case "text":
      return labelled(ctx, key, `${legend}: ${ch.count} (one per line)`, el("textarea", { id: fieldId(key), rows: Math.max(2, ch.count),
        value: list.join("\n"), on: { input: (e) => ctx.editText((chr) => { chr.choices[ch.key] = e.target.value.split("\n").slice(0, 50); }) } }));
    default:
      return null;
  }
}
const labelFor = (ch) => ch.id.replace(/-/g, " ").replace(/^\w/, (m) => m.toUpperCase());

export function choicesFor(ctx, scopes, { skipKinds = [] } = {}) {
  const list = ctx.d.choices.filter((ch) => scopes.includes(ch.scope) && ch.kind !== "feat" && !skipKinds.includes(ch.kind));
  return list.length ? el("div", { className: "choices-list" }, list.map((ch) => choiceEditor(ctx, ch))) : null;
}

// ---------- feats ----------

export function featEditor(ctx, slot) {
  const { c, d } = ctx;
  const key = `feat:${slot.key}`;
  const data = c.feats[slot.key] || { id: "", increase: {}, picks: [], ability: "", text: "" };
  const featId = slot.fixed || data.id;
  const feat = featById(featId);
  const update = (fn) => ctx.edit(key, (ch) => { ch.feats[slot.key] = structuredClone(ch.feats[slot.key] || data); fn(ch.feats[slot.key]); });
  // No category: any feat (p.87); Fighting Style feats only with the Fighting Style feature (p.88).
  const hasFightingStyle = d.choices.some((ch) => ch.kind === "feat" && ch.category === "fighting-style");
  const eligible = FEATS.filter((f) => (slot.category ? f.category === slot.category : f.category !== "fighting-style" || hasFightingStyle));
  const parts = [];
  if (slot.fixed) parts.push(el("p", { className: "fixed-feat" }, el("strong", {}, feat.name), slot.variant ? ` (${slot.variant})` : "", el("span", { className: "cite" }, ` from ${slot.source}, ${slot.cite}`)));
  else parts.push(select({ ...fieldAttrs(ctx, key), aria: { label: slot.label }, on: { change: (e) => update((f) => { f.id = e.target.value; f.increase = {}; f.picks = []; f.ability = ""; }) } },
    eligible.map((f) => ({ value: f.id, label: `${f.name} (${f.category.replace(/-/g, " ")})` })), data.id, "Choose a feat…"));
  const inc = feat?.choices?.find((x) => x.kind === "ability-increase");
  if (inc) {
    const amounts = ABILITY_IDS.filter((a) => data.increase[a]).map((a) => ({ a, n: data.increase[a] }));
    const pattern = inc.patterns.length > 1 ? (amounts.length === 2 || (amounts.length === 1 && amounts[0].n === 1) ? "1-1" : "2") : inc.patterns[0].join("-");
    const from = (inc.from || ABILITY_IDS).map((a) => ({ value: a, label: abilityName(a) }));
    if (inc.patterns.length > 1) {
      parts.push(el("div", { className: "method", role: "group", aria: { label: "Increase pattern" } },
        el("button", { type: "button", className: pattern === "2" ? "btn small primary" : "btn small", aria: { pressed: String(pattern === "2") }, on: { click: () => update((f) => { f.increase = {}; f.pattern = "2"; }) } }, "+2 to one"),
        el("button", { type: "button", className: pattern === "1-1" ? "btn small primary" : "btn small", aria: { pressed: String(pattern === "1-1") }, on: { click: () => update((f) => { f.increase = {}; f.pattern = "1-1"; }) } }, "+1 to two")));
    }
    const wantPattern = data.pattern || pattern;
    const slotsN = wantPattern === "1-1" ? 2 : 1;
    const amount = wantPattern === "2" ? 2 : 1;
    const current = ABILITY_IDS.filter((a) => data.increase[a]);
    for (let i = 0; i < slotsN; i++) {
      parts.push(select({ id: fieldId(`${key}-inc-${i}`), aria: { label: `Ability to increase${slotsN > 1 ? ` (${i + 1})` : ""}` },
        on: { change: (e) => update((f) => { const keep = ABILITY_IDS.filter((a) => f.increase[a]); keep[i] = e.target.value; f.increase = {}; keep.filter(Boolean).forEach((a) => { f.increase[a] = amount; }); }) } },
      from, current[i] ?? "", `+${amount} to…`));
    }
  }
  if (feat?.id === "skilled") {
    const options = [...SKILLS.map((s) => ({ value: `skill:${s.id}`, label: s.name, hint: d.skills[s.id].proficient && !data.picks.includes(`skill:${s.id}`) ? "already proficient" : "" })),
      ...ALL_TOOLS.map((t) => ({ value: `tool:${t}`, label: t, hint: "tool" }))];
    parts.push(pickList(ctx, { key: `${key}-picks`, legend: "Skilled: three skills or tools", max: 3, list: data.picks, options,
      toggle: (ch, v, on) => { ch.feats[slot.key] = structuredClone(ch.feats[slot.key] || data); ch.feats[slot.key].picks = toggleIn(ch.feats[slot.key].picks, v, on); } }));
  }
  if (feat?.id === "magic-initiate") {
    if (!slot.variant) parts.push(select({ id: fieldId(`${key}-list`), aria: { label: "Magic Initiate spell list" }, on: { change: (e) => update((f) => { f.list = e.target.value; }) } },
      ["Cleric", "Druid", "Wizard"].map((l) => ({ value: l, label: `${l} spell list` })), data.list ?? "", "Spell list…"));
    parts.push(select({ id: fieldId(`${key}-ability`), aria: { label: "Magic Initiate spellcasting ability" }, on: { change: (e) => update((f) => { f.ability = e.target.value; }) } },
      ["int", "wis", "cha"].map((a) => ({ value: a, label: abilityName(a) })), data.ability, "Spellcasting ability…"));
    parts.push(el("textarea", { id: fieldId(`${key}-text`), rows: 2, value: data.text, placeholder: "Two cantrips and one level 1 spell",
      aria: { label: "Magic Initiate spells" }, on: { input: (e) => ctx.editText((ch) => { ch.feats[slot.key] = { ...(ch.feats[slot.key] || data), text: e.target.value.slice(0, 2000) }; }) } }));
  }
  return el("div", { className: "feat" }, el("div", { className: "lbl" }, slot.label), ...parts, fieldMessage(ctx, key), fieldMessage(ctx, `${key}-picks`));
}

export function featsFor(ctx, filter = () => true) {
  return ctx.d.slots.filter(filter).map((s) => featEditor(ctx, s));
}

// ---------- languages ----------

export function languagesEditor(ctx) {
  const { c } = ctx;
  return pickList(ctx, { key: "languages", legend: `Languages: Common plus ${LANGUAGE_CHOICES}`, max: LANGUAGE_CHOICES, list: c.languages,
    toggle: (ch, v, on) => { ch.languages = toggleIn(ch.languages, v, on); },
    options: STANDARD_LANGUAGES.map((l) => ({ value: l.id, label: l.name, hint: `d12: ${l.roll.join("–")}` })) });
}

// ---------- combat ----------

/** Max HP needs a class (Hit Die) and a Constitution score. */
const hpKnown = (d) => Boolean(d.cls) && d.scoresKnown;

const breakdown = (parts) => parts.map((p) => `${p.label} ${p.amount >= 0 && parts.indexOf(p) ? "+" : ""}${p.amount}`).join(", ");

export function combat(ctx) {
  const { c, d } = ctx;
  const stat = (label, value, note, extraClass = "") => el("div", { className: `stat ${extraClass}` }, el("span", { className: "lbl" }, label), el("span", { className: "big" }, value), note ? el("span", { className: "cite" }, note) : null);
  const trained = !d.armor || d.armorTraining.has(d.armor.kind);
  return card("Combat",
    el("div", { className: "stats" },
      stat("Armor Class", known(d, String(d.ac)), d.scoresKnown ? breakdown(d.acParts) : null, "key"),
      stat("Initiative", known(d, signed(d.initiative)), d.scoresKnown ? breakdown(d.initParts) : null),
      stat("Speed", `${d.speed} ft`, breakdown(d.speedParts)),
      stat("Size", d.size || "—"),
      stat("Passive Perception", known(d, String(d.passivePerception)), d.scoresKnown ? `10 + Perception ${signed(d.skills.perception.total)}` : null),
      stat("Hit Point Dice", d.cls ? `${c.level}d${d.hitDie}` : "—", null)),
    el("div", { className: "hp" },
      labelled(ctx, "hp.current", "Current HP", el("input", { ...fieldAttrs(ctx, "hp.current"), type: "number", min: 0,
        value: hpKnown(d) ? d.hpCurrent : "", placeholder: "\u2014", disabled: !hpKnown(d),
        on: { change: (e) => ctx.edit("hp.current", (ch) => { const v = toInt(e.target.value, d.hpCurrent); ch.hp.current = v === d.hpMax ? null : v; }) } })),
      el("div", { className: "cell" }, el("span", { className: "lbl" }, "Max HP"), el("div", { className: "big" }, hpKnown(d) ? String(d.hpMax) : "\u2014"), hpKnown(d) ? el("span", { className: "cite" }, breakdown(d.hpParts)) : null),
      labelled(ctx, "hp.temp", "Temp HP", el("input", { ...fieldAttrs(ctx, "hp.temp"), type: "number", min: 0, value: c.hp.temp,
        on: { change: (e) => ctx.edit("hp.temp", (ch) => { ch.hp.temp = toInt(e.target.value); }) } })),
      labelled(ctx, "hitDiceSpent", "Hit Dice spent", el("input", { ...fieldAttrs(ctx, "hitDiceSpent"), type: "number", min: 0, max: c.level, value: c.hitDiceSpent,
        on: { change: (e) => ctx.edit("hitDiceSpent", (ch) => { ch.hitDiceSpent = Math.max(0, toInt(e.target.value)); }) } }))),
    el("div", { className: "row" },
      deathSaves(ctx, "successes", "Death save successes"), deathSaves(ctx, "failures", "Death save failures")),
    el("div", { className: "row" },
      labelled(ctx, "armorId", "Armor worn", select({ ...fieldAttrs(ctx, "armorId"), on: { change: (e) => ctx.edit("armorId", (ch) => { ch.armorId = e.target.value; }) } },
        ARMOR.map((a) => ({ value: a.id, label: `${a.name} (${a.kind})` })), c.armorId, "None")),
      el("label", { className: "switch", htmlFor: "f-shield" }, el("input", { type: "checkbox", id: "f-shield", checked: c.shield,
        on: { change: (e) => ctx.edit("shield", (ch) => { ch.shield = e.target.checked; }) } }), "Shield")),
    d.armor && !trained ? el("p", { className: "todo" }, `No training with ${d.armor.kind} armor: Disadvantage on Strength and Dexterity D20 Tests, and no spellcasting (p.92).`) : null,
    c.shield && !d.armorTraining.has("shield") ? el("p", { className: "todo" }, "No Shield training, so the Shield adds no AC (p.92).") : null,
    d.armor?.stealthDisadvantage ? el("p", { className: "cite" }, `${d.armor.name} gives Disadvantage on Dexterity (Stealth) checks (p.92).`) : null,
    d.darkvision ? el("p", { className: "cite" }, `Darkvision ${d.darkvision} ft.`) : null,
    d.resistances.length ? el("p", { className: "cite" }, `Resistance: ${[...new Set(d.resistances)].join(", ")}.`) : null);
}

function deathSaves(ctx, which, label) {
  const n = ctx.c.deathSaves[which];
  return el("fieldset", { className: "pips-set" }, el("legend", {}, label),
    [1, 2, 3].map((i) => el("input", { type: "checkbox", id: fieldId(`death-${which}-${i}`), checked: n >= i, aria: { label: `${label}: ${i}` },
      on: { change: (e) => ctx.edit(`deathSaves.${which}`, (ch) => { ch.deathSaves[which] = e.target.checked ? i : i - 1; }) } })));
}

// ---------- attacks ----------

export function attacks(ctx) {
  const { c, d } = ctx;
  const rows = d.attacks.map((a) => {
    const remove = el("button", { type: "button", className: "btn small", aria: { label: `Remove ${a.name || "attack"}` },
      on: { click: () => ctx.edit("attacks", (ch) => { ch.attacks.splice(a.index, 1); }) } }, "×");
    if (!a.custom) return el("tr", {}, el("td", {}, a.name, a.notes.length ? el("small", { className: "cite block" }, a.notes.join(" · ")) : null),
      el("td", { className: "n" }, known(d, signed(a.bonus))), el("td", {}, known(d, a.damage)), el("td", {}, a.mastery || el("span", { className: "cite" }, "—")), el("td", {}, remove));
    const field = (prop, label) => el("input", { type: "text", id: fieldId(`attack-${a.index}-${prop}`), value: c.attacks[a.index][prop], aria: { label },
      on: { input: (e) => ctx.editText((ch) => { ch.attacks[a.index][prop] = e.target.value.slice(0, 80); }) } });
    return el("tr", {}, el("td", {}, field("name", "Attack name")), el("td", {}, field("bonus", "Attack bonus")), el("td", {}, field("damage", "Damage")), el("td", {}, field("notes", "Notes")), el("td", {}, remove));
  });
  const adder = select({ id: "f-add-weapon", aria: { label: "Add a weapon" }, on: { change: (e) => { if (e.target.value) ctx.edit("attacks", (ch) => { ch.attacks.push({ weaponId: e.target.value }); }); } } },
    WEAPONS.map((w) => ({ value: w.id, label: `${w.name} (${w.category} ${w.kind})` })), "", "+ Add a weapon…");
  return card("Weapons & damage cantrips",
    el("div", { className: "tablewrap" }, el("table", {},
      el("thead", {}, el("tr", {}, ["Name", "Atk", "Damage", "Mastery", ""].map((h) => el("th", {}, h)))),
      el("tbody", {},
        el("tr", {}, el("td", {}, d.unarmed.name), el("td", { className: "n" }, known(d, signed(d.unarmed.bonus))), el("td", {}, known(d, d.unarmed.damage)), el("td", {}), el("td", {})),
        rows))),
    el("div", { className: "row" }, adder,
      el("button", { type: "button", className: "btn small", on: { click: () => ctx.edit("attacks", (ch) => { ch.attacks.push({ name: "", bonus: "", damage: "", notes: "" }); }) } }, "+ Add a cantrip or other attack")),
    el("p", { className: "cite" }, "Melee: STR + Proficiency; ranged: DEX + Proficiency; Finesse uses the better of the two (p.22, p.90). Unarmed Strike: STR + Proficiency, 1 + STR damage (Rules Glossary)."));
}

// ---------- limited-use features ----------

export function resources(ctx) {
  const { d } = ctx;
  if (!d.resources.length) return null;
  return card("Limited-use features", el("ul", { className: "list res" }, d.resources.map((r) => el("li", {},
    el("span", { className: "res-name" }, r.name, el("small", { className: "cite block" }, `${r.recharge} · ${r.source}`)),
    el("span", { className: "a" }, `${r.max - r.used} of ${r.max} left`),
    el("button", { type: "button", className: "btn small", disabled: r.used >= r.max, aria: { label: `Use ${r.name}` }, on: { click: () => ctx.edit(`used.${r.id}`, (ch) => { ch.used[r.id] = (ch.used[r.id] || 0) + 1; }) } }, "Use"),
    el("button", { type: "button", className: "btn small", disabled: r.used <= 0, aria: { label: `Regain a use of ${r.name}` }, on: { click: () => ctx.edit(`used.${r.id}`, (ch) => { ch.used[r.id] = Math.max(0, (ch.used[r.id] || 0) - 1); }) } }, "Regain"),
    fieldMessage(ctx, `used.${r.id}`)))));
}

// ---------- features, traits, proficiencies ----------

export function featuresCard(ctx) {
  const { d } = ctx;
  return card(d.cls ? `${d.cls.name} features` : "Class features",
    d.features.length ? el("ul", { className: "list" }, d.features.map((f) => el("li", {}, el("span", { className: "v lvl" }, String(f.level)), f.name, el("span", { className: "a" }, f.source))))
      : el("p", { className: "empty" }, "\u2014"));
}

export function traitsCard(ctx) {
  const { d } = ctx;
  return card(d.sp ? `Species traits: ${d.sp.name}` : "Species traits",
    d.traits.length ? el("ul", { className: "list" }, d.traits.map((t) => el("li", {}, t))) : el("p", { className: "empty" }, "\u2014"),
    d.speciesDCs.map((s) => el("p", { className: "cite" }, `${s.name}: save DC ${known(d, String(s.dc))}, ${s.damage} damage (${d.sp.cite}).`)));
}

export function proficienciesCard(ctx) {
  const { d } = ctx;
  const row = (label, value) => el("li", {}, el("span", { className: "why" }, label), value || "—");
  return card("Training & proficiencies", el("ul", { className: "list" },
    row("Armor", [...d.armorTraining].map((k) => (k === "shield" ? "Shields" : k[0].toUpperCase() + k.slice(1))).join(", ")),
    row("Weapons", d.weaponsText),
    row("Tools", d.tools.map((t) => t.name).join(", ")),
    row("Languages", d.languages.join(", "))));
}

// ---------- spellcasting ----------

export function spellcasting(ctx) {
  const { c, d } = ctx;
  const s = d.spellcasting;
  if (!s) return null;
  const slotRow = s.slots.map((n, i) => (n ? el("div", { className: "slot" }, el("span", { className: "lbl" }, `Level ${i + 1}`),
    el("span", {}, `${n - Math.min(c.slotsUsed[i], n)} of ${n} left`),
    el("button", { type: "button", className: "btn small", disabled: c.slotsUsed[i] >= n, aria: { label: `Spend a level ${i + 1} slot` }, on: { click: () => ctx.edit(`slots.${i + 1}`, (ch) => { ch.slotsUsed[i] += 1; }) } }, "Spend"),
    el("button", { type: "button", className: "btn small", disabled: c.slotsUsed[i] <= 0, aria: { label: `Regain a level ${i + 1} slot` }, on: { click: () => ctx.edit(`slots.${i + 1}`, (ch) => { ch.slotsUsed[i] = Math.max(0, ch.slotsUsed[i] - 1); }) } }, "Regain"),
    fieldMessage(ctx, `slots.${i + 1}`)) : null)).filter(Boolean);
  const pact = s.pact && s.pact.slots ? el("div", { className: "slot" }, el("span", { className: "lbl" }, `Pact Magic (level ${s.pact.slotLevel})`),
    el("span", {}, `${s.pact.slots - Math.min(c.pactSlotsUsed, s.pact.slots)} of ${s.pact.slots} left`),
    el("button", { type: "button", className: "btn small", disabled: c.pactSlotsUsed >= s.pact.slots, on: { click: () => ctx.edit("slots.pact", (ch) => { ch.pactSlotsUsed += 1; }) } }, "Spend"),
    el("button", { type: "button", className: "btn small", disabled: c.pactSlotsUsed <= 0, on: { click: () => ctx.edit("slots.pact", (ch) => { ch.pactSlotsUsed = Math.max(0, ch.pactSlotsUsed - 1); }) } }, "Regain")) : null;
  const spellRows = c.spells.map((sp, i) => el("tr", {},
    el("td", {}, el("input", { type: "text", id: fieldId(`spell-${i}-name`), value: sp.name, aria: { label: "Spell name" }, on: { change: (e) => ctx.edit("spells", (ch) => { ch.spells[i].name = e.target.value.slice(0, 80); }) } })),
    el("td", {}, select({ id: fieldId(`spell-${i}-level`), aria: { label: "Spell level" }, on: { change: (e) => ctx.edit("spells", (ch) => { ch.spells[i].level = toInt(e.target.value); }) } },
      Array.from({ length: 10 }, (_, n) => ({ value: String(n), label: n === 0 ? "Cantrip" : `Level ${n}` })), String(sp.level))),
    el("td", {}, sp.level > 0 ? el("input", { type: "checkbox", id: fieldId(`spell-${i}-prep`), checked: sp.prepared, aria: { label: `${sp.name || "Spell"} prepared` },
      on: { change: (e) => ctx.edit("spells", (ch) => { ch.spells[i].prepared = e.target.checked; }) } }) : null),
    el("td", {}, el("button", { type: "button", className: "btn small", aria: { label: `Remove ${sp.name || "spell"}` }, on: { click: () => ctx.edit("spells", (ch) => { ch.spells.splice(i, 1); }) } }, "×"))));
  const cantripsListed = c.spells.filter((x) => x.name && x.level === 0).length;
  const preparedListed = c.spells.filter((x) => x.name && x.level > 0 && x.prepared).length;
  return card("Spellcasting",
    el("div", { className: "stats" },
      el("div", { className: "stat" }, el("span", { className: "lbl" }, "Ability"), el("span", { className: "big" }, s.ability.toUpperCase()), el("span", { className: "cite" }, known(d, signed(s.mod)))),
      el("div", { className: "stat key" }, el("span", { className: "lbl" }, "Save DC"), el("span", { className: "big" }, known(d, String(s.saveDC))), el("span", { className: "cite" }, "8 + mod + PB")),
      el("div", { className: "stat" }, el("span", { className: "lbl" }, "Spell attack"), el("span", { className: "big" }, known(d, signed(s.attack))), el("span", { className: "cite" }, "mod + PB"))),
    el("p", { className: "cite" }, `Cantrips: ${cantripsListed} of ${s.cantrips}. Prepared spells: ${preparedListed} of ${s.prepared}. (${s.cite}; p.22–23 for the formulas.)`),
    el("div", { className: "slots" }, slotRow, pact),
    el("h3", { className: "sub-h" }, "Spells"),
    el("p", { className: "cite" }, "Type your spells in for now; a spell picker comes in a later version."),
    el("div", { className: "tablewrap" }, el("table", {}, el("thead", {}, el("tr", {}, ["Spell", "Level", "Prepared", ""].map((h) => el("th", {}, h)))), el("tbody", {}, spellRows))),
    el("button", { type: "button", className: "btn small add", on: { click: () => ctx.edit("spells", (ch) => { ch.spells.push({ name: "", level: 0, prepared: false }); }) } }, "+ Add spell"),
    fieldMessage(ctx, "spells"));
}

// ---------- equipment ----------

export function equipment(ctx, { packages = true } = {}) {
  const { c, d } = ctx;
  const rows = c.inventory.map((it, i) => el("tr", {},
    el("td", {}, el("input", { type: "text", id: fieldId(`inv-${i}-name`), value: it.name, aria: { label: "Item" }, on: { input: (e) => ctx.editText((ch) => { ch.inventory[i].name = e.target.value.slice(0, 120); }) } })),
    el("td", {}, el("input", { type: "number", id: fieldId(`inv-${i}-qty`), min: 0, value: it.qty, aria: { label: `${it.name || "Item"} quantity` }, on: { change: (e) => ctx.edit("inventory", (ch) => { ch.inventory[i].qty = Math.max(0, toInt(e.target.value, 1)); }) } })),
    el("td", {}, el("button", { type: "button", className: "btn small", aria: { label: `Remove ${it.name || "item"}` }, on: { click: () => ctx.edit("inventory", (ch) => { ch.inventory.splice(i, 1); }) } }, "×"))));
  const coin = (k) => el("div", { className: "cell" }, el("label", { htmlFor: fieldId(`coin-${k}`) }, k.toUpperCase()),
    el("input", { type: "number", id: fieldId(`coin-${k}`), min: 0, value: c.coins[k], on: { change: (e) => ctx.edit("coins", (ch) => { ch.coins[k] = Math.max(0, toInt(e.target.value)); }) } }));
  return card("Equipment",
    packages ? startingPackages(ctx) : null,
    el("div", { className: "tablewrap" }, el("table", {}, el("thead", {}, el("tr", {}, ["Item", "Qty", ""].map((h) => el("th", {}, h)))), el("tbody", {}, rows))),
    el("button", { type: "button", className: "btn small add", on: { click: () => ctx.edit("inventory", (ch) => { ch.inventory.push({ name: "", qty: 1 }); }) } }, "+ Add item"),
    el("div", { className: "coins" }, ["cp", "sp", "ep", "gp", "pp"].map(coin)));
}

export function startingPackages(ctx) {
  const { c, d } = ctx;
  if (!d.cls && !d.bg) return null;
  const describe = (p) => (p.items.length ? `${p.items.map((it) => (it.qty > 1 ? `${it.qty} ${it.name}` : it.name)).join(", ")}, ${p.gp} GP` : `${p.gp} GP`);
  const pick = { classOption: c.equipment.classOption, backgroundOption: c.equipment.backgroundOption };
  const group = (label, list, field) => el("fieldset", { className: "pick" }, el("legend", {}, label),
    list.map((p) => { const id = fieldId(`pkg-${field}-${p.option}`); return el("label", { className: "pkg", htmlFor: id },
      el("input", { type: "radio", name: `pkg-${field}`, id, checked: pick[field] === p.option, on: { change: () => ctx.edit("equipment", (ch) => { ch.equipment[field] = p.option; }) } }),
      el("span", {}, el("strong", {}, `${p.option}: `), describe(p))); }));
  return el("div", { className: "packages" },
    d.cls ? group(`${d.cls.name} starting equipment`, d.cls.startingEquipment, "classOption") : null,
    d.bg ? group(`${d.bg.name} equipment (p.83)`, d.bg.equipment, "backgroundOption") : null,
    el("button", { type: "button", className: "btn", on: { click: () => {
      if (c.inventory.length && !confirm("Replace your inventory, coins, armor and weapons with these packages?")) return;
      ctx.edit("equipment", (ch) => { applyEquipment(ch, ch.equipment.classOption, ch.equipment.backgroundOption); });
      ctx.setStatus("Starting equipment added: armor, Shield and weapons are set from the packages.");
    } } }, "Use these packages"));
}

// ---------- notes ----------

export function notes(ctx) {
  const { c } = ctx;
  const area = (key, label, rows) => el("div", { className: "cell" }, el("label", { htmlFor: fieldId(`notes-${key}`) }, label),
    el("textarea", { id: fieldId(`notes-${key}`), rows, value: c.notes[key], on: { input: (e) => ctx.editText((ch) => { ch.notes[key] = e.target.value.slice(0, 20000); }) } }));
  return card("Appearance, backstory & notes", area("appearance", "Appearance", 3), area("backstory", "Backstory", 4), area("notes", "Notes", 4));
}

export function hpMethod(ctx) {
  const { c, d } = ctx;
  if (!d.cls) return null;
  const levels = Array.from({ length: c.level - 1 }, (_, i) => i + 2);
  return el("div", { className: "hp-method" },
    el("fieldset", { className: "pick" }, el("legend", {}, "Hit Points after level 1 (p.23)"),
      ["fixed", "rolled"].map((m) => el("label", { className: "pkg", htmlFor: fieldId(`hpm-${m}`) },
        el("input", { type: "radio", name: "hp-method", id: fieldId(`hpm-${m}`), checked: c.hp.method === m, on: { change: () => ctx.edit("hp.rolls", (ch) => { ch.hp.method = m; }) } }),
        el("span", {}, m === "fixed" ? `Fixed: ${({ 12: 7, 10: 6, 8: 5, 6: 4 })[d.hitDie]} + CON each level` : `Rolled: your d${d.hitDie} roll + CON each level (minimum 1)`)))),
    c.hp.method === "rolled" && levels.length ? el("div", { className: "rolls" }, levels.map((lv) => el("div", { className: "cell" },
      el("label", { htmlFor: fieldId(`hproll-${lv}`) }, `Level ${lv}`),
      el("input", { type: "number", id: fieldId(`hproll-${lv}`), min: 1, max: d.hitDie, value: c.hp.rolls[lv] ?? "", on: { change: (e) => ctx.edit("hp.rolls", (ch) => {
        const v = toInt(e.target.value, NaN); if (Number.isFinite(v)) ch.hp.rolls[lv] = v; else delete ch.hp.rolls[lv];
      }) } })))) : null,
    fieldMessage(ctx, "hp.rolls"));
}
