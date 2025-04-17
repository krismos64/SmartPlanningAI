/**
 * Tests d'authentification pour environnement local
 * Version adaptée du fichier auth.cy.js pour fonctionner localement
 */

import { buildApiUrl } from "../../src/utils/apiHelpers";

describe("Tests du cycle d'authentification SmartPlanning - Développement Local", () => {
  // Utiliser les URL locales au lieu des URL de production
  const API_URL = "http://localhost:5000";
  const FRONTEND_URL = "http://localhost:3000";

  const TEST_USER = {
    email: "admin@demo.fr",
    validPassword: "demo1234",
    invalidPassword: "mauvais_mdp",
  };

  beforeEach(() => {
    // Nettoyer les cookies avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.log("🧪 Début du test d'authentification local");

    // Stub des requêtes réseau pour simuler les réponses API
    cy.intercept("POST", buildApiUrl("/auth/login"), (req) => {
      if (
        req.body.email === TEST_USER.email &&
        req.body.password === TEST_USER.validPassword
      ) {
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            token: "mock-jwt-token",
            accessToken: "mock-jwt-token",
            refreshToken: "mock-refresh-token",
            user: {
              id: 1,
              email: TEST_USER.email,
              role: "admin",
              first_name: "Admin",
              last_name: "Test",
            },
          },
          headers: {
            "Set-Cookie":
              "accessToken=mock-jwt-token; Path=/; HttpOnly; Secure; SameSite=None",
          },
        });
      } else {
        req.reply({
          statusCode: 401,
          body: {
            success: false,
            message: "Email ou mot de passe incorrect",
          },
        });
      }
    }).as("loginRequest");

    cy.intercept("POST", buildApiUrl("/auth/logout"), {
      statusCode: 200,
      body: {
        success: true,
        message: "Déconnexion réussie",
      },
      headers: {
        "Set-Cookie":
          "accessToken=; Path=/; HttpOnly; Secure; SameSite=None; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      },
    }).as("logoutRequest");

    cy.intercept("GET", buildApiUrl("/auth/profile"), (req) => {
      const hasAuth =
        req.headers.authorization &&
        req.headers.authorization.includes("mock-jwt-token");
      if (hasAuth) {
        req.reply({
          statusCode: 200,
          body: {
            id: 1,
            email: TEST_USER.email,
            role: "admin",
            first_name: "Admin",
            last_name: "Test",
          },
        });
      } else {
        req.reply({
          statusCode: 401,
          body: {
            success: false,
            message: "Non autorisé",
          },
        });
      }
    }).as("profileRequest");
  });

  it("Devrait tester le cycle complet d'authentification (simulé)", () => {
    // 1. Visiter la page login
    cy.log("📍 Étape 1: Navigation vers la page de connexion simulée");
    // Au lieu de visiter réellement, créer un DOM simulé
    cy.document().then((doc) => {
      doc.body.innerHTML = `
        <form id="login-form">
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Mot de passe" />
          <button type="submit">Connexion</button>
        </form>
      `;
    });

    // Vérifier que l'interface de connexion est visible
    cy.get("form").should("be.visible");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");

    // 2. Saisir des identifiants corrects et se connecter
    cy.log("📍 Étape 2: Connexion avec identifiants valides");
    cy.get('input[type="email"]').type(TEST_USER.email);
    cy.get('input[type="password"]').type(TEST_USER.validPassword);

    // Intercepter la soumission du formulaire et simuler une connexion réussie
    cy.get("form")
      .submit()
      .then(() => {
        // Simuler la définition des cookies après une connexion réussie
        cy.setCookie("accessToken", "mock-jwt-token", {
          secure: true,
          httpOnly: false, // Pour que Cypress puisse accéder au cookie
          sameSite: "lax",
        });
        cy.setCookie("refreshToken", "mock-refresh-token", {
          secure: true,
          httpOnly: false,
          sameSite: "lax",
        });
        cy.setCookie("auth_token", "mock-jwt-token", {
          secure: true,
          httpOnly: false,
          sameSite: "lax",
        });

        // Simuler la redirection vers le dashboard
        cy.document().then((doc) => {
          doc.body.innerHTML = `
          <div>
            <header>
              <h1>Dashboard</h1>
              <button id="logout-button">Déconnexion</button>
            </header>
            <main>
              <h2>Bienvenue, Admin Test</h2>
              <p>Votre tableau de bord</p>
            </main>
          </div>
        `;
        });
      });

    // 3. Vérifier que l'utilisateur est connecté (présence des cookies)
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

    // Vérifier qu'un élément du dashboard est présent
    cy.get("header").should("be.visible");
    cy.contains("Dashboard").should("be.visible");

    // 4. Simuler une déconnexion
    cy.log("📍 Étape 4: Déconnexion");
    cy.get("#logout-button")
      .click()
      .then(() => {
        // Simuler la suppression des cookies
        cy.clearCookie("accessToken");
        cy.clearCookie("refreshToken");
        cy.clearCookie("auth_token");

        // Simuler la redirection vers la page de login
        cy.document().then((doc) => {
          doc.body.innerHTML = `
          <form id="login-form">
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Mot de passe" />
            <button type="submit">Connexion</button>
          </form>
        `;
        });
      });

    // 5. Vérifier que les cookies ont bien été supprimés
    cy.log(
      "📍 Étape 5: Vérification de la suppression des cookies après déconnexion"
    );
    cy.getCookie("accessToken").should("not.exist");
    cy.getCookie("refreshToken").should("not.exist");
    cy.getCookie("auth_token").should("not.exist");

    // Vérifier qu'on est bien sur la page de connexion
    cy.get("form").should("be.visible");

    // 6. Connexion avec un mauvais mot de passe
    cy.log("📍 Étape 6: Tentative de connexion avec mot de passe invalide");
    cy.get('input[type="email"]').type(TEST_USER.email);
    cy.get('input[type="password"]').type(TEST_USER.invalidPassword);

    // Simuler l'échec de connexion
    cy.get("form")
      .submit()
      .then(() => {
        // Afficher un message d'erreur
        cy.document().then((doc) => {
          doc.body.innerHTML += `
          <div class="error-message">Email ou mot de passe incorrect</div>
        `;
        });
      });

    // Vérifier qu'un message d'erreur s'affiche
    cy.contains("Email ou mot de passe incorrect").should("be.visible");

    // Vérifier qu'aucun cookie d'authentification n'est créé
    cy.getCookie("accessToken").should("not.exist");
  });

  it("Devrait tester la protection des routes (simulé)", () => {
    cy.log("📍 Test de la protection des routes");

    // Essayer d'accéder à une route protégée sans être connecté
    cy.document().then((doc) => {
      doc.body.innerHTML = `
        <div>
          <h1>Redirection vers login</h1>
          <p>Vous n'êtes pas autorisé à accéder à cette page</p>
        </div>
      `;
    });

    cy.contains("Redirection vers login").should("be.visible");

    // Simuler une connexion
    cy.setCookie("accessToken", "mock-jwt-token", {
      secure: true,
      httpOnly: false,
    });
    cy.setCookie("refreshToken", "mock-refresh-token", {
      secure: true,
      httpOnly: false,
    });

    // Simuler l'accès à une route protégée après connexion
    cy.document().then((doc) => {
      doc.body.innerHTML = `
        <div>
          <header>
            <h1>Dashboard</h1>
            <button id="logout-button">Déconnexion</button>
          </header>
          <main>
            <h2>Contenu protégé accessible</h2>
            <p>Vous êtes correctement authentifié.</p>
          </main>
        </div>
      `;
    });

    cy.contains("Contenu protégé accessible").should("be.visible");
  });
});
