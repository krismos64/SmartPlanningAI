const fs = require("fs");
const path = require("path");
const { format } = require("date-fns");
const fr = require("date-fns/locale/fr");

// Définir les niveaux de log
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Niveau de log par défaut basé sur l'environnement
const currentLogLevel = process.env.LOG_LEVEL
  ? LOG_LEVELS[process.env.LOG_LEVEL]
  : process.env.NODE_ENV === "production"
  ? LOG_LEVELS.INFO
  : LOG_LEVELS.DEBUG;

// Chemin vers le répertoire de logs
const logDir = path.join(process.cwd(), "logs");

// Créer le répertoire de logs s'il n'existe pas
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Fichiers de log spécifiques
const errorLogPath = path.join(logDir, "error.log");
const accessLogPath = path.join(logDir, "access.log");
const authLogPath = path.join(logDir, "auth.log");
const debugLogPath = path.join(logDir, "debug.log");

/**
 * Écrire un message dans un fichier de log
 * @param {string} filePath - Chemin du fichier de log
 * @param {string} message - Message à écrire
 */
function writeToFile(filePath, message) {
  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss", { locale: fr });
  const logMessage = `[${timestamp}] ${message}\n`;

  fs.appendFile(filePath, logMessage, (err) => {
    if (err) {
      console.error(
        `Erreur lors de l'écriture dans le fichier de log ${filePath}:`,
        err
      );
    }
  });
}

/**
 * Formater un objet en chaîne JSON lisible
 * @param {Object} obj - Objet à formater
 * @returns {string} - Chaîne JSON formatée
 */
function formatObject(obj) {
  if (!obj) return "";
  try {
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return `[Objet non sérialisable: ${e.message}]`;
  }
}

/**
 * Logger pour les erreurs
 * @param {string} message - Message d'erreur
 * @param {Object} [details] - Détails supplémentaires
 */
function error(message, details) {
  if (currentLogLevel >= LOG_LEVELS.ERROR) {
    const logMessage = details
      ? `ERROR: ${message} - ${formatObject(details)}`
      : `ERROR: ${message}`;

    console.error(logMessage);
    writeToFile(errorLogPath, logMessage);
  }
}

/**
 * Logger pour les avertissements
 * @param {string} message - Message d'avertissement
 * @param {Object} [details] - Détails supplémentaires
 */
function warn(message, details) {
  if (currentLogLevel >= LOG_LEVELS.WARN) {
    const logMessage = details
      ? `WARN: ${message} - ${formatObject(details)}`
      : `WARN: ${message}`;

    console.warn(logMessage);
    writeToFile(errorLogPath, logMessage);
  }
}

/**
 * Logger pour les informations
 * @param {string} message - Message d'information
 * @param {Object} [details] - Détails supplémentaires
 */
function info(message, details) {
  if (currentLogLevel >= LOG_LEVELS.INFO) {
    const logMessage = details
      ? `INFO: ${message} - ${formatObject(details)}`
      : `INFO: ${message}`;

    console.log(logMessage);
    writeToFile(accessLogPath, logMessage);
  }
}

/**
 * Logger pour le débogage
 * @param {string} message - Message de débogage
 * @param {Object} [details] - Détails supplémentaires
 */
function debug(message, details) {
  if (currentLogLevel >= LOG_LEVELS.DEBUG) {
    const logMessage = details
      ? `DEBUG: ${message} - ${formatObject(details)}`
      : `DEBUG: ${message}`;

    console.log(logMessage);
    writeToFile(debugLogPath, logMessage);
  }
}

/**
 * Logger spécifique pour les événements d'authentification
 * @param {string} level - Niveau de log (ERROR, WARN, INFO)
 * @param {string} message - Message d'authentification
 * @param {Object} details - Détails sur l'authentification
 */
function auth(level, message, details = {}) {
  // Vérifier le niveau de log
  const logLevel = LOG_LEVELS[level] || LOG_LEVELS.INFO;

  if (currentLogLevel >= logLevel) {
    // Formater les détails d'authentification
    const { email, ipAddress, userId, path, method, ...restDetails } = details;

    // Construire un message structuré
    const formattedDetails = {
      ...(email && { email }),
      ...(ipAddress && { ip: ipAddress }),
      ...(userId && { userId }),
      ...(path && { path }),
      ...(method && { method }),
      ...restDetails,
    };

    // Créer le message de log
    const logMessage = `AUTH ${level}: ${message} - ${formatObject(
      formattedDetails
    )}`;

    // Enregistrer dans la console et dans le fichier d'authentification
    console.log(logMessage);
    writeToFile(authLogPath, logMessage);

    // Également enregistrer dans le fichier d'accès pour les logs importants
    if (logLevel <= LOG_LEVELS.INFO) {
      writeToFile(accessLogPath, logMessage);
    }

    // Enregistrer les erreurs dans le fichier d'erreurs
    if (logLevel === LOG_LEVELS.ERROR) {
      writeToFile(errorLogPath, logMessage);
    }
  }
}

// Exporter les fonctions du logger
module.exports = {
  error,
  warn,
  info,
  debug,
  auth,
};
