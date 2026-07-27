"use client";

import { useState } from "react";
import { formatPrice, getService, getStaff, shopAppointments, staff } from "@/lib/mock-data";
import type { Appointment, AppointmentStatus } from "@/lib/types";

const GRID_START_MIN = 9 * 60;
const GRID_END_MIN = 19 * 60;
const PX_PER_HOUR = 64;
const PX_PER_MIN = PX_PER_HOUR / 60;
const SNAP_MIN = 15;
const MIN_DRAG_PX = SNAP_MIN * PX_PER_MIN; // below this, a pointer wiggle is a click, not a drag
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

function toHHMM(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function isDraggable(status: AppointmentStatus) {
  return status === "pending" || status === "confirmed";
}

interface DragState {
  id: string;
  startClientY: number;
  deltaY: number;
  draggable: boolean;
}

export default function TakvimPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(shopAppointments);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const dayAppointments = appointments.filter((a) => a.date === "2026-07-21");
  const selected = appointments.find((a) => a.id === selectedId) ?? null;

  function setStatus(id: string, status: AppointmentStatus) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  function flashToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2200);
  }

  function snappedRange(appt: Appointment, deltaY: number) {
    const duration = toMinutes(appt.endTime) - toMinutes(appt.startTime);
    const rawDelta = deltaY / PX_PER_MIN;
    const snappedDelta = Math.round(rawDelta / SNAP_MIN) * SNAP_MIN;
    let newStart = toMinutes(appt.startTime) + snappedDelta;
    newStart = Math.max(GRID_START_MIN, Math.min(newStart, GRID_END_MIN - duration));
    return { start: newStart, end: newStart + duration };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>, appt: Appointment) {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // capture is a nice-to-have (keeps drag tracking outside the block's
      // bounds); if the browser refuses it, the click/drag logic below still works
    }
    setDrag({ id: appt.id, startClientY: e.clientY, deltaY: 0, draggable: isDraggable(appt.status) });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>, appt: Appointment) {
    setDrag((prev) => {
      if (!prev || prev.id !== appt.id) return prev;
      return { ...prev, deltaY: e.clientY - prev.startClientY };
    });
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>, appt: Appointment) {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // already released or never captured — fine, proceed with click/drag logic
    }
    setDrag((prev) => {
      if (!prev || prev.id !== appt.id) return null;

      // Anything under one snap-unit of movement is click jitter, not an
      // intentional drag — always fall back to opening the detail modal.
      if (Math.abs(prev.deltaY) < MIN_DRAG_PX) {
        setSelectedId(appt.id);
        return null;
      }
      if (!prev.draggable) {
        flashToast("Bu randevu taşınamaz (tamamlandı/iptal edildi).");
        return null;
      }

      const { start, end } = snappedRange(appt, prev.deltaY);
      if (start === toMinutes(appt.startTime)) {
        setSelectedId(appt.id);
        return null;
      }

      const conflict = appointments.some(
        (a) =>
          a.id !== appt.id &&
          a.staffId === appt.staffId &&
          a.date === appt.date &&
          a.status !== "cancelled" &&
          start < toMinutes(a.endTime) &&
          toMinutes(a.startTime) < end
      );
      if (conflict) {
        flashToast("Çakışma var — o saat dolu.");
        return null;
      }

      const oldStart = appt.startTime;
      setAppointments((list) =>
        list.map((a) => (a.id === appt.id ? { ...a, startTime: toHHMM(start), endTime: toHHMM(end) } : a))
      );
      flashToast(`${appt.customerName}: ${oldStart} → ${toHHMM(start)} taşındı`);
      return null;
    });
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
          <span style={{ color: "var(--text-faint)" }}>🖐️ Sürükleyip saatini değiştirebilirsiniz</span>
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
                    const isDragging = drag?.id === a.id && drag.draggable && Math.abs(drag.deltaY) >= MIN_DRAG_PX;
                    const preview = isDragging ? snappedRange(a, drag!.deltaY) : null;
                    const top = ((toMinutes(a.startTime) - GRID_START_MIN) / 60) * PX_PER_HOUR + (preview ? preview.start - toMinutes(a.startTime) : 0) * PX_PER_MIN;
                    const height = ((toMinutes(a.endTime) - toMinutes(a.startTime)) / 60) * PX_PER_HOUR;
                    const service = getService(a.serviceId);
                    const statusClass = a.status === "confirmed" ? "confirmed" : a.status === "pending" ? "pending" : "cancelled";
                    return (
                      <div
                        key={a.id}
                        role="button"
                        tabIndex={0}
                        className={`appt-block ${statusClass}`}
                        style={{
                          top,
                          height: Math.max(height, 28),
                          cursor: isDraggable(a.status) ? (isDragging ? "grabbing" : "grab") : "pointer",
                          touchAction: "none",
                          userSelect: "none",
                          zIndex: isDragging ? 10 : undefined,
                          boxShadow: isDragging ? "var(--shadow)" : undefined,
                          opacity: isDragging ? 0.9 : undefined,
                        }}
                        onPointerDown={(e) => handlePointerDown(e, a)}
                        onPointerMove={(e) => handlePointerMove(e, a)}
                        onPointerUp={(e) => handlePointerUp(e, a)}
                      >
                        <div className="t">
                          {preview ? `${toHHMM(preview.start)}–${toHHMM(preview.end)}` : `${a.startTime}–${a.endTime}`}
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

      <div className={`toast${toast ? " show" : ""}`} style={{ position: "fixed", bottom: 24 }}>
        <span>🕓</span>
        <span>{toast}</span>
      </div>
    </>
  );
}
