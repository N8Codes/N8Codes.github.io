// "Export .txt": a plain-text printout of the character, ending with the SRD attribution.

import { ABILITIES, SKILLS, STANDARD_LANGUAGES } from "./data/rules.js";
import { LICENSE } from "./license.js";

const sgn = (n) => (n >= 0 ? `+${n}` : `-${Math.abs(n)}`);
const RULE = "-".repeat(68);

/** Wrap a long line at word boundaries, indenting continuation lines. */
function wrap(text, width = 68, indent = "") {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > width) { lines.push(line); line = indent + w; } else line = line ? `${line} ${w}` : w;
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

export function toText(c, d) {
  const out = [];
  const push = (...lines) => out.push(...lines);
  push((c.name || "Unnamed character").toUpperCase());
  const who = [d.cls ? `${d.cls.name} ${c.level}` : `Level ${c.level}`, d.sub?.name, d.bg?.name, d.sp ? `${d.sp.name}${d.size ? ` (${d.size})` : ""}` : "", c.alignment, `XP ${c.xp}`].filter(Boolean);
  push(who.join(" · "));
  if (c.player) push(`Player: ${c.player}`);
  if (c.freeEdit) push("Free edit was on: some numbers may break the rules on purpose.");
  push(RULE);
  // Numbers built on ability scores are "-" until the scores exist.
  const k = (text) => (d.scoresKnown ? text : "-");
  push(d.scoresKnown ? ABILITIES.map((a) => `${a.short} ${d.scores[a.id]} (${sgn(d.mod[a.id])})`).join("  ") : "Ability scores: not chosen yet");
  push(`Proficiency ${sgn(d.pb)} · AC ${k(d.ac)} · Initiative ${k(sgn(d.initiative))} · Speed ${d.speed} ft · Passive Perception ${k(d.passivePerception)}`);
  push(`HP ${k(d.hpCurrent)}/${k(d.hpMax)}${c.hp.temp ? ` (temp ${c.hp.temp})` : ""} · Hit Point Dice ${d.cls ? `${c.level}d${d.hitDie}` : "-"} (${c.hitDiceSpent} spent) · Heroic Inspiration: ${c.heroicInspiration ? "yes" : "no"}`);
  push(`Death saves: ${c.deathSaves.successes} successes, ${c.deathSaves.failures} failures`);
  push(wrap("Saves: " + ABILITIES.map((a) => `${a.short.charAt(0)}${a.short.slice(1).toLowerCase()} ${k(sgn(d.saves[a.id].total))}${d.saves[a.id].proficient ? "*" : ""}`).join(", ") + "   (* proficient)", 68, "       "));
  const sk = SKILLS.filter((s) => d.skills[s.id].proficient).map((s) => `${s.name} ${k(sgn(d.skills[s.id].total))}${d.skills[s.id].expertise ? " (Expertise)" : ""}`);
  push(wrap("Skills: " + (sk.length ? sk.join(", ") : "none"), 68, "        "));
  if (d.darkvision) push(`Darkvision ${d.darkvision} ft`);
  if (d.resistances.length) push(`Resistances: ${[...new Set(d.resistances)].join(", ")}`);
  push(RULE);
  push("ATTACKS");
  push(`  ${d.unarmed.name} ${k(sgn(d.unarmed.bonus))}, ${k(d.unarmed.damage)}`);
  for (const a of d.attacks) {
    if (a.custom) push(`  ${a.name || "(attack)"} ${a.bonus}, ${a.damage}${a.notes ? ` · ${a.notes}` : ""}`);
    else push(`  ${a.name} ${k(sgn(a.bonus))}, ${k(a.damage)}${a.mastery ? ` (mastery: ${a.mastery})` : ""}${a.notes.length ? ` · ${a.notes.join(", ")}` : ""}`);
  }
  if (d.spellcasting) {
    const s = d.spellcasting;
    push(RULE, "SPELLCASTING");
    push(`  Ability ${s.ability.toUpperCase()} · Save DC ${k(s.saveDC)} · Attack ${k(sgn(s.attack))} · Cantrips ${s.cantrips} · Prepared ${s.prepared}`);
    const slots = s.slots.map((n, i) => (n ? `L${i + 1}: ${n - Math.min(c.slotsUsed[i], n)}/${n}` : "")).filter(Boolean);
    if (slots.length) push(`  Slots left ${slots.join("  ")}`);
    if (s.pact) push(`  Pact Magic slots: ${s.pact.slots - Math.min(c.pactSlotsUsed, s.pact.slots)}/${s.pact.slots} at level ${s.pact.slotLevel}`);
    const spells = c.spells.filter((x) => x.name);
    if (spells.length) push(wrap("  Spells: " + spells.map((x) => `${x.name} (${x.level === 0 ? "cantrip" : `L${x.level}`}${x.prepared ? ", prepared" : ""})`).join(", "), 68, "          "));
  }
  push(RULE, "FEATURES AND TRAITS");
  for (const f of d.features) push(`  ${f.level}: ${f.name} (${f.source})`);
  if (d.traits.length) push(wrap(`  ${d.sp.name} traits: ${d.traits.join(", ")}`, 68, "    "));
  for (const s of d.speciesDCs) push(`  ${s.name}: save DC ${k(s.dc)}, ${s.damage} damage`);
  if (d.feats.length) push(wrap("  Feats: " + d.feats.map((f) => f.feat.name).join(", "), 68, "    "));
  for (const r of d.resources) push(`  ${r.name}: ${r.max - r.used}/${r.max} left (${r.recharge})`);
  push(RULE, "PROFICIENCIES");
  push(wrap(`  Armor: ${[...d.armorTraining].join(", ") || "none"}`, 68, "    "));
  push(wrap(`  Weapons: ${d.weaponsText || "none"}`, 68, "    "));
  push(wrap(`  Tools: ${d.tools.map((t) => t.name).join(", ") || "none"}`, 68, "    "));
  push(wrap(`  Languages: ${d.languages.join(", ")}`, 68, "    "));
  push(RULE, "EQUIPMENT");
  if (d.armor) push(`  Wearing: ${d.armor.name}${c.shield ? " and a Shield" : ""}`); else if (c.shield) push("  Shield");
  for (const it of c.inventory) if (it.name) push(`  ${it.qty} × ${it.name}`);
  push(`  Coins: ${["cp", "sp", "ep", "gp", "pp"].map((k) => `${c.coins[k]} ${k.toUpperCase()}`).join(", ")}`);
  for (const [label, key] of [["APPEARANCE", "appearance"], ["BACKSTORY", "backstory"], ["NOTES", "notes"]]) {
    if (c.notes[key]) push(RULE, label, ...c.notes[key].split(/\r?\n/).map((l) => wrap(l)));
  }
  push(RULE, wrap(LICENSE.attribution), "",
    wrap("The rules here are adapted from the SRD 5.2.1: summarised and turned into calculations. Its license disclaims warranties (Section 5)."), "",
    wrap("Made with the free character sheets at n8codes.github.io. An independent, fan-made tool. Not an official product."));
  return out.join("\n") + "\n";
}

export const languageName = (id) => STANDARD_LANGUAGES.find((l) => l.id === id)?.name ?? id;
