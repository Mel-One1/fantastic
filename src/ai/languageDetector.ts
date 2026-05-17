import { hasLanguageDetector } from './capabilities';

/**
 * Best-effort source-language detection. Returns a BCP-47 code or null if the
 * detector is unavailable or not confident — callers fall back to the
 * configured learning language.
 */
export async function detectLanguage(
  text: string,
  minConfidence = 0.5,
): Promise<string | null> {
  if (!hasLanguageDetector()) return null;
  try {
    const status = await LanguageDetector!.availability();
    if (status === 'unavailable') return null;
    const detector = await LanguageDetector!.create();
    try {
      const sample = text.slice(0, 1000);
      const results = await detector.detect(sample);
      const best = results[0];
      if (best && best.confidence >= minConfidence) {
        return best.detectedLanguage;
      }
      return null;
    } finally {
      detector.destroy();
    }
  } catch {
    return null;
  }
}
