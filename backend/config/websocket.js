const WebSocket = require("ws");
const Activity = require("../models/Activity");

const setupWebSocket = (server) => {
  // Créer un serveur WebSocket
  const wss = new WebSocket.Server({ server });

  // Rendre le WebSocket accessible globalement
  global.wss = wss;

  // Gérer les connexions WebSocket
  wss.on("connection", (ws) => {
    console.log("Client connecté via WebSocket");

    // Envoyer un message de bienvenue
    ws.send(
      JSON.stringify({
        type: "WELCOME",
        message: "Connexion WebSocket établie avec succès",
      })
    );

    // Gérer les messages reçus
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);
        console.log("Message WebSocket reçu:", data);

        switch (data.type) {
          case "IDENTIFY":
            ws.userId = data.userId;
            console.log(`Client identifié avec l'ID: ${data.userId}`);
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

          case "DATA_CHANGED":
            // Diffuser le changement à tous les clients connectés
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: "DATA_UPDATED",
                    dataType: data.dataType,
                    action: data.action,
                    entityId: data.entityId,
                    timestamp: data.timestamp || new Date().toISOString(),
                  })
                );
              }
            });
            break;

          case "PING":
            ws.send(
              JSON.stringify({
                type: "PONG",
                timestamp: new Date().toISOString(),
              })
            );
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

  return wss;
};

module.exports = setupWebSocket;
