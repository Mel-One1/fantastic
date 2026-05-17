import { STORAGE_VERSION, defaultState } from './schema';
import type { RootState } from '../types/models';

// A migration takes the state at version N and returns it at version N+1.
// Indexed by source version. Add new entries as STORAGE_VERSION grows.
type Migration = (state: Record<string, unknown>) => Record<string, unknown>;

const migrations: Record<number, Migration> = {
  // Example for the future:
  // 1: (s) => ({ ...s, version: 2, settings: { ...s.settings, foo: true } }),
};

/**
 * Brings any persisted blob up to the current STORAGE_VERSION. Unknown or
 * corrupt input falls back to a fresh default state so the panel never
 * crashes on load.
 */
export function migrate(raw: unknown): RootState {
  if (raw == null || typeof raw !== 'object') {
    return defaultState();
  }

  let state = raw as Record<string, unknown>;
  let version = typeof state.version === 'number' ? state.version : 0;

  while (version < STORAGE_VERSION) {
    const step = migrations[version];
    if (!step) {
      // No path forward — safest is a clean slate.
      return defaultState();
    }
    state = step(state);
    version =
      typeof state.version === 'number' ? state.version : version + 1;
  }

  const base = defaultState();
  return {
    version: STORAGE_VERSION,
    settings: { ...base.settings, ...(state.settings as object | undefined) },
    vocab: Array.isArray(state.vocab)
      ? (state.vocab as RootState['vocab'])
      : [],
  };
}
