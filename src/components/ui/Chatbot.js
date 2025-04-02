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
import robotAnimation from "../../assets/animations/robot.json";
import ChatbotRulesIntegration from "./ChatbotRulesIntegration";
import EnhancedLottie from "./EnhancedLottie";

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

/**
 * Composant d'animation optimisé pour éviter les problèmes de cycle de vie
 */
const ChatbotLottieAnimation = ({
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const options = {
    loop: true,
    autoplay: true,
    animationData: robotAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div
      className="chatbot-toggle-lottie"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label="Ouvrir l'assistant"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
        cursor: "pointer",
        transition: "all 0.3s ease",
        width: isHovered ? "100px" : "80px",
        height: isHovered ? "100px" : "80px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <EnhancedLottie
        options={options}
        height="100%"
        width="100%"
        isStopped={false}
        isPaused={false}
        animationData={robotAnimation}
      />
    </div>
  );
};

/**
 * Composant de chatbot intégré à l'application
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element} Composant Chatbot
 */
const Chatbot = ({ onGenerate, onClose }) => {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isRobotHovered, setIsRobotHovered] = useState(false);
  const messagesEndRef = useRef(null);
  const chatbotIntegration = useRef(null);

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
   * Traite le résultat d'une action
   * @param {Object} result - Résultat de l'action
   */
  const handleActionResult = useCallback(
    (result) => {
      if (result && result.response) {
        console.log("Traitement du résultat d'action :", result);

        // Ne pas ajouter le message si _handled est true
        if (result._handled) {
          console.log(
            "Résultat déjà traité, pas d'ajout de message supplémentaire"
          );
          return;
        }

        addMessage({
          text: result.response,
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
    setIsOpen(!isOpen);
  }, [isOpen]);

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
              { text: "Employés", action: "topic_employes" },
              { text: "Aide", action: "get_help" },
              { text: "Données réelles (API)", action: "check_data" },
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
    return null;
  }

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <ChatbotLottieAnimation
          isHovered={isRobotHovered}
          onClick={toggleChatbot}
          onMouseEnter={() => setIsRobotHovered(true)}
          onMouseLeave={() => setIsRobotHovered(false)}
        />
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

Chatbot.propTypes = {
  onGenerate: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

export default Chatbot;
