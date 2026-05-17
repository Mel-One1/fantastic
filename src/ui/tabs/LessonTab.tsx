import { useRef, useState } from 'preact/hooks';
import { buildLesson } from '../../lesson/pipeline';
import { enclosingSentence } from '../../lesson/sentence';
import { translate } from '../../ai/translator';
import { addVocab } from '../../storage/store';
import { isUsable, type Capabilities } from '../../ai/capabilities';
import { DownloadProgress } from '../components/DownloadProgress';
import { SUPPORTED_LANGUAGES } from '../../storage/schema';
import type { Lesson, RootState, VocabEntry } from '../../types/models';

interface Props {
  state: RootState;
  caps: Capabilities | null;
  refresh: () => Promise<void>;
}

function langLabel(code: string): string {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.label ?? code;
}

export function LessonTab({ state, caps, refresh }: Props) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [addedTerms, setAddedTerms] = useState<Set<string>>(new Set());
  const articleRef = useRef<HTMLDivElement>(null);

  async function onBuild() {
    setBusy(true);
    setError(null);
    setQuestionsError(null);
    setMismatch(null);
    setProgress(null);
    setLesson(null);
    setRevealed(new Set());
    setAddedTerms(new Set());
    try {
      const result = await buildLesson(state.settings, (p) =>
        setProgress(p),
      );
      setLesson(result.lesson);
      setQuestionsError(result.questionsError);
      setMismatch(result.languageMismatch);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function onAddSelection() {
    if (!lesson) return;
    const sel = window.getSelection()?.toString().trim();
    if (!sel) return;
    if (
      articleRef.current &&
      !articleRef.current.contains(
        window.getSelection()?.anchorNode ?? null,
      )
    ) {
      return;
    }

    const context = enclosingSentence(lesson.article.textContent, sel);
    const { learningLanguage, nativeLanguage } = state.settings;

    let translation = '';
    let translationSource: VocabEntry['translationSource'] = 'manual';
    if (caps && isUsable(caps.translator)) {
      try {
        translation = await translate(
          sel,
          learningLanguage,
          nativeLanguage,
        );
        translationSource = 'ai';
      } catch {
        translation = '';
      }
    }

    const now = Date.now();
    const entry: VocabEntry = {
      id: crypto.randomUUID(),
      term: sel,
      translation,
      translationSource,
      contextSentence: context,
      sourceUrl: lesson.article.url,
      sourceTitle: lesson.article.title,
      createdAt: now,
      easeFactor: 2.5,
      intervalDays: 0,
      repetitions: 0,
      dueAt: now,
      lastReviewedAt: null,
    };
    await addVocab(entry);
    setAddedTerms((s) => new Set(s).add(sel));
    await refresh();
  }

  function toggleAnswer(i: number) {
    setRevealed((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  }

  return (
    <div class="tab-panel">
      <button class="btn-primary" disabled={busy} onClick={onBuild}>
        {busy ? 'Erstelle Lektion …' : 'Lektion aus aktuellem Tab erstellen'}
      </button>

      <DownloadProgress value={progress} />

      {error && <div class="alert alert-error">{error}</div>}

      {mismatch && (
        <div class="alert alert-warn">
          Erkannte Artikelsprache: <strong>{langLabel(mismatch)}</strong> –
          deine Lernsprache ist {langLabel(state.settings.learningLanguage)}.
          Du kannst die Lernsprache in den Einstellungen anpassen.
        </div>
      )}

      {lesson && (
        <>
          <h2>{lesson.article.title}</h2>

          <section class="card">
            <div class="card-head">
              <h3>Text</h3>
              <button class="btn-small" onClick={onAddSelection}>
                Markierung als Vokabel speichern
              </button>
            </div>
            <p class="hint">
              Wort/Phrase im Text markieren, dann auf den Knopf tippen.
            </p>
            <div ref={articleRef} class="article-text">
              {lesson.article.textContent}
            </div>
            {addedTerms.size > 0 && (
              <p class="hint">
                Gespeichert: {Array.from(addedTerms).join(', ')}
              </p>
            )}
          </section>

          <section class="card">
            <h3>Verständnisfragen</h3>
            {questionsError && (
              <div class="alert alert-warn">{questionsError}</div>
            )}
            {!questionsError && lesson.questions.length === 0 && (
              <p class="hint">Keine Fragen erzeugt.</p>
            )}
            <ol class="questions">
              {lesson.questions.map((q, i) => (
                <li key={i}>
                  <div>{q.question}</div>
                  <button
                    class="btn-link"
                    onClick={() => toggleAnswer(i)}
                  >
                    {revealed.has(i) ? 'Antwort verbergen' : 'Antwort zeigen'}
                  </button>
                  {revealed.has(i) && (
                    <div class="answer">{q.answer}</div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
