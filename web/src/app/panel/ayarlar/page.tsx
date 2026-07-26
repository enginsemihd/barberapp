import { shopSettings } from "@/lib/mock-data";

export default function AyarlarPage() {
  return (
    <>
      <div className="app-header">
        <h1>Dükkan Ayarları</h1>
        <button className="btn btn-ghost btn-sm" type="button">
          Düzenle
        </button>
      </div>
      <div className="app-content">
        <div className="panel-row">
          <div className="panel">
            <h3>Dükkan Bilgisi</h3>
            <div className="summary-card">
              <div className="summary-line">
                <span className="k">Ad</span>
                <span className="v">{shopSettings.name}</span>
              </div>
              <div className="summary-line">
                <span className="k">Adres</span>
                <span className="v">{shopSettings.address}</span>
              </div>
              <div className="summary-line">
                <span className="k">Çalışma Saatleri</span>
                <span className="v">{shopSettings.hours}</span>
              </div>
              <div className="summary-line">
                <span className="k">Puan</span>
                <span className="v">
                  {shopSettings.rating} ★ ({shopSettings.reviewCount})
                </span>
              </div>
            </div>
          </div>
          <div className="panel">
            <h3>Randevu &amp; Ödeme</h3>
            <div className="summary-card">
              <div className="summary-line">
                <span className="k">Ön ödeme oranı</span>
                <span className="v">%{shopSettings.depositPercent}</span>
              </div>
              <div className="summary-line">
                <span className="k">Ücretsiz iptal penceresi</span>
                <span className="v">{shopSettings.cancellationWindowHours} saat önce</span>
              </div>
              <div className="summary-line">
                <span className="k">Ödeme sağlayıcı</span>
                <span className="v">iyzico</span>
              </div>
              <div className="summary-line">
                <span className="k">Bildirim kanalları</span>
                <span className="v">WhatsApp / SMS</span>
              </div>
            </div>
          </div>
        </div>
        <p className="p-muted" style={{ marginTop: 16 }}>
          Bu değerler şu an <code>lib/mock-data.ts</code> içinde sabit — Supabase projesi kurulup <code>shop_settings</code>{" "}
          tablosu bağlanınca buradan düzenlenebilir hale gelecek.
        </p>
      </div>
    </>
  );
}
