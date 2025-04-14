import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Page de redirection après une authentification Google réussie
 * Récupère le token dans l'URL et redirige vers le dashboard
 */
const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fonction pour analyser les paramètres de requête
    const getQueryParam = (param) => {
      const searchParams = new URLSearchParams(location.search);
      return searchParams.get(param);
    };

    // Récupérer le token depuis l'URL
    const token = getQueryParam("token");

    if (token) {
      console.log("Token JWT reçu après authentification Google");

      // Stocker le token dans le localStorage
      localStorage.setItem("auth_token", token);

      // Notifier l'utilisateur que la connexion est réussie
      const successMessage = "Connexion avec Google réussie !";
      if (window.Notification && Notification.permission === "granted") {
        new Notification(successMessage);
      }

      // Rediriger vers le dashboard
      navigate("/dashboard");
    } else {
      console.error("Aucun token reçu dans la redirection");
      navigate("/login?error=no-token");
    }
  }, [navigate, location]);

  // Afficher un message de chargement pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="animate-spin mb-4 mx-auto w-12 h-12 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Connexion en cours...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Vous allez être redirigé vers votre tableau de bord
        </p>
      </div>
    </div>
  );
};

export default LoginSuccess;
