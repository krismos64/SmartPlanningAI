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
          const result = await this.handleAction(matchedQuestion.action);
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
      .replace(/[.,?!;:'"()\-]/g, "")
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

        // Gérer le résultat directement ici
        if (this.onHandleActionResult) {
          this.onHandleActionResult(result);
        }

        return result;
      }

      // Vérifier si l'action correspond à une question prédéfinie avec réponse statique
      const questionMatch = this.findQuestionByAction(action);
      if (questionMatch && questionMatch.response) {
        // C'est une question avec réponse statique, pas besoin d'API
        this.onAddBotMessage({
          text: questionMatch.response,
          isBot: true,
          suggestions: questionMatch.suggestions || [],
        });

        const result = {
          success: true,
          response: questionMatch.response,
          suggestions: questionMatch.suggestions || [],
          _handled: true, // Marquer comme déjà traité
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

        if (this.onHandleActionResult) {
          this.onHandleActionResult(result);
        }

        return result;
      }

      // Requêtes à la base de données via l'API
      const result = await this.handleDatabaseQuery(action);

      // Éviter de traiter le résultat deux fois
      if (!result._handled && this.onHandleActionResult) {
        this.onHandleActionResult(result);
      }

      return result;
    } catch (error) {
      console.error("Erreur lors de l'exécution de l'action:", error);

      const errorResult = {
        success: false,
        error: error.message,
        response:
          "Désolé, une erreur s'est produite lors de l'exécution de cette action.",
      };

      if (this.onHandleActionResult) {
        this.onHandleActionResult(errorResult);
      }

      return errorResult;
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
      // Vérifier si un token d'authentification est disponible
      const token = localStorage.getItem("authToken");
      if (!token) {
        return {
          success: false,
          error: "Non authentifié",
          response: "Vous devez être connecté pour effectuer cette action.",
        };
      }

      const response = await fetch("/api/chatbot/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        // Gérer spécifiquement les erreurs 404
        if (response.status === 404) {
          const fallbackResponse = this.getFallbackResponse(action);
          // Marquer comme déjà traité pour éviter les doublons
          fallbackResponse._handled = true;
          return fallbackResponse;
        }

        throw new Error("Erreur de réponse serveur");
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la requête:", error);

      const errorResponse = {
        success: false,
        error: error.message || "Erreur inconnue",
        response:
          "Désolé, une erreur s'est produite lors de la communication avec le serveur.",
        _handled: true, // Marquer comme déjà traité
      };

      return errorResponse;
    }
  }

  /**
   * Fournit une réponse de fallback lorsque l'API n'est pas disponible
   * @param {string} action - L'action demandée
   * @returns {Object} Réponse de fallback
   */
  getFallbackResponse(action) {
    // Réponses par défaut pour les actions courantes
    const fallbackResponses = {
      check_vacations: {
        success: true,
        response:
          "Vous pouvez consulter vos congés dans la section 'Congés' du menu principal. Pour poser un congé, cliquez sur 'Nouvelle demande'.",
        suggestions: [
          { text: "Comment poser un congé ?", action: "conges_1" },
          { text: "Voir mes congés", action: "redirect_vacations" },
        ],
      },
      check_data: {
        success: true,
        response:
          "Je ne peux pas accéder à vos données personnalisées pour le moment. Vous pouvez consulter votre profil dans la section 'Mon Profil'.",
        suggestions: [
          { text: "Planning", action: "topic_plannings" },
          { text: "Congés", action: "topic_conges" },
        ],
      },
      get_absences_today: {
        success: true,
        response:
          "Je ne peux pas accéder aux informations d'absence en ce moment. Veuillez consulter le calendrier des absences dans l'application.",
      },
      get_working_today: {
        success: true,
        response:
          "Je ne peux pas accéder aux plannings en ce moment. Veuillez consulter le calendrier des présences dans l'application.",
      },
    };

    return (
      fallbackResponses[action] || {
        success: true,
        response:
          "Cette fonctionnalité n'est pas disponible actuellement. Veuillez réessayer plus tard ou consulter l'application directement.",
      }
    );
  }
}

export default ChatbotRulesIntegration;
