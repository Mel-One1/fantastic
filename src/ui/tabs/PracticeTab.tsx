import { useMemo, useState } from 'preact/hooks';
import { buildCloze, isClozeCorrect } from '../../exercises/cloze';
import { buildMatching } from '../../exercises/matching';
import { buildReviewQueue, gradeCard, GRADE } from '../../exercises/flashcards';
import type { RootState, VocabEntry } from '../../types/models';

interface Props {
  state: RootState;
  refresh: () => Promise<void>;
}

type Mode = 'cloze' | 'matching' | 'flashcards';

export function PracticeTab({ state, refresh }: Props) {
  const [mode, setMode] = useState<Mode>('cloze');

  if (state.vocab.length === 0) {
    return (
      <div class="tab-panel">
        <p class="hint">
          Sammle zuerst Vokabeln, dann kannst du hier üben.
        </p>
      </div>
    );
  }

  return (
    <div class="tab-panel">
      <div class="seg">
        <button
          class={mode === 'cloze' ? 'seg-active' : ''}
          onClick={() => setMode('cloze')}
        >
          Lückentext
        </button>
        <button
          class={mode === 'matching' ? 'seg-active' : ''}
          onClick={() => setMode('matching')}
        >
          Zuordnung
        </button>
        <button
          class={mode === 'flashcards' ? 'seg-active' : ''}
          onClick={() => setMode('flashcards')}
        >
          Karteikarten
        </button>
      </div>

      {mode === 'cloze' && <Cloze state={state} />}
      {mode === 'matching' && <Matching state={state} />}
      {mode === 'flashcards' && (
        <Flashcards state={state} refresh={refresh} />
      )}
    </div>
  );
}

function Cloze({ state }: { state: RootState }) {
  const items = useMemo(() => buildCloze(state.vocab), [state.vocab]);
  const [i, setI] = useState(0);
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);

  const item = items[i];
  if (!item) return <p class="hint">Keine Aufgaben.</p>;
  const correct = checked && isClozeCorrect(item, value);

  function next() {
    setI((n) => (n + 1) % items.length);
    setValue('');
    setChecked(false);
  }

  return (
    <div class="card">
      <p class="counter">
        {i + 1} / {items.length}
      </p>
      <p class="cloze-prompt">{item.prompt}</p>
      <input
        value={value}
        disabled={checked}
        onInput={(e) => setValue((e.target as HTMLInputElement).value)}
        placeholder="fehlendes Wort"
      />
      {!checked ? (
        <button
          class="btn-primary"
          disabled={!value.trim()}
          onClick={() => setChecked(true)}
        >
          Prüfen
        </button>
      ) : (
        <>
          <div class={correct ? 'result-ok' : 'result-bad'}>
            {correct
              ? 'Richtig!'
              : `Falsch. Lösung: ${item.answer}`}
          </div>
          <button class="btn-primary" onClick={next}>
            Weiter
          </button>
        </>
      )}
    </div>
  );
}

function Matching({ state }: { state: RootState }) {
  const ex = useMemo(
    () => buildMatching(state.vocab, 6),
    [state.vocab],
  );
  const [pickedLeft, setPickedLeft] = useState<string | null>(null);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);

  function pickRight(entryId: string) {
    if (!pickedLeft) return;
    if (pickedLeft === entryId) {
      setSolved((s) => new Set(s).add(entryId));
      setPickedLeft(null);
      setWrong(null);
    } else {
      setWrong(entryId);
      setTimeout(() => setWrong(null), 600);
      setPickedLeft(null);
    }
  }

  const done = solved.size === ex.left.length;

  return (
    <div class="card">
      {done ? (
        <div class="result-ok">Alle Paare gefunden! 🎉</div>
      ) : (
        <p class="hint">Begriff links wählen, dann passende Übersetzung.</p>
      )}
      <div class="match-grid">
        <div class="match-col">
          {ex.left.map((p) => (
            <button
              key={p.entryId}
              disabled={solved.has(p.entryId)}
              class={`match-cell ${
                solved.has(p.entryId)
                  ? 'match-solved'
                  : pickedLeft === p.entryId
                    ? 'match-picked'
                    : ''
              }`}
              onClick={() => setPickedLeft(p.entryId)}
            >
              {p.term}
            </button>
          ))}
        </div>
        <div class="match-col">
          {ex.right.map((r) => (
            <button
              key={r.entryId}
              disabled={solved.has(r.entryId)}
              class={`match-cell ${
                solved.has(r.entryId)
                  ? 'match-solved'
                  : wrong === r.entryId
                    ? 'match-wrong'
                    : ''
              }`}
              onClick={() => pickRight(r.entryId)}
            >
              {r.translation || '—'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Flashcards({
  state,
  refresh,
}: {
  state: RootState;
  refresh: () => Promise<void>;
}) {
  const queue = useMemo(
    () => buildReviewQueue(state.vocab),
    [state.vocab],
  );
  const [pos, setPos] = useState(0);
  const [show, setShow] = useState(false);

  const card: VocabEntry | undefined = queue[pos];

  if (queue.length === 0) {
    return (
      <div class="card">
        <p class="hint">
          Keine fälligen Karten. Komm später wieder – die Wiederholung ist
          zeitgesteuert (SM-2).
        </p>
      </div>
    );
  }

  if (!card) {
    return (
      <div class="card">
        <div class="result-ok">Runde fertig! {queue.length} Karten geübt.</div>
      </div>
    );
  }

  async function grade(g: keyof typeof GRADE) {
    if (!card) return;
    await gradeCard(card, g);
    await refresh();
    setShow(false);
    setPos((p) => p + 1);
  }

  return (
    <div class="card flashcard">
      <p class="counter">
        {pos + 1} / {queue.length}
      </p>
      <div class="flash-term">{card.term}</div>
      {show ? (
        <>
          <div class="flash-back">
            {card.translation || '(keine Übersetzung)'}
          </div>
          {card.contextSentence && (
            <p class="vocab-context">„{card.contextSentence}“</p>
          )}
          <div class="grade-row">
            <button class="btn-again" onClick={() => grade('again')}>
              Nochmal
            </button>
            <button class="btn-good" onClick={() => grade('good')}>
              Gut
            </button>
            <button class="btn-easy" onClick={() => grade('easy')}>
              Einfach
            </button>
          </div>
        </>
      ) : (
        <button class="btn-primary" onClick={() => setShow(true)}>
          Umdrehen
        </button>
      )}
    </div>
  );
}
