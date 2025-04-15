import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// Import des composants UI
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";

// Import des composants personnalisés
import ChatbotLottieAnimation from "./ChatbotLottieAnimation";
import ChatbotRulesIntegration from "./ChatbotRulesIntegration";

// CSS
import "../../styles/Chatbot.css";

// Liste des routes où le chatbot ne doit pas apparaître
const HIDDEN_ROUTES = [
  "/", // Landing page
  "/privacy", // Page de confidentialité
  "/terms", // Conditions d'utilisation
  "/contact", // Formulaire de contact
  "/feedback", // Page de feedback
];

// Clé pour l'événement global d'ouverture du chatbot
const OPEN_CHATBOT_EVENT = "openChatbot";

/**
 * Composant de chatbot intégré à l'application
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element} Composant Chatbot
 */
const Chatbot = ({ onGenerate, onClose }) => {
  console.log("Rendu du composant Chatbot avec props:", {
    onGenerate,
    onClose,
  });

  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isRobotHovered, setIsRobotHovered] = useState(false);
  const messagesEndRef = useRef(null);
  const chatbotIntegration = useRef(null);

  // Fonction pour l'API externe d'ouverture du chatbot
  const forceChatbotOpen = useCallback(() => {
    console.log("Forcer l'ouverture du chatbot via événement global");
    setIsOpen(true);
  }, []);

  /**
   * Ajoute un message à la conversation
   * @param {Object} message - Message à ajouter
   */
  const addMessage = useCallback((message) => {
    const newMessage = {
      id: Date.now(),
      text: message.text,
      isBot: message.isBot || false,
      timestamp: new Date(),
      suggestions: message.suggestions || [],
    };

    setMessages((prev) => [...prev, newMessage]);
    console.log(
      "Message ajouté:",
      newMessage,
      "avec suggestions:",
      message.suggestions
    );
  }, []);

  /**
   * Gère le résultat d'une action
   */
  const handleActionResult = useCallback(
    (result) => {
      if (result) {
        console.log("Traitement du résultat d'action :", result);

        // Ne pas ajouter le message si _handled est true
        if (result._handled) {
          console.log(
            "Résultat déjà traité, pas d'ajout de message supplémentaire"
          );
          return;
        }

        // Marquer le résultat comme traité pour éviter la duplication
        result._handled = true;

        // Utiliser le message détaillé s'il est disponible, sinon utiliser response
        const messageText = result.message || result.response;

        addMessage({
          text: messageText,
          isBot: true,
          suggestions: result.suggestions || [],
        });
        console.log("Résultat d'action traité:", result);
      }
    },
    [addMessage]
  );

  /**
   * Défilement automatique vers le bas de la conversation
   */
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Fonction pour ouvrir/fermer le chatbot
  const toggleChatbot = useCallback(() => {
    console.log("toggleChatbot appelé, état actuel:", isOpen);

    try {
      // Utiliser une fonction de mise à jour pour garantir que nous avons la dernière valeur
      setIsOpen((prevIsOpen) => {
        const newState = !prevIsOpen;
        console.log(`État changé de ${prevIsOpen} à ${newState}`);

        // Si le chatbot est fermé, notifier le parent
        if (prevIsOpen && onClose) {
          console.log("Appel de onClose");
          onClose();
        }

        return newState;
      });

      console.log("Chatbot basculé");
    } catch (error) {
      console.error("Erreur dans toggleChatbot:", error);
    }
  }, [isOpen, onClose]);

  // Fonction pour forcer l'ouverture du chatbot
  const openChatbot = useCallback(() => {
    console.log("Forcer l'ouverture du chatbot");
    setIsOpen(true);
  }, []);

  // Fonction pour forcer la fermeture du chatbot
  const closeChatbot = useCallback(() => {
    console.log("Forcer la fermeture du chatbot");
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Créer une nouvelle conversation
  const startNewConversation = useCallback(() => {
    setMessages([]);
    console.log("Nouvelle conversation démarrée");
  }, []);

  /**
   * Gère le clic sur une suggestion
   * @param {Object} suggestion - Suggestion sélectionnée
   */
  const handleSuggestionClick = useCallback(
    async (suggestion) => {
      if (!suggestion || !suggestion.action) return;

      // Ajouter le message utilisateur (la suggestion cliquée)
      addMessage({
        text: suggestion.text,
        isBot: false,
      });

      setIsTyping(true);

      try {
        // Exécuter l'action associée à la suggestion
        const result = await chatbotIntegration.current.handleAction(
          suggestion.action
        );

        // Vérifier si le résultat a été traité par les callbacks
        // Si ce n'est pas le cas (par exemple si le callback n'a pas été appelé correctement),
        // traiter le résultat manuellement
        if (result && !result._handled) {
          console.log(
            "Résultat non traité par les callbacks, traitement manuel :",
            result
          );
          handleActionResult(result);
        }

        console.log("Résultat de l'action:", result);
      } catch (error) {
        console.error("Erreur lors du traitement de la suggestion:", error);
        addMessage({
          text: "Désolé, une erreur s'est produite lors du traitement de votre demande.",
          isBot: true,
        });
      } finally {
        setIsTyping(false);
      }
    },
    [addMessage, handleActionResult]
  );

  // Effet pour écouter l'événement global d'ouverture du chatbot
  useEffect(() => {
    // Ajouter l'écouteur d'événement pour l'API externe
    document.addEventListener(OPEN_CHATBOT_EVENT, forceChatbotOpen);

    // Nettoyer lors du démontage
    return () => {
      document.removeEventListener(OPEN_CHATBOT_EVENT, forceChatbotOpen);
    };
  }, [forceChatbotOpen]);

  // Effet d'initialisation
  useEffect(() => {
    if (!HIDDEN_ROUTES.includes(location.pathname)) {
      console.log("Initialisation du chatbot, état d'ouverture:", isOpen);

      // Initialiser l'intégration du chatbot
      chatbotIntegration.current = new ChatbotRulesIntegration({
        onAddBotMessage: (message) => {
          addMessage(message);
        },
        onStartScheduleGeneration: () => {
          if (onGenerate) {
            onGenerate();
          }
        },
        onSetIsTyping: (status) => {
          setIsTyping(status);
        },
        onHandleActionResult: (result) => {
          handleActionResult(result);
        },
        debug: true,
      });

      // Éviter d'envoyer plusieurs messages de bienvenue
      if (isOpen && messages.length === 0) {
        // Ajouter un délai pour simuler une réponse naturelle
        const timer = setTimeout(() => {
          addMessage({
            text: "Bonjour, je suis votre assistant SmartPlanning. Comment puis-je vous aider aujourd'hui ?",
            isBot: true,
            suggestions: [
              { text: "Planning hebdomadaire", action: "topic_plannings" },
              { text: "Congés", action: "topic_conges" },
              { text: "Création d'employé", action: "topic_employes" },
              { text: "Aide", action: "get_help" },
              { text: "Mes employés", action: "check_data" },
            ],
          });
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [
    isOpen,
    messages.length,
    onGenerate,
    location.pathname,
    addMessage,
    handleActionResult,
  ]);

  // Effet de défilement automatique
  useEffect(() => {
    if (!HIDDEN_ROUTES.includes(location.pathname)) {
      scrollToBottom();
    }
  }, [messages, location.pathname, scrollToBottom]);

  // Vérifier si le chatbot doit être masqué sur la route actuelle
  if (HIDDEN_ROUTES.includes(location.pathname)) {
    console.log("Chatbot masqué sur la route actuelle:", location.pathname);
    return null;
  }

  console.log("État du chatbot avant rendu:", { isOpen, isRobotHovered });

  return (
    <div
      className="chatbot-container"
      onClick={(e) => {
        console.log("Clic sur le conteneur principal du chatbot");
        if (e.target.className === "chatbot-container") {
          console.log("Clic direct sur le conteneur");
        }
      }}
    >
      {!isOpen && (
        <div
          className="chatbot-toggle-wrapper"
          onClick={(e) => {
            console.log("Clic sur le wrapper du toggle");
            toggleChatbot();
            e.stopPropagation();
          }}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "100px",
            height: "100px",
            zIndex: 9998,
            cursor: "pointer",
          }}
        >
          {/* Ajouter un bouton visible pour déblocage d'urgence */}
          <button
            onClick={(e) => {
              console.log("BOUTON DE DÉBLOCAGE CLIQUÉ");
              toggleChatbot();
              e.stopPropagation();
            }}
            style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#ff4081",
              color: "white",
              border: "none",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              cursor: "pointer",
              fontSize: "20px",
              zIndex: 10001,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ?
          </button>
          <ChatbotLottieAnimation
            isHovered={isRobotHovered}
            onClick={(e) => {
              console.log("CLIC DIRECT SUR ANIMATION");
              setIsOpen(true); // Forcer directement l'état ouvert
              e.stopPropagation();
            }}
            onMouseEnter={() => {
              console.log("Souris sur l'animation");
              setIsRobotHovered(true);
            }}
            onMouseLeave={() => {
              console.log("Souris quitte l'animation");
              setIsRobotHovered(false);
            }}
          />
        </div>
      )}

      {isOpen && (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "350px",
            maxWidth: "100%",
            height: "500px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease-in-out",
          }}
        >
          {/* En-tête du chatbot */}
          <Box
            sx={{
              p: 2,
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Assistant SmartPlanning</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                size="small"
                color="inherit"
                onClick={startNewConversation}
                aria-label="Nouvelle conversation"
                sx={{ mr: 1 }}
              >
                <RefreshIcon />
              </IconButton>
              <IconButton
                size="small"
                color="inherit"
                onClick={toggleChatbot}
                aria-label="Fermer le chatbot"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Zone des messages */}
          <Box
            sx={{
              flexGrow: 1,
              p: 2,
              overflowY: "auto",
              bgcolor: "#f5f5f5",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent: msg.isBot ? "flex-start" : "flex-end",
                  mb: 2,
                  animation: "messageEntrance 0.3s ease-out forwards",
                }}
              >
                <Box
                  sx={{
                    maxWidth: "80%",
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: msg.isBot ? "white" : "primary.light",
                    color: msg.isBot ? "text.primary" : "white",
                    boxShadow: 1,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                    },
                  }}
                >
                  <Typography variant="body1">{msg.text}</Typography>

                  {/* Affichage des suggestions */}
                  {msg.isBot &&
                    msg.suggestions &&
                    msg.suggestions.length > 0 && (
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                        }}
                      >
                        {msg.suggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion.text}
                            onClick={() => handleSuggestionClick(suggestion)}
                            size="small"
                            sx={{
                              my: 0.5,
                              cursor: "pointer",
                              bgcolor: "primary.main",
                              color: "white",
                              "&:hover": {
                                bgcolor: "primary.dark",
                              },
                            }}
                          />
                        ))}
                      </Box>
                    )}
                </Box>
              </Box>
            ))}

            {/* Indicateur de saisie */}
            {isTyping && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    maxWidth: "80%",
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "white",
                    boxShadow: 1,
                  }}
                >
                  <CircularProgress size={20} thickness={5} />
                </Box>
              </Box>
            )}

            {/* Référence pour le défilement */}
            <div ref={messagesEndRef} />
          </Box>
        </Paper>
      )}
    </div>
  );
};

// Exposer une API externe pour ouvrir le chatbot
export const triggerChatbotOpen = () => {
  console.log("Déclenchement de l'ouverture externe du chatbot");
  document.dispatchEvent(new Event(OPEN_CHATBOT_EVENT));
};

Chatbot.propTypes = {
  onGenerate: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

export default Chatbot;
