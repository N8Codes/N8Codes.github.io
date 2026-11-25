// PC builder app: the 3D stage is the page. Click a part (or a dashed slot) to
// open its card view (the card, with a picker above it; the card's (i) opens the
// details beside it). "Together" puts the parts together; when everything fits
// it also closes the case and stands it up, then shows the build's card
// collection. The DOM is built with createElement and textContent only: nothing
// from the part lists or an imported file is ever parsed as markup.

import { SLOTS, FIELDS, PART_BY_ID, partsFor, blankSpecs, shapeFor } from "./data.js";
import { checkBuild, specErrors, fieldError, applies } from "./rules.js";
import { toTxt, parseTxt } from "./txt.js";
import { CONTENT } from "./content.js";
import { renderCard, partBox } from "./card.js";
import { randomBuild } from "./random.js";

const $ = id => document.getElementById(id);
const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const slotByKey = new Map(SLOTS.map(s => [s.key, s]));
const SHORT = { cpu: "Processor", board: "Motherboard", ram: "Memory", drive1: "Drive 1", drive2: "Drive 2",
    drive3: "Drive 3", gpu: "Graphics card", cooler: "Cooler", psu: "Power supply", case: "Case", fans: "Case fans" };

// The builder starts empty: every slot is a dashed outline to click.
const emptyBuild = () => Object.fromEntries(SLOTS.map(s => [s.key, null]));
let state = emptyBuild();
const customs = Object.create(null);  // slotKey -> { name, specs }, kept while switching away
let dirty = false;
let results = [];
let panelFor = null;                  // slot key, "checks", or null
let opener = null;
let showPassed = false;
const view = { mode: "apart", yaw: -45, pitch: 60, zoom: 1, panX: 0, panY: 0 };
const ZOOM_MIN = 0.6, ZOOM_MAX = 3.5;

// ---------- state ----------
function partOf(key) {
    const p = state[key];
    if (!p || p.id === "none") return null;
    if (p.id === "custom") return { kind: "custom", name: p.name || "My own part", specs: p.specs, source: null, note: "" };
    return PART_BY_ID.get(p.id) ?? null;
}
function specsOf(key) {
    const p = state[key];
    if (!p) return null;
    if (p.id === "none") return "none";
    if (p.id === "custom") return Object.keys(specErrors(slotByKey.get(key).cat, p.specs)).length ? null : p.specs;
    return PART_BY_ID.get(p.id)?.specs ?? null;
}
function currentBuild() {
    const b = {};
    for (const s of SLOTS) b[s.key] = specsOf(s.key);
    return b;
}

function onBeforeUnload(e) { e.preventDefault(); }
function setDirty(d) {
    dirty = d;
    if (d) addEventListener("beforeunload", onBeforeUnload);
    else removeEventListener("beforeunload", onBeforeUnload);
}

// A short toast that goes after a few seconds; only for things the user did.
let toastTimer = 0;
function toast(msg, isError = false) {
    const t = $("status");
    t.textContent = msg;
    t.classList.toggle("err", isError);
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), isError ? 6000 : 3500);
}

// Menus (File, Parts) open under their button. The (i) bubbles position
// themselves with CSS (pc/pc.css).
document.addEventListener("beforetoggle", e => {
    const pop = e.target;
    if (!pop.classList?.contains("menu")) return;
    const btn = document.querySelector(`[popovertarget="${CSS.escape(pop.id)}"]`);
    if (!btn) return;
    btn.setAttribute("aria-expanded", String(e.newState === "open"));
    if (e.newState !== "open") return;
    const r = btn.getBoundingClientRect();
    const w = Math.min(pop.classList.contains("start") ? 230 : 210, innerWidth - 16);
    const left = pop.classList.contains("start") ? r.left : r.right - w;
    pop.style.width = `${w}px`;
    pop.style.left = `${scrollX + Math.max(8, Math.min(left, innerWidth - w - 8))}px`;
    pop.style.top = `${scrollY + r.bottom + 8}px`;
}, true);

// ---------- checks ----------
const ORDER = { fail: 0, warn: 1, todo: 2, info: 3, ok: 4 };
const needs = r => r.status === "fail" || r.status === "warn" || r.status === "todo";
function computeResults() {
    // An unfinished own part reads as empty to the rules, which would also say
    // "Choose ..." for it: keep only the "Finish entering" to-do.
    const unfinished = new Set(SLOTS.filter(s => state[s.key]?.id === "custom" && !specsOf(s.key)).map(s => s.key));
    const out = checkBuild(currentBuild()).filter(r => !(r.status === "todo" && r.parts.length === 1 && unfinished.has(r.parts[0])));
    for (const s of SLOTS) {
        const p = state[s.key];
        if (p?.id === "custom" && Object.keys(specErrors(s.cat, p.specs)).length)
            out.push({ status: "todo", text: `Finish entering your own ${SHORT[s.key].toLowerCase()}.`, parts: [s.key] });
    }
    return out.sort((a, b) => ORDER[a.status] - ORDER[b.status]);
}
const count = st => results.filter(r => r.status === st).length;

function renderResultList(list, items, withFix) {
    list.replaceChildren();
    const marks = { ok: "✓", warn: "!", fail: "✕", todo: "○", info: "i" };
    const names = { ok: "Fits", warn: "Warning", fail: "Problem", todo: "To do", info: "Note" };
    for (const r of items) {
        const li = el("li", `r-${r.status}`);
        const m = el("span", "mark", marks[r.status]);
        m.setAttribute("aria-hidden", "true");
        const t = el("span");
        t.append(el("span", "visually-hidden", `${names[r.status]}: `), document.createTextNode(r.text));
        if (withFix && needs(r)) {
            const fix = el("span", "fix");
            for (const k of new Set(r.parts)) {
                const b = el("button", null, SHORT[k]);
                b.type = "button";
                b.addEventListener("click", () => openPanel(k, $("verdict")));
                fix.append(b);
            }
            t.append(fix);
        }
        li.append(m, t);
        list.append(li);
    }
}

// ---------- everything that follows from the build ----------
function update() {
    results = computeResults();
    const fails = count("fail"), todos = count("todo"), warns = count("warn");
    const v = $("verdict");
    v.textContent = fails ? `✕ ${fails} problem${fails > 1 ? "s" : ""}` : todos ? `${todos} to pick`
        : warns ? `! ${warns} warning${warns > 1 ? "s" : ""}` : "✓ Fits";
    v.className = `chip ${fails ? "bad" : todos ? "" : warns ? "warn" : "ok"}`;
    if (view.mode === "finished" && (fails || todos)) userSetMode("together");   // a closed case only while everything fits
    $("view-together").title = fails || todos ? "Puts the parts together; the case closes once everything fits" : "Put it together, close the case and stand it up";
    renderStage(currentBuild());
    renderMenu();
    if (panelFor === "checks") {
        const passed = results.filter(r => !needs(r));
        renderResultList($("panel-results"), showPassed ? results : results.filter(needs), true);
        const more = $("panel-more");
        more.hidden = !passed.length;
        more.textContent = showPassed ? "Hide passed checks" : `Show passed checks (${passed.length})`;
        more.setAttribute("aria-expanded", String(showPassed));
    } else if (panelFor && $("panel-results")) {
        const mine = results.filter(r => needs(r) && r.parts.includes(panelFor));
        renderResultList($("panel-results"), mine, false);
        $("panel-results").closest(".issues").hidden = !mine.length;
        markIssues();
    }
    if (!$("collection").hidden) renderCollection();
}

// ---------- stage ----------
function piece(slotKey, slotCls, shape, cat, label, extra = "", specs = null) {
    const d = partBox(cat, specs, shape);
    d.className = `part slot-${slotCls} shape-${shape} cat-${cat} ${extra}`.trim();
    d.dataset.slot = slotKey;
    if (label) d.append(el("span", "tag", label));
    if (slotKey === panelFor) d.classList.add("selected");
    return d;
}

function renderStage(build) {
    const rig = $("rig");
    rig.replaceChildren();
    // Smaller boards move the parts that sit on them (anchors in pc/pc.css).
    $("stage").classList.toggle("b-matx", build.board?.size === "Micro-ATX");
    $("stage").classList.toggle("b-itx", build.board?.size === "Mini-ITX");
    const bad = new Set(results.filter(r => r.status === "fail").flatMap(r => r.parts));
    const flag = k => (bad.has(k) ? "bad" : "");
    const ghost = (k, slot, shape, cat, what) => {
        rig.append(piece(k, slot, shape, cat, `+ ${what}`, "ghost"));
    };

    if (build.case) rig.append(piece("case", "case", "case", "case", "Case", `case-box ${flag("case")}`));
    else ghost("case", "case", "case", "case", "Case");

    if (build.fans && build.fans !== "none") {
        const n = Math.min(build.fans.count, 3);
        ["fan1", "fan2", "fan3"].slice(0, n).forEach((s, i) => rig.append(piece("fans", s, "fan", "fans", "Case fans", `${flag("fans")} ${i ? "twin" : ""}`)));
    } else if (build.fans !== "none") ghost("fans", "fan1", "fan", "fans", "Case fans");

    if (build.board) rig.append(piece("board", "board", shapeFor("board", build.board), "board", "Motherboard", flag("board")));
    else ghost("board", "board", "board-atx", "board", "Motherboard");

    if (build.cpu) rig.append(piece("cpu", "cpu", "cpu", "cpu", "Processor", flag("cpu")));
    else ghost("cpu", "cpu", "cpu", "cpu", "Processor");

    if (build.ram) {
        const slots = build.board?.ramSlots === 2 ? ["ram2", "ram4"] : ["ram1", "ram2", "ram3", "ram4"];
        const n = Math.min(build.ram.sticks, slots.length);
        const use = n === 2 && slots.length === 4 ? ["ram2", "ram4"] : slots.slice(0, n);
        use.forEach((s, i) => rig.append(piece("ram", s, "ram", "ram", "Memory", `${flag("ram")} ${i < use.length - 1 ? "twin" : ""}`)));
    } else ghost("ram", "ram2", "ram", "ram", "Memory");

    const m2Slots = ["m2a", "m2b", "m2c"], sataSlots = ["drive1", "drive2", "drive3"];
    let emptyDrive = null;
    for (const k of ["drive1", "drive2", "drive3"]) {
        const d = build[k];
        if (!d) { emptyDrive ??= k; continue; }
        const shape = shapeFor("storage", d);
        const slot = shape === "m2" ? m2Slots.shift() : sataSlots.shift();
        if (slot) rig.append(piece(k, slot, shape, "storage", shape === "m2" ? "M.2 drive" : "Drive", flag(k)));
    }
    if (emptyDrive && m2Slots.length) ghost(emptyDrive, m2Slots[0], "m2", "storage", "Drive");

    if (build.cooler) {
        rig.append(piece("cooler", "cooler", shapeFor("cooler", build.cooler), "cooler", "Cooler", flag("cooler"), build.cooler));
        if (build.cooler.type !== "Air")
            rig.append(piece("cooler", "rad", build.cooler.radiatorMm === "360" ? "rad-360" : "rad-240", "cooler", "Radiator", flag("cooler")));
    } else ghost("cooler", "cooler", "cooler-tower", "cooler", "Cooler");

    if (build.gpu && build.gpu !== "none") rig.append(piece("gpu", "gpu", shapeFor("gpu", build.gpu), "gpu", "Graphics card", flag("gpu"), build.gpu));
    else if (build.gpu !== "none") ghost("gpu", "gpu", "gpu-3fan", "gpu", "Graphics card");

    if (build.psu) rig.append(piece("psu", "psu", shapeFor("psu", build.psu), "psu", "Power supply", flag("psu")));
    else ghost("psu", "psu", "psu-atx", "psu", "Power supply");
}

// ---------- view: modes, turning, zoom ----------
function applyAngles() {
    const s = $("stage").style;
    s.setProperty("--yaw", `${view.yaw}deg`);
    s.setProperty("--pitch", `${view.pitch}deg`);
    s.setProperty("--zoom", String(view.zoom));
    s.setProperty("--px", `${view.panX}px`);
    s.setProperty("--py", `${view.panY}px`);
}
// Zoom so the point under (clientX, clientY) stays put; without a point, the centre.
function zoomTo(z1, clientX, clientY) {
    const z0 = view.zoom;
    z1 = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z1));
    const r = $("stage").getBoundingClientRect();
    const px = clientX === undefined ? 0 : clientX - (r.left + r.width / 2);
    const py = clientY === undefined ? 0 : clientY - (r.top + r.height / 2);
    view.panX = px - (px - view.panX) * (z1 / z0);
    view.panY = py - (py - view.panY) * (z1 / z0);
    view.zoom = z1;
    clampPan();
    applyAngles();
}
// Keep the computer reachable: never pan it entirely out of the frame.
function clampPan() {
    const r = $("stage").getBoundingClientRect();
    const mx = r.width * 0.5 * Math.max(1, view.zoom), my = r.height * 0.5 * Math.max(1, view.zoom);
    view.panX = Math.min(mx, Math.max(-mx, view.panX));
    view.panY = Math.min(my, Math.max(-my, view.panY));
}
function animateTurn() {
    if (reducedMotion) return;
    const st = $("stage");
    st.classList.add("turning");
    clearTimeout(animateTurn.t);
    animateTurn.t = setTimeout(() => st.classList.remove("turning"), 850);
}
function setMode(mode) {
    view.mode = mode;
    const st = $("stage");
    st.classList.toggle("exploded", mode === "apart");
    st.classList.toggle("closed", mode === "finished");
    st.classList.toggle("standing", mode === "finished");
    if (mode !== "finished") st.classList.remove("powered");
    $("view-apart").setAttribute("aria-pressed", String(mode === "apart"));
    $("view-together").setAttribute("aria-pressed", String(mode !== "apart"));   // together, open or finished
}
let finaleRun = 0;
function userSetMode(mode) {
    finaleRun++;
    setMode(mode);
}

// Together: when everything fits, the parts come together, the case closes and
// the tower stands up, then the cards appear; otherwise it stays open on the bench.
async function together() {
    if (count("fail") || count("todo")) { userSetMode("together"); return; }
    if (view.mode === "finished") return;
    closePanel();
    const run = ++finaleRun;
    const st = $("stage");
    // Stopped by the user, or a part was changed meanwhile and no longer fits.
    const stopped = () => {
        if (run !== finaleRun) return true;
        if (!count("fail") && !count("todo")) return false;
        userSetMode("together");
        return true;
    };
    if (!reducedMotion) {
        if (view.mode !== "apart") { setMode("apart"); await sleep(1500); }
        if (stopped()) return;
        setMode("together");
        await sleep(2300);
        if (stopped()) return;
        st.classList.add("closed");                     // walls go solid, glass panel drops in
        await sleep(800);
        if (stopped()) return;
        Object.assign(view, { yaw: -30, pitch: 72 });
        animateTurn(); applyAngles();
    }
    setMode("finished");                                // stands up as a tower
    if (!reducedMotion) await sleep(1200);
    if (stopped()) return;
    st.classList.add("powered");
    showCollection(false);
}

// Drag turns the computer; Shift+drag, right-drag or middle-drag moves it; a
// press that doesn't move is a click on a part. Scroll zooms toward the pointer.
let drag = null, suppressClick = false;
function onPointerDown(e) {
    if (e.button > 2) return;
    drag = { x: e.clientX, y: e.clientY, yaw: view.yaw, pitch: view.pitch, panX: view.panX, panY: view.panY,
             pan: e.shiftKey || e.button !== 0, id: e.pointerId, moved: false };
}
function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 5) {
        drag.moved = true;
        $("stage").setPointerCapture(e.pointerId);
        $("stage").classList.add("dragging");
        $("stage").classList.remove("turning");
    }
    if (drag.moved && drag.pan) {
        view.panX = drag.panX + dx;
        view.panY = drag.panY + dy;
        clampPan();
        applyAngles();
    } else if (drag.moved) {
        view.yaw = drag.yaw - dx * 0.4;   // the side under the pointer follows the drag
        view.pitch = Math.min(88, Math.max(5, drag.pitch - dy * 0.3));
        applyAngles();
    }
}
function onPointerUp() {
    if (!drag) return;
    suppressClick = drag.moved;
    drag = null;
    $("stage").classList.remove("dragging");
}
function onStageClick(e) {
    if (suppressClick) { suppressClick = false; return; }
    const part = e.target.closest(".part");
    if (part?.dataset.slot) openPanel(part.dataset.slot, $("stage"));
}
// Scroll or trackpad over the view zooms (within the − / + limits).
function onStageWheel(e) {
    e.preventDefault();
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;   // lines -> pixels
    $("stage").classList.remove("turning");
    zoomTo(view.zoom * Math.exp(-dy * 0.0015), e.clientX, e.clientY);   // toward the pointer
}
function onStageKey(e) {
    const k = e.key;
    if (e.ctrlKey || e.metaKey || e.altKey) return;      // the browser's own shortcuts (page zoom, history)
    if (e.shiftKey && k.startsWith("Arrow")) {           // Shift+arrows move the computer in the frame
        view.panX += k === "ArrowLeft" ? -40 : k === "ArrowRight" ? 40 : 0;
        view.panY += k === "ArrowUp" ? -40 : k === "ArrowDown" ? 40 : 0;
        clampPan();
    } else if (k === "ArrowLeft" || k === "ArrowRight") view.yaw += k === "ArrowLeft" ? -15 : 15;
    else if (k === "ArrowUp" || k === "ArrowDown") view.pitch = Math.min(88, Math.max(5, view.pitch + (k === "ArrowUp" ? -8 : 8)));
    else if (k === "+" || k === "=") { e.preventDefault(); animateTurn(); zoomTo(view.zoom * 1.2); return; }
    else if (k === "-") { e.preventDefault(); animateTurn(); zoomTo(view.zoom / 1.2); return; }
    else return;
    e.preventDefault();
    animateTurn(); applyAngles();
}

// ---------- Parts menu: the keyboard and screen-reader way to every slot ----------
function buildMenu() {
    const host = $("strip");
    for (const s of SLOTS) {
        const b = el("button");
        b.type = "button";
        b.id = `strip-${s.key}`;
        b.setAttribute("aria-controls", "panel");
        b.addEventListener("click", () => {
            try { $("parts-menu").hidePopover(); } catch { /* already closed */ }
            openPanel(s.key, $("parts-btn"));
        });
        host.append(b);
    }
}
function renderMenu() {
    const bad = new Set(results.filter(r => r.status === "fail").flatMap(r => r.parts));
    for (const s of SLOTS) {
        const b = $(`strip-${s.key}`);
        const filled = !!specsOf(s.key);
        b.className = bad.has(s.key) ? "problem" : filled ? "filled" : "";
        b.replaceChildren(document.createTextNode(SHORT[s.key]),
            el("span", "visually-hidden", bad.has(s.key) ? " (problem)" : filled ? " (chosen)" : " (empty)"));
        b.setAttribute("aria-expanded", String(panelFor === s.key));
    }
    $("verdict").setAttribute("aria-expanded", String(panelFor === "checks"));
}

// ---------- panel ----------
function closePanel() {
    if (!panelFor) return;
    panelFor = null;
    $("panel").hidden = true;
    $("dim").hidden = true;
    $("panel").replaceChildren();
    update();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
}

function panelHead(title) {
    const head = el("div", "panel-head");
    const h = el("h2", null, title);
    h.id = "panel-title";
    h.tabIndex = -1;
    const x = el("button", "icon-btn", "×");
    x.type = "button";
    x.setAttribute("aria-label", "Close");
    x.addEventListener("click", closePanel);
    head.append(h, x);
    return [head, h];
}

function openPanel(key, from) {
    if (key !== "checks" && key !== "case" && view.mode === "finished") userSetMode("together");
    panelFor = key;
    opener = from;
    $("dim").hidden = false;
    const panel = $("panel");
    panel.replaceChildren();
    panel.hidden = false;
    const list = el("ul", "results");
    list.id = "panel-results";

    if (key === "checks") {
        panel.classList.remove("card-view");
        const [head, h] = panelHead("Checks");
        showPassed = false;
        const more = el("button", "more-btn");
        more.type = "button";
        more.id = "panel-more";
        more.setAttribute("aria-controls", "panel-results");
        more.addEventListener("click", () => { showPassed = !showPassed; update(); });
        panel.append(head, list, more);
        update();
        h.focus({ preventScroll: true });
    } else {
        // Card view: the picker centred on top, the card, × and (i) on the
        // corners, nothing underneath. The (i) slides out a side panel with this
        // part's problems, its "my own part" form and the full explanation.
        panel.classList.add("card-view");
        const slot = slotByKey.get(key);
        const title = el("h2", "visually-hidden", slot.label);
        title.id = "panel-title";
        const close = el("button", "corner-btn corner-close", "×");
        close.type = "button";
        close.setAttribute("aria-label", "Close");
        close.addEventListener("click", closePanel);
        const cardHost = el("div", "panel-card");
        cardHost.id = "panel-card";
        const side = el("aside", "cv-side");
        side.id = "panel-side";
        side.setAttribute("aria-label", `${slot.label}: details`);
        const sideHead = el("div", "side-head");
        const hide = el("button", "icon-btn side-close", "×");
        hide.type = "button";
        hide.setAttribute("aria-label", "Close the details");
        hide.addEventListener("click", () => { setSide(false); $("panel-info")?.focus({ preventScroll: true }); });
        sideHead.append(el("h3", null, CONTENT[slot.cat].name), hide);
        const issues = el("section", "side-sec issues");
        issues.append(el("h4", null, "Needs attention"), list);
        const own = el("section", "side-sec");
        own.id = "panel-own";
        side.append(sideHead, issues, own, learnBody(slot));
        const cardWrap = el("div", "cv-card");
        cardWrap.append(cardHost);
        panel.append(title, close, picker(slot), cardWrap, side);
        renderPanelCard(slot);
        renderOwn(slot);
        setSide(sideOpen || state[key]?.id === "custom");
        update();
        $("part-select").focus({ preventScroll: true });
    }
    if (matchMedia("(max-width: 760px)").matches) panel.scrollIntoView({ block: "nearest", behavior: reducedMotion ? "auto" : "smooth" });
}

// The side panel stays open as you move between parts, until you close it.
let sideOpen = false;
function setSide(open) {
    sideOpen = open;
    const side = $("panel-side"), btn = $("panel-info");
    if (!side) return;
    side.hidden = !open;
    btn?.setAttribute("aria-expanded", String(open));
}

// The card in the card view, with the (i) for the side panel in its type line.
function renderPanelCard(slot) {
    const host = $("panel-card");
    if (!host) return;
    const infoBtn = el("button", "info card-info", "i");
    infoBtn.type = "button";
    infoBtn.id = "panel-info";
    infoBtn.setAttribute("aria-controls", "panel-side");
    infoBtn.setAttribute("aria-expanded", String(sideOpen));
    infoBtn.setAttribute("aria-label", `About the ${CONTENT[slot.cat].name.toLowerCase()}: problems and details`);
    infoBtn.addEventListener("click", () => setSide(!sideOpen));
    host.replaceChildren(renderCard(slot.cat, partOf(slot.key), { infoButton: infoBtn }));
    markIssues();
}
// A red dot on the (i) when this part has a problem or a warning.
function markIssues() {
    const btn = $("panel-info");
    if (btn && panelFor) btn.classList.toggle("has-issues", results.some(r => (r.status === "fail" || r.status === "warn") && r.parts.includes(panelFor)));
}

// The side panel's explanation: short, labelled sections; the full text is
// one link away (the guide page).
function learnBody(slot) {
    const c = CONTENT[slot.cat];
    const frag = el("div", "learn");
    const sec = (title, ...nodes) => { const s = el("section", "side-sec"); s.append(el("h4", null, title), ...nodes); frag.append(s); };
    sec("What it is", el("p", null, c.lede));
    const specs = el("dl", "learn-specs");
    for (const [name, sp] of Object.entries(c.specs)) specs.append(el("dt", null, name), el("dd", null, sp.gist));
    sec("Key specs", specs);
    const cn = el("ul", "plain");
    for (const [n] of c.connects) cn.append(el("li", null, n));
    sec("Connects to", cn);
    const ck = el("ul");
    for (const t of c.check) ck.append(el("li", null, t));
    sec("Before you buy", ck);
    const page = el("a", "more-btn", "Full guide ↗");
    page.href = c.page;
    page.target = "_blank";
    page.rel = "noopener";
    frag.append(page);
    return frag;
}

// The part picker: a dropdown (grouped like a deck: real parts, generic
// examples, your own) with arrows that flip to the previous or next option.
function picker(slot) {
    const row = el("div", "picker");
    const sel = el("select");
    sel.id = "part-select";
    sel.setAttribute("aria-label", `Choose: ${slot.label}`);
    if (!slot.required || slot.noneLabel) sel.append(new Option(slot.noneLabel ?? "None", slot.noneLabel ? "none" : ""));
    else sel.append(new Option("Choose…", ""));
    const group = (label, parts) => {
        if (!parts.length) return;
        const g = el("optgroup");
        g.label = label;
        for (const p of parts) g.append(new Option(p.name, p.id));
        sel.append(g);
    };
    const all = partsFor(slot.cat);
    group("Real parts", all.filter(p => p.kind === "product"));
    group("Generic examples", all.filter(p => p.kind === "generic"));
    const own = el("optgroup");
    own.label = "Your own";
    own.append(new Option("My own part: type in its numbers", "custom"));
    sel.append(own);
    sel.value = state[slot.key]?.id ?? "";
    sel.addEventListener("change", () => pick(slot, sel.value));

    const step = d => {
        const opts = [...sel.options].filter(o => !(slot.required && !slot.noneLabel && o.value === ""));
        const i = opts.findIndex(o => o.value === sel.value);
        const next = opts[i < 0 ? (d > 0 ? 0 : opts.length - 1) : (i + d + opts.length) % opts.length];
        sel.value = next.value;
        pick(slot, next.value);
    };
    const prev = el("button", "icon-btn", "‹");
    prev.type = "button";
    prev.setAttribute("aria-label", "Previous option");
    prev.addEventListener("click", () => step(-1));
    const next = el("button", "icon-btn", "›");
    next.type = "button";
    next.setAttribute("aria-label", "Next option");
    next.addEventListener("click", () => step(1));
    row.append(prev, sel, next);
    return row;
}

function pick(slot, value) {
    if (value === "") state[slot.key] = null;
    else if (value === "none") state[slot.key] = { id: "none" };
    else if (value === "custom") {
        customs[slot.key] ??= { name: "", specs: blankSpecs(slot.cat) };
        state[slot.key] = { id: "custom", ...customs[slot.key] };
    } else state[slot.key] = { id: value };
    setDirty(true);
    renderPanelCard(slot);
    renderOwn(slot);
    if (value === "custom") setSide(true);
    update();
}

function renderOwn(slot) {
    const own = $("panel-own");
    own.replaceChildren();
    own.hidden = state[slot.key]?.id !== "custom";
    if (!own.hidden) own.append(el("h4", null, "Your numbers"), ownPartForm(slot));
}

// ---------- "my own part" form ----------
let infoSeq = 0;
function hintInfo(text, label) {
    const id = `hint-${++infoSeq}`;
    const b = el("button", "info", "i");
    b.type = "button";
    b.setAttribute("popovertarget", id);
    b.setAttribute("aria-label", label);
    const pop = el("span", "bubble", text);
    pop.id = id;
    pop.popover = "auto";
    return [b, pop];
}

function ownPartForm(slot) {
    const c = state[slot.key];
    const fs = el("fieldset", "own-part");
    fs.append(el("legend", null, "Your part"));
    const intro = el("p", "own-intro", "Copy each number from the maker's spec page. ");
    intro.append(...hintInfo("Nothing you type leaves your browser. Fields marked \"if listed\" can stay empty when the page doesn't give them.", "About entering your own part"));
    fs.append(intro);

    const nameWrap = el("div", "field");
    const nameLbl = el("label", null, "Name (optional)");
    const name = el("input");
    name.id = nameLbl.htmlFor = `own-${slot.key}-name`;
    name.maxLength = 60;
    name.value = c.name;
    name.addEventListener("input", () => { c.name = name.value; customs[slot.key].name = name.value; setDirty(true); renderPanelCard(slot); if (!$("collection").hidden) renderCollection(); });
    nameWrap.append(nameLbl, name);
    fs.append(nameWrap);

    const fieldEls = [];
    for (const f of FIELDS[slot.cat]) {
        const id = `own-${slot.key}-${f.key}`;
        const wrap = el("div", "field");
        const msg = el("p", "field-msg");
        msg.id = `${id}-msg`;
        msg.setAttribute("aria-live", "polite");
        const [hintBtn, hintPop] = hintInfo(f.hint, `Where to find: ${f.label}`);
        let control = null;
        if (f.type === "multi") {
            const group = el("fieldset", "checks-group");
            const lg = el("legend", null, f.label);
            group.append(lg, hintBtn, hintPop);   // outside the legend, so it isn't part of the group's name
            const box = el("div", "checks");
            for (const opt of f.options) {
                const l = el("label");
                const cb = el("input");
                cb.type = "checkbox";
                cb.value = opt;
                cb.checked = c.specs[f.key].includes(opt);
                cb.addEventListener("change", () => {
                    c.specs[f.key] = [...box.querySelectorAll("input:checked")].map(x => x.value);
                    after(f, msg, null);
                });
                l.append(cb, document.createTextNode(opt));
                box.append(l);
            }
            group.append(box);
            group.setAttribute("aria-describedby", msg.id);
            wrap.append(group, msg);
        } else {
            const lblRow = el("div", "label-row");
            const lbl = el("label", null, f.optional ? `${f.label} (if listed)` : f.label);
            lbl.htmlFor = id;
            lblRow.append(lbl, hintBtn, hintPop);
            if (f.type === "int" || f.type === "dec") {
                control = el("input");
                control.type = "number";
                control.inputMode = f.type === "int" ? "numeric" : "decimal";
                control.min = f.min; control.max = f.max; control.step = f.type === "int" ? 1 : 0.125;
                control.value = c.specs[f.key] ?? "";
                control.addEventListener("input", () => {
                    // Only a clean number is stored; anything else stays out of
                    // the build (and the saved file) and is explained here.
                    const raw = control.value.trim();
                    const ok = f.type === "int" ? /^\d{1,6}$/.test(raw) : /^\d{1,3}(\.\d{1,3})?$/.test(raw);
                    c.specs[f.key] = raw === "" || !ok ? null : Number(raw);
                    const typed = raw === "" || ok ? "" : f.type === "int" && /^\d*\.\d+$/.test(raw) ? "Whole numbers only."
                        : f.type === "dec" && /^\d+\.\d{4,}$/.test(raw) ? "Up to 3 decimals." : "Numbers only.";
                    after(f, msg, control, typed);
                });
            } else {
                control = el("select");
                const opts = f.type === "bool" ? [["no", "No"], ["yes", "Yes"]] : f.options.map(o => [o, o]);
                for (const [v, t] of opts) control.append(new Option(t, v));
                control.value = f.type === "bool" ? (c.specs[f.key] ? "yes" : "no") : c.specs[f.key];
                control.addEventListener("change", () => {
                    c.specs[f.key] = f.type === "bool" ? control.value === "yes" : control.value;
                    after(f, msg, control);
                    refreshVisibility();
                });
            }
            control.id = id;
            control.setAttribute("aria-describedby", msg.id);
            wrap.append(lblRow, control, msg);
        }
        fieldEls.push({ f, wrap, msg, control });
        fs.append(wrap);
    }
    function after(f, msg, control, typed = "") {
        customs[slot.key].specs = c.specs;
        const e = typed || fieldError(f, c.specs[f.key]);
        const empty = c.specs[f.key] === null;
        const shown = typed || (e && !((f.type === "int" || f.type === "dec") && empty) ? e : ""); // empty = still to fill in
        msg.textContent = shown;
        if (control) { if (shown) control.setAttribute("aria-invalid", "true"); else control.removeAttribute("aria-invalid"); }
        setDirty(true);
        renderPanelCard(slot);
        update();
    }
    function refreshVisibility() { for (const x of fieldEls) x.wrap.hidden = !applies(x.f, c.specs); }
    refreshVisibility();
    // Reopened (or loaded from a file): show stored values that are out of range.
    for (const x of fieldEls) {
        const e = fieldError(x.f, c.specs[x.f.key]);
        if (e && c.specs[x.f.key] !== null && !x.wrap.hidden) {
            x.msg.textContent = e;
            x.control?.setAttribute("aria-invalid", "true");
        }
    }
    return fs;
}

// ---------- the finished build: its card collection ----------
function renderCollection() {
    const host = $("collection-cards");
    host.replaceChildren();
    for (const s of SLOTS) {
        const part = partOf(s.key);
        if (!part) continue;
        // Grows on hover, opens large on click (same look as the Learn pages' cards).
        const card = renderCard(s.cat, part);
        card.classList.add("zoomable");
        const open = el("button", "tcard-open");
        open.type = "button";
        open.setAttribute("aria-label", `Enlarge the ${SHORT[s.key].toLowerCase()} card`);
        open.addEventListener("click", () => openZoom(s.cat, part, open));
        card.prepend(open);
        host.append(card);
    }
}

// The enlarged card, centred over a shaded page; click outside, Esc or × closes it.
let zoomFrom = null;
function openZoom(cat, part, from) {
    const z = $("card-zoom");
    const close = el("button", "zoom-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", () => z.hidePopover());
    z.replaceChildren(renderCard(cat, part), close);
    zoomFrom = from;
    z.showPopover();
    close.focus({ preventScroll: true });
}
function showCollection(scroll = true) {
    $("collection").hidden = false;
    renderCollection();
    if (scroll) $("collection").scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" });
}

// ---------- files ----------
function exportTxt() {
    const blob = new Blob([toTxt(state)], { type: "text/plain" });
    const a = el("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pc-build.txt";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setDirty(false);
}

async function importTxt(file) {
    if (!file) return;
    if (file.size > 64 * 1024) { toast("That file is too large to be a build list.", true); return; }
    if (dirty && !confirm("Loading a file replaces this build. Continue?")) return;
    let text;
    try { text = await file.text(); } catch { toast("That file couldn't be read.", true); return; }
    const res = parseTxt(text);
    if (!res.ok) { toast(res.error, true); return; }
    closePanel();
    state = res.state;
    for (const k of Object.keys(customs)) delete customs[k];
    for (const s of SLOTS) if (state[s.key]?.id === "custom") customs[s.key] = { name: state[s.key].name, specs: state[s.key].specs };
    setDirty(false);
    $("collection").hidden = true;
    userSetMode("apart");
    update();
    if (res.notes.length) toast("Loaded. Some lines or values couldn't be used: check the parts marked to finish.");
}

function startOver() {
    if (dirty && !confirm("Clear this build and start again?")) return;
    closePanel();
    state = emptyBuild();
    for (const k of Object.keys(customs)) delete customs[k];
    setDirty(false);
    $("collection").hidden = true;
    userSetMode("apart");
    update();
}

// Random build: every slot filled with parts that pass every check, shown
// apart (owner, 2026-11-24); Together assembles it.
function randomize() {
    if (dirty && !confirm("Replace this build with a random one?")) return;
    closePanel();
    state = randomBuild();
    for (const k of Object.keys(customs)) delete customs[k];
    setDirty(true);
    $("collection").hidden = true;
    userSetMode("apart");
    update();
}

// ---------- start ----------
buildMenu();
setMode("apart");
applyAngles();
update();

const stage = $("stage");
stage.addEventListener("pointerdown", onPointerDown);
stage.addEventListener("pointermove", onPointerMove);
stage.addEventListener("pointerup", onPointerUp);
stage.addEventListener("pointercancel", onPointerUp);
stage.addEventListener("click", onStageClick);
stage.addEventListener("keydown", onStageKey);
stage.addEventListener("wheel", onStageWheel, { passive: false });
stage.addEventListener("contextmenu", e => e.preventDefault());   // right-drag moves the view
$("dim").addEventListener("click", closePanel);
// Closing the enlarged card returns focus to the card it came from.
$("card-zoom").addEventListener("toggle", e => { if (e.newState === "closed" && zoomFrom?.isConnected) zoomFrom.focus({ preventScroll: true }); });
$("verdict").addEventListener("click", () => (panelFor === "checks" ? closePanel() : openPanel("checks", $("verdict"))));
$("view-apart").addEventListener("click", () => userSetMode("apart"));
$("view-together").addEventListener("click", together);
$("turn-left").addEventListener("click", () => { view.yaw -= 45; animateTurn(); applyAngles(); });
$("turn-right").addEventListener("click", () => { view.yaw += 45; animateTurn(); applyAngles(); });
$("zoom-out").addEventListener("click", () => { animateTurn(); zoomTo(view.zoom / 1.2); });
$("zoom-in").addEventListener("click", () => { animateTurn(); zoomTo(view.zoom * 1.2); });
$("reset-view").addEventListener("click", () => { Object.assign(view, { yaw: -45, pitch: 60, zoom: 1, panX: 0, panY: 0 }); animateTurn(); applyAngles(); });
const closeMenu = () => { try { $("file-menu").hidePopover(); } catch { /* already closed */ } };
$("export").addEventListener("click", () => { closeMenu(); exportTxt(); });
$("import").addEventListener("click", () => { closeMenu(); $("import-file").click(); });
$("import-file").addEventListener("change", e => { importTxt(e.target.files[0]); e.target.value = ""; });
$("start-over").addEventListener("click", () => { closeMenu(); startOver(); });
$("random-build").addEventListener("click", randomize);
$("show-cards").addEventListener("click", () => { closeMenu(); showCollection(); });
// Print: the collection only, at real card size (print rules in pc.css and pc/builder.css).
$("print-cards").addEventListener("click", () => { closeMenu(); $("collection").hidden = false; renderCollection(); print(); });
// Esc closes an open bubble first (the browser does that), then the panel.
document.addEventListener("keydown", e => { if (e.key === "Escape" && panelFor && !document.querySelector(":popover-open")) closePanel(); });
