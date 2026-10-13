import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";
import { ForbiddenError } from "./access";

export type ActionState = { error?: string; success?: string; data?: Record<string, string> } | undefined;

// Erreur dont le message peut être montré tel quel à l'utilisateur.
export class UserError extends Error {}

export async function runAction(fn: () => Promise<ActionState | void>): Promise<ActionState> {
  try {
    return (await fn()) ?? { success: "Enregistré." };
  } catch (e) {
    unstable_rethrow(e);
    if (e instanceof UserError || e instanceof ForbiddenError) return { error: e.message };
    console.error(e);
    return { error: "Une erreur est survenue. Réessayez." };
  }
}

export function parseForm<T extends z.ZodTypeAny>(schema: T, formData: FormData): z.infer<T> {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) throw new UserError(result.error.issues[0]?.message ?? "Formulaire invalide.");
  return result.data;
}
