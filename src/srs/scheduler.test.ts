import { describe, expect, it } from 'vitest';
import { dueEntries, schedule } from './scheduler';
import type { VocabEntry } from '../types/models';

function entry(over: Partial<VocabEntry> = {}): VocabEntry {
  return {
    id: 'x',
    term: 'term',
    translation: 't',
    translationSource: 'manual',
    contextSentence: '',
    sourceUrl: '',
    sourceTitle: '',
    createdAt: 0,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueAt: 0,
    lastReviewedAt: null,
    ...over,
  };
}

const DAY = 86_400_000;

describe('schedule (SM-2)', () => {
  it('failed recall (q<3) resets reps and reviews in 1 day', () => {
    const r = schedule(entry({ repetitions: 5, intervalDays: 40 }), 1, 0);
    expect(r.repetitions).toBe(0);
    expect(r.intervalDays).toBe(1);
    expect(r.dueAt).toBe(DAY);
    expect(r.lastReviewedAt).toBe(0);
  });

  it('first two correct answers use fixed 1 then 6 day intervals', () => {
    const first = schedule(entry(), 4, 0);
    expect(first.repetitions).toBe(1);
    expect(first.intervalDays).toBe(1);

    const second = schedule(
      entry({ repetitions: 1, intervalDays: 1 }),
      4,
      0,
    );
    expect(second.repetitions).toBe(2);
    expect(second.intervalDays).toBe(6);
  });

  it('subsequent intervals grow by the ease factor', () => {
    const r = schedule(
      entry({ repetitions: 2, intervalDays: 6, easeFactor: 2.5 }),
      5,
      0,
    );
    expect(r.intervalDays).toBe(Math.round(6 * 2.5));
  });

  it('ease factor never drops below 1.3', () => {
    let e = entry({ easeFactor: 1.3 });
    for (let i = 0; i < 10; i++) e = schedule(e, 0, 0);
    expect(e.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('perfect recall increases the ease factor', () => {
    const r = schedule(entry({ easeFactor: 2.5 }), 5, 0);
    expect(r.easeFactor).toBeCloseTo(2.6, 5);
  });
});

describe('dueEntries', () => {
  it('returns only due cards, soonest first', () => {
    const list = [
      entry({ id: 'a', dueAt: 100 }),
      entry({ id: 'b', dueAt: 50 }),
      entry({ id: 'c', dueAt: 999 }),
    ];
    const due = dueEntries(list, 200);
    expect(due.map((e) => e.id)).toEqual(['b', 'a']);
  });
});
