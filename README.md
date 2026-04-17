# Dofus Retro Site

Base statique pour un fan site Dofus Retro 1.29.

## Architecture

- `public/` contient tout le site servi en production.
- `public/js/supabase-api.js` centralise l'acces a Supabase Auth et a la table `maps`.
- Supabase gere l'authentification, la base Postgres et les regles de securite RLS.
- Aucun serveur Express n'est necessaire pour mettre le site en ligne.
- Ne pas remettre de `server.js` a la racine : Vercel le detecterait comme une fonction Node.

## Developpement local

```bash
npm install
npm run dev
```

Le serveur local sert le dossier `public/`.

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

Option simple :

1. Pousser le projet sur GitHub.
2. Creer un projet Vercel, Netlify ou Cloudflare Pages.
3. Configurer le dossier de publication sur `public`.
4. Ajouter l'URL publique du site dans Supabase Auth, section URL configuration.

Le site utilise la cle publishable Supabase cote navigateur. C'est normal pour ce type d'architecture ; la securite des donnees vient des politiques RLS.
