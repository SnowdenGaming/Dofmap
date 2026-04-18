# Dofus Retro Site

Base React + Vite pour un fan site Dofus Retro 1.29.

## Architecture

- `src/` contient la SPA React :
  - `pages/` pour les ecrans accueil, cartes, communaute et connexion ;
  - `components/` pour le shell, les cartes et les modales ;
  - `providers/` pour le theme et l'etat d'authentification ;
  - `lib/dofus-api.js` pour l'acces a Supabase.
- `public/` garde les assets statiques et `map-editor.html`, conserve en page dediee pour l'editeur.
- Supabase gere l'authentification, la base Postgres et les regles de securite RLS.
- Vercel construit maintenant le projet via Vite et publie `dist/`.

## Developpement local

```bash
npm install
npm run dev
```

Par defaut, Vite expose l'application sur `http://localhost:5173`.

Build de production :

```bash
npm run build
```

Preview local du build :

```bash
npm run preview
```

## Initialiser Supabase

Definir `DATABASE_URL`, puis lancer :

```bash
npm run setup:supabase
```

Le script cree la table `public.maps`, les index et les politiques RLS :

- lecture des cartes publiques ou de ses propres cartes ;
- creation uniquement pour son propre `user_id` ;
- modification et suppression uniquement par le proprietaire.

## Mise en ligne

1. Pousser le projet sur GitHub.
2. Creer un projet Vercel.
3. Laisser Vercel utiliser `npm run build` et publier `dist`.
4. Ajouter l'URL publique du site dans Supabase Auth, section URL configuration.

Les routes `/`, `/maps`, `/community` et `/login` passent maintenant par la SPA React.
L'editeur reste disponible directement via `/map-editor.html`.
