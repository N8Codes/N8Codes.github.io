// Character sheets: the page shell shared by every game system.
// Holds the character, runs every edit through the system's rules, and handles import and export.
// It stores nothing unless the player turns on "Keep a copy in this browser" (File menu): then the
// character is kept in this browser's local storage, on this device only, and restored next visit.
// A system module provides: id, label, subtitle, schemaVersion, systemVersion, license, migrations,
// defaultCharacter(), sanitize(raw), toSaveData(c), derive(c), validate(c, d), randomCharacter(keep),
// toText(c, d), renderSheet(ctx), renderGuided(ctx), guidedSteps.

import { el } from "./ui.js";
import { decideEdit } from "./edits.js";
import { exportEnvelope, importEnvelope, ImportRefused, download, fileStem, MAX_FILE_BYTES } from "./files.js";

const STORE_PREFIX = "n8codes-sheets/";   // + system id → that system's kept character (an export file's text)
const KEEP_KEY = STORE_PREFIX + "keep";   // "1" while the switch is on

export function startApp(systems) {
  const byId = Object.fromEntries(systems.map((s) => [s.id, s]));
  const $ = (id) => document.getElementById(id);
  const root = $("sheet-root");

  const state = {
    system: systems[0],
    character: null,
    mode: "sheet",          // "sheet" (default) | "guided"
    step: 0,
    refused: {},            // field key → message from the last refused edit
    dirty: false,
    status: "",
  };

  // ---------- browser copy: only while the player has it switched on ----------
  const keeping = () => { try { return localStorage.getItem(KEEP_KEY) === "1"; } catch { return false; } };
  function saveLocal() {
    if (!keeping()) return;
    try { localStorage.setItem(STORE_PREFIX + state.system.id, exportEnvelope(state.system, state.character)); }
    catch { setStatus("Couldn't save the copy in this browser (storage is full or blocked). Export a file to keep this character."); }
  }
  /** The kept character, read as untrusted like any imported file. */
  function loadLocal(system) {
    if (!keeping()) return null;
    let text = null;
    try { text = localStorage.getItem(STORE_PREFIX + system.id); } catch { return null; }
    if (!text) return null;
    try {
      return checked(importEnvelope(text, system, byId), system);
    } catch {
      queueMicrotask(() => setStatus("The copy kept in this browser couldn't be read, so a new sheet was started."));
      return null;
    }
  }
  /** On: remember the switch and save now. Off: delete every kept character and the switch. */
  function setKeeping(on) {
    try {
      if (on) { localStorage.setItem(KEEP_KEY, "1"); saveLocal(); }
      else { for (const s of systems) localStorage.removeItem(STORE_PREFIX + s.id); localStorage.removeItem(KEEP_KEY); }
    } catch {
      setStatus("This browser won't let the page store anything, so nothing was kept.");
    }
  }

  /** A loaded character must survive a full rules run before it replaces the sheet. */
  function checked(character, system = state.system) {
    system.validate(character, system.derive(character));
    return character;
  }

  // ---------- after every change: keep the browser copy current, guard unsaved work ----------
  // Every change to the character goes through here, so the browser copy can't fall behind.
  // Leaving the page loses nothing while the copy is on, so the leave warning is only for when it's off.
  function onBeforeUnload(event) { event.preventDefault(); }
  function setDirty(dirty) {
    state.dirty = dirty;
    saveLocal();
    if (dirty && !keeping()) addEventListener("beforeunload", onBeforeUnload);
    else removeEventListener("beforeunload", onBeforeUnload);
  }
  // Replacing the character (New, Random, Import, another system) also replaces the browser copy, so ask either way.
  const confirmDiscard = (what) => !state.dirty || confirm(`This character has changes you haven't exported. ${what}`);

  // ---------- the edit pipeline ----------
  const derived = () => state.system.derive(state.character);
  /**
   * Apply an edit. keys: the field keys whose rules this edit touches (messages show at the first).
   * Unless Free edit is on, an edit that adds a rule break to those fields is refused and explained;
   * an edit that removes problems (or keeps them the same) always goes through, so an imported
   * character that breaks a rule can still be fixed.
   */
  function edit(keys, mutate, { render = true } = {}) {
    const list = Array.isArray(keys) ? keys : [keys];
    const prev = state.character;
    const next = structuredClone(prev);
    mutate(next);
    const verdict = decideEdit(state.system, prev, next, list);
    if (!verdict.accept) {
      state.refused[list[0]] = verdict.message;
      if (render) renderAll();
      return false;
    }
    for (const k of list) delete state.refused[k];
    state.character = next;
    setDirty(true);
    if (render) renderAll();
    return true;
  }
  /** For free text (names, notes): no rules to check, no re-render while typing. */
  function editText(mutate) {
    mutate(state.character);
    setDirty(true);
  }

  // ---------- rendering ----------
  function renderAll() {
    const active = document.activeElement?.id;
    try { draw(); } catch (e) {
      // A bug, not a rule: say so on the page and in the console rather than leaving it blank.
      console.error("Character sheet failed to draw", e);
      root.replaceChildren(el("p", { className: "import-err", role: "alert" },
        "Something went wrong drawing this sheet. Export JSON from the File menu to keep the character, then reload the page."));
    }
    if (active) document.getElementById(active)?.focus({ preventScroll: true });
  }

  function draw() {
    const c = state.character;
    const d = derived();
    const all = state.system.validate(c, d);
    const ctx = {
      c, d, all, free: c.freeEdit, step: state.step, edit, editText,
      setStep: (n) => { state.step = n; renderAll(); window.scrollTo({ top: root.offsetTop - 80 }); },
      messagesFor: (key) => [
        ...(state.refused[key] ? [{ text: state.refused[key], kind: "refused" }] : []),
        // The whole sheet shows rule problems only; choices still to make are listed in Guided mode.
        ...all.filter((p) => p.field === key && (p.severity === "error" || state.mode === "guided"))
          .map((p) => ({ text: p.message, kind: p.severity === "error" ? "error" : "todo" })),
      ],
      problemsMatching: (prefix) => all.filter((p) => p.field.startsWith(prefix)),
      setStatus,
      refresh: renderAll,   // redraw after a view-only change (nothing in the character changed)
    };
    root.replaceChildren(state.mode === "guided" ? state.system.renderGuided(ctx) : state.system.renderSheet(ctx));
    updateChrome(all);
  }

  /** A short confirmation that shows for a few seconds at the bottom, then goes. */
  let toastTimer = 0;
  function setStatus(text) {
    const t = $("toast");
    t.textContent = text;
    t.hidden = !text;
    clearTimeout(toastTimer);
    if (text) toastTimer = setTimeout(() => { t.hidden = true; }, 4000);
  }

  function updateChrome(all = state.lastProblems || []) {
    state.lastProblems = all;
    const c = state.character;
    $("mode-sheet").checked = state.mode === "sheet";
    $("mode-guided").checked = state.mode === "guided";
    $("free-edit").checked = c.freeEdit;
    document.body.classList.toggle("free-on", c.freeEdit);
    // One chip, only when a rule is broken; it opens Guided Review. Choices still to make get no hint
    // on the sheet (user, 2026-11-21): they're listed in Guided mode only.
    const errors = all.filter((p) => p.severity === "error").length;
    const ruleChip = $("rule-count");
    ruleChip.hidden = !errors;
    ruleChip.textContent = `${errors} rule ${errors === 1 ? "problem" : "problems"}`;
    $("keep-copy").checked = keeping();
    // Unsaved: an amber dot on File, and a word in the menu. Not shown while the browser copy keeps it.
    const unsaved = state.dirty && !keeping();
    $("unsaved-dot").hidden = !unsaved;
    $("file-btn").setAttribute("aria-label", unsaved ? "File (unsaved changes)" : "File");
    $("export-state").textContent = unsaved ? "unsaved changes" : "";
    for (const tab of document.querySelectorAll(".tab[data-system]")) {
      const on = tab.dataset.system === state.system.id;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
    }
    renderLicense(state.system.license);
  }

  /** The footer's license lines belong to the system on screen (CC-BY for 5E, the OGL for 3.5). Text only. */
  function renderLicense(license) {
    $("license-text").textContent = license.attribution;
    $("license-lines").replaceChildren(...(license.footer || []).map((t) => el("p", {}, t)));
    $("copyright-line").textContent = license.copyrightLine || "";
    const full = $("license-full");
    full.hidden = !license.fullText;
    $("license-full-text").textContent = license.fullText || "";
    $("license-full-name").textContent = license.name;
  }

  function showImportError(text) {
    const box = $("import-error");
    box.textContent = text;
    box.hidden = !text;
  }

  // ---------- systems ----------
  function selectSystem(system, { fromHash = false } = {}) {
    if (system !== state.system && !confirmDiscard("Switch game system anyway?")) return;
    state.system = system;
    state.character = loadLocal(system) ?? system.defaultCharacter();
    state.refused = {};
    state.step = 0;
    setDirty(false);
    if (!fromHash) history.replaceState(null, "", `#${system.id}`);
    renderAll();
  }
  // System tabs: only systems that work. No placeholder tab for systems not built yet (user, 2026-11-22).
  const picker = $("system-picker");
  picker.replaceChildren(...systems.map((s) => el("button", { type: "button", role: "tab", className: "tab", data: { system: s.id }, aria: { controls: "sheet-root" },
    on: { click: () => selectSystem(s) } }, s.label, el("small", {}, s.subtitle))));
  picker.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const tabs = [...picker.querySelectorAll(".tab[data-system]")];
    const i = tabs.findIndex((t) => t.dataset.system === state.system.id);
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    next.focus(); next.click();
  });

  // Popovers (the i bubble, the File menu) open under their button. CSSOM positioning, so the CSP allows it.
  for (const [btnId, popId] of [["about-btn", "about"], ["file-btn", "file-menu"]]) {
    const btn = $(btnId), pop = $(popId);
    // Positioned before it paints; its width comes from the CSS (--pop-width), capped to the screen.
    pop.addEventListener("beforetoggle", (e) => {
      btn.setAttribute("aria-expanded", String(e.newState === "open"));
      if (e.newState !== "open") return;
      const r = btn.getBoundingClientRect();
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const w = Math.min(parseFloat(getComputedStyle(pop).getPropertyValue("--pop-width")) * rem, innerWidth - 16);
      const left = popId === "file-menu" ? r.right - w : r.left;
      pop.style.width = `${w}px`;
      pop.style.left = `${Math.max(8, Math.min(left, innerWidth - w - 8))}px`;
      pop.style.top = `${r.bottom + 8}px`;
    });
    btn.setAttribute("aria-expanded", "false");
  }
  const closeMenu = () => { try { $("file-menu").hidePopover(); } catch { /* already closed */ } };
  const openReview = () => { state.mode = "guided"; state.step = state.system.guidedSteps.length - 1; renderAll(); };
  $("rule-count").addEventListener("click", openReview);

  // ---------- toolbar ----------
  $("mode-sheet").addEventListener("change", () => { state.mode = "sheet"; renderAll(); });
  $("mode-guided").addEventListener("change", () => { state.mode = "guided"; renderAll(); });
  $("free-edit").addEventListener("change", (e) => {
    const on = e.target.checked;
    state.character = { ...structuredClone(state.character), freeEdit: on };
    state.refused = {};
    setDirty(true); renderAll();
  });
  $("keep-copy").addEventListener("change", (e) => {
    if (!e.target.checked && !confirm("Delete the copy kept in this browser? The sheet on screen stays until you leave the page.")) { e.target.checked = true; return; }
    setKeeping(e.target.checked);
    // Off: the character now lives only on screen, so it counts as unsaved until exported.
    setDirty(e.target.checked ? state.dirty : true);
    updateChrome();
    setStatus(e.target.checked ? "A copy is kept in this browser, on this device only." : "The browser copy was deleted.");
  });
  $("new-character").addEventListener("click", () => {
    closeMenu();
    if (!confirmDiscard("Start a new, empty character anyway?")) return;
    state.character = state.system.defaultCharacter();
    state.refused = {}; state.step = 0;
    setDirty(false); showImportError(""); setStatus("New character");
    renderAll();
  });
  $("random-character").addEventListener("click", () => {
    if (!confirmDiscard("Replace it with a random character anyway?")) return;
    // The system decides what to keep from the character on screen (name, player, notes, level count…).
    state.character = state.system.randomCharacter(structuredClone(state.character));
    state.refused = {};
    setDirty(true); showImportError("");
    setStatus("Rolled a random character");
    renderAll();
  });
  $("export-json").addEventListener("click", () => {
    closeMenu();
    download(`${fileStem(state.character.name)}.json`, exportEnvelope(state.system, state.character), "application/json");
    setDirty(false); updateChrome(); setStatus(`Exported ${fileStem(state.character.name)}.json`);
  });
  $("export-txt").addEventListener("click", () => {
    closeMenu();
    const c = state.character;
    download(`${fileStem(c.name)}.txt`, state.system.toText(c, derived()), "text/plain;charset=utf-8");
    setStatus(`Exported ${fileStem(c.name)}.txt (to load it again, use Export JSON)`);
  });
  const fileInput = $("import-file");
  $("import-json").addEventListener("click", () => { closeMenu(); fileInput.click(); });
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    fileInput.value = "";
    if (!file) return;
    if (!confirmDiscard("Replace it with the imported character anyway?")) return;
    try {
      if (file.size > MAX_FILE_BYTES) throw new ImportRefused("This file is too large to be a character file.");
      let character;
      try { character = checked(importEnvelope(await file.text(), state.system, byId)); }
      catch (e) { if (e instanceof ImportRefused) throw e; throw new ImportRefused("its contents couldn't be read as a character."); }
      state.character = character;
      state.refused = {}; state.step = 0;
      setDirty(false); showImportError("");
      setStatus(`Loaded ${character.name || "the character"} from ${file.name}.`);
      renderAll();
    } catch (e) {
      showImportError(`Couldn't open "${file.name}": ${e instanceof ImportRefused ? e.message : "it couldn't be read."} Nothing was changed.`);
    }
  });

  // ---------- start ----------
  const fromHash = byId[location.hash.slice(1)];
  addEventListener("hashchange", () => { const s = byId[location.hash.slice(1)]; if (s && s !== state.system) selectSystem(s, { fromHash: true }); });
  selectSystem(fromHash ?? systems[0], { fromHash: Boolean(fromHash) });
}
