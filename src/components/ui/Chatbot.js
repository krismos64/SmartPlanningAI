import Lottie from "lottie-react";
import { useEffect, useRef, useState } from "react";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import robotAnimation from "../../assets/animations/robot.json";
import { useAuth } from "../../contexts/AuthContext";
import ChatbotService from "../../services/chatbot-api";
import { detectIntent } from "../../utils/nlp";

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const buttonPop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Animations définies mais non utilisées - commentées pour éviter les avertissements ESLint
// const fadeInUp = keyframes`
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// `;

const fadeInRight = keyframes`
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
`;

const fadeInLeft = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
`;

const typing = keyframes`
  0% { width: 0 }
  100% { width: 100% }
`;

// const blinkCaret = keyframes`
//   from, to { border-color: transparent }
//   50% { border-color: #2b5797 }
// `;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.5); }
  50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.8); }
  100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.5); }
`;

// Composants stylisés
const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const RobotButton = styled.button`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
  animation: ${pulse} 2s infinite ease-in-out;
  opacity: 0.9;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    opacity: 1;
  }
`;

const WelcomeMessage = styled.div`
  position: absolute;
  top: -60px;
  right: 0;
  background-color: white;
  padding: 10px 15px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  max-width: 200px;
  animation: ${fadeIn} 0.5s ease-out;

  &:after {
    content: "";
    position: absolute;
    bottom: -8px;
    right: 25px;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid white;
  }
`;

const ChatWindow = styled.div`
  position: absolute;
  bottom: 85px;
  right: 0;
  width: 350px;
  height: 450px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideIn} 0.3s ease-out;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);

  @media (max-width: 576px) {
    width: 90vw;
    height: 70vh;
    bottom: 85px;
    right: 0;
    animation: ${slideUp} 0.3s ease-out;
  }
`;

const ChatHeader = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModeToggleContainer = styled.div`
  display: flex;
  gap: 5px;
  margin-left: auto;
  margin-right: 10px;
`;

const ModeButton = styled.button`
  background: ${({ active, theme, mode }) =>
    active
      ? mode === "personalized"
        ? "rgba(99, 179, 237, 0.5)"
        : mode === "agent"
        ? "rgba(237, 137, 99, 0.5)"
        : "rgba(255, 255, 255, 0.3)"
      : "rgba(255, 255, 255, 0.15)"};
  border: none;
  color: white;
  padding: 5px 8px;
  font-size: 0.8rem;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  box-shadow: ${({ active }) =>
    active ? "0 2px 4px rgba(0, 0, 0, 0.2)" : "none"};

  &:hover {
    background: ${({ mode }) =>
      mode === "personalized"
        ? "rgba(99, 179, 237, 0.7)"
        : mode === "agent"
        ? "rgba(237, 137, 99, 0.7)"
        : "rgba(255, 255, 255, 0.4)"};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px);
  }

  ${({ active }) =>
    active &&
    css`
      animation: ${buttonPop} 0.3s ease;
    `}
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Message = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  margin-bottom: 8px;
  white-space: pre-line;
  font-weight: 400;
  position: relative;
  line-height: 1.4;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  ${({ isUser, theme, personalized, agent }) =>
    isUser
      ? css`
          align-self: flex-end;
          background-color: ${theme.colors.primary};
          color: white;
          border-bottom-right-radius: 5px;
          animation: ${fadeInRight} 0.3s ease-out;
        `
      : css`
          align-self: flex-start;
          background: ${personalized
            ? "linear-gradient(135deg, #3a8bc7 0%, #2b77a7 100%)"
            : agent
            ? "linear-gradient(135deg, #e67e22 0%, #d35400 100%)"
            : "linear-gradient(135deg, #3a6fc7 0%, #2b5797 100%)"};
          color: white;
          border-bottom-left-radius: 5px;
          animation: ${fadeInLeft} 0.3s ease-out;

          ${personalized &&
          `
            border-left: 3px solid #90cdf4;
          `}

          ${agent &&
          `
            border-left: 3px solid #f6ad55;
          `}
        `}
`;

const ChatInputContainer = styled.form`
  display: flex;
  padding: 10px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 10px 15px;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SendButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-left: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
    transform: scale(1.05);
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.border.main};
    cursor: not-allowed;
  }
`;

// Composant non utilisé - commenté pour éviter les avertissements ESLint
// const SettingsButton = styled.button`
//   background: none;
//   border: none;
//   color: white;
//   cursor: pointer;
//   margin-right: 10px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   padding: 5px;
//   border-radius: 50%;
//   transition: background-color 0.2s;
//
//   &:hover {
//     background-color: rgba(255, 255, 255, 0.2);
//   }
// `;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 6px;
  border-radius: 10px;
  margin-left: 8px;
  transition: all 0.2s;
  background-color: ${(props) =>
    props.active ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)"};

  &:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
`;

const ApiKeyModal = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const ApiKeyForm = styled.form`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  h3 {
    color: #2b5797;
    margin-bottom: 5px;
  }

  p {
    color: #333;
    font-weight: 500;
  }
`;

// Composant non utilisé - commenté pour éviter les avertissements ESLint
// const ApiKeyInput = styled.input`
//   padding: 10px;
//   border: 1px solid ${({ theme }) => theme.colors.border.main};
//   border-radius: 5px;
//   font-size: 14px;
//   width: 100%;
// `;

const ApiKeyButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }
`;

// Composant non utilisé - commenté pour éviter les avertissements ESLint
// const EmojiWrapper = styled.span`
//   display: inline-block;
//   margin: 0 2px;
//   animation: ${pulse} 1s infinite ease-in-out;
// `;

const HelpBubble = styled.div`
  position: absolute;
  top: -60px;
  right: 0;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 10px 15px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  font-size: 16px;
  font-weight: 500;
  max-width: 200px;
  z-index: 1001;
  animation: ${fadeIn} 0.5s ease-out, ${float} 3s infinite ease-in-out,
    ${glow} 2s infinite;
  display: ${({ $show }) => ($show ? "block" : "none")};
  text-align: center;

  &:after {
    content: "";
    position: absolute;
    bottom: -10px;
    right: 30px;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #4f46e5;
  }
`;

// Ajout de nouveaux composants stylisés pour l'affichage des actions
const ActionButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 8px 12px;
  margin-top: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  animation: ${fadeIn} 0.3s ease-out;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}dd`};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }
`;

const ActionResult = styled.div`
  background-color: ${({ $success, theme }) =>
    $success ? `${theme.colors.success}22` : `${theme.colors.error}22`};
  border: 1px solid
    ${({ $success, theme }) =>
      $success ? theme.colors.success : theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 10px;
  margin-top: 8px;
  font-size: 0.9rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ActionCard = styled.div`
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 12px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ActionTitle = styled.div`
  font-weight: 500;
  font-size: 0.95rem;
`;

const ActionDetail = styled.div`
  font-size: 0.85rem;
  display: flex;
  justify-content: space-between;

  & > span:first-child {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const getActionTitle = (intent) => {
  switch (intent) {
    case "GENERATE_SCHEDULE":
      return "Génération de planning";
    case "VIEW_SCHEDULE":
      return "Consultation de planning";
    case "CHECK_VACATION_AVAILABILITY":
      return "Vérification de disponibilité pour congés";
    case "CREATE_VACATION_REQUEST":
      return "Création de demande de congés";
    case "GET_STATS":
      return "Statistiques";
    case "GET_OPTIMAL_SCHEDULE":
      return "Suggestions d'horaires optimaux";
    default:
      return "Action";
  }
};

const ToggleIcon = styled.span`
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ConsentModal = ({ onAccept, onDecline }) => {
  return (
    <ApiKeyModal>
      <ApiKeyForm onSubmit={(e) => e.preventDefault()}>
        <h3>Consentement RGPD</h3>
        <p
          style={{
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#333",
            fontWeight: "500",
            marginBottom: "10px",
          }}
        >
          Pour vous fournir des réponses personnalisées, l'assistant peut
          accéder à certaines de vos données personnelles:
        </p>
        <ul
          style={{
            fontSize: "13px",
            lineHeight: "1.4",
            color: "#4A5568",
            marginBottom: "15px",
            paddingLeft: "20px",
          }}
        >
          <li>Informations de profil (nom, prénom, email, rôle)</li>
          <li>Préférences horaires et jours de repos</li>
          <li>Historique des congés et absences</li>
          <li>Plannings et horaires de travail</li>
        </ul>
        <p
          style={{
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#333",
            fontWeight: "500",
            marginBottom: "5px",
          }}
        >
          Ces informations seront utilisées uniquement pour :
        </p>
        <ul
          style={{
            fontSize: "13px",
            lineHeight: "1.4",
            color: "#4A5568",
            marginBottom: "15px",
            paddingLeft: "20px",
          }}
        >
          <li>Personnaliser vos interactions avec l'assistant</li>
          <li>Générer des plannings adaptés à vos contraintes</li>
          <li>Vous informer sur votre planning et vos congés</li>
        </ul>
        <p
          style={{
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#333",
            fontWeight: "500",
          }}
        >
          Conformément au RGPD, nous avons besoin de votre consentement
          explicite. Vous pouvez le retirer à tout moment en désactivant le mode
          personnalisé.
        </p>
        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <ApiKeyButton
            type="button"
            onClick={onDecline}
            style={{ backgroundColor: "#6c757d" }}
          >
            Refuser
          </ApiKeyButton>
          <ApiKeyButton
            type="button"
            onClick={onAccept}
            style={{ backgroundColor: "#2b5797" }}
          >
            Accepter
          </ApiKeyButton>
        </div>
      </ApiKeyForm>
    </ApiKeyModal>
  );
};

// Ajouter un badge pour indiquer le mode actif
const ModeBadge = styled.div`
  position: absolute;
  top: -8px;
  left: 10px;
  background: ${({ mode }) =>
    mode === "personalized"
      ? "rgba(99, 179, 237, 0.9)"
      : "rgba(237, 137, 99, 0.9)"};
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 3px;
`;

// Style pour le conteneur de progression de création de planning
const SchedulingProgressContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 12px;
  margin: 10px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 3px solid #e67e22;
`;

const ProgressTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: #e67e22;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ProgressSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ProgressStep = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: ${({ completed, active }) =>
    completed ? "#2ecc71" : active ? "#e67e22" : "#718096"};
  opacity: ${({ completed, active }) => (completed || active ? 1 : 0.7)};
`;

const StepIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ completed, active }) =>
    completed ? "#2ecc71" : active ? "#e67e22" : "#cbd5e0"};
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin: 0 auto;
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 50%;
  display: inline-block;
  animation: ${pulse} 1.5s infinite ease-in-out;

  &:nth-child(1) {
    animation-delay: 0s;
  }

  &:nth-child(2) {
    animation-delay: 0.3s;
  }

  &:nth-child(3) {
    animation-delay: 0.6s;
  }
`;

const SpinnerAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-radius: 50%;
  border-top-color: transparent;
  animation: ${SpinnerAnimation} 1s linear infinite;
  margin: 0 auto;
`;

const Chatbot = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [showHelpBubble, setShowHelpBubble] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserConsent, setHasUserConsent] = useState(
    localStorage.getItem("chatbot_data_consent") === "true"
  );
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [apiKey] = useState("Mtj4YyKWVol6Km2iLeCCtAF4Y1nNlbbE");
  const [currentAction, setCurrentAction] = useState(null);
  const [actionResult, setActionResult] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [isPersonalizedMode, setIsPersonalizedMode] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [schedulingInProgress, setSchedulingInProgress] = useState(false);
  const [schedulingData, setSchedulingData] = useState({
    weekStart: null,
    constraints: [],
    employees: [],
    businessHours: null,
    breakTimes: null,
  });

  // Vérifier si le chatbot doit être affiché sur la page actuelle
  const shouldShowChatbot = () => {
    // Ne pas afficher sur la landing page, login ou register
    const restrictedPaths = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
    ];

    // Vérifier si l'utilisateur est connecté et si la page actuelle n'est pas restreinte
    return user && !restrictedPaths.includes(location.pathname);
  };

  useEffect(() => {
    if (user && !localStorage.getItem("chatbot_data_consent")) {
      setShowConsentModal(true);
    }
  }, [user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const initialTimeout = setTimeout(() => {
        setShowHelpBubble(true);
      }, 5000);

      const hideTimeout = setTimeout(() => {
        setShowHelpBubble(false);
      }, 12000);

      const interval = setInterval(() => {
        setShowHelpBubble(true);
        setTimeout(() => {
          setShowHelpBubble(false);
        }, 7000);
      }, 30000);

      return () => {
        clearTimeout(initialTimeout);
        clearTimeout(hideTimeout);
        clearInterval(interval);
      };
    } else {
      setShowHelpBubble(false);
    }
  }, [isOpen]);

  useEffect(() => {
    console.log("Auth context user:", user);
    if (user && !user.firstName && !user.first_name && !user.name) {
      console.log("Tentative de récupération des données utilisateur...");
    }
  }, [user]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowWelcome(false);

    if (!isOpen && messages.length === 0) {
      setMessages([
        {
          text: `👋 Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?`,
          isUser: false,
        },
      ]);
    }
  };

  const localResponses = {
    bonjour:
      "Bonjour ! Comment puis-je vous aider avec la gestion de votre planning ?",
    salut:
      "Salut ! Je suis là pour vous aider avec Smart Planning. Que souhaitez-vous faire ?",
    aide: "Je peux vous aider avec plusieurs fonctionnalités de Smart Planning :\n- Gestion des plannings hebdomadaires\n- Gestion des employés\n- Gestion des congés\n- Statistiques et rapports\nQue voulez-vous savoir ?",
    planning:
      "Dans Smart Planning, vous pouvez gérer les plannings hebdomadaires en allant dans la section 'Planning Hebdomadaire'. Vous pourrez y affecter des horaires à vos employés, gérer les absences et exporter les plannings en PDF.",
    employés:
      "La gestion des employés se fait dans la section 'Employés'. Vous pouvez y ajouter, modifier ou supprimer des employés, ainsi que consulter leurs informations et historiques.",
    congés:
      "Pour gérer les congés, rendez-vous dans la section 'Congés'. Vous pourrez y voir les demandes en attente, les approuver ou les refuser, et consulter le calendrier des congés.",
    statistiques:
      "Les statistiques sont disponibles dans la section 'Statistiques'. Vous y trouverez des graphiques sur les heures travaillées, les absences, et d'autres indicateurs importants.",
    merci: "Je vous en prie ! N'hésitez pas si vous avez d'autres questions.",
    "au revoir":
      "Au revoir ! N'hésitez pas à revenir si vous avez besoin d'aide.",
    configuration:
      "Vous pouvez configurer l'application dans la section 'Paramètres'. Vous y trouverez les options pour personnaliser l'application selon vos besoins.",
  };

  const getLocalResponse = (query) => {
    const normalizedQuery = query.toLowerCase().trim();

    for (const [keyword, response] of Object.entries(localResponses)) {
      if (normalizedQuery.includes(keyword)) {
        return response;
      }
    }

    if (
      normalizedQuery.includes("comment") &&
      normalizedQuery.includes("ajouter") &&
      normalizedQuery.includes("employé")
    ) {
      return "Pour ajouter un nouvel employé, allez dans la section 'Employés' et cliquez sur le bouton '+ Ajouter un employé'. Remplissez ensuite le formulaire avec les informations de l'employé.";
    }

    if (
      normalizedQuery.includes("comment") &&
      normalizedQuery.includes("export")
    ) {
      return "Pour exporter un planning, allez dans la section 'Planning Hebdomadaire', puis cliquez sur le bouton 'Options d'export'. Vous pourrez choisir d'exporter le planning global ou par département.";
    }

    if (
      normalizedQuery.includes("comment") &&
      normalizedQuery.includes("modifi") &&
      normalizedQuery.includes("planning")
    ) {
      return "Pour modifier un planning, allez dans la section 'Planning Hebdomadaire', trouvez l'employé concerné et cliquez sur le bouton 'Éditer' à droite de son nom. Vous pourrez alors modifier ses horaires et absences.";
    }

    return "Je ne suis pas sûr de comprendre votre demande. Pourriez-vous reformuler ou me demander de l'aide sur la gestion des plannings, des employés ou des congés ?";
  };

  /**
   * Récupère les informations personnalisées de l'utilisateur
   * @returns {Promise<Object|null>} - Informations personnalisées ou null si non autorisé
   */
  const getUserPersonalizedInfo = async () => {
    if (!hasUserConsent) {
      console.log(
        "L'utilisateur n'a pas donné son consentement pour accéder à ses données"
      );
      return null;
    }

    // Information de base de l'utilisateur (depuis le localStorage)
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      console.log("Aucun utilisateur connecté");
      return null;
    }

    const user = JSON.parse(userStr);

    try {
      // Tentative de récupération des données réelles depuis l'API
      const employeesResult = await ChatbotService.getEmployeesWithDetails();

      if (
        employeesResult.success &&
        employeesResult.employees &&
        employeesResult.employees.length > 0
      ) {
        const formattedEmployees = employeesResult.employees;

        // Trouver l'utilisateur actuel
        const userEmail = user.email || "";
        const currentUserData = formattedEmployees.find(
          (emp) => emp.email.toLowerCase() === userEmail.toLowerCase()
        );

        // Informations de l'utilisateur actuel
        const userData = currentUserData || {
          firstName: user.firstName || user.first_name || "",
          lastName: user.lastName || user.last_name || "",
          email: user.email || "",
          role: user.role || "",
          hireDate: "",
          department: "",
          hours: 35,
          preferredDays: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
        };

        return {
          nom: userData.lastName,
          prenom: userData.firstName,
          email: userData.email,
          role: userData.role,
          dateEmbauche: userData.hireDate,
          departement: userData.department,
          heures: userData.hours,
          joursPreferences: userData.preferredDays,
          equipe: formattedEmployees,
        };
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données des employés:",
        error
      );
    }

    // En cas d'échec, utiliser des données simulées comme solution de secours
    const sampleEmployeesData = [
      {
        id: 1,
        firstName: "Alex",
        lastName: "Dupont",
        email: "alex.dupont@example.com",
        role: "Développeur",
        hireDate: "2020-03-15",
        department: "IT",
        hours: 35,
        preferredDays: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
      },
      {
        id: 2,
        firstName: "Marie",
        lastName: "Lambert",
        email: "marie.lambert@example.com",
        role: "Designer",
        hireDate: "2021-06-10",
        department: "Design",
        hours: 28,
        preferredDays: ["Lundi", "Mardi", "Jeudi"],
      },
      {
        id: 3,
        firstName: "Thomas",
        lastName: "Mercier",
        email: "thomas.mercier@example.com",
        role: "Chef de projet",
        hireDate: "2019-01-21",
        department: "Management",
        hours: 35,
        preferredDays: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
      },
      {
        id: 4,
        firstName: "Stacy",
        lastName: "Moreau",
        email: "stacy.moreau@example.com",
        role: "Marketing",
        hireDate: "2021-02-15", // Date correcte selon la base de données
        department: "Marketing",
        hours: 35,
        preferredDays: ["Lundi", "Mardi", "Jeudi", "Vendredi"],
      },
    ];

    // Trouver les informations de l'utilisateur actuel dans nos données simulées
    const userEmail = user.email || "";
    const currentUserData = sampleEmployeesData.find(
      (emp) => emp.email.toLowerCase() === userEmail.toLowerCase()
    );

    // Si l'email ne correspond pas à nos données simulées, utiliser les informations de base de l'utilisateur
    const userData = currentUserData || {
      firstName: user.firstName || user.first_name || "",
      lastName: user.lastName || user.last_name || "",
      email: user.email || "",
      role: user.role || "",
      hireDate: "2021-01-01", // Date par défaut si inconnue
      department: "Non spécifié",
      hours: 35,
      preferredDays: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
    };

    return {
      nom: userData.lastName,
      prenom: userData.firstName,
      email: userData.email,
      role: userData.role,
      dateEmbauche: userData.hireDate,
      departement: userData.department,
      heures: userData.hours,
      joursPreferences: userData.preferredDays,
      equipe: sampleEmployeesData,
    };
  };

  const enhanceResponseWithEmojis = (response) => {
    let enhancedResponse = response
      .replace(/bonjour/i, "Bonjour 👋")
      .replace(/salut/i, "Salut 👋")
      .replace(/hello/i, "Hello 👋")
      .replace(/bonsoir/i, "Bonsoir 🌙")
      .replace(/merci/i, "Merci 🙏")
      .replace(/planning/i, "planning 📅")
      .replace(/employés/i, "employés 👥")
      .replace(/congés/i, "congés 🏖️")
      .replace(/statistiques/i, "statistiques 📊")
      .replace(/exporter/i, "exporter 📤")
      .replace(/importer/i, "importer 📥")
      .replace(/paramètres/i, "paramètres ⚙️")
      .replace(/configuration/i, "configuration 🛠️")
      .replace(/aide/i, "aide 🆘");

    if (Math.random() > 0.7) {
      const humorousEndings = [
        "\n\nN'hésitez pas à me poser d'autres questions, je suis là pour ça ! 😊",
        "\n\nJe suis à votre service pour toute autre question. 🤓",
        "\n\nAvez-vous besoin d'autre chose ? Je suis plus rapide qu'un agenda papier ! 📝",
        "\n\nJ'espère que cette réponse vous aide. Sinon, dites-le moi, je ne me vexe pas ! 😉",
        "\n\nUne autre question ? Je suis là, et je ne prends jamais de pause café ! ☕",
      ];
      enhancedResponse +=
        humorousEndings[Math.floor(Math.random() * humorousEndings.length)];
    }

    return enhancedResponse;
  };

  const processIntent = async (intent, params) => {
    setCurrentAction({ intent, params });
    setActionResult(null);
    setIsActionLoading(false);
    console.log("Intention détectée:", intent, params);

    // Ajouter un message pour confirmer la détection de l'intention
    let confirmationMessage = "";

    switch (intent) {
      case "GENERATE_SCHEDULE":
        confirmationMessage = `Je peux générer un planning pour la semaine du ${params.weekStart}. Voulez-vous procéder ?`;
        break;
      case "VIEW_SCHEDULE":
        confirmationMessage = `Je peux afficher le planning pour la semaine du ${params.weekStart}. Voulez-vous le consulter ?`;
        break;
      case "CHECK_VACATION_AVAILABILITY":
        confirmationMessage = `Je peux vérifier la disponibilité pour des congés du ${params.startDate} au ${params.endDate}. Voulez-vous procéder ?`;
        break;
      case "CREATE_VACATION_REQUEST":
        confirmationMessage = `Je peux créer une demande de congés du ${params.startDate} au ${params.endDate}. Voulez-vous procéder ?`;
        break;
      case "GET_STATS":
        confirmationMessage = `Je peux vous montrer les statistiques pour la période : ${params.period}. Voulez-vous les consulter ?`;
        break;
      case "GET_OPTIMAL_SCHEDULE":
        confirmationMessage = `Je peux vous suggérer des horaires optimaux pour la semaine du ${params.weekStart}. Voulez-vous recevoir des suggestions ?`;
        break;
      case "HELP":
        handleHelpIntent();
        return;
      case "LIST_EMPLOYEES":
        confirmationMessage = `Je peux vous afficher la liste des employés. Souhaitez-vous consulter cette liste ?`;
        break;
      case "SET_REMINDER":
        confirmationMessage = `Je peux créer un rappel pour le ${params.date} avec le message "${params.message}". Voulez-vous ajouter ce rappel ?`;
        break;
      case "USER_PREFERENCES":
        confirmationMessage = `Je peux vous aider à gérer vos préférences. Souhaitez-vous les consulter ou les modifier ?`;
        break;
      case "SEARCH_INFO":
        confirmationMessage = `Je vais rechercher des informations sur "${params.query}". Est-ce bien ce que vous souhaitez ?`;
        break;
      case "FEEDBACK":
        confirmationMessage = `Je vais enregistrer votre feedback. Souhaitez-vous continuer ?`;
        break;
      default:
        confirmationMessage =
          "Je ne suis pas sûr de comprendre votre demande. Pouvez-vous préciser ?";
        setCurrentAction(null);
        break;
    }

    setMessages((prev) => [
      ...prev,
      {
        text: confirmationMessage,
        isUser: false,
      },
    ]);
  };

  /**
   * Gère la simulation des réponses pour les fonctionnalités qui ne sont pas encore
   * implémentées côté backend
   * @param {string} intent - L'intention détectée
   * @param {Object} params - Les paramètres de l'intention
   * @returns {Object} - Résultat simulé
   */
  const getMockResponse = (intent, params) => {
    // Formatage de la date pour l'affichage
    const formatDate = (dateStr) => {
      if (!dateStr) return "Non spécifiée";
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch (e) {
        return dateStr;
      }
    };

    // Liste de noms réalistes pour les simulations
    const sampleEmployees = [
      { id: 1, name: "Alex Dupont", role: "Développeur", hours: 35 },
      { id: 2, name: "Marie Lambert", role: "Designer", hours: 28 },
      { id: 3, name: "Thomas Mercier", role: "Chef de projet", hours: 35 },
      { id: 4, name: "Sophie Moreau", role: "Marketing", hours: 35 },
      { id: 5, name: "Julien Petit", role: "Commercial", hours: 35 },
      { id: 6, name: "Laura Bernard", role: "RH", hours: 28 },
      { id: 7, name: "Nicolas Martin", role: "Support client", hours: 35 },
    ];

    // Prendre un sous-ensemble aléatoire d'employés
    const getRandomEmployees = (count = 3) => {
      const shuffled = [...sampleEmployees].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    switch (intent) {
      case "GENERATE_SCHEDULE":
        // Utiliser les paramètres fournis ou des valeurs par défaut
        const weekStart =
          params.weekStart || new Date().toISOString().split("T")[0];
        const businessHours =
          params.businessHours ||
          "9h-18h du lundi au vendredi, 10h-17h le samedi";
        const constraints = params.constraints || [
          "vacations",
          "rest_preferences",
        ];
        const breakTimes =
          params.breakTimes ||
          "1h pour le déjeuner, 15min en milieu de matinée et d'après-midi";

        // Générer un planning plus détaillé et réaliste
        const employeesForSchedule = getRandomEmployees(5);
        const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
        const assignments = [];

        // Créer des assignations réalistes pour chaque employé
        employeesForSchedule.forEach((emp) => {
          // Chaque employé travaille 3 à 5 jours par semaine selon ses heures
          const workDaysCount = emp.hours >= 35 ? 5 : emp.hours >= 28 ? 4 : 3;
          const shuffledDays = [...days].sort(() => 0.5 - Math.random());
          const workDays = shuffledDays.slice(0, workDaysCount);

          workDays.forEach((day) => {
            // Horaires différents selon les jours et les employés
            let startHour, endHour;

            if (day === "Lundi" || day === "Vendredi") {
              // Horaires variables pour ces jours
              startHour = Math.random() > 0.5 ? "09:00" : "10:00";
              const hoursPerDay = emp.hours / workDaysCount;
              endHour =
                startHour === "09:00"
                  ? hoursPerDay >= 8
                    ? "18:00"
                    : "17:00"
                  : hoursPerDay >= 8
                  ? "19:00"
                  : "18:00";
            } else {
              // Horaires standards pour les autres jours
              startHour = "09:00";
              endHour = emp.hours >= 35 ? "18:00" : "17:00";
            }

            assignments.push({
              employeeId: emp.id,
              employeeName: emp.name,
              day: day,
              start: startHour,
              end: endHour,
              breaks: ["12:00-13:00"], // Pause déjeuner
            });
          });
        });

        return {
          success: true,
          message: `Planning généré avec succès pour la semaine du ${formatDate(
            weekStart
          )}`,
          schedule: {
            weekStart: weekStart,
            employees: employeesForSchedule,
            businessHours: businessHours,
            breakTimes: breakTimes,
            constraints: constraints,
            days: days,
            totalHours: employeesForSchedule.reduce(
              (sum, emp) => sum + emp.hours,
              0
            ),
            assignments: assignments,
          },
          simulation: true,
        };
      case "CHECK_VACATION_AVAILABILITY":
        // Simuler aléatoirement disponible ou non
        const isAvailable = Math.random() > 0.3;
        return {
          success: true,
          available: isAvailable,
          message: isAvailable
            ? `Les dates du ${formatDate(params.startDate)} au ${formatDate(
                params.endDate
              )} sont disponibles pour congés`
            : `Les dates demandées présentent des conflits`,
          conflicts: isAvailable
            ? []
            : [
                { date: params.startDate, reason: "Période chargée" },
                {
                  date: new Date(
                    new Date(params.startDate).getTime() + 86400000
                  )
                    .toISOString()
                    .split("T")[0],
                  reason: "Quota d'employés absents atteint",
                },
              ],
          simulation: true,
        };
      case "GET_STATS":
        return {
          success: true,
          message: `Statistiques récupérées pour la période : ${params.period}`,
          stats: {
            totalHours: 156,
            vacationDays: 3,
            averageHoursPerDay: 7.8,
            workDays: 20,
            otHours: 12,
            attendance: 96.5,
            period: params.period,
            departments: [
              { name: "Développement", hours: 480, employees: 3 },
              { name: "Design", hours: 320, employees: 2 },
              { name: "Marketing", hours: 280, employees: 2 },
            ],
          },
          simulation: true,
        };
      case "GET_OPTIMAL_SCHEDULE":
        return {
          success: true,
          message: "Suggestions de créneaux optimaux générées",
          suggestions: [
            { day: "Lundi", start: "09:00", end: "17:00", score: 98 },
            { day: "Mardi", start: "10:00", end: "18:00", score: 92 },
            { day: "Mercredi", start: "08:00", end: "16:00", score: 85 },
            { day: "Jeudi", start: "09:00", end: "17:00", score: 90 },
            { day: "Vendredi", start: "10:00", end: "16:00", score: 88 },
          ],
          employeeId: params.employeeId,
          weekStart: params.weekStart,
          simulation: true,
        };
      case "LIST_EMPLOYEES":
        return {
          success: true,
          message: "Liste des employés récupérée",
          employees: sampleEmployees,
          simulation: true,
        };
      case "SEARCH_INFO":
        return {
          success: true,
          message: `Résultats de la recherche pour "${params.query}"`,
          results: [
            {
              title: "Informations sur les plannings",
              content: `Les plannings sont générés en tenant compte des contraintes et préférences des employés. La recherche sur "${params.query}" a retourné des informations concernant les horaires de travail et la gestion des équipes.`,
            },
            {
              title: "Règles d'entreprise",
              content: `Les règles d'entreprise relatives à "${params.query}" précisent que les employés doivent avoir au moins 11 heures de repos entre deux journées de travail.`,
            },
          ],
          simulation: true,
        };
      case "CREATE_VACATION_REQUEST":
        return {
          success: true,
          message: `Demande de congés créée avec succès pour la période du ${formatDate(
            params.startDate
          )} au ${formatDate(params.endDate)}`,
          vacationRequest: {
            id: Math.floor(Math.random() * 1000) + 100,
            employeeId: params.employeeId,
            startDate: params.startDate,
            endDate: params.endDate,
            type: params.type || "vacation",
            status: "pending",
            createdAt: new Date().toISOString(),
          },
          simulation: true,
        };
      default:
        return {
          success: true,
          message: "Action traitée avec succès (simulation)",
          simulation: true,
        };
    }
  };

  /**
   * Gère spécifiquement l'intention d'aide
   */
  const handleHelpIntent = async () => {
    try {
      const result = await ChatbotService.getHelpInfo();

      let helpMessage = "Voici ce que je peux faire pour vous :\n\n";

      if (result.success && result.helpInfo) {
        result.helpInfo.features.forEach((feature) => {
          helpMessage += `📌 **${feature.name}**\n`;
          helpMessage += `   Exemples: "${feature.commands[0]}", "${feature.commands[1]}"\n\n`;
        });
      } else {
        helpMessage += `
📌 **Gestion des plannings**
   Je peux générer, afficher ou optimiser les plannings.

📌 **Gestion des congés**
   Je peux vérifier la disponibilité et créer des demandes de congés.

📌 **Statistiques et informations**
   Je peux afficher vos statistiques et rechercher des informations.

📌 **Rappels et notifications**
   Je peux vous aider à ne rien oublier avec des rappels personnalisés.
      `;
      }

      helpMessage +=
        "\nVous pouvez essayer l'une de ces commandes ou me demander plus de détails sur une fonctionnalité spécifique.";

      setMessages((prev) => [
        ...prev,
        {
          text: helpMessage,
          isUser: false,
        },
      ]);

      setCurrentAction(null);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'aide:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Je ne parviens pas à récupérer les informations d'aide. Veuillez réessayer plus tard.",
          isUser: false,
        },
      ]);
    }
  };

  /**
   * Génère une réponse formatée à partir du résultat d'une action
   * @param {Object} result - Le résultat de l'action
   * @param {string} intent - L'intention associée à l'action
   * @returns {string} - Message formaté
   */
  const formatActionResult = (result, intent) => {
    if (!result.success) {
      return `❌ ${result.message || "Échec de l'action."}`;
    }

    // Préfixe de simulation si applicable
    const simulationPrefix = result.simulation ? "[SIMULATION] " : "";

    let formattedMessage = `✅ ${simulationPrefix}${
      result.message || "Action effectuée avec succès !"
    }`;

    // Enrichir le message selon l'intention
    switch (intent) {
      case "GENERATE_SCHEDULE":
        if (result.schedule) {
          formattedMessage += `\n\nLe planning a été généré pour ${
            result.schedule.employees?.length || 0
          } employés sur la semaine du ${result.schedule.weekStart}.`;

          if (result.simulation) {
            formattedMessage +=
              "\n\nCeci est une simulation car l'API n'est pas disponible. Dans un environnement de production, vous pourriez consulter ce planning dans l'application.";
          }
        }
        break;
      case "CHECK_VACATION_AVAILABILITY":
        if (result.available) {
          formattedMessage +=
            "\n\nBonne nouvelle ! Ces dates sont disponibles pour poser des congés. Souhaitez-vous créer une demande maintenant ?";
        } else if (result.conflicts && result.conflicts.length > 0) {
          formattedMessage += `\n\nIl y a ${result.conflicts.length} conflits pour ces dates. Voulez-vous explorer d'autres options ?`;
        }

        if (result.simulation) {
          formattedMessage +=
            "\n\nNotez que cette vérification est une simulation.";
        }
        break;
      case "GET_STATS":
        if (result.stats) {
          formattedMessage += "\n\nVoici un résumé de vos statistiques :";
          if (result.stats.totalHours)
            formattedMessage += `\n- Total d'heures : ${result.stats.totalHours}h`;
          if (result.stats.vacationDays)
            formattedMessage += `\n- Jours de congés : ${result.stats.vacationDays}`;

          if (result.simulation) {
            formattedMessage +=
              "\n\nCes données sont simulées à titre d'exemple.";
          }
        }
        break;
      case "LIST_EMPLOYEES":
        if (result.employees && result.employees.length > 0) {
          formattedMessage += "\n\nListe des employés :";
          result.employees.slice(0, 5).forEach((emp) => {
            formattedMessage += `\n- ${emp.name} (${emp.role || "Employé"})`;
          });
          if (result.employees.length > 5) {
            formattedMessage += `\n... et ${
              result.employees.length - 5
            } autres employés.`;
          }

          if (result.simulation) {
            formattedMessage += "\n\nCette liste est simulée.";
          }
        }
        break;
    }

    formattedMessage += "\n\nPuis-je vous aider avec autre chose ?";
    return formattedMessage;
  };

  /**
   * Gère l'erreur d'une action et génère un message approprié
   * @param {Error} error - L'erreur survenue
   * @param {string} intent - L'intention associée à l'action
   * @returns {Object} - Message d'erreur formaté et informations complémentaires
   */
  const handleActionError = (error, intent) => {
    console.error(`Erreur lors de l'exécution de l'action ${intent}:`, error);

    // Vérifier plus précisément si c'est une erreur 404 (API non disponible)
    const is404 =
      error.status === 404 ||
      (error.message && error.message.includes("404")) ||
      (error.response && error.response.status === 404) ||
      (error.message && error.message.includes("Not Found"));

    // Si c'est une erreur 404, proposer une simulation
    if (is404) {
      // Pour GENERATE_SCHEDULE, traitement spécial
      if (intent === "GENERATE_SCHEDULE") {
        return {
          text: `⚠️ Le service de génération de planning n'est pas disponible actuellement. Je peux vous proposer une simulation pour vous montrer comment cela fonctionnerait.`,
          isUser: false,
          requiresSimulation: true,
          agent: isAgentMode, // Ajouter l'indicateur de mode agent si nécessaire
        };
      }

      // Pour les autres intentions, comportement standard avec simulation automatique
      setTimeout(() => {
        // Activer le mode simulation avec l'intention originale
        setCurrentAction({
          intent: "SIMULATE",
          params: {
            originalIntent: intent,
            originalParams: currentAction ? currentAction.params : {},
          },
        });

        // Exécuter la simulation
        executeAction();
      }, 500);

      return {
        text: `⚠️ Cette fonctionnalité n'est pas encore disponible sur le serveur. Je vous montre une simulation pour vous donner une idée de son fonctionnement.`,
        isUser: false,
        agent: isAgentMode, // Ajouter l'indicateur de mode agent si nécessaire
      };
    }

    // Messages personnalisés selon l'intention
    let errorMsg = `❌ Une erreur est survenue : ${
      error.message || "Erreur inconnue"
    }`;

    switch (intent) {
      case "GENERATE_SCHEDULE":
        errorMsg +=
          "\n\nImpossible de générer le planning. Vous pouvez essayer avec une autre date ou utiliser l'interface manuelle.";
        errorMsg +=
          "\n\nVoulez-vous que je vous montre une simulation de planning à la place ?";
        return {
          text: errorMsg,
          isUser: false,
          requiresSimulation: true,
          agent: isAgentMode,
        };
      case "CHECK_VACATION_AVAILABILITY":
        errorMsg +=
          "\n\nImpossible de vérifier la disponibilité. Vous pouvez essayer avec d'autres dates ou vérifier directement dans la section congés.";
        break;
      case "CREATE_VACATION_REQUEST":
        errorMsg +=
          "\n\nImpossible de créer la demande de congés. Assurez-vous que les dates sont correctes et que vous avez les droits nécessaires.";
        break;
      default:
        errorMsg +=
          "\n\nVeuillez réessayer ultérieurement ou utiliser l'interface classique pour cette action.";
    }

    return {
      text: errorMsg,
      isUser: false,
      agent: isAgentMode,
    };
  };

  const executeAction = async () => {
    if (!currentAction) return;

    setIsActionLoading(true);
    const { intent, params } = currentAction;

    try {
      let result = null;

      // Simulation si demandée explicitement
      if (intent === "SIMULATE") {
        const originalIntent = params.originalIntent;
        const originalParams = params.originalParams;

        result = getMockResponse(originalIntent, originalParams);

        // Ajouter un délai pour simuler un appel API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setActionResult(result);
        setMessages((prev) => [
          ...prev,
          {
            text: "⚙️ Mode simulation activé ⚙️",
            isUser: false,
          },
          {
            text: formatActionResult(result, originalIntent),
            isUser: false,
          },
        ]);

        setTimeout(() => {
          setCurrentAction(null);
          setActionResult(null);
        }, 5000);

        setIsActionLoading(false);
        return;
      }

      try {
        // Tenter d'exécuter l'action réelle
        switch (intent) {
          case "GENERATE_SCHEDULE":
            try {
              result = await ChatbotService.generateSchedule(
                params.weekStart,
                params.options || {}
              );
            } catch (scheduleError) {
              // Vérifier spécifiquement si c'est une erreur 404 pour la génération de planning
              const is404 =
                scheduleError.message &&
                (scheduleError.message.includes("404") ||
                  scheduleError.message.includes("Not Found") ||
                  (scheduleError.response &&
                    scheduleError.response.status === 404));

              if (is404) {
                // Log explicite pour le debug
                console.log(
                  "API de génération de planning non disponible, utilisation de la simulation",
                  scheduleError
                );

                // Ajouter un message spécifique pour cette erreur
                setMessages((prev) => [
                  ...prev,
                  {
                    text: `⚙️ Le service de génération de planning n'est pas disponible actuellement. Je vous présente une simulation à titre d'exemple.`,
                    isUser: false,
                    agent: true,
                  },
                ]);

                // Utiliser la simulation avec tous les paramètres disponibles
                result = getMockResponse("GENERATE_SCHEDULE", {
                  weekStart: params.weekStart,
                  businessHours: params.options?.businessHours,
                  constraints: params.options?.constraints || [
                    "vacations",
                    "rest_preferences",
                  ],
                  breakTimes: params.options?.breakTimes,
                });
                result.simulation = true;
              } else {
                // Pour les autres erreurs, relancer pour le traitement standard
                throw scheduleError;
              }
            }
            break;
          case "VIEW_SCHEDULE":
            // Rediriger vers la page de planning avec les paramètres appropriés
            window.location.href = `/weekly-schedule/${params.weekStart}`;
            result = {
              success: true,
              message: "Redirection vers la page de planning...",
            };
            break;
          case "CHECK_VACATION_AVAILABILITY":
            result = await ChatbotService.checkVacationAvailability(
              params.employeeId,
              params.startDate,
              params.endDate
            );
            break;
          case "CREATE_VACATION_REQUEST":
            result = await ChatbotService.createVacationRequest({
              employee_id: params.employeeId,
              start_date: params.startDate,
              end_date: params.endDate,
              type: params.type || "vacation",
              status: "pending",
              comments: "Créé via l'assistant IA",
            });
            break;
          case "GET_STATS":
            result = await ChatbotService.getEmployeeStats(
              params.employeeId,
              params.period
            );
            break;
          case "GET_OPTIMAL_SCHEDULE":
            result = await ChatbotService.getOptimalScheduleSuggestion(
              params.employeeId,
              params.weekStart
            );
            break;
          case "LIST_EMPLOYEES":
            result = await ChatbotService.getEmployeesList();
            break;
          case "SET_REMINDER":
            result = await ChatbotService.setReminder(
              params.date,
              params.message
            );
            break;
          case "USER_PREFERENCES":
            result = await ChatbotService.getUserPreferences();
            break;
          case "SEARCH_INFO":
            result = await ChatbotService.searchInfo(params.query);
            break;
          case "FEEDBACK":
            result = await ChatbotService.saveFeedback(params.message);
            break;
          default:
            result = { success: false, message: "Action non reconnue" };
            break;
        }
      } catch (apiError) {
        // En cas d'erreur (probablement une 404), basculer automatiquement en mode simulation
        console.log(
          `API non disponible pour l'action ${intent}, basculement en mode simulation`,
          apiError
        );

        // Ajouter un message indiquant la simulation
        setMessages((prev) => [
          ...prev,
          {
            text: `⚙️ L'API pour cette action n'est pas disponible. Je vous présente une simulation de ce que vous auriez vu.`,
            isUser: false,
          },
        ]);

        // Utiliser le mock existant pour simuler la réponse
        result = getMockResponse(intent, params);
        result.simulation = true; // Marquer comme simulation
      }

      setActionResult(result);

      // Formater et ajouter le résultat
      setMessages((prev) => [
        ...prev,
        {
          text: formatActionResult(result, intent),
          isUser: false,
        },
      ]);

      // Réinitialiser l'action en cours après un certain délai
      setTimeout(() => {
        setCurrentAction(null);
        setActionResult(null);
      }, 5000);
    } catch (error) {
      const errorMessage = handleActionError(error, intent);

      setActionResult({
        success: false,
        message:
          error.message ||
          "Une erreur est survenue lors de l'exécution de l'action",
      });

      setMessages((prev) => [...prev, errorMessage]);

      // Si c'est une simulation proposée, garder l'action actuelle mais la marquer comme requérant une simulation
      if (errorMessage.requiresSimulation) {
        setCurrentAction({
          intent: "WAITING_FOR_SIMULATION",
          params: {
            originalIntent: intent,
            originalParams: params,
          },
        });
      } else {
        // Sinon, réinitialiser l'action
        setTimeout(() => {
          setCurrentAction(null);
          setActionResult(null);
        }, 5000);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const cancelAction = () => {
    setMessages((prev) => [
      ...prev,
      {
        text: "Action annulée. Puis-je vous aider avec autre chose ?",
        isUser: false,
      },
    ]);

    setCurrentAction(null);
    setActionResult(null);
  };

  /**
   * Vérifie si le message est une simple salutation
   * @param {string} message - Message à analyser
   * @returns {boolean} - True si c'est une salutation
   */
  const isSimpleGreeting = (message) => {
    const greetings = [
      "bonjour",
      "salut",
      "hello",
      "coucou",
      "bonsoir",
      "hey",
      "bjr",
      "yo",
      "hi",
      "hola",
    ];

    const normalizedMessage = message.toLowerCase().trim();

    // Si le message contient seulement une salutation (avec tolérance pour quelques caractères en plus)
    return greetings.some(
      (greeting) =>
        normalizedMessage === greeting ||
        normalizedMessage === `${greeting} !` ||
        normalizedMessage === `${greeting}.` ||
        normalizedMessage === `${greeting}!` ||
        normalizedMessage === `${greeting}.`
    );
  };

  /**
   * Vérifie si le message est une simple expression de gratitude
   * @param {string} message - Message à analyser
   * @returns {boolean} - True si c'est une expression de gratitude
   */
  const isSimpleGratitude = (message) => {
    const gratitudeExpressions = [
      "merci",
      "thanks",
      "thank you",
      "thx",
      "ty",
      "merci beaucoup",
      "grand merci",
      "je te remercie",
      "je vous remercie",
    ];

    const normalizedMessage = message.toLowerCase().trim();

    // Si le message contient seulement une expression de gratitude (avec tolérance)
    return gratitudeExpressions.some(
      (expr) =>
        normalizedMessage === expr ||
        normalizedMessage === `${expr} !` ||
        normalizedMessage === `${expr}.` ||
        normalizedMessage === `${expr}!` ||
        normalizedMessage === `${expr}.`
    );
  };

  /**
   * Gère les messages de salutation
   * @param {string} message - Message de salutation
   */
  const handleGreeting = (message) => {
    const timeOfDay = new Date().getHours();
    let greeting = "";

    if (timeOfDay >= 5 && timeOfDay < 12) {
      greeting = "Bonjour";
    } else if (timeOfDay >= 12 && timeOfDay < 18) {
      greeting = "Bon après-midi";
    } else {
      greeting = "Bonsoir";
    }

    const userName = getUserFirstName();
    const greetingWithName = userName ? `${greeting} ${userName}` : greeting;

    const responses = [
      `${greetingWithName} ! Comment puis-je vous aider aujourd'hui ?`,
      `${greetingWithName} ! Que puis-je faire pour vous ?`,
      `${greetingWithName} ! Je suis à votre service.`,
      `${greetingWithName} ! Besoin d'aide pour la gestion de plannings ou de congés ?`,
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    setMessages((prev) => [
      ...prev,
      {
        text: response,
        isUser: false,
      },
    ]);
  };

  /**
   * Gère les messages de gratitude
   */
  const handleGratitude = () => {
    const responses = [
      "De rien ! Je suis là pour vous aider.",
      "Avec plaisir ! Autre chose que je puisse faire pour vous ?",
      "Je vous en prie ! N'hésitez pas si vous avez d'autres questions.",
      "C'est mon travail ! Besoin d'autre chose ?",
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    setMessages((prev) => [
      ...prev,
      {
        text: response,
        isUser: false,
      },
    ]);
  };

  // Fonction pour basculer le mode personnalisé
  const togglePersonalizedMode = () => {
    // Si on active le mode personnalisé et qu'on n'a pas encore le consentement
    if (!isPersonalizedMode && !hasUserConsent) {
      setShowConsentModal(true);
      return;
    }

    setIsPersonalizedMode((prev) => !prev);
    // Désactiver le mode agent si on active le mode personnalisé
    if (!isPersonalizedMode && isAgentMode) {
      setIsAgentMode(false);
    }

    const message = !isPersonalizedMode
      ? "Mode personnalisé activé. J'utiliserai vos informations pour personnaliser mes réponses et mieux vous aider."
      : "Mode personnalisé désactivé. Je n'utiliserai plus vos informations personnelles.";

    setMessages((prev) => [
      ...prev,
      {
        text: message,
        isUser: false,
      },
    ]);
  };

  // Fonction pour basculer le mode agent
  const toggleAgentMode = () => {
    // Si on active le mode agent et qu'on n'a pas encore le consentement
    if (!isAgentMode && !hasUserConsent) {
      setShowConsentModal(true);
      return;
    }

    setIsAgentMode((prev) => !prev);
    // Désactiver le mode personnalisé si on active le mode agent
    if (!isAgentMode && isPersonalizedMode) {
      setIsPersonalizedMode(false);
    }

    const message = !isAgentMode
      ? "Mode agent activé. Je peux maintenant vous aider à créer des plannings en prenant en compte vos contraintes et préférences."
      : "Mode agent désactivé. Je reste à votre disposition pour toute autre question.";

    setMessages((prev) => [
      ...prev,
      {
        text: message,
        isUser: false,
      },
    ]);

    // Si on active le mode agent, proposer de créer un planning
    if (!isAgentMode) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Souhaitez-vous créer un planning ? Je peux vous guider dans le processus en vous posant des questions sur vos contraintes, les horaires d'ouverture, et les préférences de vos employés.",
          isUser: false,
        },
      ]);
    }
  };

  // Fonction pour démarrer la création d'un planning
  const startScheduleCreation = () => {
    setSchedulingInProgress(true);
    setSchedulingData({
      weekStart: null,
      constraints: [],
      employees: [],
      businessHours: null,
      breakTimes: null,
    });

    setMessages((prev) => [
      ...prev,
      {
        text: "Commençons la création d'un planning. Pour quelle semaine souhaitez-vous créer ce planning ? (format JJ/MM/AAAA pour le premier jour de la semaine)",
        isUser: false,
      },
    ]);
  };

  // Fonction pour traiter les réponses de création de planning
  const processSchedulingResponse = (userInput) => {
    if (!schedulingData.weekStart) {
      // Traitement de la date de début de semaine
      try {
        const dateParts = userInput.split("/");
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1;
          const year = parseInt(dateParts[2], 10);
          const date = new Date(year, month, day);

          // Vérifier si c'est un lundi
          const isMonday = date.getDay() === 1;

          if (isMonday) {
            setSchedulingData((prev) => ({
              ...prev,
              weekStart: date.toISOString().split("T")[0],
            }));

            setMessages((prev) => [
              ...prev,
              {
                text: `Parfait, nous allons créer un planning pour la semaine du ${userInput}. Maintenant, quels sont vos horaires d'ouverture ? (ex: 9h-18h du lundi au vendredi, 10h-17h le samedi)`,
                isUser: false,
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                text: "La date que vous avez fournie n'est pas un lundi. Pour simplifier, veuillez indiquer un lundi comme premier jour de la semaine.",
                isUser: false,
              },
            ]);
          }
        } else {
          setMessages((prev) => [
            ...prev,
            {
              text: "Format de date incorrect. Veuillez utiliser le format JJ/MM/AAAA (ex: 01/07/2023).",
              isUser: false,
            },
          ]);
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            text: "Je n'ai pas pu interpréter cette date. Veuillez utiliser le format JJ/MM/AAAA (ex: 01/07/2023).",
            isUser: false,
          },
        ]);
      }
      return;
    }

    if (!schedulingData.businessHours) {
      // Traitement des horaires d'ouverture
      setSchedulingData((prev) => ({
        ...prev,
        businessHours: userInput,
      }));

      setMessages((prev) => [
        ...prev,
        {
          text: `J'ai enregistré vos horaires d'ouverture: ${userInput}. Y a-t-il des employés en congés cette semaine-là ? Si oui, pourriez-vous me donner leurs noms ?`,
          isUser: false,
        },
      ]);
      return;
    }

    if (!schedulingData.constraints.includes("vacations")) {
      // Traitement des congés
      const updatedConstraints = [...schedulingData.constraints, "vacations"];
      setSchedulingData((prev) => ({
        ...prev,
        constraints: updatedConstraints,
      }));

      setMessages((prev) => [
        ...prev,
        {
          text: `Merci pour cette information sur les congés. Y a-t-il des employés qui ont des préférences spécifiques pour leurs jours de repos ?`,
          isUser: false,
        },
      ]);
      return;
    }

    if (!schedulingData.constraints.includes("rest_preferences")) {
      // Traitement des préférences de repos
      const updatedConstraints = [
        ...schedulingData.constraints,
        "rest_preferences",
      ];
      setSchedulingData((prev) => ({
        ...prev,
        constraints: updatedConstraints,
      }));

      setMessages((prev) => [
        ...prev,
        {
          text: `Parfait, j'ai noté ces préférences. Quel temps de pause minimum souhaitez-vous accorder à vos employés entre deux journées de travail ?`,
          isUser: false,
        },
      ]);
      return;
    }

    if (!schedulingData.breakTimes) {
      // Traitement des temps de pause
      setSchedulingData((prev) => ({
        ...prev,
        breakTimes: userInput,
      }));

      // Finalisation de la création du planning
      setMessages((prev) => [
        ...prev,
        {
          text: `J'ai toutes les informations nécessaires pour générer un planning optimal. Je vais maintenant créer ce planning pour la semaine du ${new Date(
            schedulingData.weekStart
          ).toLocaleDateString()}.`,
          isUser: false,
        },
      ]);

      // Appel au service de génération de planning
      generateScheduleWithData();
      return;
    }
  };

  // Fonction pour générer le planning avec les données collectées
  const generateScheduleWithData = async () => {
    setIsActionLoading(true);

    try {
      let result = null;
      let simulationMode = false;

      try {
        // Tenter d'appeler l'API réelle
        result = await ChatbotService.generateSchedule(
          schedulingData.weekStart,
          {
            businessHours: schedulingData.businessHours,
            constraints: schedulingData.constraints,
            breakTimes: schedulingData.breakTimes,
          }
        );
      } catch (apiError) {
        // Vérifier si c'est une erreur 404 (API non disponible)
        const is404 =
          apiError.message &&
          (apiError.message.includes("404") ||
            apiError.message.includes("Not Found") ||
            (apiError.response && apiError.response.status === 404));

        console.log(
          "API non disponible, basculement en mode simulation",
          apiError
        );
        simulationMode = true;

        // Générer une simulation de planning
        result = getMockResponse("GENERATE_SCHEDULE", {
          weekStart: schedulingData.weekStart,
          businessHours: schedulingData.businessHours,
          constraints: schedulingData.constraints,
          breakTimes: schedulingData.breakTimes,
        });

        // Marquer comme simulation
        result.simulation = true;

        // Ajouter un message indiquant qu'il s'agit d'une simulation
        setMessages((prev) => [
          ...prev,
          {
            text: "⚙️ L'API de planification n'est pas disponible. Je vous présente une simulation à titre d'exemple.",
            isUser: false,
            agent: true,
          },
        ]);
      }

      // Si le résultat est toujours null (cas improbable), créer une simulation de base
      if (!result) {
        simulationMode = true;
        result = {
          success: true,
          message: "Planning généré pour la semaine spécifiée",
          simulation: true,
          schedule: {
            weekStart: schedulingData.weekStart,
            businessHours: schedulingData.businessHours,
            employees: [
              { id: 1, name: "Alex Dupont", hours: 35 },
              { id: 2, name: "Marie Lambert", hours: 28 },
              { id: 3, name: "Thomas Mercier", hours: 35 },
            ],
            days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
          },
        };
      }

      if (result.success) {
        // Formater la date pour l'affichage
        const formattedDate = new Date(
          schedulingData.weekStart
        ).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        setMessages((prev) => [
          ...prev,
          {
            text: `✅ ${
              result.simulation ? "[SIMULATION] " : ""
            }Le planning a été généré avec succès pour la semaine du ${formattedDate}. 
            
${
  result.simulation ? "Dans un environnement de production, vous" : "Vous"
} pouvez consulter ce planning dans la section Planning de l'application.
            
📋 Résumé:
- Semaine du: ${formattedDate}
- Horaires d'ouverture: ${schedulingData.businessHours}
- Employés planifiés: ${result.schedule?.employees?.length || 3} employés
- Temps de pause: ${schedulingData.breakTimes}
- Contraintes: ${
              schedulingData.constraints.length > 0
                ? schedulingData.constraints.join(", ")
                : "Standard"
            }`,
            isUser: false,
            agent: true,
          },
        ]);
      } else {
        // Si la génération a échoué mais pas à cause d'une 404, afficher l'erreur
        setMessages((prev) => [
          ...prev,
          {
            text: `❌ Je n'ai pas pu générer le planning. Erreur: ${
              result.message || "Une erreur est survenue."
            }`,
            isUser: false,
            agent: true,
          },
          {
            text: "Voulez-vous que je vous montre une simulation de planning à la place ?",
            isUser: false,
            agent: true,
          },
        ]);

        // Configurer pour attendre une réponse de simulation
        setCurrentAction({
          intent: "WAITING_FOR_SIMULATION",
          params: {
            originalIntent: "GENERATE_SCHEDULE",
            originalParams: {
              weekStart: schedulingData.weekStart,
              businessHours: schedulingData.businessHours,
              constraints: schedulingData.constraints,
              breakTimes: schedulingData.breakTimes,
            },
          },
        });
      }
    } catch (error) {
      console.error("Erreur lors de la génération du planning:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: `❌ Une erreur est survenue lors de la génération du planning: ${
            error.message || "Erreur inconnue"
          }.`,
          isUser: false,
          agent: true,
        },
        {
          text: "Voulez-vous que je vous montre une simulation de planning à la place ?",
          isUser: false,
          agent: true,
        },
      ]);

      // Configurer pour attendre une réponse de simulation
      setCurrentAction({
        intent: "WAITING_FOR_SIMULATION",
        params: {
          originalIntent: "GENERATE_SCHEDULE",
          originalParams: {
            weekStart: schedulingData.weekStart,
            businessHours: schedulingData.businessHours,
            constraints: schedulingData.constraints,
            breakTimes: schedulingData.breakTimes,
          },
        },
      });
    } finally {
      setIsActionLoading(false);
      if (!currentAction) {
        // Ne réinitialiser que si on n'est pas en attente d'une simulation
        setSchedulingInProgress(false);
      }
    }
  };

  /**
   * Traite les requêtes spécifiques au mode personnalisé concernant les informations des employés
   * @param {string} query - La requête de l'utilisateur
   * @returns {Promise<string|null>} - Réponse personnalisée ou null si pas de correspondance
   */
  const handlePersonalizedEmployeeQuery = async (query) => {
    // Si le mode personnalisé n'est pas activé ou si l'utilisateur n'a pas donné son consentement
    if (!isPersonalizedMode || !hasUserConsent) {
      return null;
    }

    // Récupérer les informations personnalisées (maintenant asynchrone)
    const userInfo = await getUserPersonalizedInfo();
    if (!userInfo || !userInfo.equipe) {
      return null;
    }

    // Normaliser la requête
    const normalizedQuery = query.toLowerCase();

    // Traiter les questions sur la date d'embauche d'un employé spécifique
    if (
      normalizedQuery.includes("quand") ||
      normalizedQuery.includes("depuis") ||
      normalizedQuery.includes("date d'embauche")
    ) {
      // Rechercher les références à un employé spécifique
      for (const employee of userInfo.equipe) {
        const firstName = employee.firstName.toLowerCase();
        const lastName = employee.lastName.toLowerCase();
        const fullName = `${firstName} ${lastName}`.toLowerCase();

        if (
          normalizedQuery.includes(firstName) ||
          normalizedQuery.includes(lastName) ||
          normalizedQuery.includes(fullName)
        ) {
          // Formater la date d'embauche
          const hireDate = new Date(employee.hireDate);
          const formattedDate = hireDate.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          const hireDateYear = hireDate.getFullYear();
          const currentYear = new Date().getFullYear();
          const yearsOfService = currentYear - hireDateYear;

          return `${employee.firstName} ${
            employee.lastName
          } travaille dans l'entreprise depuis le ${formattedDate}, soit environ ${yearsOfService} an${
            yearsOfService > 1 ? "s" : ""
          } d'ancienneté. ${employee.firstName} occupe le poste de ${
            employee.role
          } dans le département ${employee.department}.`;
        }
      }
    }

    // Traiter les questions sur les horaires préférés d'un employé
    if (
      normalizedQuery.includes("horaire") ||
      normalizedQuery.includes("jour") ||
      normalizedQuery.includes("préfér")
    ) {
      // Rechercher les références à un employé spécifique
      for (const employee of userInfo.equipe) {
        const firstName = employee.firstName.toLowerCase();
        const lastName = employee.lastName.toLowerCase();
        const fullName = `${firstName} ${lastName}`.toLowerCase();

        if (
          normalizedQuery.includes(firstName) ||
          normalizedQuery.includes(lastName) ||
          normalizedQuery.includes(fullName)
        ) {
          const preferredDays = employee.preferredDays.join(", ");
          return `${employee.firstName} ${employee.lastName} préfère travailler les jours suivants : ${preferredDays}. ${employee.firstName} est employé(e) à ${employee.hours}h par semaine.`;
        }
      }
    }

    // Traiter les questions sur le département ou rôle d'un employé
    if (
      normalizedQuery.includes("département") ||
      normalizedQuery.includes("équipe") ||
      normalizedQuery.includes("rôle") ||
      normalizedQuery.includes("poste")
    ) {
      // Rechercher les références à un employé spécifique
      for (const employee of userInfo.equipe) {
        const firstName = employee.firstName.toLowerCase();
        const lastName = employee.lastName.toLowerCase();
        const fullName = `${firstName} ${lastName}`.toLowerCase();

        if (
          normalizedQuery.includes(firstName) ||
          normalizedQuery.includes(lastName) ||
          normalizedQuery.includes(fullName)
        ) {
          return `${employee.firstName} ${employee.lastName} travaille dans le département ${employee.department} en tant que ${employee.role}.`;
        }
      }
    }

    // Si aucune correspondance spécifique n'est trouvée
    return null;
  };

  // Modifions la fonction handleSubmit pour intégrer le mode de création de planning
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    const userQuery = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Vérifier si nous avons une réponse personnalisée pour les requêtes sur les employés
    if (isPersonalizedMode) {
      try {
        const personalizedEmployeeResponse =
          await handlePersonalizedEmployeeQuery(userQuery);

        if (personalizedEmployeeResponse) {
          setMessages((prev) => [
            ...prev,
            {
              text: personalizedEmployeeResponse,
              isUser: false,
              personalized: true,
            },
          ]);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error(
          "Erreur lors du traitement de la requête personnalisée:",
          error
        );
      }
    }

    // Si nous sommes en mode de création de planning
    if (schedulingInProgress) {
      processSchedulingResponse(userQuery);
      setIsLoading(false);
      return;
    }

    // Si le message contient une demande de création de planning en mode agent
    if (
      isAgentMode &&
      (userQuery.toLowerCase().includes("créer un planning") ||
        userQuery.toLowerCase().includes("générer un planning") ||
        userQuery.toLowerCase().includes("nouveau planning"))
    ) {
      startScheduleCreation();
      setIsLoading(false);
      return;
    }

    // Si une action est en cours et que l'utilisateur répond
    if (currentAction) {
      const normalizedQuery = userQuery.toLowerCase();

      // L'action est en attente de confirmation pour une simulation
      if (currentAction.intent === "WAITING_FOR_SIMULATION") {
        if (
          normalizedQuery.includes("oui") ||
          normalizedQuery.includes("d'accord") ||
          normalizedQuery.includes("ok") ||
          normalizedQuery.includes("démonstration") ||
          normalizedQuery.includes("montre") ||
          normalizedQuery.includes("simulation")
        ) {
          // Convertir en action de simulation avec les paramètres originaux
          setCurrentAction({
            intent: "SIMULATE",
            params: {
              originalIntent: currentAction.params.originalIntent,
              originalParams: currentAction.params.originalParams,
            },
          });
          executeAction();
          setIsLoading(false);
          return;
        } else {
          // Annuler la simulation
          cancelAction();
          setIsLoading(false);
          return;
        }
      }

      // Réponse à une action normale
      if (!actionResult) {
        if (
          normalizedQuery.includes("oui") ||
          normalizedQuery.includes("ok") ||
          normalizedQuery.includes("d'accord") ||
          normalizedQuery.includes("procéder") ||
          normalizedQuery.includes("affirmatif") ||
          normalizedQuery.includes("bien sûr")
        ) {
          // L'utilisateur confirme l'action
          executeAction();
          setIsLoading(false);
          return;
        } else if (
          normalizedQuery.includes("non") ||
          normalizedQuery.includes("annuler") ||
          normalizedQuery.includes("pas maintenant") ||
          normalizedQuery.includes("négatif")
        ) {
          // L'utilisateur annule l'action
          cancelAction();
          setIsLoading(false);
          return;
        }
      }
    }

    // Vérifier si c'est un message de salutation simple
    if (isSimpleGreeting(userQuery)) {
      handleGreeting(userQuery);
      setIsLoading(false);
      return;
    }

    // Vérifier si c'est une expression de gratitude simple
    if (isSimpleGratitude(userQuery)) {
      handleGratitude();
      setIsLoading(false);
      return;
    }

    // Détecter l'intention de l'utilisateur via NLP
    try {
      setIsWaitingForResponse(true);

      // Détection d'intention NLP
      const { intent, params } = detectIntent(userQuery);

      // Journaliser pour debug
      console.log("Intention détectée:", intent, params);

      // Si l'intention est détectée avec succès
      if (intent !== "UNKNOWN") {
        // Si l'utilisateur a activé les messages personnalisés, ajouter un élément personnalisé
        const userInfo = getUserPersonalizedInfo();
        let additionalInfo = "";

        if (isPersonalizedMode && userInfo && userInfo.name) {
          // Vérifier les rappels en attente pour cet utilisateur
          try {
            const remindersResult = await ChatbotService.getReminders();
            if (
              remindersResult.success &&
              remindersResult.reminders &&
              remindersResult.reminders.length > 0
            ) {
              const pendingReminders = remindersResult.reminders.filter(
                (r) => !r.isDone
              );

              if (pendingReminders.length > 0) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const todayReminders = pendingReminders.filter((r) => {
                  const reminderDate = new Date(r.date);
                  reminderDate.setHours(0, 0, 0, 0);
                  return reminderDate.getTime() === today.getTime();
                });

                if (todayReminders.length > 0) {
                  additionalInfo = `\n\n📆 Rappel: Vous avez ${todayReminders.length} rappel(s) pour aujourd'hui.`;
                }
              }
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des rappels:", error);
          }
        }

        // Traiter l'intention
        await processIntent(intent, params);

        // Ajouter des informations supplémentaires si nécessaire
        if (additionalInfo) {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                text: additionalInfo,
                isUser: false,
              },
            ]);
          }, 2000);
        }
      } else {
        // Intention non reconnue, fournir une réponse générique
        const response =
          getLocalResponse(userQuery) ||
          "Je ne suis pas sûr de comprendre votre demande. Pouvez-vous la reformuler ou choisir parmi ces options:\n\n" +
            "- Générer un planning\n" +
            "- Vérifier la disponibilité pour des congés\n" +
            "- Consulter mes statistiques\n" +
            "- Obtenir de l'aide (commande: aide)";

        const enhancedResponse = enhanceResponseWithEmojis(response);

        setMessages((prev) => [
          ...prev,
          {
            text: enhancedResponse,
            isUser: false,
          },
        ]);
      }
    } catch (error) {
      console.error("Erreur lors du traitement du message:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Je rencontre un problème technique. Veuillez réessayer dans un instant.",
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsWaitingForResponse(false);
    }
  };

  const getUserFirstName = () => {
    console.log("User data:", user);

    if (user && user.firstName) {
      return user.firstName;
    } else if (user && user.first_name) {
      return user.first_name;
    } else if (user && user.name) {
      return user.name.split(" ")[0];
    }
    return "utilisateur";
  };

  // Afficher les détails de l'action en cours
  const renderActionDetails = () => {
    if (!currentAction) return null;

    const { intent, params } = currentAction;

    return (
      <ActionCard>
        <ActionTitle>{getActionTitle(intent)}</ActionTitle>

        {intent.includes("SCHEDULE") && params.weekStart && (
          <ActionDetail>
            <span>Semaine du :</span>
            <span>{params.weekStart}</span>
          </ActionDetail>
        )}

        {intent.includes("VACATION") && params.startDate && params.endDate && (
          <>
            <ActionDetail>
              <span>Date de début :</span>
              <span>{params.startDate}</span>
            </ActionDetail>
            <ActionDetail>
              <span>Date de fin :</span>
              <span>{params.endDate}</span>
            </ActionDetail>
          </>
        )}

        {intent === "CREATE_VACATION_REQUEST" && params.type && (
          <ActionDetail>
            <span>Type de congé :</span>
            <span>
              {params.type === "vacation" && "Congés payés"}
              {params.type === "sick_leave" && "Arrêt maladie"}
              {params.type === "training" && "Formation"}
              {params.type === "family" && "Congé familial"}
              {params.type === "unpaid" && "Congé sans solde"}
            </span>
          </ActionDetail>
        )}

        {intent === "GET_STATS" && params.period && (
          <ActionDetail>
            <span>Période :</span>
            <span>
              {params.period === "week" && "Semaine"}
              {params.period === "month" && "Mois"}
              {params.period === "year" && "Année"}
            </span>
          </ActionDetail>
        )}

        {!actionResult && !isActionLoading && (
          <ActionsContainer>
            <ActionButton onClick={executeAction}>Confirmer</ActionButton>
            <ActionButton
              onClick={cancelAction}
              style={{
                backgroundColor: "transparent",
                color: "inherit",
                border: "1px solid #ddd",
              }}
            >
              Annuler
            </ActionButton>
          </ActionsContainer>
        )}

        {isActionLoading && (
          <div style={{ textAlign: "center", padding: "8px" }}>
            Traitement en cours...
          </div>
        )}

        {actionResult && (
          <ActionResult $success={actionResult.success}>
            {actionResult.message}
          </ActionResult>
        )}
      </ActionCard>
    );
  };

  /**
   * Gère l'acceptation du consentement RGPD
   */
  const handleConsentAccept = () => {
    setHasUserConsent(true);
    localStorage.setItem("chatbot_data_consent", "true");
    setShowConsentModal(false);

    // Activer automatiquement le mode personnalisé ou agent selon la demande
    if (!isPersonalizedMode && !isAgentMode) {
      setIsPersonalizedMode(true);

      setMessages((prev) => [
        ...prev,
        {
          text: "Merci d'avoir accepté le traitement de vos données. J'ai activé le mode personnalisé pour vous offrir une expérience sur mesure. Vous pouvez le désactiver à tout moment.",
          isUser: false,
        },
      ]);
    }
  };

  /**
   * Gère le refus du consentement RGPD
   */
  const handleConsentDecline = () => {
    setHasUserConsent(false);
    localStorage.setItem("chatbot_data_consent", "false");
    setShowConsentModal(false);

    // Désactiver le mode personnalisé ou agent si actif
    if (isPersonalizedMode || isAgentMode) {
      setIsPersonalizedMode(false);
      setIsAgentMode(false);

      setMessages((prev) => [
        ...prev,
        {
          text: "J'ai bien pris en compte votre refus. Je n'utiliserai pas vos données personnelles. Je reste disponible pour répondre à vos questions générales.",
          isUser: false,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          text: "J'ai bien pris en compte votre refus. Je reste disponible pour répondre à vos questions générales sans utiliser vos données personnelles.",
          isUser: false,
        },
      ]);
    }
  };

  // Si l'utilisateur n'est pas connecté ou si on est sur une page restreinte, ne pas afficher le chatbot
  if (!shouldShowChatbot()) {
    return null;
  }

  // Fonction pour afficher la progression de la création de planning
  const renderSchedulingProgress = () => {
    if (!schedulingInProgress) return null;

    const steps = [
      {
        key: "weekStart",
        label: "Date de début de semaine",
        completed: !!schedulingData.weekStart,
      },
      {
        key: "businessHours",
        label: "Horaires d'ouverture",
        completed: !!schedulingData.businessHours,
      },
      {
        key: "vacations",
        label: "Congés des employés",
        completed: schedulingData.constraints.includes("vacations"),
      },
      {
        key: "restPreferences",
        label: "Préférences de repos",
        completed: schedulingData.constraints.includes("rest_preferences"),
      },
      {
        key: "breakTimes",
        label: "Temps de pause",
        completed: !!schedulingData.breakTimes,
      },
    ];

    // Trouver l'étape active (la première qui n'est pas complétée)
    const activeStepIndex = steps.findIndex((step) => !step.completed);

    return (
      <SchedulingProgressContainer>
        <ProgressTitle>
          <span role="img" aria-label="Calendrier">
            📅
          </span>
          Création de planning en cours
        </ProgressTitle>
        <ProgressSteps>
          {steps.map((step, index) => (
            <ProgressStep
              key={step.key}
              completed={step.completed}
              active={index === activeStepIndex}
            >
              <StepIndicator
                completed={step.completed}
                active={index === activeStepIndex}
              >
                {step.completed ? "✓" : index + 1}
              </StepIndicator>
              {step.label}
            </ProgressStep>
          ))}
        </ProgressSteps>
      </SchedulingProgressContainer>
    );
  };

  return (
    <>
      {shouldShowChatbot() && (
        <ChatbotContainer>
          {showWelcome && !isOpen && (
            <WelcomeMessage>
              Bonjour {getUserFirstName()}, besoin d'aide ?
            </WelcomeMessage>
          )}

          {showHelpBubble && !isOpen && (
            <HelpBubble $show={showHelpBubble}>
              Bonjour {getUserFirstName()} !
            </HelpBubble>
          )}

          {isOpen && (
            <ChatWindow>
              <ChatHeader>
                <ChatTitle>
                  <Lottie
                    animationData={robotAnimation}
                    style={{ width: 30, height: 30 }}
                  />
                  Assistant IA
                </ChatTitle>

                <ModeToggleContainer>
                  <ModeButton
                    active={isPersonalizedMode}
                    mode="personalized"
                    onClick={togglePersonalizedMode}
                  >
                    <span role="img" aria-label="Personnalisé">
                      👤
                    </span>{" "}
                    Personnalisé
                  </ModeButton>

                  <ModeButton
                    active={isAgentMode}
                    mode="agent"
                    onClick={toggleAgentMode}
                  >
                    <span role="img" aria-label="Agent">
                      🤖
                    </span>{" "}
                    Agent
                  </ModeButton>
                </ModeToggleContainer>

                <CloseButton onClick={toggleChat}>
                  <FaTimes />
                </CloseButton>
              </ChatHeader>

              <ChatMessages>
                {messages.map((msg, index) => (
                  <Message
                    key={index}
                    isUser={msg.isUser}
                    personalized={!msg.isUser && isPersonalizedMode}
                    agent={!msg.isUser && isAgentMode}
                  >
                    {!msg.isUser &&
                      index > 0 &&
                      (isPersonalizedMode || isAgentMode) && (
                        <ModeBadge
                          mode={isPersonalizedMode ? "personalized" : "agent"}
                        >
                          {isPersonalizedMode ? (
                            <>
                              <span role="img" aria-label="Personnalisé">
                                👤
                              </span>{" "}
                              Mode Personnalisé
                            </>
                          ) : (
                            <>
                              <span role="img" aria-label="Agent">
                                🤖
                              </span>{" "}
                              Mode Agent
                            </>
                          )}
                        </ModeBadge>
                      )}
                    {msg.text}
                  </Message>
                ))}

                {/* Afficher la progression de création de planning si en mode agent */}
                {isAgentMode &&
                  schedulingInProgress &&
                  renderSchedulingProgress()}

                {isLoading && (
                  <Message
                    isUser={false}
                    personalized={isPersonalizedMode}
                    agent={isAgentMode}
                  >
                    <LoadingIndicator>
                      <Dot />
                      <Dot />
                      <Dot />
                    </LoadingIndicator>
                  </Message>
                )}
                <div ref={messagesEndRef} />
              </ChatMessages>

              {currentAction && actionResult && renderActionDetails()}

              <ChatInputContainer onSubmit={handleSubmit}>
                <ChatInput
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    schedulingInProgress
                      ? "Répondez à la question pour créer le planning..."
                      : currentAction
                      ? currentAction.intent === "WAITING_FOR_SIMULATION"
                        ? "Voulez-vous une simulation ? (oui/non)"
                        : "Confirmez-vous cette action ? (oui/non)"
                      : isAgentMode
                      ? "Demandez 'Créer un planning', 'Vérifier les congés'..."
                      : isPersonalizedMode
                      ? "Ex: 'Mes prochains congés', 'Mon planning de la semaine'..."
                      : "Comment puis-je vous aider aujourd'hui ?"
                  }
                  ref={inputRef}
                  disabled={isActionLoading}
                />
                <SendButton type="submit" disabled={isActionLoading}>
                  {isActionLoading ? <Spinner /> : <FaPaperPlane />}
                </SendButton>
              </ChatInputContainer>
            </ChatWindow>
          )}

          <RobotButton
            onClick={toggleChat}
            title="Assistant IA"
            onMouseEnter={() => !isOpen && setShowWelcome(true)}
            onMouseLeave={() => setShowWelcome(false)}
          >
            <div style={{ width: 40, height: 40 }}>
              <Lottie animationData={robotAnimation} loop={true} />
            </div>
          </RobotButton>

          {/* Modals et bulles d'aide */}
          {showConsentModal && (
            <ConsentModal
              onAccept={handleConsentAccept}
              onDecline={handleConsentDecline}
            />
          )}
        </ChatbotContainer>
      )}
    </>
  );
};

export default Chatbot;
