import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import planningAnimation from "../../assets/animations/planning-animation.json";
import EnhancedLottie from "../../components/ui/EnhancedLottie";
import { useNotification } from "../../components/ui/Notification";
import { apiRequest } from "../../config/api";
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

  // Effet pour obtenir un token CSRF au chargement
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        console.log("Demande de token CSRF...");
        // Vider les cookies existants pour éviter les problèmes
        document.cookie.split(";").forEach(function (c) {
          if (c.trim().startsWith("XSRF-TOKEN=")) {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(
                /=.*/,
                "=;expires=" + new Date().toUTCString() + ";path=/"
              );
            console.log("Cookie CSRF précédent supprimé");
          }
        });

        // Utiliser apiRequest qui gère les credentials correctement
        await apiRequest("/api/csrf-token", "GET");
        console.log("Token CSRF obtenu avec succès");
        console.log("Cookies après obtention du token:", document.cookie);
      } catch (error) {
        console.error("Erreur lors de la récupération du token CSRF:", error);
      }
    };

    fetchCsrfToken();

    return () => {}; // Plus besoin du setInterval pour rafraîchir
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

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Essayer d'obtenir un nouveau token CSRF juste avant l'inscription
    try {
      await apiRequest("/api/csrf-token", "GET");
      console.log("Token CSRF rafraîchi avant inscription");
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token CSRF:", error);
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;

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
    // Temporairement désactivé jusqu'à ce que le backend soit configuré
    showNotification({
      type: "info",
      title: "Fonctionnalité en développement",
      message:
        "L'inscription avec Google sera bientôt disponible. Veuillez utiliser la méthode d'inscription standard pour le moment.",
    });

    // Code commenté jusqu'à ce que le backend soit prêt
    /*
    try {
      await loginWithGoogle();
      // Pas besoin de redirection ici car loginWithGoogle redirige déjà l'utilisateur
    } catch (error) {
      console.error("Erreur lors de l'inscription avec Google:", error);
      showNotification({
        type: "error",
        title: "Erreur d'inscription",
        message: "L'inscription avec Google a échoué. Veuillez réessayer.",
      });
    }
    */
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

        <Button
          type="button"
          onClick={handleGoogleSignup}
          style={{
            backgroundColor: "#fff",
            color: "#333",
            border: "1px solid #ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px",
            width: "100%",
            marginBottom: "20px",
            opacity: "0.7", // Réduire l'opacité pour indiquer que c'est désactivé
            cursor: "default",
          }}
        >
          <svg
            width="18"
            height="18"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          S'inscrire avec Google (Bientôt disponible)
        </Button>

        <LinkContainer>
          Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
        </LinkContainer>
      </RegisterContainer>
    </div>
  );
};

export default Register;
