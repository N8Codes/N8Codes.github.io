// Character files: a versioned JSON envelope, and a guarded import.
// Imported files are untrusted: parsed as JSON only, checked, migrated one version at a time,
// then copied field by field by the system's sanitize(). Nothing from a file is ever treated as markup.

export const FORMAT = "n8codes-character-sheet";
export const MAX_FILE_BYTES = 1_000_000;

/** The JSON text written by "Export JSON". */
export function exportEnvelope(system, character) {
  return JSON.stringify({
    format: FORMAT,
    schemaVersion: system.schemaVersion,
    system: system.id,
    systemVersion: system.systemVersion,
    license: system.license.attribution,
    exported: new Date().toISOString(),
    character: system.toSaveData(character),
  }, null, 2);
}

/** Thrown with a message the player can read; the page shows it as text. */
export class ImportRefused extends Error {}

/** Parse an imported file's text into a clean character for `system`, or throw ImportRefused. */
export function importEnvelope(text, system, systemsById = {}) {
  if (text.length > MAX_FILE_BYTES) throw new ImportRefused("This file is too large to be a character file.");
  let file;
  try {
    file = JSON.parse(text);
  } catch {
    throw new ImportRefused("This isn't a character file: it isn't valid JSON.");
  }
  if (!file || typeof file !== "object" || Array.isArray(file) || file.format !== FORMAT) {
    throw new ImportRefused("This isn't a character file from this page.");
  }
  if (file.system !== system.id) {
    const other = typeof file.system === "string" && Object.hasOwn(systemsById, file.system) ? systemsById[file.system].label : null;
    throw new ImportRefused(other
      ? `This is a ${other} character. Pick ${other} above, then import it again.`
      : "This character is for a game system this page doesn't have.");
  }
  if (!Number.isInteger(file.schemaVersion) || file.schemaVersion < 1) throw new ImportRefused("This file has no valid version number.");
  if (file.schemaVersion > system.schemaVersion) {
    throw new ImportRefused("This file was made by a newer version of this page. Reload the page and try again.");
  }
  if (!file.character || typeof file.character !== "object" || Array.isArray(file.character)) {
    throw new ImportRefused("This file has no character in it.");
  }
  let raw = file.character;
  for (let v = file.schemaVersion; v < system.schemaVersion; v++) {
    const migrate = system.migrations[v];
    if (typeof migrate !== "function") throw new ImportRefused("This file's version can't be upgraded.");
    raw = migrate(raw);
  }
  return system.sanitize(raw);
}

/** Offer text as a download. The Blob URL is revoked straight after the click. */
export function download(filename, text, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** A safe file name from a character name: letters, digits, dashes. */
export const fileStem = (name) => (String(name || "character").normalize("NFKD")
  .replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase().slice(0, 60)) || "character";
