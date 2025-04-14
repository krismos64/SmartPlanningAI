# Authentification Google OAuth pour SmartPlanningAI

Ce document explique l'implémentation de la connexion avec Google dans l'application SmartPlanningAI.

## Architecture

L'implémentation suit le flux OAuth2 standard avec Google:

1. L'utilisateur clique sur "Se connecter avec Google" dans l'application frontend
2. L'utilisateur est redirigé vers l'API d'authentification Google
3. Après authentification réussie, Google redirige vers notre callback API
4. Notre backend vérifie/crée l'utilisateur et génère un JWT
5. L'utilisateur est redirigé vers le frontend avec le token JWT
6. Le frontend stocke le token et connecte l'utilisateur

## Configuration Backend

### Dépendances installées

- `passport`
- `passport-google-oauth20`
- `express-session`

### Fichiers créés/modifiés

- `/backend/auth/google.js` - Configuration de la stratégie Google OAuth
- `/backend/routes/auth.js` - Routes d'authentification Google
- `/backend/app.js` - Configuration de Passport et session
- `/backend/.env` - Variables d'environnement Google

### Variables d'environnement requises

```
GOOGLE_CLIENT_ID=108574820176-m4nks4vs1vck2qjhns4n56888m91s2ip.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-X8E1VNUG5Me-rAkPnfd20t9fOP
```

## Configuration Frontend

### Dépendances installées

- `@react-oauth/google`

### Fichiers créés/modifiés

- `/src/components/ui/GoogleLoginButton.js` - Bouton de connexion Google
- `/src/pages/auth/LoginSuccess.js` - Page de redirection après authentification
- `/src/pages/LoginPage.jsx` - Intégration du bouton Google
- `/src/App.js` - Ajout de la route de redirection

## URIs de redirection configurés dans Google Console

Ces URIs doivent être configurés dans la Console Google Cloud:

1. `http://localhost:5001/api/auth/google/callback` (développement)
2. `https://smartplanning-api.onrender.com/api/auth/google/callback` (production)

## Processus d'authentification

1. L'utilisateur clique sur "Se connecter avec Google" sur la page de connexion
2. Il est redirigé vers `/api/auth/google` qui initialise le flux OAuth Google
3. Après authentification Google, le callback `/api/auth/google/callback` est appelé
4. Notre backend vérifie si l'utilisateur existe déjà:
   - Si oui, il récupère l'utilisateur existant
   - Sinon, il crée un nouvel utilisateur avec les données Google
5. Le backend génère un JWT et redirige vers `https://smartplanning.fr/login-success?token=...`
6. Le frontend récupère le token et l'enregistre dans localStorage
7. L'utilisateur est redirigé vers le dashboard, connecté avec succès

## Sécurité

- Les tokens JWT sont sécurisés et expirent après un temps limité
- Les sessions sont configurées avec des cookies sécurisés
- Les identifiants Google sont stockés uniquement dans les variables d'environnement
- Les mots de passe générés pour les utilisateurs Google sont aléatoires et forts

## Test en local

1. Lancer le backend avec `npm run start`
2. Lancer le frontend avec `npm start`
3. Accéder à `http://localhost:3000/login`
4. Cliquer sur "Se connecter avec Google"
5. Suivre le flux d'authentification Google
6. Vous serez redirigé vers le dashboard après une connexion réussie
