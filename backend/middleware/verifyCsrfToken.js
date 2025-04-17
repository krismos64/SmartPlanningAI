const chalk = require("chalk");

/**
 * Middleware pour vérifier le token CSRF dans les requêtes
 * À utiliser sur les routes sensibles (POST, PUT, DELETE)
 */
module.exports = function verifyCsrfToken(req, res, next) {
  // Ne pas vérifier pour les méthodes GET, OPTIONS, HEAD
  if (["GET", "OPTIONS", "HEAD"].includes(req.method)) {
    return next();
  }

  const tokenInSession = req.session?.csrfToken;
  const tokenFromHeader =
    req.headers["x-csrf-token"] ||
    req.headers["X-CSRF-Token"] ||
    req.headers["csrf-token"];

  console.log(chalk.blue("🔒 [CSRF] Vérification du token CSRF"));
  console.log(
    chalk.blue("🔐 [CSRF] Token en session:"),
    tokenInSession?.substring(0, 8) + "..." || "Non défini"
  );
  console.log(
    chalk.blue("🔑 [CSRF] Token dans header:"),
    tokenFromHeader?.substring(0, 8) + "..." || "Non défini"
  );

  // Vérifier si la session existe
  if (!req.session) {
    console.error(
      chalk.red(
        "❌ [CSRF] Session non définie lors de la vérification du token"
      )
    );
    return res.status(403).json({
      error: "SESSION_MISSING",
      message: "La session n'est pas disponible. Veuillez actualiser la page.",
    });
  }

  // Vérifier si les tokens existent
  if (!tokenInSession) {
    console.error(chalk.red("❌ [CSRF] Token manquant dans la session"));
    return res.status(403).json({
      error: "CSRF_TOKEN_MISSING_IN_SESSION",
      message: "Token CSRF absent de la session. Veuillez actualiser la page.",
    });
  }

  if (!tokenFromHeader) {
    console.error(
      chalk.red("❌ [CSRF] Token manquant dans les en-têtes de la requête")
    );
    return res.status(403).json({
      error: "CSRF_TOKEN_MISSING_IN_HEADER",
      message: "Token CSRF absent de la requête. Veuillez actualiser la page.",
    });
  }

  // Vérifier si les tokens correspondent
  if (tokenInSession !== tokenFromHeader) {
    console.error(chalk.red("❌ [CSRF] Les tokens ne correspondent pas"));
    console.error(`Session: ${tokenInSession}, Header: ${tokenFromHeader}`);
    return res.status(403).json({
      error: "CSRF_TOKEN_MISMATCH",
      message: "Token CSRF invalide. Veuillez actualiser la page.",
    });
  }

  console.log(chalk.green("✅ [CSRF] Vérification du token réussie"));
  next();
};
