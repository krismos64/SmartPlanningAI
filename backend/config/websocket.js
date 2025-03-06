const WebSocket = require("ws");

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
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        console.log("Message WebSocket reçu:", data);

        switch (data.type) {
          case "IDENTIFY":
            ws.userId = data.userId;
            console.log(`Client identifié avec l'ID: ${data.userId}`);
            break;

          case "REQUEST_ACTIVITIES":
            // La logique de récupération des activités est gérée dans le modèle Activity
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
                    timestamp: data.timestamp,
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
        }
      } catch (error) {
        console.error("Erreur lors du traitement du message WebSocket:", error);
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

  return wss;
};

module.exports = setupWebSocket;
