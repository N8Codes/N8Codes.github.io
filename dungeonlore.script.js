/* Dungeon Lore Script contains all rule logic for the character sheet.
 *
 * Every derived number on the sheet is recomputed from the inputs by
 * recalcAll(), so nothing drifts out of step. The rules it implements
 * (see the Character Setup and Trait Rules in dungeonlorerules.html):
 *   - 7 attributes start at 5 with 35 free points to spread. Free points
 *     can't raise an attribute past 15; points bought with EXP can.
 *   - Skill points = INT, plus skill points bought with EXP.
 *   - Attribute and skill points cost 10 EXP each.
 *   - Derived traits use attribute + mod, rounded down:
 *       Health = STR             Knowledge = INT / 5
 *       Weight Capacity = STR*20 Body Weight = STR*10 + 30
 *       Speed = AGI / 4          Action Points = 1 + AGI / 20
 *       Quick Action Points = 1 + AGI / 15
 *       Survival Points = WILL / 3   Stress = WILL * 2
 */

var FREE_ATTRIBUTE_POINTS = 35;
var ATTRIBUTE_MIN = 5;
var ATTRIBUTE_CREATION_MAX = 15;
var EXP_PER_POINT = 10;

var ATTRIBUTES = ["acc", "agi", "chr", "int", "per", "str", "will"];

var SKILLS = [
  "acrobatics", "alchemy", "arcane-sorcery", "archery", "art", "atheltics",
  "blade", "blunt", "brawl", "carpentry", "catalyst", "communing-arts",
  "cryokinesis", "culinary-arts", "deception", "discipline", "duel-wield",
  "enchantment", "grapple", "handle-animal", "herbalism", "lore",
  "magnemancy", "masonry", "medicine", "mechanics", "necromancy",
  "persuasion", "psionics", "pyromancy", "resilience", "ride", "sewing",
  "shamanism", "slight-of-hand", "smithing", "staff", "spellcraft", "sneak",
  "throw", "vigilance", "void-sorcery", "whip"
];

/* Tables whose rows the player can add and remove, with the function that
   adds one row to each. Used when loading a saved sheet. */
var SHEET_TABLES = [
  { id: "languages-table", add: function () { addEntry(null, "languages-table", "language"); } },
  { id: "class-history-table", add: function () { addEntry(null, "class-history-table", "class"); } },
  { id: "character-abilities-table", add: function () { addAbilityEntry(null, "character-abilities-table", "ability"); } },
  { id: "character-talents-table", add: function () { addTalentEntry(null, "character-talents-table", "talent"); } },
  { id: "techniques-table", add: function () { addTechniqueEntry(null, "techniques-table", "techniques"); } },
  { id: "afflictions-table", add: function () { addAfflictionEntry(null, "afflictions-table", "affliction"); } },
  { id: "spells-table", add: function () { addSpellEntry(null, "spells-table", "spells"); } },
  { id: "inventory", add: function () { addInventoryItem(null); } },
  { id: "mounts-table", add: function () { addMountOrChampionEntry(null, "mounts-table", "mounts"); } },
  { id: "champions-table", add: function () { addMountOrChampionEntry(null, "champions-table", "champions"); } }
];

/* Helpers */

function byId(id) {
  return document.getElementById(id);
}

function isWholeNumber(text) {
  return /^\s*-?\d+\s*$/.test(text);
}

function readInt(id) {
  var value = parseInt(byId(id).value, 10);
  return isNaN(value) ? 0 : value;
}

function readIntText(id) {
  var value = parseInt(byId(id).textContent, 10);
  return isNaN(value) ? 0 : value;
}

/* Reads the number out of a "/ 12" style max label. */
function readMaxLabel(id) {
  var match = byId(id).textContent.match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : NaN;
}

function effectiveAttribute(attribute) {
  return readInt(attribute) + readInt(attribute + "-mod");
}

function atLeastZero(value) {
  return Math.max(0, value);
}

function markDirty() {
  if (typeof setSheetDirty === "function") {
    setSheetDirty(true);
  }
}

/* Messages: each section has one status line (attr-msg, skills-msg,
   traits-msg) saying why a value was refused or corrected. The status line is
   announced as it changes, and the field points at it with aria-describedby.
   No aria-invalid: by the time the message shows, the field already holds a
   valid value again (the previous one, or the corrected one). */

var flaggedField = {};

function sheetMessage(areaId, element, text) {
  var previous = flaggedField[areaId];
  if (previous) {
    previous.removeAttribute("aria-describedby");
  }
  flaggedField[areaId] = text && element ? element : null;
  if (text && element) {
    element.setAttribute("aria-describedby", areaId);
  }
  byId(areaId).textContent = text;
}

/* Attributes */

function attributePointsBudget() {
  var bought = readIntText("attr-pts-bought");
  var spentUnderCap = 0;
  var spentOverCap = 0;
  ATTRIBUTES.forEach(function (attribute) {
    var value = readInt(attribute);
    spentUnderCap += Math.min(value, ATTRIBUTE_CREATION_MAX) - ATTRIBUTE_MIN;
    spentOverCap += Math.max(value - ATTRIBUTE_CREATION_MAX, 0);
  });
  return {
    remaining: FREE_ATTRIBUTE_POINTS + bought - spentUnderCap - spentOverCap,
    // Only points bought with EXP may raise an attribute past 15.
    overCapCovered: spentOverCap <= bought
  };
}

function skillPointsTotal() {
  return readInt("int") + readIntText("skill-pts-bought");
}

function skillPointsAssigned() {
  var assigned = 0;
  SKILLS.forEach(function (skill) {
    assigned += readInt(skill);
  });
  return assigned;
}

function checkAttributeLimit(element) {
  if (!isWholeNumber(element.value) || parseInt(element.value, 10) < ATTRIBUTE_MIN) {
    element.value = element.defaultValue;
    recalcAll();
    sheetMessage("attr-msg", element, "Attributes must be whole numbers of " + ATTRIBUTE_MIN + " or more.");
    return;
  }
  var value = parseInt(element.value, 10);
  var previous = parseInt(element.defaultValue, 10);
  element.value = value;

  // Lowering an attribute only gives points back, so it is always allowed;
  // that is also how a sheet already over budget (an old save) gets fixed.
  var budget = attributePointsBudget();
  var message = "";
  if (value > previous && budget.remaining < 0) {
    message = "Not enough attribute points.";
  } else if (value > previous && !budget.overCapCovered) {
    message = "Free points raise an attribute to " + ATTRIBUTE_CREATION_MAX +
      " at most; buy attribute points with EXP to go higher.";
  } else if (skillPointsTotal() < skillPointsAssigned()) {
    message = "That would leave fewer skill points than are assigned; lower a skill first.";
  }

  if (message) {
    element.value = element.defaultValue;
  } else {
    element.defaultValue = element.value;
  }
  recalcAll();
  if (message === "Not enough attribute points.") {
    message = "Not enough attribute points: " + attributePointsBudget().remaining + " left.";
  }
  sheetMessage("attr-msg", element, message);
}

function updateModifier(element) {
  var message = "";
  if (element.value.trim() === "") {
    element.value = 0;
  }
  if (!isWholeNumber(element.value)) {
    element.value = element.defaultValue;
    message = "Modifiers must be whole numbers.";
  } else {
    element.value = parseInt(element.value, 10);
    element.defaultValue = element.value;
  }
  recalcAll();
  sheetMessage("attr-msg", element, message);
}

/* Skills */

function updateSkillPoints(skill) {
  var message = "";
  if (!isWholeNumber(skill.value) || parseInt(skill.value, 10) < 0) {
    skill.value = skill.defaultValue;
    message = "Skill points must be whole numbers of 0 or more.";
  } else {
    skill.value = parseInt(skill.value, 10);
    if (skillPointsAssigned() > skillPointsTotal()) {
      skill.value = skill.defaultValue;
      message = "Not enough skill points.";
    } else {
      skill.defaultValue = skill.value;
    }
  }
  recalcAll();
  if (message === "Not enough skill points.") {
    message = "Not enough skill points: " + (skillPointsTotal() - skillPointsAssigned()) + " left.";
  }
  sheetMessage("skills-msg", skill, message);
}

/* Experience */

function confirmEXP(element) {
  var input = byId("exp-to-add");
  if (!isWholeNumber(input.value) || parseInt(input.value, 10) <= 0) {
    sheetMessage("traits-msg", input, "Enter a whole number of EXP greater than 0.");
    return;
  }
  var expToAdd = parseInt(input.value, 10);
  if (confirm("Are you certain you want to add " + expToAdd + " experience points?")) {
    byId("exp-total").textContent = readIntText("exp-total") + expToAdd;
    input.value = 0;
    input.defaultValue = "0";
    markDirty();
    recalcAll();
    sheetMessage("traits-msg", input, "");
  }
}

function expUsed() {
  return (readIntText("attr-pts-bought") + readIntText("skill-pts-bought")) * EXP_PER_POINT;
}

function notEnoughExpMessage() {
  return "Not enough EXP: a point costs " + EXP_PER_POINT + " and " +
    (readIntText("exp-total") - expUsed()) + " is unspent.";
}

function buySkillPoint(element) {
  if (expUsed() + EXP_PER_POINT > readIntText("exp-total")) {
    sheetMessage("skills-msg", null, notEnoughExpMessage());
    return;
  }
  byId("skill-pts-bought").textContent = readIntText("skill-pts-bought") + 1;
  markDirty();
  recalcAll();
  sheetMessage("skills-msg", null, "");
}

function buyAttributePoint(element) {
  if (expUsed() + EXP_PER_POINT > readIntText("exp-total")) {
    sheetMessage("attr-msg", null, notEnoughExpMessage());
    return;
  }
  byId("attr-pts-bought").textContent = readIntText("attr-pts-bought") + 1;
  markDirty();
  recalcAll();
  sheetMessage("attr-msg", null, "");
}

/* Trackers: current Health, Knowledge used, Survival Points left, Stress */

/* Commits a whole number within min..max (null = no bound). Returns a message
   when the value was refused or corrected, otherwise "". */
function commitWholeNumber(element, min, max, name) {
  if (!isWholeNumber(element.value)) {
    element.value = element.defaultValue;
    return name + " must be a whole number.";
  }
  var value = parseInt(element.value, 10);
  var message = "";
  if (min !== null && value < min) {
    value = min;
    message = name + " can't go below " + min + ", so it was set to " + min + ".";
  }
  if (max !== null && value > max) {
    value = max;
    message = name + " can't go above " + max + ", so it was set to " + max + ".";
  }
  element.value = value;
  element.defaultValue = element.value;
  return message;
}

function updateDamage(element) {
  // Health may drop to zero or below (unconscious), but not above its max.
  var message = commitWholeNumber(element, null, readMaxLabel("health"), "Health");
  recalcAll();
  sheetMessage("traits-msg", element, message);
}

function updateKnowledgeUsed(element) {
  var message = commitWholeNumber(element, 0, readMaxLabel("knl"), "Knowledge used");
  recalcAll();
  sheetMessage("traits-msg", element, message);
}

function updateSurvivalPointsUsed(element) {
  var message = commitWholeNumber(element, 0, readMaxLabel("survival-pts"), "Survival points");
  recalcAll();
  sheetMessage("traits-msg", element, message);
}

function updateStressPointsUsed(element) {
  // Stress may go over its max: the rules deal 1d4 damage per point over.
  var message = commitWholeNumber(element, 0, null, "Stress");
  recalcAll();
  sheetMessage("traits-msg", element, message);
}

/* Sets a tracker's new max. Its current value is kept and capped at the new
   max; with stayFull, a tracker that was full stays full (Health and
   Survival Points left, so raising STR or WILL doesn't leave them short). */
function setTrackerMax(inputId, labelId, newMax, minValue, stayFull) {
  var input = byId(inputId);
  var oldMax = readMaxLabel(labelId);
  var current = parseInt(input.value, 10);

  if (isNaN(current) || (stayFull && current === oldMax)) {
    current = stayFull ? newMax : 0;
  } else {
    current = Math.min(current, newMax);
  }
  if (minValue !== null && current < minValue) {
    current = minValue;
  }
  input.value = current;
  input.defaultValue = input.value;
  input.max = newMax;
  byId(labelId).textContent = " / " + newMax;
}

/* Weight and encumbrance */

function updateTotalWeightUsed(element) {
  var message = "";
  if (parseFloat(element.value) < 0) {
    element.value = 0;
    message = "Weight can't be negative, so it was set to 0.";
  }
  element.defaultValue = element.value;
  recalcAll();
  sheetMessage("traits-msg", element, message);
}

function totalWeightUsed() {
  var total = 0;
  var inputs = byId("content").querySelectorAll("input[id$='-weight'], input[id$='_weight']");
  for (var i = 0; i < inputs.length; i++) {
    var weight = parseFloat(inputs[i].value);
    if (!isNaN(weight) && weight > 0) {
      total += weight;
    }
  }
  return Math.round(total * 100) / 100;
}

/* AGI penalty for carried weight, as a share of Weight Capacity. */
function encumbranceText(used, capacity, agi) {
  var penalty = 0;
  if (used <= 0) {
    penalty = 0;
  } else if (used > capacity) {
    // Over capacity: all AGI is lost.
    penalty = agi;
  } else if (used >= capacity * 0.75) {
    // 75% of capacity or more: AGI decrease of 25%
    penalty = Math.ceil(agi / 4);
  } else if (used >= capacity * 0.5) {
    // 50% of capacity or more: AGI decrease of 10%
    penalty = Math.ceil(agi / 10);
  } else if (used >= capacity * 0.25) {
    // 25% of capacity or more: AGI decrease of 5%
    penalty = Math.floor(agi / 20);
  }
  return penalty > 0 ? " (-" + penalty + " AGI)" : "";
}

/* Recompute everything derived on the sheet */

function recalcAll() {
  if (!byId("remaining_pts")) {
    return; // The sheet isn't on screen.
  }
  var str = effectiveAttribute("str");
  var agi = atLeastZero(effectiveAttribute("agi"));
  var intelligence = effectiveAttribute("int");
  var will = effectiveAttribute("will");

  // Attribute and skill points, EXP
  byId("remaining_pts").textContent = attributePointsBudget().remaining;
  byId("exp-used").textContent = expUsed();

  var assigned = skillPointsAssigned();
  var skillRemaining = skillPointsTotal() - assigned;
  byId("skill_pts").textContent = skillRemaining;
  byId("skill_pts_assigned").textContent = assigned;
  SKILLS.forEach(function (skill) {
    var input = byId(skill);
    input.min = 0;
    input.max = readInt(skill) + atLeastZero(skillRemaining);
  });

  // Traits
  setTrackerMax("damage", "health", atLeastZero(str), null, true);
  setTrackerMax("knl-used", "knl", atLeastZero(Math.floor(intelligence / 5)), 0, false);
  setTrackerMax("survival-pts-used", "survival-pts", atLeastZero(Math.floor(will / 3)), 0, true);
  byId("stress-pts").textContent = " / " + atLeastZero(will * 2);

  var capacity = atLeastZero(str * 20);
  var used = totalWeightUsed();
  byId("capacity-value").textContent = capacity;
  byId("used-capacity").textContent = used;
  byId("capacity").textContent = "/ " + capacity + " lb" + encumbranceText(used, capacity, agi);
  byId("body-weight").textContent = atLeastZero(str * 10 + 30);

  byId("speed").textContent = Math.floor(agi / 4);
  byId("action-pts").textContent = 1 + Math.floor(agi / 20);
  byId("quick-action-pts").textContent = 1 + Math.floor(agi / 15);
}

/* Table rows: abilities, talents, techniques, afflictions, spells,
   inventory, languages, class history, mounts, champions */

function addRow(tableId, cells) {
  var table = byId(tableId);
  var row = table.insertRow(table.rows.length);
  cells.forEach(function (html, index) {
    row.insertCell(index).innerHTML = html;
  });
  labelTableInputs(table);
  markDirty();
}

function textCell(id) {
  return "<input id=\"" + id + "\" type=\"text\" oninput=\"saveValue(this)\" />";
}

function areaCell(id) {
  return "<textarea id=\"" + id + "\" oninput=\"saveValue(this)\"></textarea>";
}

function addAbilityEntry(element, tableId, entryName) {
  var n = entryName + "_" + byId(tableId).rows.length;
  addRow(tableId, [textCell(n), textCell(n + "_effect")]);
}

function addTalentEntry(element, tableId, entryName) {
  var n = entryName + "_" + byId(tableId).rows.length;
  addRow(tableId, [textCell(n), textCell(n + "_effect")]);
}

function addTechniqueEntry(element, tableId, entryName) {
  var n = entryName + "_" + byId(tableId).rows.length;
  addRow(tableId, [textCell(n), textCell(n + "_desc")]);
}

function addAfflictionEntry(element, tableId, entryName) {
  var n = entryName + "_" + byId(tableId).rows.length;
  addRow(tableId, [textCell(n + "_name"), textCell(n + "_duration"), areaCell(n + "_effects")]);
}

function addSpellEntry(element, tableId, entryName) {
  var n = entryName + "_" + byId(tableId).rows.length;
  addRow(tableId, [textCell(n + "_name"), textCell(n + "_attack"), textCell(n + "_mod"),
    textCell(n + "_usage"), textCell(n + "_requirements"), areaCell(n + "_effects")]);
}

function addInventoryItem(element) {
  var n = "item_" + byId("inventory").rows.length;
  addRow("inventory", [textCell(n + "_name"), textCell(n + "_desc"),
    "<input id=\"" + n + "_weight\" type=\"number\" min=\"0\" step=\"any\" oninput=\"updateTotalWeightUsed(this)\" />"]);
}

function addEntry(element, tableId, entryName) {
  var n = entryName + "_" + byId(tableId).rows.length;
  addRow(tableId, [textCell(n + "_name"), textCell(n + "_years"), areaCell(n + "_notes")]);
}

function addMountOrChampionEntry(element, tableId, entryName) {
  var n = entryName + "_" + byId(tableId).rows.length;
  addRow(tableId, [textCell(n + "_name"), textCell(n + "_requirements"), areaCell(n + "_desc")]);
}

function removeEntry(element, tableId) {
  var table = byId(tableId);
  if (table.rows.length > 1) {
    table.deleteRow(table.rows.length - 1);
    markDirty();
    recalcAll(); // Drops a removed item's weight from the total.
  }
}

/* Gives every input in a table row an accessible name from its column. */
function labelTableInputs(table) {
  if (!table.rows.length) {
    return;
  }
  var headers = table.rows[0].cells;
  for (var r = 1; r < table.rows.length; r++) {
    var cells = table.rows[r].cells;
    for (var c = 0; c < cells.length && c < headers.length; c++) {
      var control = cells[c].querySelector("input, textarea, select");
      if (control) {
        control.setAttribute("aria-label", headers[c].textContent.trim() + " " + r);
      }
    }
  }
}

/* Called once the sheet fragment is on screen. */
function initSheet() {
  var tables = byId("content").querySelectorAll("table");
  for (var i = 0; i < tables.length; i++) {
    labelTableInputs(tables[i]);
  }
  flaggedField = {};
  recalcAll();
  if (typeof setSheetDirty === "function") {
    setSheetDirty(false);
  }
}

/* Load and Save Character Sheet Functions
 *
 * A saved sheet is the sheet's HTML with every value written into it. On
 * load, the file is parsed without running anything in it, a fresh sheet is
 * loaded, and only the values are copied across, so a file can't inject
 * markup or script into the page. Sheets saved by the older version load
 * the same way.
 */

function savedValue(control) {
  var tag = control.tagName.toLowerCase();
  if (tag === "textarea") {
    return control.textContent;
  }
  if (tag === "select") {
    var option = control.querySelector("option[selected]");
    if (!option) {
      return null;
    }
    return option.hasAttribute("value") ? option.getAttribute("value") : option.textContent;
  }
  return control.getAttribute("value") || "";
}

function copySavedControl(from, to) {
  var value = savedValue(from);
  if (value === null) {
    return;
  }
  if (to.tagName.toLowerCase() === "select") {
    value = value.replace("Chatoic", "Chaotic"); // Old spelling.
    for (var i = 0; i < to.options.length; i++) {
      if (to.options[i].value === value) {
        to.selectedIndex = i;
      }
    }
    return;
  }
  to.value = value;
  to.defaultValue = to.value;
}

function controlsOf(element) {
  return element.querySelectorAll("input, textarea, select");
}

function applySavedSheet(saved) {
  var content = byId("content");

  // Table rows: match the saved row count, then copy by position.
  SHEET_TABLES.forEach(function (entry) {
    var savedTable = saved.getElementById(entry.id);
    var table = byId(entry.id);
    if (!savedTable || !table) {
      return;
    }
    var wanted = Math.max(1, savedTable.rows.length);
    while (table.rows.length > wanted) {
      table.deleteRow(table.rows.length - 1);
    }
    while (table.rows.length < wanted) {
      entry.add();
    }
    for (var r = 1; r < wanted; r++) {
      var from = controlsOf(savedTable.rows[r]);
      var to = controlsOf(table.rows[r]);
      for (var c = 0; c < to.length && c < from.length; c++) {
        copySavedControl(from[c], to[c]);
      }
    }
  });

  // Everything else: copy by id.
  var controls = content.querySelectorAll("input[id], textarea[id], select[id]");
  for (var i = 0; i < controls.length; i++) {
    var control = controls[i];
    if (control.type === "file" || control.closest("table")) {
      continue;
    }
    // Older saves could hold two fields with one id: prefer the filled one.
    var matches = saved.querySelectorAll("[id=\"" + control.id + "\"]");
    var source = matches.length ? matches[0] : null;
    for (var m = 0; m < matches.length; m++) {
      var value = savedValue(matches[m]);
      if (value !== null && value !== "") {
        source = matches[m];
        break;
      }
    }
    if (source) {
      copySavedControl(source, control);
    }
  }

  // Max labels, so a tracker that was full is still seen as full.
  ["health", "knl", "survival-pts"].forEach(function (id) {
    var label = saved.getElementById(id);
    if (label) {
      byId(id).textContent = label.textContent;
    }
  });

  // Points bought and EXP earned.
  function savedCount(id) {
    var element = saved.getElementById(id);
    var value = element ? parseInt(element.textContent, 10) : NaN;
    return isNaN(value) ? null : value;
  }
  var expTotal = savedCount("exp-total");
  if (expTotal !== null && expTotal >= 0) {
    byId("exp-total").textContent = expTotal;
  }
  var attrBought = savedCount("attr-pts-bought");
  var skillBought = savedCount("skill-pts-bought");
  if (attrBought === null || skillBought === null) {
    // Older save: every skill point was bought, and EXP used covers both.
    skillBought = (savedCount("skill_pts") || 0) + (savedCount("skill_pts_assigned") || 0);
    attrBought = Math.floor((savedCount("exp-used") || 0) / EXP_PER_POINT) - skillBought;
  }
  byId("attr-pts-bought").textContent = atLeastZero(attrBought);
  byId("skill-pts-bought").textContent = atLeastZero(skillBought);

  // Character art: images only.
  var savedArt = saved.getElementById("character-art");
  var art = savedArt ? savedArt.getAttribute("src") : null;
  if (art && /^data:image\//i.test(art)) {
    byId("character-art").src = art;
  }

  // Collapsed sections stay collapsed.
  var buttons = content.querySelectorAll("button.collapsible[aria-controls]");
  for (var b = 0; b < buttons.length; b++) {
    var sectionId = buttons[b].getAttribute("aria-controls");
    var savedSection = saved.getElementById(sectionId);
    if (savedSection && savedSection.style.display === "none") {
      collapseExpand(buttons[b].id, sectionId);
    }
  }
}

function loadCharacterSheet(element) {
  var file = element.files && element.files[0];
  element.value = ""; // So the same file can be picked again.
  if (!file || !confirmLeaveSheet()) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function (e) {
    var saved = new DOMParser().parseFromString(e.target.result, "text/html");
    if (!saved.getElementById("remaining_pts")) {
      alert("That file isn't a saved Dungeon Lore character sheet.");
      return;
    }
    loadFile("dungeonlore.html", function () {
      applySavedSheet(saved);
      initSheet();
    });
  };
  reader.readAsText(file);
}

/* Writes every current value into the markup so it's kept in the file. */
function writeValuesIntoMarkup(container) {
  var controls = controlsOf(container);
  for (var i = 0; i < controls.length; i++) {
    var control = controls[i];
    var tag = control.tagName.toLowerCase();
    if (tag === "textarea") {
      control.textContent = control.value;
    } else if (tag === "select") {
      for (var o = 0; o < control.options.length; o++) {
        if (control.options[o].selected) {
          control.options[o].setAttribute("selected", "");
        } else {
          control.options[o].removeAttribute("selected");
        }
      }
    } else if (control.type !== "file") {
      control.setAttribute("value", control.value);
    }
  }
}

function fileNamePart(text) {
  return text.trim().replace(/[^A-Za-z0-9_-]+/g, "_");
}

function saveCharacterSheet(element) {
  var content = byId("content");
  writeValuesIntoMarkup(content);

  var name = fileNamePart(byId("name").value);
  var title = fileNamePart(byId("title").value);
  var fileName = [name, title].filter(function (part) { return part; }).join("_") || "Dungeon_Lore_Character";

  downloadSheet(fileName + ".html", content.innerHTML);
  if (typeof setSheetDirty === "function") {
    setSheetDirty(false);
  }
}

function downloadSheet(filename, text) {
  var url = URL.createObjectURL(new Blob([text], { type: "text/html;charset=utf-8" }));
  var link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function saveValue(element) {
  element.defaultValue = element.value;
}

/* Collapse and Expand Functions */

function collapseExpand(btnName, elementName) {
  var element = byId(elementName);
  var button = byId(btnName);
  var hidden = window.getComputedStyle(element).getPropertyValue("display") === "none";

  var name = button.textContent.replace(/^[-+]\s*/, "").replace(/\s*[-+]$/, "");
  if (hidden) {
    element.style.display = "block";
    button.textContent = "- " + name + " -";
  } else {
    element.style.display = "none";
    button.textContent = "+ " + name + " +";
  }
  button.setAttribute("aria-expanded", hidden ? "true" : "false");
}

function loadCharacterArt(element) {
  var file = element.files[0];
  if (!file) {
    return;
  }
  var image = byId("character-art");
  var reader = new FileReader();
  reader.onload = function readSuccess(evt) {
    image.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

/* Dice Emulator Functions */

function rollDie(sides, labelId) {
  byId(labelId).textContent = Math.floor(Math.random() * sides) + 1;
}

function rollOneDFour(element) { rollDie(4, "1d4"); }
function rollOneDFive(element) { rollDie(5, "1d5"); }
function rollOneDSix(element) { rollDie(6, "1d6"); }
function rollOneDSeven(element) { rollDie(7, "1d7"); }
function rollOneDEight(element) { rollDie(8, "1d8"); }
function rollOneDNine(element) { rollDie(9, "1d9"); }
function rollOneDTen(element) { rollDie(10, "1d10"); }
function rollOneDTwelve(element) { rollDie(12, "1d12"); }
function rollOneDTwenty(element) { rollDie(20, "1d20"); }
