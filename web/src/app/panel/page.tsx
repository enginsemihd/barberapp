"use client";

import { useState } from "react";
import { formatPrice, getService, getStaff, shopAppointments, staff } from "@/lib/mock-data";
import type { Appointment, AppointmentStatus } from "@/lib/types";

const GRID_START_MIN = 9 * 60;
const PX_PER_HOUR = 64;
const HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const statusLabel: Record<AppointmentStatus, string> = {
  pending: "Onay Bekliyor",
  confirmed: "Onaylandı",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
  no_show: "Gelmedi",
};

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export default function TakvimPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(shopAppointments);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const dayAppointments = appointments.filter((a) => a.date === "2026-07-21");
  const selected = appointments.find((a) => a.id === selectedId) ?? null;

  function setStatus(id: string, status: AppointmentStatus) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

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
                        role="button"
                        tabIndex={0}
                        className={`appt-block ${statusClass}`}
                        style={{ top, height: Math.max(height, 28) }}
                        onClick={() => setSelectedId(a.id)}
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

      {selected && (
        <div
          onClick={() => setSelectedId(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(23,20,15,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="panel"
            style={{ width: 360, background: "var(--surface)", boxShadow: "var(--shadow)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>{selected.customerName}</h3>
              <span className={`pill ${selected.status === "confirmed" ? "confirmed" : selected.status === "pending" ? "pending" : selected.status === "completed" ? "done" : "cancelled"}`}>
                {statusLabel[selected.status]}
              </span>
            </div>
            <div className="summary-card" style={{ marginBottom: 14 }}>
              <div className="summary-line">
                <span className="k">Hizmet</span>
                <span className="v">{getService(selected.serviceId)?.name}</span>
              </div>
              <div className="summary-line">
                <span className="k">Usta</span>
                <span className="v">{getStaff(selected.staffId)?.name}</span>
              </div>
              <div className="summary-line">
                <span className="k">Saat</span>
                <span className="v tabular">
                  {selected.startTime} – {selected.endTime}
                </span>
              </div>
              <div className="summary-line">
                <span className="k">Ücret</span>
                <span className="v">{formatPrice(selected.price)}</span>
              </div>
              <div className="summary-line">
                <span className="k">Ön ödeme</span>
                <span className="v">
                  {formatPrice(selected.depositAmount)} · {selected.paymentStatus === "deposit_paid" ? "alındı" : selected.paymentStatus === "paid_in_full" ? "tamamlandı" : "alınmadı"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selected.status === "pending" && (
                <button className="btn btn-primary btn-sm" type="button" onClick={() => setStatus(selected.id, "confirmed")}>
                  Onayla
                </button>
              )}
              {selected.status === "confirmed" && (
                <>
                  <button className="btn btn-primary btn-sm" type="button" onClick={() => setStatus(selected.id, "completed")}>
                    Tamamlandı İşaretle
                  </button>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setStatus(selected.id, "no_show")}>
                    Gelmedi İşaretle
                  </button>
                </>
              )}
              {selected.status !== "cancelled" && selected.status !== "completed" && (
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setStatus(selected.id, "cancelled")}>
                  İptal Et
                </button>
              )}
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSelectedId(null)} style={{ marginLeft: "auto" }}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
