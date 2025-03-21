/**
 * Configuration d'environnement pour l'application
 * Permet de déterminer l'environnement dans lequel l'application s'exécute
 * et d'ajuster le comportement en conséquence.
 */

// Détecter l'environnement actuel
export const ENV = {
  // true si l'application est en mode développement
  IS_DEV: process.env.NODE_ENV === "development",

  // true si l'application est en mode production
  IS_PROD: process.env.NODE_ENV === "production",

  // true si l'application est en mode test
  IS_TEST: process.env.NODE_ENV === "test",

  // L'URL de base de l'application
  APP_URL: process.env.REACT_APP_URL || window.location.origin,

  // L'environnement actuel (development, production, test)
  NODE_ENV: process.env.NODE_ENV || "development",

  // Niveau de débogage (0: désactivé, 1: erreurs seulement, 2: avertissements, 3: infos, 4: débug)
  DEBUG_LEVEL: parseInt(process.env.REACT_APP_DEBUG_LEVEL || "3"),
};

/**
 * Utilitaire pour activer/désactiver les logs selon l'environnement
 */
export const logger = {
  // Niveau 1 - Erreurs
  error: (...args) => {
    if (ENV.DEBUG_LEVEL >= 1) {
      console.error(...args);
    }
  },

  // Niveau 2 - Avertissements
  warn: (...args) => {
    if (ENV.DEBUG_LEVEL >= 2) {
      console.warn(...args);
    }
  },

  // Niveau 3 - Informations
  info: (...args) => {
    if (ENV.DEBUG_LEVEL >= 3) {
      console.info(...args);
    }
  },

  // Niveau 4 - Débogage détaillé
  debug: (...args) => {
    if (ENV.DEBUG_LEVEL >= 4) {
      console.debug(...args);
    }
  },

  // Toujours actif, même en production
  log: (...args) => {
    console.log(...args);
  },

  // Groupe de logs (avec indentation)
  group: (label) => {
    if (ENV.DEBUG_LEVEL >= 3) {
      console.group(label);
    }
  },

  // Fin de groupe
  groupEnd: () => {
    if (ENV.DEBUG_LEVEL >= 3) {
      console.groupEnd();
    }
  },

  // Mesure de performance
  time: (label) => {
    if (ENV.DEBUG_LEVEL >= 4) {
      console.time(label);
    }
  },

  // Fin de mesure
  timeEnd: (label) => {
    if (ENV.DEBUG_LEVEL >= 4) {
      console.timeEnd(label);
    }
  },

  // Table formatée
  table: (data) => {
    if (ENV.DEBUG_LEVEL >= 3) {
      console.table(data);
    }
  },
};

/**
 * Constantes pour différentes fonctionnalités conditionnelles
 */
export const FEATURES = {
  // Activer les outils de développement
  ENABLE_DEV_TOOLS: ENV.IS_DEV,

  // Activer l'affichage des erreurs détaillées
  SHOW_DETAILED_ERRORS: ENV.IS_DEV || ENV.DEBUG_LEVEL >= 3,

  // Activer le stockage des données en cache local
  ENABLE_LOCAL_STORAGE_CACHE: true,

  // Durée de validité du cache en minutes (0 = pas de cache)
  CACHE_DURATION_MINUTES: ENV.IS_PROD ? 30 : 5,

  // Activer les logs d'API
  ENABLE_API_LOGGING: ENV.IS_DEV || ENV.DEBUG_LEVEL >= 3,
};

export default ENV;
