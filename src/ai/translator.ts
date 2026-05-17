import { hasTranslator } from './capabilities';
import type { ProgressCb } from './prompt';

export class TranslatorUnavailableError extends Error {}

const pool = new Map<string, Promise<TranslatorInstance>>();

function key(src: string, tgt: string): string {
  return `${src}->${tgt}`;
}

async function getTranslator(
  sourceLanguage: string,
  targetLanguage: string,
  onProgress?: ProgressCb,
): Promise<TranslatorInstance> {
  if (!hasTranslator()) {
    throw new TranslatorUnavailableError('Translator API not present');
  }
  const k = key(sourceLanguage, targetLanguage);
  let inst = pool.get(k);
  if (!inst) {
    inst = (async () => {
      const status = await Translator!.availability({
        sourceLanguage,
        targetLanguage,
      });
      if (status === 'unavailable') {
        throw new TranslatorUnavailableError(
          `No translation model for ${k}`,
        );
      }
      return Translator!.create({
        sourceLanguage,
        targetLanguage,
        monitor: onProgress
          ? (m) =>
              m.addEventListener('downloadprogress', (e) =>
                onProgress(e.loaded),
              )
          : undefined,
      });
    })();
    pool.set(k, inst);
    // Drop a rejected promise so a later attempt can retry.
    inst.catch(() => pool.delete(k));
  }
  return inst;
}

export async function translate(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  onProgress?: ProgressCb,
): Promise<string> {
  if (sourceLanguage === targetLanguage) return text;
  const t = await getTranslator(sourceLanguage, targetLanguage, onProgress);
  return t.translate(text);
}
