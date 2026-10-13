-- Supabase expose le schéma public via son API REST (rôles anon / authenticated).
-- L'application n'utilise pas cette API : tout passe par le serveur (Prisma),
-- qui applique l'isolation par entreprise. On active donc RLS sans aucune
-- politique, ce qui refuse tout accès direct depuis l'API publique.
-- Le rôle propriétaire utilisé par Prisma n'est pas concerné (pas de FORCE).
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Team" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeamMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
