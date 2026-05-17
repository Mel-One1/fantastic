import { useCallback, useEffect, useState } from 'preact/hooks';
import { loadState } from '../storage/store';
import {
  detectCapabilities,
  type Capabilities,
} from '../ai/capabilities';
import type { RootState } from '../types/models';
import { AvailabilityBanner } from './components/AvailabilityBanner';
import { LessonTab } from './tabs/LessonTab';
import { VocabTab } from './tabs/VocabTab';
import { PracticeTab } from './tabs/PracticeTab';
import { SettingsTab } from './tabs/SettingsTab';

type TabId = 'lesson' | 'vocab' | 'practice' | 'settings';

const TABS: { id: TabId; label: string }[] = [
  { id: 'lesson', label: 'Lektion' },
  { id: 'vocab', label: 'Vokabeln' },
  { id: 'practice', label: 'Üben' },
  { id: 'settings', label: 'Einstellungen' },
];

export function App() {
  const [state, setState] = useState<RootState | null>(null);
  const [tab, setTab] = useState<TabId>('lesson');
  const [caps, setCaps] = useState<Capabilities | null>(null);

  const refresh = useCallback(async () => {
    setState(await loadState());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!state) return;
    let cancelled = false;
    detectCapabilities(
      state.settings.learningLanguage,
      state.settings.nativeLanguage,
    ).then((c) => {
      if (!cancelled) setCaps(c);
    });
    return () => {
      cancelled = true;
    };
  }, [state?.settings.learningLanguage, state?.settings.nativeLanguage]);

  if (!state) {
    return <div class="loading">Lade …</div>;
  }

  return (
    <div class="app">
      <header class="app-header">
        <h1>LinguaTab</h1>
        <nav class="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              class={`tab ${tab === t.id ? 'tab-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.id === 'vocab' && state.vocab.length > 0 ? (
                <span class="badge">{state.vocab.length}</span>
              ) : null}
            </button>
          ))}
        </nav>
      </header>

      {caps ? <AvailabilityBanner caps={caps} /> : null}

      <main class="content">
        {tab === 'lesson' && (
          <LessonTab state={state} caps={caps} refresh={refresh} />
        )}
        {tab === 'vocab' && <VocabTab state={state} refresh={refresh} />}
        {tab === 'practice' && (
          <PracticeTab state={state} refresh={refresh} />
        )}
        {tab === 'settings' && (
          <SettingsTab state={state} caps={caps} refresh={refresh} />
        )}
      </main>
    </div>
  );
}
