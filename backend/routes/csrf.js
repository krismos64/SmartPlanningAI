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
  console.log("🌐 [CSRF] Origine:", req.headers.origin || "Non disponible");
  console.log("🌐 [CSRF] Referer:", req.headers.referer || "Non disponible");
  console.log(
    "🌐 [CSRF] User-Agent:",
    req.headers["user-agent"] || "Non disponible"
  );

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

  // Configuration du cookie XSRF-TOKEN selon l'environnement (dev/prod)
  const cookieOptions = {
    httpOnly: false, // IMPORTANT: doit être false pour être accessible en JS côté client
    secure: isProd, // false en dev, true en prod
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: oneDayInMs,
  };

  // Ajouter domain uniquement en production
  if (isProd) {
    cookieOptions.domain = "smartplanning.fr";
  }

  console.log(chalk.blue("🍪 [CSRF] Configuration du cookie:"), cookieOptions);

  // Configurer le cookie XSRF-TOKEN
  res.cookie("XSRF-TOKEN", csrfToken, cookieOptions);

  // Log pour chaque header set-cookie
  const sentCookies = res.getHeaders()["set-cookie"];
  if (sentCookies) {
    console.log(chalk.magenta("🍪 [Set-Cookie] Headers envoyés:"));
    if (Array.isArray(sentCookies)) {
      sentCookies.forEach((cookie, index) => {
        console.log(`Cookie ${index + 1}:`, cookie);
      });
    } else {
      console.log(`Cookie:`, sentCookies);
    }
  } else {
    console.log(chalk.red("❌ [CSRF] Aucun cookie n'a été défini!"));
  }

  // Envoi du token dans la réponse pour les clients qui n'utilisent pas les cookies
  res.json({
    success: true,
    csrfToken,
    message: "Token CSRF généré avec succès",
    expiresIn: "24h",
    createdAt: req.session.csrfTokenCreatedAt,
    cookieSet: !!sentCookies,
    sessionID: req.sessionID,
    isProd: isProd,
    clientOrigin: req.headers.origin || "Non disponible",
  });
});

module.exports = router;
