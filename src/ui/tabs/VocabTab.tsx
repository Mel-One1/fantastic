import { useState } from 'preact/hooks';
import { deleteVocab, updateVocab } from '../../storage/store';
import type { RootState } from '../../types/models';

interface Props {
  state: RootState;
  refresh: () => Promise<void>;
}

export function VocabTab({ state, refresh }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  async function saveEdit(id: string) {
    await updateVocab(id, {
      translation: draft.trim(),
      translationSource: 'manual',
    });
    setEditId(null);
    await refresh();
  }

  async function remove(id: string) {
    await deleteVocab(id);
    await refresh();
  }

  if (state.vocab.length === 0) {
    return (
      <div class="tab-panel">
        <p class="hint">
          Noch keine Vokabeln. Erstelle eine Lektion und markiere Wörter im
          Text.
        </p>
      </div>
    );
  }

  return (
    <div class="tab-panel">
      <p class="hint">{state.vocab.length} Vokabeln gesammelt.</p>
      <ul class="vocab-list">
        {state.vocab.map((v) => (
          <li key={v.id} class="vocab-item">
            <div class="vocab-row">
              <strong>{v.term}</strong>
              <button class="btn-icon" onClick={() => remove(v.id)}>
                ✕
              </button>
            </div>

            {editId === v.id ? (
              <div class="vocab-edit">
                <input
                  value={draft}
                  onInput={(e) =>
                    setDraft((e.target as HTMLInputElement).value)
                  }
                  placeholder="Übersetzung"
                />
                <button
                  class="btn-small"
                  onClick={() => saveEdit(v.id)}
                >
                  Speichern
                </button>
                <button
                  class="btn-small"
                  onClick={() => setEditId(null)}
                >
                  Abbrechen
                </button>
              </div>
            ) : (
              <div class="vocab-row">
                <span class={v.translation ? '' : 'missing'}>
                  {v.translation || 'keine Übersetzung'}
                  {v.translationSource === 'manual' && v.translation
                    ? ' (manuell)'
                    : ''}
                </span>
                <button
                  class="btn-link"
                  onClick={() => {
                    setEditId(v.id);
                    setDraft(v.translation);
                  }}
                >
                  Bearbeiten
                </button>
              </div>
            )}

            {v.contextSentence && (
              <p class="vocab-context">„{v.contextSentence}“</p>
            )}
            {v.sourceUrl && (
              <a
                class="vocab-source"
                href={v.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                {v.sourceTitle || v.sourceUrl}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
