// The rule for accepting an edit, kept pure so it can be tested without a browser.
// Unless Free edit is on, an edit that adds a rule break at the fields it touches is refused;
// an edit that removes problems (or leaves them as they were) always goes through, so a character
// that already breaks a rule (an old or hand-edited file) can still be fixed.

/** → { accept: true } or { accept: false, message } */
export function decideEdit(system, prev, next, keys) {
  if (next.freeEdit) return { accept: true };
  const errorsAt = (c) => system.validate(c, system.derive(c))
    .filter((p) => p.severity === "error" && keys.includes(p.field)).map((p) => p.message);
  // The same rule with different numbers in it ("these cost 32" → "these cost 30") is the same problem.
  const shape = (m) => m.replace(/\d+/g, "#");
  const before = errorsAt(prev).map(shape);
  const added = errorsAt(next).filter((m) => !before.includes(shape(m)));
  return added.length ? { accept: false, message: `${added[0]} Not changed.` } : { accept: true };
}
