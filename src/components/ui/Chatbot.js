import Lottie from "lottie-react";
import { useEffect, useRef, useState } from "react";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import styled, { css, keyframes } from "styled-components";
import robotAnimation from "../../assets/animations/robot.json";
import { useAuth } from "../../contexts/AuthContext";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

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

const blinkCaret = keyframes`
  from, to { border-color: transparent }
  50% { border-color: #2b5797 }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
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
`;

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
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

  ${({ isUser, theme }) =>
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
          background: linear-gradient(135deg, #3a6fc7 0%, #2b5797 100%);
          color: white;
          border-bottom-left-radius: 5px;
          animation: ${fadeInLeft} 0.3s ease-out;

          &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              to right,
              transparent 0%,
              rgba(255, 255, 255, 0.2) 50%,
              transparent 100%
            );
            background-size: 200px 100%;
            animation: ${shimmer} 2s infinite;
            border-radius: inherit;
            pointer-events: none;
          }
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

const SettingsButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  margin-right: 10px;
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

const ApiKeyInput = styled.input`
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 5px;
  font-size: 14px;
  width: 100%;
`;

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

const EmojiWrapper = styled.span`
  display: inline-block;
  margin: 0 2px;
  animation: ${pulse} 1s infinite ease-in-out;
`;

const TypingIndicator = styled.div`
  display: inline-block;
  width: 50px;
  height: 12px;
  position: relative;

  &::after {
    content: "...";
    position: absolute;
    animation: ${typing} 1s steps(3, end) infinite;
    white-space: nowrap;
    overflow: hidden;
  }
`;

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState("Mtj4YyKWVol6Km2iLeCCtAF4Y1nNlbbE");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  // État pour le consentement RGPD
  const [hasUserConsent, setHasUserConsent] = useState(
    localStorage.getItem("chatbot_data_consent") === "true"
  );
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Stocker les préférences dans localStorage
  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    if (user && !localStorage.getItem("chatbot_data_consent")) {
      setShowConsentModal(true);
    }
  }, [user]);

  // Faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mettre le focus sur l'input lorsque le chat s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);

  // Masquer le message de bienvenue après 5 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowWelcome(false);

    // Ajouter un message de bienvenue si c'est la première ouverture
    if (!isOpen && messages.length === 0) {
      setMessages([
        {
          text: `👋 Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?`,
          isUser: false,
        },
      ]);
    }
  };

  // Réponses prédéfinies pour le mode local
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

  // Fonction pour obtenir une réponse locale basée sur les mots-clés
  const getLocalResponse = (query) => {
    const normalizedQuery = query.toLowerCase().trim();

    // Vérifier les correspondances exactes
    for (const [keyword, response] of Object.entries(localResponses)) {
      if (normalizedQuery.includes(keyword)) {
        return response;
      }
    }

    // Réponses pour des questions spécifiques
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

    // Réponse par défaut si aucune correspondance n'est trouvée
    return "Je ne suis pas sûr de comprendre votre demande. Pourriez-vous reformuler ou me demander de l'aide sur la gestion des plannings, des employés ou des congés ?";
  };

  // Fonction pour obtenir des informations personnalisées sur l'utilisateur (conforme RGPD)
  const getUserPersonalizedInfo = () => {
    // Ne retourner des informations personnelles que si le consentement a été donné
    if (!hasUserConsent || !user) return null;

    return {
      nom: user.lastName || user.last_name || "",
      prenom: user.firstName || user.first_name || "",
      email: user.email || "",
      role: user.role || "",
      // Autres données personnelles disponibles dans le contexte utilisateur
    };
  };

  // Fonction pour ajouter des emojis aux réponses du bot
  const enhanceResponseWithEmojis = (response) => {
    // Ajouter des emojis aux salutations
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

    // Ajouter une touche d'humour et de professionnalisme
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage = { text: inputValue, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    const userQuery = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // Ajouter un message de chargement
      setMessages((prev) => [
        ...prev,
        {
          text: "Je réfléchis...",
          isUser: false,
          isLoading: true,
        },
      ]);

      let botResponse = "";

      // Obtenir les informations personnalisées si le consentement a été donné
      const userInfo = getUserPersonalizedInfo();

      // Appel à l'API Mistral.ai
      try {
        const systemMessage = `Tu es un assistant virtuel pour une application de gestion de planning nommée Smart Planning. Réponds de manière concise, professionnelle mais avec une légère touche d'humour. Ton nom est Assistant IA. Tu dois aider les utilisateurs à comprendre comment utiliser l'application, gérer les plannings, les employés et les congés.${
          userInfo
            ? `\n\nInformations sur l'utilisateur actuel (à utiliser uniquement si pertinent pour répondre à la question) :\nNom: ${userInfo.nom}\nPrénom: ${userInfo.prenom}\nEmail: ${userInfo.email}\nRôle: ${userInfo.role}`
            : ""
        }`;

        const response = await fetch(
          "https://api.mistral.ai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "mistral-small-latest",
              messages: [
                {
                  role: "system",
                  content: systemMessage,
                },
                {
                  role: "user",
                  content: userQuery,
                },
              ],
              temperature: 0.7,
              max_tokens: 800,
            }),
          }
        );

        if (!response.ok) {
          console.error("Erreur API Mistral, utilisation du mode local");
          botResponse = getLocalResponse(userQuery);
        } else {
          const data = await response.json();
          console.log("Réponse API Mistral:", data);
          botResponse =
            data.choices?.[0]?.message?.content ||
            "Désolé, je n'ai pas pu traiter votre demande.";
        }
      } catch (apiError) {
        console.error("Erreur lors de l'appel à Mistral.ai:", apiError);
        botResponse = getLocalResponse(userQuery);
      }

      // Améliorer la réponse avec des emojis et une touche d'humour
      botResponse = enhanceResponseWithEmojis(botResponse);

      // Supprimer le message de chargement
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
      setIsLoading(false);

      // Ajouter la réponse du bot
      setMessages((prev) => [
        ...prev,
        {
          text: botResponse,
          isUser: false,
        },
      ]);
    } catch (error) {
      // Supprimer le message de chargement
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
      setIsLoading(false);

      console.error("Erreur:", error);

      // Utiliser le mode local en cas d'erreur
      let localResponse = getLocalResponse(userQuery);
      localResponse = enhanceResponseWithEmojis(localResponse);

      setMessages((prev) => [
        ...prev,
        {
          text: localResponse,
          isUser: false,
        },
      ]);
    }
  };

  const handleApiKeySave = (e) => {
    e.preventDefault();
    setShowApiKeyModal(false);
  };

  // Gérer le consentement RGPD
  const handleConsentAccept = () => {
    localStorage.setItem("chatbot_data_consent", "true");
    setHasUserConsent(true);
    setShowConsentModal(false);

    // Message de confirmation
    setMessages((prev) => [
      ...prev,
      {
        text: "✅ Merci d'avoir accepté l'utilisation de vos données personnelles. Je pourrai ainsi vous fournir des réponses plus personnalisées.",
        isUser: false,
      },
    ]);
  };

  const handleConsentDecline = () => {
    localStorage.setItem("chatbot_data_consent", "false");
    setHasUserConsent(false);
    setShowConsentModal(false);

    // Message d'information
    setMessages((prev) => [
      ...prev,
      {
        text: "ℹ️ Vous avez choisi de ne pas partager vos données personnelles. Je vous fournirai des réponses génériques. Vous pouvez changer ce paramètre à tout moment.",
        isUser: false,
      },
    ]);
  };

  const togglePersonalizedMode = () => {
    const newState = !hasUserConsent;
    localStorage.setItem("chatbot_data_consent", newState.toString());
    setHasUserConsent(newState);

    // Message de confirmation du changement
    setMessages((prev) => [
      ...prev,
      {
        text: newState
          ? "✅ Mode personnalisé activé. Je pourrai utiliser vos informations pour des réponses plus adaptées."
          : "ℹ️ Mode personnalisé désactivé. Je ne tiendrai plus compte de vos informations personnelles.",
        isUser: false,
      },
    ]);
  };

  const getUserFirstName = () => {
    if (user && user.firstName) {
      return user.firstName;
    } else if (user && user.first_name) {
      return user.first_name;
    }
    return "utilisateur";
  };

  return (
    <ChatbotContainer>
      {showWelcome && !isOpen && (
        <WelcomeMessage>
          Bonjour {getUserFirstName()}, besoin d'aide ?
        </WelcomeMessage>
      )}

      {isOpen && (
        <ChatWindow>
          <ChatHeader>
            <ChatTitle>
              <div style={{ width: 30, height: 30 }}>
                <Lottie animationData={robotAnimation} loop={true} />
              </div>
              Assistant IA
              <ToggleButton
                active={hasUserConsent}
                onClick={togglePersonalizedMode}
                title={
                  hasUserConsent
                    ? "Désactiver le mode personnalisé"
                    : "Activer le mode personnalisé"
                }
              >
                {hasUserConsent ? "Personnalisé" : "Standard"}
              </ToggleButton>
            </ChatTitle>
            <div>
              <CloseButton onClick={toggleChat}>
                <FaTimes />
              </CloseButton>
            </div>
          </ChatHeader>

          <ChatMessages>
            {messages.map((message, index) => (
              <Message key={index} isUser={message.isUser}>
                {message.isLoading ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div style={{ width: 20, height: 20 }}>
                      <Lottie
                        animationData={robotAnimation}
                        loop={true}
                        style={{ margin: 0 }}
                      />
                    </div>
                    <TypingIndicator />
                  </div>
                ) : (
                  message.text
                )}
              </Message>
            ))}
            <div ref={messagesEndRef} />
          </ChatMessages>

          <ChatInputContainer onSubmit={handleSubmit}>
            <ChatInput
              ref={inputRef}
              type="text"
              placeholder="Tapez votre message ici..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <SendButton
              type="submit"
              disabled={!inputValue.trim() || isLoading}
            >
              <FaPaperPlane />
            </SendButton>
          </ChatInputContainer>

          {showConsentModal && (
            <ApiKeyModal>
              <ApiKeyForm onSubmit={(e) => e.preventDefault()}>
                <h3>Consentement RGPD</h3>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.5",
                    color: "#333",
                    fontWeight: "500",
                  }}
                >
                  Pour vous fournir des réponses personnalisées, l'assistant
                  peut accéder à certaines de vos données personnelles (nom,
                  prénom, email, rôle).
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.5",
                    color: "#333",
                    fontWeight: "500",
                  }}
                >
                  Conformément au RGPD, nous avons besoin de votre consentement
                  explicite. Vous pouvez le retirer à tout moment.
                </p>
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "15px" }}
                >
                  <ApiKeyButton
                    type="button"
                    onClick={handleConsentDecline}
                    style={{ backgroundColor: "#6c757d" }}
                  >
                    Refuser
                  </ApiKeyButton>
                  <ApiKeyButton
                    type="button"
                    onClick={handleConsentAccept}
                    style={{ backgroundColor: "#2b5797" }}
                  >
                    Accepter
                  </ApiKeyButton>
                </div>
              </ApiKeyForm>
            </ApiKeyModal>
          )}
        </ChatWindow>
      )}

      <RobotButton onClick={toggleChat}>
        <div style={{ width: 50, height: 50 }}>
          <Lottie animationData={robotAnimation} loop={true} />
        </div>
      </RobotButton>
    </ChatbotContainer>
  );
};

export default Chatbot;
