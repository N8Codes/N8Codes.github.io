// The "SRD 5.2.1" system definition (no "5E compatible" label since 2026-11-22: the page also holds OGL content, whose Section 7 bars compatibility claims), read by the shared page shell (sheets/core/app.js).

import { SCHEMA_VERSION, MIGRATIONS, defaultCharacter, sanitize, toSaveData } from "./model.js";
import { derive } from "./derive.js";
import { validate } from "./validate.js";
import { randomCharacter } from "./random.js";
import { toText } from "./text.js";
import { renderSheet, renderGuided, STEPS } from "./views.js";
import { LICENSE } from "./license.js";

export default {
  id: "srd5",
  label: "SRD 5.2.1",
  subtitle: "System Reference Document 5.2.1 rules",
  systemVersion: "SRD 5.2.1",
  schemaVersion: SCHEMA_VERSION,
  migrations: MIGRATIONS,
  license: LICENSE,
  defaultCharacter, sanitize, toSaveData, derive, validate, randomCharacter, toText,
  renderSheet, renderGuided, guidedSteps: STEPS,
};
