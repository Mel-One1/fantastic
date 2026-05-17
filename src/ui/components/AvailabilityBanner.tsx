import {
  isUsable,
  statusReason,
  type Capabilities,
} from '../../ai/capabilities';

export function AvailabilityBanner({ caps }: { caps: Capabilities }) {
  const promptOk = isUsable(caps.prompt);
  const translatorOk = isUsable(caps.translator);

  if (promptOk && translatorOk) {
    return (
      <div class="banner banner-ok">
        KI bereit. Verständnisfragen &amp; automatische Übersetzung aktiv.
      </div>
    );
  }

  return (
    <div class="banner banner-warn">
      {!promptOk && <div>Verständnisfragen aus: {statusReason(caps.prompt)}</div>}
      {!translatorOk && (
        <div>
          Auto-Übersetzung aus: {statusReason(caps.translator)} Du kannst
          Übersetzungen manuell eintragen.
        </div>
      )}
      <div class="banner-note">
        Lückentext, Zuordnung &amp; Karteikarten funktionieren trotzdem.
      </div>
    </div>
  );
}
