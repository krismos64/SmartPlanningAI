import { CHATBOT_TOPICS } from "../../config/chatbotTopics";

/**
 * Classe d'intégration des règles et logiques du chatbot
 * Gère la communication avec le backend et le traitement des messages
 */
class ChatbotRulesIntegration {
  /**
   * Initialise l'intégration du chatbot
   * @param {Object} options - Options de configuration
   * @param {Function} options.onAddBotMessage - Callback pour ajouter un message du bot
   * @param {Function} options.onSetIsTyping - Callback pour indiquer que le bot est en train d'écrire
   * @param {Function} options.onHandleActionResult - Callback pour traiter le résultat d'une action
   * @param {Function} options.onStartScheduleGeneration - Callback pour démarrer la génération d'un planning
   */
  constructor(options = {}) {
    // Callbacks
    this.onAddBotMessage = options.onAddBotMessage || (() => {});
    this.onSetIsTyping = options.onSetIsTyping || (() => {});
    this.onHandleActionResult = options.onHandleActionResult || (() => {});
    this.onStartScheduleGeneration =
      options.onStartScheduleGeneration || (() => {});

    // Options de configuration
    this.debug = options.debug || false;
  }

  /**
   * Journalise un message de débogage si le mode debug est activé
   * @param {...any} args - Arguments à logger
   */
  log(...args) {
    if (this.debug) {
      console.log(" ChatbotRules:", ...args);
    }
  }

  /**
   * Traite un message entrant et détermine s'il correspond à une question prédéfinie
   * @param {string} message - Le message à traiter
   * @returns {Object} Résultat du traitement
   */
  async processMessage(message) {
    if (this.onSetIsTyping) {
      this.onSetIsTyping(true);
    }

    try {
      // Chercher si le message correspond à une question prédéfinie
      let matchedQuestion = null;

      // Parcourir tous les sujets et leurs questions
      for (const topic of CHATBOT_TOPICS) {
        for (const question of topic.questions) {
          if (this.isMessageMatchingQuestion(message, question.text)) {
            matchedQuestion = question;
            break;
          }
        }
        if (matchedQuestion) break;
      }

      if (matchedQuestion) {
        // Si c'est une question avec réponse dynamique (via API)
        if (matchedQuestion.dynamicResponse) {
          await this.handleAction(matchedQuestion.action);
          return { processed: true, action: matchedQuestion.action };
        }
        // Si c'est une question avec réponse statique
        else if (matchedQuestion.response) {
          this.onAddBotMessage({
            text: matchedQuestion.response,
            isBot: true,
            suggestions: matchedQuestion.suggestions || [],
          });
          return { processed: true, action: null };
        }
      }

      // Si aucune correspondance n'est trouvée
      this.onAddBotMessage({
        text: "Je ne comprends pas votre question. Pourriez-vous la reformuler ou choisir l'une des suggestions ci-dessous ?",
        isBot: true,
        suggestions: [
          { text: "Aide", action: "get_help" },
          { text: "Données personnalisées", action: "check_data" },
        ],
      });

      return { processed: true, action: null };
    } catch (error) {
      console.error("Erreur lors du traitement du message:", error);

      this.onAddBotMessage({
        text: "Désolé, une erreur s'est produite lors du traitement de votre demande.",
        isBot: true,
      });

      return { processed: false, error: error.message };
    } finally {
      if (this.onSetIsTyping) {
        this.onSetIsTyping(false);
      }
    }
  }

  /**
   * Vérifie si un message correspond à une question prédéfinie
   * @param {string} message - Le message utilisateur
   * @param {string} questionText - Le texte de la question prédéfinie
   * @returns {boolean} Vrai si le message correspond à la question
   */
  isMessageMatchingQuestion(message, questionText) {
    // Simplifier le message et la question pour la comparaison
    const normalizedMessage = this.normalizeText(message);
    const normalizedQuestion = this.normalizeText(questionText);

    // Correspondance directe
    if (normalizedMessage === normalizedQuestion) {
      return true;
    }

    // Correspondance partielle (contient les mots-clés principaux)
    const messageWords = normalizedMessage.split(" ");
    const questionWords = normalizedQuestion.split(" ");

    // Trouver les mots clés (mots de plus de 3 caractères)
    const keywordsQuestion = questionWords.filter((word) => word.length > 3);
    const matchCount = keywordsQuestion.filter((keyword) =>
      messageWords.some(
        (word) => word.includes(keyword) || keyword.includes(word)
      )
    ).length;

    // Si plus de 70% des mots-clés correspondent
    const matchRatio =
      keywordsQuestion.length > 0 ? matchCount / keywordsQuestion.length : 0;
    return matchRatio > 0.7;
  }

  /**
   * Normalise un texte pour la comparaison
   * @param {string} text - Texte à normaliser
   * @returns {string} Texte normalisé
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[.,?!;:'"()\\-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Exécute une action prédéfinie
   * @param {string} action - L'action à exécuter
   * @returns {Object} Résultat de l'action
   */
  async handleAction(action) {
    if (this.onSetIsTyping) {
      this.onSetIsTyping(true);
    }

    try {
      // Actions spéciales qui ne nécessitent pas d'appel au backend
      if (action.startsWith("topic_")) {
        const result = this.handleTopicAction(action);
        // Ne pas appeler le callback ici, il sera appelé à la fin de la fonction
        return result;
      }

      // Actions de redirection
      if (action.startsWith("redirect_")) {
        const result = this.handleRedirection(action);
        // Ne pas appeler le callback ici, il sera appelé à la fin de la fonction
        return result;
      }

      // Vérifier si l'action correspond à une question prédéfinie avec réponse statique
      const questionMatch = this.findQuestionByAction(action);
      if (questionMatch && questionMatch.response) {
        // C'est une question avec réponse statique, pas besoin d'API
        // Ne pas appeler directement onAddBotMessage, créer un résultat à traiter par le callback
        const result = {
          success: true,
          response: questionMatch.response,
          suggestions: questionMatch.suggestions || [],
        };

        return result;
      }

      // Actions qui génèrent des plannings
      if (action === "generate_schedule") {
        if (this.onStartScheduleGeneration) {
          this.onStartScheduleGeneration();
        }

        const result = {
          success: true,
          response:
            "J'ai lancé la génération du planning. Vous serez notifié quand ce sera terminé.",
        };

        return result;
      }

      // Requêtes à la base de données via l'API
      const result = await this.handleDatabaseQuery(action);

      // Ne pas marquer comme handled, laisser le callback gérer cela
      if (this.onHandleActionResult) {
        this.onHandleActionResult(result);
      }

      return result;
    } catch (error) {
      console.error("Erreur lors de l'exécution de l'action:", error);

      // Message d'erreur plus explicite
      const errorMessage = error.message || "Erreur inconnue";

      const errorResponse = {
        success: false,
        error: errorMessage,
        response: `⚠️ Impossible d'accéder à la base de données: ${errorMessage}. Veuillez consulter directement l'application pour accéder à vos données réelles.`,
        suggestions: [
          { text: "Tableau de bord", action: "redirect_dashboard" },
          { text: "Retour au menu principal", action: "get_help" },
        ],
      };

      // Ne pas appeler directement onAddBotMessage, laisser le callback s'en charger
      if (this.onHandleActionResult) {
        this.log(
          "Appel du callback onHandleActionResult avec la réponse de fallback"
        );
        // Ne pas appeler le callback ici pour éviter le doublon
        // this.onHandleActionResult(errorResponse);
      }

      // Marquer la réponse comme non traitée pour permettre à handleAction de le faire
      errorResponse._handled = false;

      return errorResponse;
    } finally {
      if (this.onSetIsTyping) {
        this.onSetIsTyping(false);
      }
    }
  }

  /**
   * Gère les actions liées à la sélection d'un sujet
   * @param {string} action - L'action à exécuter
   * @returns {Object} Résultat de l'action
   */
  handleTopicAction(action) {
    const topicId = action.replace("topic_", "");
    const topic = CHATBOT_TOPICS.find((t) => t.id === topicId);

    if (!topic) {
      return {
        success: false,
        response: "Désolé, je ne peux pas trouver d'informations sur ce sujet.",
      };
    }

    // Créer des suggestions à partir des questions du sujet
    const suggestions = topic.questions.map((q) => ({
      text: q.text,
      action: q.action || q.id,
    }));

    return {
      success: true,
      response: `Voici les questions fréquentes sur "${topic.name}":`,
      suggestions,
    };
  }

  /**
   * Trouve une question par son action
   * @param {string} action - L'action à rechercher
   * @returns {Object|null} - La question trouvée ou null
   */
  findQuestionByAction(action) {
    // Actions spéciales qui ne sont pas dans les sujets
    if (action === "get_help") {
      return {
        id: "get_help",
        text: "Aide",
        response:
          "Vous ne trouvez pas de réponse claire à votre problème ? Contactez notre support client en remplissant le formulaire de contact suivant, nous vous répondrons dans les plus brefs délais :",
        suggestions: [{ text: "Support client", action: "redirect_contact" }],
      };
    }

    if (action === "features_available") {
      return {
        id: "features_available",
        text: "Quelles fonctionnalités sont disponibles ?",
        response:
          "Même sans être connecté, vous pouvez explorer :\n\n• Des informations générales sur les plannings\n• Des questions fréquentes sur les congés\n• Des renseignements sur la gestion des employés\n\nPour accéder à vos données personnelles (votre planning, vos congés, etc.), vous devrez vous connecter.",
        suggestions: [
          { text: "Planning", action: "topic_plannings" },
          { text: "Congés", action: "topic_conges" },
          { text: "Employés", action: "topic_employes" },
        ],
      };
    }

    if (action === "profile_setup") {
      return {
        id: "profile_setup",
        text: "Configurer mon profil",
        response:
          "Pour configurer votre profil, accédez à la section 'Mon Profil' dans le menu principal. Vous pourrez alors :\n\n• Modifier vos informations personnelles\n• Configurer vos préférences de notifications\n• Gérer vos paramètres de confidentialité\n• Mettre à jour votre mot de passe\n\nN'oubliez pas d'enregistrer vos modifications après chaque changement.",
        suggestions: [
          { text: "Où trouver mon planning ?", action: "plannings_2" },
          { text: "Retour au menu principal", action: "get_help" },
        ],
      };
    }

    for (const topic of CHATBOT_TOPICS) {
      for (const question of topic.questions) {
        if (question.id === action || question.action === action) {
          return question;
        }
      }
    }
    return null;
  }

  /**
   * Exécute une requête à la base de données via l'API
   * @param {string} action - L'action à exécuter
   * @returns {Object} Résultat de la requête
   */
  async handleDatabaseQuery(action) {
    try {
      this.log("Envoi de la requête API", {
        action,
        url: "/api/chatbot/query",
      });

      // Vérifier si un token d'authentification est disponible
      // Dans ce projet, le token est stocké sous le nom "token" dans localStorage
      const token = localStorage.getItem("token");

      // Debugging
      this.log("État d'authentification:", token ? "connecté" : "non connecté");

      // Récupérer un token dans l'URL s'il existe (pour les tests ou intégrations externes)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get("token");

      const effectiveToken = token || urlToken;

      if (!effectiveToken) {
        this.log("Utilisateur non authentifié");

        // Montrer un message indiquant que l'authentification est nécessaire
        const authRequiredResponse = {
          success: false,
          error: "Non authentifié",
          response:
            "⚠️ Vous devez être connecté pour accéder à vos données personnelles. Veuillez vous connecter pour utiliser cette fonctionnalité.",
          suggestions: [
            { text: "Fonctionnalités générales", action: "get_help" },
          ],
          _handled: true,
        };

        // S'assurer que le callback est appelé avec le résultat de fallback
        if (this.onHandleActionResult) {
          this.log(
            "Appel du callback onHandleActionResult avec la réponse de fallback"
          );
          // Ne pas appeler le callback ici pour éviter le doublon
          // this.onHandleActionResult(authRequiredResponse);
        }

        // Marquer la réponse comme non traitée pour permettre à handleAction de le faire
        authRequiredResponse._handled = false;

        return authRequiredResponse;
      }

      // Essayez d'accéder à l'API backend avec le token
      this.log("Tentative d'accès à l'API avec token valide");

      const headers = {
        "Content-Type": "application/json",
      };

      // N'ajoute pas le header d'authentification pour check_data car c'est une route spéciale qui fonctionne sans auth
      if (action !== "check_data" && effectiveToken) {
        headers.Authorization = `Bearer ${effectiveToken}`;
      }

      // Utiliser l'URL complète au lieu du chemin relatif pour éviter les problèmes de proxy
      const CHATBOT_API_URL = process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/chatbot/query`
        : `${process.env.REACT_APP_API_URL}/chatbot/query`;

      this.log("URL de l'API utilisée:", CHATBOT_API_URL);

      const response = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        // Gérer spécifiquement les erreurs 404
        if (response.status === 404) {
          this.log("Endpoint non trouvé (404)", { action });
          this.log("Génération d'une réponse de fallback pour", action);

          const fallbackResponse = this.getFallbackResponse(action);

          // S'assurer que le callback est appelé avec le résultat de fallback
          if (this.onHandleActionResult) {
            this.log(
              "Appel du callback onHandleActionResult avec la réponse de fallback"
            );
            // Ne pas appeler le callback ici pour éviter le doublon
            // this.onHandleActionResult(fallbackResponse);
          }

          // Marquer la réponse comme non traitée pour permettre à handleAction de le faire
          fallbackResponse._handled = false;

          return fallbackResponse;
        }

        // Gérer les autres erreurs HTTP (401, 403, 500, etc.)
        const statusText = response.statusText;
        const errorCode = response.status;

        throw new Error(`Erreur serveur (${errorCode}): ${statusText}`);
      }

      // Si tout va bien, traiter la réponse normale
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la requête API:", error);

      // Message d'erreur plus explicite
      const errorMessage = error.message || "Erreur inconnue";

      const errorResponse = {
        success: false,
        error: errorMessage,
        response: `⚠️ Impossible d'accéder à la base de données: ${errorMessage}. Veuillez consulter directement l'application pour accéder à vos données réelles.`,
        suggestions: [
          { text: "Tableau de bord", action: "redirect_dashboard" },
          { text: "Retour au menu principal", action: "get_help" },
        ],
      };

      // Ne pas appeler directement onAddBotMessage, laisser le callback s'en charger
      if (this.onHandleActionResult) {
        this.log(
          "Appel du callback onHandleActionResult avec la réponse de fallback"
        );
        // Ne pas appeler le callback ici pour éviter le doublon
        // this.onHandleActionResult(errorResponse);
      }

      // Marquer la réponse comme non traitée pour permettre à handleAction de le faire
      errorResponse._handled = false;

      return errorResponse;
    }
  }

  /**
   * Fournit une réponse de fallback lorsque l'API n'est pas disponible
   * @param {string} action - L'action demandée
   * @returns {Object} Réponse de fallback
   */
  getFallbackResponse(action) {
    // Message commun pour toutes les réponses de fallback
    const apiErrorPrefix = "⚠️ Impossible d'accéder à la base de données. ";

    // Réponses par défaut pour les actions courantes
    const fallbackResponses = {
      check_vacations: {
        success: false,
        response:
          apiErrorPrefix +
          "Pour consulter vos congés réels, veuillez accéder directement à la section 'Vacations' du menu principal.",
        suggestions: [
          { text: "Congés", action: "redirect_vacations" },
          { text: "Retour au menu", action: "get_help" },
        ],
      },
      check_data: {
        success: false,
        response:
          apiErrorPrefix +
          "Pour consulter les données de votre équipe et de vos employés, veuillez accéder directement aux sections correspondantes de l'application.",
        suggestions: [
          { text: "Planning hebdomadaire", action: "redirect_planning" },
          { text: "Congés", action: "redirect_vacations" },
          { text: "Employés", action: "redirect_employees" },
          { text: "Tableau de bord", action: "redirect_dashboard" },
        ],
      },
      employee_vacation_today: {
        success: false,
        response:
          apiErrorPrefix +
          "Pour voir les employés en congés aujourd'hui, veuillez consulter le calendrier des congés dans l'application.",
        suggestions: [{ text: "Congés", action: "redirect_vacations" }],
      },
      employee_next_vacation: {
        success: false,
        response:
          apiErrorPrefix +
          "Pour voir les prochains congés prévus, veuillez consulter le calendrier des congés dans l'application.",
        suggestions: [{ text: "Congés", action: "redirect_vacations" }],
      },
      employee_working_today: {
        success: false,
        response:
          apiErrorPrefix +
          "Pour voir les employés qui travaillent aujourd'hui, veuillez consulter le planning hebdomadaire dans l'application.",
        suggestions: [
          { text: "Planning hebdomadaire", action: "redirect_planning" },
        ],
      },
      employee_positive_hours: {
        success: false,
        response:
          apiErrorPrefix +
          "Pour consulter les soldes d'heures positifs, veuillez accéder à la section 'Gestion du temps' de l'application.",
        suggestions: [
          { text: "Tableau de bord", action: "redirect_dashboard" },
        ],
      },
      employee_negative_hours: {
        success: false,
        response:
          apiErrorPrefix +
          "Pour consulter les soldes d'heures négatifs, veuillez accéder à la section 'Gestion du temps' de l'application.",
        suggestions: [
          { text: "Tableau de bord", action: "redirect_dashboard" },
        ],
      },
      get_absences_today: {
        success: false,
        response:
          apiErrorPrefix +
          "Pour consulter les absences du jour, veuillez accéder directement au calendrier des congés dans l'application.",
        suggestions: [
          {
            text: "Congés",
            action: "redirect_vacations",
          },
        ],
      },
      get_working_today: {
        success: false,
        response:
          apiErrorPrefix +
          "Pour consulter les plannings du jour, veuillez accéder directement au planning hebdomadaire dans l'application.",
        suggestions: [
          { text: "Planning hebdomadaire", action: "redirect_planning" },
        ],
      },
      hour_balance_help: {
        success: false,
        response:
          apiErrorPrefix +
          "Pour gérer les soldes d'heures, accédez à la section 'Gestion du temps' puis 'Soldes horaires' de l'application.",
        suggestions: [
          { text: "Tableau de bord", action: "redirect_dashboard" },
        ],
      },
    };

    // Message par défaut si aucune action spécifique n'est trouvée
    return (
      fallbackResponses[action] || {
        success: false,
        response:
          apiErrorPrefix +
          "Cette fonctionnalité nécessite un accès à la base de données. Veuillez consulter directement l'application pour accéder à vos données réelles.",
        suggestions: [
          { text: "Aller au tableau de bord", action: "redirect_dashboard" },
          { text: "Retour au menu principal", action: "get_help" },
        ],
      }
    );
  }

  /**
   * Gère les actions de redirection vers d'autres pages de l'application
   * @param {string} action - L'action de redirection à exécuter
   * @returns {Object} Résultat de l'action
   */
  handleRedirection(action) {
    this.log("Redirection vers", action);

    // Carte des redirections vers les chemins réels
    const redirectMap = {
      redirect_planning: "/weekly-schedule",
      redirect_vacations: "/vacations",
      redirect_profile: "/profile",
      redirect_dashboard: "/dashboard",
      redirect_employees: "/employees",
      redirect_contact: "/contact",
    };

    const path = redirectMap[action];

    if (path) {
      // Rediriger via la navigation du navigateur
      setTimeout(() => {
        window.location.href = path;
      }, 1000);

      return {
        success: true,
        response: `Je vous redirige vers la page ${path.replace("/", "")}...`,
      };
    }

    return {
      success: false,
      response: "Désolé, je ne peux pas vous rediriger vers cette page.",
    };
  }
}

export default ChatbotRulesIntegration;
