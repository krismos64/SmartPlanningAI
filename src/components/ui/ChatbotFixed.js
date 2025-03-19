import { useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ChatbotService from "../../services/ChatbotService";
import "../../styles/Chatbot.css";
import ScheduleValidationModal from "../schedule/ScheduleValidationModal";

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

// Composant principal du chatbot
const Chatbot = () => {
  const { user } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const nlpIntegration = useRef(null);

  // États du composant
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [personalizedMode, setPersonalizedMode] = useState(true);
  const [agentMode, setAgentMode] = useState(false);
  const [actionPending, setActionPending] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentTitle, setConsentTitle] = useState("");
  const [consentDescription, setConsentDescription] = useState("");
  const [consentCallback, setConsentCallback] = useState(null);
  const [scheduleCreationMode, setScheduleCreationMode] = useState(false);
  const [schedulingStep, setSchedulingStep] = useState(0);
  const [schedulingData, setSchedulingData] = useState({});
  const [dialogTree, setDialogTree] = useState(null);
  const [dialogStep, setDialogStep] = useState(null);
  const [collectedData, setCollectedData] = useState({});
  const [scheduleValidationOpen, setScheduleValidationOpen] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);

  // Définition de tous les hooks useCallback au niveau supérieur
  const handleGenerateSchedule = useCallback(async (data) => {
    try {
      setIsTyping(true);

      // Ajouter un message de confirmation
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          text: "Je génère un planning basé sur vos critères...",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);

      // Appel au service pour générer le planning
      const response = await ChatbotService.generateSchedule(
        data.startDate,
        data.endDate,
        data.employees
      );

      if (response.success) {
        // Stocker le planning généré
        setGeneratedSchedule(response.schedule);

        // Ajouter un message avec le résultat
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: "J'ai généré un planning. Voulez-vous le consulter ?",
            sender: "bot",
            timestamp: new Date(),
            actions: [
              {
                label: "Voir le planning",
                id: "view_schedule",
                icon: "visibility",
              },
            ],
          },
        ]);

        // Ouvrir la modal de validation
        setScheduleValidationOpen(true);
      } else {
        // Gérer l'erreur
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: `Erreur lors de la génération du planning : ${response.message}`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Erreur lors de la génération du planning:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          text: "Une erreur est survenue lors de la génération du planning.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
      setDialogTree(null);
      setDialogStep(null);
      setCollectedData({});
    }
  }, []);

  const handleApplySchedule = useCallback((schedule) => {
    // Logique pour appliquer le planning
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        text: "Le planning a été appliqué avec succès !",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);

    setScheduleValidationOpen(false);
  }, []);

  const handleRegenerateSchedule = useCallback(() => {
    handleGenerateSchedule(collectedData);
  }, [collectedData, handleGenerateSchedule]);

  const startScheduleGenerationDialog = useCallback(() => {
    // Initialiser le dialogue
    setDialogTree(SCHEDULE_GENERATION_TREE);
    setDialogStep(SCHEDULE_GENERATION_TREE.steps[0]);
    setCollectedData({});

    // Ajouter un message pour démarrer le dialogue
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        text:
          "Je vais vous aider à générer un planning. " +
          SCHEDULE_GENERATION_TREE.steps[0].message,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, []);

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

        // Ajouter le message de l'étape suivante
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: nextStep.message,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);

        return true;
      }

      return false;
    },
    [dialogTree, dialogStep, collectedData, handleGenerateSchedule]
  );

  // Fonction pour traiter les intentions utilisateur (à définir avant d'être utilisée comme dépendance)
  const processIntent = useCallback(
    async (intent, params) => {
      // Logique de traitement des intentions
      switch (intent) {
        case "create_schedule":
          startScheduleGenerationDialog();
          return true;
        // Autres cas...
        default:
          return false;
      }
    },
    [startScheduleGenerationDialog]
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
        return null;
      },
      onStartScheduleGeneration: startScheduleGenerationDialog,
    };
  }, [processIntent, startScheduleGenerationDialog]);

  // Autres fonctions et effets...

  // Fonction de soumission du formulaire
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!inputValue.trim()) return;

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
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: "Je ne comprends pas votre demande. Pouvez-vous reformuler ou essayer une autre question ?",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error("Erreur lors du traitement du message:", error);
      setIsTyping(false);
    }
  };

  // JSX pour le rendu du composant
  return (
    <>
      {/* Le reste du JSX... */}
      {scheduleValidationOpen && generatedSchedule && (
        <ScheduleValidationModal
          open={scheduleValidationOpen}
          onClose={() => setScheduleValidationOpen(false)}
          schedule={generatedSchedule}
          onApplySchedule={handleApplySchedule}
          onRegenerateSchedule={handleRegenerateSchedule}
        />
      )}
    </>
  );
};

export default Chatbot;
