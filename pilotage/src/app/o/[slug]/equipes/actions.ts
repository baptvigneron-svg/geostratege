"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/access";
import { parseForm, runAction, UserError, type ActionState } from "@/lib/actions";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { wouldCreateCycle } from "@/lib/teams";

const teamSchema = z.object({
  name: z.string().trim().min(1, "Nom requis.").max(80),
  parentId: z
    .string()
    .optional()
    .transform((v) => (v ? v : null)),
});

async function assertTeamInOrg(orgId: string, teamId: string) {
  const team = await db.team.findFirst({ where: { id: teamId, organizationId: orgId } });
  if (!team) throw new UserError("Équipe introuvable.");
  return team;
}

export async function createTeam(slug: string, _: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { user, org } = await requirePermission(slug, "teams.manage");
    const { name, parentId } = parseForm(teamSchema, formData);
    if (parentId) await assertTeamInOrg(org.id, parentId);
    const team = await db.team.create({ data: { organizationId: org.id, name, parentId } });
    await logAudit({ organizationId: org.id, actorId: user.id, action: "team.create", entityType: "Team", entityId: team.id, data: { name, parentId } });
    revalidatePath(`/o/${slug}`, "layout");
    return { success: `Équipe « ${name} » créée.` };
  });
}

export async function updateTeam(slug: string, teamId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { user, org } = await requirePermission(slug, "teams.manage");
    const { name, parentId } = parseForm(teamSchema, formData);
    await assertTeamInOrg(org.id, teamId);
    if (parentId) {
      await assertTeamInOrg(org.id, parentId);
      const all = await db.team.findMany({ where: { organizationId: org.id }, select: { id: true, parentId: true, name: true } });
      if (wouldCreateCycle(all, teamId, parentId)) {
        throw new UserError("Une équipe ne peut pas être rattachée à elle-même ni à l'une de ses sous-équipes.");
      }
    }
    await db.team.update({ where: { id: teamId }, data: { name, parentId } });
    await logAudit({ organizationId: org.id, actorId: user.id, action: "team.update", entityType: "Team", entityId: teamId, data: { name, parentId } });
    revalidatePath(`/o/${slug}`, "layout");
  });
}

export async function deleteTeam(slug: string, teamId: string, _: ActionState): Promise<ActionState> {
  return runAction(async () => {
    const { user, org } = await requirePermission(slug, "teams.manage");
    const team = await assertTeamInOrg(org.id, teamId);
    const children = await db.team.count({ where: { parentId: teamId } });
    if (children > 0) throw new UserError("Supprimez ou déplacez d'abord les sous-équipes.");
    await db.team.delete({ where: { id: teamId } });
    await logAudit({ organizationId: org.id, actorId: user.id, action: "team.delete", entityType: "Team", entityId: teamId, data: { name: team.name } });
    revalidatePath(`/o/${slug}`, "layout");
    redirect(`/o/${slug}/equipes`);
  });
}

const memberSchema = z.object({ userId: z.string().uuid("Choisissez un membre.") });

export async function addTeamMember(slug: string, teamId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { user, org } = await requirePermission(slug, "teams.manage");
    const { userId } = parseForm(memberSchema, formData);
    await assertTeamInOrg(org.id, teamId);
    const isMember = await db.membership.findUnique({ where: { userId_organizationId: { userId, organizationId: org.id } } });
    if (!isMember) throw new UserError("Cette personne n'est pas membre de l'entreprise.");
    await db.teamMember.upsert({ where: { teamId_userId: { teamId, userId } }, create: { teamId, userId }, update: {} });
    await logAudit({ organizationId: org.id, actorId: user.id, action: "team.member.add", entityType: "Team", entityId: teamId, data: { userId } });
    revalidatePath(`/o/${slug}`, "layout");
    return { success: "Membre ajouté." };
  });
}

export async function removeTeamMember(slug: string, teamId: string, userId: string, _: ActionState): Promise<ActionState> {
  return runAction(async () => {
    const { user, org } = await requirePermission(slug, "teams.manage");
    await assertTeamInOrg(org.id, teamId);
    await db.teamMember.deleteMany({ where: { teamId, userId } });
    await logAudit({ organizationId: org.id, actorId: user.id, action: "team.member.remove", entityType: "Team", entityId: teamId, data: { userId } });
    revalidatePath(`/o/${slug}`, "layout");
  });
}
