import { customers } from "@/lib/mock-data";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

export default function MusterilerPage() {
  return (
    <>
      <div className="app-header">
        <h1>Müşteriler</h1>
      </div>
      <div className="app-content">
        <div className="toolbar">
          <input className="search" placeholder="Müşteri ara…" disabled />
          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{customers.length} müşteri</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Müşteri</th>
              <th>Telefon</th>
              <th>Bildirim Kanalı</th>
              <th className="price">Ziyaret</th>
              <th>Son Ziyaret</th>
              <th>Not</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="price">{c.phone}</td>
                <td>{c.notificationChannel === "whatsapp" ? "💬 WhatsApp" : "✉️ SMS"}</td>
                <td className="price">{c.totalVisits}</td>
                <td>{formatDate(c.lastVisit)}</td>
                <td style={{ color: "var(--text-faint)", fontSize: 12 }}>{c.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
