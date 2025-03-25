/**
 * Utilitaires d'authentification pour le frontend
 */

/**
 * Récupère le token JWT depuis le localStorage
 * @returns {string|null} Le token d'authentification ou null s'il n'existe pas
 */
export const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Vérifie si l'utilisateur est connecté en vérifiant la présence d'un token
 * @returns {boolean} true si l'utilisateur est connecté, false sinon
 */
export const isLoggedIn = () => {
  return !!getToken();
};

/**
 * Enregistre le token dans le localStorage
 * @param {string} token - Le token d'authentification à enregistrer
 */
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

/**
 * Supprime les informations d'authentification du localStorage
 */
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Extrait les informations de base du token JWT (sans vérification)
 * @param {string} token - Le token JWT à décoder
 * @returns {Object|null} Les informations décodées ou null en cas d'erreur
 */
export const decodeToken = (token) => {
  if (!token) return null;

  try {
    // Extraction de la partie payload du token (2ème partie)
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Erreur lors du décodage du token:", error);
    return null;
  }
};
