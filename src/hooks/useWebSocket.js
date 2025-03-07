import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook personnalisé pour gérer une connexion WebSocket
 * @param {string} url - URL du serveur WebSocket
 * @returns {Object} - Objet contenant le socket, les messages et des fonctions utilitaires
 */
const useWebSocket = (url = `ws://${window.location.hostname}:5001`) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);
  // Mode de secours intelligent - activé par défaut, mais peut être désactivé si le WebSocket fonctionne
  const [fallbackMode, setFallbackMode] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 5000; // 5 secondes
  const CONNECTION_TIMEOUT = 5000; // 5 secondes
  const { user } = useAuth();
  const wsServerAvailableRef = useRef(true);

  // Fonction pour se connecter au serveur WebSocket
  const connect = useCallback(() => {
    // Ne pas tenter de se connecter si nous sommes en mode de secours permanent
    if (fallbackMode || !wsServerAvailableRef.current) {
      console.log(
        "Mode de secours actif ou serveur indisponible, connexion WebSocket ignorée"
      );
      return null;
    }

    try {
      console.log("Tentative de connexion WebSocket à:", url);
      const ws = new WebSocket(url);

      // Définir un timeout pour la connexion
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log("Timeout de connexion WebSocket");
          ws.close();
        }
      }, CONNECTION_TIMEOUT);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log("WebSocket connecté");
        setIsConnected(true);
        setSocket(ws);
        reconnectAttemptsRef.current = 0;
        wsServerAvailableRef.current = true;

        // Envoyer un message d'identification au serveur
        if (user && user.id) {
          try {
            ws.send(
              JSON.stringify({
                type: "IDENTIFY",
                userId: user.id,
                timestamp: new Date().toISOString(),
              })
            );
          } catch (error) {
            console.error(
              "Erreur lors de l'envoi du message d'identification:",
              error
            );
          }
        }

        // Demander les dernières activités
        try {
          ws.send(
            JSON.stringify({
              type: "REQUEST_ACTIVITIES",
              timestamp: new Date().toISOString(),
            })
          );
        } catch (error) {
          console.error("Erreur lors de la demande d'activités:", error);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Message WebSocket reçu:", data);

          // Ajouter le message à la liste des messages
          setMessages((prevMessages) => [...prevMessages, data]);

          // Traiter les différents types de messages
          if (data.type === "NEW_ACTIVITY" && data.activity) {
            setActivities((prevActivities) => {
              // S'assurer que prevActivities est un tableau
              const prevActivitiesArray = Array.isArray(prevActivities)
                ? prevActivities
                : [];

              // Vérifier si l'activité existe déjà
              const exists = prevActivitiesArray.some(
                (activity) => activity.id === data.activity.id
              );

              if (!exists) {
                return [data.activity, ...prevActivitiesArray];
              }
              return prevActivitiesArray;
            });
          } else if (
            (data.type === "ACTIVITIES_LIST" &&
              Array.isArray(data.activities)) ||
            (data.type === "ACTIVITIES" && Array.isArray(data.data))
          ) {
            // Traiter à la fois ACTIVITIES_LIST et ACTIVITIES
            const activitiesData =
              data.type === "ACTIVITIES" ? data.data : data.activities;
            console.log(
              `Reçu ${activitiesData.length} activités via WebSocket`
            );
            setActivities(activitiesData || []);
          } else if (data.type === "DATA_UPDATED") {
            // Demander les dernières activités lorsque les données sont mises à jour
            try {
              ws.send(
                JSON.stringify({
                  type: "REQUEST_ACTIVITIES",
                  timestamp: new Date().toISOString(),
                })
              );
            } catch (error) {
              console.error(
                "Erreur lors de la demande d'activités après mise à jour:",
                error
              );
            }
          }
        } catch (error) {
          console.error(
            "Erreur lors du traitement du message WebSocket:",
            error
          );
        }
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log(
          `WebSocket déconnecté: ${event.code} ${event.reason || ""}`
        );
        setIsConnected(false);
        setSocket(null);

        // Tenter de se reconnecter si la connexion a été perdue de manière inattendue
        // et que nous ne sommes pas en mode de secours permanent
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          console.log(
            `Tentative de reconnexion dans ${
              RECONNECT_INTERVAL / 1000
            } secondes... (tentative ${
              reconnectAttemptsRef.current + 1
            }/${MAX_RECONNECT_ATTEMPTS})`
          );

          // Nettoyer tout timeout existant
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, RECONNECT_INTERVAL);
        } else {
          console.log(
            `Passage en mode de secours permanent après ${MAX_RECONNECT_ATTEMPTS} tentatives`
          );
          setFallbackMode(true);
          wsServerAvailableRef.current = false;
        }
      };

      ws.onerror = (error) => {
        console.error("Erreur WebSocket:", error);
        // Ne pas fermer la connexion ici, laissez onclose s'en charger
        reconnectAttemptsRef.current += 1;

        if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          console.log("Trop d'erreurs, passage en mode de secours permanent");
          setFallbackMode(true);
          wsServerAvailableRef.current = false;
        }
      };

      return ws;
    } catch (error) {
      console.error("Erreur lors de la création du WebSocket:", error);
      return null;
    }
  }, [url, user, fallbackMode]);

  // Fonction pour envoyer un message au serveur WebSocket
  const sendMessage = useCallback(
    (data) => {
      if (fallbackMode || !wsServerAvailableRef.current) {
        console.log(
          "Mode de secours actif ou serveur non disponible, message non envoyé:",
          data
        );
        return false;
      }

      if (socket && isConnected) {
        try {
          socket.send(JSON.stringify(data));
          return true;
        } catch (error) {
          console.error("Erreur lors de l'envoi du message WebSocket:", error);
          return false;
        }
      }
      return false;
    },
    [socket, isConnected, fallbackMode]
  );

  // Fonction pour demander une mise à jour des activités
  const requestActivitiesUpdate = useCallback(() => {
    if (fallbackMode || !wsServerAvailableRef.current) {
      console.log(
        "Mode de secours actif ou serveur non disponible, pas de demande d'activités via WebSocket"
      );
      return false;
    }

    if (socket && isConnected) {
      try {
        socket.send(
          JSON.stringify({
            type: "REQUEST_ACTIVITIES",
            timestamp: new Date().toISOString(),
          })
        );
        return true;
      } catch (error) {
        console.error(
          "Erreur lors de la demande de mise à jour des activités:",
          error
        );
        return false;
      }
    }
    return false;
  }, [socket, isConnected, fallbackMode]);

  // Fonction pour notifier le serveur d'une modification des données
  const notifyDataChange = useCallback(
    (dataType, action, entityId) => {
      if (fallbackMode || !wsServerAvailableRef.current) {
        console.log(
          "Mode de secours actif ou serveur non disponible, pas de notification de changement via WebSocket"
        );
        return false;
      }

      if (socket && isConnected) {
        try {
          socket.send(
            JSON.stringify({
              type: "DATA_CHANGED",
              dataType, // 'employee', 'schedule', 'leave', 'profile', 'settings', etc.
              action, // 'create', 'update', 'delete'
              entityId,
              timestamp: new Date().toISOString(),
            })
          );
          return true;
        } catch (error) {
          console.error(
            "Erreur lors de la notification de changement de données:",
            error
          );
          return false;
        }
      }
      return false;
    },
    [socket, isConnected, fallbackMode]
  );

  // Fonction pour se déconnecter manuellement
  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setSocket(null);
  }, [socket]);

  // Fonction pour réinitialiser le mode de secours et tenter une nouvelle connexion
  const resetFallbackMode = useCallback(() => {
    setFallbackMode(false);
    reconnectAttemptsRef.current = 0;
    wsServerAvailableRef.current = false;
    connect();
  }, [connect]);

  // Nettoyer lors du démontage du composant
  useEffect(() => {
    // Tentative de connexion initiale
    if (!socket && !fallbackMode) {
      console.log("Tentative de connexion WebSocket initiale...");
      const newSocket = connect();
      if (newSocket) {
        setSocket(newSocket);
      }
    }

    // Nettoyage lors du démontage
    return () => {
      if (socket) {
        console.log("Nettoyage de la connexion WebSocket");
        socket.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect, fallbackMode, socket]);

  // Reconnecter lorsque l'utilisateur change, sauf en mode de secours permanent
  useEffect(() => {
    if (user && !fallbackMode) {
      // Réinitialiser les tentatives de reconnexion
      const userChangeTimeout = setTimeout(() => {
        reconnectAttemptsRef.current = 0;
        connect();
      }, 1000);

      return () => clearTimeout(userChangeTimeout);
    }
  }, [user, connect, fallbackMode]);

  // Ajouter un gestionnaire d'événements pour détecter les rechargements de page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Envoyer un message de déconnexion propre
      if (socket && isConnected) {
        try {
          socket.send(
            JSON.stringify({
              type: "DISCONNECT",
              timestamp: new Date().toISOString(),
            })
          );
        } catch (error) {
          console.error(
            "Erreur lors de l'envoi du message de déconnexion:",
            error
          );
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket, isConnected]);

  // Fonction pour effacer les messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Afficher un message dans la console pour indiquer le mode actuel
  useEffect(() => {
    if (fallbackMode) {
      console.log(
        "WebSocket en mode de secours. Utilisation de l'API REST pour les activités."
      );
    } else {
      console.log(
        "WebSocket en mode actif. Tentative de connexion en temps réel."
      );
    }
  }, [fallbackMode]);

  return {
    socket,
    isConnected,
    messages,
    activities,
    sendMessage,
    disconnect,
    connect,
    clearMessages,
    requestActivitiesUpdate,
    notifyDataChange,
    fallbackMode,
    resetFallbackMode,
  };
};

export default useWebSocket;
