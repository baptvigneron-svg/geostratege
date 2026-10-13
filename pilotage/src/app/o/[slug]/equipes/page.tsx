import Link from "next/link";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { TeamSelect } from "@/components/TeamSelect";
import { getOrgContext } from "@/lib/access";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { buildTeamTree, flattenTree } from "@/lib/teams";
import { createTeam } from "./actions";

export const metadata = { title: "Équipes" };

export default async function TeamsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { org, membership } = await getOrgContext(slug);
  const teams = await db.team.findMany({
    where: { organizationId: org.id },
    select: { id: true, name: true, parentId: true, _count: { select: { members: true } } },
  });
  const flat = flattenTree(buildTeamTree(teams));
  const manage = can(membership.role, "teams.manage");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="card">
        <h1 className="page-title mb-1">Équipes</h1>
        <p className="mb-4 text-sm text-slate-600">
          L&apos;arborescence définit le chemin des escalades : une équipe escalade vers son équipe parente.
        </p>
        <ul className="divide-y divide-slate-100">
          {flat.map((t) => (
            <li key={t.id}>
              <Link
                href={`/o/${slug}/equipes/${t.id}`}
                className="flex min-h-[52px] items-center justify-between px-2 hover:bg-slate-50"
                style={{ paddingLeft: `${0.5 + t.depth * 1.5}rem` }}
              >
                <span className="font-medium">
                  {t.depth > 0 && <span className="mr-2 text-slate-400">↳</span>}
                  {t.name}
                </span>
                <span className="text-sm text-slate-500">{t._count.members} membre{t._count.members > 1 ? "s" : ""}</span>
              </Link>
            </li>
          ))}
          {flat.length === 0 && <li className="py-6 text-center text-sm text-slate-500">Aucune équipe pour le moment.</li>}
        </ul>
      </section>

      {manage && (
        <section className="card h-fit">
          <h2 className="mb-4 text-lg font-semibold">Nouvelle équipe</h2>
          <ActionForm action={createTeam.bind(null, slug)} resetOnSuccess className="space-y-4">
            <div>
              <label className="label" htmlFor="name">Nom</label>
              <input id="name" name="name" required maxLength={80} className="input" placeholder="ex. Atelier usinage" />
            </div>
            <div>
              <label className="label">Rattachée à</label>
              <TeamSelect teams={teams} name="parentId" />
            </div>
            <SubmitButton className="w-full">Créer l&apos;équipe</SubmitButton>
          </ActionForm>
        </section>
      )}
    </div>
  );
}
