import Link from "next/link";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { signIn } from "../actions";

export const metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  const { suite } = await searchParams;
  return (
    <>
      <h1 className="page-title mb-6">Connexion</h1>
      <ActionForm action={signIn} className="space-y-4">
        <input type="hidden" name="suite" value={suite ?? ""} />
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
        </div>
        <SubmitButton className="w-full">Se connecter</SubmitButton>
      </ActionForm>
      <p className="mt-6 text-center text-sm text-slate-600">
        Pas encore de compte ?{" "}
        <Link className="font-medium text-brand-600" href={`/inscription${suite ? `?suite=${encodeURIComponent(suite)}` : ""}`}>
          Créer un compte
        </Link>
      </p>
    </>
  );
}
