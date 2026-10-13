"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { parseForm, runAction, type ActionState } from "@/lib/actions";
import { logAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

const schema = z.object({
  name: z.string().trim().min(2, "Le nom doit faire au moins 2 caractères.").max(80),
});

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "entreprise";
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await db.organization.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function createOrganization(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const user = await requireUser();
    const { name } = parseForm(schema, formData);
    const slug = await uniqueSlug(name);

    await db.$transaction(async (tx) => {
      const org = await tx.organization.create({ data: { name, slug } });
      await tx.membership.create({ data: { organizationId: org.id, userId: user.id, role: "ADMIN" } });
      // Équipe racine : point d'arrivée des escalades.
      const root = await tx.team.create({ data: { organizationId: org.id, name: "Direction" } });
      await tx.teamMember.create({ data: { teamId: root.id, userId: user.id } });
      await logAudit({ organizationId: org.id, actorId: user.id, action: "organization.create", entityType: "Organization", entityId: org.id, data: { name } }, tx);
    });

    redirect(`/o/${slug}`);
  });
}
