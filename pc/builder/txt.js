// .txt build file: readable by people, loadable by the builder.
//
//   format: n8codes-pc-build
//   version: 1
//   cpu: cpu-8c-am5            <- slot: part id ("none": no graphics card or fans)
//   board: custom              <- your own part...
//   board.socket: AM5          <- ...and its fields, one per line
//
// Lines starting with # are comments. An imported file is untrusted: it is read
// line by line, only known slots, ids, fields and values are taken, and
// everything else is skipped with a note. Nothing from it reaches the page as
// markup.

import { FIELDS, SLOTS, PART_BY_ID, blankSpecs } from "./data.js";

export const FORMAT = "n8codes-pc-build";
export const VERSION = 1;
const MAX_BYTES = 64 * 1024;
const MAX_LINES = 2000;
const MAX_NOTES = 20;
const SLOT_BY_KEY = new Map(SLOTS.map(s => [s.key, s]));

const clean = s => String(s).replace(/[\u0000-\u001f\u007f]/g, " ").trim();

function formatValue(field, v) {
    if (field.type === "multi") return v.join(", ");
    if (field.type === "bool") return v ? "yes" : "no";
    return v === null || v === undefined ? "" : String(v);
}

// state: { [slotKey]: null | { id: "none" } | { id } | { id: "custom", name, specs } }
export function toTxt(state) {
    const out = [`format: ${FORMAT}`, `version: ${VERSION}`,
        "# N8Codes PC builder (n8codes.github.io/pc-builder.html).",
        "# Each line is \"slot: part\". Parts you entered yourself add \"slot.field: value\" lines.", ""];
    for (const s of SLOTS) {
        const p = state[s.key];
        if (!p) continue;
        if (p.id === "custom") {
            out.push(`${s.key}: custom`);
            if (p.name) out.push(`${s.key}.name: ${clean(p.name).slice(0, 60)}`);
            for (const f of FIELDS[s.cat]) {
                const v = p.specs[f.key];
                if (v === null || v === undefined || (typeof v === "number" && !Number.isFinite(v))) continue;
                out.push(`${s.key}.${f.key}: ${formatValue(f, v)}`);
            }
            out.push(`# ${s.label}: your own part${p.name ? ` (${clean(p.name)})` : ""}`);
        } else {
            out.push(`${s.key}: ${p.id}`);
            const part = PART_BY_ID.get(p.id);
            out.push(`# ${s.label}: ${part ? part.name : "none"}`);
        }
    }
    return out.join("\n") + "\n";
}

function parseValue(field, raw) {
    const v = clean(raw);
    switch (field.type) {
        case "select": {
            const hit = field.options.find(o => o.toLowerCase() === v.toLowerCase());
            return hit === undefined ? { bad: true } : { value: hit };
        }
        case "multi": {
            if (v === "") return { value: [] };
            const picked = [];
            for (const part of v.split(",")) {
                const hit = field.options.find(o => o.toLowerCase() === part.trim().toLowerCase());
                if (hit === undefined) return { bad: true };
                if (!picked.includes(hit)) picked.push(hit);
            }
            return { value: picked };
        }
        case "bool":
            if (/^(yes|true)$/i.test(v)) return { value: true };
            if (/^(no|false)$/i.test(v)) return { value: false };
            return { bad: true };
        case "int":
            if (!/^\d{1,6}$/.test(v)) return { bad: true };
            return { value: Number(v) };
        case "dec":
            if (!/^\d{1,3}(\.\d{1,3})?$/.test(v)) return { bad: true };
            return { value: Number(v) };
    }
    return { bad: true };
}

// Returns { ok: true, state, notes } or { ok: false, error }.
export function parseTxt(text) {
    if (typeof text !== "string") return { ok: false, error: "That isn't a text file." };
    if (text.length > MAX_BYTES) return { ok: false, error: "That file is too large to be a build list." };
    const lines = text.split(/\r\n|\n|\r/);
    if (lines.length > MAX_LINES) return { ok: false, error: "That file has too many lines to be a build list." };

    const notes = [];
    const note = msg => { if (notes.length < MAX_NOTES) notes.push(msg); };
    const ids = new Map();      // slotKey -> raw id
    const fields = new Map();   // slotKey -> Map(fieldKey -> raw value)
    let header = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith("#")) continue;
        if (line.length > 300) { note(`Line ${i + 1} skipped: too long.`); continue; }
        const m = /^([a-z0-9]{1,20})(?:\.([A-Za-z0-9]{1,20}))?\s*:\s*(.*)$/.exec(line);
        if (header < 2) {
            const want = header === 0 ? ["format", FORMAT] : ["version", null];
            if (!m || m[2] || m[1] !== want[0]) return { ok: false, error: "This isn't an N8Codes build file: it must start with \"format: n8codes-pc-build\" and \"version: 1\"." };
            if (header === 0 && clean(m[3]) !== FORMAT) return { ok: false, error: "This isn't an N8Codes build file." };
            if (header === 1) {
                const v = clean(m[3]);
                if (!/^\d{1,4}$/.test(v)) return { ok: false, error: "The file's version line isn't a number." };
                if (Number(v) > VERSION) return { ok: false, error: "This file was made by a newer version of the builder." };
                if (Number(v) < 1) return { ok: false, error: "Unknown file version." };
            }
            header++;
            continue;
        }
        if (!m) { note(`Line ${i + 1} skipped: not "slot: value".`); continue; }
        const [, slotKey, fieldKey, raw] = m;
        if (!SLOT_BY_KEY.has(slotKey)) { note(`Line ${i + 1} skipped: unknown slot.`); continue; }
        if (fieldKey) {
            if (!fields.has(slotKey)) fields.set(slotKey, new Map());
            const fm = fields.get(slotKey);
            if (fm.has(fieldKey)) { note(`Line ${i + 1} skipped: repeated field.`); continue; }
            fm.set(fieldKey, raw);
        } else {
            if (ids.has(slotKey)) { note(`Line ${i + 1} skipped: ${slotKey} was already given.`); continue; }
            ids.set(slotKey, clean(raw));
        }
    }
    if (header < 2) return { ok: false, error: "This isn't an N8Codes build file." };

    const state = Object.create(null);
    for (const s of SLOTS) {
        state[s.key] = null;
        const id = ids.get(s.key);
        const fm = fields.get(s.key);
        if (id === undefined) {
            if (fm) note(`${s.label}: details given without a part, skipped.`);
            continue;
        }
        if (id === "none" && s.noneLabel) { state[s.key] = { id: "none" }; }
        else if (id === "custom") {
            const specs = blankSpecs(s.cat);
            let name = "";
            for (const [k, raw] of fm ?? []) {
                if (k === "name") { name = clean(raw).slice(0, 60); continue; }
                const f = FIELDS[s.cat].find(x => x.key === k);
                if (!f) { note(`${s.label}: unknown detail skipped.`); continue; }
                const p = parseValue(f, raw);
                if (p.bad) { note(`${s.label}: "${f.label}" had a value the builder can't use, so it was left for you to fill in.`); continue; }
                specs[f.key] = p.value;
            }
            state[s.key] = { id: "custom", name, specs };
        } else {
            const part = PART_BY_ID.get(id);
            if (!part || part.cat !== s.cat) { note(`${s.label}: unknown part, left empty.`); continue; }
            if (fm) note(`${s.label}: details are only read for your own parts, skipped.`);
            state[s.key] = { id: part.id };
        }
    }
    return { ok: true, state, notes };
}
