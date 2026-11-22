// Dice for table play. Math.random() is fine for this; it is never used for anything security-related.

/** One die, 1..sides inclusive (MDN's inclusive-integer pattern with a minimum of 1). */
export const rollDie = (sides) => Math.floor(Math.random() * sides) + 1;

/** Roll four d6 and total the highest three (SRD 5.2.1 p.21, Random Generation). */
export function roll4d6KeepHighest3() {
  const dice = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)].sort((a, b) => a - b);
  return dice[1] + dice[2] + dice[3];
}

/** An item from a non-empty list, each equally likely. */
export const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** A shuffled copy (Fisher–Yates), every order equally likely. */
export function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** n distinct items from a list, each subset equally likely. */
export const pickN = (list, n) => shuffle(list).slice(0, n);
