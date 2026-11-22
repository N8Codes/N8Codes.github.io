// "Export .txt": a plain-text printout of the 3.5 character, ending with the Open Game License (Section 10).

import { ABILITIES, SKILLS } from "./data/rules.js";
import { weaponById } from "./data/equipment.js";
import { classById } from "./data/classes.js";
import { LICENSE } from "./license.js";

const sgn = (n) => (n >= 0 ? `+${n}` : `-${Math.abs(n)}`);
const RULE = "-".repeat(68);
const half = (n) => (Number.isInteger(n) ? String(n) : `${Math.floor(n)}.5`);

/** Wrap a long line at word boundaries, indenting continuation lines. */
function wrap(text, width = 68, indent = "") {
  const lead = String(text).match(/^\s*/)[0]; // keep the line's own indent
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).length > width && line.trim()) { lines.push(line); line = indent + w; } else line = line ? `${line} ${w}` : lead + w;
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

/** A feat's chosen weapon, skill or school by name. */
function detailName(c, kind, value) {
  if (kind === "weapon") return weaponById(value)?.name ?? value;
  if (kind === "skill") { const s = SKILLS.find((x) => x.id === value); return s ? (s.sub && c.skillNames[s.id] ? `${s.name} (${c.skillNames[s.id]})` : s.name) : value; }
  if (kind === "school") return value.charAt(0).toUpperCase() + value.slice(1);
  return value;
}

export function toText(c, d) {
  const out = [];
  const push = (...lines) => out.push(...lines);
  const k = (v) => (d.scoresKnown ? v : "-");
  push((c.name || "Unnamed character").toUpperCase());
  const classes = Object.entries(d.classLevels).map(([id, n]) => `${classById(id).name} ${n}`).join(" / ");
  push([d.race?.name, classes || `Level ${d.level}`, c.alignment, c.deity ? `Deity: ${c.deity}` : "", `XP ${c.xp}`].filter(Boolean).join(" · "));
  if (c.player) push(`Player: ${c.player}`);
  if (c.freeEdit) push("Free edit was on: some numbers may break the rules on purpose.");
  push(RULE);
  push(d.scoresKnown ? ABILITIES.map((a) => `${a.short} ${d.scores[a.id]} (${sgn(d.mod[a.id])})`).join("  ") : "Ability scores: not entered yet");
  push(`HP ${d.hpKnown ? `${d.hpCurrent}/${d.hpMax}` : "-"}${c.hp.temp ? ` (temp ${c.hp.temp})` : ""}${c.hp.nonlethal ? ` (nonlethal ${c.hp.nonlethal})` : ""} · AC ${k(d.ac)} (touch ${k(d.touch)}, flat-footed ${k(d.flatFooted)})`);
  push(`Initiative ${k(sgn(d.initiative))} · Base attack ${d.attackSeq.map(sgn).join("/")} · Grapple ${k(sgn(d.grapple))} · Speed ${d.speed} ft · ${d.size}`);
  push(`Saves: Fort ${k(sgn(d.saves.fort.total))}, Ref ${k(sgn(d.saves.ref.total))}, Will ${k(sgn(d.saves.will.total))}`);
  push(RULE, "ATTACKS");
  push(`  Unarmed strike ${k(d.unarmed.attacks.map(sgn).join("/"))}, ${k(d.unarmed.damage)}${d.unarmed.nonlethal ? " nonlethal" : ""}`);
  for (const a of d.attacks) {
    if (a.custom) push(`  ${a.name || "(attack)"} ${a.bonus}, ${a.damage}${a.notes ? ` · ${a.notes}` : ""}`);
    else push(`  ${a.name} ${k(a.attacks.map(sgn).join("/"))}, ${k(a.damage)}, ${a.critical}${a.notes.length ? ` · ${a.notes.join(", ")}` : ""}`);
  }
  if (d.flurry) push(`  Flurry of blows ${d.flurry}`);
  if (d.sneakAttack) push(`  Sneak attack ${d.sneakAttack}`);
  push(RULE, "SKILLS (ranks)");
  const sk = SKILLS.filter((s) => d.ranks[s.id] > 0).map((s) => `${s.sub ? `${s.name} (${c.skillNames[s.id] || "?"})` : s.name} ${k(sgn(d.skills[s.id].total))} (${half(d.ranks[s.id])})`);
  push(wrap("  " + (sk.length ? sk.join(", ") : "none"), 68, "  "));
  push(RULE, "FEATS");
  push(wrap("  " + (d.feats.map((f) => `${f.feat.name}${f.detail ? ` (${detailName(c, f.feat.detail, f.detail)})` : ""}`).join(", ") || "none"), 68, "  "));
  push(RULE, "CLASS FEATURES");
  for (const f of d.features) push(`  ${f.cls.name} ${f.level}: ${f.name}`);
  for (const ch of d.choices) { const v = c.choices[ch.key] || []; if (v.length) push(wrap(`  ${ch.label || ch.id}: ${v.map((x) => (ch.options || []).find((o) => o.id === x)?.name ?? x).join(", ")}`, 68, "    ")); }
  for (const r of d.resources) push(`  ${r.name}: ${r.max - Math.min(r.used, r.max)}/${r.max} left (per ${r.per})`);
  for (const a of d.abilities) push(wrap(`  ${a.name}: ${a.value}`, 68, "    "));
  if (d.favoredEnemies.length) push(wrap(`  Favored enemies: ${d.favoredEnemies.map((f) => `${f.name} +${f.bonus}`).join(", ")}`, 68, "    "));
  for (const { domain: dm, line } of d.domainLines) push(wrap(`  ${dm.name} domain: ${dm.power}${line ? ` ${line}` : ""}`, 68, "    "));
  const inPlay = [d.rage ? "raging" : "", d.courage ? `inspire courage +${d.courage}` : "", d.fighting ? `fighting ${d.fighting.name} (+${d.fighting.bonus})` : "", d.load !== "light" ? `${d.load} load` : ""].filter(Boolean);
  if (inPlay.length) push(`  In play: ${inPlay.join(", ")} (already in the numbers above)`);
  if (d.race) push(wrap(`  ${d.race.name}: ${d.race.traits.join("; ") || "no special traits"}`, 68, "    "));
  for (const sc of d.casting) {
    push(RULE, `${sc.cls.name.toUpperCase()} SPELLS (caster level ${sc.casterLevel}, ${sc.ability.toUpperCase()})`);
    push(wrap("  Per day: " + sc.levels.map((lv, L) => (lv ? `${L}: ${lv.total}${lv.known !== null ? ` (known ${lv.known})` : ""}` : "")).filter(Boolean).join(", "), 68, "    "));
    const spells = c.spells.filter((s) => s.classId === sc.cls.id && s.name);
    if (spells.length) push(wrap("  Spells: " + spells.map((s) => `${s.name} (${s.level}${s.prepared ? `, x${s.prepared}` : ""}${s.domain ? ", domain" : ""})`).join(", "), 68, "    "));
    if (sc.kind === "arcane" && sc.failure) push(`  Arcane spell failure ${sc.failure}%`);
  }
  push(RULE, "LANGUAGES");
  push(wrap("  " + [...d.autoLanguages, ...c.languages].join(", "), 68, "  "));
  push(RULE, "EQUIPMENT");
  if (d.armor || d.shield) push(`  Wearing: ${[d.armor?.name, d.shield?.name].filter(Boolean).join(" and ")}`);
  for (const it of c.inventory) if (it.name) push(`  ${it.qty} x ${it.name}${it.weight ? ` (${it.weight} lb each)` : ""}`);
  push(`  Coins: ${["cp", "sp", "gp", "pp"].map((x) => `${c.coins[x]} ${x.toUpperCase()}`).join(", ")}`);
  for (const [label, key] of [["APPEARANCE", "appearance"], ["BACKSTORY", "backstory"], ["NOTES", "notes"]]) {
    if (c.notes[key]) push(RULE, label, ...c.notes[key].split(/\r?\n/).map((l) => wrap(l)));
  }
  push(RULE, wrap(LICENSE.attribution), "",
    wrap("Made with the free character sheets at n8codes.github.io. An independent, fan-made tool. Not an official product."), "",
    ...LICENSE.fileNotice.split("\n").map((l) => wrap(l)));
  return out.join("\n") + "\n";
}
