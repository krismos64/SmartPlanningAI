import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import CookieConsent from "../components/ui/CookieConsent";
import GoogleLoginButton from "../components/ui/GoogleLoginButton";
import { buildApiUrl } from "../utils/apiHelpers";

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Vérifie si une erreur est présente dans l'URL
    const searchParams = new URLSearchParams(location.search);
    const errorParam = searchParams.get("error");

    if (errorParam) {
      switch (errorParam) {
        case "google-auth-failed":
          setError(
            "L'authentification avec Google a échoué. Veuillez réessayer."
          );
          break;
        case "no-token":
          setError("Erreur lors de la connexion: token manquant");
          break;
        case "auth-failed":
          setError("Échec de l'authentification. Veuillez réessayer.");
          break;
        case "server-error":
          setError(
            "Une erreur serveur est survenue. Veuillez réessayer plus tard."
          );
          break;
        default:
          setError("Une erreur est survenue lors de la connexion");
      }
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Utiliser buildApiUrl pour construire l'URL complète avec le port correct
      const loginUrl = buildApiUrl("/api/auth/login");
      console.log(`🔄 [Login] URL d'authentification utilisée: ${loginUrl}`);

      // Appel réel à l'API pour la connexion
      const response = await axios.post(
        loginUrl,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data && response.data.token) {
        // Stocker le token dans localStorage
        localStorage.setItem("auth_token", response.data.token);

        // Vérifier si l'utilisateur a déjà accepté les cookies
        const cookieConsent = localStorage.getItem("cookieConsent");

        if (!cookieConsent) {
          // Si c'est la première connexion, afficher le consentement
          setShowCookieConsent(true);
        } else {
          // Sinon, rediriger directement vers le dashboard
          navigate("/dashboard");
        }
      } else {
        setError("Réponse du serveur invalide. Veuillez réessayer.");
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError(err.response?.data?.message || t("login.error"));
      setIsLoading(false);
    }
  };

  const handleCookieConsentClosed = () => {
    // Une fois que l'utilisateur a fait son choix pour les cookies, rediriger vers le dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <div>
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t("login.title")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t("login.subtitle")}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                {t("login.email")}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder={t("login.email")}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t("login.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder={t("login.password")}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                {t("login.remember")}
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                {t("login.forgot")}
              </a>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {isLoading ? t("login.loading") : t("login.button")}
            </button>
          </div>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {t("login.or")}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleLoginButton />
            </div>
          </div>
        </form>
      </div>

      {/* Composant de consentement aux cookies */}
      <CookieConsent
        show={showCookieConsent}
        onClose={handleCookieConsentClosed}
      />
    </div>
  );
};

export default LoginPage;
