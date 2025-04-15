import robotAnimation from "../../assets/animations/robot.json";
import EnhancedLottie from "./EnhancedLottie";

/**
 * Composant d'animation optimisé pour le chatbot
 * Extrait pour faciliter le debug et la maintenance
 */
const ChatbotLottieAnimation = ({
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  console.log(
    "Rendu ChatbotLottieAnimation, isHovered:",
    isHovered,
    "onClick défini:",
    !!onClick
  );

  // Gestionnaire de clic direct pour éviter tout problème
  const handleClick = (e) => {
    console.log("ANIMATION CLIQUÉE - GESTIONNAIRE INTERNE");

    // Empêcher la propagation pour éviter les conflits
    e.stopPropagation();

    // Appeler directement la fonction onClick passée
    if (typeof onClick === "function") {
      console.log("Exécution directe du gestionnaire onClick");
      onClick(e);
    } else {
      console.error("Erreur: onClick n'est pas une fonction!", onClick);
    }
  };

  const options = {
    loop: true,
    autoplay: true,
    animationData: robotAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <>
      {/* Overlay de débogage pour capter les clics */}
      <div
        onClick={handleClick}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "100px",
          height: "100px",
          backgroundColor: "rgba(255,255,255,0.2)",
          borderRadius: "50%",
          zIndex: 9999,
          cursor: "pointer",
          border: "2px dashed #ff4081",
        }}
      />

      <div
        className="chatbot-toggle-lottie"
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-label="Ouvrir l'assistant"
        role="button"
        tabIndex={0}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9998,
          cursor: "pointer",
          transition: "all 0.3s ease",
          width: isHovered ? "100px" : "80px",
          height: isHovered ? "100px" : "80px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "none",
          background: "transparent",
          outline: "none",
        }}
      >
        <EnhancedLottie
          options={options}
          height="100%"
          width="100%"
          isStopped={false}
          isPaused={false}
          animationData={robotAnimation}
          className="lottie-animation"
          onClick={handleClick}
        />
      </div>
    </>
  );
};

export default ChatbotLottieAnimation;
