// Single source of truth for whether the Chrome built-in AI APIs are usable.
// Everything else in the app branches on the result of `detectCapabilities()`.

export type ApiStatus = AIAvailability | 'missing';

export interface Capabilities {
  prompt: ApiStatus; // LanguageModel
  translator: ApiStatus; // Translator (for the configured language pair)
  detector: ApiStatus; // LanguageDetector
}

export function hasLanguageModel(): boolean {
  return typeof LanguageModel !== 'undefined' && LanguageModel != null;
}
export function hasTranslator(): boolean {
  return typeof Translator !== 'undefined' && Translator != null;
}
export function hasLanguageDetector(): boolean {
  return typeof LanguageDetector !== 'undefined' && LanguageDetector != null;
}

async function safeAvailability(
  fn: () => Promise<AIAvailability>,
): Promise<ApiStatus> {
  try {
    return await fn();
  } catch {
    return 'unavailable';
  }
}

export async function detectCapabilities(
  sourceLanguage: string,
  targetLanguage: string,
): Promise<Capabilities> {
  const prompt: ApiStatus = hasLanguageModel()
    ? await safeAvailability(() => LanguageModel!.availability())
    : 'missing';

  const sameLang = sourceLanguage === targetLanguage;
  const translator: ApiStatus = sameLang
    ? 'available'
    : hasTranslator()
      ? await safeAvailability(() =>
          Translator!.availability({ sourceLanguage, targetLanguage }),
        )
      : 'missing';

  const detector: ApiStatus = hasLanguageDetector()
    ? await safeAvailability(() => LanguageDetector!.availability())
    : 'missing';

  return { prompt, translator, detector };
}

export function isUsable(status: ApiStatus): boolean {
  return status === 'available' || status === 'downloadable' || status === 'downloading';
}

const REASONS: Record<ApiStatus, string> = {
  missing:
    'Diese Chrome-Version stellt die KI-Schnittstelle nicht bereit (Chrome ≥ 138 nötig).',
  unavailable:
    'Die KI ist auf diesem Gerät nicht verfügbar (Hardware-/Speicheranforderungen nicht erfüllt).',
  downloadable: 'Das KI-Modell muss noch heruntergeladen werden.',
  downloading: 'Das KI-Modell wird gerade heruntergeladen …',
  available: 'KI ist einsatzbereit.',
};

export function statusReason(status: ApiStatus): string {
  return REASONS[status];
}
