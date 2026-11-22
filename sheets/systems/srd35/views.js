// Open Game Content under the Open Game License v1.0a (see license.js): the game rules in this file and the code that holds or computes them.
// The two views of one 3.5 character: the whole sheet (default) and the guided steps.
// Both read and edit the same character, so switching never loses anything.
// Guided explanations are written in our own words (still Open Game Content: they restate SRD rules); rules are cited by SRD file and section.

import { el, card, signed, fieldMessage } from "../../core/ui.js";
import { ABILITY_IDS, ALIGNMENTS } from "./data/rules.js";
import { CLASSES, classById } from "./data/classes.js";
import { RACES } from "./data/races.js";
import * as C from "./components.js";

// ===================== Whole sheet =====================

export function renderSheet(ctx) {
  return el("div", { className: "full" },
    el("section", { className: "card" }, C.identity(ctx)),
    el("div", { className: "sheet" },
      el("div", { className: "col" }, C.abilitiesCard(ctx), C.levelsCard(ctx), C.raceCard(ctx)),
      el("div", { className: "col" }, C.combat(ctx), C.inPlay(ctx), C.attacks(ctx), C.resources(ctx)),
      el("div", { className: "col" }, C.featsCard(ctx), C.classAbilitiesCard(ctx), C.featuresCard(ctx), C.domainsCard(ctx), C.languagesCard(ctx))),
    // Spell cards get a row of their own: their tables need the width.
    ctx.d.casting.length ? el("div", { className: "spell-cards" }, C.spellcasting(ctx)) : null,
    el("div", { className: "pages2" }, C.skillsCard(ctx), el("div", { className: "col" }, C.equipment(ctx), C.notes(ctx))));
}

// ===================== Guided =====================

export const STEPS = [
  { id: "race", title: "Race" },
  { id: "abilities", title: "Ability scores" },
  { id: "class", title: "Class & levels" },
  { id: "alignment", title: "Alignment" },
  { id: "skills", title: "Skills" },
  { id: "feats", title: "Feats" },
  { id: "choices", title: "Class choices" },
  { id: "spells", title: "Spells" },
  { id: "languages", title: "Languages" },
  { id: "equipment", title: "Equipment" },
  { id: "details", title: "Details" },
  { id: "review", title: "Review" },
];

/** Which step a problem belongs to, so Review can send the player back to it. */
function stepFor(field) {
  const at = (id) => STEPS.findIndex((s) => s.id === id);
  if (field === "raceId") return at("race");
  if (/^abilities|^level\.\d+\.increase/.test(field)) return at("abilities");
  if (/^level|^levels/.test(field)) return at("class");
  if (field === "alignment") return at("alignment");
  if (/^skill/.test(field)) return at("skills");
  if (/^feat:/.test(field)) return at("feats");
  if (/^choice:/.test(field)) return at("choices");
  if (/^(spells|slots)\./.test(field)) return at("spells");
  if (field === "languages") return at("languages");
  if (/^(armorId|shieldId|attacks|inventory|coins)/.test(field)) return at("equipment");
  return at("details");
}

export function renderGuided(ctx) {
  const step = Math.min(Math.max(ctx.step, 0), STEPS.length - 1);
  const stepProblems = (n) => ctx.all.filter((p) => stepFor(p.field) === n);
  const nav = el("nav", { className: "card", aria: { label: "Steps" } },
    el("h2", {}, "Steps"),
    el("ol", { className: "steps" }, STEPS.map((s, i) => {
      const done = i < STEPS.length - 1 && stepProblems(i).length === 0 && touched(ctx, s.id);
      return el("li", { className: done ? "done" : "" }, el("button", { type: "button", className: "step-btn", aria: { current: i === step ? "step" : undefined },
        on: { click: () => ctx.setStep(i) } }, s.title, el("small", {}, hint(ctx, s.id))));
    })));
  const probs = step === STEPS.length - 1 ? [] : stepProblems(step);
  const panel = el("div", { className: "card step-panel" },
    el("h2", {}, `Step ${step + 1} of ${STEPS.length}`),
    el("h3", { className: "step-title" }, STEPS[step].title),
    PANELS[STEPS[step].id](ctx),
    probs.length ? el("div", { className: "step-check" }, el("h3", {}, "Still to do on this step"),
      el("ul", {}, probs.map((p) => el("li", { className: p.severity === "error" ? "msg" : "todo" }, p.message)))) : null,
    el("div", { className: "nav-steps" },
      step > 0 ? el("button", { type: "button", className: "btn", on: { click: () => ctx.setStep(step - 1) } }, `← ${STEPS[step - 1].title}`) : el("span"),
      el("span", { className: "cite" }, "You can go to any step. Review checks every step again."),
      step < STEPS.length - 1 ? el("button", { type: "button", className: "btn primary", on: { click: () => ctx.setStep(step + 1) } }, `Next: ${STEPS[step + 1].title} →`) : el("span")));
  return el("div", { className: "guided" }, nav, panel, summary(ctx));
}

function touched(ctx, id) {
  const { c } = ctx;
  return ({ race: c.raceId, abilities: ABILITY_IDS.every((a) => c.baseScores[a] !== null), class: c.levels[0].classId, alignment: c.alignment,
    skills: c.levels.some((l) => Object.keys(l.skills).length), feats: Object.keys(c.feats).length, choices: c.levels[0].classId, spells: c.spells.length || !ctx.d.casting.length,
    languages: true, equipment: c.armorId || c.attacks.length || c.inventory.length, details: c.name })[id];
}

function hint(ctx, id) {
  const { c, d } = ctx;
  return ({ race: d.race?.name ?? "", class: Object.entries(d.classLevels).map(([k, n]) => `${classById(k).name} ${n}`).join(" / "),
    alignment: c.alignment, details: c.name })[id] ?? "";
}

function summary(ctx) {
  const { d } = ctx;
  const errors = ctx.all.filter((p) => p.severity === "error").length;
  const todos = ctx.all.filter((p) => p.severity === "todo").length;
  const row = (k, v) => [el("dt", {}, k), el("dd", {}, v || "—")];
  const k = (v) => (d.scoresKnown ? v : "");
  return el("aside", { className: "card summary", aria: { label: "Character so far" } },
    el("h2", {}, "Character so far"),
    el("dl", {},
      row("Race", d.race?.name),
      row("Classes", Object.entries(d.classLevels).map(([id, n]) => `${classById(id).name} ${n}`).join(" / ")),
      row("Scores", d.scoresKnown ? ABILITY_IDS.map((a) => `${a.toUpperCase()} ${d.scores[a]}`).join(" · ") : ""),
      row("Hit points", d.hpKnown ? String(d.hpMax) : ""),
      row("AC", k(`${d.ac} (touch ${d.touch}, flat-footed ${d.flatFooted})`)),
      row("Base attack", d.attackSeq.map(signed).join("/")),
      row("Saves", d.scoresKnown ? `Fort ${signed(d.saves.fort.total)} · Ref ${signed(d.saves.ref.total)} · Will ${signed(d.saves.will.total)}` : ""),
      row("Speed", `${d.speed} ft`)),
    el("p", { className: errors ? "msg" : "cite" }, errors ? `${errors} rule ${errors === 1 ? "problem" : "problems"} to fix.` : todos ? `${todos} choices still to make.` : "Everything is chosen and follows the rules."),
    el("p", { className: "cite" }, "This panel uses the same calculations as the whole sheet."));
}

// ---------- step panels ----------

const PANELS = {
  race(ctx) {
    const { c, d } = ctx;
    return el("div", {},
      C.explain("Your race is the people your character was born into. It adjusts ability scores, sets size and speed, and brings senses and talents. Small races hit and hide a little better but carry less.", "Races."),
      el("div", { className: "choices", role: "group", aria: { label: "Race" } }, RACES.map((r) => el("button", { type: "button", className: "choice", aria: { pressed: String(c.raceId === r.id) },
        on: { click: () => ctx.edit("raceId", (ch) => C.setRace(ch, r.id)) } },
      el("b", {}, r.name), el("span", {}, `${Object.entries(r.abilities).map(([a, n]) => `${signed(n)} ${a.toUpperCase()}`).join(", ") || "no adjustments"} · ${r.size} · ${r.speed} ft`)))),
      fieldMessage(ctx, "raceId"),
      d.race ? C.raceCard(ctx) : null);
  },

  abilities(ctx) {
    return el("div", {},
      C.explain("Six scores describe what your character is naturally good at. The rules text this sheet follows doesn't say how to make them, so use your group's method (many groups roll 4d6 and drop the lowest die) and type the numbers in. Your race's adjustments are added for you.", "Basics; Races."),
      C.abilitiesCard(ctx),
      ctx.c.levels.length >= 4 ? el("p", { className: "cite" }, "At levels 4, 8, 12, 16 and 20 you also raise one score by 1: pick it in the Levels table (next step).") : null);
  },

  class(ctx) {
    const { c, d } = ctx;
    return el("div", {},
      C.explain("Your class is your character's training: how many hit points they gain, how well they fight and save, which skills come easily, and what special abilities they get. Start with one class at level 1. If your group starts higher, add levels; each new level can be in any class (multiclassing).", "Classes I and II; Classes II, Multiclass Characters."),
      el("div", { className: "choices", role: "group", aria: { label: "First class" } }, CLASSES.map((x) => el("button", { type: "button", className: "choice", aria: { pressed: String(c.levels[0].classId === x.id) },
        on: { click: () => ctx.edit(["level.1.class", "alignment"], (ch) => { if (ch.levels[0].classId !== x.id) { ch.levels[0].classId = x.id; ch.levels[0].skills = {}; } }) } },
      el("b", {}, x.name), el("span", {}, `d${x.hitDie} · ${x.skillPoints} skill pts · ${x.alignment.text}`)))),
      fieldMessage(ctx, "level.1.class"),
      d.classes.length ? el("div", { className: "traits-box" }, d.classes.map((cls) => el("p", {}, el("strong", {}, `${cls.name}: `),
        `Hit Die d${cls.hitDie}; base attack ${cls.bab}; good saves ${Object.entries(cls.saves).filter(([, v]) => v === "good").map(([k]) => ({ fort: "Fortitude", ref: "Reflex", will: "Will" })[k]).join(" and ") || "none"}; ${cls.proficiencies.text}`))) : null,
      C.levelsCard(ctx));
  },

  alignment(ctx) {
    const { c, d } = ctx;
    const limits = d.classes.filter((x) => x.alignment.allowed).map((x) => `${x.name}: ${x.alignment.text.toLowerCase()}`);
    return el("div", {},
      C.explain("Alignment sums up your character's outlook: good or evil, and lawful or chaotic. Some classes require certain alignments.", "Description, Alignment; each class's Alignment line."),
      limits.length ? el("p", { className: "cite" }, `Your classes need: ${limits.join("; ")}.`) : null,
      el("div", { className: "choices", role: "group", aria: { label: "Alignment" } }, ALIGNMENTS.map((a) => el("button", { type: "button", className: "choice", aria: { pressed: String(c.alignment === a) },
        on: { click: () => ctx.edit("alignment", (ch) => { ch.alignment = a; }) } }, el("b", {}, a)))),
      fieldMessage(ctx, "alignment"));
  },

  skills(ctx) {
    return el("div", {},
      C.explain("Each level gives skill points to spend that level (four times as many at 1st level). A point buys a full rank in a class skill of the class you took that level, half a rank in any other. Ranks are capped by level. Points left unspent are lost.", "Skills I, Skills Summary."),
      C.skillsCard(ctx, { compact: true }));
  },

  feats(ctx) {
    return el("div", {},
      C.explain("Feats are special talents. You get one at 1st level and every third level after; Humans and some classes get more. Each feat lists prerequisites you must meet at the level you take it.", "Feats; Races, Humans."),
      C.featsCard(ctx));
  },

  choices(ctx) {
    const block = C.choicesBlock(ctx);
    return el("div", {},
      C.explain("Some classes ask for a choice: a cleric's two domains, a ranger's favored enemy and combat style, a wizard's school, a familiar or companion.", "Classes I and II."),
      block ?? el("p", { className: "cite" }, "Your classes have nothing to choose at these levels."),
      C.domainsCard(ctx), C.classAbilitiesCard(ctx));
  },

  spells(ctx) {
    const cards = C.spellcasting(ctx);
    return el("div", {},
      C.explain("Spellcasters pick spells from their class list. Clerics, druids, paladins, rangers and wizards prepare spells each day, up to their spells per day; bards and sorcerers know a fixed number and cast any of them. A high casting ability adds bonus spells, and a cleric gets one extra slot per level for a domain spell.", "Spell List I and II; Basics, Table: Ability Modifiers and Bonus Spells."),
      cards.length ? cards : el("p", { className: "cite" }, "None of your classes casts spells at these levels."));
  },

  languages(ctx) {
    return el("div", {},
      C.explain("Everyone speaks Common, and most races speak their own language too. A good Intelligence at 1st level adds languages from your race's list; ranks in Speak Language add any language.", "Races, Race and Languages."),
      C.languagesCard(ctx));
  },

  equipment(ctx) {
    return el("div", {},
      C.explain("Pick the armor and shield you wear and the weapons you carry; the sheet works out AC, attacks and armor penalties. Add other gear with its weight to see your load.", "Equipment; Carrying and Exploration."),
      C.combat(ctx), C.attacks(ctx), C.equipment(ctx));
  },

  details(ctx) {
    const { c } = ctx;
    return el("div", {},
      C.explain("Name your character and note anything that helps you play them."),
      el("div", { className: "row" },
        el("div", { className: "cell grow" }, el("label", { htmlFor: "f-g-name" }, "Character name"),
          el("input", { type: "text", id: "f-g-name", value: c.name, maxlength: 200, on: { input: (e) => ctx.editText((ch) => { ch.name = e.target.value; }) } })),
        el("div", { className: "cell grow" }, el("label", { htmlFor: "f-g-deity" }, "Deity"),
          el("input", { type: "text", id: "f-g-deity", value: c.deity, maxlength: 80, on: { input: (e) => ctx.editText((ch) => { ch.deity = e.target.value; }) } }))),
      C.notes(ctx));
  },

  review(ctx) {
    const errors = ctx.all.filter((p) => p.severity === "error");
    const todos = ctx.all.filter((p) => p.severity === "todo");
    const item = (p) => el("li", { className: p.severity === "error" ? "msg" : "todo" }, p.message, " ",
      el("button", { type: "button", className: "btn small", on: { click: () => ctx.setStep(stepFor(p.field)) } }, `Go to ${STEPS[stepFor(p.field)].title}`));
    return el("div", {},
      C.explain("This checks every step against the rules again. Anything red breaks a rule; anything else is a choice you haven't made yet."),
      errors.length ? el("div", { className: "review" }, el("h3", {}, "Rule problems"), el("ul", {}, errors.map(item))) : null,
      todos.length ? el("div", { className: "review" }, el("h3", {}, "Still to choose"), el("ul", {}, todos.map(item))) : null,
      !errors.length && !todos.length ? el("p", { className: "done-note" }, "Everything is chosen and follows the rules. Switch to Whole sheet to play, and export a file to keep it.") : null);
  },
};

export { card };
