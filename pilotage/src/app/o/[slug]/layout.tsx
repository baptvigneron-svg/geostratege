import Link from "next/link";
import { OrgNav } from "@/components/OrgNav";
import { getOrgContext } from "@/lib/access";
import { APP_NAME } from "@/lib/config";
import { db } from "@/lib/db";
import { can, ROLE_LABELS } from "@/lib/permissions";
import { signOut } from "../../(auth)/actions";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { user, org, membership } = await getOrgContext(slug);
  const orgs = await db.membership.findMany({
    where: { userId: user.id },
    include: { organization: { select: { slug: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const base = `/o/${slug}`;
  const links = [
    { href: base, label: "Accueil" },
    { href: `${base}/equipes`, label: "Équipes" },
    { href: `${base}/membres`, label: "Membres" },
  ];
  if (can(membership.role, "org.manage")) {
    links.push({ href: `${base}/journal`, label: "Journal" }, { href: `${base}/parametres`, label: "Paramètres" });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
          <Link href={base} className="text-lg font-semibold text-brand-700">
            {APP_NAME}
          </Link>
          {orgs.length > 1 ? (
            <details className="relative">
              <summary className="btn-secondary cursor-pointer list-none">{org.name} ▾</summary>
              <ul className="absolute z-10 mt-1 min-w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                {orgs.map((m) => (
                  <li key={m.organization.slug}>
                    <Link href={`/o/${m.organization.slug}`} className="block rounded px-3 py-2 text-sm hover:bg-slate-100">
                      {m.organization.name}
                    </Link>
                  </li>
                ))}
                <li className="border-t border-slate-100">
                  <Link href="/onboarding" className="block rounded px-3 py-2 text-sm text-brand-600 hover:bg-slate-100">
                    + Nouvelle entreprise
                  </Link>
                </li>
              </ul>
            </details>
          ) : (
            <span className="font-medium text-slate-700">{org.name}</span>
          )}
          <div className="flex-1">
            <OrgNav links={links} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/compte" className="text-slate-600 hover:text-slate-900">
              {user.name ?? user.email} · {ROLE_LABELS[membership.role]}
            </Link>
            <form action={signOut}>
              <button className="btn text-slate-600 hover:bg-slate-100">Déconnexion</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
