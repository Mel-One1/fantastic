import { hasLanguageModel } from './capabilities';

export type ProgressCb = (loaded: number) => void;

export class PromptUnavailableError extends Error {}

interface CreateOpts {
  system?: string;
  inputLanguages?: string[];
  outputLanguages?: string[];
  onProgress?: ProgressCb;
  signal?: AbortSignal;
}

async function createSession(
  opts: CreateOpts,
): Promise<LanguageModelSession> {
  if (!hasLanguageModel()) {
    throw new PromptUnavailableError('LanguageModel API not present');
  }
  const status = await LanguageModel!.availability();
  if (status === 'unavailable') {
    throw new PromptUnavailableError('LanguageModel unavailable on this device');
  }
  return LanguageModel!.create({
    initialPrompts: opts.system
      ? [{ role: 'system', content: opts.system }]
      : undefined,
    expectedInputs: opts.inputLanguages
      ? [{ type: 'text', languages: opts.inputLanguages }]
      : undefined,
    expectedOutputs: opts.outputLanguages
      ? [{ type: 'text', languages: opts.outputLanguages }]
      : undefined,
    signal: opts.signal,
    monitor: opts.onProgress
      ? (m) =>
          m.addEventListener('downloadprogress', (e) =>
            opts.onProgress!(e.loaded),
          )
      : undefined,
  });
}

/**
 * Runs a single structured prompt and parses the JSON result. The JSON schema
 * is enforced by the model via `responseConstraint`, so the output is
 * guaranteed parseable.
 */
export async function promptJSON<T>(
  input: string,
  schema: object,
  opts: CreateOpts = {},
): Promise<T> {
  const session = await createSession(opts);
  try {
    const raw = await session.prompt(input, {
      responseConstraint: schema,
      omitResponseConstraintInput: true,
      signal: opts.signal,
    });
    return JSON.parse(raw) as T;
  } finally {
    session.destroy();
  }
}

export async function promptText(
  input: string,
  opts: CreateOpts = {},
): Promise<string> {
  const session = await createSession(opts);
  try {
    return await session.prompt(input, { signal: opts.signal });
  } finally {
    session.destroy();
  }
}
