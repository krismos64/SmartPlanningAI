/**
 * Middleware pour vérifier le token CSRF dans les requêtes
 * À utiliser sur les routes sensibles (POST, PUT, DELETE)
 */
module.exports = function verifyCsrfToken(req, res, next) {
  // Ne pas vérifier pour les méthodes GET, OPTIONS, HEAD
  if (["GET", "OPTIONS", "HEAD"].includes(req.method)) {
    return next();
  }

  const tokenInSession = req.session.csrfToken;
  const tokenFromHeader = req.headers["x-csrf-token"];

  if (
    !tokenInSession ||
    !tokenFromHeader ||
    tokenInSession !== tokenFromHeader
  ) {
    return res.status(403).json({ error: "Token CSRF invalide" });
  }

  next();
};
