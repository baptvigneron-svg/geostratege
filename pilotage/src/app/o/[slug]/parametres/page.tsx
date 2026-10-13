import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { getOrgContext } from "@/lib/access";
import { can } from "@/lib/permissions";
import { deleteOrganization, renameOrganization } from "./actions";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { org, membership } = await getOrgContext(slug);
  if (!can(membership.role, "org.manage")) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="page-title">Paramètres de l&apos;entreprise</h1>
      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Nom</h2>
        <ActionForm action={renameOrganization.bind(null, slug)} className="flex gap-2">
          <input name="name" defaultValue={org.name} required minLength={2} maxLength={80} className="input" />
          <SubmitButton className="shrink-0">Enregistrer</SubmitButton>
        </ActionForm>
      </section>
      <section className="card border-red-200">
        <h2 className="mb-2 text-lg font-semibold text-red-700">Supprimer l&apos;espace</h2>
        <p className="mb-4 text-sm text-slate-600">
          Supprime définitivement l&apos;entreprise, ses équipes, ses membres et tout son historique. Cette opération est irréversible.
        </p>
        <ActionForm action={deleteOrganization.bind(null, slug)} className="space-y-3" confirm="Supprimer définitivement toutes les données de l'entreprise ?">
          <label className="label" htmlFor="confirmation">Saisissez « {org.name} » pour confirmer</label>
          <input id="confirmation" name="confirmation" required className="input" autoComplete="off" />
          <SubmitButton variant="danger">Supprimer définitivement</SubmitButton>
        </ActionForm>
      </section>
    </div>
  );
}
