// Part cards in the builder: the same trading card as the Learn pages, built
// with createElement/textContent only (nothing is ever parsed as markup), and
// filled with the chosen part's own values. The stat (i)s are the Learn content.

import { CONTENT } from "./content.js";
import { FIELDS, shapeFor } from "./data.js";
import { applies } from "./rules.js";

const FACES = ["f-bottom", "f-back", "f-right", "f-left", "f-front", "f-top"];

// Short stat names for the card face (the form uses the full labels).
const SHORT = {
    cpu: { socket: "Socket", memory: "Memory", cores: "Cores", powerW: "Power", maxPowerW: "Max power", igpu: "Graphics" },
    board: { socket: "Socket", size: "Form factor", memory: "Memory", ramSlots: "RAM slots", m2Slots: "M.2 slots", sataPorts: "SATA ports", maxCpuW: "CPU limit" },
    ram: { memory: "Type", sticks: "Sticks", gbPerStick: "Per stick" },
    storage: { type: "Interface", capacityGb: "Capacity" },
    gpu: { lengthMm: "Length", slots: "Thickness", powerW: "Power", psuW: "PSU advised" },
    cooler: { type: "Type", heightMm: "Height", radiatorMm: "Radiator", sockets: "Sockets", ratedW: "Rating" },
    psu: { watts: "Wattage", size: "Form factor" },
    case: { boards: "Boards", maxGpuMm: "GPU length", expansionSlots: "Slots", maxCoolerMm: "Cooler height", radiators: "Radiators", psuSizes: "PSU", bays: "Drive bays" },
    fans: { size: "Size", count: "Count", connector: "Connector" },
};
const UNIT = { powerW: " W", maxPowerW: " W", maxCpuW: " W", gbPerStick: " GB", lengthMm: " mm", psuW: " W",
    heightMm: " mm", radiatorMm: " mm", ratedW: " W", watts: " W", maxGpuMm: " mm", maxCoolerMm: " mm", size: "" };

const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
};

const BOARD_ABBR = { "ATX": "ATX", "Micro-ATX": "mATX", "Mini-ITX": "ITX" };

export const capacity = gb => (gb >= 1000 ? `${+(gb / 1000).toFixed(1)} TB` : `${gb} GB`);

export function formatValue(cat, f, v) {
    if (v === null || v === undefined) return "—";
    if (f.type === "bool") return v ? "Yes" : "No";
    if (f.type === "multi") {
        if (!v.length) return "none";
        if (f.key === "radiators") return `up to ${Math.max(...v.map(Number))} mm`;
        if (f.key === "boards" || f.key === "size") return v.map(x => BOARD_ABBR[x] ?? x).join("/");
        if (v.length > 2) return `${v.length} listed`;
        return v.join(" / ");
    }
    if (f.key === "capacityGb") return capacity(v);
    if (cat === "fans" && f.key === "size") return `${v} mm`;
    return `${v}${UNIT[f.key] ?? ""}`;
}

// The big number in the card's corner. Blank until the numbers behind it are
// filled in (an unfinished "my own part" has empty fields).
const num = v => typeof v === "number" && Number.isFinite(v);
function headline(cat, s) {
    if (!s) return ["", ""];
    const none = ["", ""];
    switch (cat) {
        case "cpu": return num(s.powerW) ? ["Power", `${s.powerW} W`] : none;
        case "board": return ["Size", s.size];
        case "ram": return num(s.sticks) && num(s.gbPerStick) ? ["Total", `${s.sticks * s.gbPerStick} GB`] : none;
        case "storage": return num(s.capacityGb) ? ["Size", capacity(s.capacityGb)] : none;
        case "gpu": return num(s.powerW) ? ["Power", `${s.powerW} W`] : none;
        case "cooler": return ["Type", s.type === "Air" ? "Air" : "Liquid"];
        case "psu": return num(s.watts) ? ["Power", `${s.watts} W`] : none;
        case "case": return s.boards.length ? ["Fits", s.boards.includes("ATX") ? "ATX" : s.boards.includes("Micro-ATX") ? "Micro-ATX" : "Mini-ITX"] : none;
        case "fans": return ["Size", `${s.size} mm`];
    }
    return none;
}

let seq = 0;
function info(learn, extra) {
    const id = `cardinfo-${++seq}`;
    const b = el("button", "info", "i");
    b.type = "button";
    b.setAttribute("popovertarget", id);
    b.setAttribute("aria-label", `About ${learn.name.toLowerCase()}`);
    const pop = el("span", "bubble");
    pop.id = id;
    pop.popover = "auto";
    pop.append(el("b", null, learn.gist), document.createTextNode(` ${learn.text}`));
    if (extra) pop.append(el("span", "eg", extra));
    return [b, pop];
}

function stat(cat, label, value, learnName, extra) {
    const row = el("div");
    const dt = el("dt", null, label);
    const spec = learnName && CONTENT[cat].specs[learnName];
    if (spec) dt.append(document.createTextNode(" "), ...info({ name: label, ...spec }, extra));
    row.append(dt, el("dd", "val", value));
    return row;
}

// A part's 3D box for a card's picture window (also used for the stage).
export function partBox(cat, specs, shape) {
    const box = el("div", `part shape-${shape}`);
    for (const f of FACES) box.append(el("i", f));
    if (specs && cat === "gpu" && specs.lengthMm) box.style.setProperty("--w", String(specs.lengthMm));
    if (specs && cat === "cooler" && specs.type === "Air" && specs.heightMm) box.style.setProperty("--h", String(specs.heightMm));
    return box;
}

const DEFAULT_SHAPE = { cpu: "cpu", board: "board-atx", ram: "ram", storage: "drive-35", gpu: "gpu-3fan",
    cooler: "cooler-tower", psu: "psu-atx", case: "case", fans: "fan" };

// part: null (an empty slot: the category's card) or { kind, name, specs, source, note }
// opts.infoButton: an element placed after the type tag (the builder's (i)).
export function renderCard(cat, part, opts = {}) {
    const c = CONTENT[cat];
    const specs = part?.specs ?? null;
    const shape = specs ? shapeFor(cat, specs) : DEFAULT_SHAPE[cat];
    const card = el("article", `tcard shape-${shape}`);
    card.setAttribute("aria-label", `${part ? part.name : c.name} card`);   // the full name, also in the dropdown

    const top = el("header", "tcard-top");
    const [hl, hv] = headline(cat, specs);
    const hp = el("span", "tcard-hp");
    if (hv) hp.append(el("small", null, hl), document.createTextNode(` ${hv}`));
    top.append(el("h3", "tcard-name", part ? (part.cardName ?? part.name) : c.name), hp);

    const art = el("div", "tcard-art");
    art.setAttribute("aria-hidden", "true");
    const spin = el("div", `tcard-spin fit-${cat}`);
    spin.append(partBox(cat, specs, shape));
    art.append(spin);

    const type = el("p", "tcard-type");
    type.append(el("span", null, c.badge));
    if (opts.infoButton) type.append(document.createTextNode(" "), opts.infoButton);
    type.append(document.createTextNode(` ${c.blurb}`));

    const stats = el("dl", "tcard-stats");
    for (const f of FIELDS[cat]) {
        if (specs && !applies(f, specs)) continue;
        if (cat === "case" && f.key === "bays35") continue;
        if (cat === "case" && f.key === "bays25") {
            const v = specs ? (specs.bays25 === null || specs.bays35 === null ? "—" : `${specs.bays25} + ${specs.bays35}`) : "—";
            stats.append(stat(cat, SHORT.case.bays, v, "Drive bays", specs && v === "—" ? "Not listed on the maker's page." : "2.5-inch + 3.5-inch."));
            continue;
        }
        if (f.optional && specs && (specs[f.key] === null || specs[f.key] === undefined) && f.key !== "ratedW" && f.key !== "slots") continue;
        const v = specs ? formatValue(cat, f, specs[f.key]) : "—";
        const full = specs && f.type === "multi" && specs[f.key].length ? `Listed: ${specs[f.key].join(", ")}.` : "";
        const extra = specs && v === "—" ? "Not listed on the maker's page." : full;
        stats.append(stat(cat, SHORT[cat][f.key] ?? f.label, v, f.learn, extra));
    }

    // The foot says what kind of part it is; a real part's note, maker page and
    // checked date sit in its (i), so the card face holds only the data.
    const foot = el("p", "tcard-foot");
    if (!part) foot.append(el("b", null, "Choose one"), document.createTextNode(" from the list above."));
    else if (part.kind === "product") {
        const id = `cardsrc-${++seq}`;
        const b = el("button", "info", "i");
        b.type = "button";
        b.setAttribute("popovertarget", id);
        b.setAttribute("aria-label", "Source of these specs");
        const pop = el("span", "bubble");
        pop.id = id;
        pop.popover = "auto";
        if (part.note) pop.append(el("b", null, part.note));
        const a = el("a", null, new URL(part.source.url).hostname.replace(/^www\./, ""));
        a.href = part.source.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        pop.append(document.createTextNode(" Specs from the maker's page, "), a, document.createTextNode(`, checked ${part.source.checked}. Makers can change them.`));
        foot.append(el("b", null, "Real part"), document.createTextNode(" · source "), b, pop);
    } else if (part.kind === "custom") foot.append(el("b", null, "Your own part"));
    else foot.append(el("b", null, "Generic example"));

    card.append(top, art, type, stats, foot);
    return card;
}
