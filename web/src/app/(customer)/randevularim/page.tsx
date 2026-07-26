"use client";

import { useState } from "react";
import { formatPrice, getService, getStaff, myAppointments } from "@/lib/mock-data";
import type { AppointmentStatus } from "@/lib/types";

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

export default function RandevularimPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const upcoming = myAppointments.filter((a) => a.status === "pending" || a.status === "confirmed");
  const past = myAppointments.filter((a) => a.status === "completed" || a.status === "cancelled" || a.status === "no_show");
  const list = tab === "upcoming" ? upcoming : past;

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
              </div>
              <span className={`pill ${statusClass[a.status]}`}>{statusLabel[a.status]}</span>
            </div>
            <div className="row-actions">
              {a.status === "confirmed" && (
                <>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} type="button">
                    Yeniden Planla
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} type="button">
                    İptal Et
                  </button>
                </>
              )}
              {a.status === "pending" && (
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} type="button">
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
    </>
  );
}
