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

export async function generateComprehensionQuestions(
  article: Article,
  learningLanguage: string,
  count: number,
  onProgress?: ProgressCb,
  signal?: AbortSignal,
): Promise<ComprehensionQuestion[]> {
  const body = article.textContent.slice(0, MAX_CHARS);

  const system =
    `You are a language teacher. The learner is studying "${learningLanguage}". ` +
    `Write exactly ${count} reading-comprehension questions about the article, ` +
    `in ${learningLanguage}, each with a short correct answer in ${learningLanguage}. ` +
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
