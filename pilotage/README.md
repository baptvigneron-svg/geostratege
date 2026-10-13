# Pilotage — outil de pilotage visuel de l'activité (SaaS PME)

Application autonome, hébergée temporairement dans ce dossier du dépôt `geostratege`.
Elle n'a aucune dépendance avec le site à la racine et pourra être déplacée telle quelle
dans son propre dépôt.

Le nom « Pilotage » est provisoire : il se change dans `src/lib/config.ts`.

## Stack

- Next.js 15 (App Router, Server Actions), React 19, TypeScript, Tailwind CSS
- PostgreSQL via Prisma 6
- Supabase (région UE) pour l'authentification ; plus tard le stockage des pièces jointes et le temps réel
- Tests : Vitest (unitaires + intégration sur PostgreSQL)

## Avancement

| Étape | Contenu | État |
|---|---|---|
| 1. Socle | Comptes, espaces entreprise, équipes en arbre, 4 rôles, invitations, journal d'audit, RGPD (export, suppression) | ✅ |
| 2. Actions | Fiche action, plan d'actions, historique, pièces jointes | à faire |
| 3. Kanban | À faire / En cours / Bloqué / Fait, glisser-déposer | à faire |
| 4. Planning mensuel | Par pilote, retards en rouge | à faire |
| 5. SQCDP | Grille mensuelle S, Q, C, D, P | à faire |
| 6. Indicateurs | Valeurs, cible, tendance | à faire |
| 7. Escalades | Vers l'équipe parente | à faire |
| 8. Temps réel | Édition simultanée | à faire |
| 9. Mode réunion | Plein écran tactile | à faire |

## Architecture

- **Isolation entre clients** : toute donnée métier porte un `organizationId`. Chaque page et
  chaque action serveur passent par `getOrgContext` / `requirePermission` (`src/lib/access.ts`),
  qui vérifient l'appartenance de l'utilisateur à l'entreprise ; les requêtes filtrent ensuite
  sur `org.id`.
- **API Supabase fermée** : RLS est activé sans politique sur toutes les tables
  (migration `enable_rls`), donc l'API REST publique de Supabase ne donne accès à rien.
  Seul le serveur (Prisma, rôle propriétaire) lit et écrit.
- **Rôles** (par entreprise) : `src/lib/permissions.ts`.
  - Administrateur : tout, y compris membres, équipes et paramètres.
  - Animateur : tableaux et toutes les actions, escalades.
  - Contributeur : crée des actions, met à jour celles qu'il pilote, saisit les indicateurs.
  - Lecteur : consultation.
- **Invitations sans e-mail** : l'administrateur génère un lien à usage unique (7 jours), lié
  à une adresse e-mail. Seul le hash du jeton est stocké.
- **Équipes en arbre** : l'équipe parente est la cible des escalades. Les boucles sont refusées.

## RGPD

- Données hébergées en UE (Supabase Frankfurt, fonctions Vercel `fra1`).
- Cookies techniques uniquement (session), pas de traceur.
- « Mon compte » : export JSON des données personnelles (art. 15 et 20) et suppression du
  compte (art. 17). Dans le journal, l'auteur devient « Compte supprimé ».
- Paramètres de l'entreprise : suppression définitive de l'espace (fin de contrat).
- Journal d'audit par entreprise.
- `src/app/confidentialite/page.tsx` est un **modèle** de politique de confidentialité, à
  faire valider juridiquement avant la commercialisation (raison sociale, sous-traitants,
  durées de conservation, contrat de sous-traitance art. 28).

## Installation locale

```bash
cd pilotage
npm install
cp .env.example .env        # renseigner DATABASE_URL / DIRECT_URL
cp .env.example .env.local  # renseigner les variables Supabase
npx prisma migrate dev
npm run dev
```

## Mise en production

1. **Supabase** : créer un projet en région **Europe (Frankfurt)**.
   - Authentication → URL Configuration : `Site URL` = URL de l'application, et ajouter
     `https://<votre-domaine>/auth/callback` aux Redirect URLs.
   - Récupérer l'URL, la clé `anon`, la clé `service_role` et les chaînes de connexion
     PostgreSQL (pooler en mode transaction pour `DATABASE_URL`, connexion directe ou
     session pour `DIRECT_URL`).
2. **Base** : les migrations sont appliquées automatiquement à chaque build (`prisma migrate deploy`).
3. **Vercel** : nouveau projet sur ce dépôt avec **Root Directory = `pilotage`**, région des
   fonctions `fra1`, et les variables de `.env.example`.

## Tests

```bash
npm test                                   # tests unitaires
TEST_DATABASE_URL=postgresql://... npm test   # + intégration (VIDE la base ciblée)
npm run typecheck
```

`TEST_DATABASE_URL` doit pointer vers une base **dédiée aux tests** : ces tests suppriment
toutes les données.
