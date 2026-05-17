import { useRef, useState } from 'preact/hooks';
import {
  replaceState,
  resetState,
  updateSettings,
} from '../../storage/store';
import { SUPPORTED_LANGUAGES } from '../../storage/schema';
import { statusReason, type Capabilities } from '../../ai/capabilities';
import type { RootState } from '../../types/models';

interface Props {
  state: RootState;
  caps: Capabilities | null;
  refresh: () => Promise<void>;
}

export function SettingsTab({ state, caps, refresh }: Props) {
  const { settings } = state;
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function set<K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) {
    await updateSettings({ [key]: value });
    await refresh();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linguatab-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      await replaceState(parsed);
      await refresh();
      setMsg('Import erfolgreich.');
    } catch {
      setMsg('Import fehlgeschlagen: ungültige Datei.');
    }
  }

  async function reset() {
    if (!confirm('Alle Vokabeln und Einstellungen wirklich löschen?')) return;
    await resetState();
    await refresh();
    setMsg('Zurückgesetzt.');
  }

  return (
    <div class="tab-panel">
      <section class="card">
        <h3>Sprachen</h3>
        <label class="field">
          <span>Lernsprache</span>
          <select
            value={settings.learningLanguage}
            onChange={(e) =>
              set('learningLanguage', (e.target as HTMLSelectElement).value)
            }
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label class="field">
          <span>Muttersprache</span>
          <select
            value={settings.nativeLanguage}
            onChange={(e) =>
              set('nativeLanguage', (e.target as HTMLSelectElement).value)
            }
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label class="field">
          <span>Anzahl Verständnisfragen</span>
          <input
            type="number"
            min={1}
            max={10}
            value={settings.comprehensionQuestionCount}
            onInput={(e) =>
              set(
                'comprehensionQuestionCount',
                Math.max(
                  1,
                  Math.min(
                    10,
                    Number((e.target as HTMLInputElement).value) || 5,
                  ),
                ),
              )
            }
          />
        </label>
      </section>

      <section class="card">
        <h3>KI-Status</h3>
        {caps ? (
          <ul class="status-list">
            <li>
              Verständnisfragen (Prompt API): <code>{caps.prompt}</code>
              <div class="hint">{statusReason(caps.prompt)}</div>
            </li>
            <li>
              Übersetzung (Translator API): <code>{caps.translator}</code>
              <div class="hint">{statusReason(caps.translator)}</div>
            </li>
            <li>
              Spracherkennung: <code>{caps.detector}</code>
            </li>
          </ul>
        ) : (
          <p class="hint">Prüfe Verfügbarkeit …</p>
        )}
      </section>

      <section class="card">
        <h3>Daten</h3>
        <div class="btn-row">
          <button class="btn-small" onClick={exportJson}>
            Export (JSON)
          </button>
          <button
            class="btn-small"
            onClick={() => fileRef.current?.click()}
          >
            Import
          </button>
          <button class="btn-small btn-danger" onClick={reset}>
            Zurücksetzen
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={importJson}
        />
        {msg && <p class="hint">{msg}</p>}
      </section>
    </div>
  );
}
