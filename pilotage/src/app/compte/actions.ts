"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { planAccountDeletion } from "@/lib/account";
import { parseForm, runAction, UserError, type ActionState } from "@/lib/actions";
import { logAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateProfile(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const user = await requireUser();
    const { name } = parseForm(z.object({ name: z.string().trim().min(1, "Nom requis.").max(100) }), formData);
    await db.user.update({ where: { id: user.id }, data: { name } });
    revalidatePath("/", "layout");
  });
}

export async function leaveOrganization(orgId: string, _: ActionState): Promise<ActionState> {
  return runAction(async () => {
    const user = await requireUser();
    const m = await db.membership.findUnique({ where: { userId_organizationId: { userId: user.id, organizationId: orgId } } });
    if (!m) throw new UserError("Vous n'êtes pas membre de cette entreprise.");
    if (m.role === "ADMIN") {
      const otherAdmins = await db.membership.count({ where: { organizationId: orgId, role: "ADMIN", id: { not: m.id } } });
      if (otherAdmins === 0) throw new UserError("Nommez un autre administrateur avant de quitter l'entreprise.");
    }
    await db.$transaction(async (tx) => {
      await tx.teamMember.deleteMany({ where: { userId: user.id, team: { organizationId: orgId } } });
      await tx.membership.delete({ where: { id: m.id } });
      await logAudit({ organizationId: orgId, actorId: user.id, action: "member.leave", entityType: "Membership", entityId: m.id }, tx);
    });
    revalidatePath("/compte");
  });
}

export async function deleteAccount(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const user = await requireUser();
    if (String(formData.get("confirmation") ?? "").trim().toLowerCase() !== user.email) {
      throw new UserError("Saisissez votre adresse e-mail pour confirmer.");
    }
    const plan = await planAccountDeletion(user.id);
    if (!plan.ok) {
      throw new UserError(`Vous êtes le dernier administrateur de : ${plan.blockingOrgs.join(", ")}. Nommez un autre administrateur ou supprimez l'espace d'abord.`);
    }

    // Le compte d'authentification d'abord : si cela échoue, rien n'est supprimé.
    const { error } = await createSupabaseAdminClient().auth.admin.deleteUser(user.id);
    if (error) throw new Error(error.message);

    await db.$transaction(async (tx) => {
      for (const orgId of plan.orgsToDelete) {
        await tx.team.updateMany({ where: { organizationId: orgId }, data: { parentId: null } });
        await tx.organization.delete({ where: { id: orgId } });
      }
      await tx.user.delete({ where: { id: user.id } });
    });

    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/");
  });
}
