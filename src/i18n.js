import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n
  // Chargement des traductions depuis le dossier /public/locales
  // (ex: /public/locales/fr/translation.json)
  .use(Backend)
  // Détection automatique de la langue
  .use(LanguageDetector)
  // Initialisation du module react-i18next
  .use(initReactI18next)
  // Initialisation d'i18next
  .init({
    // Langue par défaut
    fallbackLng: "fr",
    // Débug en mode développement
    debug: process.env.NODE_ENV === "development",
    // Espace de noms par défaut
    defaultNS: "translation",
    // Options pour la détection de langue
    detection: {
      // Ordre des méthodes de détection de langue
      order: ["localStorage", "navigator"],
      // Nom de la clé dans localStorage
      lookupLocalStorage: "language",
      // Cache de la langue détectée dans localStorage
      caches: ["localStorage"],
    },
    // Options d'interpolation
    interpolation: {
      // React gère déjà l'échappement des variables
      escapeValue: false,
    },
    react: {
      // Attendre que les traductions soient chargées avant de rendre les composants
      useSuspense: true,
    },
  });

export default i18n;
