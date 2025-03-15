import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "../config/api";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook personnalisé pour gérer une connexion WebSocket
 * @param {string} url - URL du serveur WebSocket
 * @returns {Object} - Objet contenant le socket, les messages et des fonctions utilitaires
 */
const useWebSocket = (customUrl = null) => {
  // Construire l'URL WebSocket à partir de l'URL de l'API
  const defaultUrl = API_URL.replace(/^http/, "ws");
  const url = customUrl || defaultUrl;

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);
  // Mode de secours intelligent - activé par défaut, mais peut être désactivé si le WebSocket fonctionne
  const [fallbackMode, setFallbackMode] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 2; // Réduire encore plus le nombre de tentatives
  const RECONNECT_INTERVAL = 20000; // Augmenter à 20 secondes
  const CONNECTION_TIMEOUT = 25000; // Augmenter le timeout à 25 secondes
  const { user } = useAuth();
  const wsServerAvailableRef = useRef(true);
  const pingIntervalRef = useRef(null);
  const PING_INTERVAL = 60000; // Augmenter l'intervalle de ping à 60 secondes
  const pongTimeoutRef = useRef(null);
  const PONG_TIMEOUT = 25000; // 25 secondes d'attente pour un PONG
  const lastPongRef = useRef(Date.now());
  const isCleaningUpRef = useRef(false); // État pour éviter les nettoyages multiples
  const isComponentMountedRef = useRef(true); // État pour suivre si le composant est monté
  const socketInstanceRef = useRef(null); // Référence pour stocker l'instance du socket

  // Fonction pour se connecter au serveur WebSocket
  const connect = useCallback(() => {
    // Ne pas tenter de se connecter si nous sommes en mode de secours permanent
    // ou si un nettoyage est en cours ou si le composant est démonté
    // ou si nous avons déjà une connexion active
    if (
      fallbackMode ||
      !wsServerAvailableRef.current ||
      isCleaningUpRef.current ||
      !isComponentMountedRef.current ||
      (socketInstanceRef.current &&
        socketInstanceRef.current.readyState === WebSocket.OPEN)
    ) {
      console.log(
        "Connexion WebSocket ignorée: mode de secours actif, serveur indisponible, nettoyage en cours, composant démonté ou connexion déjà active"
      );
      return null;
    }

    try {
      console.log("Tentative de connexion WebSocket à:", url);

      // Fermer toute connexion existante avant d'en créer une nouvelle
      if (socketInstanceRef.current) {
        try {
          socketInstanceRef.current.close();
        } catch (error) {
          console.error(
            "Erreur lors de la fermeture du WebSocket existant:",
            error
          );
        }
      }

      const ws = new WebSocket(url);
      socketInstanceRef.current = ws;

      // Définir un timeout pour la connexion
      const connectionTimeout = setTimeout(() => {
        if (
          ws &&
          ws.readyState !== WebSocket.OPEN &&
          isComponentMountedRef.current
        ) {
          console.log("Timeout de connexion WebSocket");
          try {
            ws.close();
            socketInstanceRef.current = null;
          } catch (error) {
            console.error(
              "Erreur lors de la fermeture du WebSocket après timeout:",
              error
            );
          }
        }
      }, CONNECTION_TIMEOUT);

      ws.onopen = () => {
        if (!isComponentMountedRef.current) {
          console.log(
            "Composant démonté, fermeture immédiate de la connexion WebSocket"
          );
          try {
            ws.close();
            socketInstanceRef.current = null;
          } catch (error) {
            console.error(
              "Erreur lors de la fermeture du WebSocket après démontage:",
              error
            );
          }
          return;
        }

        clearTimeout(connectionTimeout);
        console.log("WebSocket connecté");

        if (isComponentMountedRef.current) {
          setIsConnected(true);
          setSocket(ws);
        }

        reconnectAttemptsRef.current = 0;
        wsServerAvailableRef.current = true;

        // Configurer le ping périodique pour maintenir la connexion active
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        pingIntervalRef.current = setInterval(() => {
          if (!isComponentMountedRef.current) {
            if (pingIntervalRef.current) {
              clearInterval(pingIntervalRef.current);
              pingIntervalRef.current = null;
            }
            return;
          }

          if (ws && ws.readyState === WebSocket.OPEN) {
            // Envoyer un ping
            try {
              ws.send(
                JSON.stringify({
                  type: "PING",
                  timestamp: new Date().toISOString(),
                })
              );

              // Définir un timeout pour vérifier si on reçoit un pong
              if (pongTimeoutRef.current) {
                clearTimeout(pongTimeoutRef.current);
              }

              pongTimeoutRef.current = setTimeout(() => {
                if (!isComponentMountedRef.current) {
                  return;
                }

                // Si aucun pong n'a été reçu dans le délai imparti
                const now = Date.now();
                const timeSinceLastPong = now - lastPongRef.current;

                if (timeSinceLastPong > PONG_TIMEOUT) {
                  console.log(
                    `Aucun PONG reçu depuis ${timeSinceLastPong}ms, fermeture de la connexion`
                  );
                  if (ws && ws.readyState === WebSocket.OPEN) {
                    try {
                      ws.close();
                      socketInstanceRef.current = null;
                    } catch (error) {
                      console.error(
                        "Erreur lors de la fermeture du WebSocket après timeout de pong:",
                        error
                      );
                    }
                  }
                }
              }, PONG_TIMEOUT);
            } catch (pingError) {
              console.error("Erreur lors de l'envoi du ping:", pingError);
              // Ne pas fermer la connexion ici, laissez le mécanisme de pong s'en charger
            }
          }
        }, PING_INTERVAL);

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
        if (!isComponentMountedRef.current) return;

        try {
          const data = JSON.parse(event.data);

          // Ne pas logger les messages PING/PONG pour éviter de polluer la console
          if (data.type !== "PING" && data.type !== "PONG") {
            console.log("Message WebSocket reçu:", data);
          }

          // Traiter les différents types de messages
          if (data.type === "PONG") {
            // Le serveur a répondu au ping, la connexion est active
            lastPongRef.current = Date.now();

            // Annuler le timeout de pong si présent
            if (pongTimeoutRef.current) {
              clearTimeout(pongTimeoutRef.current);
              pongTimeoutRef.current = null;
            }
          } else if (data.type === "NEW_ACTIVITY" && data.activity) {
            // Ajouter le message à la liste des messages (sauf PING/PONG)
            if (isComponentMountedRef.current) {
              setMessages((prevMessages) => [...prevMessages, data]);

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
            }
          } else if (
            (data.type === "ACTIVITIES_LIST" &&
              Array.isArray(data.activities)) ||
            (data.type === "ACTIVITIES" && Array.isArray(data.data))
          ) {
            // Ajouter le message à la liste des messages
            if (isComponentMountedRef.current) {
              setMessages((prevMessages) => [...prevMessages, data]);

              // Traiter à la fois ACTIVITIES_LIST et ACTIVITIES
              const activitiesData =
                data.type === "ACTIVITIES" ? data.data : data.activities;
              console.log(
                `Reçu ${activitiesData.length} activités via WebSocket`
              );
              setActivities(activitiesData || []);
            }
          } else if (data.type === "DATA_UPDATED") {
            // Ajouter le message à la liste des messages
            if (isComponentMountedRef.current) {
              setMessages((prevMessages) => [...prevMessages, data]);

              // Demander les dernières activités lorsque les données sont mises à jour
              try {
                if (ws && ws.readyState === WebSocket.OPEN) {
                  ws.send(
                    JSON.stringify({
                      type: "REQUEST_ACTIVITIES",
                      timestamp: new Date().toISOString(),
                    })
                  );
                }
              } catch (error) {
                console.error(
                  "Erreur lors de la demande d'activités après mise à jour:",
                  error
                );
              }
            }
          } else if (
            data.type === "NOTIFICATIONS" ||
            data.type === "NEW_NOTIFICATION"
          ) {
            // Ajouter le message à la liste des messages
            if (isComponentMountedRef.current) {
              setMessages((prevMessages) => [...prevMessages, data]);

              // Émettre un événement personnalisé pour notifier les composants intéressés
              const event = new CustomEvent("websocket:notification", {
                detail: data,
              });
              window.dispatchEvent(event);
            }
          } else if (
            data.type === "NOTIFICATION_MARKED_READ" ||
            data.type === "ALL_NOTIFICATIONS_MARKED_READ"
          ) {
            // Ajouter le message à la liste des messages
            if (isComponentMountedRef.current) {
              setMessages((prevMessages) => [...prevMessages, data]);

              // Émettre un événement personnalisé pour notifier les composants intéressés
              const event = new CustomEvent("websocket:notification_update", {
                detail: data,
              });
              window.dispatchEvent(event);
            }
          } else if (
            data.type !== "WELCOME" &&
            data.type !== "PING" &&
            data.type !== "PONG"
          ) {
            // Ajouter les autres types de messages à la liste des messages
            if (isComponentMountedRef.current) {
              setMessages((prevMessages) => [...prevMessages, data]);
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

        // Nettoyer l'intervalle de ping
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Nettoyer le timeout de pong
        if (pongTimeoutRef.current) {
          clearTimeout(pongTimeoutRef.current);
          pongTimeoutRef.current = null;
        }

        console.log(
          `WebSocket déconnecté: ${event.code} ${event.reason || ""}`
        );

        if (isComponentMountedRef.current) {
          setIsConnected(false);
          setSocket(null);
        }

        socketInstanceRef.current = null;

        // Tenter de se reconnecter si la connexion a été perdue de manière inattendue
        // et que nous ne sommes pas en mode de secours permanent
        // et qu'un nettoyage n'est pas en cours
        // et que le composant est toujours monté
        if (
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS &&
          !isCleaningUpRef.current &&
          isComponentMountedRef.current
        ) {
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
            if (isComponentMountedRef.current && !isCleaningUpRef.current) {
              reconnectAttemptsRef.current += 1;
              connect();
            }
          }, RECONNECT_INTERVAL);
        } else if (
          reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS &&
          isComponentMountedRef.current &&
          !isCleaningUpRef.current
        ) {
          console.log(
            `Passage en mode de secours après ${MAX_RECONNECT_ATTEMPTS} tentatives`
          );
          if (isComponentMountedRef.current) {
            setFallbackMode(true);
          }
          wsServerAvailableRef.current = false;
        }
      };

      ws.onerror = (error) => {
        console.error("Erreur WebSocket:", error);
        // Ne pas fermer la connexion ici, laissez onclose s'en charger
        reconnectAttemptsRef.current += 1;

        if (
          reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS &&
          isComponentMountedRef.current &&
          !isCleaningUpRef.current
        ) {
          console.log("Trop d'erreurs, passage en mode de secours");
          if (isComponentMountedRef.current) {
            setFallbackMode(true);
          }
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
      if (
        fallbackMode ||
        !wsServerAvailableRef.current ||
        !isComponentMountedRef.current
      ) {
        console.log(
          "Mode de secours actif, serveur non disponible ou composant démonté, message non envoyé:",
          data
        );
        return false;
      }

      if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(JSON.stringify(data));
          return true;
        } catch (error) {
          console.error("Erreur lors de l'envoi du message:", error);
          return false;
        }
      } else {
        console.log("WebSocket non connecté, message non envoyé:", data);
        return false;
      }
    },
    [socket, isConnected, fallbackMode]
  );

  // Fonction pour demander une mise à jour des activités
  const requestActivitiesUpdate = useCallback(() => {
    if (
      fallbackMode ||
      !wsServerAvailableRef.current ||
      !isComponentMountedRef.current
    ) {
      console.log(
        "Mode de secours actif, serveur non disponible ou composant démonté, demande d'activités ignorée"
      );
      return false;
    }

    if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(
          JSON.stringify({
            type: "REQUEST_ACTIVITIES",
            timestamp: new Date().toISOString(),
          })
        );
        return true;
      } catch (error) {
        console.error("Erreur lors de la demande d'activités:", error);
        return false;
      }
    } else {
      console.log("WebSocket non connecté, demande d'activités ignorée");
      return false;
    }
  }, [socket, isConnected, fallbackMode]);

  // Fonction pour notifier les autres clients d'un changement de données
  const notifyDataChange = useCallback(
    (entityType, action, entityId) => {
      if (
        fallbackMode ||
        !wsServerAvailableRef.current ||
        !isComponentMountedRef.current
      ) {
        console.log(
          "Mode de secours actif, serveur non disponible ou composant démonté, notification de changement ignorée"
        );
        return false;
      }

      if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(
            JSON.stringify({
              type: "DATA_CHANGED",
              entityType,
              action,
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
      } else {
        console.log(
          "WebSocket non connecté, notification de changement ignorée"
        );
        return false;
      }
    },
    [socket, isConnected, fallbackMode]
  );

  // Fonction pour réinitialiser le mode de secours
  const resetFallbackMode = useCallback(() => {
    if (!isComponentMountedRef.current) return;

    console.log("Réinitialisation du mode de secours");
    if (isComponentMountedRef.current) {
      setFallbackMode(false);
    }
    wsServerAvailableRef.current = true;
    reconnectAttemptsRef.current = 0;

    // Tenter une nouvelle connexion
    connect();
  }, [connect]);

  // Fonction pour déconnecter proprement le WebSocket
  const disconnect = useCallback(() => {
    console.log("Nettoyage de la connexion WebSocket");

    // Marquer que nous sommes en train de nettoyer
    isCleaningUpRef.current = true;

    // Nettoyer l'intervalle de ping
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    // Nettoyer le timeout de pong
    if (pongTimeoutRef.current) {
      clearTimeout(pongTimeoutRef.current);
      pongTimeoutRef.current = null;
    }

    // Nettoyer le timeout de reconnexion
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Fermer la connexion WebSocket
    if (
      socketInstanceRef.current &&
      socketInstanceRef.current.readyState === WebSocket.OPEN
    ) {
      try {
        socketInstanceRef.current.send(
          JSON.stringify({
            type: "DISCONNECT",
            timestamp: new Date().toISOString(),
          })
        );
        socketInstanceRef.current.close();
        socketInstanceRef.current = null;
      } catch (error) {
        console.error("Erreur lors de la fermeture du WebSocket:", error);
      }
    }

    if (isComponentMountedRef.current) {
      setIsConnected(false);
      setSocket(null);
    }

    // Réinitialiser l'état de nettoyage après un court délai
    setTimeout(() => {
      isCleaningUpRef.current = false;
    }, 1000);
  }, []);

  // Connecter au montage du composant
  useEffect(() => {
    console.log("Tentative de connexion WebSocket initiale...");
    isComponentMountedRef.current = true;

    // Seulement si nous ne sommes pas en mode de secours
    if (!fallbackMode && !isCleaningUpRef.current) {
      const initialConnectionTimeout = setTimeout(() => {
        if (isComponentMountedRef.current) {
          connect();
        }
      }, 500); // Petit délai pour éviter les connexions multiples

      return () => clearTimeout(initialConnectionTimeout);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reconnecter lorsque l'utilisateur change, sauf en mode de secours permanent
  useEffect(() => {
    if (
      user &&
      !fallbackMode &&
      !isCleaningUpRef.current &&
      isComponentMountedRef.current
    ) {
      // Réinitialiser les tentatives de reconnexion
      const userChangeTimeout = setTimeout(() => {
        if (isComponentMountedRef.current && !isCleaningUpRef.current) {
          reconnectAttemptsRef.current = 0;
          connect();
        }
      }, 1000);

      return () => clearTimeout(userChangeTimeout);
    }
  }, [user, connect, fallbackMode]);

  // Nettoyer lors du démontage
  useEffect(() => {
    return () => {
      console.log("Démontage du composant WebSocket");
      isComponentMountedRef.current = false;
      disconnect();
    };
  }, [disconnect]);

  // Ajouter un gestionnaire d'événements pour détecter les rechargements de page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Envoyer un message de déconnexion propre
      if (
        socketInstanceRef.current &&
        socketInstanceRef.current.readyState === WebSocket.OPEN
      ) {
        try {
          socketInstanceRef.current.send(
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
  }, []);

  // Fonction pour effacer les messages
  const clearMessages = useCallback(() => {
    if (!isComponentMountedRef.current) return;
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
