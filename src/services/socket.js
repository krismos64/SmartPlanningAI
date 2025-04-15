import io from "socket.io-client";
import { API_URL } from "../config/api";

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
 * @param {string} namespace Namespace optionnel (par défaut: "")
 * @returns {object|null} L'instance de la socket
 */
export const initializeSocket = (token, namespace = "") => {
  // Si le socket existe déjà et que le token est le même, réutiliser la socket existante
  if (socket && token === userToken && socket.connected) {
    console.log("Socket déjà initialisée avec le même token, réutilisation");
    return socket;
  }

  // Stocker le token pour pouvoir comparer lors des futures initialisations
  userToken = token;

  try {
    // Obtenir l'URL de base sans le préfixe /api
    const baseUrl =
      API_URL || process.env.REACT_APP_API_URL || window.location.origin;

    // S'assurer que l'URL ne contient pas /api
    const cleanBaseUrl = baseUrl.replace(/\/api\/?$/, "");

    console.log(`⚡ Initialisation WebSocket vers: ${cleanBaseUrl}`);

    // Si un namespace est fourni, s'assurer qu'il est bien formaté
    let namespaceUrl = cleanBaseUrl;
    if (namespace) {
      // S'assurer que le namespace commence par un slash
      const formattedNamespace = namespace.startsWith("/")
        ? namespace
        : `/${namespace}`;
      console.log(`🔌 WebSocket avec namespace: ${formattedNamespace}`);
      namespaceUrl = `${cleanBaseUrl}${formattedNamespace}`;
    }

    // Configuration de la socket avec authentification et gestion des erreurs améliorée
    const socketOptions = {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true, // Se connecter automatiquement
      reconnection: true, // Activer la reconnexion automatique
      reconnectionAttempts: 10, // Augmenter les tentatives de reconnexion
      reconnectionDelay: 1000, // Commencer avec un délai court
      reconnectionDelayMax: 10000, // Augmenter progressivement jusqu'à 10s max
      timeout: 20000, // Augmenter le timeout pour les connexions lentes
      auth: {
        token,
      },
      query: {
        token,
      },
    };

    // Créer une nouvelle instance socket
    socket = io(namespaceUrl, socketOptions);

    // Gérer les événements de connexion
    socket.on("connect", () => {
      const transport = socket.io.engine.transport.name; // websocket ou polling
      console.log(`WebSocket connecté avec succès via ${transport}`);
      console.log(`Socket ID: ${socket.id}`);
      console.log(`Namespace: ${socket.nsp}`);
    });

    socket.on("connect_error", (error) => {
      console.error("Erreur de connexion WebSocket:", error.message);
      console.error("Détails de la connexion:", {
        url: namespaceUrl,
        namespace: namespace || "racine",
        authPresent: !!token,
        tokenLength: token ? token.length : 0,
      });

      // Logique de reconnexion personnalisée - réessayer avec un délai croissant
      if (!socket.retryCount) {
        socket.retryCount = 0;
      }

      socket.retryCount++;
      const delay = Math.min(1000 * socket.retryCount, 10000); // Max 10s

      console.log(
        `Tentative de reconnexion dans ${delay / 1000}s (${
          socket.retryCount
        }/10)...`
      );

      setTimeout(() => {
        if (socket && !socket.connected) {
          console.log("Tentative de reconnexion WebSocket...");
          socket.connect();
        }
      }, delay);

      // Si l'erreur mentionne un namespace invalide
      if (
        error.message.includes("namespace") ||
        error.message.includes("Invalid namespace")
      ) {
        console.error(
          "Erreur de namespace - vérifiez que le namespace existe côté serveur"
        );
      }

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

      // Réinitialiser le compteur de tentatives lors d'une déconnexion
      socket.retryCount = 0;

      // Si déconnexion due à une erreur d'authentification, ne pas tenter de se reconnecter
      if (reason === "io server disconnect") {
        console.log(
          "Déconnexion du serveur - tentative de reconnexion manuelle dans 5s"
        );
        // Attendre 5s puis tenter une reconnexion
        setTimeout(() => {
          if (socket) {
            console.log("Tentative de reconnexion après déconnexion serveur");
            socket.connect();
          }
        }, 5000);
      }
    });

    socket.on("error", (error) => {
      console.error("Erreur WebSocket:", error);
      // Tenter de réinitialiser la connexion
      socket.disconnect();
      setTimeout(() => socket.connect(), 3000);
    });

    // Journaliser les tentatives de reconnexion
    socket.io.on("reconnect_attempt", (attempt) => {
      console.log(`Tentative de reconnexion WebSocket #${attempt}`);
    });

    socket.io.on("reconnect", (attempt) => {
      console.log(`WebSocket reconnecté après ${attempt} tentatives`);
      socket.retryCount = 0; // Réinitialiser le compteur après reconnexion réussie
    });

    socket.io.on("reconnect_error", (error) => {
      console.error("Erreur de reconnexion WebSocket:", error);
    });

    socket.io.on("reconnect_failed", () => {
      console.error("Toutes les tentatives de reconnexion ont échoué");
      // Tentative de récupération finale
      setTimeout(() => {
        console.log("Tentative finale de récupération de la connexion socket");
        reinitializeSocket(token, namespace);
      }, 10000);
    });

    // Surveillant de ping/pong pour détecter les déconnexions silencieuses
    const pingInterval = setInterval(() => {
      if (socket && socket.connected) {
        socket.emit("ping", Date.now(), (pongTime) => {
          const latency = Date.now() - pongTime;
          console.log(`WebSocket latence: ${latency}ms`);
        });
      } else if (socket) {
        console.warn(
          "Socket non connectée lors du ping, tentative de reconnexion"
        );
        socket.connect();
      }
    }, 30000); // Vérifier toutes les 30 secondes

    // Nettoyage de l'intervalle quand la socket est détruite
    socket.on("destroy", () => {
      clearInterval(pingInterval);
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
 * @param {string} namespace Namespace optionnel (par défaut: "")
 * @returns {object|null} La nouvelle instance de socket
 */
export const reinitializeSocket = (token, namespace = "") => {
  console.log(
    `Réinitialisation de la connexion WebSocket avec un nouveau token${
      namespace ? ` et namespace ${namespace}` : ""
    }`
  );

  // Fermer proprement la connexion existante si elle existe
  if (socket) {
    // Ajouter un handler pour la déconnexion
    socket.once("disconnect", () => {
      console.log("Socket déconnectée avec succès avant réinitialisation");
      // Réinitialiser la référence à l'ancienne socket
      socket = null;
      // Initialiser une nouvelle connexion avec le nouveau token
      setTimeout(() => initializeSocket(token, namespace), 500);
    });

    // Émettre un événement custom avant de déconnecter
    socket.emit("destroy");
    socket.disconnect();

    // Par sécurité, si la déconnexion ne se produit pas rapidement
    setTimeout(() => {
      if (socket) {
        console.log("Forçage de la réinitialisation du socket");
        socket = null;
        initializeSocket(token, namespace);
      }
    }, 1000);

    return null; // La nouvelle socket sera créée de façon asynchrone
  } else {
    // Initialiser une nouvelle connexion avec le nouveau token
    return initializeSocket(token, namespace);
  }
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

    // Si le socket existe mais n'est pas connecté, tenter de le reconnecter
    if (socket && !socket.connected && userToken) {
      console.log("Tentative de reconnexion avant d'émettre l'événement");
      socket.connect();

      // Réessayer d'émettre l'événement après un court délai
      setTimeout(() => {
        if (socket && socket.connected) {
          try {
            socket.emit(event, data);
            console.log(`Événement ${event} émis après reconnexion`);
          } catch (retryError) {
            console.error(
              `Erreur lors de la réémission de l'événement ${event}:`,
              retryError
            );
          }
        }
      }, 1000);
    }

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
