import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import planningAnimation from "../../assets/animations/planning-animation.json";
import EnhancedLottie from "../../components/ui/EnhancedLottie";
import GoogleSignupButton from "../../components/ui/GoogleSignupButton";
import { useNotification } from "../../components/ui/Notification";
import { useAuth } from "../../contexts/AuthContext";
import { getApiUrl, getCsrfToken } from "../../utils/api";

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
const RegisterContainer = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  animation: ${fadeInUp} 0.5s ease-out;
`;

const RegisterHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LogoAnimation = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  animation: ${pulse} 2s infinite ease-in-out;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid
    ${({ theme, error }) => (error ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme, error }) =>
      error ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 2px
      ${({ theme, error }) =>
        error ? `${theme.colors.error}33` : `${theme.colors.primary}33`};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.875rem;
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}dd`};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

const LinkContainer = styled.div`
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Divider = styled.div`
  text-align: center;
  margin: 20px 0;

  span {
    padding: 0 10px;
    background-color: ${({ theme }) => theme.colors.surface};
  }
`;

const GoogleButtonContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

// Composant Register
const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    company: "",
    phone: "",
    jobTitle: "",
    profileImage: null,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    company: "",
    phone: "",
    jobTitle: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { register, loginWithGoogle } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Effet pour la sécurité et le nettoyage
  useEffect(() => {
    return () => {
      // Nettoyage lors du démontage
    };
  }, []);

  // Mise à jour du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gérer le clic sur le bouton d'upload
  const handleAvatarUploadClick = () => {
    fileInputRef.current.click();
  };

  // Gérer le changement de fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification({
          type: "error",
          title: "Fichier trop volumineux",
          message: "La taille de l'image ne doit pas dépasser 5MB",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Prévisualisation de l'image
        setProfileImagePreview(reader.result);

        // Stocker l'image en base64 (sans le préfixe data:image/jpeg;base64,)
        const base64String = reader.result.split(",")[1];

        // Vérifier la taille de la chaîne base64
        if (base64String.length > 2 * 1024 * 1024) {
          // ~2MB en base64
          showNotification({
            type: "error",
            title: "Image trop volumineuse",
            message:
              "Veuillez choisir une image de plus petite taille ou de qualité inférieure",
          });
          return;
        }

        setFormData((prev) => ({
          ...prev,
          profileImage: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (!formData.first_name) {
      newErrors.first_name = "Le prénom est requis";
    }

    if (!formData.last_name) {
      newErrors.last_name = "Le nom est requis";
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
      const { confirmPassword, ...registrationData } = formData;

      // Vérifier si le token CSRF est présent
      const csrfToken = getCsrfToken();
      console.log(
        "Token CSRF avant inscription:",
        csrfToken ? "Présent" : "Absent"
      );

      // La récupération du token CSRF est gérée automatiquement via l'interceptor

      // Utiliser le register du contexte Auth qui a été corrigé
      const result = await register(registrationData);

      if (result) {
        showNotification({
          type: "success",
          message:
            "Inscription réussie ! Vous pouvez maintenant vous connecter.",
        });
        navigate("/login");
      } else {
        showNotification({
          type: "error",
          message: "Erreur lors de l'inscription",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      showNotification({
        type: "error",
        message:
          error.message || "Une erreur est survenue lors de l'inscription",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer l'inscription avec Google
  const handleGoogleSignup = async () => {
    // Rediriger vers l'endpoint d'authentification Google
    window.location.href = getApiUrl("/auth/google");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 200px)",
      }}
    >
      <RegisterContainer>
        <RegisterHeader>
          <LogoAnimation>
            <EnhancedLottie animationData={planningAnimation} loop={true} />
          </LogoAnimation>
          <h1>Créer un compte</h1>
          <p>Rejoignez SmartPlanning dès aujourd'hui</p>
        </RegisterHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="first_name">Prénom *</Label>
            <Input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Entrez votre prénom"
              error={!!errors.first_name}
            />
            {errors.first_name && (
              <ErrorMessage>{errors.first_name}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="last_name">Nom *</Label>
            <Input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Entrez votre nom"
              error={!!errors.last_name}
            />
            {errors.last_name && (
              <ErrorMessage>{errors.last_name}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Entrez votre email"
              error={!!errors.email}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Mot de passe *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Entrez votre mot de passe"
              error={!!errors.password}
            />
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirmez votre mot de passe"
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <ErrorMessage>{errors.confirmPassword}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="jobTitle">Fonction</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              type="text"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="Votre fonction (optionnel)"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="company">Entreprise</Label>
            <Input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              placeholder="Votre entreprise (optionnel)"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Votre numéro de téléphone (optionnel)"
            />
          </FormGroup>

          <FormGroup>
            <Label>Photo de profil (optionnel)</Label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginTop: "0.5rem",
              }}
            >
              {profileImagePreview && (
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "1px solid #ddd",
                  }}
                >
                  <img
                    src={profileImagePreview}
                    alt="Aperçu"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
              <Button
                type="button"
                onClick={handleAvatarUploadClick}
                style={{
                  backgroundColor: "#f0f0f0",
                  color: "#333",
                  padding: "0.5rem 1rem",
                }}
              >
                Choisir une image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
          </FormGroup>

          <div
            style={{ fontSize: "0.8rem", color: "#666", marginBottom: "1rem" }}
          >
            * Champs obligatoires
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </Form>

        <Divider style={{ margin: "20px 0" }}>
          <span>Ou</span>
        </Divider>

        <GoogleButtonContainer>
          <GoogleSignupButton />
        </GoogleButtonContainer>

        <LinkContainer>
          Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
        </LinkContainer>
      </RegisterContainer>
    </div>
  );
};

export default Register;
