import { formatPrice, services } from "@/lib/mock-data";

export default function HizmetlerPage() {
  return (
    <>
      <div className="app-header">
        <h1>Hizmetler</h1>
        <button className="btn btn-primary btn-sm" type="button">
          + Hizmet Ekle
        </button>
      </div>
      <div className="app-content">
        <div className="toolbar">
          <input className="search" placeholder="Hizmet ara…" disabled />
          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{services.length} hizmet</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Hizmet</th>
              <th>Kategori</th>
              <th className="price">Süre</th>
              <th className="price">Fiyat</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.category}</td>
                <td className="price">{s.durationMinutes} dk</td>
                <td className="price">{formatPrice(s.price)}</td>
                <td>
                  <span className={`switch${s.active ? " on" : ""}`} />
                </td>
                <td style={{ color: "var(--accent)", fontWeight: 600, fontSize: 12 }}>Düzenle</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
