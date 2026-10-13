import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrgContext } from "@/lib/access";
import { AUDIT_LABELS } from "@/lib/audit-labels";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";

export const metadata = { title: "Journal" };

const PAGE_SIZE = 50;
const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" });

function describe(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const d = data as Record<string, unknown>;
  return ["name", "email", "to"]
    .map((k) => d[k])
    .filter((v): v is string => typeof v === "string")
    .join(" · ");
}

export default async function JournalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { org, membership } = await getOrgContext(slug);
  if (!can(membership.role, "org.manage")) notFound();

  const entries = await db.auditLog.findMany({
    where: { organizationId: org.id },
    include: { actor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE + 1,
  });
  const hasMore = entries.length > PAGE_SIZE;

  return (
    <section className="card">
      <h1 className="page-title mb-4">Journal d&apos;activité</h1>
      <ul className="divide-y divide-slate-100 text-sm">
        {entries.slice(0, PAGE_SIZE).map((e) => (
          <li key={e.id} className="flex flex-wrap gap-x-3 py-2">
            <span className="w-32 shrink-0 text-slate-500">{fmt.format(e.createdAt)}</span>
            <span>
              <strong>{e.actor?.name ?? e.actor?.email ?? "Compte supprimé"}</strong> {AUDIT_LABELS[e.action] ?? e.action}
              {describe(e.data) && <span className="text-slate-500"> — {describe(e.data)}</span>}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        {page > 1 && <Link className="btn-secondary" href={`?page=${page - 1}`}>← Plus récent</Link>}
        {hasMore && <Link className="btn-secondary" href={`?page=${page + 1}`}>Plus ancien →</Link>}
      </div>
    </section>
  );
}
