// The two views of one 5E character: the whole sheet (default) and the guided steps.
// Both read and edit the same character, so switching never loses anything.
// Guided explanations are written in our own words; rules are cited by SRD 5.2.1 page.

import { el, card, signed, fieldMessage } from "../../core/ui.js";
import { ABILITY_IDS, ALIGNMENTS, SKILLS } from "./data/rules.js";
import { CLASSES } from "./data/classes.js";
import { SPECIES } from "./data/species.js";
import { BACKGROUNDS } from "./data/backgrounds.js";
import { featById } from "./data/feats.js";
import { abilityName } from "./derive.js";
import * as C from "./components.js";

// ===================== Whole sheet =====================

export function renderSheet(ctx) {
  const { d } = ctx;
  return el("div", { className: "full" },
    el("section", { className: "card" }, C.identity(ctx)),
    el("div", { className: "sheet" },
      el("div", { className: "col" },
        card("Abilities, saves & skills",
          C.abilityMethod(ctx),
          el("div", { className: "ab-sk" },
            el("div", { className: "ab-col" }, ABILITY_IDS.map((a) => C.abilityBlock(ctx, a))),
            el("div", { className: "sk-col" }, C.savesAndSkills(ctx, { interactive: true })))),
        card("Background increase", C.backgroundIncrease(ctx))),
      el("div", { className: "col" },
        C.combat(ctx),
        C.attacks(ctx),
        C.resources(ctx),
        C.spellcasting(ctx)),
      el("div", { className: "col" },
        C.featuresCard(ctx),
        C.traitsCard(ctx),
        card("Choices", choicesSummary(ctx)),
        d.slots.length ? card("Feats", C.featsFor(ctx)) : null,
        C.proficienciesCard(ctx),
        card("Languages", C.languagesEditor(ctx)))),
    el("div", { className: "pages2" },
      C.equipment(ctx),
      el("div", { className: "col" }, (C.hpMethod(ctx) ? card("Hit Points by level", C.hpMethod(ctx)) : null), C.notes(ctx))));
}

function choicesSummary(ctx) {
  // Skill proficiencies are ticked in the skill list itself; everything else is chosen here.
  const editors = C.choicesFor(ctx, ["class", "subclass", "species", "background"], { skipKinds: ["skill-proficiency"] });
  return editors ?? el("p", { className: "empty" }, "\u2014");
}

// ===================== Guided =====================

export const STEPS = [
  { id: "class", title: "Class" },
  { id: "background", title: "Background" },
  { id: "species", title: "Species" },
  { id: "languages", title: "Languages" },
  { id: "abilities", title: "Ability scores" },
  { id: "alignment", title: "Alignment" },
  { id: "choices", title: "Class choices & skills" },
  { id: "equipment", title: "Equipment" },
  { id: "details", title: "Details" },
  { id: "review", title: "Review" },
];

/** Which step a problem belongs to, so Review can send the player back to it. */
function stepFor(field) {
  if (/^(classId|subclassId|level|xp)$/.test(field)) return 0;
  if (/^(backgroundId|choice:background|feat:background)/.test(field)) return 1;
  if (/^(speciesId|size|choice:species|feat:species)/.test(field)) return 2;
  if (field === "languages") return 3;
  if (/^(abilities|backgroundBonus)/.test(field)) return 4;
  if (field === "alignment") return 5;
  if (/^(choice:class|choice:subclass|feat:|expertise)/.test(field)) return 6;
  if (/^(equipment|inventory|armorId|attacks)/.test(field)) return 7;
  return 8;
}

export function renderGuided(ctx) {
  const step = Math.min(Math.max(ctx.step, 0), STEPS.length - 1);
  const stepProblems = (n) => ctx.all.filter((p) => stepFor(p.field) === n);
  const nav = el("nav", { className: "card", aria: { label: "Steps" } },
    el("h2", {}, "Steps"),
    el("ol", { className: "steps" }, STEPS.map((s, i) => {
      const probs = stepProblems(i);
      const done = i < STEPS.length - 1 && probs.length === 0 && isTouched(ctx, s.id);
      return el("li", { className: done ? "done" : "" }, el("button", { type: "button", className: "step-btn", aria: { current: i === step ? "step" : undefined },
        on: { click: () => ctx.setStep(i) } }, s.title, el("small", {}, stepHint(ctx, s.id))));
    })),
    el("p", { className: "cite" }, "In the SRD's order: class, origin, ability scores, alignment, details (p.19)."));
  const body = PANELS[STEPS[step].id](ctx);
  const probs = stepProblems(step).filter(() => step !== STEPS.length - 1);
  const panel = el("div", { className: "card step-panel" },
    el("h2", {}, `Step ${step + 1} of ${STEPS.length}`),
    el("h3", { className: "step-title" }, STEPS[step].title),
    body,
    probs.length ? el("div", { className: "step-check" }, el("h3", {}, "Still to do on this step"),
      el("ul", {}, probs.map((p) => el("li", { className: p.severity === "error" ? "msg" : "todo" }, p.message)))) : null,
    el("div", { className: "nav-steps" },
      step > 0 ? el("button", { type: "button", className: "btn", on: { click: () => ctx.setStep(step - 1) } }, `← ${STEPS[step - 1].title}`) : el("span"),
      el("span", { className: "cite" }, "You can go to any step. Review checks every step again."),
      step < STEPS.length - 1 ? el("button", { type: "button", className: "btn primary", on: { click: () => ctx.setStep(step + 1) } }, `Next: ${STEPS[step + 1].title} →`) : el("span")));
  return el("div", { className: "guided" }, nav, panel, summary(ctx));
}

function isTouched(ctx, id) {
  const { c } = ctx;
  return ({ class: c.classId, background: c.backgroundId, species: c.speciesId, languages: c.languages.length, abilities: c.backgroundId,
    alignment: c.alignment, choices: c.classId, equipment: c.equipment.classOption || c.inventory.length, details: c.name })[id];
}

function stepHint(ctx, id) {
  const { c, d } = ctx;
  return ({ class: d.cls ? `${d.cls.name} ${c.level}` : "", background: d.bg?.name ?? "", species: d.sp?.name ?? "",
    languages: `${c.languages.length} of 2`, alignment: c.alignment, details: c.name })[id] ?? "";
}

function summary(ctx) {
  const { c, d } = ctx;
  const errors = ctx.all.filter((p) => p.severity === "error").length;
  const todos = ctx.all.filter((p) => p.severity === "todo").length;
  const row = (k, v) => [el("dt", {}, k), el("dd", {}, v || "—")];
  return el("aside", { className: "card summary", aria: { label: "Character so far" } },
    el("h2", {}, "Character so far"),
    el("dl", {},
      row("Class", d.cls ? `${d.cls.name} ${c.level}${d.sub ? ` (${d.sub.name})` : ""}` : ""),
      row("Background", d.bg?.name), row("Species", d.sp ? `${d.sp.name}${d.size ? ` (${d.size})` : ""}` : ""),
      row("Languages", d.languages.join(", ")),
      row("Scores", d.scoresKnown ? ABILITY_IDS.map((a) => `${a.toUpperCase()} ${d.scores[a]}`).join(" · ") : ""),
      row("Hit points", d.cls && d.scoresKnown ? String(d.hpMax) : ""), row("Armor Class", d.scoresKnown ? String(d.ac) : ""), row("Proficiency", signed(d.pb)), row("Speed", d.sp ? `${d.speed} ft` : "")),
    el("p", { className: errors ? "msg" : "cite" }, errors ? `${errors} rule ${errors === 1 ? "problem" : "problems"} to fix.` : todos ? `${todos} choices still to make.` : "Everything is chosen and follows the rules."),
    el("p", { className: "cite" }, "This panel uses the same calculations as the whole sheet."));
}

// ---------- step panels ----------

const PANELS = {
  class(ctx) {
    const { c, d } = ctx;
    return el("div", {},
      C.explain("Your class is your character's trade as an adventurer: how they fight, what they're trained in, and which ability they lean on most. It's the biggest single choice, so it comes first.", "SRD 5.2.1 p.19, Step 1 and Class Overview."),
      el("div", { className: "choices", role: "group", aria: { label: "Class" } }, CLASSES.map((x) => el("button", { type: "button", className: "choice", aria: { pressed: String(c.classId === x.id) },
        on: { click: () => ctx.edit("classId", (ch) => C.setClass(ch, x.id)) } },
      el("b", {}, x.name), el("span", {}, `${x.primaryAbilities.map(abilityName).join(x.primaryJoin === "and" ? " and " : " or ")} · ${x.complexity}`)))),
      el("p", { className: "cite" }, "Each card shows the class's primary ability and how complex it is to play (Class Overview, p.19)."),
      fieldMessage(ctx, "classId"),
      d.cls ? el("div", { className: "traits-box" },
        el("h3", {}, `${d.cls.name} at a glance`),
        el("ul", { className: "list" },
          el("li", {}, el("span", { className: "why" }, "Hit Point Die"), `d${d.cls.hitDie} per level`),
          el("li", {}, el("span", { className: "why" }, "Saving throws"), d.cls.savingThrows.map(abilityName).join(" and ")),
          el("li", {}, el("span", { className: "why" }, "Skills"), `Choose ${d.cls.skillChoices.count}`),
          el("li", {}, el("span", { className: "why" }, "Weapons"), d.cls.weaponsText),
          el("li", {}, el("span", { className: "why" }, "Armor"), d.cls.armor.length ? d.cls.armor.map((k) => (k === "shield" ? "Shields" : k)).join(", ") : "None"),
          d.cls.spellcasting ? el("li", {}, el("span", { className: "why" }, "Spellcasting"), abilityName(d.cls.spellcasting.ability)) : null),
        el("p", { className: "cite" }, `Core ${d.cls.name} Traits, ${d.cls.cite}.`)) : null,
      el("div", { className: "row" },
        el("div", { className: "cell" }, el("label", { htmlFor: "f-level" }, "Starting level"),
          el("input", { type: "number", id: "f-level", min: 1, max: 20, value: c.level, aria: { describedby: "f-level-msg" },
            on: { change: (e) => ctx.edit("level", (ch) => { const n = Number.parseInt(e.target.value, 10); if (Number.isFinite(n)) ch.level = n; }) } }), fieldMessage(ctx, "level")),
        C.subclassSelect(ctx)),
      el("p", { className: "cite" }, "Characters usually start at level 1. Your GM might start you higher; at level 3 or higher you also pick a subclass (p.19, p.24)."));
  },

  background(ctx) {
    const { c, d } = ctx;
    return el("div", {},
      C.explain("Your background is where your character spent the years before adventuring. It decides which three abilities you can raise, gives you an Origin feat, two skills and a tool, and a starting equipment package.", "SRD 5.2.1 p.19–20 and p.83."),
      el("div", { className: "choices", role: "group", aria: { label: "Background" } }, BACKGROUNDS.map((b) => el("button", { type: "button", className: "choice", aria: { pressed: String(c.backgroundId === b.id) },
        on: { click: () => ctx.edit("backgroundId", (ch) => C.setBackground(ch, b.id)) } },
      el("b", {}, b.name), el("span", {}, b.abilities.map(abilityName).join(", "))))),
      fieldMessage(ctx, "backgroundId"),
      d.bg ? el("div", { className: "traits-box" },
        el("h3", {}, d.bg.name),
        el("ul", { className: "list" },
          el("li", {}, el("span", { className: "why" }, "Abilities"), d.bg.abilities.map(abilityName).join(", ")),
          el("li", {}, el("span", { className: "why" }, "Feat"), `${featById(d.bg.feat.id).name}${d.bg.feat.variant ? ` (${d.bg.feat.variant})` : ""}`),
          el("li", {}, el("span", { className: "why" }, "Skills"), d.bg.skills.map((s) => SKILLS.find((x) => x.id === s)?.name ?? s).join(" and ")),
          el("li", {}, el("span", { className: "why" }, "Tool"), d.bg.tool.fixed ?? "One kind of Gaming Set"))) : null,
      C.choicesFor(ctx, ["background"]),
      ...C.featsFor(ctx, (s) => s.key === "background"));
  },

  species(ctx) {
    const { c, d } = ctx;
    return el("div", {},
      C.explain("Your species is the kind of being your character is. It sets your size and Speed and gives special traits; some species also ask you to pick a lineage or ancestry.", "SRD 5.2.1 p.20 and p.83–86."),
      el("div", { className: "choices", role: "group", aria: { label: "Species" } }, SPECIES.map((s) => el("button", { type: "button", className: "choice", aria: { pressed: String(c.speciesId === s.id) },
        on: { click: () => ctx.edit("speciesId", (ch) => C.setSpecies(ch, s.id)) } },
      el("b", {}, s.name), el("span", {}, `${s.sizes.join(" or ")} · Speed ${s.speed} ft`)))),
      fieldMessage(ctx, "speciesId"),
      d.sp ? el("div", { className: "traits-box" }, el("h3", {}, `${d.sp.name} traits`), el("p", {}, d.sp.traits.join(" · ")), el("p", { className: "cite" }, `${d.sp.cite}.`)) : null,
      d.sp && d.sp.sizes.length > 1 ? el("div", { className: "row" }, C.sizeSelect(ctx)) : null,
      C.choicesFor(ctx, ["species"]),
      ...C.featsFor(ctx, (s) => s.key.startsWith("species:")));
  },

  languages(ctx) {
    return el("div", {},
      C.explain("Every character knows Common. Pick two more from the Standard Languages table, or roll a d12 for each. Your class or other features may add more later.", "SRD 5.2.1 p.20, Choose Languages."),
      C.languagesEditor(ctx));
  },

  abilities(ctx) {
    const { d } = ctx;
    const tip = d.cls ? `A ${d.cls.name} relies on ${d.cls.primaryAbilities.map(abilityName).join(d.cls.primaryJoin === "and" ? " and " : " or ")}, so put your highest score there.` : "";
    return el("div", {},
      C.explain(`Six scores say what your character is naturally good at. First make six numbers, then place them on the abilities, then add your background's increase. ${tip}`, "SRD 5.2.1 p.20–21, Step 3."),
      C.abilityMethod(ctx),
      el("div", { className: "pb" }, ABILITY_IDS.map((a) => el("div", { className: "pbox" },
        el("span", { className: "name" }, abilityName(a).toUpperCase()),
        C.baseControl(ctx, a),
        d.scoresKnown ? el("span", { className: "cite" }, `score ${d.scores[a]} · modifier ${signed(d.mod[a])}`) : null,
        fieldMessage(ctx, `abilities.${a}`)))),
      el("h3", { className: "sub-h" }, d.bg ? `Background increase: ${d.bg.name}` : "Background increase"),
      C.backgroundIncrease(ctx));
  },

  alignment(ctx) {
    const { c } = ctx;
    return el("div", {},
      C.explain("Alignment is a quick way to describe your character's outlook: how they treat others (good, neutral, evil) and how they feel about rules and order (lawful, neutral, chaotic). The game assumes heroes aren't evil, so check with your GM before playing an evil character.", "SRD 5.2.1 p.21–22, Step 4."),
      el("div", { className: "choices", role: "group", aria: { label: "Alignment" } }, ALIGNMENTS.map((a) => el("button", { type: "button", className: "choice", aria: { pressed: String(c.alignment === a) },
        on: { click: () => ctx.edit("alignment", (ch) => { ch.alignment = a; }) } }, el("b", {}, a)))),
      fieldMessage(ctx, "alignment"));
  },

  choices(ctx) {
    const { d } = ctx;
    if (!d.cls) return el("p", { className: "todo" }, "Choose a class first (step 1).");
    return el("div", {},
      C.explain(`Your class asks you to make some choices: skills from its list, and at some levels a fighting style, Expertise or a feat. Every choice below comes from the ${d.cls.name} table and features.`, `${d.cls.name}, ${d.cls.cite}.`),
      C.choicesFor(ctx, ["class", "subclass"]) ?? el("p", { className: "cite" }, "Nothing else to choose for your class at this level."),
      ...C.featsFor(ctx, (s) => !s.fixed && !s.key.startsWith("species:")),
      el("h3", { className: "sub-h" }, "Your skills now"),
      C.savesAndSkills(ctx));
  },

  equipment(ctx) {
    return el("div", {},
      C.explain("Your class and background each offer a package of gear, or gold to spend instead. Pick one of each, then add them: your armor, Shield and weapons are set from the packages, and you can change anything afterwards on the whole sheet.", "SRD 5.2.1 p.20, Choose Starting Equipment."),
      C.startingPackages(ctx),
      el("p", { className: "cite" }, `Inventory now: ${ctx.c.inventory.length} items, ${ctx.c.coins.gp} GP.`));
  },

  details(ctx) {
    const { c } = ctx;
    return el("div", {},
      C.explain("Name your character and fill in whatever helps you play them. If you started above level 1, decide how Hit Points grow: the fixed value per level, or your own rolls.", "SRD 5.2.1 p.22–23."),
      el("div", { className: "row" },
        el("div", { className: "cell grow" }, el("label", { htmlFor: "f-g-name" }, "Character name"),
          el("input", { type: "text", id: "f-g-name", value: c.name, maxlength: 200, on: { input: (e) => ctx.editText((ch) => { ch.name = e.target.value; }) } })),
        el("div", { className: "cell grow" }, el("label", { htmlFor: "f-g-player" }, "Player"),
          el("input", { type: "text", id: "f-g-player", value: c.player, maxlength: 200, on: { input: (e) => ctx.editText((ch) => { ch.player = e.target.value; }) } }))),
      C.hpMethod(ctx),
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
