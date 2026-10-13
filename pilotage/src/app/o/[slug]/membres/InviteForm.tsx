"use client";

import { useActionState } from "react";
import { CopyField } from "@/components/CopyField";
import { SubmitButton } from "@/components/SubmitButton";
import type { ActionState } from "@/lib/actions";
import { ROLE_LABELS, ROLES } from "@/lib/permissions";

export function InviteForm({ action }: { action: (s: ActionState, f: FormData) => Promise<ActionState> }) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="role">Rôle</label>
        <select id="role" name="role" defaultValue="CONTRIBUTEUR" className="input">
          {ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </div>
      <SubmitButton className="w-full">Créer le lien d&apos;invitation</SubmitButton>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state?.success && (
        <div className="space-y-2 rounded-lg bg-emerald-50 p-3">
          <p className="text-sm text-emerald-800">{state.success}</p>
          {state.data?.link && <CopyField value={state.data.link} />}
        </div>
      )}
    </form>
  );
}
