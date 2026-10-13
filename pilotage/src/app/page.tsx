import Link from "next/link";
import { APP_NAME } from "@/lib/config";

const FEATURES = [
  ["Réunion quotidienne", "Tableau SQCDP : une lettre verte ou rouge par jour pour la Sécurité, la Qualité, les Coûts, les Délais et le Personnel."],
  ["Plan d'actions", "Pilote, échéance, gain attendu, résultat à atteindre : chaque action est suivie jusqu'à sa clôture."],
  ["Kanban et planning", "Les mêmes actions vues en colonnes ou sur le mois, par pilote, sans double saisie."],
  ["Indicateurs clés", "Cibles, valeurs et tendances pour la revue hebdomadaire."],
  ["Escalades", "Un problème qui dépasse l'équipe remonte à l'équipe parente en un geste."],
  ["Données en Europe", "Hébergement dans l'Union européenne, conforme au RGPD."],
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <header className="flex items-center justify-between">
        <span className="text-xl font-semibold text-brand-700">{APP_NAME}</span>
        <nav className="flex gap-2">
          <Link href="/connexion" className="btn-secondary">Connexion</Link>
          <Link href="/inscription" className="btn-primary">Essayer</Link>
        </nav>
      </header>
      <section className="py-16">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Le pilotage visuel de votre activité, en salle comme à distance.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          Animez vos rituels de production, de projet, de R&amp;D ou de marketing sur un seul outil, pensé pour le PC et les grands écrans tactiles.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(([title, text]) => (
          <div key={title} className="card">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{text}</p>
          </div>
        ))}
      </section>
      <footer className="mt-16 text-sm text-slate-500">
        <Link href="/confidentialite" className="underline">Politique de confidentialité</Link>
      </footer>
    </main>
  );
}
