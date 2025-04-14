const GoogleSignupButton = () => {
  const handleGoogleSignup = () => {
    const API_URL =
      process.env.NODE_ENV === "production"
        ? "https://smartplanning-api.onrender.com"
        : "http://localhost:5001";

    window.location.href = `${API_URL}/api/auth/google`;
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
