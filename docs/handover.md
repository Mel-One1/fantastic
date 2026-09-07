# Übergabe an die lokale Session

Diese Notiz ist auf Deutsch, weil Melanie sie liest. Die Website selbst ist Englisch (US).
Stand: 7. September 2026, Branch `claude/briefing-lesen-864fc8`, 6 Commits, alles gepusht.

---

## Was das Projekt ist

Kompletter Neubau von softdentalcare.com. Zahnarztpraxis in Los Algodones, Baja
California, Mexiko, Dr. Mario A. Garibay. Zielgruppe sind US-Amerikaner und Kanadier
ab 55, oft Winterbewohner in Yuma, die vor einer teuren Behandlung stehen.

Das Briefing ist die verbindliche Grundlage. Melanie hat es als Datei
`briefingsoftdentalcarerelaunch.md`, es liegt nicht im Repo. **Vor der ersten Änderung
lesen lassen**, es steht Wesentliches darin, das hier nur verkürzt wiedergegeben ist.

Kernaussage der Seite: personalisierte Aufmerksamkeit, bewusst wenige Termine pro Tag.
Das ist keine Floskel für die About-Seite, das trägt die ganze Website.

---

## Was steht

Astro 5, Tailwind 4, statisch, kein CMS, keine Datenbank, kein WordPress.

- 18 Seiten bauen fehlerfrei, `astro check` meldet 0 Fehler
- Alle URLs aus der Briefing-Sitemap, Implantat-Unterseiten verschachtelt unter
  `/dental-implants/`
- `src/data/site.ts` ist die einzige Quelle für Adresse, Telefon, WhatsApp,
  Öffnungszeiten, Google Place ID. Footer, Kontaktseite und strukturierte Daten lesen
  daraus. Unbekannte Werte sind `null` und erscheinen als sichtbarer Platzhalter
- JSON-LD: `Dentist`, `BreadcrumbList` global, `FAQPage`, `MedicalProcedure`.
  Leere Felder werden entfernt, `aggregateRating` erscheint erst mit echter
  Google-Bewertung
- `public/.htaccess` wird generiert, 15 Alt-URLs mit 301-Ziel
- Geprüft: keine Fremddomain-Ressource, kein toter interner Link, alle
  Meta-Descriptions 140 bis 155 Zeichen, JSON-LD valide, keine Gedankenstriche

**77 offene Stellen im Quelltext, 79 gerenderte Platzhalter.** `npm run todos` listet sie.

---

## Was noch nicht steht

1. **Design.** Das ist der wichtigste offene Punkt und der Grund für den Wechsel auf den
   lokalen Rechner. Was aktuell zu sehen ist, ist eine neutrale Grundlinie, kein Design:
   Farben von mir erfunden (`#0f6b62` in `src/styles/global.css`, mit TODO daneben),
   Schriften gar nicht geladen (System-Fallback), kein Logo, kein Bild.
   **Melanie will das Design der bestehenden Seite beibehalten.** Ich konnte
   softdentalcare.com von der Cloud-Session aus nicht aufrufen, der Proxy blockt sie.
   Die lokale Session kann das. Erste Aufgabe: Seite ansehen, Farben, Schriften,
   Proportionen und Bildsprache übernehmen.
   Achtung: Logo und Parallax-Hintergrund laden laut Briefing von der Fremddomain
   `seconddentalopinion.net`. Beibehalten ist in Ordnung, die Dateien müssen aber in die
   eigene Installation umziehen. Kein Asset darf von fremder Domain kommen, das ist
   Abnahmekriterium.
2. **Inhalte.** Preise, NAP-Daten, Garantie, Qualifikationen, FAQ-Antworten, echte Fotos.
3. **PHP-Handler** für das Kontaktformular und **Röntgen-Upload** für `/second-opinion/`.
   Beides läuft auf Hostinger, Uploads außerhalb von `public_html`.
4. **Selbst gehostete Schriften** in `public/fonts/` mit `font-display: swap`.
5. **Backup der alten Seite.** Noch nicht angefangen, Voraussetzung für alles Weitere.
6. **Deployment.** Nichts ist hochgeladen, die alte WordPress-Seite läuft unverändert.

---

## Entscheidungen, die feststehen

| Thema | Entscheidung |
| --- | --- |
| Hosting | Hostinger. PHP ist erlaubt, auch für den Röntgen-Upload |
| Preise | Preisspannen, keine Festpreise |
| Fotos | Teils vorhanden, Shooting kann geplant werden |
| URLs | Verschachtelt, `/dental-implants/single-tooth-implant/` |
| Design | Bestehendes Design beibehalten |
| Zweitmeinung | Angebot bleibt auf der SDC-Seite, muss klar als SDC erkennbar sein |
| seconddentalopinion.net | Eigenes Projekt mit neutraler Positionierung. Diese Seite verlinkt nicht dorthin und übernimmt die Positionierung nicht |

---

## Harte Regeln aus dem Briefing

- Keine Preise, Garantiezeiten, Fallzahlen, Zertifikate oder Mitgliedschaften erfinden.
  Fehlendes bleibt als sichtbarer `TODO-MELANIE`-Marker im Build stehen
- Keine medizinischen Wirkversprechen, keine Erfolgsquoten ohne belegte Quelle
- Patientenbewertungen werden zitiert oder eingebunden, nie geschrieben oder umformuliert
- Stockfotos sind erlaubt für Abstraktes und Illustratives. Verboten überall dort, wo ein
  Besucher „das ist die Praxis", „das ist das Team" oder „das ist ein Patient" liest.
  Dort steht `PlaceholderImage` mit `TODO-REAL-PHOTO`, bis echte Fotos da sind
- Vorher-Nachher-Bilder nur mit dokumentierter schriftlicher Einwilligung
- Keine Gedankenstriche im Text, Vorgabe der Auftraggeberin
- Kein Werbetexter-Ton. Zielgruppe 55+ und skeptisch, nüchtern schlägt Superlativ
- Kein Meta-Keywords-Tag, kein Link zu Bookimed oder anderen Vergleichsportalen

---

## Daten im Repo

- `docs/gsc/` Search-Console-Exporte, 16 Monate und 3 Monate, plus Backlink-Stichprobe.
  `docs/gsc/README.md` sagt, was daran noch fehlt
- `docs/redirect-map.csv` die 301-Karte, 15 Alt-URLs, Quelle für `public/.htaccess`
- `docs/pre-launch.md` Backup- und Abnahmecheckliste

Aus den Suchdaten, weil es die Textarbeit steuert: Über 16 Monate 130 Klicks bei 12.645
Impressionen, Positionen zwischen 34 und 88 für die Kernbegriffe, in der Query-Liste
keine einzige Klick-Zuordnung. Stärkste Anfragen sind `dental implants los algodones
mexico` mit 879 Impressionen und `cosmetic dentistry los algodones mexico` mit 767.
Für Letzteres gibt es auf der alten Seite gar keine Seite. Die Nachfrage ist da, die
Seite fängt sie nicht ab.

---

## Was Melanie noch liefern muss

- [ ] Preisspannen für die wichtigsten Behandlungen
- [ ] Termine pro Tag und Dauer der Erstberatung, in Zahlen
- [ ] Adresse, Telefon, WhatsApp, Öffnungszeiten, Google Place ID
- [ ] Garantie- und Nachsorgeregelung im Klartext
- [ ] Implantatsysteme und Materialien
- [ ] Qualifikationen, Mitgliedschaften, Fortbildungen von Dr. Garibay
- [ ] Vorhandene Fotos, dann Entscheidung über das Shooting
- [ ] GSC-Bericht „Meistverlinkte Seiten", damit klar ist, welche Alt-URL die Backlinks trägt
- [ ] Zugang zur alten Seite für Backup, Mediathek und Crawl
- [ ] Hostinger-Zugang, plus Klärung, wo `contacto@softdentalcare.com` liegt.
      Wenn das Postfach beim alten Hoster bleibt, dürfen die MX-Einträge nicht mitwandern
- [ ] Aufbewahrungsfrist und Zugriffsberechtigte für die hochgeladenen Röntgenbilder
- [ ] Juristische Prüfung der Zweitmeinungs-Formulierungen

---

## Was die lokale Session kann, was die Cloud-Session nicht konnte

1. **softdentalcare.com aufrufen.** Für die Designübernahme zwingend
2. **Melanies Unterlagen lesen** unter
   `C:\Users\killa\Documents\Brains\04_Business\Zahnarztpraxen`.
   Mit `/add-dir` freigeben, dort liegen laut Melanie schon viele der offenen Angaben

---

## Befehle

| Befehl | Zweck |
| --- | --- |
| `npm install` | einmalig |
| `npm run dev` | Entwicklungsserver auf localhost:4321 |
| `npm run build` | statischer Build nach `dist/` |
| `npm run check` | Astro-Typprüfung |
| `npm run todos` | listet alle offenen Stellen |
| `npm run preview:single` | packt den Build in eine einzelne HTML-Datei zum Herzeigen |
| `npm run redirects:htaccess` | baut `public/.htaccess` aus der Weiterleitungskarte neu |

Deployment: Inhalt von `dist/` nach `public_html`, `.htaccess` inklusive.

---

## Vorgeschlagene Reihenfolge

1. Design von der bestehenden Seite übernehmen. Farben und Schriften nach
   `src/styles/global.css`, Logo und Bilder in die eigene Installation
2. Backup der alten Seite anstoßen, läuft parallel
3. NAP-Daten in `src/data/site.ts`. Ein Eintrag füllt Footer, Kontaktseite und Schema
4. PHP-Handler und Upload bauen
5. Restliche Inhalte einsetzen, `npm run todos` abarbeiten
6. Deployen, Weiterleitungen mit Stichproben prüfen, E-Mail-Zustellung testen
