import { STORAGE_KEY, defaultState } from './schema';
import { migrate } from './migrations';
import type { RootState, Settings, VocabEntry } from '../types/models';

let cache: RootState | null = null;

export async function loadState(): Promise<RootState> {
  if (cache) return cache;
  const raw = await chrome.storage.local.get(STORAGE_KEY);
  cache = migrate(raw[STORAGE_KEY]);
  return cache;
}

async function persist(next: RootState): Promise<void> {
  cache = next;
  await chrome.storage.local.set({ [STORAGE_KEY]: next });
}

export async function updateSettings(
  patch: Partial<Settings>,
): Promise<RootState> {
  const state = await loadState();
  const next: RootState = {
    ...state,
    settings: { ...state.settings, ...patch },
  };
  await persist(next);
  return next;
}

export async function addVocab(entry: VocabEntry): Promise<RootState> {
  const state = await loadState();
  const next: RootState = { ...state, vocab: [entry, ...state.vocab] };
  await persist(next);
  return next;
}

export async function updateVocab(
  id: string,
  patch: Partial<VocabEntry>,
): Promise<RootState> {
  const state = await loadState();
  const next: RootState = {
    ...state,
    vocab: state.vocab.map((v) => (v.id === id ? { ...v, ...patch } : v)),
  };
  await persist(next);
  return next;
}

export async function deleteVocab(id: string): Promise<RootState> {
  const state = await loadState();
  const next: RootState = {
    ...state,
    vocab: state.vocab.filter((v) => v.id !== id),
  };
  await persist(next);
  return next;
}

export async function replaceState(next: RootState): Promise<RootState> {
  const safe = migrate(next);
  await persist(safe);
  return safe;
}

export async function resetState(): Promise<RootState> {
  const fresh = defaultState();
  await persist(fresh);
  return fresh;
}
