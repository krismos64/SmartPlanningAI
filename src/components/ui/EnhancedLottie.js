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
  }, [animationData, options, loop, autoplay]);

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
