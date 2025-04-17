/* global cy, Cypress, expect */

/**
 * Test Cypress E2E pour la fonctionnalité CSRF
 * Ce test valide que le système de protection CSRF fonctionne correctement
 */

describe("CSRF Protection Tests", () => {
  const apiUrl = Cypress.env("apiUrl") || "http://localhost:5001";

  it("should successfully validate CSRF protection with valid token", () => {
    // Log de début du test
    cy.log("🔍 Début du test CSRF avec token valide");

    // Étape 1: Récupérer un token CSRF via API
    cy.log("Étape 1: Récupération du token CSRF");
    cy.request({
      method: "GET",
      url: `${apiUrl}/api/csrf-token`,
      withCredentials: true,
    }).then((response) => {
      // Étape 2: Vérifier que la réponse contient un token CSRF
      cy.log("Étape 2: Vérification du token dans la réponse");
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("success", true);
      expect(response.body).to.have.property("csrfToken").and.to.be.a("string");

      const csrfToken = response.body.csrfToken;
      cy.log(`Token CSRF reçu: ${csrfToken.substring(0, 10)}...`);

      // Étape 3: Stocker le token dans localStorage
      cy.log("Étape 3: Stockage du token dans localStorage");
      cy.window().then((win) => {
        win.localStorage.setItem("csrfToken", csrfToken);

        // Vérifier que le stockage a fonctionné
        const storedToken = win.localStorage.getItem("csrfToken");
        expect(storedToken).to.eq(csrfToken);
        cy.log(
          `Token stocké dans localStorage: ${storedToken.substring(0, 10)}...`
        );
      });

      // Étape 4: Vérifier que le cookie XSRF-TOKEN est présent
      cy.log("Étape 4: Vérification du cookie XSRF-TOKEN");
      cy.getCookie("XSRF-TOKEN")
        .should("exist")
        .then((cookie) => {
          cy.wrap(cookie.value).as("xsrfCookieValue");
          cy.log(
            `Cookie XSRF-TOKEN présent: ${cookie.value.substring(0, 10)}...`
          );
        });

      // Étape 5: Envoyer une requête POST avec le token
      cy.log("Étape 5: Envoi d'une requête POST avec le token CSRF");
      cy.request({
        method: "POST",
        url: `${apiUrl}/api/test/csrf-check`,
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: { test: "csrf valid" },
        withCredentials: true,
      }).then((postResponse) => {
        // Étape 6: Vérifier que la requête avec token est acceptée
        cy.log("Étape 6: Vérification de la réponse POST");
        expect(postResponse.status).to.eq(200);
        expect(postResponse.body).to.have.property("success", true);
        expect(postResponse.body).to.have.property("tokenValidated", true);
        expect(postResponse.body.data).to.have.property("test", "csrf valid");

        cy.log("✅ Test CSRF avec token valide réussi");
      });
    });
  });

  it("should reject requests without CSRF token", () => {
    // Test du comportement sans token (doit être rejeté)
    cy.log("🔍 Début du test CSRF sans token (doit échouer)");

    cy.request({
      method: "GET",
      url: `${apiUrl}/api/csrf-token`,
      withCredentials: true,
      failOnStatusCode: false,
    }).then(() => {
      // Envoyer une requête POST sans token CSRF
      cy.log("Envoi d'une requête POST sans token CSRF");
      cy.request({
        method: "POST",
        url: `${apiUrl}/api/test/csrf-check`,
        headers: {
          "Content-Type": "application/json",
        },
        body: { test: "no csrf token" },
        withCredentials: true,
        failOnStatusCode: false, // Ne pas échouer sur les codes d'erreur HTTP
      }).then((response) => {
        // Vérifier que la requête est bien rejetée avec un code 403
        cy.log("Vérification du rejet de la requête");
        expect(response.status).to.eq(403);
        expect(response.body).to.have.property("error");

        cy.log(
          `✅ Test CSRF sans token réussi: requête rejetée avec code ${response.status}`
        );
      });
    });
  });
});
