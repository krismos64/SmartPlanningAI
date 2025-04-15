import io from "socket.io-client";
import { getApiUrl } from "../utils/api";

let socket = null;
let userToken = null; // Stocker le token utilisé pour l'initialisation

/**
 * Récupère l'instance de la socket existante
 * @returns {object|null} L'instance de la socket ou null si pas encore initialisée
 */
export const getSocket = () => {
  return socket;
};

/**
 * Initialise la connexion WebSocket
 * @param {string} token Token d'authentification
 * @returns {object|null} L'instance de la socket
 */
export const initializeSocket = (token) => {
  // Si le socket existe déjà et que le token est le même, réutiliser la socket existante
  if (socket && token === userToken && socket.connected) {
    console.log("Socket déjà initialisée avec le même token, réutilisation");
    return socket;
  }

  // Stocker le token pour pouvoir comparer lors des futures initialisations
  userToken = token;

  try {
    const API_URL = getApiUrl();
    console.log(`Initialisation de la connexion WebSocket vers ${API_URL}...`);

    // Configuration de la socket avec authentification et gestion des erreurs améliorée
    const socketOptions = {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: false, // Important: ne pas se connecter automatiquement
      reconnectionAttempts: 5, // Limiter les tentatives de reconnexion
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      auth: {
        token,
      },
      query: {
        token,
      },
    };

    // Créer une nouvelle instance socket
    socket = io(API_URL, socketOptions);

    // Gérer les événements de connexion
    socket.on("connect", () => {
      console.log("WebSocket connecté avec succès");
    });

    socket.on("connect_error", (error) => {
      console.error("Erreur de connexion WebSocket:", error.message);

      // Si l'erreur est liée à l'authentification, ne pas réessayer automatiquement
      if (error.message.includes("auth") || error.message.includes("token")) {
        console.error(
          "Erreur d'authentification WebSocket - arrêt des tentatives de reconnexion"
        );
        socket.disconnect();
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`WebSocket déconnecté: ${reason}`);

      // Si déconnexion due à une erreur d'authentification, ne pas tenter de se reconnecter
      if (reason === "io server disconnect") {
        console.log(
          "Déconnexion du serveur - tentative de reconnexion désactivée"
        );
      }
    });

    socket.on("error", (error) => {
      console.error("Erreur WebSocket:", error);
    });

    return socket;
  } catch (error) {
    console.error("Erreur lors de l'initialisation du WebSocket:", error);
    socket = null;
    return null;
  }
};

/**
 * Réinitialise la connexion WebSocket avec un nouveau token
 * @param {string} token Nouveau token d'authentification
 * @returns {object|null} La nouvelle instance de socket
 */
export const reinitializeSocket = (token) => {
  console.log(
    "Réinitialisation de la connexion WebSocket avec un nouveau token"
  );

  // Fermer proprement la connexion existante si elle existe
  if (socket) {
    socket.disconnect();
    socket.close();
  }

  // Effacer la référence à l'ancienne socket
  socket = null;

  // Initialiser une nouvelle connexion avec le nouveau token
  return initializeSocket(token);
};

/**
 * Émet un événement sur la socket
 * @param {string} event Nom de l'événement
 * @param {object} data Données à envoyer
 * @returns {boolean} true si l'événement a été émis avec succès
 */
export const emitEvent = (event, data) => {
  if (!socket || !socket.connected) {
    console.warn(
      `Socket non connectée, impossible d'émettre l'événement ${event}`
    );
    return false;
  }

  try {
    socket.emit(event, data);
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'émission de l'événement ${event}:`, error);
    return false;
  }
};

export default {
  getSocket,
  initializeSocket,
  reinitializeSocket,
  emitEvent,
};
