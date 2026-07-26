"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/panel", label: "Takvim", glyph: "▦" },
  { href: "/panel/hizmetler", label: "Hizmetler", glyph: "✂" },
  { href: "/panel/berberler", label: "Berberler", glyph: "◐" },
  { href: "/panel/musteriler", label: "Müşteriler", glyph: "☰" },
  { href: "/panel/analitik", label: "Analitik", glyph: "◈" },
  { href: "/panel/ayarlar", label: "Ayarlar", glyph: "⚙" },
];

export default function PanelNav() {
  const pathname = usePathname();

  return (
    <nav>
      {items.map((item) => {
        const on = item.href === "/panel" ? pathname === "/panel" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={on ? "on" : ""}>
            <span className="g">{item.glyph}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
