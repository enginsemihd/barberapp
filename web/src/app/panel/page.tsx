import { getService, shopAppointments, staff } from "@/lib/mock-data";

const GRID_START_MIN = 9 * 60;
const PX_PER_HOUR = 64;
const HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export default function TakvimPage() {
  const dayAppointments = shopAppointments.filter((a) => a.date === "2026-07-21");

  return (
    <>
      <div className="app-header">
        <div className="dateNav" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1>21–27 Temmuz</h1>
          <button
            type="button"
            style={{ border: "1px solid var(--border-strong)", background: "var(--surface)", width: 28, height: 28, borderRadius: 7, cursor: "pointer", color: "var(--text)" }}
          >
            ‹
          </button>
          <button
            type="button"
            style={{ border: "1px solid var(--border-strong)", background: "var(--surface)", width: 28, height: 28, borderRadius: 7, cursor: "pointer", color: "var(--text)" }}
          >
            ›
          </button>
        </div>
        <button className="btn btn-primary btn-sm" type="button">
          + Yeni Randevu
        </button>
      </div>
      <div className="app-content">
        <div className="legend">
          <span>
            <i style={{ background: "var(--moss)" }} />
            Onaylandı
          </span>
          <span>
            <i style={{ background: "var(--brass)" }} />
            Onay Bekliyor
          </span>
          <span>
            <i style={{ background: "var(--text-faint)" }} />
            İptal
          </span>
        </div>
        <div className="cal-wrap" style={{ ["--staff-count" as string]: staff.length }}>
          <div className="cal-head">
            <div />
            {staff.map((s) => (
              <div key={s.id} className="staffcol">
                <div className="avatar" style={{ background: s.color, width: 24, height: 24, fontSize: 10 }}>
                  {s.initial}
                </div>
                <div className="name">{s.name.split(" ")[0]}</div>
              </div>
            ))}
          </div>
          <div className="cal-body">
            <div className="cal-gutter">
              {HOURS.map((h) => (
                <div key={h} className="hr">
                  {h}
                </div>
              ))}
            </div>
            {staff.map((s) => (
              <div key={s.id} className="cal-col">
                {dayAppointments
                  .filter((a) => a.staffId === s.id)
                  .map((a) => {
                    const top = ((toMinutes(a.startTime) - GRID_START_MIN) / 60) * PX_PER_HOUR;
                    const height = ((toMinutes(a.endTime) - toMinutes(a.startTime)) / 60) * PX_PER_HOUR;
                    const service = getService(a.serviceId);
                    const statusClass = a.status === "confirmed" ? "confirmed" : a.status === "pending" ? "pending" : "cancelled";
                    return (
                      <div
                        key={a.id}
                        className={`appt-block ${statusClass}`}
                        style={{ top, height: Math.max(height, 28) }}
                      >
                        <div className="t">
                          {a.startTime}–{a.endTime}
                        </div>
                        <div className="n">{a.customerName}</div>
                        {height > 40 && <div className="s">{service?.name}</div>}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
