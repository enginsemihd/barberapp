const dailyRevenue = [
  { label: "Pzt", pct: 58 },
  { label: "Sal", pct: 71 },
  { label: "Çar", pct: 44 },
  { label: "Per", pct: 80 },
  { label: "Cum", pct: 93 },
  { label: "Cmt", pct: 100 },
  { label: "Paz", pct: 36 },
];

const popularServices = [
  { name: "Saç Kesimi", count: 38 },
  { name: "Saç + Sakal", count: 27 },
  { name: "Sakal Tıraşı", count: 19 },
  { name: "Ustura Sakal", count: 8 },
  { name: "Çocuk Kesimi", count: 4 },
];

export default function AnalitikPage() {
  return (
    <>
      <div className="app-header">
        <h1>Analitik</h1>
        <div className="viewToggle" style={{ display: "inline-flex", background: "var(--surface-2)", borderRadius: 8, padding: 3 }}>
          <button
            type="button"
            className="active"
            style={{ border: "none", background: "var(--surface)", padding: "6px 12px", fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: "pointer", color: "var(--text)" }}
          >
            Bu Hafta
          </button>
          <button
            type="button"
            style={{ border: "none", background: "transparent", padding: "6px 12px", fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: "pointer", color: "var(--text-muted)" }}
          >
            Bu Ay
          </button>
        </div>
      </div>
      <div className="app-content">
        <div className="stat-row">
          <div className="stat-tile">
            <div className="label">Gelir</div>
            <div className="value">34.180₺</div>
            <div className="delta up">↑ %12 geçen haftaya göre</div>
          </div>
          <div className="stat-tile">
            <div className="label">Randevu Sayısı</div>
            <div className="value">96</div>
            <div className="delta up">↑ %6</div>
          </div>
          <div className="stat-tile">
            <div className="label">Doluluk Oranı</div>
            <div className="value">%78</div>
            <div className="delta down">↓ %3</div>
          </div>
          <div className="stat-tile">
            <div className="label">İptal / No-show</div>
            <div className="value">7</div>
            <div className="delta down">↓ %2</div>
          </div>
        </div>
        <div className="panel-row">
          <div className="panel">
            <h3>Günlük Gelir</h3>
            <div className="bars">
              {dailyRevenue.map((d) => (
                <div key={d.label} className="bar">
                  <div className="fill" style={{ height: `${d.pct}%` }} />
                  <div className="lbl">{d.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <h3>Popüler Hizmetler</h3>
            <div className="ranklist">
              {popularServices.map((s, i) => (
                <div key={s.name} className="row">
                  <span className="rk">{String(i + 1).padStart(2, "0")}</span>
                  <span className="nm">{s.name}</span>
                  <span className="ct">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
