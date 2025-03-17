import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import planningAnimation from "../../assets/animations/planning-animation.json";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../ui/Notification";

// Styles
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
  text-align: center;
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  padding: 2rem;
  max-width: 500px;
  width: 100%;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  font-size: 1.8rem;
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.5;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 1rem;
  font-weight: 500;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${({ theme, variant }) =>
    variant === "primary"
      ? theme.colors.primary
      : variant === "error"
      ? theme.colors.error
      : "transparent"};
  color: ${({ theme, variant }) =>
    variant === "primary" || variant === "error"
      ? "white"
      : theme.colors.text.primary};
  border: ${({ theme, variant }) =>
    variant === "outline" ? `1px solid ${theme.colors.border}` : "none"};
  margin-top: 1rem;
  width: 100%;

  &:hover {
    background-color: ${({ theme, variant }) =>
      variant === "primary"
        ? `${theme.colors.primary}dd`
        : variant === "error"
        ? `${theme.colors.error}dd`
        : `${theme.colors.border}33`};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
`;

// Composant de confirmation de suppression de compte
const ConfirmDeletionPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { confirmAccountDeletion } = useAuth();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Vérifier le token dès le chargement de la page
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Lien de confirmation invalide.");
        setLoading(false);
        return;
      }

      try {
        const result = await confirmAccountDeletion(token);

        if (result.success) {
          setSuccess(true);
          showNotification({
            type: "success",
            title: "Compte supprimé",
            message: "Votre compte a été supprimé avec succès.",
          });
        } else {
          setError(result.message || "Échec de la suppression du compte.");
        }
      } catch (error) {
        setError("Une erreur est survenue lors de la suppression du compte.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, confirmAccountDeletion, showNotification]);

  // Rediriger vers la page d'accueil
  const goToHomePage = () => {
    navigate("/");
  };

  // Rediriger vers la page d'inscription
  const goToRegister = () => {
    navigate("/register");
  };

  // Rendu du contenu en fonction de l'état
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <LoadingContainer>
            <Lottie animationData={planningAnimation} loop={true} />
          </LoadingContainer>
          <Title>Traitement en cours</Title>
          <Message>
            Veuillez patienter pendant que nous traitons votre demande...
          </Message>
        </>
      );
    }

    if (error) {
      return (
        <>
          <Title>Échec de la suppression</Title>
          <ErrorMessage>{error}</ErrorMessage>
          <Message>
            Le lien de confirmation est peut-être expiré ou invalide. Veuillez
            réessayer ou contacter notre support si le problème persiste.
          </Message>
          <Button variant="outline" onClick={goToHomePage}>
            Retour à l'accueil
          </Button>
        </>
      );
    }

    if (success) {
      return (
        <>
          <Title>Compte supprimé avec succès</Title>
          <Message>
            Votre compte a été supprimé définitivement. Nous espérons vous
            revoir bientôt !
          </Message>
          <Button variant="primary" onClick={goToRegister}>
            Créer un nouveau compte
          </Button>
          <Button
            variant="outline"
            onClick={goToHomePage}
            style={{ marginTop: "0.5rem" }}
          >
            Retour à l'accueil
          </Button>
        </>
      );
    }
  };

  return (
    <Container>
      <Card>{renderContent()}</Card>
    </Container>
  );
};

export default ConfirmDeletionPage;
