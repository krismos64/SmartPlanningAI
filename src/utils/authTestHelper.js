/**
 * Utilitaire pour tester l'authentification et la déconnexion
 * Aide au diagnostic des problèmes liés à l'authentification
 */

// Vérifier l'état d'authentification actuel
export const checkAuthState = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return {
    hasToken: !!token,
    tokenValue: token ? `${token.substring(0, 10)}...` : null,
    hasUser: !!user,
    userData: user,
    tokenExpiration: token ? getTokenExpiration(token) : null,
    tokenIsExpired: token ? isTokenExpired(token) : false,
  };
};

// Décoder un token JWT sans bibliothèque externe
export const decodeToken = (token) => {
  try {
    if (!token) return null;

    // Extraire le payload (deuxième partie du token)
    const payload = token.split(".")[1];
    // Décoder la chaîne base64
    const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    // Convertir en objet
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("Erreur lors du décodage du token:", error);
    return null;
  }
};

// Obtenir la date d'expiration du token
export const getTokenExpiration = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;

    // Convertir le timestamp en date
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

// Vérifier si le token est expiré
export const isTokenExpired = (token) => {
  const expiration = getTokenExpiration(token);
  return expiration ? expiration < new Date() : true;
};

// Simuler une connexion
export const simulateLogin = (userData = null) => {
  // Données utilisateur par défaut si non spécifiées
  const defaultUser = {
    id: 1,
    name: "Utilisateur Test",
    email: "test@example.com",
    role: "user",
  };

  const user = userData || defaultUser;

  // Créer un token factice avec une expiration dans 1h
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // +1h

  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: now,
    exp: exp,
  };

  // Encoder en base64 pour simuler un JWT
  const payloadBase64 = btoa(JSON.stringify(payload));
  const fakeToken = `header.${payloadBase64}.signature`;

  // Sauvegarder dans localStorage
  localStorage.setItem("token", fakeToken);
  localStorage.setItem("user", JSON.stringify(user));

  return {
    success: true,
    message: "Connexion simulée réussie",
    user,
    token: fakeToken,
  };
};

// Simuler une déconnexion
export const simulateLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  return {
    success: true,
    message: "Déconnexion simulée réussie",
  };
};

// Tester l'état de la session
export const testSessionState = () => {
  try {
    // Vérifier la présence des données d'authentification
    const authState = checkAuthState();

    // Analyser l'URL actuelle pour les problèmes connus
    const url = window.location.href;
    const hasRedirectParam = url.includes("redirect=");
    const hasErrorParam = url.includes("error=");

    // Vérifier si nous sommes sur une page d'authentification
    const isAuthPage = ["/login", "/register", "/forgot-password"].some(
      (page) => window.location.pathname.includes(page)
    );

    return {
      authState,
      urlAnalysis: {
        currentUrl: url,
        hasRedirectParam,
        hasErrorParam,
        isAuthPage,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Fonction pour aider au débogage
export const printAuthDebugInfo = () => {
  const testResult = testSessionState();
  console.group("📊 Diagnostic d'authentification");

  if (testResult.error) {
    console.error("❌ Erreur lors du diagnostic:", testResult.message);
  } else {
    // État d'authentification
    console.group("🔑 État d'authentification");
    const { authState } = testResult;
    console.log(`Token présent: ${authState.hasToken ? "✅" : "❌"}`);
    if (authState.hasToken) {
      console.log(`Token: ${authState.tokenValue}`);
      console.log(`Expiration: ${authState.tokenExpiration}`);
      console.log(`Expiré: ${authState.tokenIsExpired ? "✅" : "❌"}`);
    }
    console.log(`Données utilisateur: ${authState.hasUser ? "✅" : "❌"}`);
    if (authState.hasUser) {
      console.log("Utilisateur:", authState.userData);
    }
    console.groupEnd();

    // Analyse de l'URL
    console.group("🔍 Analyse de l'URL");
    const { urlAnalysis } = testResult;
    console.log(`URL actuelle: ${urlAnalysis.currentUrl}`);
    console.log(`Sur une page d'auth: ${urlAnalysis.isAuthPage ? "✅" : "❌"}`);
    console.log(
      `Paramètre de redirection: ${urlAnalysis.hasRedirectParam ? "✅" : "❌"}`
    );
    console.log(
      `Paramètre d'erreur: ${urlAnalysis.hasErrorParam ? "✅" : "❌"}`
    );
    console.groupEnd();
  }

  console.log("⏱️ Horodatage:", testResult.timestamp);
  console.groupEnd();

  return testResult;
};

// Fonctions d'aide pour tester le cycle d'authentification complet
export const testAuthenticationFlow = async () => {
  console.group("🔄 Test du cycle d'authentification");

  // 1. État initial
  console.log("1. Vérification de l'état initial");
  let state = checkAuthState();
  console.log("État initial:", state);

  // 2. Simuler une déconnexion pour partir d'un état propre
  console.log("2. Nettoyage de l'état d'authentification");
  simulateLogout();
  state = checkAuthState();
  console.log("État après nettoyage:", state);

  // 3. Simuler une connexion
  console.log("3. Simulation d'une connexion");
  const loginResult = simulateLogin();
  console.log("Résultat de la connexion:", loginResult);
  state = checkAuthState();
  console.log("État après connexion:", state);

  // 4. Simuler une déconnexion
  console.log("4. Simulation d'une déconnexion");
  const logoutResult = simulateLogout();
  console.log("Résultat de la déconnexion:", logoutResult);
  state = checkAuthState();
  console.log("État final:", state);

  console.groupEnd();

  return {
    success: !state.hasToken && !state.hasUser,
    initialState: state,
  };
};

// Si ce fichier est importé dans la console du navigateur, exécuter le diagnostic
if (typeof window !== "undefined") {
  // Attacher les fonctions à window pour une utilisation facile dans la console
  window.authUtils = {
    checkAuthState,
    simulateLogin,
    simulateLogout,
    testSessionState,
    printAuthDebugInfo,
    testAuthenticationFlow,
  };

  console.log(
    "📢 Utilitaires d'authentification disponibles via window.authUtils"
  );
  console.log(
    "Essayez 'window.authUtils.printAuthDebugInfo()' pour diagnostiquer l'authentification"
  );
}
