import { db } from "./db";

export type AccountDeletionPlan =
  | { ok: true; orgsToDelete: string[] }
  | { ok: false; blockingOrgs: string[] };

// Un compte ne peut être supprimé s'il est le dernier administrateur d'une
// entreprise qui a d'autres membres. Les espaces dont il est le seul membre
// sont supprimés avec lui.
export async function planAccountDeletion(userId: string): Promise<AccountDeletionPlan> {
  const adminships = await db.membership.findMany({
    where: { userId, role: "ADMIN" },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          memberships: { where: { userId: { not: userId } }, select: { role: true } },
        },
      },
    },
  });

  const blockingOrgs: string[] = [];
  const orgsToDelete: string[] = [];
  for (const { organization: org } of adminships) {
    if (org.memberships.length === 0) orgsToDelete.push(org.id);
    else if (!org.memberships.some((m) => m.role === "ADMIN")) blockingOrgs.push(org.name);
  }
  return blockingOrgs.length ? { ok: false, blockingOrgs } : { ok: true, orgsToDelete };
}
