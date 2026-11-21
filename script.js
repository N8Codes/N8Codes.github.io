/* All Header and Footer Logic goes here */

/* Pages by address. Anything else (no hash, #default) is the home page. */
var ROUTES = {
  "#dungeonlore": { file: "dungeonlore.html", sheet: true },
  "#dungeonlorerules": { file: "dungeonlorerules.html", sheet: false },
  "#default": { file: "home.html", sheet: false }
};

/* The hash of the page on screen, or null before the first page loads. */
var currentHash = null;

/* True when the character sheet has changes that haven't been saved. */
var sheetDirty = false;

/* Counts page loads, so a slow load overtaken by a newer one is dropped. */
var loadSequence = 0;

window.addEventListener("hashchange", showRoute);
window.onload = showRoute;

/* Shows the page for the current address: header links, Back and Forward. */
function showRoute() {
  var hash = ROUTES[location.hash] ? location.hash : "#default";
  if (hash === currentHash) {
    return;
  }
  if (currentHash !== null && !confirmLeaveSheet()) {
    history.replaceState(null, "", currentHash); // Stay on the sheet.
    return;
  }
  currentHash = hash;
  var route = ROUTES[hash];
  showCharacterFunctions(route.sheet);
  loadFile(route.file, route.sheet ? initSheet : null);
}

/* Unsaved changes: the leave-page prompt is armed only while there are some. */

function warnBeforeLeaving(event) {
  event.preventDefault();
  event.returnValue = ""; // Older browsers.
}

function setSheetDirty(dirty) {
  sheetDirty = dirty;
  if (dirty) {
    window.addEventListener("beforeunload", warnBeforeLeaving);
  } else {
    window.removeEventListener("beforeunload", warnBeforeLeaving);
  }
}

function markSheetDirty(event) {
  if (document.getElementById("remaining_pts")
      && document.getElementById("content").contains(event.target)) {
    setSheetDirty(true);
  }
}

document.addEventListener("input", markSheetDirty);
document.addEventListener("change", markSheetDirty);

/* Asks before throwing away unsaved changes. True means go ahead. */
function confirmLeaveSheet() {
  if (!sheetDirty) {
    return true;
  }
  if (!confirm("This character has unsaved changes. Leave without saving them?")) {
    return false;
  }
  setSheetDirty(false);
  return true;
}

/* Page Loading Functions */

function showCharacterFunctions(show) {
  var functions = document.getElementById("character-functions");
  functions.classList.toggle("character-functions", show);
  functions.classList.toggle("character-functions-hidden", !show);
}

/* Utility Functions */

function loadFile(fileName, onLoaded) {
  var request = ++loadSequence;
  var xmlHttpRequest = new XMLHttpRequest();
  xmlHttpRequest.open('get', fileName, true);
  xmlHttpRequest.onreadystatechange = function() {
    if (xmlHttpRequest.readyState === 4 && xmlHttpRequest.status === 200
        && request === loadSequence) {
      document.getElementById("content").innerHTML = xmlHttpRequest.responseText;
      if (onLoaded) {
        onLoaded();
      }
    }
  };
  xmlHttpRequest.send();
}
