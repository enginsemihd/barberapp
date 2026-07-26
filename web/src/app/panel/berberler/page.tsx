import { staff } from "@/lib/mock-data";

const dayLetters = ["P", "S", "Ç", "P", "C", "C", "P"];

export default function BerberlerPage() {
  return (
    <>
      <div className="app-header">
        <h1>Berberler</h1>
        <button className="btn btn-primary btn-sm" type="button">
          + Berber Ekle
        </button>
      </div>
      <div className="app-content">
        <div className="staffgrid">
          {staff.map((s) => (
            <div key={s.id} className="staffcard">
              <div className="avatar" style={{ background: s.color }}>
                {s.initial}
              </div>
              <div className="name">{s.name}</div>
              <div className="role">{s.role === "owner" ? "İşletme Sahibi · Berber" : "Berber"}</div>
              <div className="days">
                {dayLetters.map((letter, i) => (
                  <span key={i} className={s.days.includes(i) ? "on" : ""}>
                    {letter}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{s.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
