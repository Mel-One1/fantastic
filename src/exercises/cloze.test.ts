import { describe, expect, it } from 'vitest';
import { BLANK, buildClozeItem, isClozeCorrect, normalizeAnswer } from './cloze';
import type { VocabEntry } from '../types/models';

function entry(over: Partial<VocabEntry>): VocabEntry {
  return {
    id: '1',
    term: '',
    translation: '',
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

describe('buildClozeItem', () => {
  it('blanks the term inside its sentence', () => {
    const item = buildClozeItem(
      entry({ term: 'cat', contextSentence: 'The cat sat on the mat.' }),
    );
    expect(item.prompt).toBe(`The ${BLANK} sat on the mat.`);
    expect(item.answer).toBe('cat');
  });

  it('only blanks whole words, not substrings', () => {
    const item = buildClozeItem(
      entry({ term: 'cat', contextSentence: 'The category was cat.' }),
    );
    expect(item.prompt).toBe(`The category was ${BLANK}.`);
  });

  it('matches case-insensitively', () => {
    const item = buildClozeItem(
      entry({ term: 'Berlin', contextSentence: 'I love berlin a lot.' }),
    );
    expect(item.prompt).toBe(`I love ${BLANK} a lot.`);
  });

  it('handles multi-word phrases', () => {
    const item = buildClozeItem(
      entry({
        term: 'machine learning',
        contextSentence: 'We study machine learning daily.',
      }),
    );
    expect(item.prompt).toBe(`We study ${BLANK} daily.`);
  });

  it('falls back when the term is not in the sentence', () => {
    const item = buildClozeItem(
      entry({ term: 'running', contextSentence: 'She runs every day.' }),
    );
    expect(item.prompt).toContain('She runs every day.');
    expect(item.prompt).toContain(BLANK);
    expect(item.answer).toBe('running');
  });
});

describe('isClozeCorrect / normalizeAnswer', () => {
  it('ignores case and diacritics', () => {
    const item = buildClozeItem(
      entry({ term: 'café', contextSentence: 'A café here.' }),
    );
    expect(isClozeCorrect(item, 'CAFE')).toBe(true);
    expect(isClozeCorrect(item, ' Café ')).toBe(true);
    expect(isClozeCorrect(item, 'tea')).toBe(false);
  });

  it('normalizeAnswer strips accents', () => {
    expect(normalizeAnswer('Œuvre')).toBe('œuvre');
    expect(normalizeAnswer('naïve')).toBe('naive');
  });
});
