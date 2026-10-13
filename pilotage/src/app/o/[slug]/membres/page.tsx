import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { getOrgContext } from "@/lib/access";
import { db } from "@/lib/db";
import { can, ROLE_DESCRIPTIONS, ROLE_LABELS, ROLES } from "@/lib/permissions";
import { changeRole, createInvitation, removeMember, revokeInvitation } from "./actions";
import { InviteForm } from "./InviteForm";

export const metadata = { title: "Membres" };

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export default async function MembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { user, org, membership } = await getOrgContext(slug);
  const manage = can(membership.role, "members.manage");

  const [members, invitations] = await Promise.all([
    db.membership.findMany({
      where: { organizationId: org.id },
      include: { user: { select: { name: true, email: true } } },
    }),
    manage
      ? db.invitation.findMany({ where: { organizationId: org.id, acceptedAt: null }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
  ]);
  members.sort((a, b) => (a.user.name ?? a.user.email).localeCompare(b.user.name ?? b.user.email, "fr"));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="card">
          <h1 className="page-title mb-4">Membres ({members.length})</h1>
          <ul className="divide-y divide-slate-100">
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">
                    {m.user.name ?? m.user.email}
                    {m.userId === user.id && <span className="ml-2 text-xs text-slate-500">(vous)</span>}
                  </p>
                  <p className="text-xs text-slate-500">{m.user.email}</p>
                </div>
                {manage ? (
                  <div className="flex items-start gap-2">
                    <ActionForm action={changeRole.bind(null, slug, m.id)} className="flex gap-2" showSuccess={false}>
                      <select name="role" defaultValue={m.role} className="input w-44">
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                      <SubmitButton variant="secondary">OK</SubmitButton>
                    </ActionForm>
                    <ActionForm
                      action={removeMember.bind(null, slug, m.id)}
                      confirm={`Retirer ${m.user.name ?? m.user.email} de l'entreprise ?`}
                      showSuccess={false}
                    >
                      <SubmitButton variant="danger">Retirer</SubmitButton>
                    </ActionForm>
                  </div>
                ) : (
                  <span className="text-sm text-slate-600">{ROLE_LABELS[m.role]}</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {manage && invitations.length > 0 && (
          <section className="card">
            <h2 className="mb-4 text-lg font-semibold">Invitations en attente</h2>
            <ul className="divide-y divide-slate-100">
              {invitations.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{inv.email}</p>
                    <p className="text-xs text-slate-500">
                      {ROLE_LABELS[inv.role]} ·{" "}
                      {inv.expiresAt < new Date() ? "expirée" : `expire le ${dateFmt.format(inv.expiresAt)}`}
                    </p>
                  </div>
                  <ActionForm action={revokeInvitation.bind(null, slug, inv.id)} showSuccess={false}>
                    <SubmitButton variant="secondary">Annuler</SubmitButton>
                  </ActionForm>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="space-y-6">
        {manage && (
          <section className="card">
            <h2 className="mb-1 text-lg font-semibold">Inviter un membre</h2>
            <p className="mb-4 text-sm text-slate-600">Aucun e-mail n&apos;est envoyé : copiez le lien et transmettez-le.</p>
            <InviteForm action={createInvitation.bind(null, slug)} />
          </section>
        )}
        <section className="card">
          <h2 className="mb-3 text-lg font-semibold">Les rôles</h2>
          <dl className="space-y-3 text-sm">
            {ROLES.map((r) => (
              <div key={r}>
                <dt className="font-medium">{ROLE_LABELS[r]}</dt>
                <dd className="text-slate-600">{ROLE_DESCRIPTIONS[r]}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
