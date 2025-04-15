import lottieWeb from "lottie-web";
import { useEffect, useRef } from "react";

// Composant sécurisé pour les animations Lottie qui évite les problèmes de destroy()
const EnhancedLottie = ({
  options = {},
  animationData,
  width,
  height,
  loop = true,
  autoplay = true,
  className = "",
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  // Log des props pour débogage
  console.log("EnhancedLottie rendu avec:", {
    hasAnimationData: !!animationData,
    hasOptions: !!options,
    optionsHasAnimationData: !!options?.animationData,
    width,
    height,
    className,
    hasClickHandler: !!onClick,
  });

  // Gestionnaire de clic simplifié et direct
  const handleClick = (e) => {
    console.log("► CLIC SUR ENHANCED LOTTIE DETECTÉ ◄");
    if (typeof onClick === "function") {
      console.log("► EXECUTION DU HANDLER ONCLICK ◄");
      onClick(e);
    }
  };

  useEffect(() => {
    let animInstance = null;

    if (containerRef.current) {
      try {
        // Utiliser soit les options directement, soit l'animationData fourni séparément
        const animationDataToUse = options?.animationData || animationData;

        if (!animationDataToUse) {
          console.error("Aucune animation trouvée pour le composant Lottie");
          return;
        }

        animInstance = lottieWeb.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: options?.loop || loop,
          autoplay: options?.autoplay || autoplay,
          animationData: animationDataToUse,
          rendererSettings: options?.rendererSettings || {
            preserveAspectRatio: "xMidYMid slice",
            progressiveLoad: true,
          },
        });

        // Stocker l'instance d'animation pour le nettoyage
        animationRef.current = animInstance;

        console.log("Animation Lottie chargée avec succès");
      } catch (err) {
        console.error("Erreur lors du chargement de l'animation:", err);
      }
    }

    // Fonction de nettoyage
    return () => {
      if (animationRef.current) {
        try {
          // Protection contre les erreurs de destroy
          if (
            animationRef.current.destroy &&
            typeof animationRef.current.destroy === "function"
          ) {
            animationRef.current.destroy();
          }
        } catch (err) {
          console.warn("Erreur lors de la destruction de l'animation:", err);
        }

        // S'assurer que la référence est nulle
        animationRef.current = null;
      }
    };
  }, [animationData, options, loop, autoplay]);

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        cursor: "pointer",
        pointerEvents: "auto",
        backgroundColor: "rgba(0,0,0,0.05)",
      }}
      className={className || "enhanced-lottie-container"}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};

export default EnhancedLottie;
