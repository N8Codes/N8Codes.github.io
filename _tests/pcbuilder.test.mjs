// Tests for the PC builder (pc-builder.html). Run from the repo root:  node --test _tests/
// (_tests/ starts with an underscore, so GitHub Pages' Jekyll build doesn't publish it.)
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import "./dom-stub.mjs";

// card.js sets CSS custom properties through the CSSOM; give the stub that one method.
const make = globalThis.document.createElement;
globalThis.document.createElement = (tag) => { const e = make(tag); e.style.setProperty = (k, v) => { e.style[k] = v; }; return e; };

const { FIELDS, SLOTS, PARTS, PART_BY_ID, GENERIC, blankSpecs, shapeFor } = await import("../pc/builder/data.js");
const { PRODUCTS } = await import("../pc/builder/products.js");
const { checkBuild, specErrors, fieldError, estimateWatts } = await import("../pc/builder/rules.js");
const { toTxt, parseTxt, FORMAT } = await import("../pc/builder/txt.js");
const { CONTENT } = await import("../pc/builder/content.js");
const { renderCard } = await import("../pc/builder/card.js");
const { randomBuild } = await import("../pc/builder/random.js");

// ---------- helpers ----------
// A known-good build used as a test fixture (the builder itself starts empty).
const SAMPLE = {
    cpu: { id: "amd-ryzen-7-9800x3d" }, board: { id: "asus-tuf-gaming-b850-plus-wifi" },
    ram: { id: "corsair-vengeance-rgb-ddr5-32gb-6000-cl30" }, drive1: { id: "corsair-mp600-pro-2tb" },
    drive2: null, drive3: null, gpu: { id: "nvidia-geforce-rtx-5070-fe" }, cooler: { id: "corsair-a115" },
    psu: { id: "corsair-rm850x" }, case: { id: "corsair-frame-4000d-rs-argb" }, fans: { id: "fans-3x120" },
};
const specsOf = (st) => Object.fromEntries(SLOTS.map((s) => {
    const p = st[s.key];
    return [s.key, !p ? null : p.id === "none" ? "none" : p.id === "custom" ? p.specs : PART_BY_ID.get(p.id).specs];
}));
const check = (over = {}) => checkBuild(specsOf({ ...SAMPLE, ...over }));
const statuses = (res, st) => res.filter((r) => r.status === st).map((r) => r.text);
const has = (res, st, re) => res.some((r) => r.status === st && re.test(r.text));

// ---------- data ----------
test("every part's specs are complete and valid for its category", () => {
    for (const p of PARTS) assert.deepEqual({ ...specErrors(p.cat, p.specs) }, {}, p.id);
});

test("part ids are unique and every part has a known category", () => {
    assert.equal(new Set(PARTS.map((p) => p.id)).size, PARTS.length);
    const cats = new Set(SLOTS.map((s) => s.cat));
    for (const p of PARTS) assert.ok(cats.has(p.cat), p.id);
});

test("every real part cites the maker's own https page and the date it was checked", () => {
    assert.equal(PRODUCTS.length, 18);
    for (const p of PRODUCTS) {
        assert.equal(p.kind, "product");
        const host = new URL(p.source.url).hostname;
        assert.equal(new URL(p.source.url).protocol, "https:", p.id);
        assert.match(host, /(^|\.)(amd|intel|nvidia|asus|corsair)\.com$/, `${p.id}: ${host}`);
        assert.match(p.source.checked, /^\d{4}-\d{2}-\d{2}$/);
    }
    for (const p of GENERIC) assert.equal(p.source, null);
});

test("every card stat links to an explanation that exists in the Learn content", () => {
    for (const [cat, fields] of Object.entries(FIELDS)) {
        assert.ok(CONTENT[cat], `content for ${cat}`);
        for (const f of fields) if (f.learn) assert.ok(CONTENT[cat].specs[f.learn], `${cat}.${f.key} -> "${f.learn}"`);
    }
});

test("every texture the stylesheet uses exists", () => {
    const css = readFileSync(new URL("../pc/pc.css", import.meta.url), "utf8");
    const urls = [...css.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]);
    assert.ok(urls.length >= 20);
    for (const u of urls) assert.ok(existsSync(new URL(`../pc/${u}`, import.meta.url)), u);
});

// ---------- rules ----------
test("the starting sample build passes every check", () => {
    const r = check();
    assert.deepEqual(statuses(r, "fail"), []);
    assert.deepEqual(statuses(r, "warn"), []);
    assert.deepEqual(statuses(r, "todo"), []);
});

test("socket and memory mismatches are refused", () => {
    assert.ok(has(check({ cpu: { id: "intel-core-ultra-7-265k" } }), "fail", /needs socket LGA 1851.*has AM5/));
    assert.ok(has(check({ ram: { id: "ram-ddr4-2x16" } }), "fail", /memory is DDR4 but the board takes DDR5/));
    assert.ok(has(check({ cpu: { id: "cpu-6c-am4" }, board: { id: "board-am5-atx" } }), "fail", /only works with DDR4/));
    assert.ok(has(check({ ram: { id: "ram-ddr5-4x16" }, board: { id: "asus-rog-strix-b850-i-gaming-wifi" } }), "fail", /4 sticks but the board has 2/));
});

test("a cooler that doesn't list the socket is a warning, not a refusal", () => {
    const r = check({ cpu: { id: "intel-core-ultra-7-265k" }, board: { id: "asus-prime-z890-p-wifi" } });
    assert.ok(has(r, "warn", /doesn't list socket LGA 1851/));
    assert.ok(!r.some((x) => x.status === "fail" && /cooler/.test(x.text)));
});

test("board size, card length and card thickness are checked against the case", () => {
    assert.ok(has(check({ case: { id: "corsair-2000d-airflow" } }), "fail", /ATX board does not fit/));
    const itx = { board: { id: "asus-rog-strix-b850-i-gaming-wifi" }, case: { id: "corsair-2000d-airflow" },
        psu: { id: "corsair-sf750" }, cooler: { id: "corsair-nautilus-360-rs" } };
    assert.ok(has(check({ ...itx, gpu: { id: "asus-tuf-rx9070xt-o16g-gaming" } }), "fail", /3\.125 slots thick.*4 slot openings.*has 3/));
    assert.ok(!has(check({ ...itx }), "fail", /slots thick/));                    // the 2-slot Founders Edition fits
    assert.ok(has(check({ gpu: { id: "gpu-top-3fan" }, case: { id: "case-sff" } }), "fail", /357 mm long; the case fits 320/));
});

test("cooler height: a refusal over the limit, a warning under 5 mm, fine otherwise", () => {
    assert.ok(has(check({ case: { id: "case-sff" }, board: { id: "board-am5-itx" } }), "fail", /165 mm tall; the case fits 70/));
    const tight = check({ board: { id: "asus-rog-strix-b850-i-gaming-wifi" }, case: { id: "corsair-2000d-airflow" }, psu: { id: "corsair-sf750" } });
    assert.ok(has(tight, "warn", /0 mm to spare/));
    assert.ok(has(check(), "ok", /5 mm to spare/));
});

test("radiator and power supply size are checked against the case", () => {
    assert.ok(has(check({ cooler: { id: "cooler-aio-360" }, case: { id: "case-compact" }, board: { id: "board-am5-matx" } }), "fail", /no place for a 360 mm radiator/));
    assert.ok(has(check({ psu: { id: "corsair-sf750" } }), "fail", /SFX power supply does not fit the case/));
});

test("power: a refusal under the estimate, a warning without headroom", () => {
    const b = specsOf({ ...SAMPLE, gpu: { id: "gpu-top-3fan" }, psu: { id: "psu-550-atx" } });
    assert.equal(estimateWatts(b), 120 + 575 + 50 + 10);
    assert.ok(has(checkBuild(b), "fail", /about 755 W at full load, more than this 550 W/));
    assert.ok(has(check({ psu: { id: "corsair-rm750e" }, gpu: { id: "asus-tuf-rx9070xt-o16g-gaming" } }), "warn", /Choose at least 850 W/));
    // the higher of base and maximum power counts for the estimate
    const intel = specsOf({ ...SAMPLE, cpu: { id: "intel-core-ultra-7-265k" }, board: { id: "asus-prime-z890-p-wifi" } });
    assert.equal(estimateWatts(intel), 250 + 250 + 50 + 10);
});

test("drives: M.2 slots, SATA ports and bays; unlisted bays are a note", () => {
    const three = { drive1: { id: "ssd-m2-1tb" }, drive2: { id: "ssd-m2-2tb" }, drive3: { id: "ssd-m2-4tb" } };
    assert.ok(has(check({ ...three, board: { id: "asus-rog-strix-b850-i-gaming-wifi" }, case: { id: "corsair-2000d-airflow" } }), "fail", /2 M\.2 slots, not enough for 3/));
    assert.ok(has(check({ drive2: { id: "hdd-4tb" } }), "info", /drive bays aren't listed/));
    assert.ok(has(check({ drive2: { id: "hdd-4tb" }, case: { id: "case-sff" }, board: { id: "board-am5-itx" } }), "fail", /0 3\.5-inch bays/));
});

test("no built-in graphics and no graphics card is refused", () => {
    assert.ok(has(check({ cpu: { id: "cpu-6c-am4" }, board: { id: "board-am4-atx" }, ram: { id: "ram-ddr4-2x16" }, gpu: { id: "none" } }), "fail", /no built-in graphics/));
    assert.ok(!has(check({ gpu: { id: "none" } }), "fail", /built-in graphics/));
});

test("optional values that aren't listed give notes, never refusals", () => {
    const r = check({ cooler: { id: "corsair-nautilus-360-rs" } });
    assert.ok(has(r, "info", /doesn't give a wattage rating/));
    const g = { ...blankSpecs("gpu"), lengthMm: 300, powerW: 250, psuW: 650 };   // thickness left empty
    assert.ok(has(check({ gpu: { id: "custom", name: "", specs: g } }), "info", /thickness isn't listed/));
});

test("missing required parts are to-dos", () => {
    const r = checkBuild(specsOf(Object.fromEntries(SLOTS.map((s) => [s.key, null]))));
    assert.equal(statuses(r, "todo").length, SLOTS.filter((s) => s.required).length);
});

test("field checks: numbers, ranges, decimals, optional, lists", () => {
    const cores = FIELDS.cpu.find((f) => f.key === "cores");
    assert.equal(fieldError(cores, 8), "");
    assert.match(fieldError(cores, 0), /Between 1 and 256/);
    assert.match(fieldError(cores, 2.5), /Whole numbers/);
    assert.match(fieldError(cores, Number.NaN), /Numbers only/);
    assert.match(fieldError(cores, null), /Enter a number/);
    const slots = FIELDS.gpu.find((f) => f.key === "slots");
    assert.equal(fieldError(slots, 3.125), "");
    assert.equal(fieldError(slots, null), "");                                   // optional
    const sockets = FIELDS.cooler.find((f) => f.key === "sockets");
    assert.match(fieldError(sockets, []), /Tick at least one/);
    assert.match(fieldError(sockets, ["AM9"]), /Only:/);
});

// ---------- .txt files ----------
test("a build survives saving and loading: real, generic, none and own parts", () => {
    const st = { ...SAMPLE, drive2: { id: "hdd-4tb" }, fans: { id: "none" },
        gpu: { id: "custom", name: "My card", specs: { ...blankSpecs("gpu"), lengthMm: 310, slots: 2.75, powerW: 280, psuW: 700 } } };
    const txt = toTxt(st);
    assert.match(txt, new RegExp(`^format: ${FORMAT}\\nversion: 1\\n`));
    const back = parseTxt(txt);
    assert.ok(back.ok);
    assert.deepEqual(back.notes, []);
    for (const s of SLOTS) assert.deepEqual(JSON.parse(JSON.stringify(back.state[s.key])), JSON.parse(JSON.stringify(st[s.key])), s.key);
});

test("the saved file is readable and never contains NaN", () => {
    const st = { ...SAMPLE, cpu: { id: "custom", name: "", specs: { ...blankSpecs("cpu"), cores: Number.NaN } } };
    const txt = toTxt(st);
    assert.doesNotMatch(txt, /NaN/);
    assert.match(txt, /# Processor \(CPU\): AMD|# Motherboard: ASUS/);
});

test("hostile or broken files are refused or cleaned, never trusted", () => {
    assert.equal(parseTxt("").ok, false);
    assert.equal(parseTxt("hello").ok, false);
    assert.equal(parseTxt(`format: ${FORMAT}\nversion: 9`).ok, false);                // newer version
    assert.equal(parseTxt("x".repeat(70000)).ok, false);                             // too big
    assert.equal(parseTxt(`format: ${FORMAT}\n` + "a\n".repeat(3000)).ok, false);    // too many lines
    const r = parseTxt([`format: ${FORMAT}`, "version: 1", "__proto__: x", "constructor.prototype: 1", "cpu: toString",
        "board: custom", "board.socket: AM9", "board.ramSlots: 1e9", "board.__proto__: 1", "case: cpu-8c-am5",
        "gpu: none", "fans: <img src=x onerror=alert(1)>", "drive1: ssd-m2-1tb", "drive1: hdd-4tb"].join("\n"));
    assert.ok(r.ok);
    assert.equal(r.state.cpu, null);                    // not a real part id
    assert.equal(r.state.case, null);                   // an id from another category
    assert.equal(r.state.fans, null);                   // markup is just an unknown id
    assert.deepEqual(r.state.gpu, { id: "none" });
    assert.deepEqual(r.state.drive1, { id: "ssd-m2-1tb" });   // the first line wins
    assert.equal(r.state.board.specs.socket, "AM4");          // bad value -> left at the blank default
    assert.equal(r.state.board.specs.ramSlots, null);
    assert.equal(Object.getPrototypeOf(r.state), null);
    assert.equal(({}).polluted, undefined);
    assert.ok(r.notes.length > 0 && r.notes.length <= 20);
});

test("1,500 random files never crash the loader, the rules or the saver", () => {
    let seed = 7;
    const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
    const keys = ["cpu", "board", "gpu", "fans", "case", "drive2", "x", "__proto__", "constructor"];
    const subs = ["", ".slots", ".lengthMm", ".size", ".count", ".name", ".__proto__", ".boards", ".sockets"];
    const vals = ["custom", "none", "corsair-a115", "3.125", "1e9", "AM5", "", "-1", "ATX, Mini-ITX", "\u0000\u001b[31m", "9".repeat(400)];
    for (let i = 0; i < 1500; i++) {
        let s = `format: ${FORMAT}\nversion: 1\n`;
        for (let j = 0; j < 12; j++) s += `${keys[rnd(keys.length)]}${subs[rnd(subs.length)]}: ${vals[rnd(vals.length)]}\n`;
        const r = parseTxt(s);
        if (!r.ok) continue;
        checkBuild(specsOf(r.state));
        assert.doesNotMatch(toTxt(r.state), /NaN|undefined/);
    }
});

// ---------- cards ----------
test("every part and every empty slot renders a card", () => {
    for (const p of PARTS) {
        const c = renderCard(p.cat, p);
        assert.equal(c.tagName, "ARTICLE");
        assert.doesNotMatch(c.textContent, /null|NaN|undefined/, p.id);
    }
    for (const cat of new Set(SLOTS.map((s) => s.cat))) renderCard(cat, null);
});

test("an unfinished own part's card shows no placeholder junk", () => {
    for (const cat of new Set(SLOTS.map((s) => s.cat))) {
        const c = renderCard(cat, { kind: "custom", name: "My own part", specs: blankSpecs(cat), source: null, note: "" });
        assert.doesNotMatch(c.textContent, /null|NaN|undefined/, cat);
    }
});

test("a real part's card names its source and checked date", () => {
    const c = renderCard("cpu", PART_BY_ID.get("intel-core-ultra-7-265k"));
    assert.match(c.textContent, /Intel® Core™ Ultra 7 processor 265K/);
    assert.match(c.textContent, /intel\.com, checked 2026-11-24/);
});

test("shapes: every part maps to a box shape the stylesheet defines", () => {
    const css = readFileSync(new URL("../pc/pc.css", import.meta.url), "utf8");
    for (const p of PARTS) assert.match(css, new RegExp(`\\.shape-${shapeFor(p.cat, p.specs)}\\s*\\{`), p.id);
});

// ---------- random build ----------
// A seeded generator, so a failure can be replayed.
const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

test("random builds fill every required slot and pass every check, with no warnings", () => {
    for (let i = 1; i <= 500; i++) {
        const st = randomBuild(seeded(i));
        for (const s of SLOTS) if (s.required) assert.ok(st[s.key]?.id, `seed ${i}: ${s.key} empty`);
        for (const s of SLOTS) if (st[s.key]) assert.ok(st[s.key].id === "none" || PART_BY_ID.has(st[s.key].id), `seed ${i}: ${s.key}`);
        const bad = checkBuild(specsOf(st)).filter((r) => ["fail", "warn", "todo"].includes(r.status));
        assert.deepEqual(bad, [], `seed ${i}`);
    }
});

test("random builds reach every part, and save and load like any build", () => {
    const seen = new Set();
    for (let i = 1; i <= 1500; i++) {
        const st = randomBuild(seeded(i));
        for (const v of Object.values(st)) if (v && v.id !== "none") seen.add(v.id);
        if (i <= 50) {
            const back = parseTxt(toTxt(st));
            assert.ok(back.ok, `seed ${i}`);
            assert.deepEqual(specsOf(back.state), specsOf(st), `seed ${i}`);
        }
    }
    assert.deepEqual(PARTS.map((p) => p.id).filter((id) => !seen.has(id)), []);
});

test("cooler: compared with the processor's maximum power when one is given", () => {
    const b = specsOf({ ...SAMPLE, cpu: { id: "cpu-16c-am5" }, cooler: { id: "cooler-aio-240" } });
    assert.ok(has(checkBuild(b), "warn", /rated for 250 W/) === false);
    const hot = specsOf({ ...SAMPLE, cpu: { id: "cpu-16c-am5" }, cooler: { id: "cooler-tower-155" } });
    assert.ok(has(checkBuild(hot), "warn", /rated for 180 W and the processor gives off up to 230 W/));
});
