const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/auth");
const AuthLog = require("../models/AuthLog");

/**
 * @route GET /api/admin/auth-logs
 * @desc Récupérer les logs d'authentification
 * @access Admin
 */
router.get("/auth-logs", verifyToken, isAdmin, async (req, res) => {
  try {
    // Paramètres de filtrage
    const { email, ip, limit = 100 } = req.query;

    let logs;

    // Filtrer par email si fourni
    if (email) {
      logs = await AuthLog.getByEmail(email, parseInt(limit));
    }
    // Filtrer par IP si fourni
    else if (ip) {
      logs = await AuthLog.getByIp(ip, parseInt(limit));
    }
    // Sinon, récupérer les logs récents
    else {
      logs = await AuthLog.getRecent(parseInt(limit));
    }

    res.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des logs d'authentification:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des logs d'authentification",
    });
  }
});
