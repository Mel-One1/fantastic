import type { MatchingExercise, VocabEntry } from '../types/models';

/** Deterministic PRNG (mulberry32) so exercises are reproducible/testable. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Builds a word <-> translation matching exercise from up to `count` entries.
 * `seed` makes the shuffle deterministic (used by tests; default random).
 */
export function buildMatching(
  entries: VocabEntry[],
  count = 6,
  seed: number = (Math.random() * 2 ** 31) | 0,
): MatchingExercise {
  const rng = mulberry32(seed);
  const chosen = shuffle(entries, rng).slice(0, Math.min(count, entries.length));

  const left = chosen.map((e) => ({
    entryId: e.id,
    term: e.term,
    translation: e.translation,
  }));

  const right = shuffle(
    chosen.map((e) => ({ entryId: e.id, translation: e.translation })),
    rng,
  );

  return { left, right };
}
