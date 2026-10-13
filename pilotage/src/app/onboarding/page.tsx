import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { requireUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";
import { createOrganization } from "./actions";

export const metadata = { title: "Créer votre espace" };

export default async function OnboardingPage() {
  const user = await requireUser();
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-lg">
        <p className="text-sm text-slate-500">Bienvenue {user.name ?? user.email}</p>
        <h1 className="page-title mt-1">Créez l&apos;espace de votre entreprise</h1>
        <p className="mt-2 text-sm text-slate-600">
          Vous en serez l&apos;administrateur. Vous pourrez ensuite créer vos équipes et inviter vos collègues dans {APP_NAME}.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Vous avez reçu une invitation ? Ouvrez simplement le lien qui vous a été transmis.
        </p>
        <ActionForm action={createOrganization} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="name">Nom de l&apos;entreprise</label>
            <input id="name" name="name" required minLength={2} maxLength={80} className="input" />
          </div>
          <SubmitButton className="w-full">Créer l&apos;espace</SubmitButton>
        </ActionForm>
      </div>
    </main>
  );
}
