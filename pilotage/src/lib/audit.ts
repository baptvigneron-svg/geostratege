import type { Prisma } from "@prisma/client";
import { db } from "./db";

type Tx = Prisma.TransactionClient | typeof db;

export async function logAudit(
  entry: {
    organizationId: string;
    actorId: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    data?: Prisma.InputJsonValue;
  },
  tx: Tx = db,
) {
  await tx.auditLog.create({ data: entry });
}
