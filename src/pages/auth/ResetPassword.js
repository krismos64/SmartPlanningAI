import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  border: 1px solid
    ${({ theme, error }) => (error ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme, error }) =>
      error ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 2px
      ${({ theme, error }) =>
        error ? `${theme.colors.error}33` : `${theme.colors.primary}33`};
  }
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.8rem;
  margin-top: 0.25rem;
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

const ErrorContainer = styled.div`
  background-color: ${({ theme }) => `${theme.colors.error}22`};
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 1rem;
  margin-bottom: 1.5rem;

  p {
    color: ${({ theme }) => theme.colors.error};
    text-align: center;
    margin: 0;
  }
`;

// Composant principal
const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const [errors, setErrors] = useState({});

  const { token } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Vérifier la validité du token
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsTokenChecked(true);
        return;
      }

      try {
        // Simuler une vérification de token (à remplacer par un appel API réel)
        setTimeout(() => {
          // Pour la démonstration, on considère le token comme valide
          setIsTokenValid(true);
          setIsTokenChecked(true);
        }, 1000);

        // Code réel à implémenter:
        // const response = await fetch(`${API_URL}/api/auth/verify-reset-token/${token}`);
        // if (response.ok) {
        //   setIsTokenValid(true);
        // } else {
        //   setIsTokenValid(false);
        // }
        // setIsTokenChecked(true);
      } catch (error) {
        setIsTokenValid(false);
        setIsTokenChecked(true);
      }
    };

    verifyToken();
  }, [token]);

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
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

    setIsSubmitting(true);

    try {
      // Simuler une réponse réussie (à remplacer par un appel API réel)
      setTimeout(() => {
        setIsSuccess(true);
        setIsSubmitting(false);
        showNotification({
          type: "success",
          title: "Mot de passe réinitialisé",
          message:
            "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
        });

        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }, 1500);

      // Code réel à implémenter:
      // const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ token, password }),
      // });

      // if (response.ok) {
      //   setIsSuccess(true);
      //   showNotification({
      //     type: 'success',
      //     title: 'Mot de passe réinitialisé',
      //     message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.'
      //   });
      //
      //   // Rediriger vers la page de connexion après 3 secondes
      //   setTimeout(() => {
      //     navigate('/login');
      //   }, 3000);
      // } else {
      //   const errorData = await response.json();
      //   showNotification({
      //     type: 'error',
      //     title: 'Erreur',
      //     message: errorData.message || 'Une erreur est survenue. Veuillez réessayer.'
      //   });
      // }
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

  // Afficher un écran de chargement pendant la vérification du token
  if (!isTokenChecked) {
    return (
      <Container>
        <Title>Réinitialisation du mot de passe</Title>
        <Text>Vérification du lien de réinitialisation...</Text>
      </Container>
    );
  }

  // Afficher une erreur si le token est invalide
  if (!isTokenValid) {
    return (
      <Container>
        <Title>Lien invalide</Title>
        <ErrorContainer>
          <p>Le lien de réinitialisation est invalide ou a expiré.</p>
        </ErrorContainer>
        <Text>
          Veuillez demander un nouveau lien de réinitialisation de mot de passe.
        </Text>
        <LinkText>
          <Link to="/forgot-password">Demander un nouveau lien</Link>
        </LinkText>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Réinitialisation du mot de passe</Title>

      {!isSuccess ? (
        <>
          <Text>Veuillez créer un nouveau mot de passe pour votre compte.</Text>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                required
              />
              {errors.password && <ErrorText>{errors.password}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!errors.confirmPassword}
                required
              />
              {errors.confirmPassword && (
                <ErrorText>{errors.confirmPassword}</ErrorText>
              )}
            </FormGroup>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Réinitialisation en cours..."
                : "Réinitialiser le mot de passe"}
            </Button>
          </Form>
        </>
      ) : (
        <>
          <SuccessContainer>
            <p>Mot de passe réinitialisé avec succès!</p>
          </SuccessContainer>

          <Text>
            Votre mot de passe a été réinitialisé. Vous allez être redirigé vers
            la page de connexion.
          </Text>

          <LinkText>
            <Link to="/login">Aller à la page de connexion</Link>
          </LinkText>
        </>
      )}
    </Container>
  );
};

export default ResetPassword;
