// Domain model types shared across the extension.

export interface Settings {
  /** BCP-47 code of the language the user is learning, e.g. "en". */
  learningLanguage: string;
  /** BCP-47 code of the user's native language, e.g. "de". */
  nativeLanguage: string;
  /** Language of the panel chrome itself. */
  uiLanguage: string;
  /** How many comprehension questions to request per lesson. */
  comprehensionQuestionCount: number;
}

export interface VocabEntry {
  id: string;
  /** The selected word/phrase in the learning language. */
  term: string;
  /** Translation into the native language. */
  translation: string;
  translationSource: 'ai' | 'manual';
  /** The sentence from the article that contained the term. */
  contextSentence: string;
  sourceUrl: string;
  sourceTitle: string;
  createdAt: number;
  // ---- SM-2 spaced-repetition fields ----
  easeFactor: number; // starts 2.5, floor 1.3
  intervalDays: number; // starts 0
  repetitions: number; // consecutive correct answers, starts 0
  dueAt: number; // epoch ms; starts = createdAt (due immediately)
  lastReviewedAt: number | null;
}

export interface ComprehensionQuestion {
  question: string;
  answer: string;
}

export interface Article {
  title: string;
  textContent: string;
  url: string;
}

export interface Lesson {
  article: Article;
  detectedLanguage: string | null;
  questions: ComprehensionQuestion[];
}

export interface RootState {
  version: number;
  settings: Settings;
  vocab: VocabEntry[];
}

/** Quality grade fed to the SM-2 scheduler (0 = total blackout, 5 = perfect). */
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface ClozeItem {
  entryId: string;
  /** Sentence with the target term replaced by a blank marker. */
  prompt: string;
  answer: string;
  /** Acceptable answers (case/diacritic-insensitive comparison done elsewhere). */
  accepts: string[];
}

export interface MatchingPair {
  entryId: string;
  term: string;
  translation: string;
}

export interface MatchingExercise {
  /** Terms in original order. */
  left: MatchingPair[];
  /** Translations, shuffled. */
  right: { entryId: string; translation: string }[];
}
