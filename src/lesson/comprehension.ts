import { promptJSON, type ProgressCb } from '../ai/prompt';
import type { Article, ComprehensionQuestion } from '../types/models';

const SCHEMA = {
  type: 'object',
  required: ['questions'],
  additionalProperties: false,
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['question', 'answer'],
        additionalProperties: false,
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' },
        },
      },
    },
  },
} as const;

// Gemini Nano's context window is small; keep the article well within it.
const MAX_CHARS = 6000;

// English names so the (English-instructed) model reliably understands which
// language to produce, even when the BCP-47 hint had to be dropped.
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  pl: 'Polish',
  ru: 'Russian',
  ja: 'Japanese',
  zh: 'Chinese',
  ko: 'Korean',
};

export async function generateComprehensionQuestions(
  article: Article,
  learningLanguage: string,
  count: number,
  onProgress?: ProgressCb,
  signal?: AbortSignal,
): Promise<ComprehensionQuestion[]> {
  const body = article.textContent.slice(0, MAX_CHARS);
  const langName = LANGUAGE_NAMES[learningLanguage] ?? learningLanguage;

  const system =
    `You are a language teacher. The learner is studying ${langName}. ` +
    `Write exactly ${count} reading-comprehension questions about the article, ` +
    `entirely in ${langName}, each with a short correct answer in ${langName}. ` +
    `Base every question strictly on the article text.`;

  const result = await promptJSON<{ questions: ComprehensionQuestion[] }>(
    `Article title: ${article.title}\n\nArticle:\n${body}`,
    SCHEMA,
    {
      system,
      inputLanguages: [learningLanguage],
      outputLanguages: [learningLanguage],
      onProgress,
      signal,
    },
  );

  return (result.questions ?? []).slice(0, count);
}
