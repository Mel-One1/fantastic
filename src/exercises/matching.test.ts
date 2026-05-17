import { describe, expect, it } from 'vitest';
import { buildMatching } from './matching';
import type { VocabEntry } from '../types/models';

function makeEntries(n: number): VocabEntry[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `id${i}`,
    term: `term${i}`,
    translation: `trans${i}`,
    translationSource: 'manual' as const,
    contextSentence: '',
    sourceUrl: '',
    sourceTitle: '',
    createdAt: 0,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueAt: 0,
    lastReviewedAt: null,
  }));
}

describe('buildMatching', () => {
  it('caps the size at the requested count', () => {
    const ex = buildMatching(makeEntries(20), 6, 1);
    expect(ex.left).toHaveLength(6);
    expect(ex.right).toHaveLength(6);
  });

  it('caps the size at the deck size when smaller than count', () => {
    const ex = buildMatching(makeEntries(3), 6, 1);
    expect(ex.left).toHaveLength(3);
    expect(ex.right).toHaveLength(3);
  });

  it('every left term has exactly one matching right translation', () => {
    const ex = buildMatching(makeEntries(6), 6, 42);
    for (const l of ex.left) {
      const matches = ex.right.filter((r) => r.entryId === l.entryId);
      expect(matches).toHaveLength(1);
      expect(matches[0].translation).toBe(l.translation);
    }
  });

  it('is deterministic for a given seed', () => {
    const a = buildMatching(makeEntries(10), 6, 7);
    const b = buildMatching(makeEntries(10), 6, 7);
    expect(a.left.map((x) => x.entryId)).toEqual(
      b.left.map((x) => x.entryId),
    );
    expect(a.right.map((x) => x.entryId)).toEqual(
      b.right.map((x) => x.entryId),
    );
  });

  it('right column is a permutation of the left and not always identical', () => {
    let anyDifferent = false;
    for (let seed = 0; seed < 20; seed++) {
      const ex = buildMatching(makeEntries(6), 6, seed);
      const leftIds = ex.left.map((x) => x.entryId);
      const rightIds = ex.right.map((x) => x.entryId);
      expect([...rightIds].sort()).toEqual([...leftIds].sort());
      if (JSON.stringify(rightIds) !== JSON.stringify(leftIds)) {
        anyDifferent = true;
      }
    }
    expect(anyDifferent).toBe(true);
  });
});
