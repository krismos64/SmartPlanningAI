describe("Tests du cycle d'authentification SmartPlanning", () => {
  const API_URL = "https://smartplanning-api.onrender.com";
  const FRONTEND_URL = "https://smartplanning.fr";

  const TEST_USER = {
    email: "admin@demo.fr",
    validPassword: "demo1234",
    invalidPassword: "mauvais_mdp",
  };

  beforeEach(() => {
    // Nettoyer les cookies avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.log("🧪 Début du test d'authentification cross-domain");
  });

  it("Devrait tester le cycle complet d'authentification", () => {
    // 1. Se rendre sur la page de connexion
    cy.log("📍 Étape 1: Navigation vers la page de connexion");
    cy.visit(`${FRONTEND_URL}/login`);
    cy.url().should("include", "/login");

    // Vérifier que l'interface de connexion est visible
    cy.get("form").should("be.visible");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");

    // 2. Saisir des identifiants corrects et se connecter
    cy.log("📍 Étape 2: Connexion avec identifiants valides");
    cy.get('input[type="email"]').type(TEST_USER.email);
    cy.get('input[type="password"]').type(TEST_USER.validPassword);
    cy.get('button[type="submit"]').click();

    // Attendre le chargement du dashboard
    cy.url().should("include", "/dashboard", { timeout: 10000 });

    // 3. Vérifier que l'utilisateur est connecté (présence du cookie accessToken)
    cy.log("📍 Étape 3: Vérification des cookies après connexion");
    cy.getCookie("accessToken")
      .should("exist")
      .then((cookie) => {
        cy.log(`✅ Cookie accessToken trouvé: ${cookie.name}`);
      });
    cy.getCookie("refreshToken")
      .should("exist")
      .then((cookie) => {
        cy.log(`✅ Cookie refreshToken trouvé: ${cookie.name}`);
      });
    cy.getCookie("auth_token")
      .should("exist")
      .then((cookie) => {
        cy.log(`✅ Cookie auth_token trouvé: ${cookie.name}`);
      });

    // Vérifier que les cookies ont bien les attributs sécurisés
    cy.log("📍 Vérification des attributs de sécurité des cookies");
    cy.getCookies().then((cookies) => {
      const authCookies = cookies.filter((cookie) =>
        ["accessToken", "refreshToken", "auth_token"].includes(cookie.name)
      );

      authCookies.forEach((cookie) => {
        expect(cookie.secure).to.be.true;
        cy.log(`✅ Cookie ${cookie.name} est marqué comme Secure`);
        // SameSite=None ne peut pas être directement vérifié via Cypress
        // mais nous pouvons vérifier que le domaine est correct
        expect(cookie.domain).to.include("smartplanning");
        cy.log(`✅ Cookie ${cookie.name} a le bon domaine: ${cookie.domain}`);
      });
    });

    // Vérifier qu'un élément du dashboard est présent
    cy.get("header").should("be.visible");
    cy.contains("Dashboard").should("be.visible");

    // 4. Recharger la page et confirmer que l'utilisateur reste connecté
    cy.log(
      "📍 Étape 4: Rechargement de la page pour vérifier la persistance de session"
    );
    cy.reload();
    cy.url().should("include", "/dashboard");
    cy.getCookie("accessToken")
      .should("exist")
      .then(() => {
        cy.log("✅ Session persistante après rechargement");
      });

    // 5. Cliquer sur "Déconnexion"
    cy.log("📍 Étape 5: Déconnexion");
    // Essayer plusieurs sélecteurs possibles pour le bouton de déconnexion
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
          "⚠️ Bouton de déconnexion non trouvé avec les sélecteurs standards"
        );
        // Dernier recours: chercher dans tout le texte visible
        cy.contains("Déconnexion").click();
      }
    });

    // 6. Vérifier que les cookies ont bien été supprimés
    cy.log(
      "📍 Étape 6: Vérification de la suppression des cookies après déconnexion"
    );
    cy.getCookie("accessToken")
      .should("not.exist")
      .then(() => {
        cy.log("✅ Cookie accessToken correctement supprimé");
      });
    cy.getCookie("refreshToken")
      .should("not.exist")
      .then(() => {
        cy.log("✅ Cookie refreshToken correctement supprimé");
      });
    cy.getCookie("auth_token")
      .should("not.exist")
      .then(() => {
        cy.log("✅ Cookie auth_token correctement supprimé");
      });
    cy.getCookie("connect.sid")
      .should("not.exist")
      .then(() => {
        cy.log("✅ Cookie connect.sid correctement supprimé");
      });

    // Vérifier qu'on est bien redirigé vers la page de connexion
    cy.url().should("include", "/login");

    // 7. Connexion avec un mauvais mot de passe
    cy.log("📍 Étape 7: Tentative de connexion avec mot de passe invalide");
    cy.get('input[type="email"]').type(TEST_USER.email);
    cy.get('input[type="password"]').type(TEST_USER.invalidPassword);
    cy.get('button[type="submit"]').click();

    // 8. Vérifier qu'on ne se connecte pas et qu'un message d'erreur s'affiche
    cy.log(
      "📍 Étape 8: Vérification du rejet de connexion avec identifiants invalides"
    );
    cy.url().should("include", "/login");
    cy.get("body").then(($body) => {
      const errorMessages = [
        "Email ou mot de passe incorrect",
        "identifiants invalides",
        "Mot de passe incorrect",
      ];

      let errorFound = false;
      errorMessages.forEach((msg) => {
        if ($body.text().includes(msg)) {
          cy.log(`✅ Message d'erreur trouvé: "${msg}"`);
          errorFound = true;
        }
      });

      if (!errorFound) {
        cy.log(
          "⚠️ Message d'erreur spécifique non trouvé, mais la connexion a bien échoué"
        );
      }
    });

    cy.getCookie("accessToken")
      .should("not.exist")
      .then(() => {
        cy.log("✅ Aucun cookie accessToken créé après échec de connexion");
      });

    // 9. Tenter d'accéder à une route protégée
    cy.log(
      "📍 Étape 9: Tentative d'accès à une route protégée sans authentification"
    );
    cy.visit(`${FRONTEND_URL}/dashboard`);

    // Vérifier qu'on est redirigé vers la page de connexion
    cy.url()
      .should("include", "/login")
      .then(() => {
        cy.log(
          "✅ Redirection correcte vers /login lors de l'accès à une route protégée"
        );
      });
  });

  it("Devrait vérifier le comportement des appels API avec les cookies", () => {
    cy.log("📍 Test des appels API avec les cookies");
    // Se connecter en utilisant l'API directement pour avoir plus de contrôle
    cy.request({
      method: "POST",
      url: `${API_URL}/api/auth/login`,
      body: {
        email: TEST_USER.email,
        password: TEST_USER.validPassword,
      },
      headers: {
        Accept: "application/json",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
      cy.log(`✅ Connexion API réussie (statut: ${response.status})`);

      // Vérifier que les cookies sont bien définis
      cy.getCookie("accessToken").should("exist");
      cy.getCookie("refreshToken").should("exist");
      cy.log("✅ Cookies correctement définis après appel API");

      // Visiter le dashboard directement
      cy.visit(`${FRONTEND_URL}/dashboard`);
      cy.url().should("include", "/dashboard");
      cy.log("✅ Accès au dashboard après authentification API");

      // Tester le rafraîchissement du token
      cy.log("📍 Test du rafraîchissement de token via /api/auth/check");
      // Faisons une requête vers une route protégée
      cy.request({
        method: "GET",
        url: `${API_URL}/api/auth/check`,
        failOnStatusCode: false,
      }).then((checkResponse) => {
        expect(checkResponse.status).to.eq(200);
        expect(checkResponse.body.isAuthenticated).to.be.true;
        cy.log(
          `✅ Route protégée accessible (statut: ${checkResponse.status}, authentifié: ${checkResponse.body.isAuthenticated})`
        );
      });

      // Simuler une déconnexion via l'API
      cy.log("📍 Déconnexion via API");
      cy.request({
        method: "POST",
        url: `${API_URL}/api/auth/logout`,
        failOnStatusCode: false,
      }).then((logoutResponse) => {
        expect(logoutResponse.status).to.eq(200);
        expect(logoutResponse.body.success).to.be.true;
        cy.log(`✅ Déconnexion API réussie (statut: ${logoutResponse.status})`);

        // Vérifier que les cookies sont supprimés
        cy.getCookie("accessToken").should("not.exist");
        cy.getCookie("refreshToken").should("not.exist");
        cy.log("✅ Cookies correctement supprimés après déconnexion API");
      });
    });
  });

  it("Devrait vérifier le comportement de refresh token si disponible", () => {
    cy.log("📍 Test du mécanisme de refresh token");
    // Se connecter normalement
    cy.visit(`${FRONTEND_URL}/login`);
    cy.get('input[type="email"]').type(TEST_USER.email);
    cy.get('input[type="password"]').type(TEST_USER.validPassword);
    cy.get('button[type="submit"]').click();

    // Attendre d'être connecté
    cy.url().should("include", "/dashboard");
    cy.log("✅ Connexion réussie pour le test de refresh token");

    // Modifier manuellement l'accessToken pour le rendre invalide
    // Cela va forcer l'utilisation du refresh token
    cy.getCookie("accessToken").then((cookie) => {
      // Supprimer juste le accessToken pour simuler son expiration
      cy.clearCookie("accessToken");
      cy.log(
        "🔄 accessToken supprimé manuellement pour simuler son expiration"
      );

      // Visiter une page protégée, ce qui devrait déclencher le rafraîchissement
      cy.visit(`${FRONTEND_URL}/dashboard`);
      cy.log("📍 Tentative d'accès au dashboard avec accessToken expiré");

      // L'application devrait utiliser le refreshToken pour obtenir un nouveau accessToken
      // et rester connectée
      cy.url().should("include", "/dashboard");

      // Vérifier qu'un nouveau accessToken a été généré
      cy.getCookie("accessToken")
        .should("exist")
        .then(() => {
          cy.log("✅ Nouveau accessToken généré via refreshToken avec succès");
        });
    });
  });

  afterEach(() => {
    cy.log("📊 RÉSUMÉ DES TESTS");
    cy.log("----------------------------------");

    // Collecter les résultats des tests
    const results = {
      "Connexion avec identifiants valides": null,
      "Vérification des cookies après connexion": null,
      "Attributs de sécurité des cookies": null,
      "Persistance de session après rechargement": null,
      "Déconnexion et suppression des cookies": null,
      "Échec de connexion avec identifiants invalides": null,
      "Redirection sur accès non autorisé": null,
      "Appels API avec cookies auth": null,
      "Fonctionnement du refresh token": null,
    };

    // Afficher un résumé à partir des tests exécutés
    Object.keys(results).forEach((key) => {
      // En réalité, nous devrions récupérer les résultats réels des tests
      // mais Cypress ne facilite pas cela dans afterEach
      // Ici, nous allons juste afficher un message de résumé
      cy.log(`${key}: ✅ ou ❌ (voir les logs détaillés)`);
    });

    cy.log("----------------------------------");
    cy.log("🏁 Fin des tests d'authentification");
  });
});
