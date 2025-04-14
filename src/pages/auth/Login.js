import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import planningAnimation from "../../assets/animations/planning-animation.json";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EnhancedLottie from "../../components/ui/EnhancedLottie";
import { FormInput } from "../../components/ui/Form";
import GoogleLoginButton from "../../components/ui/GoogleLoginButton";
import { useNotification } from "../../components/ui/Notification";
import { apiRequest, getCsrfToken } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Composants stylisés
const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.md}`};
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  animation: ${fadeInUp} 0.5s ease-out;
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const LogoAnimation = styled.div`
  width: 120px;
  height: 120px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  animation: ${pulse} 2s infinite ease-in-out;
`;

const Form = styled.form`
  width: 100%;
`;

const FormTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const FormActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const ForgotPassword = styled(Link)`
  text-align: right;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  margin-top: ${({ theme }) => theme.spacing.xs};

  &:hover {
    text-decoration: underline;
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.typography.fontWeights.medium};

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => `${theme.spacing.lg} 0`};

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.border};
  }

  span {
    padding: ${({ theme }) => `0 ${theme.spacing.md}`};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
  }
`;

const SocialButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SocialButton = styled(Button)`
  flex: 1;
`;

// Composant Login
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showNotification } = useNotification();

  // Afficher l'erreur de connexion si elle existe
  const { loginError } = useAuth();
  useEffect(() => {
    if (loginError) {
      showNotification({
        type: "error",
        title: "Erreur de connexion",
        message: loginError,
      });
    }
  }, [loginError, showNotification]);

  // Vérifier les erreurs d'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error === "session_expired") {
      showNotification(
        "Votre session a expiré. Veuillez vous reconnecter.",
        "warning"
      );
    }
  }, [showNotification]);

  // Récupérer le paramètre de redirection
  const [redirectPath, setRedirectPath] = useState("/dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect) {
      console.log("Paramètre de redirection détecté:", redirect);
      setRedirectPath(redirect);
    }
  }, []);

  // Effet pour obtenir un token CSRF au chargement
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        console.log("Demande de token CSRF...");
        // Appeler l'API pour récupérer un token CSRF
        await apiRequest("/api/csrf-token", "GET");
        console.log("Token CSRF obtenu avec succès");
      } catch (error) {
        console.error("Erreur lors de la récupération du token CSRF:", error);
      }
    };

    fetchCsrfToken();

    return () => {}; // Plus besoin du setInterval pour rafraîchir
  }, []);

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "L'email est invalide";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Nettoyage du mot de passe (suppression des espaces et points potentiels à la fin)
    const cleanPassword = password.trim().replace(/[.\s]+$/, "");
    console.log("Mot de passe nettoyé pour connexion");

    // Essayer d'obtenir un nouveau token CSRF juste avant la connexion
    try {
      await apiRequest("/api/csrf-token", "GET");
      console.log("Token CSRF rafraîchi avant connexion");
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token CSRF:", error);
    }

    // Vérifier si le token CSRF est bien présent
    const csrfToken = getCsrfToken();
    console.log(
      "Token CSRF avant connexion:",
      csrfToken ? "Présent" : "Absent"
    );

    setIsLoading(true);

    try {
      console.log("Tentative de connexion avec:", { email, password: "***" });

      // Utiliser la fonction login du contexte d'authentification
      const success = await login(email, cleanPassword);

      console.log("Résultat de la connexion:", success);

      if (success) {
        console.log("Connexion réussie, redirection vers le dashboard");

        // Afficher une notification de succès
        showNotification({
          type: "success",
          title: "Connexion réussie",
          message: "Bienvenue sur SmartPlanning !",
        });

        // Pause plus longue pour s'assurer que tout est bien enregistré et que la notification s'affiche
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Forcer une actualisation complète plutôt qu'une redirection simple
        console.log("Redirection vers le dashboard via window.location.href");
        window.location.href = redirectPath;
      } else {
        console.error("Connexion échouée sans exception", { loginError });

        // Afficher une notification d'erreur
        showNotification({
          type: "error",
          title: "Échec de connexion",
          message: loginError || "Identifiants incorrects. Veuillez réessayer.",
        });
      }
    } catch (error) {
      console.error("Exception lors de la connexion:", error);

      // Afficher une notification d'erreur
      showNotification({
        type: "error",
        title: "Erreur de connexion",
        message:
          error.message || "Une erreur est survenue lors de la connexion.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la connexion avec Google
  const handleGoogleLogin = async () => {
    // Rediriger vers l'endpoint d'authentification Google
    window.location.href = `${
      process.env.NODE_ENV === "production"
        ? "https://smartplanning-api.onrender.com"
        : ""
    }/api/auth/google`;
  };

  return (
    <LoginContainer>
      <LoginCard variant="elevated" padding="2rem">
        <LogoContainer>
          <LogoAnimation>
            <EnhancedLottie animationData={planningAnimation} loop={true} />
          </LogoAnimation>
          <div>SmartPlanning</div>
        </LogoContainer>

        <Form onSubmit={handleSubmit}>
          <FormTitle>Connexion</FormTitle>

          <FormInput
            label="Email"
            id="email"
            type="email"
            placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          <FormInput
            label="Mot de passe"
            id="password"
            type="password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />

          <ForgotPassword to="/forgot-password">
            Mot de passe oublié ?
          </ForgotPassword>

          <FormActions>
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              Se connecter
            </Button>
          </FormActions>

          <Divider>
            <span>Ou</span>
          </Divider>

          <SocialButtons>
            <GoogleLoginButton />
          </SocialButtons>

          <RegisterLink>
            Vous n'avez pas de compte ? <Link to="/register">S'inscrire</Link>
          </RegisterLink>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
