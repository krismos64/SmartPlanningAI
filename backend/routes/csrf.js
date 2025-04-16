const express = require("express");
const router = express.Router();
////////////////////////////////////////////////////////////////
// 🔍 Debug complet de la session et des cookies dans /csrf-token
const chalk = require("chalk"); // optionnel si tu veux colorer les logs
////////////////////////////////////////////////////////////////
const crypto = require("crypto");

/**
 * @route   GET /api/csrf-token
 * @desc    Génère et retourne un token CSRF avec cookie
 * @access  Public
 */
router.get("/csrf-token", (req, res) => {
  console.log(chalk.blue("\n🧪 [CSRF] Appel reçu sur /api/csrf-token"));
  console.log("📥 [CSRF] Headers reçus:", req.headers);
  console.log("🍪 [CSRF] Cookies reçus:", req.cookies);
  console.log("🔐 [CSRF] Session ID:", req.sessionID || "Non disponible");

  // Vérification de la session
  if (!req.session) {
    console.error(chalk.red("❌ [SESSION] req.session est undefined !"));
    console.trace(chalk.red("🔎 Stack trace pour req.session manquant"));
    return res.status(500).json({
      success: false,
      error: "SESSION_MISSING",
      message:
        "Session non initialisée. Vérifiez la configuration d'express-session.",
    });
  }

  // Génération du token avec UUID v4 (aléatoire)
  const csrfToken = crypto.randomUUID();

  // Sauvegarde du token dans la session
  req.session.csrfToken = csrfToken;
  req.session.csrfTokenCreatedAt = Date.now();

  // Sauvegarde explicite de la session pour s'assurer qu'elle est persistée
  req.session.save((err) => {
    if (err) {
      console.error(
        chalk.red("❌ [SESSION] Erreur lors de la sauvegarde de la session:"),
        err
      );
      // On continue malgré l'erreur car le cookie sera quand même envoyé
    } else {
      console.log(chalk.green("✅ [SESSION] Session sauvegardée avec succès"));
    }
  });

  // Informations de debug
  console.log(chalk.blue("📦 Session ID:"), req.sessionID);
  console.log(chalk.green("🔐 Token CSRF généré:"), csrfToken);
  console.log(chalk.yellow("🧠 Contenu complet de la session:"), req.session);

  // Définition dynamique du cookie XSRF-TOKEN
  const isProd = process.env.NODE_ENV === "production";
  const oneDayInMs = 24 * 60 * 60 * 1000;

  // Configurer le cookie XSRF-TOKEN (doit être accessible via JavaScript)
  res.cookie("XSRF-TOKEN", csrfToken, {
    httpOnly: false, // IMPORTANT: doit être false pour être accessible en JS côté client
    secure: isProd, // Sécurisé uniquement en production (HTTPS)
    sameSite: isProd ? "none" : "lax", // Important pour CORS en production
    path: "/",
    maxAge: oneDayInMs,
    domain: isProd ? "smartplanning.fr" : undefined, // Domaine en production uniquement
  });

  // Vérification des headers envoyés
  const sentCookies = res.getHeaders()["set-cookie"];
  console.log(
    chalk.magenta("🍪 [Set-Cookie] Headers envoyés:"),
    sentCookies || "Aucun"
  );

  // Envoi du token dans la réponse pour les clients qui n'utilisent pas les cookies
  res.json({
    success: true,
    csrfToken,
    message: "Token CSRF généré avec succès",
    expiresIn: "24h",
    createdAt: req.session.csrfTokenCreatedAt,
    cookieSet: !!sentCookies,
    sessionID: req.sessionID,
  });
});

module.exports = router;
