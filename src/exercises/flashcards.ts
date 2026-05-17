import { dueEntries, schedule } from '../srs/scheduler';
import { updateVocab } from '../storage/store';
import type { ReviewQuality, VocabEntry } from '../types/models';

/** Maps the 3-button review UI to SM-2 quality grades. */
export const GRADE: Record<'again' | 'good' | 'easy', ReviewQuality> = {
  again: 2,
  good: 4,
  easy: 5,
};

export function buildReviewQueue(
  entries: VocabEntry[],
  now: number = Date.now(),
): VocabEntry[] {
  return dueEntries(entries, now);
}

/** Grades one card, persists its new SRS state, returns the updated entry. */
export async function gradeCard(
  entry: VocabEntry,
  grade: keyof typeof GRADE,
  now: number = Date.now(),
): Promise<VocabEntry> {
  const next = schedule(entry, GRADE[grade], now);
  await updateVocab(entry.id, {
    easeFactor: next.easeFactor,
    intervalDays: next.intervalDays,
    repetitions: next.repetitions,
    dueAt: next.dueAt,
    lastReviewedAt: next.lastReviewedAt,
  });
  return next;
}
