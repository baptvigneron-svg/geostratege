import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// Droit d'accès et à la portabilité (RGPD art. 15 et 20) : export JSON des données du compte.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const [memberships, teams, activity] = await Promise.all([
    db.membership.findMany({ where: { userId: user.id }, include: { organization: { select: { name: true } } } }),
    db.teamMember.findMany({ where: { userId: user.id }, include: { team: { select: { name: true, organization: { select: { name: true } } } } } }),
    db.auditLog.findMany({ where: { actorId: user.id }, orderBy: { createdAt: "asc" }, select: { createdAt: true, action: true, entityType: true, entityId: true, data: true } }),
  ]);

  const body = {
    exportedAt: new Date().toISOString(),
    account: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    memberships: memberships.map((m) => ({ organization: m.organization.name, role: m.role, since: m.createdAt })),
    teams: teams.map((t) => ({ organization: t.team.organization.name, team: t.team.name })),
    activity,
  };

  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="mes-donnees-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
