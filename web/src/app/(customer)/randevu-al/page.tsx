"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatPrice,
  fullSlots,
  getService,
  getStaff,
  services,
  shopSettings,
  staff,
  timeSlots,
} from "@/lib/mock-data";
import type { ServiceCategory } from "@/lib/types";

type Channel = "wa" | "sms";

const categories: ServiceCategory[] = ["Saç", "Sakal", "Paketler"];

function nextDays(count: number) {
  const days = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  const out: { iso: string; label: string; num: number }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({ iso: d.toISOString().slice(0, 10), label: days[d.getDay()], num: d.getDate() });
  }
  return out;
}

export default function RandevuAlPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string>("sac-kesimi");
  const [staffId, setStaffId] = useState<string>("any");
  const dates = useMemo(() => nextDays(6), []);
  const [dateIso, setDateIso] = useState(dates[0].iso);
  const [time, setTime] = useState("14:30");
  const [channel, setChannel] = useState<Channel>("wa");
  const [showToast, setShowToast] = useState(false);

  const service = getService(serviceId);
  const chosenStaff = staffId === "any" ? null : getStaff(staffId);
  const depositAmount = service ? Math.round((service.price * shopSettings.depositPercent) / 100) : 0;
  const remainder = service ? service.price - depositAmount : 0;

  const dateLabel = useMemo(() => {
    const d = new Date(dateIso + "T00:00:00");
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
  }, [dateIso]);

  function endTime(start: string, durationMinutes: number) {
    const [h, m] = start.split(":").map(Number);
    const total = h * 60 + m + durationMinutes;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  function handleConfirm() {
    setShowToast(true);
    setTimeout(() => {
      router.push("/randevularim");
    }, 900);
  }

  return (
    <>
      {step === 1 && (
        <section>
          <div className="h-eyebrow">Adım 1 / 4</div>
          <h1 className="h1">Hizmet seçin</h1>
          <p className="p-muted">Devam etmeden önce bir hizmet seçin.</p>

          {categories.map((cat) => {
            const items = services.filter((s) => s.category === cat && s.active);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <div className="cat-label">{cat}</div>
                {items.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`svc-row${serviceId === s.id ? " sel" : ""}`}
                    onClick={() => setServiceId(s.id)}
                  >
                    <div className="radio" />
                    <div className="body">
                      <div className="name">{s.name}</div>
                      <div className="dur">{s.durationMinutes} dk</div>
                    </div>
                    <div className="price">{formatPrice(s.price)}</div>
                  </button>
                ))}
              </div>
            );
          })}

          <div className="stickybar">
            <div className="sum">
              1 hizmet seçildi
              <b>
                {service ? formatPrice(service.price) : ""} · {service?.durationMinutes} dk
              </b>
            </div>
            <button className="btn btn-primary" type="button" onClick={() => setStep(2)} disabled={!service}>
              Devam Et
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <div className="h-eyebrow">Adım 2 / 4</div>
          <h1 className="h1">Ustanızı seçin</h1>
          <p className="p-muted" style={{ marginBottom: 16 }}>
            {service?.name} için müsait ustalar.
          </p>

          <button type="button" className={`barber-card any${staffId === "any" ? " sel" : ""}`} onClick={() => setStaffId("any")}>
            <div className="avatar" style={{ background: "var(--ink)", color: "#F1E9D8" }}>
              ?
            </div>
            <div>
              <div className="name">Farketmez</div>
              <div className="tag">İlk müsait usta</div>
            </div>
            <div className="next">
              <span>Bugün</span>
              <b>14:30</b>
            </div>
          </button>

          {staff.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`barber-card${staffId === b.id ? " sel" : ""}`}
              onClick={() => setStaffId(b.id)}
            >
              <div className="avatar" style={{ background: b.color }}>
                {b.initial}
              </div>
              <div>
                <div className="name">{b.name}</div>
                <div className="tag">{b.tag}</div>
              </div>
              <div className="next">
                <span>Bugün</span>
                <b>15:00</b>
              </div>
            </button>
          ))}

          <div className="stickybar" style={{ borderTop: "none" }}>
            <div />
            <button className="btn btn-primary" style={{ width: "100%" }} type="button" onClick={() => setStep(3)}>
              Devam Et
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          <div className="h-eyebrow">Adım 3 / 4</div>
          <h1 className="h1">Tarih ve saat</h1>
          <p className="p-muted" style={{ marginBottom: 14 }}>
            {chosenStaff ? chosenStaff.name : "İlk müsait usta"} · {service?.name} ({service?.durationMinutes} dk)
          </p>

          <div className="datestrip">
            {dates.map((d) => (
              <button
                key={d.iso}
                type="button"
                className={`datecell${dateIso === d.iso ? " sel" : ""}`}
                onClick={() => setDateIso(d.iso)}
              >
                <div className="d">{d.label}</div>
                <div className="n">{d.num}</div>
              </button>
            ))}
          </div>

          <div className="cat-label" style={{ marginTop: 0 }}>
            Müsait Saatler
          </div>
          <div className="timegrid">
            {timeSlots.map((t) => {
              const full = fullSlots.has(t);
              return (
                <button
                  key={t}
                  type="button"
                  disabled={full}
                  className={`timeslot${time === t ? " sel" : ""}${full ? " full" : ""}`}
                  onClick={() => setTime(t)}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div className="stickybar">
            <div className="sum">
              Seçilen
              <b>
                {dates.find((d) => d.iso === dateIso)?.num} · {time}
              </b>
            </div>
            <button className="btn btn-primary" type="button" onClick={() => setStep(4)}>
              Devam Et
            </button>
          </div>
        </section>
      )}

      {step === 4 && service && (
        <section style={{ position: "relative" }}>
          <div className="h-eyebrow">Adım 4 / 4</div>
          <h1 className="h1">Randevu özeti</h1>

          <div className="summary-card" style={{ margin: "14px 0" }}>
            <div className="summary-line">
              <span className="k">Hizmet</span>
              <span className="v">{service.name}</span>
            </div>
            <div className="summary-line">
              <span className="k">Usta</span>
              <span className="v">{chosenStaff ? chosenStaff.name : "İlk müsait usta"}</span>
            </div>
            <div className="summary-line">
              <span className="k">Tarih</span>
              <span className="v">{dateLabel}</span>
            </div>
            <div className="summary-line">
              <span className="k">Saat</span>
              <span className="v tabular">
                {time} – {endTime(time, service.durationMinutes)}
              </span>
            </div>
            <div className="summary-line">
              <span className="k">Şimdi (%{shopSettings.depositPercent} ön ödeme)</span>
              <span className="v">{formatPrice(depositAmount)}</span>
            </div>
            <div className="summary-line">
              <span className="k">Dükkanda ödenecek</span>
              <span className="v">{formatPrice(remainder)}</span>
            </div>
            <div className="total-line">
              <span>Toplam</span>
              <span className="v">{formatPrice(service.price)}</span>
            </div>
          </div>

          <div className="deposit-note">
            <span className="g">💳</span>
            <span>
              Randevunuzu garanti altına almak için <b>{formatPrice(depositAmount)} (%{shopSettings.depositPercent})</b> ön ödeme
              alınır. Kalan <b>{formatPrice(remainder)}</b> hizmet sonunda dükkanda ödenir.
            </span>
          </div>

          <div className="paymethod">
            <div className="card-ico">VISA</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>•••• 4242</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)" }}>Kayıtlı kart</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, cursor: "pointer" }}>Değiştir</span>
          </div>

          <div className="cat-label" style={{ marginTop: 18 }}>
            Onay &amp; hatırlatma nereden gönderilsin?
          </div>
          <div className="channel-toggle">
            <button type="button" className={`ch-opt${channel === "wa" ? " sel" : ""}`} onClick={() => setChannel("wa")}>
              <span className="ico">💬</span>WhatsApp
            </button>
            <button
              type="button"
              data-ch="sms"
              className={`ch-opt${channel === "sms" ? " sel" : ""}`}
              onClick={() => setChannel("sms")}
            >
              <span className="ico">✉️</span>SMS
            </button>
          </div>

          <div className="msg-preview">
            <div className="msg-preview-head">
              <span className="dot-ico" style={{ background: channel === "sms" ? "var(--accent)" : "#3FA746" }}>
                {channel === "sms" ? "✉️" : "💬"}
              </span>
              <span>{channel === "sms" ? "SMS Bildirimi" : "USTA Berber Salonu"}</span>
            </div>
            <div className={`chat-bubble${channel === "sms" ? " sms" : ""}`}>
              <p>
                ✅ Randevunuz onaylandı! {formatPrice(depositAmount)} ön ödemeniz alındı.
                <br />
                <b>{dateLabel}, {time}</b>
                <br />
                {chosenStaff ? chosenStaff.name : "İlk müsait usta"} · {service.name} ({formatPrice(service.price)}, kalan{" "}
                {formatPrice(remainder)} dükkanda)
                <br />
                📍 {shopSettings.address}
              </p>
              <span className="ts">
                {time} {channel === "wa" && <span className="check">✓✓</span>}
              </span>
            </div>
            <p className="preview-hint">Randevudan 24 saat ve 2 saat önce otomatik hatırlatma da aynı kanaldan gönderilir.</p>
          </div>

          <button className="btn btn-primary" style={{ width: "100%" }} type="button" onClick={handleConfirm}>
            {formatPrice(depositAmount)} Öde ve Onayla
          </button>
          <p className="fineprint">
            Randevu saatinden {shopSettings.cancellationWindowHours} saat öncesine kadar ücretsiz iptal edebilirsiniz. Daha
            geç iptallerde ön ödeme iade edilmez.
          </p>

          <div className={`toast${showToast ? " show" : ""}`}>
            <span>✅</span>
            <span>
              {formatPrice(depositAmount)} ön ödeme alındı — {channel === "sms" ? "SMS ile" : "WhatsApp'tan"} onay gönderildi.
            </span>
          </div>
        </section>
      )}
    </>
  );
}
