// Tests d'intégration sur une base PostgreSQL dédiée (TEST_DATABASE_URL, migrations appliquées).
import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { planAccountDeletion } from "@/lib/account";
import { db } from "@/lib/db";

const run = process.env.TEST_DATABASE_URL ? describe : describe.skip;

async function user(email: string) {
  return db.user.create({ data: { id: randomUUID(), email } });
}

async function org(name: string) {
  return db.organization.create({ data: { name, slug: `${name}-${randomUUID().slice(0, 8)}` } });
}

run("base de données", () => {
  beforeEach(async () => {
    await db.team.updateMany({ data: { parentId: null } });
    await db.organization.deleteMany();
    await db.user.deleteMany();
  });
  afterAll(() => db.$disconnect());

  it("bloque la suppression du dernier admin d'une entreprise avec d'autres membres", async () => {
    const a = await user("a@test.fr");
    const b = await user("b@test.fr");
    const o = await org("acme");
    await db.membership.createMany({
      data: [
        { userId: a.id, organizationId: o.id, role: "ADMIN" },
        { userId: b.id, organizationId: o.id, role: "CONTRIBUTEUR" },
      ],
    });
    expect(await planAccountDeletion(a.id)).toEqual({ ok: false, blockingOrgs: ["acme"] });
    expect(await planAccountDeletion(b.id)).toEqual({ ok: true, orgsToDelete: [] });
  });

  it("supprime avec le compte les espaces dont il est le seul membre", async () => {
    const a = await user("solo@test.fr");
    const o = await org("solo");
    await db.membership.create({ data: { userId: a.id, organizationId: o.id, role: "ADMIN" } });
    expect(await planAccountDeletion(a.id)).toEqual({ ok: true, orgsToDelete: [o.id] });
  });

  it("supprime une entreprise et tout son contenu malgré l'arbre d'équipes", async () => {
    const a = await user("c@test.fr");
    const o = await org("arbre");
    const root = await db.team.create({ data: { organizationId: o.id, name: "Direction" } });
    const child = await db.team.create({ data: { organizationId: o.id, name: "Prod", parentId: root.id } });
    await db.teamMember.create({ data: { teamId: child.id, userId: a.id } });
    await db.auditLog.create({ data: { organizationId: o.id, actorId: a.id, action: "x", entityType: "Team" } });

    await db.$transaction(async (tx) => {
      await tx.team.updateMany({ where: { organizationId: o.id }, data: { parentId: null } });
      await tx.organization.delete({ where: { id: o.id } });
    });

    expect(await db.team.count({ where: { organizationId: o.id } })).toBe(0);
    expect(await db.teamMember.count({ where: { userId: a.id } })).toBe(0);
    expect(await db.user.count({ where: { id: a.id } })).toBe(1);
  });

  it("conserve le journal en anonymisant l'auteur quand un compte est supprimé", async () => {
    const a = await user("d@test.fr");
    const o = await org("journal");
    await db.auditLog.create({ data: { organizationId: o.id, actorId: a.id, action: "x", entityType: "Team" } });
    await db.user.delete({ where: { id: a.id } });
    const logs = await db.auditLog.findMany({ where: { organizationId: o.id } });
    expect(logs).toHaveLength(1);
    expect(logs[0].actorId).toBeNull();
  });
});
