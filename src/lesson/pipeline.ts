import { extractArticle } from './extractArticle';
import { generateComprehensionQuestions } from './comprehension';
import { detectLanguage } from '../ai/languageDetector';
import type { Lesson, Settings } from '../types/models';
import type { ProgressCb } from '../ai/prompt';

export interface BuildLessonResult {
  lesson: Lesson;
  /** Set when the article language differs from the configured learning one. */
  languageMismatch: string | null;
  /** Set when comprehension generation failed (AI unavailable etc.). */
  questionsError: string | null;
}

/**
 * End-to-end: extract the article -> detect its language -> ask the model for
 * comprehension questions. Question generation failing is non-fatal: the rest
 * of the lesson (vocab collection, deterministic drills) still works.
 */
export async function buildLesson(
  settings: Settings,
  onProgress?: ProgressCb,
  signal?: AbortSignal,
): Promise<BuildLessonResult> {
  const article = await extractArticle();
  const detectedLanguage = await detectLanguage(article.textContent);

  const languageMismatch =
    detectedLanguage && detectedLanguage !== settings.learningLanguage
      ? detectedLanguage
      : null;

  let questions: Lesson['questions'] = [];
  let questionsError: string | null = null;
  try {
    questions = await generateComprehensionQuestions(
      article,
      settings.learningLanguage,
      settings.comprehensionQuestionCount,
      onProgress,
      signal,
    );
  } catch (err) {
    questionsError =
      err instanceof Error ? err.message : 'Fragen konnten nicht erzeugt werden.';
  }

  return {
    lesson: { article, detectedLanguage, questions },
    languageMismatch,
    questionsError,
  };
}
