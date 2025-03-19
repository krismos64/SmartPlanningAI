import {
  ArrowDropDown,
  Close,
  HelpOutline,
  Lock,
  Person,
  Psychology,
  QuestionAnswer as QuestionAnswerIcon,
  Schedule as ScheduleIcon,
  Send,
  SmartToy,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import robotAnimation from "../../assets/animations/robot.json";
import "../../styles/Chatbot.css";
import ScheduleValidationModal from "../schedule/ScheduleValidationModal";
import EnhancedLottie from "./EnhancedLottie";

// Définir les arbres de dialogue au niveau du module pour éviter les recréations
const SCHEDULE_GENERATION_TREE = {
  steps: [
    {
      id: "askStartDate",
      message: "Quelle est la date de début pour votre planning ?",
      input: "date",
      next: "askEndDate",
    },
    {
      id: "askEndDate",
      message: "Quelle est la date de fin pour votre planning ?",
      input: "date",
      next: "askEmployees",
    },
    {
      id: "askEmployees",
      message:
        "Pour quels employés souhaitez-vous générer le planning ? (Saisissez 'tous' pour tous les employés)",
      input: "text",
      next: "generateSchedule",
    },
    {
      id: "generateSchedule",
      message: "Merci, je vais générer un planning basé sur ces informations.",
      action: "generateSchedule",
    },
  ],
};

// Liste des suggestions rapides
const QUICK_SUGGESTIONS = [
  {
    text: "Créer un planning",
    action: "create_schedule",
    icon: <ScheduleIcon fontSize="small" />,
  },
  {
    text: "Comment ça marche ?",
    action: "help",
    icon: <QuestionAnswerIcon fontSize="small" />,
  },
];

// Emojis pour les messages du bot
const BOT_EMOJIS = ["😊", "🤔", "👍", "✨", "🚀", "💡", "📝", "⏰", "🔍", "👋"];

// Modes du chatbot
const CHATBOT_MODES = {
  AGENT: "agent",
  PRIVATE: "privé",
  PERSONALIZED: "personnalisé",
};

// Descriptions des modes
const MODE_DESCRIPTIONS = {
  [CHATBOT_MODES.AGENT]:
    "L'IA complète peut générer des plannings et offrir des conseils",
  [CHATBOT_MODES.PRIVATE]: "Traitement local pour une confidentialité maximale",
  [CHATBOT_MODES.PERSONALIZED]:
    "Expérience adaptée à vos préférences et habitudes",
};

// Composant d'animation optimisé pour éviter les problèmes de cycle de vie
const ChatbotLottieAnimation = React.memo(
  ({ isHovered, onClick, onMouseEnter, onMouseLeave }) => {
    return (
      <div
        className="chatbot-toggle-lottie"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-label="Ouvrir l'assistant"
      >
        <EnhancedLottie
          animationData={robotAnimation}
          width={isHovered ? 100 : 80}
          height={isHovered ? 100 : 80}
          loop={true}
          autoplay={true}
        />
      </div>
    );
  },
  // Optimisation: ne pas re-rendre lors des survols rapides pour éviter les problèmes de cycle de vie de Lottie
  (prevProps, nextProps) => {
    // Ne re-rendre que si l'état de survol change significativement (pas sur des changements rapides)
    return prevProps.isHovered === nextProps.isHovered;
  }
);

// Styles pour le menu de mode
const modeMenuStyles = {
  menu: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    position: "absolute",
    right: "40px",
    top: "60px",
    width: "200px",
    zIndex: 1000,
  },
  menuItem: {
    padding: "10px 15px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    color: "#333", // Couleur plus foncée pour un meilleur contraste
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  },
  modeIcon: {
    marginRight: "10px",
    color: "#5a67d8",
  },
  modeTitle: {
    fontWeight: "bold",
    fontSize: "14px",
    color: "#333", // Couleur plus foncée pour un meilleur contraste
  },
  modeDescription: {
    fontSize: "12px",
    color: "#666", // Couleur moyenne pour un meilleur contraste
    marginTop: "2px",
  },
};

// Composant principal du chatbot
const Chatbot = () => {
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const nlpIntegration = useRef(null);
  const navigate = useNavigate();

  // États du composant
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dialogTree, setDialogTree] = useState(null);
  const [dialogStep, setDialogStep] = useState(null);
  const [collectedData, setCollectedData] = useState({});
  const [scheduleValidationOpen, setScheduleValidationOpen] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // États pour les modes
  const [currentMode, setCurrentMode] = useState(CHATBOT_MODES.AGENT);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [modeChanging, setModeChanging] = useState(false);
  const [showModeBanner, setShowModeBanner] = useState(true);

  // État pour suivre si l'animation est en survol
  const [isRobotHovered, setIsRobotHovered] = useState(false);

  // Fonction pour formater l'heure
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 0. Fonction pour générer un planning
  const handleGenerateSchedule = useCallback(
    async (data) => {
      // Enregistrer la requête
      setCollectedData(data);

      // Simuler la génération du planning
      let scheduleData = null;
      let success = true;
      let errorMessage = "";

      try {
        // Afficher une indication de chargement
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: "Génération de votre planning en cours...",
            sender: "bot",
            timestamp: new Date(),
            emoji: "⏳",
          },
        ]);

        // Simuler une attente pour l'API (différente selon le mode)
        const delay = currentMode === CHATBOT_MODES.PRIVATE ? 1000 : 2000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        // En mode privé, on traite les données localement
        if (currentMode === CHATBOT_MODES.PRIVATE) {
          console.log("Traitement local des données en mode privé");
          // Simuler la génération d'un planning local
          scheduleData = {
            id: "local-" + Date.now(),
            startDate: data.startDate,
            endDate: data.endDate,
            employees: data.employees,
            shifts: [],
          };
        } else {
          // Simulation d'un appel API pour les autres modes
          scheduleData = {
            id: "schedule-" + Date.now(),
            startDate: data.startDate,
            endDate: data.endDate,
            employees: data.employees,
            shifts: [],
          };
        }

        // Enregistrer le planning généré
        setGeneratedSchedule(scheduleData);

        // Ouvrir la fenêtre de validation
        setScheduleValidationOpen(true);

        // Message de confirmation adapté au mode
        let confirmMessage = "J'ai généré un planning basé sur vos critères.";

        if (currentMode === CHATBOT_MODES.AGENT) {
          confirmMessage =
            "J'ai optimisé un planning intelligent basé sur vos critères et l'historique des plannings précédents.";
        } else if (currentMode === CHATBOT_MODES.PRIVATE) {
          confirmMessage =
            "J'ai généré un planning en local, sans envoyer vos données à nos serveurs. Vous pouvez le consulter en toute confidentialité.";
        }

        // Ajouter le message de succès
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: confirmMessage,
            sender: "bot",
            timestamp: new Date(),
            emoji: "✅",
            actions: [
              {
                text: "Appliquer ce planning",
                action: "apply_schedule",
                icon: <ScheduleIcon fontSize="small" />,
              },
              {
                text: "Régénérer",
                action: "regenerate_schedule",
                icon: <SmartToy fontSize="small" />,
              },
            ],
          },
        ]);
      } catch (error) {
        console.error("Erreur lors de la génération du planning:", error);
        success = false;
        errorMessage =
          "Une erreur est survenue lors de la génération du planning. Veuillez réessayer.";

        // Message d'erreur adapté au mode
        if (currentMode === CHATBOT_MODES.PRIVATE) {
          errorMessage =
            "Une erreur est survenue lors du traitement local. Vos données n'ont pas quitté votre appareil.";
        }

        // Ajouter le message d'erreur
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: errorMessage,
            sender: "bot",
            timestamp: new Date(),
            emoji: "❌",
          },
        ]);
      }

      return { success, scheduleData, errorMessage };
    },
    [currentMode]
  );

  // Fonction pour appliquer le planning généré
  const handleApplySchedule = useCallback(() => {
    // Fermer la fenêtre de validation
    setScheduleValidationOpen(false);

    // Message de confirmation
    let confirmMessage = "Le planning a été appliqué avec succès!";

    // Message adapté au mode
    if (currentMode === CHATBOT_MODES.AGENT) {
      confirmMessage =
        "Votre planning optimisé a été appliqué avec succès! J'ai enregistré vos préférences pour améliorer les futurs plannings.";
    } else if (currentMode === CHATBOT_MODES.PRIVATE) {
      confirmMessage =
        "Votre planning a été appliqué localement avec succès! Aucune donnée n'a été sauvegardée en ligne.";
    }

    // Ajouter le message de confirmation
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        text: confirmMessage,
        sender: "bot",
        timestamp: new Date(),
        emoji: "🎉",
      },
    ]);

    // Réinitialiser le dialogue
    setDialogTree(null);
    setDialogStep(null);
    setCollectedData({});
  }, [currentMode]);

  // Fonction pour régénérer le planning
  const handleRegenerateSchedule = useCallback(() => {
    // Fermer la fenêtre de validation si elle est ouverte
    setScheduleValidationOpen(false);

    // Message pour informer l'utilisateur
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        text: "Je vais régénérer un planning avec des critères différents.",
        sender: "bot",
        timestamp: new Date(),
        emoji: "🔄",
      },
    ]);

    // Régénérer le planning avec les données déjà collectées
    handleGenerateSchedule(collectedData);
  }, [collectedData, handleGenerateSchedule]);

  // Fonction pour obtenir un emoji aléatoire
  const getRandomEmoji = () => {
    return BOT_EMOJIS[Math.floor(Math.random() * BOT_EMOJIS.length)];
  };

  // 1. Simuler la frappe du bot
  const simulateTyping = useCallback(
    (message, callback) => {
      setIsTyping(true);

      // Délai de frappe proportionnel à la longueur du message
      // En mode agent, la frappe est plus rapide
      const baseDelay = currentMode === CHATBOT_MODES.AGENT ? 300 : 500;
      const typingDelay = Math.min(1500, baseDelay + message.length * 10);

      const timeout = setTimeout(() => {
        setIsTyping(false);
        if (callback) callback();
      }, typingDelay);

      setTypingTimeout(timeout);

      return timeout;
    },
    [currentMode]
  );

  // 2. Fonction pour changer de mode
  const changeMode = useCallback(
    (newMode) => {
      if (newMode === currentMode) return;

      // Effet d'animation lors du changement
      setModeChanging(true);
      setTimeout(() => setModeChanging(false), 600);

      // Mettre à jour le mode
      setCurrentMode(newMode);

      // Afficher la bannière du mode
      setShowModeBanner(true);
      setTimeout(() => setShowModeBanner(false), 5000);

      // Ajouter un message système pour informer du changement
      const emoji =
        newMode === CHATBOT_MODES.AGENT
          ? "🤖"
          : newMode === CHATBOT_MODES.PRIVATE
          ? "🔒"
          : "✨";

      const modeMessage =
        newMode === CHATBOT_MODES.AGENT
          ? "Mode Agent IA activé. Posez-moi des questions pour générer votre planning !"
          : newMode === CHATBOT_MODES.PRIVATE
          ? "Mode Privé activé. Vos données restent sur votre appareil."
          : "Mode Personnalisé activé. Expérience adaptée à vos préférences.";

      setMessages((prev) => [
        ...prev,
        {
          text: modeMessage,
          sender: "bot",
          emoji: emoji,
          timestamp: new Date(),
          actions: [
            {
              text: "En savoir plus",
              action: "mode_info",
              icon: <HelpOutline fontSize="small" />,
            },
          ],
        },
      ]);
    },
    [currentMode]
  );

  // 3. Démarrer le dialogue de génération
  const startScheduleGenerationDialog = useCallback(() => {
    // Initialiser le dialogue
    setDialogTree(SCHEDULE_GENERATION_TREE);
    setDialogStep(SCHEDULE_GENERATION_TREE.steps[0]);
    setCollectedData({});

    // Message spécifique au mode
    let introText = "Je vais vous aider à générer un planning. ";

    if (currentMode === CHATBOT_MODES.AGENT) {
      introText =
        "En tant qu'agent IA avancé, je vais optimiser votre planning en utilisant des algorithmes intelligents. ";
    } else if (currentMode === CHATBOT_MODES.PRIVATE) {
      introText =
        "En mode privé, vos données resteront confidentielles et seront traitées localement. ";
    }

    // Ajouter un message pour démarrer le dialogue
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        text: introText + SCHEDULE_GENERATION_TREE.steps[0].message,
        sender: "bot",
        timestamp: new Date(),
        emoji: "📅",
      },
    ]);
  }, [currentMode]);

  // 5. Fonction pour traiter les intentions utilisateur
  const processIntent = useCallback(
    async (intent, params) => {
      // Logique de traitement des intentions
      switch (intent) {
        case "create_schedule":
          startScheduleGenerationDialog();
          return true;
        case "help":
          // Message d'aide adapté au mode
          let helpMessage =
            "Je suis votre assistant SmartPlanning. Je peux vous aider à générer des plannings, consulter vos horaires ou répondre à vos questions.";

          if (currentMode === CHATBOT_MODES.AGENT) {
            helpMessage =
              "Je suis votre agent IA SmartPlanning. Je peux optimiser vos plannings, analyser votre historique et suggérer des améliorations à votre organisation.";
          } else if (currentMode === CHATBOT_MODES.PRIVATE) {
            helpMessage =
              "Je suis votre assistant SmartPlanning en mode privé. Toutes vos données restent confidentielles et sont traitées localement sans être enregistrées sur nos serveurs.";
          }

          simulateTyping(helpMessage, () => {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: Date.now(),
                text: helpMessage,
                sender: "bot",
                timestamp: new Date(),
                emoji: "💡",
              },
            ]);
            // Afficher les suggestions après avoir répondu
            setShowSuggestions(true);
          });
          return true;
        case "change_mode":
          if (
            params &&
            params.mode &&
            Object.values(CHATBOT_MODES).includes(params.mode)
          ) {
            changeMode(params.mode);
            return true;
          }
          return false;
        default:
          return false;
      }
    },
    [currentMode, startScheduleGenerationDialog, simulateTyping, changeMode]
  );

  // 6. Fonction pour gérer les étapes du dialogue
  const handleDialogStep = useCallback(
    async (userInput) => {
      if (!dialogTree || !dialogStep) return false;

      // Ajouter la réponse de l'utilisateur aux données collectées
      const newData = { ...collectedData };

      switch (dialogStep.input) {
        case "date":
          // Traiter la date (on suppose que l'entrée est au format valide)
          newData[dialogStep.id] = userInput;
          break;
        case "text":
          // Traiter le texte
          newData[dialogStep.id] = userInput;
          break;
        default:
          newData[dialogStep.id] = userInput;
      }

      setCollectedData(newData);

      // Trouver l'étape suivante
      const nextStepId = dialogStep.next;
      if (!nextStepId) {
        // C'est la dernière étape, exécuter l'action finale
        if (dialogStep.action === "generateSchedule") {
          // Formater les données pour la génération de planning
          const formattedData = {
            startDate: newData.askStartDate,
            endDate: newData.askEndDate,
            employees: newData.askEmployees,
          };

          // Appeler la fonction de génération
          await handleGenerateSchedule(formattedData);
        }

        return true;
      }

      // Passer à l'étape suivante
      const nextStep = dialogTree.steps.find((step) => step.id === nextStepId);
      if (nextStep) {
        setDialogStep(nextStep);

        // Simuler la frappe avant d'ajouter le message
        simulateTyping(nextStep.message, () => {
          // Ajouter le message de l'étape suivante
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Date.now(),
              text: nextStep.message,
              sender: "bot",
              timestamp: new Date(),
              emoji: getRandomEmoji(),
            },
          ]);
        });

        return true;
      }

      return false;
    },
    [
      dialogTree,
      dialogStep,
      collectedData,
      handleGenerateSchedule,
      simulateTyping,
    ]
  );

  // Initialiser l'intégration NLP
  useEffect(() => {
    nlpIntegration.current = {
      processMessage: async (message) => {
        // Logique simplifiée du NLP
        if (message.toLowerCase().includes("planning")) {
          return {
            intent: "create_schedule",
            confidence: 0.9,
            parameters: {},
          };
        }
        if (
          message.toLowerCase().includes("aide") ||
          message.toLowerCase().includes("help")
        ) {
          return {
            intent: "help",
            confidence: 0.9,
            parameters: {},
          };
        }
        // Détecter les changements de mode
        if (
          message.toLowerCase().includes("mode privé") ||
          message.toLowerCase().includes("confidentiel")
        ) {
          return {
            intent: "change_mode",
            confidence: 0.9,
            parameters: { mode: CHATBOT_MODES.PRIVATE },
          };
        }
        if (
          message.toLowerCase().includes("mode agent") ||
          message.toLowerCase().includes("ia avancée")
        ) {
          return {
            intent: "change_mode",
            confidence: 0.9,
            parameters: { mode: CHATBOT_MODES.AGENT },
          };
        }
        if (
          message.toLowerCase().includes("mode personnalisé") ||
          message.toLowerCase().includes("personnalisation")
        ) {
          return {
            intent: "change_mode",
            confidence: 0.9,
            parameters: { mode: CHATBOT_MODES.PERSONALIZED },
          };
        }
        return null;
      },
      onStartScheduleGeneration: startScheduleGenerationDialog,
    };
  }, [startScheduleGenerationDialog, processIntent]);

  // Nettoyer les timeouts lors du démontage
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  // Effet pour faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Ajouter un message d'accueil lors de la première ouverture
  useEffect(() => {
    if (open && messages.length === 0) {
      // Message d'accueil adapté au mode
      let welcomeMessage =
        "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?";
      let welcomeEmoji = "👋";

      if (currentMode === CHATBOT_MODES.AGENT) {
        welcomeMessage =
          "Bonjour ! Je suis votre agent IA SmartPlanning. Je peux optimiser vos plannings et vous aider à prendre de meilleures décisions.";
        welcomeEmoji = "🤖";
      } else if (currentMode === CHATBOT_MODES.PRIVATE) {
        welcomeMessage =
          "Bonjour ! Je suis votre assistant en mode privé. Vos données resteront confidentielles et seront traitées localement.";
        welcomeEmoji = "🔒";
      }

      // Simuler un délai avant l'affichage du message de bienvenue
      const timeoutId = setTimeout(() => {
        setMessages([
          {
            id: Date.now(),
            text: welcomeMessage,
            sender: "bot",
            timestamp: new Date(),
            emoji: welcomeEmoji,
          },
        ]);
        setShowSuggestions(true);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [open, messages, currentMode]);

  // Auto-focus sur le champ de saisie lors de l'ouverture
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [open]);

  // Fonction de soumission du formulaire
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!inputValue.trim()) return;

    // Masquer les suggestions quand l'utilisateur envoie un message
    setShowSuggestions(false);

    const userMessage = inputValue;
    setInputValue("");

    // Ajouter le message de l'utilisateur
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        text: userMessage,
        sender: "user",
        timestamp: new Date(),
      },
    ]);

    // Indiquer que le bot tape
    setIsTyping(true);

    // Si nous sommes dans un dialogue, traiter l'étape
    if (dialogTree && dialogStep) {
      const handled = await handleDialogStep(userMessage);
      if (handled) {
        setIsTyping(false);
        return;
      }
    }

    // Analyse NLP du message
    try {
      if (nlpIntegration.current) {
        const nlpResult = await nlpIntegration.current.processMessage(
          userMessage
        );

        if (nlpResult && nlpResult.intent) {
          const handled = await processIntent(
            nlpResult.intent,
            nlpResult.parameters
          );
          if (handled) {
            setIsTyping(false);
            return;
          }
        }
      }

      // Réponse par défaut si aucune intention n'est détectée
      // Adapter la réponse au mode
      let defaultResponse =
        "Je ne comprends pas votre demande. Pouvez-vous reformuler ou essayer une autre question ?";

      if (currentMode === CHATBOT_MODES.AGENT) {
        defaultResponse =
          "Je ne parviens pas à analyser votre demande. Pourriez-vous la reformuler de manière plus précise ?";
      } else if (currentMode === CHATBOT_MODES.PRIVATE) {
        defaultResponse =
          "Je n'ai pas compris votre requête. En mode privé, je dispose de fonctionnalités limitées pour garantir la confidentialité de vos données.";
      }

      simulateTyping(defaultResponse, () => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: defaultResponse,
            sender: "bot",
            timestamp: new Date(),
            emoji: "🤔",
          },
        ]);
        // Afficher les suggestions après un message non compris
        setShowSuggestions(true);
      });
    } catch (error) {
      console.error("Erreur lors du traitement du message:", error);
      setIsTyping(false);
      // Afficher les suggestions en cas d'erreur
      setShowSuggestions(true);
    }
  };

  // Traiter les clics sur les suggestions
  const handleSuggestionClick = useCallback(
    (suggestion) => {
      console.log("Suggestion cliquée:", suggestion);

      if (suggestion === "view_schedule") {
        navigate("/schedule");
      } else if (suggestion === "create_schedule") {
        // Appeler directement startScheduleGenerationDialog pour créer un planning
        startScheduleGenerationDialog();
      } else if (suggestion === "help") {
        // Traiter directement la demande d'aide
        let helpMessage =
          "Je suis votre assistant SmartPlanning. Je peux vous aider à générer des plannings, consulter vos horaires ou répondre à vos questions.";

        if (currentMode === CHATBOT_MODES.AGENT) {
          helpMessage =
            "Je suis votre agent IA SmartPlanning. Je peux optimiser vos plannings, analyser votre historique et suggérer des améliorations à votre organisation.";
        } else if (currentMode === CHATBOT_MODES.PRIVATE) {
          helpMessage =
            "Je suis votre assistant SmartPlanning en mode privé. Toutes vos données restent confidentielles et sont traitées localement sans être enregistrées sur nos serveurs.";
        }

        simulateTyping(helpMessage, () => {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Date.now(),
              text: helpMessage,
              sender: "bot",
              timestamp: new Date(),
              emoji: "💡",
            },
          ]);
        });
      } else {
        // Utiliser processIntent pour d'autres intentions
        processIntent(suggestion);
      }

      // Masquer les suggestions après avoir cliqué sur l'une d'elles
      setShowSuggestions(false);
    },
    [
      processIntent,
      navigate,
      currentMode,
      simulateTyping,
      startScheduleGenerationDialog,
    ]
  );

  // Gérer l'ouverture/fermeture du chatbot
  const toggleChatbot = () => {
    setOpen(!open);
    if (!open && messages.length === 0) {
      // Message de bienvenue à l'ouverture
      setTimeout(() => {
        const welcomeEmoji =
          BOT_EMOJIS[Math.floor(Math.random() * BOT_EMOJIS.length)];
        setMessages([
          {
            text: "Bonjour ! Je suis votre assistant SmartPlanning. Comment puis-je vous aider aujourd'hui ?",
            sender: "bot",
            emoji: welcomeEmoji,
            timestamp: new Date(),
            actions: QUICK_SUGGESTIONS.map((sugg) => ({
              text: sugg.text,
              action: sugg.action,
              icon: sugg.icon,
            })),
          },
        ]);
        setShowSuggestions(true);
      }, 500);
    }
  };

  // JSX pour le rendu du composant
  return (
    <div className="chatbot-container">
      {!open && (
        <ChatbotLottieAnimation
          isHovered={isRobotHovered}
          onClick={toggleChatbot}
          onMouseEnter={() => setIsRobotHovered(true)}
          onMouseLeave={() => setIsRobotHovered(false)}
        />
      )}

      {open && (
        <div
          className={`chatbot-window ${modeChanging ? "mode-changing" : ""}`}
        >
          <div className="chatbot-header">
            <div className="header-title">
              <SmartToy />
              <h3>Assistant</h3>
            </div>
            <div className="chatbot-controls">
              <div className={`mode-selector ${currentMode.toLowerCase()}`}>
                <span className="mode-name">{currentMode}</span>
                <IconButton
                  style={{
                    marginLeft: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    padding: "6px",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                    },
                  }}
                  onClick={() => setShowModeMenu(!showModeMenu)}
                >
                  <ArrowDropDown style={{ color: "white" }} />
                </IconButton>
              </div>
              <button className="close-button" onClick={toggleChatbot}>
                <Close />
              </button>
            </div>

            {showModeMenu && (
              <div style={modeMenuStyles.menu}>
                {Object.values(CHATBOT_MODES).map((mode) => (
                  <div
                    key={mode}
                    style={modeMenuStyles.menuItem}
                    onClick={() => {
                      changeMode(mode);
                      setShowModeMenu(false);
                    }}
                  >
                    <div style={modeMenuStyles.modeIcon}>
                      {mode === CHATBOT_MODES.AGENT && (
                        <SmartToy fontSize="small" />
                      )}
                      {mode === CHATBOT_MODES.PRIVATE && (
                        <Lock fontSize="small" />
                      )}
                      {mode === CHATBOT_MODES.PERSONALIZED && (
                        <Psychology fontSize="small" />
                      )}
                    </div>
                    <div>
                      <div style={modeMenuStyles.modeTitle}>
                        {mode === CHATBOT_MODES.AGENT && "Agent IA"}
                        {mode === CHATBOT_MODES.PRIVATE && "Privé"}
                        {mode === CHATBOT_MODES.PERSONALIZED && "Personnalisé"}
                      </div>
                      <div style={modeMenuStyles.modeDescription}>
                        {MODE_DESCRIPTIONS[mode]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="chatbot-body">
            {showModeBanner && (
              <div className={`mode-banner ${currentMode.toLowerCase()}`}>
                {currentMode === CHATBOT_MODES.AGENT && <SmartToy />}
                {currentMode === CHATBOT_MODES.PRIVATE && <Lock />}
                {currentMode === CHATBOT_MODES.PERSONALIZED && <Psychology />}
                <div>
                  <strong>Mode {currentMode}</strong> :{" "}
                  {MODE_DESCRIPTIONS[currentMode]}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.sender === "user" ? "user" : "bot"
                } ${message.sender === "bot" ? currentMode.toLowerCase() : ""}`}
              >
                <div className="message-info">
                  {message.sender === "user" ? (
                    <Person />
                  ) : currentMode === CHATBOT_MODES.AGENT ? (
                    <SmartToy />
                  ) : currentMode === CHATBOT_MODES.PRIVATE ? (
                    <Lock />
                  ) : (
                    <Psychology />
                  )}
                  <span className="message-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <div className="message-content">
                  {message.emoji && (
                    <div className="message-emoji">{message.emoji}</div>
                  )}
                  <div>{message.text}</div>
                </div>
                {message.actions && message.actions.length > 0 && (
                  <div className="suggestions-container">
                    {message.actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        className={`suggestion-button ${currentMode.toLowerCase()}`}
                        onClick={() => handleSuggestionClick(action.action)}
                      >
                        {action.icon}
                        {action.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className={`typing-indicator ${currentMode.toLowerCase()}`}>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
          </div>

          <div className="chatbot-footer">
            <form onSubmit={handleSubmit} className="message-form">
              <input
                type="text"
                className={`message-input ${currentMode.toLowerCase()}`}
                placeholder="Écrivez votre message ici..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                ref={inputRef}
              />
              <button
                type="submit"
                className={`send-button ${currentMode.toLowerCase()}`}
                disabled={!inputValue.trim()}
              >
                <Send />
              </button>
            </form>

            {showSuggestions && (
              <div className="suggestions-container">
                {QUICK_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    className={`suggestion-button ${currentMode.toLowerCase()} ${
                      index === 0 ? "first" : ""
                    }`}
                    onClick={() => handleSuggestionClick(suggestion.action)}
                  >
                    {suggestion.icon}
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de validation du planning */}
      {scheduleValidationOpen && generatedSchedule && (
        <ScheduleValidationModal
          open={scheduleValidationOpen}
          onClose={() => setScheduleValidationOpen(false)}
          schedule={generatedSchedule}
          onApplySchedule={handleApplySchedule}
          onRegenerateSchedule={handleRegenerateSchedule}
          mode={currentMode}
        />
      )}
    </div>
  );
};

export default Chatbot;
