"use client";

import { useFormStatus } from "react-dom";

// Noms de classe écrits en entier pour que Tailwind les détecte.
const VARIANTS = { primary: "btn-primary", secondary: "btn-secondary", danger: "btn-danger" } as const;

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${VARIANTS[variant]} ${className}`}>
      {pending ? "…" : children}
    </button>
  );
}
