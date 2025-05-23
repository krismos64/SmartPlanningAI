/**
 * Bouton d'inscription Google
 * Redirige l'utilisateur vers l'API d'authentification Google pour l'inscription
 */
import { getApiUrl } from "../../utils/api";

const GoogleSignupButton = () => {
  const handleGoogleSignup = () => {
    // Utiliser la fonction getApiUrl
    console.log("API URL utilisée:", getApiUrl());

    // URL correcte pour Google OAuth
    const authUrl = getApiUrl("/auth/google");

    console.log(`Redirection vers l'inscription Google: ${authUrl}`);
    window.location.href = authUrl;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignup}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "12px 16px",
        backgroundColor: "#fff",
        color: "#444",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
        fontSize: "16px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "box-shadow 0.2s ease-in-out",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)")
      }
      aria-label="S'inscrire avec Google"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Logo Google"
        style={{ width: "24px", height: "24px" }}
      />
      <span>S'inscrire avec Google</span>
    </button>
  );
};

export default GoogleSignupButton;
