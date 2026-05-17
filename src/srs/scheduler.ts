import type { ReviewQuality, VocabEntry } from '../types/models';

const DAY_MS = 86_400_000;
const MIN_EASE = 1.3;

/**
 * SM-2 spaced-repetition scheduler.
 *
 * Given a vocab entry and a recall-quality grade (0..5), returns a NEW entry
 * with updated SRS fields. Pure: no I/O, deterministic given `now`.
 *
 * - quality < 3 (failed): repetitions reset, reviewed again in 1 day.
 * - quality >= 3 (passed): interval grows 1 -> 6 -> round(prev * ease).
 * - ease factor adjusts per the classic SM-2 formula, floored at 1.3.
 */
export function schedule(
  entry: VocabEntry,
  quality: ReviewQuality,
  now: number = Date.now(),
): VocabEntry {
  let { easeFactor, repetitions } = entry;
  let intervalDays: number;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(entry.intervalDays * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor = Math.max(
    MIN_EASE,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  return {
    ...entry,
    easeFactor,
    repetitions,
    intervalDays,
    lastReviewedAt: now,
    dueAt: now + intervalDays * DAY_MS,
  };
}

/** Entries whose due date has arrived, soonest first. */
export function dueEntries(
  entries: VocabEntry[],
  now: number = Date.now(),
): VocabEntry[] {
  return entries
    .filter((e) => e.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt);
}
