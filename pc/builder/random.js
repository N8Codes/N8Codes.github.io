// "Random build": picks a part for every slot, at random from the whole list
// (generic examples and real parts alike, each equally likely), keeping only
// picks that pass every check. Pure (no DOM), so _tests/ can run it.

import { SLOTS, partsFor } from "./data.js";
import { checkBuild } from "./rules.js";

// The order parts are chosen in: each pick is checked against those before it.
// The power supply goes last, because its check adds up everything else.
const ORDER = ["case", "board", "cpu", "ram", "cooler", "gpu", "drive1", "drive2", "drive3", "fans", "psu"];
// How often an optional slot is filled (drives 2 and 3, fans); a graphics card
// is optional only when the processor has graphics of its own.
const FILL = { drive2: 0.4, drive3: 0.15, fans: 0.8, gpu: 0.8 };

function shuffled(list, rng) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const specs = st => Object.fromEntries(SLOTS.map(s => {
    const v = st[s.key];
    if (!v) return [s.key, null];
    if (v.id === "none") return [s.key, "none"];
    return [s.key, partsFor(s.cat).find(p => p.id === v.id).specs];
}));

// A pick is fine when no check among the parts chosen so far fails or warns.
function clean(st, chosen) {
    return !checkBuild(specs(st)).some(r =>
        (r.status === "fail" || r.status === "warn") && r.parts.every(k => chosen.has(k)));
}

function attempt(rng) {
    const st = Object.fromEntries(SLOTS.map(s => [s.key, null]));
    const chosen = new Set();
    for (const key of ORDER) {
        const slot = SLOTS.find(s => s.key === key);
        chosen.add(key);
        const optional = key === "gpu" ? specs(st).cpu.igpu : !slot.required;
        if (optional && rng() >= FILL[key]) {
            st[key] = slot.noneLabel ? { id: "none" } : null;
            continue;
        }
        const ok = shuffled(partsFor(slot.cat), rng).find(p => {
            st[key] = { id: p.id };
            return clean(st, chosen);
        });
        if (!ok) return null;
    }
    const res = checkBuild(specs(st));
    return res.some(r => r.status === "fail" || r.status === "warn" || r.status === "todo") ? null : st;
}

// Returns a state object ({ slotKey: { id } | { id: "none" } | null }).
export function randomBuild(rng = Math.random) {
    for (let i = 0; i < 200; i++) {
        const st = attempt(rng);
        if (st) return st;
    }
    throw new Error("No random build found");
}
