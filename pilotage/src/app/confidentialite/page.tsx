import Link from "next/link";
import { APP_NAME } from "@/lib/config";

export const metadata = { title: "Politique de confidentialité" };

// Modèle à faire valider juridiquement avant la mise en vente (raison sociale,
// DPO, sous-traitants exacts, durées de conservation contractuelles).
export default function PrivacyPage() {
  return (
    <main className="prose mx-auto max-w-3xl px-4 py-12 text-slate-800">
      <Link href="/" className="text-sm text-brand-600">← Retour</Link>
      <h1 className="page-title mt-4">Politique de confidentialité</h1>
      <div className="mt-6 space-y-4 text-sm leading-6">
        <p>
          {APP_NAME} traite les données nécessaires au pilotage de l&apos;activité de votre entreprise. Pour les données saisies dans
          l&apos;outil, votre entreprise est responsable de traitement et {APP_NAME} agit comme sous-traitant (article 28 du RGPD).
        </p>
        <h2 className="text-base font-semibold">Données traitées</h2>
        <p>Compte : nom, adresse e-mail, mot de passe (stocké chiffré). Activité : équipes, actions, indicateurs et historique des modifications.</p>
        <h2 className="text-base font-semibold">Hébergement</h2>
        <p>Les données sont hébergées dans l&apos;Union européenne. Aucune donnée n&apos;est revendue ni utilisée à des fins publicitaires.</p>
        <h2 className="text-base font-semibold">Cookies</h2>
        <p>Seuls des cookies techniques de session sont utilisés. Aucun cookie de mesure d&apos;audience ou publicitaire.</p>
        <h2 className="text-base font-semibold">Vos droits</h2>
        <p>
          Depuis la page « Mon compte », vous pouvez exporter vos données et supprimer votre compte. Pour toute autre demande (accès,
          rectification, opposition), contactez l&apos;administrateur de votre entreprise ou notre support.
        </p>
        <h2 className="text-base font-semibold">Conservation</h2>
        <p>Les données sont conservées tant que l&apos;abonnement de votre entreprise est actif, puis supprimées à la clôture de l&apos;espace.</p>
      </div>
    </main>
  );
}
