// Gestion robuste des erreurs de dépendances
let socketIO;
try {
  socketIO = require("socket.io");
  console.log("✅ Socket.io chargé avec succès dans websocket.js");
} catch (error) {
  console.error(
    "❌ ERREUR: Socket.io n'est pas disponible dans websocket.js:",
    error.message
  );
  console.error("Création d'un module Socket.IO factice...");

  // Créer un module factice pour éviter les erreurs
  socketIO = {
    Server: function () {
      console.log("🔄 Utilisation d'un mock Socket.IO Server");
      return {
        on: function (event, callback) {
          console.log(`🔄 Mock Socket.IO: Event '${event}' registered`);
          // Simuler une connexion immédiatement pour les tests
          if (event === "connection") {
            const mockSocket = {
              userId: null,
              on: function (event, handler) {
                console.log(`🔄 Mock Socket registering event: ${event}`);
                return this;
              },
              emit: function (event, data) {
                console.log(`🔄 Mock Socket emitting event: ${event}`, data);
                return this;
              },
            };
            setTimeout(() => callback(mockSocket), 100);
          }
        },
      };
    },
  };
}

const Activity = require("../models/Activity");
const Notification = require("../models/Notification");

const setupWebSocket = (server) => {
  console.log("Initialisation de WebSocket...");

  try {
    const io = new socketIO.Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      path: "/socket.io",
    });

    // Gestion des connexions
    io.on("connection", (socket) => {
      console.log("Client connecté via Socket.IO");

      // Identification du client
      socket.on("IDENTIFY", async (data) => {
        socket.userId = data.userId;
        console.log(`Client identifié avec l'ID: ${data.userId}`);

        // Envoyer les notifications non lues à l'utilisateur qui vient de s'identifier
        if (socket.userId) {
          try {
            const result = await Notification.getByUserId(socket.userId, {
              unreadOnly: true,
            });
            if (result.success && result.notifications.length > 0) {
              socket.emit("NOTIFICATIONS", {
                notifications: result.notifications,
                timestamp: new Date().toISOString(),
              });
            }
          } catch (error) {
            console.error(
              "Erreur lors de la récupération des notifications:",
              error
            );
          }
        }
      });

      // Autres événements WebSocket
      socket.on("REQUEST_ACTIVITIES", async () => {
        try {
          console.log("Récupération des activités récentes...");
          const result = await Activity.getAll({
            limit: 10,
            sortBy: "timestamp",
            sortOrder: "DESC",
          });

          if (
            !result ||
            !result.activities ||
            !Array.isArray(result.activities)
          ) {
            socket.emit("ACTIVITIES", {
              data: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
              error: "Aucune activité disponible",
              timestamp: new Date().toISOString(),
            });
            return;
          }

          socket.emit("ACTIVITIES", {
            data: result.activities,
            pagination: result.pagination,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Erreur lors de la récupération des activités:", error);
          socket.emit("ERROR", {
            message:
              "Erreur lors de la récupération des activités: " +
              (error.message || "Erreur inconnue"),
            timestamp: new Date().toISOString(),
          });
        }
      });

      // Gestion des pings pour garder la connexion active
      socket.on("PING", () => {
        socket.emit("PONG", {
          timestamp: new Date().toISOString(),
        });
      });

      // Déconnexion
      socket.on("disconnect", () => {
        console.log(
          `Client déconnecté${socket.userId ? ` (ID: ${socket.userId})` : ""}`
        );
      });
    });

    console.log("✅ Socket.IO configuré avec succès");
    return io;
  } catch (error) {
    console.error("❌ ERREUR lors de l'initialisation de Socket.IO:", error);
    // Retourner un objet factice pour éviter les erreurs en cascade
    return {
      emit: (event, data) => console.log(`🔄 Mock IO emitting: ${event}`, data),
      on: (event, handler) => console.log(`🔄 Mock IO on: ${event}`),
      // Ajouter d'autres méthodes factices au besoin
      to: () => ({ emit: () => {} }),
      in: () => ({ emit: () => {} }),
      of: () => ({ on: () => {}, emit: () => {} }),
    };
  }
};

module.exports = setupWebSocket;
