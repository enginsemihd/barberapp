"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Ana Sayfa", glyph: "⌂" },
  { href: "/randevu-al", label: "Randevu Al", glyph: "✂" },
  { href: "/randevularim", label: "Randevularım", glyph: "▤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottomnav">
      {tabs.map((tab) => {
        const on = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} className={`tab${on ? " on" : ""}`}>
            <span className="glyph">{tab.glyph}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
