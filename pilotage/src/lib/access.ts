import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import type { Membership, Organization, User } from "@prisma/client";
import { db } from "./db";
import { requireUser } from "./auth";
import { can, type Permission } from "./permissions";

export type OrgContext = { user: User; org: Organization; membership: Membership };

// Point d'entrée unique pour toute donnée d'une entreprise : vérifie que
// l'utilisateur en est membre. Toutes les requêtes métier doivent ensuite
// filtrer sur ctx.org.id.
export const getOrgContext = cache(async (slug: string): Promise<OrgContext> => {
  const user = await requireUser();
  const membership = await db.membership.findFirst({
    where: { userId: user.id, organization: { slug } },
    include: { organization: true },
  });
  if (!membership) notFound();
  const { organization: org, ...rest } = membership;
  return { user, org, membership: rest };
});

export class ForbiddenError extends Error {
  constructor() {
    super("Action non autorisée pour votre rôle.");
  }
}

export async function requirePermission(slug: string, permission: Permission): Promise<OrgContext> {
  const ctx = await getOrgContext(slug);
  if (!can(ctx.membership.role, permission)) throw new ForbiddenError();
  return ctx;
}

export async function redirectToFirstOrg(userId: string): Promise<never> {
  const first = await db.membership.findFirst({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
  redirect(first ? `/o/${first.organization.slug}` : "/onboarding");
}
