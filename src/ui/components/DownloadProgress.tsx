export function DownloadProgress({ value }: { value: number | null }) {
  if (value == null) return null;
  const pct = Math.round(value * 100);
  return (
    <div class="progress">
      <div class="progress-label">Modell wird geladen … {pct}%</div>
      <div class="progress-track">
        <div class="progress-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
