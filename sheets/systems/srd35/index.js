// The 3.5 system definition, read by the shared page shell (sheets/core/app.js).
// Named only as "3.5 SRD rules": OGL 1.0a Section 7 rules out any trademark, even to claim compatibility.

import { SCHEMA_VERSION, MIGRATIONS, defaultCharacter, sanitize, toSaveData } from "./model.js";
import { derive } from "./derive.js";
import { validate } from "./validate.js";
import { randomCharacter } from "./random.js";
import { toText } from "./text.js";
import { renderSheet, renderGuided, STEPS } from "./views.js";
import { LICENSE } from "./license.js";

export default {
  id: "srd35",
  label: "3.5 SRD",
  subtitle: "System Reference Document v3.5 rules",
  systemVersion: "SRD v3.5",
  schemaVersion: SCHEMA_VERSION,
  migrations: MIGRATIONS,
  license: LICENSE,
  defaultCharacter, sanitize, toSaveData, derive, validate, randomCharacter, toText,
  renderSheet, renderGuided, guidedSteps: STEPS,
};
