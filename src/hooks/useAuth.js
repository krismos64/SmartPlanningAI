import { useEffect, useState } from "react";
import { useAuth as useAuthContext } from "../contexts/AuthContext";

export const useAuth = () => {
  const authContext = useAuthContext();
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // Vérifier la validité du token
  const checkToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("Aucun token trouvé dans le localStorage");
        setIsTokenValid(false);
        return false;
      }

      // Vérifier si le token est un JWT valide
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.error("Format de token invalide - ce n'est pas un JWT");
        setIsTokenValid(false);
        return false;
      }

      // Vérifier l'expiration du token
      try {
        // Préparer le token pour le décodage
        let base64Payload = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
        while (base64Payload.length % 4 !== 0) {
          base64Payload += "=";
        }

        // Décoder la charge utile
        const decodedPayload = atob(base64Payload);
        const decodedData = JSON.parse(decodedPayload);

        const expiry = decodedData.exp;
        const now = Math.floor(Date.now() / 1000);

        // Vérifier si le token est expiré
        if (expiry && expiry < now) {
          console.warn(
            `Token expiré: expiré à ${new Date(
              expiry * 1000
            ).toLocaleString()}, il est maintenant ${new Date().toLocaleString()}`
          );
          setIsTokenValid(false);
          return false;
        }

        console.log(
          `Token valide, expire le ${new Date(expiry * 1000).toLocaleString()}`
        );
        setIsTokenValid(true);
        return true;
      } catch (e) {
        console.error("Erreur lors du décodage du token:", e);
        setIsTokenValid(false);
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);
      setIsTokenValid(false);
      return false;
    } finally {
      setIsCheckingToken(false);
    }
  };

  // Rafraîchir le token si nécessaire
  const refreshTokenIfNeeded = async () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      // Décodage du token pour vérifier l'expiration
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) return false;

      const payload = JSON.parse(atob(tokenParts[1]));
      const expiry = payload.exp;
      const now = Math.floor(Date.now() / 1000);

      // Si le token expire dans moins de 10 minutes, le rafraîchir
      if (expiry && expiry - now < 600) {
        console.log(
          "Token proche de l'expiration, tentative de rafraîchissement"
        );
        return await authContext.refreshToken();
      }

      return true;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      return false;
    }
  };

  // Gérer le logout en cas de token invalide
  const handleInvalidToken = () => {
    if (isTokenValid === false && !isCheckingToken) {
      console.warn("Token invalide détecté, déconnexion");
      authContext.logout();
    }
  };

  // Fonction pour forcer une reconnexion
  const forceReconnect = () => {
    // Effacer les tokens et informations utilisateur
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Rediriger vers la page de connexion avec un paramètre indiquant que la session a expiré
    window.location.href = "/login?error=session_expired";
  };

  // Vérifier le token au chargement du composant
  useEffect(() => {
    checkToken();
  }, []);

  // Vérifier et potentiellement rafraîchir le token à intervalles réguliers
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTokenIfNeeded();
    }, 5 * 60 * 1000); // Vérifier toutes les 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Déconnecter l'utilisateur si le token devient invalide
  useEffect(() => {
    handleInvalidToken();
  }, [isTokenValid, isCheckingToken]);

  return {
    ...authContext,
    isTokenValid,
    isCheckingToken,
    checkToken,
    refreshTokenIfNeeded,
    forceReconnect,
  };
};

export default useAuth;
