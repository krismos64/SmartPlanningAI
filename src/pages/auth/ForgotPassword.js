import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useNotification } from "../../components/ui/Notification";

// Composants stylisés
const Container = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const Title = styled.h1`
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const Text = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}33`};
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}dd`};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }
`;

const LinkText = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const SuccessContainer = styled.div`
  background-color: ${({ theme }) => `${theme.colors.success}22`};
  border: 1px solid ${({ theme }) => theme.colors.success};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 1rem;
  margin-bottom: 1.5rem;

  p {
    color: ${({ theme }) => theme.colors.success};
    text-align: center;
    margin: 0;
  }
`;

// Composant principal
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showNotification({
        type: "error",
        title: "Champ requis",
        message: "Veuillez saisir votre adresse email.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simuler une réponse réussie (à remplacer par un appel API réel)
      setTimeout(() => {
        setIsSuccess(true);
        setIsSubmitting(false);
        showNotification({
          type: "success",
          title: "Email envoyé",
          message:
            "Si votre adresse email est associée à un compte, vous recevrez un lien pour réinitialiser votre mot de passe.",
        });
      }, 1500);
    } catch (error) {
      showNotification({
        type: "error",
        title: "Erreur",
        message: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Title>Mot de passe oublié</Title>

      {!isSuccess ? (
        <>
          <Text>
            Entrez votre adresse email et nous vous enverrons un lien pour
            réinitialiser votre mot de passe.
          </Text>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </FormGroup>

            <Button type="submit" disabled={isSubmitting || !email}>
              {isSubmitting
                ? "Envoi en cours..."
                : "Envoyer le lien de réinitialisation"}
            </Button>
          </Form>
        </>
      ) : (
        <>
          <SuccessContainer>
            <p>Email envoyé avec succès!</p>
          </SuccessContainer>

          <Text>
            Si votre adresse email est associée à un compte, vous recevrez un
            lien pour réinitialiser votre mot de passe. Vérifiez également votre
            dossier de spam.
          </Text>
        </>
      )}

      <LinkText>
        <Link to="/login">Retour à la page de connexion</Link>
      </LinkText>
    </Container>
  );
};

export default ForgotPassword;
