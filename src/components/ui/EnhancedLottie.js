import lottieWeb from "lottie-web";
import { useEffect, useRef } from "react";

// Composant sécurisé pour les animations Lottie qui évite les problèmes de destroy()
const EnhancedLottie = ({
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

  useEffect(() => {
    let animInstance = null;

    if (containerRef.current) {
      try {
        animInstance = lottieWeb.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop,
          autoplay,
          animationData,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
            progressiveLoad: true,
          },
        });

        // Stocker l'instance d'animation pour le nettoyage
        animationRef.current = animInstance;
      } catch (err) {
        console.warn("Erreur lors du chargement de l'animation:", err);
      }
    }

    // Fonction de nettoyage
    return () => {
      if (animInstance) {
        try {
          // Protection contre les erreurs de destroy
          if (
            animInstance.destroy &&
            typeof animInstance.destroy === "function"
          ) {
            animInstance.destroy();
          }
        } catch (err) {
          console.warn("Erreur lors de la destruction de l'animation:", err);
        }

        // S'assurer que la référence est nulle
        animationRef.current = null;
      }
    };
  }, [animationData, loop, autoplay]);

  return (
    <div
      ref={containerRef}
      style={{ width, height }}
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};

export default EnhancedLottie;
