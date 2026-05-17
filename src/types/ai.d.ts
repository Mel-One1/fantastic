// Ambient declarations for the Chrome built-in AI APIs (Chrome >= 138).
// These are experimental and not part of lib.dom.d.ts yet. Kept intentionally
// minimal — only what this extension uses. See:
//   https://developer.chrome.com/docs/ai/prompt-api
//   https://developer.chrome.com/docs/ai/translator-api
//   https://developer.chrome.com/docs/ai/language-detection

type AIAvailability =
  | 'unavailable'
  | 'downloadable'
  | 'downloading'
  | 'available';

interface AIDownloadProgressEvent extends Event {
  readonly loaded: number; // 0..1
}

interface AICreateMonitor extends EventTarget {
  addEventListener(
    type: 'downloadprogress',
    listener: (event: AIDownloadProgressEvent) => void,
  ): void;
}

type AIMonitorCallback = (monitor: AICreateMonitor) => void;

interface AILanguageExpectation {
  type?: 'text';
  languages?: string[];
}

// ---- Prompt API: LanguageModel -------------------------------------------

interface LanguageModelMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LanguageModelCreateOptions {
  initialPrompts?: LanguageModelMessage[];
  temperature?: number;
  topK?: number;
  expectedInputs?: AILanguageExpectation[];
  expectedOutputs?: AILanguageExpectation[];
  signal?: AbortSignal;
  monitor?: AIMonitorCallback;
}

interface LanguageModelPromptOptions {
  signal?: AbortSignal;
  responseConstraint?: object;
  omitResponseConstraintInput?: boolean;
}

interface LanguageModelParams {
  defaultTemperature: number;
  maxTemperature: number;
  defaultTopK: number;
  maxTopK: number;
}

interface LanguageModelSession {
  prompt(input: string, options?: LanguageModelPromptOptions): Promise<string>;
  promptStreaming(
    input: string,
    options?: LanguageModelPromptOptions,
  ): AsyncIterable<string>;
  measureInputUsage(input: string): Promise<number>;
  readonly inputUsage: number;
  readonly inputQuota: number;
  clone(options?: { signal?: AbortSignal }): Promise<LanguageModelSession>;
  destroy(): void;
}

interface LanguageModelStatic {
  availability(
    options?: Pick<
      LanguageModelCreateOptions,
      'expectedInputs' | 'expectedOutputs'
    >,
  ): Promise<AIAvailability>;
  params(): Promise<LanguageModelParams>;
  create(options?: LanguageModelCreateOptions): Promise<LanguageModelSession>;
}

declare const LanguageModel: LanguageModelStatic | undefined;

// ---- Translator API -------------------------------------------------------

interface TranslatorCreateOptions {
  sourceLanguage: string;
  targetLanguage: string;
  signal?: AbortSignal;
  monitor?: AIMonitorCallback;
}

interface TranslatorInstance {
  translate(input: string): Promise<string>;
  translateStreaming(input: string): AsyncIterable<string>;
  destroy(): void;
}

interface TranslatorStatic {
  availability(options: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<AIAvailability>;
  create(options: TranslatorCreateOptions): Promise<TranslatorInstance>;
}

declare const Translator: TranslatorStatic | undefined;

// ---- Language Detector API ------------------------------------------------

interface LanguageDetectorCreateOptions {
  expectedInputLanguages?: string[];
  signal?: AbortSignal;
  monitor?: AIMonitorCallback;
}

interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
}

interface LanguageDetectorInstance {
  detect(input: string): Promise<LanguageDetectionResult[]>;
  destroy(): void;
}

interface LanguageDetectorStatic {
  availability(
    options?: LanguageDetectorCreateOptions,
  ): Promise<AIAvailability>;
  create(
    options?: LanguageDetectorCreateOptions,
  ): Promise<LanguageDetectorInstance>;
}

declare const LanguageDetector: LanguageDetectorStatic | undefined;
