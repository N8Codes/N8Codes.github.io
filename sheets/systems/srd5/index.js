// The "5E compatible (SRD 5.2.1)" system definition, read by the shared page shell (sheets/core/app.js).

import { SCHEMA_VERSION, MIGRATIONS, defaultCharacter, sanitize, toSaveData } from "./model.js";
import { derive } from "./derive.js";
import { validate } from "./validate.js";
import { randomCharacter } from "./random.js";
import { toText } from "./text.js";
import { renderSheet, renderGuided, STEPS } from "./views.js";
import { LICENSE } from "./license.js";

export default {
  id: "srd5",
  label: "5E compatible",
  subtitle: "SRD 5.2.1 rules",
  systemVersion: "SRD 5.2.1",
  schemaVersion: SCHEMA_VERSION,
  migrations: MIGRATIONS,
  license: LICENSE,
  defaultCharacter, sanitize, toSaveData, derive, validate, randomCharacter, toText,
  renderSheet, renderGuided, guidedSteps: STEPS,
};
