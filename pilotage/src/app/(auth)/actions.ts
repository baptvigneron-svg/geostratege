"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { parseForm, runAction, UserError, type ActionState } from "@/lib/actions";
import { appUrl } from "@/lib/config";
import { safeNext } from "@/lib/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide."),
  password: z.string().min(1, "Mot de passe requis."),
  suite: z.string().optional(),
});

export async function signIn(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { email, password, suite } = parseForm(loginSchema, formData);
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new UserError("Identifiants incorrects ou adresse non confirmée.");
    redirect(safeNext(suite));
  });
}

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Indiquez votre nom.").max(100),
  email: z.string().trim().email("Adresse e-mail invalide."),
  password: z.string().min(10, "Le mot de passe doit faire au moins 10 caractères."),
  consent: z.literal("on", { errorMap: () => ({ message: "Vous devez accepter la politique de confidentialité." }) }),
  suite: z.string().optional(),
});

export async function signUp(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { name, email, password, suite } = parseForm(signUpSchema, formData);
    const next = safeNext(suite);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${appUrl()}/auth/callback?suite=${encodeURIComponent(next)}`,
      },
    });
    if (error) throw new UserError("Inscription impossible : " + error.message);
    // Confirmation d'e-mail désactivée dans Supabase : la session est déjà ouverte.
    if (data.session) redirect(next);
    return { success: "Compte créé. Confirmez votre adresse via le lien reçu par e-mail, puis connectez-vous." };
  });
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
