// Compatibility rules. Pure functions with no DOM, so the tests in _tests/ run
// them under node --test. They read only `specs`, never a brand or a kind.

import { FIELDS, SLOTS } from "./data.js";

const DRIVE_KEYS = ["drive1", "drive2", "drive3"];

// Is one field's value acceptable? Returns an error message or "".
export function fieldError(field, value) {
    if ((value === null || value === undefined) && field.optional) return "";
    switch (field.type) {
        case "select":
            return field.options.includes(value) ? "" : `Pick one of: ${field.options.join(", ")}.`;
        case "multi":
            if (!Array.isArray(value) || value.some(v => !field.options.includes(v))) return `Only: ${field.options.join(", ")}.`;
            return field.key === "radiators" || value.length ? "" : "Tick at least one.";
        case "bool":
            return typeof value === "boolean" ? "" : "Yes or no.";
        case "int":
        case "dec":
            if (value === null || value === undefined) return "Enter a number from the spec page.";
            if (typeof value !== "number" || !Number.isFinite(value)) return "Numbers only.";
            if (field.type === "int" && !Number.isInteger(value)) return "Whole numbers only.";
            if (value < field.min || value > field.max) return `Between ${field.min} and ${field.max}.`;
            return "";
    }
    return "Unknown field.";
}

export const applies = (field, specs) => !field.when || field.when(specs);

// Errors for a whole part's specs, by field key. Empty object = complete.
export function specErrors(cat, specs) {
    const out = Object.create(null);
    for (const f of FIELDS[cat]) {
        if (!applies(f, specs)) continue;
        const e = fieldError(f, specs[f.key]);
        if (e) out[f.key] = e;
    }
    return out;
}

const r = (status, text, parts = []) => ({ status, text, parts });
const has = v => v !== null && v !== undefined;
const plural = (n, one, many = one + "s") => `${n} ${n === 1 ? one : many}`;

// A rough full-load estimate: processor (its maximum power when the page gives
// one) + graphics card + about 50 W for board, memory and fans + 10 W a drive.
export function estimateWatts(build) {
    const gpu = build.gpu && build.gpu !== "none" ? build.gpu : null;
    const cpuW = build.cpu ? Math.max(build.cpu.powerW, build.cpu.maxPowerW ?? 0) : 0;
    const drives = DRIVE_KEYS.filter(k => build[k]).length;
    return cpuW + (gpu ? gpu.powerW : 0) + 50 + 10 * drives;
}

// build: { [slotKey]: specs | null | "none" }   ("none" only where noneLabel exists)
// Returns [{ status: "ok"|"warn"|"fail"|"todo"|"info", text, parts: [slotKeys] }]
export function checkBuild(build) {
    const out = [];
    for (const s of SLOTS) {
        if (s.required && !build[s.key]) out.push(r("todo", `Choose ${s.label.replace(/ \(.*\)$/, "").toLowerCase()}.`, [s.key]));
    }
    const { cpu, board, ram, cooler, psu } = build;
    const kase = build.case;
    const gpu = build.gpu && build.gpu !== "none" ? build.gpu : null;
    const drives = DRIVE_KEYS.filter(k => build[k]).map(k => ({ key: k, ...build[k] }));

    if (cpu && board) {
        if (cpu.socket !== board.socket) {
            out.push(r("fail", `The processor needs socket ${cpu.socket}, but the board has ${board.socket}. They will not fit together.`, ["cpu", "board"]));
        } else {
            out.push(r("ok", `Processor and board share socket ${cpu.socket}.`, ["cpu", "board"]));
            out.push(r("info", "Before buying, find this exact processor in the board maker's CPU support list, and note the BIOS version it needs.", ["cpu", "board"]));
        }
        if (!cpu.memory.includes(board.memory)) {
            out.push(r("fail", `The board has ${board.memory} slots, but the processor only works with ${cpu.memory.join(" or ")}.`, ["cpu", "board"]));
        }
        if (has(board.maxCpuW) && cpu.powerW > board.maxCpuW) {
            out.push(r("warn", `The board is listed for processors up to ${board.maxCpuW} W; this one is ${cpu.powerW} W.`, ["cpu", "board"]));
        }
    }
    if (ram && board) {
        if (ram.memory !== board.memory) {
            out.push(r("fail", `The memory is ${ram.memory} but the board takes ${board.memory}. The notch is in a different place, so it will not go in.`, ["ram", "board"]));
        } else {
            out.push(r("ok", `${ram.memory} memory matches the board.`, ["ram", "board"]));
        }
        if (ram.sticks > board.ramSlots) {
            out.push(r("fail", `The kit has ${ram.sticks} sticks but the board has ${board.ramSlots} memory slots.`, ["ram", "board"]));
        }
    }
    if (board && kase) {
        if (!kase.boards.includes(board.size)) {
            out.push(r("fail", `This ${board.size} board does not fit the case (it takes ${kase.boards.join(", ")}).`, ["board", "case"]));
        } else {
            out.push(r("ok", `The ${board.size} board fits the case.`, ["board", "case"]));
        }
    }
    if (cpu && !gpu && !cpu.igpu) {
        out.push(r("fail", "This processor has no built-in graphics, so the computer needs a graphics card to show a picture.", ["cpu", "gpu"]));
    }
    if (gpu && kase) {
        const room = kase.maxGpuMm - gpu.lengthMm;
        if (room < 0) out.push(r("fail", `The graphics card is ${gpu.lengthMm} mm long; the case fits ${kase.maxGpuMm} mm.`, ["gpu", "case"]));
        else if (room < 10) out.push(r("warn", `The graphics card fits with only ${room} mm to spare. Front fans or a radiator can take that space.`, ["gpu", "case"]));
        else out.push(r("ok", `The graphics card fits with ${room} mm to spare.`, ["gpu", "case"]));
        if (has(gpu.slots)) {
            const needs = Math.ceil(gpu.slots - 1e-9);
            if (needs > kase.expansionSlots) out.push(r("fail", `The graphics card is ${gpu.slots} slots thick, so it covers ${needs} slot openings; the case has ${kase.expansionSlots}.`, ["gpu", "case"]));
        } else {
            out.push(r("info", "The graphics card's thickness isn't listed: check it against the case's expansion slots.", ["gpu", "case"]));
        }
    }
    if (cooler && cpu) {
        if (!cooler.sockets.includes(cpu.socket)) {
            out.push(r("warn", `The cooler doesn't list socket ${cpu.socket}. It may need a separate mounting kit, or may not fit: check with the cooler's maker.`, ["cooler", "cpu"]));
        }
        if (!has(cooler.ratedW)) {
            out.push(r("info", "The cooler's maker doesn't give a wattage rating, so its cooling can't be compared with the processor's power.", ["cooler"]));
        } else if (cooler.ratedW < cpu.powerW) {
            out.push(r("warn", `The cooler is rated for ${cooler.ratedW} W and the processor gives off about ${cpu.powerW} W. It will run hot and slow itself down.`, ["cooler", "cpu"]));
        }
    }
    if (cooler && kase) {
        if (cooler.type === "Air") {
            const room = kase.maxCoolerMm - cooler.heightMm;
            if (room < 0) out.push(r("fail", `The cooler is ${cooler.heightMm} mm tall; the case fits ${kase.maxCoolerMm} mm.`, ["cooler", "case"]));
            else if (room < 5) out.push(r("warn", `The cooler fits with ${room} mm to spare: no room for raised fans or tall memory.`, ["cooler", "case"]));
            else out.push(r("ok", `The cooler fits under the side panel (${room} mm to spare).`, ["cooler", "case"]));
        } else if (!kase.radiators.includes(cooler.radiatorMm)) {
            out.push(r("fail", `The case has no place for a ${cooler.radiatorMm} mm radiator.`, ["cooler", "case"]));
        } else {
            out.push(r("ok", `The case has room for the ${cooler.radiatorMm} mm radiator.`, ["cooler", "case"]));
        }
    }
    if (psu && kase && !kase.psuSizes.includes(psu.size)) {
        out.push(r("fail", `This ${psu.size} power supply does not fit the case (it takes ${kase.psuSizes.join(", ")}).`, ["psu", "case"]));
    }
    if (psu && cpu) {
        const est = estimateWatts(build);
        const want = Math.max(Math.ceil(est * 1.3 / 50) * 50, gpu ? gpu.psuW : 0);
        if (psu.watts < est) out.push(r("fail", `The parts can draw about ${est} W at full load, more than this ${psu.watts} W power supply gives.`, ["psu"]));
        else if (psu.watts < want) out.push(r("warn", `About ${est} W at full load. Choose at least ${want} W for safe headroom${gpu && want === gpu.psuW ? ", which is what the graphics card asks for" : ""}.`, ["psu"]));
        else out.push(r("ok", `About ${est} W at full load; the ${psu.watts} W supply has room to spare.`, ["psu"]));
    }
    if (board && drives.length) {
        const m2 = drives.filter(d => d.type === "M.2 NVMe");
        const sata = drives.length - m2.length;
        if (m2.length > board.m2Slots) out.push(r("fail", `The board has ${plural(board.m2Slots, "M.2 slot")}, not enough for ${m2.length} M.2 drives.`, ["board", ...m2.map(d => d.key)]));
        else if (m2.length) out.push(r("ok", `M.2 slots: ${m2.length} of ${board.m2Slots} used.`, ["board"]));
        if (sata > board.sataPorts) out.push(r("fail", `The board has ${plural(board.sataPorts, "SATA port")}, not enough for ${sata} SATA drives.`, ["board"]));
    }
    if (kase && drives.length) {
        const n35 = drives.filter(d => d.type === "SATA 3.5-inch");
        const n25 = drives.filter(d => d.type === "SATA 2.5-inch");
        if (n35.length || n25.length) {
            if (!has(kase.bays25) || !has(kase.bays35)) {
                out.push(r("info", "The case's drive bays aren't listed on its spec page: check there's a place for each SATA drive.", ["case"]));
            } else if (n35.length > kase.bays35) {
                out.push(r("fail", `The case has ${plural(kase.bays35, "3.5-inch bay")}, not enough for ${plural(n35.length, "3.5-inch drive")}.`, ["case", ...n35.map(d => d.key)]));
            } else if (n25.length > kase.bays25 + (kase.bays35 - n35.length)) {
                out.push(r("fail", "Not enough drive bays for the 2.5-inch drives.", ["case", ...n25.map(d => d.key)]));
            }
        }
    }
    return out;
}
