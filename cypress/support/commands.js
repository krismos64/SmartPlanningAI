// ***********************************************
// Commandes personnalisées pour SmartPlanning
// ***********************************************

// Commande pour faciliter la vérification des cookies
Cypress.Commands.add("verifyCookies", () => {
  cy.log("🍪 Vérification des cookies d'authentification");

  cy.getCookie("accessToken").then((cookie) => {
    if (cookie) {
      cy.log(`✅ Cookie accessToken trouvé: ${cookie.name}`);
    } else {
      cy.log("❌ Cookie accessToken manquant");
    }
  });

  cy.getCookie("refreshToken").then((cookie) => {
    if (cookie) {
      cy.log(`✅ Cookie refreshToken trouvé: ${cookie.name}`);
    } else {
      cy.log("❌ Cookie refreshToken manquant");
    }
  });

  cy.getCookie("auth_token").then((cookie) => {
    if (cookie) {
      cy.log(`✅ Cookie auth_token trouvé: ${cookie.name}`);
    } else {
      cy.log("❌ Cookie auth_token manquant (optionnel)");
    }
  });
});

// Commande pour se connecter rapidement (évite la répétition)
Cypress.Commands.add("login", (email, password) => {
  cy.log(`🔐 Connexion avec ${email}`);
  cy.visit("/login");
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();

  // Attendre que le dashboard charge
  cy.url().should("include", "/dashboard", { timeout: 10000 });
});

// Commande pour se déconnecter
Cypress.Commands.add("logout", () => {
  cy.log("🚪 Déconnexion");

  // Essayer différentes stratégies pour trouver le bouton de déconnexion
  cy.get("body").then(($body) => {
    if ($body.find('[data-testid="logout-button"]').length > 0) {
      cy.get('[data-testid="logout-button"]').click();
    } else if ($body.find('[data-cy="logout"]').length > 0) {
      cy.get('[data-cy="logout"]').click();
    } else if ($body.find('button:contains("Déconnexion")').length > 0) {
      cy.contains("button", "Déconnexion").click();
    } else if ($body.find('a:contains("Déconnexion")').length > 0) {
      cy.contains("a", "Déconnexion").click();
    } else {
      cy.log(
        '⚠️ Bouton de déconnexion non trouvé, tentative avec le texte "Déconnexion"'
      );
      cy.contains("Déconnexion").click();
    }
  });

  // Vérifier qu'on est bien redirigé vers login
  cy.url().should("include", "/login");
});

// Commande pour vérifier que tous les cookies d'authentification sont supprimés
Cypress.Commands.add("checkCookiesRemoved", () => {
  cy.log("🧹 Vérification de la suppression des cookies");

  cy.getCookie("accessToken").should("not.exist");
  cy.getCookie("refreshToken").should("not.exist");
  cy.getCookie("auth_token").should("not.exist");
  cy.getCookie("connect.sid").should("not.exist");

  cy.log("✅ Tous les cookies d'authentification ont été supprimés");
});
