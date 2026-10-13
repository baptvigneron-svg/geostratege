import Link from "next/link";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROLE_LABELS } from "@/lib/permissions";
import { deleteAccount, leaveOrganization, updateProfile } from "./actions";

export const metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const user = await requireUser();
  const memberships = await db.membership.findMany({
    where: { userId: user.id },
    include: { organization: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <Link href="/app" className="text-sm text-brand-600">← Retour</Link>
      <h1 className="page-title">Mon compte</h1>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Profil</h2>
        <p className="mb-3 text-sm text-slate-600">E-mail : {user.email}</p>
        <ActionForm action={updateProfile} className="flex gap-2">
          <input name="name" defaultValue={user.name ?? ""} required maxLength={100} className="input" placeholder="Nom et prénom" />
          <SubmitButton className="shrink-0">Enregistrer</SubmitButton>
        </ActionForm>
      </section>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Mes entreprises</h2>
        <ul className="divide-y divide-slate-100">
          {memberships.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
              <Link href={`/o/${m.organization.slug}`} className="font-medium text-brand-700">
                {m.organization.name}
                <span className="ml-2 text-sm font-normal text-slate-500">{ROLE_LABELS[m.role]}</span>
              </Link>
              <ActionForm action={leaveOrganization.bind(null, m.organization.id)} confirm={`Quitter ${m.organization.name} ?`} showSuccess={false}>
                <SubmitButton variant="secondary">Quitter</SubmitButton>
              </ActionForm>
            </li>
          ))}
          {memberships.length === 0 && <li className="py-3 text-sm text-slate-500">Aucune entreprise.</li>}
        </ul>
        <Link href="/onboarding" className="btn-secondary mt-4">Créer un nouvel espace</Link>
      </section>

      <section className="card">
        <h2 className="mb-2 text-lg font-semibold">Mes données</h2>
        <p className="mb-4 text-sm text-slate-600">Téléchargez l&apos;ensemble des données personnelles liées à votre compte (format JSON).</p>
        <a href="/compte/export" className="btn-secondary">Exporter mes données</a>
      </section>

      <section className="card border-red-200">
        <h2 className="mb-2 text-lg font-semibold text-red-700">Supprimer mon compte</h2>
        <p className="mb-4 text-sm text-slate-600">
          Votre compte et vos données personnelles sont supprimés définitivement. Dans le journal des entreprises, vos actions passées
          apparaîtront comme « Compte supprimé ».
        </p>
        <ActionForm action={deleteAccount} className="space-y-3" confirm="Supprimer définitivement votre compte ?">
          <label className="label" htmlFor="confirmation">Saisissez votre e-mail pour confirmer</label>
          <input id="confirmation" name="confirmation" type="email" required className="input" autoComplete="off" />
          <SubmitButton variant="danger">Supprimer mon compte</SubmitButton>
        </ActionForm>
      </section>
    </main>
  );
}
