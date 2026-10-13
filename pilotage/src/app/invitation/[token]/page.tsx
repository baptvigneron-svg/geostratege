import Link from "next/link";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { getCurrentUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";
import { db } from "@/lib/db";
import { ROLE_LABELS } from "@/lib/permissions";
import { hashToken } from "@/lib/tokens";
import { acceptInvitation } from "./actions";

export const metadata = { title: "Invitation" };

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await db.invitation.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { organization: { select: { name: true } } },
  });
  const valid = inv && !inv.acceptedAt && inv.expiresAt > new Date();
  const user = valid ? await getCurrentUser() : null;
  const suite = encodeURIComponent(`/invitation/${token}`);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <p className="text-sm font-semibold text-brand-700">{APP_NAME}</p>
        {!valid ? (
          <>
            <h1 className="page-title mt-2">Invitation invalide</h1>
            <p className="mt-2 text-sm text-slate-600">Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien à votre administrateur.</p>
          </>
        ) : (
          <>
            <h1 className="page-title mt-2">Rejoindre {inv.organization.name}</h1>
            <p className="mt-2 text-sm text-slate-600">
              Invitation pour <strong>{inv.email}</strong> avec le rôle <strong>{ROLE_LABELS[inv.role]}</strong>.
            </p>
            {user ? (
              <ActionForm action={acceptInvitation.bind(null, token)} className="mt-6">
                <SubmitButton className="w-full">Accepter l&apos;invitation</SubmitButton>
              </ActionForm>
            ) : (
              <div className="mt-6 flex flex-col gap-2">
                <Link href={`/inscription?suite=${suite}`} className="btn-primary">Créer mon compte</Link>
                <Link href={`/connexion?suite=${suite}`} className="btn-secondary">J&apos;ai déjà un compte</Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
