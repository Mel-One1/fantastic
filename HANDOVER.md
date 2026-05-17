# Übergabe – LinguaTab

Stand: Commit `a69e7e8`, Branch `claude/mobile-app-capabilities-BBmpb`.
Dieses Dokument soll einer **lokal laufenden Claude-Code-Session** (oder einem
Entwickler) ermöglichen, das Projekt ohne Vorwissen weiterzuführen.

---

## 1. Was ist das?

**LinguaTab** ist eine Chrome-Extension (Manifest V3), die den Artikel im
aktuellen Browser-Tab in eine Sprach-Lektion verwandelt. Sie läuft im
**Side Panel** und nutzt ausschließlich die **on-device Chrome-built-in-KI**
(Gemini Nano) – kein Backend, kein API-Key, kein Account. Alle Daten liegen
lokal in `chrome.storage.local`.

Funktionen:
- **Lektion**: Artikel via Mozilla Readability extrahieren, Spracherkennung,
  KI-generierte Verständnisfragen.
- **Vokabeln**: Wörter im Text markieren → automatische Übersetzung
  (Translator API) + Quellsatz als Kontext, lokal gespeichert, editierbar.
- **Üben**: Lückentext + Zuordnung (rein deterministisch) und Karteikarten
  mit **SM-2** Spaced Repetition.
- **Einstellungen**: Lern-/Muttersprache, KI-Status, JSON-Export/-Import,
  Reset.
- **Graceful Degradation**: Ohne verfügbare KI funktionieren Lückentext,
  Zuordnung und Karteikarten weiter; Übersetzungen können manuell eingetragen
  werden. Ein Banner zeigt den KI-Status.

---

## 2. Tech-Stack

- TypeScript (strict), Preact (kein React), Vite 5 + `@crxjs/vite-plugin` 2.x
- `@mozilla/readability` für die Artikelextraktion
- Vitest für Unit-Tests der deterministischen Logik
- Keine UI-Bibliothek, eine handgeschriebene `src/styles.css`

---

## 3. Lokales Setup

Voraussetzungen: Node ≥ 20, npm. Zum **Nutzen** der KI-Features außerdem
Chrome ≥ 138 auf ausreichend starker Hardware (siehe Abschnitt 7).

```bash
npm install
npm run dev        # Vite-Dev-Server mit HMR (Entwicklung)
npm run build      # tsc --noEmit && vite build -> dist/
npm run typecheck  # nur Typprüfung
npm test           # Vitest (28 Tests)
npm run gen:icons  # erzeugt public/icons/*.png neu (selten nötig)
```

`npm run dev` ist für die Entwicklung; zum Laden in Chrome wird trotzdem der
`dist/`-Build verwendet (siehe nächster Abschnitt).

---

## 4. In Chrome laden (WICHTIG – häufige Fehlerquelle)

Chrome lädt **nicht** den Projektordner, sondern den gebauten **`dist/`**-
Ordner, der eine echte `manifest.json` enthält (im Quellbaum gibt es nur
`manifest.config.ts`).

1. `npm run build`
2. `chrome://extensions` → Entwicklermodus aktivieren
3. „Entpackt laden" → **den `dist/`-Ordner** auswählen (nicht den
   Projekt-Root, nicht `src/`). Im `dist/` liegt `manifest.json`.
4. Nach Änderungen: neu bauen, dann in `chrome://extensions` „Aktualisieren".
   **Nach Änderungen an `manifest.config.ts` (z. B. Permissions): Extension
   entfernen und neu „Entpackt laden"**, sonst übernimmt Chrome neue
   Berechtigungen nicht.

**Distributions-Eigenheit:** `dist/` ist bewusst **eingecheckt** (nicht in
`.gitignore`), weil der Endnutzer das Repo nur als GitHub-ZIP herunterlädt und
keinen Build-Toolchain hat. **Daher gilt: Nach jeder Code-Änderung
`npm run build` ausführen und den aktualisierten `dist/`-Ordner mit
committen**, sonst bekommt der Nutzer den Fix nicht.

---

## 5. Architektur / Datenfluss

```
manifest.config.ts        MV3-Manifest (von CRXJS gelesen)
index.html                Side-Panel-Entry -> src/main.tsx
src/
  background/service-worker.ts   öffnet Side Panel beim Icon-Klick
  ai/
    capabilities.ts        Feature-Detection + availability() aller 3 APIs
    prompt.ts              LanguageModel-Session + JSON-Schema-Prompt,
                           Fallback wenn Sprach-Optionen abgelehnt werden
    translator.ts          Translator API, gecachte Instanzen je Sprachpaar
    languageDetector.ts    LanguageDetector-Wrapper (best effort)
  lesson/
    extractArticle.ts      executeScript -> outerHTML -> Readability
    sentence.ts            umschließenden Satz zu einem Term finden (pure)
    comprehension.ts       KI-Fragen via responseConstraint (JSON-Schema)
    pipeline.ts            extract -> detect -> Fragen (Fehler nicht fatal)
  exercises/
    cloze.ts               Lückentext, deterministisch, pure
    matching.ts            Zuordnung, seeded Shuffle, pure
    flashcards.ts          Review-Queue + Benotung -> Scheduler -> Storage
  srs/scheduler.ts         SM-2, pure
  storage/
    schema.ts              STORAGE_VERSION, Defaults, Sprachliste
    store.ts               einziger Zugang zu chrome.storage.local (Cache)
    migrations.ts          versionierte Migration, robust ggü. Müll-Input
  types/
    ai.d.ts                ambient Decls der KI-Globals (sonst untypisiert)
    models.ts              Settings, VocabEntry, Lesson, Exercise-Typen
  ui/
    App.tsx                Tab-Shell + lädt State + Capabilities
    tabs/{Lesson,Vocab,Practice,Settings}Tab.tsx
    components/{AvailabilityBanner,DownloadProgress}.tsx
```

Datenfluss Lektion: `LessonTab` → `pipeline.buildLesson(settings)` →
`extractArticle()` (Tab-HTML via `chrome.scripting`, Parsing im Panel) →
`detectLanguage()` → `generateComprehensionQuestions()`. Vokabel-Sammeln:
Textauswahl im Panel → `sentence.enclosingSentence()` → `translator.translate()`
→ `store.addVocab()`. Üben liest `state.vocab` und baut Cloze/Matching/Queue.

---

## 6. Datenmodell / Storage

Ein einziger Key `linguatab` in `chrome.storage.local`:

```ts
RootState { version, settings, vocab[] }
Settings  { learningLanguage, nativeLanguage, uiLanguage,
            comprehensionQuestionCount }
VocabEntry{ id, term, translation, translationSource:'ai'|'manual',
            contextSentence, sourceUrl, sourceTitle, createdAt,
            easeFactor, intervalDays, repetitions, dueAt, lastReviewedAt }
```

`STORAGE_VERSION = 1`. Bei Schema-Änderungen: Version erhöhen und in
`migrations.ts` einen Eintrag `migrations[N]` ergänzen (N = Quellversion).
`store.ts` hält einen In-Memory-Cache; alle Mutationen gehen über dessen
Funktionen, nie direkt über `chrome.storage`.

---

## 7. KI-Integration & bekannte Einschränkungen

Alles in `src/ai/`. Globale Objekte (Chrome ≥ 138): `LanguageModel`,
`Translator`, `LanguageDetector`. `capabilities.ts` löst pro Panel-Load den
Status auf; das Banner zeigt ihn an.

Bekannte, bereits behandelte Stolpersteine:

1. **Prompt-API-Sprachunterstützung ist eng.** Nicht-englische
   `expectedInputs`/`expectedOutputs` werden mit „The requested language
   options are not supported" abgelehnt. `prompt.ts` versucht es erst mit
   Sprach-Hints und fällt bei diesem Fehler auf eine Session **ohne**
   Hints zurück; `comprehension.ts` instruiert das Modell zusätzlich mit
   ausgeschriebenem Sprachnamen. → Qualität nicht-englischer Fragen kann
   schwanken. Mögliche Verbesserung: Fragen auf Englisch erzeugen und per
   Translator API in die Lernsprache übersetzen.
2. **Host-Berechtigungen.** Extraktion braucht Zugriff auf den aktiven Tab,
   auch nach Tab-Wechsel bei offenem Panel. `activeTab` reicht dafür nicht →
   `manifest.config.ts` setzt `host_permissions: ['http://*/*','https://*/*']`.
   `chrome://`, Web Store, Neuer-Tab, PDFs sind prinzipbedingt nicht lesbar
   (saubere Fehlermeldung in `extractArticle.ts`).
3. **Manifest-Permission-Unsicherheit (offen).** Ob die KI-Globals in
   Extensions eine Permission (`"languageModel"`/`"translator"`) brauchen, ist
   quellenabhängig unklar. Aktuell **keine** gesetzt. Falls in echtem Chrome
   `LanguageModel`/`Translator`/`LanguageDetector` auf Extension-Seiten
   `undefined` sind, in `manifest.config.ts` `permissions` ergänzen, neu
   bauen, `dist/` committen. Kommentar dort vorhanden.

Hardware/Voraussetzungen für die KI: Chrome ≥ 138 Desktop (kein Android/iOS),
> 4 GB VRAM bzw. ≥ 16 GB RAM, ~22 GB freier Speicher beim einmaligen
~4-GB-Modell-Download (Fortschrittsbalken über `downloadprogress`).

---

## 8. Aktueller Stand

Verifiziert (ohne Browser, in CI/Cloud möglich):
- `npm run build` grün (Typecheck + Vite-Build, valides `dist/manifest.json`)
- `npm test` grün: 28 Tests (cloze, matching, scheduler, migrations, sentence)

Vom Nutzer in echtem Chrome bestätigt:
- Extension lädt aus `dist/` und Side Panel öffnet.

Per Nutzer-Feedback bereits gefixt:
- `dist/` eingecheckt (Laden ohne Toolchain), Commit `698528b`
- Extraktion nach Tab-Wechsel (host_permissions), Commit `4885edd`
- Prompt-API-Sprach-Fallback, Commit `a69e7e8`

**Noch NICHT in echtem Chrome end-to-end bestätigt:** kompletter Lauf
Lektion → Fragen → Vokabel sammeln → Üben → Persistenz. Das ist der nächste
sinnvolle manuelle Test (siehe Abschnitt 10).

---

## 9. Offene Punkte / Ideen für die Weiterarbeit

- Manifest-Permission der KI-Globals im echten Chrome verifizieren (Abschnitt
  7.3) – wichtigster offener Unsicherheitspunkt.
- Qualität nicht-englischer Verständnisfragen verbessern (Englisch erzeugen +
  Translator API → Lernsprache).
- Lange Artikel: aktuell hartes Kürzen auf `MAX_CHARS = 6000` in
  `comprehension.ts`; ggf. `measureInputUsage` + Chunking.
- Vokabel-Sammeln nutzt `window.getSelection()` im gerenderten Plaintext;
  Satzgrenzen-Heuristik in `sentence.ts` ist simpel – Edge Cases prüfen.
- Keine UI-Tests/E2E (kein Browser in CI). Optional: Playwright-Setup.
- Optional: Veröffentlichung im Chrome Web Store (Icons sind nur einfarbige
  Platzhalter aus `scripts/gen-icons.mjs`).

---

## 10. Verifikation

Lokal/CI prüfbar: `npm run typecheck`, `npm test`, `npm run build` (muss ein
valides `dist/` mit `manifest.json` erzeugen).

Nur manuell in Chrome ≥ 138 prüfbar:
1. `npm run build` → `dist/` als entpackte Extension laden.
2. Einstellungen: Lern-/Muttersprache setzen (übersteht Panel-Schließen).
3. Normalen `https://`-Artikel öffnen → Icon → „Lektion aus aktuellem Tab
   erstellen" (ggf. Modell-Download abwarten).
4. Wort markieren → als Vokabel speichern (mit/ohne Translator testen).
5. Üben: Lückentext, Zuordnung, Karteikarten; Benotung verschiebt `dueAt`.
6. Chrome neu starten / Extension aus+an → Vokabeln + SRS-Status überleben.

---

## 11. Git-Konvention

- Entwicklungs-Branch: `claude/mobile-app-capabilities-BBmpb`
- Niemals ohne ausdrückliche Erlaubnis auf einen anderen Branch pushen.
- Nach Code-Änderungen: `npm run build`, dann **Quelle UND `dist/`** in
  denselben Commit (siehe Abschnitt 4, Distributions-Eigenheit).
- Aussagekräftige Commit-Messages (Warum, nicht nur Was).
