"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/access";
import { parseForm, runAction, UserError, type ActionState } from "@/lib/actions";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";

export async function renameOrganization(slug: string, _: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { user, org } = await requirePermission(slug, "org.manage");
    const { name } = parseForm(z.object({ name: z.string().trim().min(2, "Nom trop court.").max(80) }), formData);
    await db.organization.update({ where: { id: org.id }, data: { name } });
    await logAudit({ organizationId: org.id, actorId: user.id, action: "organization.rename", entityType: "Organization", entityId: org.id, data: { from: org.name, to: name } });
    revalidatePath(`/o/${slug}`, "layout");
  });
}

// Suppression définitive de l'espace et de toutes ses données (fin de contrat, droit à l'effacement).
export async function deleteOrganization(slug: string, _: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { org } = await requirePermission(slug, "org.manage");
    if (String(formData.get("confirmation") ?? "").trim() !== org.name) {
      throw new UserError("Saisissez exactement le nom de l'entreprise pour confirmer.");
    }
    await db.$transaction(async (tx) => {
      // Les équipes sont liées entre elles (onDelete: Restrict) : on casse l'arbre avant la cascade.
      await tx.team.updateMany({ where: { organizationId: org.id }, data: { parentId: null } });
      await tx.organization.delete({ where: { id: org.id } });
    });
    redirect("/app");
  });
}
