import type { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateur",
  ANIMATEUR: "Animateur",
  CONTRIBUTEUR: "Contributeur",
  LECTEUR: "Lecteur",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: "Gère l'entreprise, les membres et les équipes, et a tous les droits.",
  ANIMATEUR: "Anime les rituels : gère les tableaux et toutes les actions, escalade.",
  CONTRIBUTEUR: "Crée des actions, met à jour celles qu'il pilote, saisit les indicateurs.",
  LECTEUR: "Consulte les tableaux sans les modifier.",
};

export const ROLES: Role[] = ["ADMIN", "ANIMATEUR", "CONTRIBUTEUR", "LECTEUR"];

export type Permission =
  | "org.view"
  | "org.manage"
  | "members.manage"
  | "teams.manage"
  | "boards.manage"
  | "actions.create"
  | "actions.editAny"
  | "actions.escalate";

const GRANTS: Record<Role, Permission[]> = {
  ADMIN: [
    "org.view",
    "org.manage",
    "members.manage",
    "teams.manage",
    "boards.manage",
    "actions.create",
    "actions.editAny",
    "actions.escalate",
  ],
  ANIMATEUR: ["org.view", "boards.manage", "actions.create", "actions.editAny", "actions.escalate"],
  CONTRIBUTEUR: ["org.view", "actions.create"],
  LECTEUR: ["org.view"],
};

export function can(role: Role, permission: Permission): boolean {
  return GRANTS[role].includes(permission);
}
