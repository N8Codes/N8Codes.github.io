// Open Game Content under the Open Game License v1.0a (see license.js): the game rules in this file and the code that holds or computes them.
// Building blocks for the 3.5 sheet, shared by the whole sheet and the guided steps.
// Every value reaches the page as text; edits go through ctx.edit so the rules check them.

import { el, card, fieldId, fieldMessage, fieldAttrs, select, signed, labelled } from "../../core/ui.js";
import { ABILITIES, ABILITY_IDS, SKILLS, ALIGNMENTS, abilityName, abilityIncreaseLevel, MAX_LEVEL } from "./data/rules.js";
import { CLASSES, classById } from "./data/classes.js";
import { RACES, LANGUAGES, SECRET_LANGUAGES } from "./data/races.js";
import { FEATS, featById } from "./data/feats.js";
import { WEAPONS, ARMOR } from "./data/equipment.js";
import { newLevel } from "./model.js";
import { slotAllows, findSpell } from "./validate.js";
import { classSkillsOf } from "./derive.js";
import { listFor } from "./data/spells.js";

/** A number that depends on a score: "—" until it exists. */
const dash = "—";
const toInt = (v, fallback = 0) => { const n = Number.parseInt(v, 10); return Number.isFinite(n) ? n : fallback; };
const sum = (parts) => parts.map((p, i) => `${p.label} ${i && p.amount >= 0 ? "+" : ""}${p.amount}`).join(", ");
const fmtRanks = (n) => (Number.isInteger(n) ? String(n) : `${Math.floor(n) || ""}½`);
export const skillLabel = (c, s) => (s.sub ? `${s.name} (${c.skillNames[s.id] || "…"})` : s.name);
const toggleIn = (arr, value, on) => (on ? (arr.includes(value) ? arr : [...arr, value]) : arr.filter((v) => v !== value));
const ordinal = (n) => `${n}${n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"}`;

export function explain(text, cite) {
  return el("p", { className: "explain" }, text, cite ? el("span", { className: "cite" }, cite) : null);
}

/** Checkbox list for "choose N": options [{ value, label, hint }]. */
export function pickList(ctx, { key, legend, options, max, list, toggle }) {
  const chosen = list ?? [];
  return el("fieldset", { className: "pick" },
    el("legend", {}, legend, max ? el("span", { className: "count" }, ` ${chosen.length} of ${max} chosen`) : null),
    el("div", { className: "pick-grid" }, options.map((o) => {
      const id = fieldId(`${key}-${o.value}`);
      return el("label", { className: "pick-item", htmlFor: id },
        el("input", { type: "checkbox", id, checked: chosen.includes(o.value), aria: { describedby: fieldId(key) + "-msg" },
          on: { change: (e) => ctx.edit(key, (c) => toggle(c, o.value, e.target.checked)) } }),
        el("span", {}, o.label), o.hint ? el("small", {}, o.hint) : null);
    })),
    fieldMessage(ctx, key));
}

// ---------- identity ----------

export function identity(ctx) {
  const { c, d } = ctx;
  const text = (key, label, value, set, max = 200) => labelled(ctx, key, label,
    el("input", { ...fieldAttrs(ctx, key), type: "text", value, maxlength: max, on: { input: (e) => ctx.editText((ch) => set(ch, e.target.value)) } }));
  const classLine = Object.entries(d.classLevels).map(([id, n]) => `${classById(id).name} ${n}`).join(" / ") || dash;
  return el("div", { className: "identity" },
    el("div", { className: "top" },
      text("name", "Character name", c.name, (ch, v) => { ch.name = v; }),
      raceSelect(ctx),
      el("div", { className: "cell" }, el("span", { className: "lbl" }, "Classes"), el("div", { className: "big-line" }, classLine)),
      el("div", { className: "cell" }, el("span", { className: "lbl" }, "Character level"), el("div", { className: "big-line" }, String(d.level))),
      labelled(ctx, "xp", "XP", el("input", { ...fieldAttrs(ctx, "xp", { className: "wide" }), type: "number", min: 0, value: c.xp,
        on: { change: (e) => ctx.edit("xp", (ch) => { ch.xp = Math.max(0, toInt(e.target.value)); }) } }))),
    el("div", { className: "top2" },
      labelled(ctx, "alignment", "Alignment", select({ ...fieldAttrs(ctx, "alignment"), on: { change: (e) => ctx.edit("alignment", (ch) => { ch.alignment = e.target.value; }) } },
        ALIGNMENTS.map((a) => ({ value: a, label: a })), c.alignment, "Choose…")),
      text("deity", "Deity", c.deity, (ch, v) => { ch.deity = v; }, 80),
      el("div", { className: "cell" }, el("span", { className: "lbl" }, "Size"), el("div", { className: "big-line" }, d.race ? d.size : dash)),
      el("div", { className: "cell" }, el("span", { className: "lbl" }, "Favored class"), el("div", { className: "big-line" }, d.race ? d.race.favoredText : dash)),
      text("player", "Player", c.player, (ch, v) => { ch.player = v; })));
}

export function raceSelect(ctx) {
  return labelled(ctx, "raceId", "Race", select({ ...fieldAttrs(ctx, "raceId"), on: { change: (e) => ctx.edit("raceId", (ch) => setRace(ch, e.target.value)) } },
    RACES.map((r) => ({ value: r.id, label: r.name })), ctx.c.raceId, "Choose…"));
}
export function setRace(ch, id) {
  if (ch.raceId === id) return;
  ch.raceId = id;
  delete ch.feats.human;
  ch.languages = [];
}

// ---------- levels (class per level, Hit Die, ability increase, skill points) ----------

export function levelsCard(ctx) {
  const { c, d } = ctx;
  const rows = c.levels.map((lv, i) => {
    const L = i + 1;
    const cls = classById(lv.classId);
    const classSel = select({ ...fieldAttrs(ctx, `level.${L}.class`), aria: { label: `Class at level ${L}` },
      on: { change: (e) => ctx.edit([`level.${L}.class`, "alignment"], (ch) => setLevelClass(ch, i, e.target.value)) } },
    CLASSES.map((x) => ({ value: x.id, label: x.name })), lv.classId, "Choose…");
    const hp = !cls ? el("span", { className: "cite" }, dash)
      : L === 1 ? el("span", { className: "cite" }, `d${cls.hitDie}: max ${cls.hitDie}`)
        : el("input", { ...fieldAttrs(ctx, `level.${L}.hp`), type: "number", min: 1, max: cls.hitDie, value: lv.hp ?? "", placeholder: `d${cls.hitDie}`, aria: { label: `Hit Die roll at level ${L}` },
          on: { change: (e) => ctx.edit(`level.${L}.hp`, (ch) => { const v = toInt(e.target.value, NaN); ch.levels[i].hp = Number.isFinite(v) ? v : null; }) } });
    const inc = abilityIncreaseLevel(L)
      ? select({ ...fieldAttrs(ctx, `level.${L}.increase`), aria: { label: `Ability increase at level ${L}` },
        on: { change: (e) => ctx.edit(`level.${L}.increase`, (ch) => { ch.levels[i].increase = e.target.value; }) } },
      ABILITIES.map((a) => ({ value: a.id, label: `+1 ${a.short}` })), lv.increase, "+1 to…")
      : el("span", { className: "cite" }, "");
    const avail = d.points[i];
    const pts = avail === null ? dash : `${d.spent[i]} / ${avail}`;
    return el("tr", {},
      el("td", { className: "n" }, String(L)),
      el("td", {}, classSel, fieldMessage(ctx, `level.${L}.class`)),
      el("td", {}, hp, fieldMessage(ctx, `level.${L}.hp`)),
      el("td", {}, inc, fieldMessage(ctx, `level.${L}.increase`)),
      el("td", { className: d.spent[i] > (avail ?? 0) ? "n over" : "n" }, pts, fieldMessage(ctx, `skills.${L}`)));
  });
  const last = c.levels[c.levels.length - 1];
  const lastHasData = last && (last.hp || Object.keys(last.skills).length || last.increase);
  return card("Levels & classes",
    el("p", { className: "cite note" }, "One row per character level. Pick a different class on a row to multiclass: base attack and saves add up per class, feats and ability increases follow character level (Classes II, Multiclass Characters)."),
    el("div", { className: "tablewrap" }, el("table", { className: "levels" },
      el("thead", {}, el("tr", {}, ["Lv", "Class", "Hit Die", "Ability", "Skill pts"].map((h) => el("th", {}, h)))),
      el("tbody", {}, rows))),
    el("div", { className: "row" },
      el("button", { type: "button", className: "btn small", disabled: c.levels.length >= MAX_LEVEL,
        on: { click: () => ctx.edit("levels", (ch) => { ch.levels.push(newLevel(ch.levels[ch.levels.length - 1]?.classId || "")); }) } }, "+ Add a level"),
      el("button", { type: "button", className: "btn small", disabled: c.levels.length <= 1,
        on: { click: () => { if (lastHasData && !confirm(`Remove level ${c.levels.length} and what was chosen at it?`)) return; ctx.edit("levels", (ch) => { ch.levels.pop(); }); } } }, "Remove the last level")),
    fieldMessage(ctx, "levels"));
}

function setLevelClass(ch, i, id) {
  const lv = ch.levels[i];
  if (lv.classId === id) return;
  lv.classId = id;
  // Points bought at a level depend on that level's class list, and the roll on its die: start them over.
  lv.skills = {};
  const cls = classById(id);
  if (lv.hp && cls && lv.hp > cls.hitDie) lv.hp = null;
}

// ---------- ability scores ----------

export function abilityBlock(ctx, a) {
  const { c, d } = ctx;
  const info = ABILITIES.find((x) => x.id === a);
  const key = `abilities.${a}`;
  const base = el("input", { ...fieldAttrs(ctx, key), type: "number", min: 1, max: 99, value: c.baseScores[a] ?? "", placeholder: dash, aria: { label: `${info.name} score` },
    on: { change: (e) => ctx.edit(key, (ch) => { const v = toInt(e.target.value, NaN); ch.baseScores[a] = Number.isFinite(v) ? v : null; }) } });
  const steps = d.abilitySteps[a];
  const modText = d.mod[a] === null ? dash : signed(d.mod[a]);
  return el("div", { className: "ability" },
    el("div", { className: "name" }, info.short),
    el("div", { className: "mod", aria: { label: `${info.name} modifier ${modText}` } }, modText),
    steps.length && d.scores[a] !== null
      ? [el("div", { className: "score" }, String(d.scores[a])), el("div", { className: "src from" }, base, el("span", {}, " base"), steps.map((s) => el("span", {}, ` ${signed(s.amount)} ${s.label}`)))]
      : el("div", { className: "score-edit" }, base),
    fieldMessage(ctx, key));
}

export function abilitiesCard(ctx) {
  return card("Ability scores",
    el("p", { className: "cite note" }, "Type the scores your group's method gave you; race and level increases are added for you (Races; Epic Level Basics, Ability Increases). Modifier: (score − 10) ÷ 2, rounded down (Basics)."),
    el("div", { className: "ab-col ab-row" }, ABILITY_IDS.map((a) => abilityBlock(ctx, a))));
}

// ---------- combat ----------

export function combat(ctx) {
  const { c, d } = ctx;
  const stat = (label, value, note, cls = "") => el("div", { className: `stat ${cls}` }, el("span", { className: "lbl" }, label), el("span", { className: "big" }, value), note ? el("span", { className: "cite" }, note) : null);
  const k = (v, f = String) => (d.scoresKnown ? f(v) : dash);
  const armorOpts = ARMOR.filter((a) => ["light", "medium", "heavy"].includes(a.kind)).map((a) => ({ value: a.id, label: `${a.name} (${a.kind}, +${a.ac})` }));
  const shieldOpts = ARMOR.filter((a) => a.kind === "shield").map((a) => ({ value: a.id, label: `${a.name} (+${a.ac})` }));
  const saveRow = (s, name) => el("li", {}, el("span", { className: "v" }, d.mod[{ fort: "con", ref: "dex", will: "wis" }[s]] === null ? dash : signed(d.saves[s].total)), name,
    el("span", { className: "a" }, sum(d.saves[s].parts)));
  return card("Combat",
    el("div", { className: "stats" },
      stat("Armor Class", k(d.ac), d.scoresKnown ? sum(d.acParts) : null, "key"),
      stat("Touch", k(d.touch)), stat("Flat-footed", k(d.flatFooted)),
      stat("Initiative", k(d.initiative, signed), d.scoresKnown ? sum(d.initParts) : null),
      stat("Base attack", d.attackSeq.map(signed).join("/")),
      stat("Grapple", k(d.grapple, signed)),
      stat("Speed", `${d.speed} ft`, sum(d.speedParts))),
    el("div", { className: "hp" },
      labelled(ctx, "hp.current", "Current HP", el("input", { ...fieldAttrs(ctx, "hp.current"), type: "number", min: -10, value: d.hpKnown ? d.hpCurrent : "", placeholder: dash, disabled: !d.hpKnown,
        on: { change: (e) => ctx.edit("hp.current", (ch) => { const v = toInt(e.target.value, d.hpCurrent); ch.hp.current = v === d.hpMax ? null : v; }) } })),
      el("div", { className: "cell" }, el("span", { className: "lbl" }, "Max HP"), el("div", { className: "big" }, d.hpKnown ? String(d.hpMax) : dash),
        d.hpKnown ? el("span", { className: "cite" }, sum(d.hpParts)) : null),
      labelled(ctx, "hp.temp", "Temp HP", el("input", { ...fieldAttrs(ctx, "hp.temp"), type: "number", min: 0, value: c.hp.temp, on: { change: (e) => ctx.edit("hp.temp", (ch) => { ch.hp.temp = Math.max(0, toInt(e.target.value)); }) } })),
      labelled(ctx, "hp.nonlethal", "Nonlethal", el("input", { ...fieldAttrs(ctx, "hp.nonlethal"), type: "number", min: 0, value: c.hp.nonlethal, on: { change: (e) => ctx.edit("hp.nonlethal", (ch) => { ch.hp.nonlethal = Math.max(0, toInt(e.target.value)); }) } }))),
    el("p", { className: "cite note" }, "Hit points: the first class's Hit Die in full at level 1, then your rolls; Constitution modifier each level, at least 1 per level (Basics, Constitution). Dying at −1, dead at −10 (Abilities and Conditions)."),
    el("h3", { className: "sub-h" }, "Saving throws"),
    el("ul", { className: "list" }, saveRow("fort", "Fortitude"), saveRow("ref", "Reflex"), saveRow("will", "Will")),
    el("div", { className: "row" },
      labelled(ctx, "armorId", "Armor", select({ ...fieldAttrs(ctx, "armorId"), on: { change: (e) => ctx.edit("armorId", (ch) => { ch.armorId = e.target.value; }) } }, armorOpts, c.armorId, "None")),
      labelled(ctx, "shieldId", "Shield", select({ ...fieldAttrs(ctx, "shieldId"), on: { change: (e) => ctx.edit("shieldId", (ch) => { ch.shieldId = e.target.value; }) } }, shieldOpts, c.shieldId, "None"))),
    d.armor || d.shield || d.load !== "light" ? el("p", { className: "cite" }, `Max Dex ${d.maxDex === null ? "none" : signed(d.maxDex)} · check penalty ${d.acp} · spell failure ${d.asf}%`) : null,
    !d.armorProficient ? el("p", { className: "todo" }, `Not proficient with ${d.armor.kind} armor: its armor check penalty also applies to attack rolls (Equipment, Armor).`) : null,
    !d.shieldProficient ? el("p", { className: "todo" }, "Not proficient with this shield: its armor check penalty also applies to attack rolls (Equipment, Armor).") : null,
    d.darkvision || d.lowLight ? el("p", { className: "cite" }, [d.darkvision ? `Darkvision ${d.darkvision} ft.` : "", d.lowLight ? "Low-light vision." : ""].filter(Boolean).join(" ")) : null);
}

// ---------- attacks ----------

export function attacks(ctx) {
  const { c, d } = ctx;
  const k = (t) => (d.scoresKnown ? t : dash);
  const rows = d.attacks.map((a) => {
    const remove = el("button", { type: "button", className: "btn small", aria: { label: `Remove ${a.name || "attack"}` }, on: { click: () => ctx.edit("attacks", (ch) => { ch.attacks.splice(a.index, 1); }) } }, "×");
    const rating = a.composite ? el("label", { className: "rating" }, "Strength rating +", el("input", { type: "number", min: 0, max: 10, id: fieldId(`attack-${a.index}-rating`), value: a.rating,
      on: { change: (e) => ctx.edit("attacks", (ch) => { ch.attacks[a.index].rating = Math.min(10, Math.max(0, toInt(e.target.value))); }) } })) : null;
    if (!a.custom) return el("tr", {}, el("td", {}, a.name, rating, a.notes.length ? el("small", { className: "cite block" }, a.notes.join(" · ")) : null),
      el("td", { className: "n" }, k(a.attacks.map(signed).join("/"))), el("td", {}, k(a.damage)), el("td", {}, a.critical), el("td", {}, remove));
    const field = (prop, label) => el("input", { type: "text", id: fieldId(`attack-${a.index}-${prop}`), value: c.attacks[a.index][prop], aria: { label },
      on: { input: (e) => ctx.editText((ch) => { ch.attacks[a.index][prop] = e.target.value.slice(0, 80); }) } });
    return el("tr", {}, el("td", {}, field("name", "Attack name")), el("td", {}, field("bonus", "Attack bonus")), el("td", {}, field("damage", "Damage")), el("td", {}, field("notes", "Notes")), el("td", {}, remove));
  });
  const adder = select({ id: "f-add-weapon", aria: { label: "Add a weapon" }, on: { change: (e) => { if (e.target.value) ctx.edit("attacks", (ch) => { ch.attacks.push({ weaponId: e.target.value }); }); } } },
    WEAPONS.filter((w) => !w.ammo && w.id !== "unarmed-strike").map((w) => ({ value: w.id, label: `${w.name} (${w.category}${d.weaponProf.has(w.id) ? "" : ", not proficient"})` })), "", "+ Add a weapon…");
  return card("Attacks",
    el("div", { className: "tablewrap" }, el("table", {},
      el("thead", {}, el("tr", {}, ["Weapon", "Attack", "Damage", "Critical", ""].map((h) => el("th", {}, h)))),
      el("tbody", {},
        el("tr", {}, el("td", {}, d.unarmed.name, d.unarmed.nonlethal ? el("small", { className: "cite block" }, "nonlethal") : null),
          el("td", { className: "n" }, k(d.unarmed.attacks.map(signed).join("/"))), el("td", {}, k(d.unarmed.damage)), el("td", {}, "×2"), el("td", {})),
        rows))),
    el("div", { className: "row" }, adder,
      el("button", { type: "button", className: "btn small", on: { click: () => ctx.edit("attacks", (ch) => { ch.attacks.push({ name: "", bonus: "", damage: "", notes: "" }); }) } }, "+ Add another attack")),
    d.flurry || d.sneakAttack ? el("p", { className: "cite" }, [d.flurry ? `Flurry of blows ${d.flurry}` : "", d.sneakAttack ? `Sneak attack ${d.sneakAttack}` : ""].filter(Boolean).join(" · ")) : null,
    el("p", { className: "cite note" }, "Melee: base attack + STR; ranged: base attack + DEX; +1 if Small. Damage adds STR (1½× two-handed); a bow takes a STR penalty, and a composite bow adds STR up to its strength rating, −2 to hit if your STR bonus is lower (Combat I; Basics, Strength; Equipment)."));
}

// ---------- skills ----------

let spendLevel = null; // which character level the skill buttons spend at (UI state only; never saved)

export function skillsCard(ctx, { compact = false } = {}) {
  const { c, d } = ctx;
  const L = Math.min(Math.max(spendLevel ?? c.levels.length, 1), c.levels.length);
  const i = L - 1;
  const lv = c.levels[i];
  const cls = classById(lv.classId);
  const own = new Set(classSkillsOf(cls, c));
  const avail = d.points[i];
  const left = avail === null ? null : avail - d.spent[i];
  const levelSel = select({ id: "f-spend-level", aria: { label: "Spend skill points at level" },
    on: { change: (e) => { spendLevel = toInt(e.target.value, c.levels.length); ctx.refresh(); } } },
  c.levels.map((x, n) => ({ value: String(n + 1), label: `Level ${n + 1}${classById(x.classId) ? ` (${classById(x.classId).name})` : ""}` })), String(L));
  const rows = SKILLS.map((s) => {
    const sk = d.skills[s.id];
    const pts = lv.skills[s.id] || 0;
    const keys = [`skills.${L}`, `skill.${s.id}`];
    const change = (delta) => ctx.edit(keys, (ch) => {
      const n = Math.max(0, (ch.levels[i].skills[s.id] || 0) + delta);
      if (n) ch.levels[i].skills[s.id] = n; else delete ch.levels[i].skills[s.id];
    });
    const name = s.sub
      ? el("span", { className: "sub-skill" }, `${s.name} (`, el("input", { type: "text", className: "sub-name", id: fieldId(`skillname-${s.id}`), value: c.skillNames[s.id], maxlength: 60, placeholder: s.sub === "craft" ? "alchemy" : s.sub === "perform" ? "oratory" : "sailor",
        aria: { label: `${s.name}: which one` }, on: { input: (e) => ctx.editText((ch) => { ch.skillNames[s.id] = e.target.value; }) } }), ")")
      : s.name;
    // Class or cross-class is said in words for screen readers, not only by the dot; trained-only and armor
    // penalties are short marks explained in the legend under the table.
    const sr = [sk.classSkill ? "class skill" : "cross-class", s.trained ? "trained only" : "", s.acp ? (s.acp === 2 ? "double armor check penalty" : "armor check penalty") : ""].filter(Boolean).join(", ");
    const marks = `${s.trained ? "*" : ""}${s.acp ? (s.acp === 2 ? "††" : "†") : ""}`;
    return el("tr", { className: sk.classSkill ? "cs" : "" },
      el("td", {}, el("span", { className: sk.classSkill ? "dot on" : "dot", title: sk.classSkill ? "Class skill" : "Cross-class", aria: { hidden: "true" } }), name,
        marks ? el("sup", { className: "mark", aria: { hidden: "true" } }, marks) : null, el("span", { className: "sr-only" }, ` (${sr})`), fieldMessage(ctx, `skill.${s.id}`)),
      el("td", { className: "n" }, !sk.known ? dash : sk.usable ? signed(sk.total) : el("span", { className: "cite", title: "Trained only: needs at least 1 rank" }, "untrained")),
      el("td", { className: "n" }, fmtRanks(sk.ranks)),
      el("td", { className: "a" }, sk.parts.filter((p) => p.label !== "ranks").map((p) => `${p.label} ${signed(p.amount)}`).join(", ")),
      el("td", { className: "spend" },
        el("button", { type: "button", className: "btn small", disabled: !pts, aria: { label: `Take back a point from ${skillLabel(c, s)} at level ${L}` }, on: { click: () => change(-1) } }, "−"),
        el("span", { className: own.has(s.id) ? "pts" : "pts cross", title: own.has(s.id) ? "1 rank per point" : "½ rank per point (cross-class)" }, String(pts),
          own.has(s.id) ? null : el("span", { className: "half" }, "½")),
        el("button", { type: "button", className: "btn small", disabled: avail === null, aria: { label: `Spend a point on ${skillLabel(c, s)} at level ${L} (${own.has(s.id) ? "1 rank" : "½ rank"} per point)` }, on: { click: () => change(1) } }, "+")));
  });
  return card("Skills",
    el("div", { className: "row spend-row" }, el("label", { htmlFor: "f-spend-level" }, "Spend points at"), levelSel,
      el("span", { className: "meter" }, avail === null ? "choose a class and Intelligence first" : [el("strong", {}, String(left)), ` of ${avail} points left`])),
    fieldMessage(ctx, `skills.${L}`),
    el("p", { className: "cite note" }, `${cls ? `At this level a point buys 1 rank in a ${cls.name} class skill (dot) and ½ rank in any other.` : ""} Maximum ranks: level + 3 for a class skill of any of your classes, half that otherwise (Skills I).`),
    el("div", { className: "tablewrap" }, el("table", { className: compact ? "skills-t compact" : "skills-t" },
      el("thead", {}, el("tr", {}, ["Skill", "Total", "Ranks", "From", `Points at L${L}`].map((h) => el("th", {}, h)))),
      el("tbody", {}, rows))),
    el("p", { className: "cite legend" }, el("span", { className: "dot on", aria: { hidden: "true" } }), " class skill · * trained only · † armor check penalty (†† double)"),
    d.situational.length ? el("ul", { className: "list" }, d.situational.map((x) => el("li", {}, `Synergy: ${x.text}`, el("span", { className: "a" }, x.cite)))) : null);
}

// ---------- feats ----------

const DETAIL_LABEL = { weapon: "Weapon", skill: "Skill", school: "School", text: "Detail" };
const SCHOOLS = ["Abjuration", "Conjuration", "Divination", "Enchantment", "Evocation", "Illusion", "Necromancy", "Transmutation"];

export function featEditor(ctx, slot) {
  const { c } = ctx;
  const key = `feat:${slot.key}`;
  const data = c.feats[slot.key] || { id: "", detail: "" };
  const update = (fn) => ctx.edit(key, (ch) => { ch.feats[slot.key] = { ...(ch.feats[slot.key] || data) }; fn(ch.feats[slot.key]); });
  const feat = featById(slot.fixed || data.id);
  const parts = [];
  if (slot.fixed) parts.push(el("p", { className: "fixed-feat" }, el("strong", {}, feat?.name ?? slot.fixed), el("span", { className: "cite" }, ` from ${slot.source}`)));
  else {
    const options = FEATS.filter((f) => slotAllows(slot, f)).map((f) => ({ value: f.id, label: f.name }));
    parts.push(select({ ...fieldAttrs(ctx, key), aria: { label: slot.label }, on: { change: (e) => update((f) => { f.id = e.target.value; f.detail = ""; }) } }, options, data.id, "Choose a feat…"));
    if (feat?.detail) parts.push(detailControl(ctx, slot, feat, data.detail, update));
  }
  return el("div", { className: "feat" },
    el("div", { className: "lbl" }, slot.label, slot.ignorePrereqs && !slot.fixed ? el("span", { className: "cite" }, " (prerequisites waived)") : null),
    ...parts,
    feat ? el("p", { className: "cite note" }, feat.summary, feat.prereq?.text ? el("span", { className: "block" }, `Needs: ${feat.prereq.text}`) : null) : null,
    fieldMessage(ctx, key));
}

function detailControl(ctx, slot, feat, value, update) {
  const attrs = { id: fieldId(`feat-${slot.key}-detail`), aria: { label: `${feat.name}: ${DETAIL_LABEL[feat.detail] ?? "detail"}` } };
  const onChange = { change: (e) => update((f) => { f.detail = e.target.value; }) };
  if (feat.detail === "weapon") return select({ ...attrs, on: onChange }, WEAPONS.filter((w) => !w.ammo).map((w) => ({ value: w.id, label: w.name })), value, "Which weapon…");
  if (feat.detail === "skill") return select({ ...attrs, on: onChange }, SKILLS.map((s) => ({ value: s.id, label: skillLabel(ctx.c, s) })), value, "Which skill…");
  if (feat.detail === "school") return select({ ...attrs, on: onChange }, SCHOOLS.map((s) => ({ value: s.toLowerCase(), label: s })), value, "Which school…");
  return el("input", { ...attrs, type: "text", value, maxlength: 80, on: { change: (e) => update((f) => { f.detail = e.target.value.slice(0, 80); }) } });
}

export function featsCard(ctx, filter = () => true) {
  const slots = ctx.d.slots.filter(filter);
  return card("Feats", slots.length ? slots.map((s) => featEditor(ctx, s)) : el("p", { className: "empty" }, dash),
    el("p", { className: "cite note" }, "A feat at level 1 and every third level; Humans get one more at 1st level; some classes add bonus feats. You need a feat's prerequisites at the level you take it (Feats, Prerequisites)."));
}

// ---------- class features and choices ----------

export function choiceEditor(ctx, ch) {
  const { c } = ctx;
  const key = `choice:${ch.key}`;
  const list = c.choices[ch.key] || [];
  const legend = `${ch.label || ch.id} (${ch.cls.name} ${ch.level})`;
  if (ch.kind === "text") {
    return labelled(ctx, key, legend, el("textarea", { id: fieldId(key), rows: 2, value: list.join("\n"),
      on: { input: (e) => ctx.editText((chr) => { chr.choices[ch.key] = e.target.value.split("\n").slice(0, 20).map((x) => x.slice(0, 200)); }) } }));
  }
  if (ch.kind === "weapon") {
    return labelled(ctx, key, legend, select({ ...fieldAttrs(ctx, key), on: { change: (e) => ctx.edit(key, (chr) => { chr.choices[ch.key] = e.target.value ? [e.target.value] : []; }) } },
      WEAPONS.filter((w) => !w.ammo && w.id !== "unarmed-strike").map((w) => ({ value: w.id, label: w.name })), list[0] ?? "", "Choose…"));
  }
  if (ch.count === 1) {
    return labelled(ctx, key, legend, select({ ...fieldAttrs(ctx, key), on: { change: (e) => ctx.edit(key, (chr) => { chr.choices[ch.key] = e.target.value ? [e.target.value] : []; }) } },
      (ch.options || []).map((o) => ({ value: o.id, label: o.name })), list[0] ?? "", ch.optional ? "None" : "Choose…"));
  }
  // A long list (a cleric's 22 domains) reads better as one dropdown per pick than as a wall of checkboxes.
  if ((ch.options || []).length > 8) {
    return el("div", { className: "cell" }, el("span", { className: "lbl" }, legend), el("div", { className: "row" },
      Array.from({ length: ch.count }, (_, n) => select({ id: fieldId(`${key}-${n}`), aria: { label: `${ch.label || ch.id} ${n + 1}`, describedby: fieldId(key) + "-msg" },
        on: { change: (e) => ctx.edit(key, (chr) => { const now = [...(chr.choices[ch.key] || [])]; now[n] = e.target.value; chr.choices[ch.key] = now.filter(Boolean); }) } },
      (ch.options || []).map((o) => ({ value: o.id, label: o.name })), list[n] ?? "", "Choose…"))),
    fieldMessage(ctx, key));
  }
  return pickList(ctx, { key, legend, max: ch.count, list, options: (ch.options || []).map((o) => ({ value: o.id, label: o.name })),
    toggle: (chr, v, on) => { chr.choices[ch.key] = toggleIn(chr.choices[ch.key] || [], v, on); } });
}

export function choicesBlock(ctx) {
  const list = ctx.d.choices;
  return list.length ? el("div", { className: "choices-list" }, list.map((ch) => choiceEditor(ctx, ch))) : null;
}

export function featuresCard(ctx) {
  const { d } = ctx;
  const byClass = d.classes.map((cls) => el("div", {},
    el("h3", { className: "sub-h" }, `${cls.name} ${d.classLevels[cls.id]}`),
    el("ul", { className: "list" }, d.features.filter((f) => f.cls === cls).map((f) => el("li", {}, el("span", { className: "v lvl" }, String(f.level)), f.name)),
      el("li", {}, el("span", { className: "why" }, "Proficiency"), cls.proficiencies.text))));
  return card("Class features", byClass.length ? byClass : el("p", { className: "empty" }, dash), choicesBlock(ctx));
}

export function raceCard(ctx) {
  const { d } = ctx;
  if (!d.race) return card("Racial traits", el("p", { className: "empty" }, dash));
  const adj = Object.entries(d.race.abilities).map(([a, n]) => `${signed(n)} ${abilityName(a)}`).join(", ");
  return card(`Racial traits: ${d.race.name}`,
    el("ul", { className: "list" },
      el("li", {}, el("span", { className: "why" }, "Abilities"), adj || "No adjustments"),
      el("li", {}, el("span", { className: "why" }, "Size and speed"), `${d.race.size}, ${d.race.speed} ft`),
      Object.keys(d.race.skillBonuses).length ? el("li", {}, el("span", { className: "why" }, "Skills"), Object.entries(d.race.skillBonuses).map(([s, n]) => `${signed(n)} ${SKILLS.find((x) => x.id === s).name}`).join(", ")) : null,
      d.race.traits.map((t) => el("li", {}, t))),
    el("p", { className: "cite note" }, `${d.race.cite}. The SRD doesn't give the size of the multiclass experience penalty, so the sheet doesn't apply one.`));
}

// ---------- limited-use features ----------

export function resources(ctx) {
  const { d } = ctx;
  if (!d.resources.length) return null;
  return card("Limited-use features", el("ul", { className: "list res" }, d.resources.map((r) => el("li", {},
    el("span", { className: "res-name" }, r.name, el("small", { className: "cite block" }, `per ${r.per} · ${r.cls.name}`)),
    el("span", { className: "a" }, `${r.max - Math.min(r.used, r.max)} of ${r.max} left`),
    el("button", { type: "button", className: "btn small", disabled: r.used >= r.max, aria: { label: `Use ${r.name}` }, on: { click: () => ctx.edit(`used.${r.key}`, (ch) => { ch.used[r.key] = (ch.used[r.key] || 0) + 1; }) } }, "Use"),
    el("button", { type: "button", className: "btn small", disabled: r.used <= 0, aria: { label: `Regain a use of ${r.name}` }, on: { click: () => ctx.edit(`used.${r.key}`, (ch) => { ch.used[r.key] = Math.max(0, (ch.used[r.key] || 0) - 1); }) } }, "Regain"),
    fieldMessage(ctx, `used.${r.key}`)))),
  el("button", { type: "button", className: "btn small", on: { click: () => ctx.edit("used", (ch) => { ch.used = {}; for (const k of Object.keys(ch.slotsUsed)) ch.slotsUsed[k] = Array(10).fill(0); }) } }, "Rest: regain all uses and spell slots"));
}

// ---------- spellcasting ----------

const pickLevel = {}; // class id → spell level shown in the picker (UI state only; never saved)

export function spellcasting(ctx) {
  const { c, d } = ctx;
  return d.casting.map((sc) => {
    const id = sc.cls.id;
    const rows = sc.levels.map((lv, L) => {
      if (!lv) return null;
      const used = sc.used[L] || 0;
      return el("tr", {},
        el("td", { className: "n" }, L === 0 ? "0" : ordinal(L)),
        el("td", { className: "n" }, lv.canCast ? String(lv.total) : el("span", { className: "cite", title: `Needs ${sc.ability.toUpperCase()} ${10 + L}` }, "0")),
        el("td", { className: "a" }, [`${lv.base} table`, lv.bonus ? `+${lv.bonus} ${sc.ability.toUpperCase()}` : "", lv.extra ? `+${lv.extra} ${id === "cleric" ? "domain" : "specialist"}` : ""].filter(Boolean).join(" ")),
        el("td", { className: "n" }, lv.known === null ? "" : String(lv.known)),
        el("td", { className: "n" }, lv.dc === null ? dash : String(lv.dc)),
        el("td", { className: "spend" },
          el("button", { type: "button", className: "btn small", disabled: used <= 0, aria: { label: `Regain a level ${L} ${sc.cls.name} spell` }, on: { click: () => ctx.edit(`slots.${id}.${L}`, (ch) => { const arr = ch.slotsUsed[id] ? [...ch.slotsUsed[id]] : Array(10).fill(0); arr[L] = Math.max(0, arr[L] - 1); ch.slotsUsed[id] = arr; }) } }, "−"),
          el("span", { className: "pts" }, `${used} cast`),
          el("button", { type: "button", className: "btn small", disabled: used >= lv.total, aria: { label: `Cast a level ${L} ${sc.cls.name} spell` }, on: { click: () => ctx.edit(`slots.${id}.${L}`, (ch) => { const arr = ch.slotsUsed[id] ? [...ch.slotsUsed[id]] : Array(10).fill(0); arr[L] += 1; ch.slotsUsed[id] = arr; }) } }, "+")),
        fieldMessage(ctx, `slots.${id}.${L}`));
    }).filter(Boolean);
    const mine = c.spells.map((s, i) => ({ s, i })).filter(({ s }) => s.classId === id);
    const list = listFor(id);
    const prohibited = id === "wizard" ? (c.choices["wizard:prohibited-schools"] || []) : [];
    const domainSpells = id === "cleric" ? d.domains.flatMap((dm) => dm.spells.map((x) => ({ ...x, domain: dm.name }))) : [];
    const lookup = (sp) => (sp.domain ? domainSpells.find((x) => x.level === sp.level && x.name.toLowerCase() === sp.name.trim().toLowerCase()) : findSpell(list, sp.name, sp.level));
    const spellRows = mine.map(({ s: sp, i }) => {
      const entry = lookup(sp);
      return el("tr", {},
        el("td", {}, el("input", { type: "text", id: fieldId(`spell-${i}-name`), value: sp.name, title: entry?.summary, aria: { label: "Spell name" }, on: { change: (e) => ctx.edit(`spells.${id}`, (ch) => { ch.spells[i].name = e.target.value.slice(0, 80); }) } }),
          entry ? el("small", { className: "cite block note" }, [entry.summary, entry.school ? ` (${entry.school})` : "", sp.domain && entry.domain ? ` · ${entry.domain} domain` : ""].join("")) : null),
        el("td", { className: "n" }, String(sp.level)),
        sc.prepares ? el("td", {}, el("input", { type: "number", min: 0, max: 20, id: fieldId(`spell-${i}-prep`), value: sp.prepared, aria: { label: `${sp.name || "Spell"} times prepared` },
          on: { change: (e) => ctx.edit(`spells.${id}`, (ch) => { ch.spells[i].prepared = Math.max(0, toInt(e.target.value)); }) } })) : null,
        el("td", {}, el("button", { type: "button", className: "btn small", aria: { label: `Remove ${sp.name || "spell"}` }, on: { click: () => ctx.edit(`spells.${id}`, (ch) => { ch.spells.splice(i, 1); }) } }, "×")));
    });
    // The picker: a level, then a spell from that level of the class list (and a cleric's domain spells).
    const levels = sc.levels.map((lv, L) => (lv ? L : null)).filter((L) => L !== null);
    const pickL = Math.min(Math.max(pickLevel[id] ?? levels[0] ?? 0, levels[0] ?? 0), levels[levels.length - 1] ?? 0);
    const options = [
      ...((list?.[pickL]) || []).filter((x) => !(x.school && prohibited.includes(x.school))).map((x) => ({ value: `list:${x.name}`, label: `${x.name}${x.school ? ` (${x.school})` : ""}` })),
      ...domainSpells.filter((x) => x.level === pickL).map((x) => ({ value: `domain:${x.name}`, label: `${x.name} (${x.domain} domain)` })),
    ];
    const picker = el("div", { className: "row spell-pick" },
      select({ id: fieldId(`pick-${id}-level`), aria: { label: `${sc.cls.name} spell level to pick from` }, on: { change: (e) => { pickLevel[id] = toInt(e.target.value); ctx.refresh(); } } },
        levels.map((L) => ({ value: String(L), label: `Level ${L}` })), String(pickL)),
      select({ id: fieldId(`pick-${id}-spell`), aria: { label: `Add a ${sc.cls.name.toLowerCase()} spell` }, on: { change: (e) => {
        const v = e.target.value; if (!v) return;
        const [kind, ...rest] = v.split(":"); const name = rest.join(":");
        ctx.edit(`spells.${id}`, (ch) => { ch.spells.push({ classId: id, name, level: pickL, prepared: sc.prepares ? 1 : 0, domain: kind === "domain" }); });
      } } }, options, "", `+ Add a level ${pickL} spell…`),
      el("button", { type: "button", className: "btn small", on: { click: () => ctx.edit(`spells.${id}`, (ch) => { ch.spells.push({ classId: id, name: "", level: pickL, prepared: sc.prepares ? 1 : 0, domain: false }); }) } }, "+ Type one in"));
    return card(`${sc.cls.name} spells`,
      el("div", { className: "stats" },
        el("div", { className: "stat" }, el("span", { className: "lbl" }, "Ability"), el("span", { className: "big" }, sc.ability.toUpperCase()), el("span", { className: "cite" }, sc.mod === null ? dash : signed(sc.mod))),
        el("div", { className: "stat" }, el("span", { className: "lbl" }, "Caster level"), el("span", { className: "big" }, String(sc.casterLevel))),
        el("div", { className: "stat key" }, el("span", { className: "lbl" }, "Save DC"), el("span", { className: "big" }, sc.mod === null ? dash : `${10 + sc.mod} + level`), el("span", { className: "cite" }, "10 + spell level + mod"))),
      el("div", { className: "tablewrap" }, el("table", {},
        el("thead", {}, el("tr", {}, ["Level", "Per day", "From", sc.prepares ? "" : "Known", "DC", "Today", ""].map((h) => el("th", {}, h)))),
        el("tbody", {}, rows))),
      sc.kind === "arcane" && sc.failure ? el("p", { className: "cite" }, `Arcane spell failure ${sc.failure}%`) : null,
      sc.notes.map((n) => el("p", { className: "cite note" }, n)),
      el("h3", { className: "sub-h" }, sc.prepares ? "Spells prepared" : "Spells known"),
      el("div", { className: "tablewrap" }, el("table", {}, el("thead", {}, el("tr", {}, ["Spell", "Level", sc.prepares ? "Prepared" : null, ""].filter((h) => h !== null).map((h) => el("th", {}, h)))), el("tbody", {}, spellRows))),
      picker,
      fieldMessage(ctx, `spells.${id}`));
  });
}

// ---------- languages ----------

export function languagesCard(ctx) {
  const { c, d } = ctx;
  const pool = LANGUAGES.filter((l) => !d.autoLanguages.includes(l) && (!SECRET_LANGUAGES.includes(l) || d.classLevels.druid));
  const listed = d.bonusLanguagePool === "any" ? null : d.bonusLanguagePool;
  const allowed = d.bonusLanguageCount + d.speakLanguageRanks;
  return card("Languages",
    el("p", {}, el("span", { className: "lbl" }, "Automatic: "), d.autoLanguages.join(", ")),
    allowed === 0 && !c.languages.length
      ? el("p", { className: "cite" }, "No extra languages yet: an Intelligence bonus at 1st level, or ranks in Speak Language, would add some.")
      : pickList(ctx, { key: "languages", legend: `Extra languages: ${allowed} (Intelligence bonus at 1st level ${d.bonusLanguageCount}, Speak Language ranks ${d.speakLanguageRanks})`, max: allowed, list: c.languages,
      toggle: (ch, v, on) => { ch.languages = toggleIn(ch.languages, v, on); },
      options: pool.map((l) => ({ value: l, label: l, hint: listed && !listed.includes(l) ? "Speak Language only" : "" })) }),
    el("p", { className: "cite note" }, "Races, Race and Languages; Skills II, Speak Language (each rank is one new language)."));
}

// ---------- equipment ----------

export function equipment(ctx) {
  const { c, d } = ctx;
  const rows = c.inventory.map((it, i) => el("tr", {},
    el("td", {}, el("input", { type: "text", id: fieldId(`inv-${i}-name`), value: it.name, aria: { label: "Item" }, on: { input: (e) => ctx.editText((ch) => { ch.inventory[i].name = e.target.value.slice(0, 120); }) } })),
    el("td", {}, el("input", { type: "number", id: fieldId(`inv-${i}-qty`), min: 0, value: it.qty, aria: { label: `${it.name || "Item"} quantity` }, on: { change: (e) => ctx.edit("inventory", (ch) => { ch.inventory[i].qty = Math.max(0, toInt(e.target.value, 1)); }) } })),
    el("td", {}, el("input", { type: "number", id: fieldId(`inv-${i}-wt`), min: 0, step: "0.5", value: it.weight, aria: { label: `${it.name || "Item"} weight each (lb)` }, on: { change: (e) => ctx.edit("inventory", (ch) => { const v = Number.parseFloat(e.target.value); ch.inventory[i].weight = Number.isFinite(v) && v >= 0 ? v : 0; }) } })),
    el("td", {}, el("button", { type: "button", className: "btn small", aria: { label: `Remove ${it.name || "item"}` }, on: { click: () => ctx.edit("inventory", (ch) => { ch.inventory.splice(i, 1); }) } }, "×"))));
  const coin = (k) => el("div", { className: "cell" }, el("label", { htmlFor: fieldId(`coin-${k}`) }, k.toUpperCase()),
    el("input", { type: "number", id: fieldId(`coin-${k}`), min: 0, value: c.coins[k], on: { change: (e) => ctx.edit("coins", (ch) => { ch.coins[k] = Math.max(0, toInt(e.target.value)); }) } }));
  const { carried, load } = d;
  return card("Equipment",
    el("div", { className: "tablewrap" }, el("table", {}, el("thead", {}, el("tr", {}, ["Item", "Qty", "Lb each", ""].map((h) => el("th", {}, h)))), el("tbody", {}, rows))),
    el("button", { type: "button", className: "btn small add", on: { click: () => ctx.edit("inventory", (ch) => { ch.inventory.push({ name: "", qty: 1, weight: 0 }); }) } }, "+ Add item"),
    el("div", { className: "coins" }, ["cp", "sp", "gp", "pp"].map(coin)),
    d.carrying ? el("p", { className: load === "light" ? "cite" : "todo" }, `Carrying ${carried} lb: ${load === "overloaded" ? "over the heavy limit" : `${load} load`} (light ≤ ${d.carrying[0]}, medium ≤ ${d.carrying[1]}, heavy ≤ ${d.carrying[2]} lb)`) : null,
    d.carrying ? el("p", { className: "cite note" }, "Armor, shield and weapons count. A medium or heavy load caps Dex to AC, adds a check penalty and lowers speed, like armor; the sheet applies it (Carrying and Exploration, Tables: Carrying Capacity and Carrying Loads).") : null);
}

// ---------- notes ----------

export function notes(ctx) {
  const { c } = ctx;
  const area = (key, label, rows) => el("div", { className: "cell" }, el("label", { htmlFor: fieldId(`notes-${key}`) }, label),
    el("textarea", { id: fieldId(`notes-${key}`), rows, value: c.notes[key], on: { input: (e) => ctx.editText((ch) => { ch.notes[key] = e.target.value.slice(0, 20000); }) } }));
  return card("Appearance, backstory & notes", area("appearance", "Appearance", 3), area("backstory", "Backstory", 4), area("notes", "Notes", 4));
}

// ---------- in play: rage, inspire courage, favored enemy ----------

export function inPlay(ctx) {
  const { c, d } = ctx;
  const parts = [];
  if (d.classLevels.barbarian) {
    parts.push(el("label", { className: "switch", htmlFor: "f-rage" }, el("input", { type: "checkbox", id: "f-rage", checked: c.active.rage,
      on: { change: (e) => ctx.edit("active.rage", (ch) => { ch.active.rage = e.target.checked; }) } }), "Raging"), fieldMessage(ctx, "active.rage"));
  }
  parts.push(labelled(ctx, "active.courage", "Inspire courage heard", select({ id: fieldId("active.courage"), on: { change: (e) => ctx.edit("active.courage", (ch) => { ch.active.courage = toInt(e.target.value); }) } },
    [1, 2, 3, 4].map((n) => ({ value: String(n), label: `+${n} (bard level ${[1, 8, 14, 20][n - 1]}+)` })), c.active.courage ? String(c.active.courage) : "", "Not now")));
  if (d.favoredEnemies.length) {
    parts.push(labelled(ctx, "active.favoredEnemy", "Fighting a favored enemy", select({ id: fieldId("active.favoredEnemy"), on: { change: (e) => ctx.edit("active.favoredEnemy", (ch) => { ch.active.favoredEnemy = e.target.value; }) } },
      d.favoredEnemies.map((f) => ({ value: f.id, label: `${f.name} (+${f.bonus})` })), c.active.favoredEnemy, "No")));
  }
  return card("In play",
    el("p", { className: "cite note" }, "Switch these on while they apply; the numbers on the sheet change with them."),
    el("div", { className: "row" }, parts),
    d.fighting ? el("p", { className: "todo" }, `Against ${d.fighting.name}: +${d.fighting.bonus} on Bluff, Listen, Sense Motive, Spot and Survival checks and on weapon damage rolls (Classes II, Ranger, Favored Enemy).`) : null,
    d.rage ? el("p", { className: "cite note" }, "While raging: no Charisma-, Dexterity- or Intelligence-based skills except Balance, Escape Artist, Intimidate and Ride; no Concentration, spells or command-word items (Classes I, Barbarian, Rage).") : null);
}

// ---------- class abilities worked out as numbers ----------

export function classAbilitiesCard(ctx) {
  const { d } = ctx;
  if (!d.abilities.length && !d.favoredEnemies.length) return null;
  return card("Class abilities",
    el("ul", { className: "list" },
      d.abilities.map((a) => el("li", {}, el("span", { className: "why" }, a.name), a.value, el("span", { className: "a note" }, a.cite))),
      d.favoredEnemies.length ? el("li", {}, el("span", { className: "why" }, "Favored enemies"), d.favoredEnemies.map((f) => `${f.name} +${f.bonus}`).join(", "),
        el("span", { className: "a note" }, "Classes II, Ranger")) : null));
}

// ---------- cleric domains ----------

export function domainsCard(ctx) {
  const { d } = ctx;
  if (!d.domains.length) return null;
  return card("Domains", d.domainLines.map(({ domain: dm, line }) => el("details", { className: "domain" },
    el("summary", {}, el("strong", {}, `${dm.name} domain`), line ? el("span", { className: "cite" }, ` · ${line}`) : null),
    el("p", {}, dm.power),
    el("p", { className: "cite" }, `Domain spells: ${dm.spells.map((x) => `${x.level} ${x.name}`).join(" · ")}`),
    dm.notes.length ? el("p", { className: "cite" }, dm.notes.join(" ")) : null,
    el("p", { className: "cite note" }, dm.cite))));
}
