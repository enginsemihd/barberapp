import Link from "next/link";
import { formatPrice, services, shopSettings, staff } from "@/lib/mock-data";

export default function HomePage() {
  const featured = services.filter((s) => s.active).slice(0, 3);

  return (
    <>
      <div className="hero">
        <div className="mark">{shopSettings.name}</div>
        <h1>
          Koltuğunuz sizi
          <br />
          bekliyor.
        </h1>
        <p>
          {shopSettings.address} — {shopSettings.hours}
        </p>
        <Link href="/randevu-al" className="btn btn-primary">
          Randevu Al
        </Link>
      </div>

      <div className="infobar">
        <span>
          Bugün açık · <b>20:00&apos;a kadar</b>
        </span>
        <span>
          <b>{shopSettings.rating}</b> ★ ({shopSettings.reviewCount})
        </span>
      </div>

      <div className="trustline">
        <span className="g">💬</span>Randevu onayı ve hatırlatmalar WhatsApp/SMS ile gönderilir
      </div>
      <div className="trustline">
        <span className="g">💳</span>Randevu için %{shopSettings.depositPercent} ön ödeme, kalanı dükkanda
      </div>

      <div className="section-title">
        <h2>Öne Çıkan Hizmetler</h2>
      </div>
      <div className="hscroll">
        {featured.map((s) => (
          <Link key={s.id} href="/randevu-al" className="svc-chip">
            <div className="icon">{s.icon}</div>
            <div className="name">{s.name}</div>
            <div className="meta">
              {s.durationMinutes} dk · {formatPrice(s.price)}
            </div>
          </Link>
        ))}
      </div>

      <div className="section-title">
        <h2>Ustalarımız</h2>
        <Link href="/randevu-al">Tümü</Link>
      </div>
      <div className="barberrow">
        {staff.map((b) => (
          <Link key={b.id} href="/randevu-al" className="barber-mini">
            <div className="avatar" style={{ background: b.color }}>
              {b.initial}
            </div>
            <div className="name">{b.name.split(" ")[0]}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
