import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { TeamSelect } from "@/components/TeamSelect";
import { getOrgContext } from "@/lib/access";
import { db } from "@/lib/db";
import { can, ROLE_LABELS } from "@/lib/permissions";
import { addTeamMember, deleteTeam, removeTeamMember, updateTeam } from "../actions";

export default async function TeamPage({ params }: { params: Promise<{ slug: string; teamId: string }> }) {
  const { slug, teamId } = await params;
  const { org, membership } = await getOrgContext(slug);

  const team = await db.team.findFirst({
    where: { id: teamId, organizationId: org.id },
    include: {
      parent: { select: { id: true, name: true } },
      children: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
  if (!team) notFound();

  const manage = can(membership.role, "teams.manage");
  const [allTeams, orgMembers] = manage
    ? await Promise.all([
        db.team.findMany({ where: { organizationId: org.id }, select: { id: true, name: true, parentId: true } }),
        db.membership.findMany({ where: { organizationId: org.id }, include: { user: true } }),
      ])
    : [[], []];
  const roleByUser = new Map(orgMembers.map((m) => [m.userId, m.role]));
  const inTeam = new Set(team.members.map((m) => m.userId));
  const addable = orgMembers.filter((m) => !inTeam.has(m.userId));
  const members = [...team.members].sort((a, b) => (a.user.name ?? a.user.email).localeCompare(b.user.name ?? b.user.email, "fr"));

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/o/${slug}/equipes`} className="text-sm text-brand-600">← Équipes</Link>
        <h1 className="page-title mt-2">{team.name}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {team.parent ? (
            <>Escalade vers <Link className="text-brand-600" href={`/o/${slug}/equipes/${team.parent.id}`}>{team.parent.name}</Link></>
          ) : (
            "Équipe de premier niveau"
          )}
          {team.children.length > 0 && <> · Sous-équipes : {team.children.map((c) => c.name).join(", ")}</>}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="card">
          <h2 className="mb-4 text-lg font-semibold">Membres ({members.length})</h2>
          <ul className="divide-y divide-slate-100">
            {members.map((m) => (
              <li key={m.userId} className="flex min-h-[52px] items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{m.user.name ?? m.user.email}</p>
                  <p className="text-xs text-slate-500">
                    {m.user.email}
                    {roleByUser.get(m.userId) && <> · {ROLE_LABELS[roleByUser.get(m.userId)!]}</>}
                  </p>
                </div>
                {manage && (
                  <ActionForm action={removeTeamMember.bind(null, slug, team.id, m.userId)} showSuccess={false}>
                    <SubmitButton variant="secondary">Retirer</SubmitButton>
                  </ActionForm>
                )}
              </li>
            ))}
            {members.length === 0 && <li className="py-6 text-center text-sm text-slate-500">Aucun membre.</li>}
          </ul>
          {manage && addable.length > 0 && (
            <ActionForm action={addTeamMember.bind(null, slug, team.id)} className="mt-4 flex gap-2">
              <select name="userId" className="input" defaultValue="">
                <option value="" disabled>Ajouter un membre…</option>
                {addable.map((m) => (
                  <option key={m.userId} value={m.userId}>{m.user.name ?? m.user.email}</option>
                ))}
              </select>
              <SubmitButton className="shrink-0">Ajouter</SubmitButton>
            </ActionForm>
          )}
        </section>

        {manage && (
          <div className="space-y-6">
            <section className="card">
              <h2 className="mb-4 text-lg font-semibold">Paramètres</h2>
              <ActionForm action={updateTeam.bind(null, slug, team.id)} className="space-y-4">
                <div>
                  <label className="label" htmlFor="name">Nom</label>
                  <input id="name" name="name" required maxLength={80} defaultValue={team.name} className="input" />
                </div>
                <div>
                  <label className="label">Rattachée à</label>
                  <TeamSelect teams={allTeams} name="parentId" defaultValue={team.parentId} excludeId={team.id} />
                </div>
                <SubmitButton className="w-full">Enregistrer</SubmitButton>
              </ActionForm>
            </section>
            <section className="card">
              <h2 className="mb-2 text-lg font-semibold">Supprimer l&apos;équipe</h2>
              <p className="mb-4 text-sm text-slate-600">Possible uniquement si elle n&apos;a pas de sous-équipe.</p>
              <ActionForm action={deleteTeam.bind(null, slug, team.id)} confirm={`Supprimer l'équipe « ${team.name} » ?`}>
                <SubmitButton variant="danger" className="w-full">Supprimer</SubmitButton>
              </ActionForm>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
