import type { RootState, Settings } from '../types/models';

export const STORAGE_VERSION = 1;
export const STORAGE_KEY = 'linguatab';

export const DEFAULT_SETTINGS: Settings = {
  learningLanguage: 'en',
  nativeLanguage: 'de',
  uiLanguage: 'de',
  comprehensionQuestionCount: 5,
};

export function defaultState(): RootState {
  return {
    version: STORAGE_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    vocab: [],
  };
}

/** Common languages offered in the settings dropdowns (BCP-47 + label). */
export const SUPPORTED_LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'ru', label: 'Русский' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
  { code: 'ko', label: '한국어' },
];
