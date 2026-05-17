import { describe, expect, it } from 'vitest';
import { enclosingSentence } from './sentence';

describe('enclosingSentence', () => {
  const text =
    'Berlin is a city. The cat sat on the mat! Dogs run fast? End here.';

  it('returns the sentence containing the term', () => {
    expect(enclosingSentence(text, 'cat')).toBe('The cat sat on the mat!');
  });

  it('handles the first sentence', () => {
    expect(enclosingSentence(text, 'Berlin')).toBe('Berlin is a city.');
  });

  it('handles question marks as boundaries', () => {
    expect(enclosingSentence(text, 'Dogs')).toBe('Dogs run fast?');
  });

  it('collapses whitespace/newlines', () => {
    expect(enclosingSentence('Hello\n\n  world  now.', 'world')).toBe(
      'Hello world now.',
    );
  });

  it('falls back to the term when not found', () => {
    expect(enclosingSentence(text, 'zzz')).toBe('zzz');
  });

  it('returns empty string for an empty term', () => {
    expect(enclosingSentence(text, '   ')).toBe('');
  });
});
