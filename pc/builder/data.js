// PC builder data: fields, slots and parts.
//
// A part is { id, cat, kind, name, specs, source, note }.
//   kind "generic": an example part made up to show variety. source: null.
//   kind "product": a real product. source: { url, checked } = the maker's own
//                   page and the date its specs were read (owner, in a browser).
//   kind "custom":  typed in by the user; never stored by the site.
// The rules read only `specs`, so all three kinds are checked the same way.
// One field list per category drives the own-part form, the .txt import
// checks, the rules and the card's stat rows.

import { PRODUCTS } from "./products.js";

export const SOCKETS = ["AM4", "AM5", "LGA 1700", "LGA 1851"];
export const MEMORY = ["DDR4", "DDR5"];
export const BOARD_SIZES = ["ATX", "Micro-ATX", "Mini-ITX"];
export const RADIATORS = ["120", "140", "240", "280", "360"];
export const PSU_SIZES = ["ATX", "SFX"];
export const DRIVE_TYPES = ["M.2 NVMe", "SATA 2.5-inch", "SATA 3.5-inch"];
export const COOLER_TYPES = ["Air", "Liquid (AIO)"];
export const FAN_SIZES = ["120", "140"];
export const FAN_CONNECTORS = ["4-pin PWM", "3-pin"];

// type: "select" (one option), "multi" (any of them), "int", "dec" (decimal),
// "bool". `optional`: a maker's page may not give it; empty means "not listed".
// `when` hides a field that doesn't apply. `learn` names the spec on the part's
// card whose (i) explains it.
export const FIELDS = {
    cpu: [
        { key: "socket", label: "Socket", type: "select", options: SOCKETS, learn: "Socket",
          hint: "On the maker's spec page, often under \"Socket\" or \"Package\"." },
        { key: "memory", label: "Memory it supports", type: "multi", options: MEMORY, learn: "Memory support",
          hint: "Under \"Memory type\" on the spec page." },
        { key: "cores", label: "Cores", type: "int", min: 1, max: 256, learn: "Cores and threads",
          hint: "\"# of CPU cores\" or \"Total cores\"." },
        { key: "powerW", label: "Power (TDP or base power), watts", type: "int", min: 5, max: 500, learn: "Power",
          hint: "\"Default TDP\" or \"Processor base power\"." },
        { key: "maxPowerW", label: "Maximum power, watts", type: "int", min: 5, max: 600, optional: true, learn: "Power",
          hint: "\"Maximum turbo power\", if the page lists one. Leave empty if not." },
        { key: "igpu", label: "Built-in graphics", type: "bool", learn: "Built-in graphics",
          hint: "\"Integrated graphics\" or \"Graphics model\"; none listed means no." },
    ],
    board: [
        { key: "socket", label: "Socket", type: "select", options: SOCKETS, learn: "Socket", hint: "Top of the board's spec page, under \"CPU\"." },
        { key: "size", label: "Form factor", type: "select", options: BOARD_SIZES, learn: "Form factor", hint: "Usually in the board's name or under \"Form factor\"." },
        { key: "memory", label: "Memory type", type: "select", options: MEMORY, learn: "Memory", hint: "Under \"Memory\": the board has DDR4 or DDR5 slots, never both." },
        { key: "ramSlots", label: "Memory slots", type: "int", min: 1, max: 8, learn: "Memory", hint: "Under \"Memory\", e.g. \"4 x DIMM\"." },
        { key: "m2Slots", label: "M.2 slots for drives", type: "int", min: 0, max: 8, learn: "M.2 slots and SATA ports",
          hint: "Under \"Storage\". Count only slots for SSDs (Key M), not Wi-Fi (Key E)." },
        { key: "sataPorts", label: "SATA ports", type: "int", min: 0, max: 16, learn: "M.2 slots and SATA ports", hint: "Under \"Storage\", e.g. \"4 x SATA 6Gb/s\"." },
        { key: "maxCpuW", label: "Processor power limit, watts", type: "int", min: 35, max: 600, optional: true, learn: "Socket",
          hint: "Some boards say \"supports up to N W CPU\". Leave empty if not listed." },
    ],
    ram: [
        { key: "memory", label: "Memory type", type: "select", options: MEMORY, learn: "Type", hint: "DDR4 or DDR5, always in the kit's name." },
        { key: "sticks", label: "Sticks in the kit", type: "int", min: 1, max: 8, learn: "Kit size", hint: "A \"2 x 16 GB\" kit has 2 sticks." },
        { key: "gbPerStick", label: "GB per stick", type: "int", min: 1, max: 256, learn: "Capacity", hint: "A \"2 x 16 GB\" kit has 16 GB per stick." },
    ],
    storage: [
        { key: "type", label: "Type", type: "select", options: DRIVE_TYPES, learn: "Interface", hint: "M.2 drives are small sticks; SATA drives are boxes that take a cable." },
        { key: "capacityGb", label: "Capacity, GB", type: "int", min: 1, max: 100000, learn: "Capacity", hint: "1 TB = 1000 GB." },
    ],
    gpu: [
        { key: "lengthMm", label: "Length, mm", type: "int", min: 100, max: 500, learn: "Length", hint: "Under \"Dimensions\" or \"Card length\"." },
        { key: "slots", label: "Thickness, slots", type: "dec", min: 1, max: 5, optional: true, learn: "Thickness",
          hint: "\"Slot\" on the spec page, e.g. 2 or 3.125. Leave empty if not listed." },
        { key: "powerW", label: "Power, watts", type: "int", min: 10, max: 900, learn: "Power", hint: "\"Total graphics power\" or \"Typical board power\"." },
        { key: "psuW", label: "Recommended power supply, watts", type: "int", min: 200, max: 2500, learn: "Recommended power supply",
          hint: "\"Required system power\" or \"Recommended PSU\"." },
    ],
    cooler: [
        { key: "type", label: "Type", type: "select", options: COOLER_TYPES, learn: null, hint: "A tower of fins and a fan, or a pump with a radiator." },
        { key: "heightMm", label: "Height, mm", type: "int", min: 20, max: 220, when: s => s.type === "Air", learn: "Height",
          hint: "Under \"Dimensions\": the height from the processor, fan included." },
        { key: "radiatorMm", label: "Radiator size, mm", type: "select", options: RADIATORS, when: s => s.type === "Liquid (AIO)", learn: "Radiator size",
          hint: "In the name: a 240 has two 120 mm fans." },
        { key: "sockets", label: "Sockets it fits", type: "multi", options: SOCKETS, learn: "Socket support", hint: "Under \"Socket support\" or \"Compatibility\"." },
        { key: "ratedW", label: "Rated for, watts", type: "int", min: 20, max: 500, optional: true, learn: "Cooling rating",
          hint: "\"TDP rating\". Not every maker gives one: leave empty if not." },
    ],
    psu: [
        { key: "watts", label: "Wattage", type: "int", min: 200, max: 2500, learn: "Wattage", hint: "In the name, e.g. \"750 W\"." },
        { key: "size", label: "Form factor", type: "select", options: PSU_SIZES, learn: "Form factor", hint: "Most are ATX; small cases often need SFX." },
    ],
    case: [
        { key: "boards", label: "Motherboards it fits", type: "multi", options: BOARD_SIZES, learn: "Motherboard sizes", hint: "Under \"Motherboard support\"." },
        { key: "maxGpuMm", label: "Longest graphics card, mm", type: "int", min: 100, max: 600, learn: "Graphics card length", hint: "\"GPU clearance\" or \"Max GPU length\"." },
        { key: "expansionSlots", label: "Expansion slots", type: "int", min: 1, max: 12, learn: "Expansion slots", hint: "\"Expansion slots\" on the spec page." },
        { key: "maxCoolerMm", label: "Tallest CPU cooler, mm", type: "int", min: 20, max: 250, learn: "CPU cooler height", hint: "\"CPU cooler clearance\" or \"Max cooler height\"." },
        { key: "radiators", label: "Radiators it fits", type: "multi", options: RADIATORS, learn: "Radiator support", hint: "Under \"Radiator support\". Any position counts." },
        { key: "psuSizes", label: "Power supplies it fits", type: "multi", options: PSU_SIZES, learn: "Power supply", hint: "Under \"PSU support\"." },
        { key: "bays25", label: "2.5-inch drive bays", type: "int", min: 0, max: 12, optional: true, learn: "Drive bays", hint: "Under \"Drive bays\". Leave empty if not listed." },
        { key: "bays35", label: "3.5-inch drive bays", type: "int", min: 0, max: 12, optional: true, learn: "Drive bays", hint: "Under \"Drive bays\". Leave empty if not listed." },
    ],
    fans: [
        { key: "size", label: "Fan size, mm", type: "select", options: FAN_SIZES, learn: "Size", hint: "On the box or spec page, e.g. 120 mm." },
        { key: "count", label: "How many", type: "int", min: 1, max: 12, learn: "Size", hint: "Count the fans you'll fit, including any that came with the case." },
        { key: "connector", label: "Connector", type: "select", options: FAN_CONNECTORS, learn: "Connector", hint: "\"4-pin PWM\" or \"3-pin\" on the spec page." },
    ],
};

// The build's slots, in the order shown. `cat` picks the part list and fields.
export const SLOTS = [
    { key: "cpu", cat: "cpu", label: "Processor (CPU)", required: true },
    { key: "board", cat: "board", label: "Motherboard", required: true },
    { key: "ram", cat: "ram", label: "Memory (RAM)", required: true },
    { key: "drive1", cat: "storage", label: "Drive 1", required: true },
    { key: "drive2", cat: "storage", label: "Drive 2", required: false },
    { key: "drive3", cat: "storage", label: "Drive 3", required: false },
    { key: "gpu", cat: "gpu", label: "Graphics card (GPU)", required: false, noneLabel: "None: use the processor's graphics" },
    { key: "cooler", cat: "cooler", label: "CPU cooler", required: true },
    { key: "psu", cat: "psu", label: "Power supply (PSU)", required: true },
    { key: "case", cat: "case", label: "Case", required: true },
    { key: "fans", cat: "fans", label: "Case fans", required: false, noneLabel: "No extra fans" },
];

const g = (id, cat, name, specs) => Object.freeze({ id, cat, kind: "generic", name, specs: Object.freeze(specs), source: null, note: "" });
const ALL = ["AM4", "AM5", "LGA 1700", "LGA 1851"];

export const GENERIC = [
    g("cpu-6c-am5", "cpu", "6-core processor, AM5, 65 W", { socket: "AM5", memory: ["DDR5"], cores: 6, powerW: 65, maxPowerW: 88, igpu: true }),
    g("cpu-8c-am5", "cpu", "8-core processor, AM5, 120 W", { socket: "AM5", memory: ["DDR5"], cores: 8, powerW: 120, maxPowerW: 162, igpu: true }),
    g("cpu-16c-am5", "cpu", "16-core processor, AM5, 170 W", { socket: "AM5", memory: ["DDR5"], cores: 16, powerW: 170, maxPowerW: 230, igpu: true }),
    g("cpu-6c-am4", "cpu", "6-core processor, AM4, 65 W, no graphics", { socket: "AM4", memory: ["DDR4"], cores: 6, powerW: 65, maxPowerW: 88, igpu: false }),
    g("cpu-8c-am4", "cpu", "8-core processor, AM4, 105 W, no graphics", { socket: "AM4", memory: ["DDR4"], cores: 8, powerW: 105, maxPowerW: 142, igpu: false }),
    g("cpu-14c-1700", "cpu", "14-core processor, LGA 1700, 125 W", { socket: "LGA 1700", memory: ["DDR4", "DDR5"], cores: 14, powerW: 125, maxPowerW: 181, igpu: true }),
    g("cpu-20c-1851", "cpu", "20-core processor, LGA 1851, 125 W", { socket: "LGA 1851", memory: ["DDR5"], cores: 20, powerW: 125, maxPowerW: 250, igpu: true }),

    g("board-am5-atx", "board", "AM5 board, ATX, DDR5", { socket: "AM5", size: "ATX", memory: "DDR5", ramSlots: 4, m2Slots: 3, sataPorts: 4, maxCpuW: null }),
    g("board-am5-matx", "board", "AM5 board, Micro-ATX, DDR5", { socket: "AM5", size: "Micro-ATX", memory: "DDR5", ramSlots: 4, m2Slots: 2, sataPorts: 4, maxCpuW: null }),
    g("board-am5-itx", "board", "AM5 board, Mini-ITX, DDR5", { socket: "AM5", size: "Mini-ITX", memory: "DDR5", ramSlots: 2, m2Slots: 2, sataPorts: 2, maxCpuW: null }),
    g("board-am4-atx", "board", "AM4 board, ATX, DDR4", { socket: "AM4", size: "ATX", memory: "DDR4", ramSlots: 4, m2Slots: 2, sataPorts: 6, maxCpuW: null }),
    g("board-1700-atx-ddr4", "board", "LGA 1700 board, ATX, DDR4", { socket: "LGA 1700", size: "ATX", memory: "DDR4", ramSlots: 4, m2Slots: 3, sataPorts: 4, maxCpuW: null }),
    g("board-1700-matx-ddr5", "board", "LGA 1700 board, Micro-ATX, DDR5", { socket: "LGA 1700", size: "Micro-ATX", memory: "DDR5", ramSlots: 4, m2Slots: 2, sataPorts: 4, maxCpuW: null }),
    g("board-1851-atx", "board", "LGA 1851 board, ATX, DDR5", { socket: "LGA 1851", size: "ATX", memory: "DDR5", ramSlots: 4, m2Slots: 4, sataPorts: 4, maxCpuW: null }),

    g("ram-ddr5-2x16", "ram", "DDR5, 32 GB (2 × 16 GB)", { memory: "DDR5", sticks: 2, gbPerStick: 16 }),
    g("ram-ddr5-2x32", "ram", "DDR5, 64 GB (2 × 32 GB)", { memory: "DDR5", sticks: 2, gbPerStick: 32 }),
    g("ram-ddr5-4x16", "ram", "DDR5, 64 GB (4 × 16 GB)", { memory: "DDR5", sticks: 4, gbPerStick: 16 }),
    g("ram-ddr4-2x8", "ram", "DDR4, 16 GB (2 × 8 GB)", { memory: "DDR4", sticks: 2, gbPerStick: 8 }),
    g("ram-ddr4-2x16", "ram", "DDR4, 32 GB (2 × 16 GB)", { memory: "DDR4", sticks: 2, gbPerStick: 16 }),
    g("ram-ddr4-4x8", "ram", "DDR4, 32 GB (4 × 8 GB)", { memory: "DDR4", sticks: 4, gbPerStick: 8 }),

    g("ssd-m2-1tb", "storage", "M.2 NVMe SSD, 1 TB", { type: "M.2 NVMe", capacityGb: 1000 }),
    g("ssd-m2-2tb", "storage", "M.2 NVMe SSD, 2 TB", { type: "M.2 NVMe", capacityGb: 2000 }),
    g("ssd-m2-4tb", "storage", "M.2 NVMe SSD, 4 TB", { type: "M.2 NVMe", capacityGb: 4000 }),
    g("ssd-sata-1tb", "storage", "SATA SSD, 2.5-inch, 1 TB", { type: "SATA 2.5-inch", capacityGb: 1000 }),
    g("hdd-4tb", "storage", "Hard drive, 3.5-inch, 4 TB", { type: "SATA 3.5-inch", capacityGb: 4000 }),
    g("hdd-8tb", "storage", "Hard drive, 3.5-inch, 8 TB", { type: "SATA 3.5-inch", capacityGb: 8000 }),

    g("gpu-entry-2fan", "gpu", "Entry graphics card, 2 fans, 200 mm", { lengthMm: 200, slots: 2, powerW: 115, psuW: 450 }),
    g("gpu-mid-2fan", "gpu", "Mid-range graphics card, 2 fans, 245 mm", { lengthMm: 245, slots: 2, powerW: 200, psuW: 550 }),
    g("gpu-mid-3fan", "gpu", "Mid-range graphics card, 3 fans, 300 mm", { lengthMm: 300, slots: 2.5, powerW: 250, psuW: 650 }),
    g("gpu-high-3fan", "gpu", "High-end graphics card, 3 fans, 336 mm", { lengthMm: 336, slots: 3, powerW: 320, psuW: 750 }),
    g("gpu-top-3fan", "gpu", "Top-end graphics card, 3 fans, 357 mm", { lengthMm: 357, slots: 3.5, powerW: 575, psuW: 1000 }),

    g("cooler-low-47", "cooler", "Low-profile air cooler, 47 mm", { type: "Air", heightMm: 47, sockets: ALL, ratedW: 65 }),
    g("cooler-tower-155", "cooler", "Tower air cooler, 155 mm", { type: "Air", heightMm: 155, sockets: ALL, ratedW: 180 }),
    g("cooler-tower-165", "cooler", "Dual-tower air cooler, 165 mm", { type: "Air", heightMm: 165, sockets: ALL, ratedW: 250 }),
    g("cooler-tower-old", "cooler", "Older tower air cooler, 158 mm (AM4 and AM5 only)", { type: "Air", heightMm: 158, sockets: ["AM4", "AM5"], ratedW: 200 }),
    g("cooler-aio-240", "cooler", "Liquid cooler (AIO), 240 mm radiator", { type: "Liquid (AIO)", radiatorMm: "240", sockets: ALL, ratedW: 250 }),
    g("cooler-aio-360", "cooler", "Liquid cooler (AIO), 360 mm radiator", { type: "Liquid (AIO)", radiatorMm: "360", sockets: ALL, ratedW: 300 }),

    g("psu-550-atx", "psu", "550 W power supply, ATX", { watts: 550, size: "ATX" }),
    g("psu-650-atx", "psu", "650 W power supply, ATX", { watts: 650, size: "ATX" }),
    g("psu-750-atx", "psu", "750 W power supply, ATX", { watts: 750, size: "ATX" }),
    g("psu-850-atx", "psu", "850 W power supply, ATX", { watts: 850, size: "ATX" }),
    g("psu-1000-atx", "psu", "1000 W power supply, ATX", { watts: 1000, size: "ATX" }),
    g("psu-1200-atx", "psu", "1200 W power supply, ATX", { watts: 1200, size: "ATX" }),
    g("psu-650-sfx", "psu", "650 W power supply, SFX", { watts: 650, size: "SFX" }),
    g("psu-850-sfx", "psu", "850 W power supply, SFX", { watts: 850, size: "SFX" }),

    g("case-mid", "case", "Mid tower case", { boards: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuMm: 400, expansionSlots: 7, maxCoolerMm: 170, radiators: ["120", "240", "280", "360"], psuSizes: ["ATX"], bays25: 2, bays35: 2 }),
    g("case-airflow", "case", "Airflow mid tower case", { boards: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuMm: 360, expansionSlots: 7, maxCoolerMm: 165, radiators: ["120", "240", "280", "360"], psuSizes: ["ATX"], bays25: 2, bays35: 2 }),
    g("case-full", "case", "Full tower case", { boards: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuMm: 450, expansionSlots: 8, maxCoolerMm: 185, radiators: ["120", "240", "280", "360"], psuSizes: ["ATX"], bays25: 4, bays35: 4 }),
    g("case-compact", "case", "Compact Micro-ATX case", { boards: ["Micro-ATX", "Mini-ITX"], maxGpuMm: 330, expansionSlots: 4, maxCoolerMm: 160, radiators: ["120", "240"], psuSizes: ["ATX"], bays25: 2, bays35: 1 }),
    g("case-sff", "case", "Small form factor case (Mini-ITX)", { boards: ["Mini-ITX"], maxGpuMm: 320, expansionSlots: 3, maxCoolerMm: 70, radiators: ["120", "240"], psuSizes: ["SFX"], bays25: 2, bays35: 0 }),

    g("fans-3x120", "fans", "3 × 120 mm fans, 4-pin PWM", { size: "120", count: 3, connector: "4-pin PWM" }),
    g("fans-2x140", "fans", "2 × 140 mm fans, 4-pin PWM", { size: "140", count: 2, connector: "4-pin PWM" }),
    g("fans-6x120", "fans", "6 × 120 mm fans, 4-pin PWM", { size: "120", count: 6, connector: "4-pin PWM" }),
    g("fans-3x120-3pin", "fans", "3 × 120 mm fans, 3-pin", { size: "120", count: 3, connector: "3-pin" }),
];

export const PARTS = [...PRODUCTS, ...GENERIC];
export const PART_BY_ID = new Map(PARTS.map(p => [p.id, p]));
export const partsFor = cat => PARTS.filter(p => p.cat === cat);

// Starting values for a fresh "my own part" form (typed in, then checked).
export function blankSpecs(cat) {
    const s = Object.create(null);
    for (const f of FIELDS[cat]) {
        if (f.type === "select") s[f.key] = f.options[0];
        else if (f.type === "multi") s[f.key] = [];
        else if (f.type === "bool") s[f.key] = false;
        else s[f.key] = null; // numbers start empty: read them off the spec page
    }
    return s;
}

// Which box shape (and texture) draws a part on the stage and its card.
export function shapeFor(cat, s) {
    switch (cat) {
        case "board": return s.size === "Mini-ITX" ? "board-itx" : s.size === "Micro-ATX" ? "board-matx" : "board-atx";
        case "gpu": return s.lengthMm >= 280 ? "gpu-3fan" : "gpu-2fan";
        case "cooler": return s.type === "Air" ? (s.heightMm >= 100 ? "cooler-tower" : "cooler-low") : "cooler-pump";
        case "psu": return s.size === "SFX" ? "psu-sfx" : "psu-atx";
        case "storage": return s.type === "M.2 NVMe" ? "m2" : s.type === "SATA 2.5-inch" ? "drive-25" : "drive-35";
        case "ram": return "ram";
        case "case": return "case";
        case "fans": return "fan";
        default: return cat;
    }
}
