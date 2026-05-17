/**
 * Given the full article text and a selected term, returns the sentence that
 * contains the term (used as context for a collected vocab entry). Falls back
 * to the term itself if it can't be located. Pure & deterministic.
 */
export function enclosingSentence(fullText: string, term: string): string {
  const text = fullText.replace(/\s+/g, ' ').trim();
  const needle = term.replace(/\s+/g, ' ').trim();
  if (!needle) return '';

  const idx = text.toLowerCase().indexOf(needle.toLowerCase());
  if (idx === -1) return needle;

  // Sentence terminators: . ! ? … plus newlines (already collapsed to spaces).
  const isBoundary = (c: string) => c === '.' || c === '!' || c === '?' || c === '…';

  let start = idx;
  while (start > 0 && !isBoundary(text[start - 1])) start--;

  let end = idx + needle.length;
  while (end < text.length && !isBoundary(text[end])) end++;
  if (end < text.length) end++; // include the terminator

  return text.slice(start, end).trim();
}
