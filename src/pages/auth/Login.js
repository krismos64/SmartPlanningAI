import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import Lottie from "lottie-react";
import planningAnimation from "../../assets/animations/planning-animation.json";
import { FormInput } from "../../components/ui/Form";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useNotification } from "../../components/ui/Notification";

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
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
`;

const SocialButton = styled(Button)`
  flex: 1;
`;

// Composant Login
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { showNotification } = useNotification();

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

    setIsLoading(true);

    try {
      // Corriger l'URL pour utiliser le préfixe /api
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la connexion");
      }

      // Appeler la fonction de connexion
      onLogin(data.user, data.token);

      // Afficher une notification de succès
      showNotification({
        type: "success",
        title: "Connexion réussie",
        message: "Bienvenue sur SmartPlanning AI !",
      });

      // Rediriger vers le tableau de bord
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);

      // Afficher une notification d'erreur
      showNotification({
        type: "error",
        title: "Erreur de connexion",
        message:
          error.message || "Identifiants incorrects. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard variant="elevated" padding="2rem">
        <LogoContainer>
          <LogoAnimation>
            <Lottie animationData={planningAnimation} loop={true} />
          </LogoAnimation>
          <h1>SmartPlanning AI</h1>
          <p>Planifiez intelligemment avec l'IA</p>
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
            <SocialButton
              variant="outline"
              onClick={() => {
                showNotification({
                  type: "info",
                  title: "Information",
                  message:
                    "La connexion avec Google n'est pas encore disponible.",
                });
              }}
            >
              Google
            </SocialButton>
            <SocialButton
              variant="outline"
              onClick={() => {
                showNotification({
                  type: "info",
                  title: "Information",
                  message:
                    "La connexion avec Microsoft n'est pas encore disponible.",
                });
              }}
            >
              Microsoft
            </SocialButton>
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
