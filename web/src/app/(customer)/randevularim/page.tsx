"use client";

import { useState } from "react";
import { formatPrice, getService, getStaff, myAppointments, shopSettings } from "@/lib/mock-data";
import type { Appointment, AppointmentStatus } from "@/lib/types";

const statusLabel: Record<AppointmentStatus, string> = {
  pending: "Onay Bekliyor",
  confirmed: "Onaylandı",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
  no_show: "Gelmedi",
};

const statusClass: Record<AppointmentStatus, string> = {
  pending: "pending",
  confirmed: "confirmed",
  completed: "done",
  cancelled: "cancelled",
  no_show: "cancelled",
};

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function hoursUntil(appt: Appointment) {
  const dt = new Date(`${appt.date}T${appt.startTime}:00`);
  return (dt.getTime() - Date.now()) / (1000 * 60 * 60);
}

export default function RandevularimPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>(myAppointments);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const upcoming = appointments.filter((a) => a.status === "pending" || a.status === "confirmed");
  const past = appointments.filter((a) => a.status === "completed" || a.status === "cancelled" || a.status === "no_show");
  const list = tab === "upcoming" ? upcoming : past;

  function flashToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 3200);
  }

  function confirmCancel() {
    if (!cancelTarget) return;
    const eligible = hoursUntil(cancelTarget) >= shopSettings.cancellationWindowHours;
    setAppointments((list) =>
      list.map((a) => (a.id === cancelTarget.id ? { ...a, status: "cancelled", refundEligible: eligible } : a))
    );
    flashToast(
      eligible
        ? `Randevu iptal edildi — ${formatPrice(cancelTarget.depositAmount)} ön ödemeniz iade edilecek. Berbere bildirim gönderildi.`
        : `Randevu iptal edildi — ön ödeme iade edilmedi (6 saat kuralı). Berbere bildirim gönderildi.`
    );
    setCancelTarget(null);
  }

  const cancelHours = cancelTarget ? hoursUntil(cancelTarget) : 0;
  const cancelEligible = cancelHours >= shopSettings.cancellationWindowHours;

  return (
    <>
      <h1 className="h1">Randevularım</h1>
      <div className="segmented" style={{ marginTop: 14 }}>
        <button className={tab === "upcoming" ? "active" : ""} onClick={() => setTab("upcoming")} type="button">
          Yaklaşan
        </button>
        <button className={tab === "past" ? "active" : ""} onClick={() => setTab("past")} type="button">
          Geçmiş
        </button>
      </div>

      {list.length === 0 && <p className="p-muted">Bu kategoride randevu yok.</p>}

      {list.map((a) => {
        const service = getService(a.serviceId);
        const barber = getStaff(a.staffId);
        return (
          <div key={a.id} className="appt-card" style={{ opacity: a.status === "completed" ? 0.7 : 1 }}>
            <div className="top">
              <div>
                <div className="svc">{service?.name}</div>
                <div className="meta">
                  {barber?.name} · {formatDate(a.date)}, {a.startTime} · {formatPrice(a.price)}
                </div>
                {a.status === "cancelled" && a.refundEligible !== undefined && (
                  <div className="meta" style={{ color: a.refundEligible ? "var(--moss)" : "var(--rust)", marginTop: 2 }}>
                    {a.refundEligible
                      ? `${formatPrice(a.depositAmount)} ön ödeme iade edildi`
                      : `${formatPrice(a.depositAmount)} ön ödeme iade edilmedi`}
                  </div>
                )}
              </div>
              <span className={`pill ${statusClass[a.status]}`}>{statusLabel[a.status]}</span>
            </div>
            <div className="row-actions">
              {a.status === "confirmed" && (
                <>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} type="button">
                    Yeniden Planla
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} type="button" onClick={() => setCancelTarget(a)}>
                    İptal Et
                  </button>
                </>
              )}
              {a.status === "pending" && (
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} type="button" onClick={() => setCancelTarget(a)}>
                  İptal Et
                </button>
              )}
              {a.status === "completed" && (
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} type="button">
                  Tekrar Randevu Al
                </button>
              )}
            </div>
          </div>
        );
      })}

      {cancelTarget && (
        <div
          onClick={() => setCancelTarget(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(23,20,15,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="panel"
            style={{ width: 340, background: "var(--surface)", boxShadow: "var(--shadow)" }}
          >
            <h3 style={{ margin: "0 0 10px" }}>Randevuyu iptal et</h3>

            {cancelEligible ? (
              <div className="deposit-note">
                <span className="g">✅</span>
                <span>
                  Randevunuza yaklaşık <b>{Math.max(0, Math.round(cancelHours))} saat</b> var — ücretsiz iptal hakkınız
                  içindesiniz. <b>{formatPrice(cancelTarget.depositAmount)}</b> ön ödemeniz tam olarak iade edilecek.
                </span>
              </div>
            ) : (
              <div className="deposit-note" style={{ background: "rgba(169,74,46,.1)", borderColor: "rgba(169,74,46,.35)" }}>
                <span className="g">⚠️</span>
                <span>
                  Randevunuza <b>{Math.max(0, cancelHours).toFixed(1)} saat</b> kaldı. Ücretsiz iptal süresi — randevudan{" "}
                  <b>{shopSettings.cancellationWindowHours} saat</b> öncesine kadar — doldu. Yine de iptal ederseniz{" "}
                  <b>{formatPrice(cancelTarget.depositAmount)}</b> ön ödemeniz iade edilmeyecek.
                </span>
              </div>
            )}

            <p className="fineprint" style={{ marginTop: 0 }}>
              Berber bu iptalden anında bildirimle haberdar edilir.
            </p>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} type="button" onClick={() => setCancelTarget(null)}>
                Vazgeç
              </button>
              <button
                className="btn btn-sm"
                style={{ flex: 1, background: cancelEligible ? "var(--accent)" : "var(--rust)", color: "#fff" }}
                type="button"
                onClick={confirmCancel}
              >
                {cancelEligible ? "Evet, iptal et" : "Yine de iptal et"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast${toast ? " show" : ""}`}>
        <span>❌</span>
        <span>{toast}</span>
      </div>
    </>
  );
}
