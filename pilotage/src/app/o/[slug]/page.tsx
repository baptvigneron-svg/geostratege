import Link from "next/link";
import { getOrgContext } from "@/lib/access";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { buildTeamTree, flattenTree } from "@/lib/teams";

export default async function OrgHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { user, org, membership } = await getOrgContext(slug);

  const [teams, memberCount, myTeamIds] = await Promise.all([
    db.team.findMany({
      where: { organizationId: org.id },
      select: { id: true, name: true, parentId: true, _count: { select: { members: true } } },
    }),
    db.membership.count({ where: { organizationId: org.id } }),
    db.teamMember.findMany({ where: { userId: user.id, team: { organizationId: org.id } }, select: { teamId: true } }),
  ]);
  const mine = new Set(myTeamIds.map((t) => t.teamId));
  const flat = flattenTree(buildTeamTree(teams));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">{org.name}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {teams.length} équipe{teams.length > 1 ? "s" : ""} · {memberCount} membre{memberCount > 1 ? "s" : ""}
        </p>
      </div>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Organisation des équipes</h2>
          {can(membership.role, "teams.manage") && (
            <Link href={`/o/${slug}/equipes`} className="btn-secondary">Gérer les équipes</Link>
          )}
        </div>
        <ul className="space-y-1">
          {flat.map((t) => (
            <li key={t.id} style={{ paddingLeft: `${t.depth * 1.5}rem` }}>
              <Link
                href={`/o/${slug}/equipes/${t.id}`}
                className="flex min-h-[44px] items-center justify-between rounded-lg px-3 hover:bg-slate-50"
              >
                <span className="font-medium">
                  {t.depth > 0 && <span className="mr-2 text-slate-400">↳</span>}
                  {t.name}
                  {mine.has(t.id) && <span className="ml-2 rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">mon équipe</span>}
                </span>
                <span className="text-sm text-slate-500">{t._count.members} membre{t._count.members > 1 ? "s" : ""}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
