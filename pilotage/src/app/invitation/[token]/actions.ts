"use server";

import { redirect } from "next/navigation";
import { runAction, UserError, type ActionState } from "@/lib/actions";
import { logAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

export async function acceptInvitation(token: string, _: ActionState): Promise<ActionState> {
  return runAction(async () => {
    const user = await requireUser();
    const slug = await db.$transaction(async (tx) => {
      const inv = await tx.invitation.findUnique({
        where: { tokenHash: hashToken(token) },
        include: { organization: { select: { slug: true } } },
      });
      if (!inv || inv.acceptedAt || inv.expiresAt < new Date()) throw new UserError("Cette invitation n'est plus valable.");
      if (inv.email !== user.email.toLowerCase()) {
        throw new UserError(`Cette invitation est destinée à ${inv.email}. Connectez-vous avec cette adresse.`);
      }
      // updateMany conditionnel : une invitation ne peut être consommée qu'une fois.
      const { count } = await tx.invitation.updateMany({ where: { id: inv.id, acceptedAt: null }, data: { acceptedAt: new Date() } });
      if (count === 0) throw new UserError("Cette invitation a déjà été utilisée.");
      await tx.membership.upsert({
        where: { userId_organizationId: { userId: user.id, organizationId: inv.organizationId } },
        create: { userId: user.id, organizationId: inv.organizationId, role: inv.role },
        update: {},
      });
      await logAudit({ organizationId: inv.organizationId, actorId: user.id, action: "invitation.accept", entityType: "Invitation", entityId: inv.id }, tx);
      return inv.organization.slug;
    });
    redirect(`/o/${slug}`);
  });
}
