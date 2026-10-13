// Nom provisoire du produit : à changer ici uniquement.
export const APP_NAME = "Pilotage";

export const INVITATION_TTL_DAYS = 7;

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
