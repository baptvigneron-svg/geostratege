"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function OrgNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto">
      {links.map((l, i) => {
        // Le premier lien (accueil) n'est actif que sur sa page exacte.
        const active = i === 0 ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`btn whitespace-nowrap ${active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
