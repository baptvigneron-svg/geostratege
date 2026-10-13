import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="page-title">Page introuvable</h1>
      <p className="text-sm text-slate-600">Cette page n&apos;existe pas ou vous n&apos;y avez pas accès.</p>
      <Link href="/app" className="btn-primary">Retour à l&apos;accueil</Link>
    </main>
  );
}
