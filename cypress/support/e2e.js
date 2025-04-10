// ***********************************************************
// Support pour les tests e2e SmartPlanning
// ***********************************************************

// Import des commandes
import "./commands";

// Hook before pour chaque test
beforeEach(() => {
  // Log détaillé pour chaque test
  Cypress.log({
    name: "Test Cross-Domain",
    message: `🚀 Démarrage du test sur ${Cypress.config(
      "baseUrl"
    )} avec API sur ${Cypress.env("apiUrl")}`,
  });
});

// Gestion des erreurs de Cypress pendant les tests
Cypress.on("uncaught:exception", (err, runnable) => {
  // Nous pouvons retourner false pour empêcher Cypress de faire échouer le test
  // Utile pour les erreurs JS qui ne sont pas reliées au test lui-même
  console.log("Erreur non gérée:", err.message);
  return false;
});
