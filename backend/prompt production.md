// Objectif : restaurer la configuration complète de la session et du système CSRF dans SmartPlanningAI

1. Dans backend/app.js :

- Vérifie que `cookie-parser` est utilisé AVANT `express-session`
- Configure express-session avec :

  - store = express-mysql-session
  - cookie.name = connect.sid
  - cookie.secure = isProd ? true : false
  - cookie.sameSite = isProd ? "none" : "lax"
  - cookie.domain = isProd ? "smartplanning.fr" : undefined
  - saveUninitialized = true
  - unset = "destroy"

- Ajoute un middleware `csrfProtection` appliqué à toutes les routes POST, PUT, DELETE, PATCH
- Applique `auth + csrfProtection` sur toutes les routes sensibles (/api/employees, /api/weekly-schedules, etc.)
- Ajoute des routes de debug comme :
  GET /api/test/csrf-check
  POST /api/test/csrf-check

2. Dans backend/routes/csrf.js :

- Crée une route GET /api/csrf-token
- Génére un token CSRF (UUID v4), le stocker en session
- Sauvegarde la session (req.session.save)
- Renvoie le token dans un cookie `XSRF-TOKEN` :
  - httpOnly: false
  - secure: isProd ? true : false
  - sameSite: isProd ? "none" : "lax"
  - domain: isProd ? "smartplanning.fr" : undefined
- Retourne aussi le token en JSON (pour les clients sans cookies)

3. Dans backend/middleware/verifyCsrfToken.js :

- Si méthode GET/OPTIONS/HEAD → ne rien faire
- Sinon :
  - Compare req.session.csrfToken avec l’un des headers :
    x-csrf-token / X-CSRF-Token / csrf-token
  - En cas d’erreur, retourne un code 403 avec message clair

4. Dans src/utils/api.js :

- Crée un système de cache mémoire pour csrfToken
- Stocke aussi dans localStorage avec clé `csrf_token`
- fetchCsrfTokenRobust() :
  - fetch /api/csrf-token avec credentials: "include"
  - stocke le token dans le cache + localStorage
  - vérifie que le cookie XSRF-TOKEN est bien défini
- fetchWithCsrf() ajoute automatiquement le header X-CSRF-Token
- Toutes les requêtes doivent avoir credentials: "include"

5. Dans src/contexts/ApiContext.jsx :

- Utilise useEffect(() => fetchCsrfTokenRobust(), []) au démarrage
- Dans les interceptors axios :
  - ajoute le header Authorization si présent
  - ajoute le token CSRF depuis getStoredCsrfToken()
  - force config.withCredentials = true
