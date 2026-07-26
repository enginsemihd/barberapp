import type { Metadata } from "next";
import PanelNav from "@/components/PanelNav";

export const metadata: Metadata = {
  title: "USTA Panel",
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand">USTA</div>
        <PanelNav />
        <div className="who">
          <div className="avatar" style={{ background: "var(--accent)", width: 30, height: 30, fontSize: 12 }}>
            M
          </div>
          <div>
            <div className="name">Mert Usta</div>
            <div className="role">İşletme Sahibi</div>
          </div>
        </div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
