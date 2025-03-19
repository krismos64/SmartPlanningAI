/**
 * Service NLP avancé pour le chatbot
 * Utilise node-nlp pour détecter les intentions de manière plus précise
 */

const { NlpManager } = require("node-nlp");
const { formatDateYYYYMMDD } = require("../utils/dateUtils");

// Configuration du manager NLP
const manager = new NlpManager({
  languages: ["fr"],
  forceNER: true,
  nlu: { log: false },
});

// Classe principale du service NLP
class NlpService {
  constructor() {
    this.initialized = false;
    this.initializeNLP();
  }

  /**
   * Initialiser et entraîner le modèle NLP
   */
  async initializeNLP() {
    try {
      if (this.initialized) return;

      console.log("Initialisation du service NLP...");

      // 1. Ajouter les entités personnalisées
      this.addCustomEntities();

      // 2. Ajouter les intentions et les expressions d'entraînement
      this.addIntentsAndUtterances();

      // 3. Entraîner le modèle
      await manager.train();

      this.initialized = true;
      console.log("Service NLP initialisé et entraîné avec succès");
    } catch (error) {
      console.error("Erreur lors de l'initialisation du service NLP:", error);
      throw error;
    }
  }

  /**
   * Ajouter les entités personnalisées
   */
  addCustomEntities() {
    // Jours de la semaine
    manager.addNamedEntityText(
      "day",
      "lundi",
      ["fr"],
      ["lundi", "le lundi", "lun", "lun."]
    );
    manager.addNamedEntityText(
      "day",
      "mardi",
      ["fr"],
      ["mardi", "le mardi", "mar", "mar."]
    );
    manager.addNamedEntityText(
      "day",
      "mercredi",
      ["fr"],
      ["mercredi", "le mercredi", "mer", "mer."]
    );
    manager.addNamedEntityText(
      "day",
      "jeudi",
      ["fr"],
      ["jeudi", "le jeudi", "jeu", "jeu."]
    );
    manager.addNamedEntityText(
      "day",
      "vendredi",
      ["fr"],
      ["vendredi", "le vendredi", "ven", "ven."]
    );
    manager.addNamedEntityText(
      "day",
      "samedi",
      ["fr"],
      ["samedi", "le samedi", "sam", "sam."]
    );
    manager.addNamedEntityText(
      "day",
      "dimanche",
      ["fr"],
      ["dimanche", "le dimanche", "dim", "dim."]
    );

    // Types de congés
    manager.addNamedEntityText(
      "vacation_type",
      "congé payé",
      ["fr"],
      ["congé payé", "congés payés", "CP", "congé annuel", "congés annuels"]
    );
    manager.addNamedEntityText(
      "vacation_type",
      "RTT",
      ["fr"],
      ["RTT", "jour de RTT", "jours de RTT", "réduction du temps de travail"]
    );
    manager.addNamedEntityText(
      "vacation_type",
      "congé sans solde",
      ["fr"],
      ["congé sans solde", "sans solde", "CSS", "non rémunéré"]
    );
    manager.addNamedEntityText(
      "vacation_type",
      "maladie",
      ["fr"],
      ["congé maladie", "arrêt maladie", "arrêt de travail", "maladie"]
    );

    // Périodes
    manager.addNamedEntityText(
      "period",
      "jour",
      ["fr"],
      ["jour", "journée", "la journée"]
    );
    manager.addNamedEntityText(
      "period",
      "semaine",
      ["fr"],
      ["semaine", "cette semaine", "la semaine", "hebdomadaire"]
    );
    manager.addNamedEntityText(
      "period",
      "mois",
      ["fr"],
      ["mois", "ce mois", "le mois", "mensuel"]
    );
    manager.addNamedEntityText(
      "period",
      "trimestre",
      ["fr"],
      ["trimestre", "ce trimestre", "le trimestre", "trimestriel"]
    );
    manager.addNamedEntityText(
      "period",
      "année",
      ["fr"],
      ["année", "an", "cette année", "annuel", "l'année"]
    );
  }

  /**
   * Ajouter les intentions et les expressions d'entraînement
   */
  addIntentsAndUtterances() {
    // Assistance générale
    manager.addDocument("fr", "aide", "HELP");
    manager.addDocument("fr", "comment ça marche", "HELP");
    manager.addDocument("fr", "que peux-tu faire", "HELP");
    manager.addDocument("fr", "quelles sont tes fonctionnalités", "HELP");
    manager.addDocument("fr", "besoin d'aide", "HELP");
    manager.addDocument("fr", "je ne comprends pas comment utiliser", "HELP");
    manager.addDocument("fr", "guide moi", "HELP");
    manager.addDocument("fr", "comment fonctionne cette application", "HELP");

    // Planning - Visualisation
    manager.addDocument("fr", "montre mon planning", "VIEW_SCHEDULE");
    manager.addDocument("fr", "affiche mon planning", "VIEW_SCHEDULE");
    manager.addDocument("fr", "voir mon emploi du temps", "VIEW_SCHEDULE");
    manager.addDocument("fr", "quels sont mes horaires", "VIEW_SCHEDULE");
    manager.addDocument("fr", "consulter mon planning", "VIEW_SCHEDULE");
    manager.addDocument("fr", "planning de la semaine", "VIEW_SCHEDULE");
    manager.addDocument("fr", "mon planning du %day%", "VIEW_SCHEDULE");
    manager.addDocument(
      "fr",
      "planning pour la semaine du %date%",
      "VIEW_SCHEDULE"
    );
    manager.addDocument("fr", "voir le planning de %person%", "VIEW_SCHEDULE");

    // Planning - Génération
    manager.addDocument("fr", "générer un planning", "GENERATE_SCHEDULE");
    manager.addDocument("fr", "créer un planning", "GENERATE_SCHEDULE");
    manager.addDocument("fr", "faire un planning", "GENERATE_SCHEDULE");
    manager.addDocument(
      "fr",
      "créer un planning pour la semaine prochaine",
      "GENERATE_SCHEDULE"
    );
    manager.addDocument(
      "fr",
      "nouveau planning pour mon équipe",
      "GENERATE_SCHEDULE"
    );
    manager.addDocument(
      "fr",
      "générer le planning de la semaine du %date%",
      "GENERATE_SCHEDULE"
    );
    manager.addDocument(
      "fr",
      "planifier les horaires de mon équipe",
      "GENERATE_SCHEDULE"
    );
    manager.addDocument(
      "fr",
      "établir un planning pour le département",
      "GENERATE_SCHEDULE"
    );
    manager.addDocument(
      "fr",
      "organiser les horaires de travail",
      "GENERATE_SCHEDULE"
    );
    manager.addDocument("fr", "préparer le planning", "GENERATE_SCHEDULE");

    // Congés - Vérification de disponibilité
    manager.addDocument(
      "fr",
      "puis-je poser des congés",
      "CHECK_VACATION_AVAILABILITY"
    );
    manager.addDocument(
      "fr",
      "vérifier disponibilité pour congés",
      "CHECK_VACATION_AVAILABILITY"
    );
    manager.addDocument(
      "fr",
      "est-ce que je peux prendre des vacances",
      "CHECK_VACATION_AVAILABILITY"
    );
    manager.addDocument(
      "fr",
      "disponibilité pour congés du %date% au %date%",
      "CHECK_VACATION_AVAILABILITY"
    );
    manager.addDocument(
      "fr",
      "vérifier si je peux poser des congés la semaine prochaine",
      "CHECK_VACATION_AVAILABILITY"
    );
    manager.addDocument(
      "fr",
      "est-ce possible de prendre des congés en %month%",
      "CHECK_VACATION_AVAILABILITY"
    );
    manager.addDocument(
      "fr",
      "ai-je droit à des congés",
      "CHECK_VACATION_AVAILABILITY"
    );
    manager.addDocument(
      "fr",
      "combien de jours de congés me reste-t-il",
      "CHECK_VACATION_AVAILABILITY"
    );

    // Congés - Création de demande
    manager.addDocument("fr", "poser des congés", "CREATE_VACATION_REQUEST");
    manager.addDocument("fr", "demande de congés", "CREATE_VACATION_REQUEST");
    manager.addDocument(
      "fr",
      "je voudrais prendre des vacances",
      "CREATE_VACATION_REQUEST"
    );
    manager.addDocument(
      "fr",
      "poser un %vacation_type%",
      "CREATE_VACATION_REQUEST"
    );
    manager.addDocument(
      "fr",
      "créer une demande de congé du %date% au %date%",
      "CREATE_VACATION_REQUEST"
    );
    manager.addDocument(
      "fr",
      "je souhaite m'absenter le %date%",
      "CREATE_VACATION_REQUEST"
    );
    manager.addDocument(
      "fr",
      "poser un jour de RTT le %date%",
      "CREATE_VACATION_REQUEST"
    );
    manager.addDocument(
      "fr",
      "faire une demande de congés pour %month%",
      "CREATE_VACATION_REQUEST"
    );

    // Statistiques
    manager.addDocument("fr", "statistiques", "GET_STATS");
    manager.addDocument("fr", "stats de mon équipe", "GET_STATS");
    manager.addDocument("fr", "rapport d'heures travaillées", "GET_STATS");
    manager.addDocument("fr", "combien d'heures ai-je travaillé", "GET_STATS");
    manager.addDocument("fr", "bilan mensuel", "GET_STATS");
    manager.addDocument("fr", "statistiques pour le %period%", "GET_STATS");
    manager.addDocument("fr", "rapport d'activité", "GET_STATS");
    manager.addDocument("fr", "performance de l'équipe", "GET_STATS");

    // Optimisation des plannings
    manager.addDocument("fr", "optimiser le planning", "GET_OPTIMAL_SCHEDULE");
    manager.addDocument("fr", "suggestion d'horaires", "GET_OPTIMAL_SCHEDULE");
    manager.addDocument("fr", "meilleur créneau", "GET_OPTIMAL_SCHEDULE");
    manager.addDocument(
      "fr",
      "optimiser la répartition",
      "GET_OPTIMAL_SCHEDULE"
    );
    manager.addDocument(
      "fr",
      "proposer des horaires optimaux",
      "GET_OPTIMAL_SCHEDULE"
    );
    manager.addDocument(
      "fr",
      "améliorer notre planning",
      "GET_OPTIMAL_SCHEDULE"
    );
    manager.addDocument(
      "fr",
      "recommandation pour les horaires",
      "GET_OPTIMAL_SCHEDULE"
    );
    manager.addDocument("fr", "planning efficace", "GET_OPTIMAL_SCHEDULE");

    // Liste des employés
    manager.addDocument("fr", "liste des employés", "LIST_EMPLOYEES");
    manager.addDocument(
      "fr",
      "qui travaille dans mon équipe",
      "LIST_EMPLOYEES"
    );
    manager.addDocument("fr", "membres de l'équipe", "LIST_EMPLOYEES");
    manager.addDocument("fr", "personnel du département", "LIST_EMPLOYEES");
    manager.addDocument("fr", "employés disponibles", "LIST_EMPLOYEES");
    manager.addDocument("fr", "voir mon équipe", "LIST_EMPLOYEES");
    manager.addDocument("fr", "collaborateurs", "LIST_EMPLOYEES");

    // Rappels et notifications
    manager.addDocument("fr", "rappelle-moi", "SET_REMINDER");
    manager.addDocument("fr", "crée un rappel", "SET_REMINDER");
    manager.addDocument("fr", "notification pour", "SET_REMINDER");
    manager.addDocument("fr", "préviens-moi quand", "SET_REMINDER");
    manager.addDocument("fr", "alerte pour la réunion", "SET_REMINDER");
    manager.addDocument(
      "fr",
      "programmer un rappel pour le %date%",
      "SET_REMINDER"
    );
  }

  /**
   * Analyser un message pour détecter l'intention et extraire les entités
   * @param {string} message - Message à analyser
   * @returns {Promise<Object>} Résultat de l'analyse
   */
  async processMessage(message) {
    try {
      // S'assurer que le modèle est initialisé et entraîné
      if (!this.initialized) {
        await this.initializeNLP();
      }

      // Analyser le message
      const result = await manager.process("fr", message);

      // Extraire les entités pertinentes
      const entities = this.extractEntities(result.entities);

      // Si aucune intention n'est détectée avec suffisamment de confiance
      if (!result.intent || result.score < 0.5) {
        return {
          intent: "UNKNOWN",
          score: result.score || 0,
          entities,
          message,
        };
      }

      // Extraire les dates du message si non détectées par le NLP
      if (!entities.date && !entities.dateRange) {
        const extractedDates = this.extractDatesFromText(message);
        if (extractedDates.startDate) {
          entities.dateRange = {
            start: extractedDates.startDate,
            end: extractedDates.endDate || extractedDates.startDate,
          };
        }
      }

      // Extraire les employés si pertinent
      if (
        [
          "VIEW_SCHEDULE",
          "GENERATE_SCHEDULE",
          "CHECK_VACATION_AVAILABILITY",
          "CREATE_VACATION_REQUEST",
        ].includes(result.intent)
      ) {
        entities.employeeInfo = this.extractEmployeeInfo(message);
      }

      return {
        intent: result.intent,
        score: result.score,
        entities,
        message,
      };
    } catch (error) {
      console.error("Erreur lors de l'analyse du message:", error);
      return {
        intent: "ERROR",
        score: 0,
        entities: {},
        error: error.message,
        message,
      };
    }
  }

  /**
   * Extraire et structurer les entités détectées
   * @param {Array} detectedEntities - Entités détectées par le NLP
   * @returns {Object} Entités structurées
   */
  extractEntities(detectedEntities) {
    const entities = {};

    if (!detectedEntities || !Array.isArray(detectedEntities)) {
      return entities;
    }

    // Traiter chaque entité selon son type
    for (const entity of detectedEntities) {
      switch (entity.entity) {
        case "day":
          entities.day = entity.option;
          break;

        case "vacation_type":
          entities.vacationType = entity.option;
          break;

        case "period":
          entities.period = entity.option;
          break;

        case "date":
          // Si c'est une entité date (détectée par NER intégré)
          if (!entities.dateRange) {
            entities.dateRange = {
              start: this.formatEntityDate(entity.sourceText),
            };
          } else if (!entities.dateRange.end) {
            entities.dateRange.end = this.formatEntityDate(entity.sourceText);
          }
          break;

        // Autres types d'entités...
      }
    }

    return entities;
  }

  /**
   * Formater une date extraite en format YYYY-MM-DD
   * @param {string} dateText - Texte de date
   * @returns {string} Date formatée
   */
  formatEntityDate(dateText) {
    try {
      // Analyse basique de patterns de date français
      // Exemple: "12 janvier", "12/01", "12 janvier 2023"

      // Mapping des mois en français
      const monthMapping = {
        janvier: 0,
        jan: 0,
        "jan.": 0,
        février: 1,
        fév: 1,
        fev: 1,
        "fév.": 1,
        mars: 2,
        mar: 2,
        "mar.": 2,
        avril: 3,
        avr: 3,
        "avr.": 3,
        mai: 4,
        juin: 5,
        juillet: 6,
        juil: 6,
        "juil.": 6,
        août: 7,
        aout: 7,
        aoû: 7,
        aou: 7,
        septembre: 8,
        sept: 8,
        "sept.": 8,
        octobre: 9,
        oct: 9,
        "oct.": 9,
        novembre: 10,
        nov: 10,
        "nov.": 10,
        décembre: 11,
        dec: 11,
        déc: 11,
        "déc.": 11,
      };

      // Vérifier si c'est déjà au format YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
        return dateText;
      }

      // Format DD/MM/YYYY ou DD-MM-YYYY
      const dmyRegex = /(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{4}|\d{2}))?/;
      const dmyMatch = dateText.match(dmyRegex);

      if (dmyMatch) {
        const day = parseInt(dmyMatch[1], 10);
        const month = parseInt(dmyMatch[2], 10) - 1; // Mois commencent à 0 en JS
        const year = dmyMatch[3]
          ? parseInt(dmyMatch[3], 10)
          : new Date().getFullYear();

        // Ajuster l'année si format à 2 chiffres
        const fullYear =
          year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;

        const date = new Date(fullYear, month, day);
        return formatDateYYYYMMDD(date);
      }

      // Format "12 janvier 2023"
      const textRegex = /(\d{1,2})\s+([a-zéèêëàâäôöûüùïîç\.]+)(?:\s+(\d{4}))?/i;
      const textMatch = dateText.match(textRegex);

      if (textMatch) {
        const day = parseInt(textMatch[1], 10);
        const monthText = textMatch[2].toLowerCase();
        const month = monthMapping[monthText];
        const year = textMatch[3]
          ? parseInt(textMatch[3], 10)
          : new Date().getFullYear();

        if (month !== undefined) {
          const date = new Date(year, month, day);
          return formatDateYYYYMMDD(date);
        }
      }

      // Si la date est relative (aujourd'hui, demain, etc.)
      const today = new Date();

      if (/aujourd[''h]?ui|ce jour/i.test(dateText)) {
        return formatDateYYYYMMDD(today);
      }

      if (/demain/i.test(dateText)) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return formatDateYYYYMMDD(tomorrow);
      }

      if (/après-?demain|apres-?demain/i.test(dateText)) {
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(today.getDate() + 2);
        return formatDateYYYYMMDD(dayAfterTomorrow);
      }

      // Si on ne peut pas extraire une date valide
      return null;
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return null;
    }
  }

  /**
   * Extraire les dates d'un texte
   * @param {string} text - Texte à analyser
   * @returns {Object} Dates extraites
   */
  extractDatesFromText(text) {
    const result = {
      startDate: null,
      endDate: null,
    };

    try {
      // Pattern pour les plages de dates
      // ex: "du 10 au 15 janvier", "du 10/01 au 15/01/2023"
      const rangeDateRegex =
        /du\s+(\d{1,2}(?:\/\d{1,2}(?:\/\d{4})?)?|\d{1,2}\s+\w+(?:\s+\d{4})?)\s+au\s+(\d{1,2}(?:\/\d{1,2}(?:\/\d{4})?)?|\d{1,2}\s+\w+(?:\s+\d{4})?)/i;
      const rangeMatch = text.match(rangeDateRegex);

      if (rangeMatch) {
        result.startDate = this.formatEntityDate(rangeMatch[1]);
        result.endDate = this.formatEntityDate(rangeMatch[2]);
        return result;
      }

      // Pattern pour une date unique
      // ex: "le 15 janvier", "pour le 15/01"
      const singleDateRegex =
        /(?:le|pour le|à partir du|depuis le)\s+(\d{1,2}(?:\/\d{1,2}(?:\/\d{4})?)?|\d{1,2}\s+\w+(?:\s+\d{4})?)/i;
      const singleMatch = text.match(singleDateRegex);

      if (singleMatch) {
        result.startDate = this.formatEntityDate(singleMatch[1]);
        return result;
      }

      // Rechercher n'importe quelle date dans le texte
      const anyDateRegex =
        /(\d{1,2}\/\d{1,2}(?:\/\d{4})?|\d{4}-\d{2}-\d{2}|\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)(?:\s+\d{4})?)/i;
      const anyMatch = text.match(anyDateRegex);

      if (anyMatch) {
        result.startDate = this.formatEntityDate(anyMatch[1]);
        return result;
      }

      // Semaine prochaine, mois prochain, etc.
      const today = new Date();

      if (/semaine prochaine|la semaine prochaine/i.test(text)) {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        result.startDate = formatDateYYYYMMDD(nextWeek);

        const endNextWeek = new Date(nextWeek);
        endNextWeek.setDate(nextWeek.getDate() + 6);
        result.endDate = formatDateYYYYMMDD(endNextWeek);

        return result;
      }

      if (/mois prochain|le mois prochain/i.test(text)) {
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        nextMonth.setDate(1);
        result.startDate = formatDateYYYYMMDD(nextMonth);

        const endNextMonth = new Date(nextMonth);
        endNextMonth.setMonth(nextMonth.getMonth() + 1);
        endNextMonth.setDate(0);
        result.endDate = formatDateYYYYMMDD(endNextMonth);

        return result;
      }

      return result;
    } catch (error) {
      console.error("Erreur lors de l'extraction des dates:", error);
      return result;
    }
  }

  /**
   * Extraire les informations sur un employé à partir du texte
   * @param {string} text - Texte à analyser
   * @returns {string|null} ID de l'employé ou null
   */
  extractEmployeeInfo(text) {
    // Cette fonction pourrait être étendue pour rechercher des noms d'employés dans la base de données
    // Pour l'instant, on utilise une implémentation simple

    // Si le texte contient "mon" ou "mes", il s'agit de l'utilisateur actuel
    if (/mon|mes|je|moi|j'ai/i.test(text)) {
      return "current_user";
    }

    // Rechercher un pattern comme "de Pierre" ou "pour Marie"
    const nameRegex =
      /(?:de|pour|à|a)\s+([A-Z][a-zéèêëàâäôöûüùïîç]+(?:\s+[A-Z][a-zéèêëàâäôöûüùïîç]+)?)/;
    const nameMatch = text.match(nameRegex);

    if (nameMatch) {
      return nameMatch[1]; // Retourne le nom extrait
    }

    return null;
  }
}

module.exports = new NlpService();
