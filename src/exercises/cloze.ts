import type { ClozeItem, VocabEntry } from '../types/models';

export const BLANK = '_____';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Lowercase + strip diacritics, for forgiving answer comparison. */
export function normalizeAnswer(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

/**
 * Builds a single gap-fill item from a vocab entry: the term is removed from
 * its context sentence and replaced with a blank. Deterministic, no AI.
 *
 * If the term cannot be located in the sentence (e.g. it was stored in a
 * different inflection), the sentence is shown as a hint with a trailing
 * blank instead, so the exercise still works.
 */
export function buildClozeItem(entry: VocabEntry): ClozeItem {
  const sentence = entry.contextSentence.trim();
  const term = entry.term.trim();
  const accepts = [term];

  if (term.length > 0 && sentence.length > 0) {
    // Word-boundary match that tolerates Unicode letters and diacritics.
    const re = new RegExp(
      `(?<!\\p{L})${escapeRegExp(term)}(?!\\p{L})`,
      'iu',
    );
    if (re.test(sentence)) {
      return {
        entryId: entry.id,
        prompt: sentence.replace(re, BLANK),
        answer: term,
        accepts,
      };
    }
  }

  return {
    entryId: entry.id,
    prompt: sentence.length > 0 ? `${sentence}\n\n→ ${BLANK}` : BLANK,
    answer: term,
    accepts,
  };
}

export function buildCloze(entries: VocabEntry[]): ClozeItem[] {
  return entries.map(buildClozeItem);
}

/** True if `given` matches the expected answer (diacritic/case-insensitive). */
export function isClozeCorrect(item: ClozeItem, given: string): boolean {
  const g = normalizeAnswer(given);
  return item.accepts.some((a) => normalizeAnswer(a) === g);
}
