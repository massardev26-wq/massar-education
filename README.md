# Mettre en ligne la plateforme Massar (guide pour débutante)

Vous n'avez rien à installer sur votre ordinateur. Il faut 3 comptes gratuits : Supabase, GitHub, Vercel.

## Étape 1 – Créer la base de données (Supabase)
1. Allez sur supabase.com, créez un compte, puis « New project ». Donnez un nom (ex. massar) et un mot de passe de base de données (notez-le). Choisissez une région proche (Europe).
2. Attendez 2 minutes. Menu de gauche : **SQL Editor** > « New query ».
3. Ouvrez le fichier `supabase/schema.sql`, copiez tout, collez dans Supabase, cliquez **Run**. Les niveaux, matières et emplacements publicitaires sont créés.
4. Menu **Project Settings > API** : gardez ouverte cette page, vous aurez besoin de « Project URL » et de la clé « anon public ».

## Étape 2 – Créer votre compte administratrice
1. Supabase > **Authentication > Users > Add user > Create new user**. Mettez votre email et un mot de passe fort. Cochez « Auto Confirm User ».
2. Retournez dans SQL Editor, collez cette ligne (avec VOTRE email) puis Run :
   `insert into admins(user_id) select id from auth.users where email='VOTRE-EMAIL';`
Seul ce compte pourra modifier le site. Personne d'autre ne peut s'inscrire comme administrateur.

## Étape 3 – Mettre le projet sur GitHub
1. Créez un compte sur github.com > « New repository » (nom : massar-education, Public ou Private).
2. Cliquez « uploading an existing file », faites glisser **tout le contenu du dossier du projet** (pas le fichier zip lui-même), puis « Commit changes ».

## Étape 4 – Publier sur Vercel
1. vercel.com > « Sign up with GitHub » > **Add New > Project** > choisissez massar-education > Import.
2. Ouvrez « Environment Variables » et ajoutez 3 variables :
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = clé « anon public »
   - `NEXT_PUBLIC_WHATSAPP` = votre numéro avec l'indicatif, sans + ni espaces (ex. 212612345678)
3. Cliquez **Deploy**. Après 2 minutes, vous avez une adresse du type massar-education.vercel.app.

## Étape 5 – Ajouter un cours PDF
1. Allez sur votre-site/admin, connectez-vous.
2. Section 1 : choisissez Niveau, Matière, (Chapitre), Type, écrivez le titre, choisissez le fichier PDF, cliquez **Publier**.
3. Le cours apparaît tout de suite sur la page du niveau. Pour créer un chapitre, utilisez d'abord la section 3.

## Étape 6 – Connecter massar-education.com
1. Vercel > votre projet > **Settings > Domains** > ajoutez `massar-education.com` (et `www.massar-education.com`).
2. Vercel affiche des valeurs DNS. Chez le site où vous avez acheté le domaine (registrar), ouvrez « Zone DNS » et ajoutez : un enregistrement **A** `@` vers `76.76.21.21` et un **CNAME** `www` vers `cname.vercel-dns.com` (utilisez les valeurs affichées par Vercel si elles diffèrent).
3. Attendez de quelques minutes à 24 h. Le cadenas HTTPS apparaît automatiquement.

## Publicités
Section 6 de l'admin : activez ou désactivez chaque emplacement. Collez le code AdSense uniquement après validation de votre compte par Google (adsense.google.com).

## Attention (à connaître)
- Les ressources « Premium » sont pour l'instant seulement cachées (pas de bouton de téléchargement). Le paiement et l'accès réservé aux abonnés se feront dans une prochaine étape.
- La page /admin est visible de tous, mais sans votre compte on ne peut rien modifier : la sécurité est dans la base de données.
- Les matières proposées sont une base : ajustez-les dans l'admin selon le programme.
