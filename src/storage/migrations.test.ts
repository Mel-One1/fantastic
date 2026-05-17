import { describe, expect, it } from 'vitest';
import { migrate } from './migrations';
import { DEFAULT_SETTINGS, STORAGE_VERSION } from './schema';

describe('migrate', () => {
  it('returns a fresh default state for null/garbage input', () => {
    expect(migrate(null).version).toBe(STORAGE_VERSION);
    expect(migrate(42).vocab).toEqual([]);
    expect(migrate('nope').settings).toEqual(DEFAULT_SETTINGS);
  });

  it('preserves a valid current-version state', () => {
    const input = {
      version: STORAGE_VERSION,
      settings: { ...DEFAULT_SETTINGS, learningLanguage: 'fr' },
      vocab: [{ id: 'a', term: 'chat' }],
    };
    const out = migrate(input);
    expect(out.version).toBe(STORAGE_VERSION);
    expect(out.settings.learningLanguage).toBe('fr');
    expect(out.vocab).toHaveLength(1);
  });

  it('fills in missing settings keys with defaults', () => {
    const out = migrate({
      version: STORAGE_VERSION,
      settings: { learningLanguage: 'es' },
      vocab: [],
    });
    expect(out.settings.learningLanguage).toBe('es');
    expect(out.settings.nativeLanguage).toBe(
      DEFAULT_SETTINGS.nativeLanguage,
    );
    expect(out.settings.comprehensionQuestionCount).toBe(
      DEFAULT_SETTINGS.comprehensionQuestionCount,
    );
  });

  it('drops to defaults when no migration path exists for an old version', () => {
    const out = migrate({ version: -1, vocab: [{ id: 'x' }] });
    expect(out.version).toBe(STORAGE_VERSION);
    expect(out.vocab).toEqual([]);
  });
});
