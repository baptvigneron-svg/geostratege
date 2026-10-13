import Link from "next/link";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { signUp } from "../actions";

export const metadata = { title: "Créer un compte" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  const { suite } = await searchParams;
  return (
    <>
      <h1 className="page-title mb-6">Créer un compte</h1>
      <ActionForm action={signUp} className="space-y-4">
        <input type="hidden" name="suite" value={suite ?? ""} />
        <div>
          <label className="label" htmlFor="name">Nom et prénom</label>
          <input id="name" name="name" autoComplete="name" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="email">E-mail professionnel</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Mot de passe (10 caractères minimum)</label>
          <input id="password" name="password" type="password" minLength={10} autoComplete="new-password" required className="input" />
        </div>
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" name="consent" required className="mt-1 h-5 w-5" />
          <span>
            J&apos;accepte la{" "}
            <Link href="/confidentialite" className="text-brand-600 underline" target="_blank">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        <SubmitButton className="w-full">Créer mon compte</SubmitButton>
      </ActionForm>
      <p className="mt-6 text-center text-sm text-slate-600">
        Déjà un compte ?{" "}
        <Link className="font-medium text-brand-600" href={`/connexion${suite ? `?suite=${encodeURIComponent(suite)}` : ""}`}>
          Se connecter
        </Link>
      </p>
    </>
  );
}
