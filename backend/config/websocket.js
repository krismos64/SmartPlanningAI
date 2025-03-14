const WebSocket = require("ws");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");

const setupWebSocket = (server) => {
  // Créer un serveur WebSocket avec des options de timeout plus longues
  const wss = new WebSocket.Server({
    server,
    // Augmenter le délai d'attente pour éviter les déconnexions prématurées
    clientTracking: true,
    // Permettre les connexions non authentifiées initialement
    verifyClient: () => true,
    // Augmenter le délai d'attente pour la fermeture de la connexion
    closeTimeout: 5000,
  });

  // Rendre le WebSocket accessible globalement
  global.wss = wss;

  // Fonction pour vérifier si les clients sont toujours connectés
  const heartbeat = function () {
    this.isAlive = true;
    // Réinitialiser le compteur de tentatives de ping échouées
    this.failedPings = 0;
  };

  // Intervalle pour vérifier les connexions actives
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      // Augmenter la tolérance aux échecs de ping
      if (ws.isAlive === false) {
        // Incrémenter le compteur d'échecs
        ws.failedPings = (ws.failedPings || 0) + 1;

        // Fermer la connexion seulement après 3 échecs consécutifs
        if (ws.failedPings >= 3) {
          console.log(
            "Client inactif détecté après 3 tentatives, fermeture de la connexion"
          );
          return ws.terminate();
        } else {
          console.log(`Client non réactif, tentative ${ws.failedPings}/3`);
          // Réessayer de pinger
          try {
            ws.ping();
          } catch (error) {
            console.error(
              "Erreur lors de l'envoi du ping de récupération:",
              error
            );
          }
          return;
        }
      }

      ws.isAlive = false;
      try {
        ws.ping();
      } catch (error) {
        console.error("Erreur lors de l'envoi du ping:", error);
        // Ne pas terminer immédiatement, donner une chance de récupération
        ws.isAlive = false;
      }
    });
  }, 45000); // Augmenter l'intervalle à 45 secondes pour réduire la fréquence des pings

  // Nettoyer l'intervalle à la fermeture du serveur
  wss.on("close", () => {
    clearInterval(interval);
    console.log("Serveur WebSocket fermé, intervalle de ping nettoyé");
  });

  // Gérer les connexions WebSocket
  wss.on("connection", (ws, req) => {
    console.log("Client connecté via WebSocket");

    // Initialiser le statut de la connexion
    ws.isAlive = true;
    ws.failedPings = 0;

    // Répondre aux pings du client
    ws.on("ping", heartbeat);

    // Répondre aux pongs du client
    ws.on("pong", heartbeat);

    // Envoyer un message de bienvenue
    try {
      ws.send(
        JSON.stringify({
          type: "WELCOME",
          message: "Connexion WebSocket établie avec succès",
        })
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi du message de bienvenue:", error);
    }

    // Gérer les messages reçus
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);

        // Ne pas logger les messages PING/PONG pour éviter de polluer les logs
        if (data.type !== "PING" && data.type !== "PONG") {
          console.log("Message WebSocket reçu:", data);
        }

        // Réinitialiser le statut de la connexion à chaque message
        ws.isAlive = true;
        ws.failedPings = 0;

        // Répondre immédiatement aux PING pour maintenir la connexion active
        if (data.type === "PING") {
          try {
            ws.send(
              JSON.stringify({
                type: "PONG",
                timestamp: new Date().toISOString(),
              })
            );
          } catch (error) {
            console.error("Erreur lors de l'envoi du PONG:", error);
          }
          return;
        }

        switch (data.type) {
          case "IDENTIFY":
            ws.userId = data.userId;
            console.log(`Client identifié avec l'ID: ${data.userId}`);

            // Envoyer les notifications non lues à l'utilisateur qui vient de s'identifier
            if (ws.userId) {
              try {
                const result = await Notification.getByUserId(ws.userId, {
                  unreadOnly: true,
                });
                if (result.success && result.notifications.length > 0) {
                  ws.send(
                    JSON.stringify({
                      type: "NOTIFICATIONS",
                      notifications: result.notifications,
                      timestamp: new Date().toISOString(),
                    })
                  );
                }
              } catch (error) {
                console.error(
                  "Erreur lors de la récupération des notifications:",
                  error
                );
              }
            }
            break;

          case "REQUEST_ACTIVITIES":
            try {
              console.log("Récupération des activités récentes...");
              // Récupérer les 10 dernières activités
              const result = await Activity.getAll({
                limit: 10,
                sortBy: "timestamp",
                sortOrder: "DESC",
              });

              // Vérifier si result contient les activités
              if (
                !result ||
                !result.activities ||
                !Array.isArray(result.activities)
              ) {
                console.error(
                  "Erreur: result n'est pas un objet valide ou ne contient pas d'activités",
                  result
                );
                ws.send(
                  JSON.stringify({
                    type: "ACTIVITIES",
                    data: [],
                    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
                    error: "Aucune activité disponible",
                    timestamp: new Date().toISOString(),
                  })
                );
                return;
              }

              console.log(
                `Envoi de ${result.activities.length} activités au client`
              );

              // Envoyer les activités au client
              ws.send(
                JSON.stringify({
                  type: "ACTIVITIES",
                  data: result.activities,
                  pagination: result.pagination,
                  timestamp: new Date().toISOString(),
                })
              );
            } catch (error) {
              console.error(
                "Erreur lors de la récupération des activités:",
                error
              );
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  message:
                    "Erreur lors de la récupération des activités: " +
                    (error.message || "Erreur inconnue"),
                  timestamp: new Date().toISOString(),
                })
              );
            }
            break;

          case "REQUEST_NOTIFICATIONS":
            try {
              if (!ws.userId) {
                ws.send(
                  JSON.stringify({
                    type: "ERROR",
                    message: "Utilisateur non identifié",
                    timestamp: new Date().toISOString(),
                  })
                );
                return;
              }

              const options = {
                limit: data.limit || 20,
                offset: data.offset || 0,
                unreadOnly: data.unreadOnly || false,
              };

              const result = await Notification.getByUserId(ws.userId, options);

              if (result.success) {
                ws.send(
                  JSON.stringify({
                    type: "NOTIFICATIONS",
                    notifications: result.notifications,
                    timestamp: new Date().toISOString(),
                  })
                );
              } else {
                ws.send(
                  JSON.stringify({
                    type: "ERROR",
                    message:
                      "Erreur lors de la récupération des notifications: " +
                      result.error,
                    timestamp: new Date().toISOString(),
                  })
                );
              }
            } catch (error) {
              console.error(
                "Erreur lors de la récupération des notifications:",
                error
              );
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  message:
                    "Erreur lors de la récupération des notifications: " +
                    error.message,
                  timestamp: new Date().toISOString(),
                })
              );
            }
            break;

          case "MARK_NOTIFICATION_READ":
            try {
              if (!data.notificationId) {
                ws.send(
                  JSON.stringify({
                    type: "ERROR",
                    message: "ID de notification manquant",
                    timestamp: new Date().toISOString(),
                  })
                );
                return;
              }

              const result = await Notification.markAsRead(data.notificationId);

              if (result.success) {
                ws.send(
                  JSON.stringify({
                    type: "NOTIFICATION_MARKED_READ",
                    notificationId: data.notificationId,
                    timestamp: new Date().toISOString(),
                  })
                );

                // Diffuser la mise à jour à tous les clients de cet utilisateur
                wss.clients.forEach((client) => {
                  if (
                    client.userId === ws.userId &&
                    client !== ws &&
                    client.readyState === WebSocket.OPEN
                  ) {
                    try {
                      client.send(
                        JSON.stringify({
                          type: "NOTIFICATION_MARKED_READ",
                          notificationId: data.notificationId,
                          timestamp: new Date().toISOString(),
                        })
                      );
                    } catch (error) {
                      console.error(
                        "Erreur lors de la diffusion de la mise à jour de notification:",
                        error
                      );
                    }
                  }
                });
              } else {
                ws.send(
                  JSON.stringify({
                    type: "ERROR",
                    message:
                      "Erreur lors du marquage de la notification comme lue: " +
                      result.error,
                    timestamp: new Date().toISOString(),
                  })
                );
              }
            } catch (error) {
              console.error(
                "Erreur lors du marquage de la notification comme lue:",
                error
              );
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  message:
                    "Erreur lors du marquage de la notification comme lue: " +
                    error.message,
                  timestamp: new Date().toISOString(),
                })
              );
            }
            break;

          case "MARK_ALL_NOTIFICATIONS_READ":
            try {
              if (!ws.userId) {
                ws.send(
                  JSON.stringify({
                    type: "ERROR",
                    message: "Utilisateur non identifié",
                    timestamp: new Date().toISOString(),
                  })
                );
                return;
              }

              const result = await Notification.markAllAsRead(ws.userId);

              if (result.success) {
                ws.send(
                  JSON.stringify({
                    type: "ALL_NOTIFICATIONS_MARKED_READ",
                    userId: ws.userId,
                    timestamp: new Date().toISOString(),
                  })
                );

                // Diffuser la mise à jour à tous les clients de cet utilisateur
                wss.clients.forEach((client) => {
                  if (
                    client.userId === ws.userId &&
                    client !== ws &&
                    client.readyState === WebSocket.OPEN
                  ) {
                    try {
                      client.send(
                        JSON.stringify({
                          type: "ALL_NOTIFICATIONS_MARKED_READ",
                          userId: ws.userId,
                          timestamp: new Date().toISOString(),
                        })
                      );
                    } catch (error) {
                      console.error(
                        "Erreur lors de la diffusion de la mise à jour des notifications:",
                        error
                      );
                    }
                  }
                });
              } else {
                ws.send(
                  JSON.stringify({
                    type: "ERROR",
                    message:
                      "Erreur lors du marquage de toutes les notifications comme lues: " +
                      result.error,
                    timestamp: new Date().toISOString(),
                  })
                );
              }
            } catch (error) {
              console.error(
                "Erreur lors du marquage de toutes les notifications comme lues:",
                error
              );
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  message:
                    "Erreur lors du marquage de toutes les notifications comme lues: " +
                    error.message,
                  timestamp: new Date().toISOString(),
                })
              );
            }
            break;

          case "DISCONNECT":
            console.log(
              `Client avec l'ID ${
                ws.userId || "inconnu"
              } a demandé une déconnexion`
            );
            // La connexion sera fermée par le client
            break;

          case "DATA_CHANGED":
            // Diffuser le changement à tous les clients connectés
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                try {
                  client.send(
                    JSON.stringify({
                      type: "DATA_UPDATED",
                      dataType: data.dataType,
                      action: data.action,
                      entityId: data.entityId,
                      timestamp: data.timestamp || new Date().toISOString(),
                    })
                  );
                } catch (error) {
                  console.error(
                    "Erreur lors de la diffusion du changement de données:",
                    error
                  );
                }
              }
            });
            break;

          default:
            console.log(`Type de message non géré: ${data.type}`);
            break;
        }
      } catch (error) {
        console.error("Erreur lors du traitement du message WebSocket:", error);
        try {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message:
                "Erreur lors du traitement du message: " +
                (error.message || "Erreur inconnue"),
              timestamp: new Date().toISOString(),
            })
          );
        } catch (sendError) {
          console.error(
            "Erreur lors de l'envoi du message d'erreur:",
            sendError
          );
        }
      }
    });

    // Gérer la déconnexion
    ws.on("close", () => {
      console.log("Client déconnecté");
      if (ws.userId) {
        console.log(`Client avec l'ID ${ws.userId} déconnecté`);
      }
    });

    // Gérer les erreurs
    ws.on("error", (error) => {
      console.error("Erreur WebSocket:", error);
    });
  });

  // Fonction utilitaire pour diffuser un message à tous les clients
  wss.broadcast = (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(
            typeof message === "string" ? message : JSON.stringify(message)
          );
        } catch (error) {
          console.error("Erreur lors de la diffusion du message:", error);
        }
      }
    });
  };

  // Fonction utilitaire pour envoyer une notification à un utilisateur spécifique
  wss.sendNotificationToUser = (userId, notification) => {
    wss.clients.forEach((client) => {
      if (client.userId === userId && client.readyState === WebSocket.OPEN) {
        try {
          client.send(
            JSON.stringify({
              type: "NEW_NOTIFICATION",
              notification,
              timestamp: new Date().toISOString(),
            })
          );
        } catch (error) {
          console.error("Erreur lors de l'envoi de la notification:", error);
        }
      }
    });
  };

  return wss;
};

module.exports = setupWebSocket;
