"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { requirePermission } from "@/lib/access";
import { parseForm, runAction, UserError, type ActionState } from "@/lib/actions";
import { logAudit } from "@/lib/audit";
import { appUrl, INVITATION_TTL_DAYS } from "@/lib/config";
import { db } from "@/lib/db";
import { ROLES } from "@/lib/permissions";
import { generateToken, hashToken } from "@/lib/tokens";

const roleSchema = z.enum(ROLES as [Role, ...Role[]], { errorMap: () => ({ message: "Rôle invalide." }) });

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide."),
  role: roleSchema,
});

export async function createInvitation(slug: string, _: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { user, org } = await requirePermission(slug, "members.manage");
    const { email, role } = parseForm(inviteSchema, formData);

    const existing = await db.membership.findFirst({ where: { organizationId: org.id, user: { email } } });
    if (existing) throw new UserError("Cette personne est déjà membre de l'entreprise.");

    const token = generateToken();
    await db.$transaction(async (tx) => {
      // Une seule invitation en attente par adresse.
      await tx.invitation.deleteMany({ where: { organizationId: org.id, email, acceptedAt: null } });
      const inv = await tx.invitation.create({
        data: {
          organizationId: org.id,
          email,
          role,
          tokenHash: hashToken(token),
          invitedById: user.id,
          expiresAt: new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 3600 * 1000),
        },
      });
      await logAudit({ organizationId: org.id, actorId: user.id, action: "invitation.create", entityType: "Invitation", entityId: inv.id, data: { email, role } }, tx);
    });

    revalidatePath(`/o/${slug}/membres`);
    return {
      success: `Invitation créée pour ${email}. Transmettez-lui ce lien (valable ${INVITATION_TTL_DAYS} jours) :`,
      data: { link: `${appUrl()}/invitation/${token}` },
    };
  });
}

export async function revokeInvitation(slug: string, invitationId: string, _: ActionState): Promise<ActionState> {
  return runAction(async () => {
    const { user, org } = await requirePermission(slug, "members.manage");
    const { count } = await db.invitation.deleteMany({ where: { id: invitationId, organizationId: org.id, acceptedAt: null } });
    if (count === 0) throw new UserError("Invitation introuvable.");
    await logAudit({ organizationId: org.id, actorId: user.id, action: "invitation.revoke", entityType: "Invitation", entityId: invitationId });
    revalidatePath(`/o/${slug}/membres`);
  });
}

async function assertNotLastAdmin(orgId: string, membershipId: string) {
  const others = await db.membership.count({ where: { organizationId: orgId, role: "ADMIN", id: { not: membershipId } } });
  if (others === 0) throw new UserError("L'entreprise doit garder au moins un administrateur.");
}

export async function changeRole(slug: string, membershipId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { user, org } = await requirePermission(slug, "members.manage");
    const { role } = parseForm(z.object({ role: roleSchema }), formData);
    const target = await db.membership.findFirst({ where: { id: membershipId, organizationId: org.id } });
    if (!target) throw new UserError("Membre introuvable.");
    if (target.role === "ADMIN" && role !== "ADMIN") await assertNotLastAdmin(org.id, membershipId);
    await db.membership.update({ where: { id: membershipId }, data: { role } });
    await logAudit({ organizationId: org.id, actorId: user.id, action: "member.role", entityType: "Membership", entityId: membershipId, data: { userId: target.userId, from: target.role, to: role } });
    revalidatePath(`/o/${slug}`, "layout");
    return { success: "Rôle mis à jour." };
  });
}

export async function removeMember(slug: string, membershipId: string, _: ActionState): Promise<ActionState> {
  return runAction(async () => {
    const { user, org } = await requirePermission(slug, "members.manage");
    const target = await db.membership.findFirst({ where: { id: membershipId, organizationId: org.id } });
    if (!target) throw new UserError("Membre introuvable.");
    if (target.role === "ADMIN") await assertNotLastAdmin(org.id, membershipId);
    await db.$transaction(async (tx) => {
      await tx.teamMember.deleteMany({ where: { userId: target.userId, team: { organizationId: org.id } } });
      await tx.membership.delete({ where: { id: membershipId } });
      await logAudit({ organizationId: org.id, actorId: user.id, action: "member.remove", entityType: "Membership", entityId: membershipId, data: { userId: target.userId } }, tx);
    });
    revalidatePath(`/o/${slug}`, "layout");
  });
}
