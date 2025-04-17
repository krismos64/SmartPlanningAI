import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import PageContainer from "../../components/PageContainer";
import { api } from "../../utils/api";

const VerifyEmail = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Extraire le token de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const emailToken = urlParams.get("token");

        if (!emailToken) {
          setError("Token de vérification manquant");
          setLoading(false);
          return;
        }

        setToken(emailToken);

        // Appeler l'API pour vérifier le token
        const response = await api.post("/auth/verify-email", {
          token: emailToken,
        });
        const data = await response.json();

        if (data.success) {
          // Rediriger vers la page de connexion après une vérification réussie
          setTimeout(() => {
            navigate("/login?verified=true");
          }, 2000);
        } else {
          setError(data.message || "Échec de la vérification de l'email");
          setLoading(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'email:", error);
        setError(
          "Une erreur s'est produite lors de la vérification de votre email"
        );
        setLoading(false);
      }
    };

    verifyToken();

    return () => {
      // Nettoyage éventuel
    };
  }, [navigate]);

  return (
    <PageContainer>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
          <p className="mt-4 text-center text-gray-600">
            Vérification de votre email en cours...
          </p>
        </div>
      ) : (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
          {error ? (
            <div className="text-center">
              <div className="text-red-500 text-xl mb-4">
                <i className="fas fa-times-circle text-3xl mb-2"></i>
                <p>Échec de la vérification</p>
              </div>
              <p className="text-gray-700 mb-4">{error}</p>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-green-500 text-xl mb-4">
                <i className="fas fa-check-circle text-3xl mb-2"></i>
                <p>Email vérifié avec succès!</p>
              </div>
              <p className="text-gray-700 mb-4">
                Votre adresse email a été vérifiée. Vous allez être redirigé
                vers la page de connexion.
              </p>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default VerifyEmail;
