import { redirect } from "next/navigation";
import { cache } from "react";
import type { User } from "@prisma/client";
import { db } from "./db";
import { createSupabaseServerClient } from "./supabase/server";

// Utilisateur connecté (vérifié auprès de Supabase), synchronisé dans la table User.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const name = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null;
  return db.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email.toLowerCase(), name },
    update: { email: user.email.toLowerCase() },
  });
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}
