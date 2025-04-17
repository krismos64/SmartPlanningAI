import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useNotification } from "../components/ui/Notification";
import { useAuth } from "../contexts/AuthContext";
import { useUserName } from "../hooks/useUserName";
import { buildApiUrl } from "../utils/apiHelpers";

// Composants stylisés
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
`;

const ProfileCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarUploadButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: ${({ theme }) => theme.shadows.small};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProfileName = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ProfileRole = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const ProfileEmail = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

const ProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const FormInput = styled.input`
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 1px solid
    ${({ theme, error }) => (error ? theme.colors.error : theme.colors.border)};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

// Composant Profile
const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showNotification } = useNotification();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { first_name, last_name, fullName, initials } = useUserName(user);

  // Diagnostic des données utilisateur
  useEffect(() => {
    console.log("🔍 Données utilisateur dans Profile:", user);

    // Vérifier si les données utilisateur sont cohérentes
    if (!user) {
      console.warn("⚠️ Aucune donnée utilisateur disponible");
      showNotification({
        type: "warning",
        title: "Attention",
        message:
          "Vos données de profil ne sont pas disponibles. Essayez de vous reconnecter.",
      });
    } else if (user.name === "John Doe" || user.email === "john@example.com") {
      console.warn("⚠️ Données utilisateur par défaut détectées:", user);
      showNotification({
        type: "warning",
        title: "Attention",
        message:
          "Vous semblez utiliser un profil par défaut. Essayez de vous reconnecter avec vos identifiants.",
      });
    }

    // Vérifier également les données utilisateur dans localStorage
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    console.log("🔍 Données utilisateur dans localStorage:", storedUser);

    if (storedUser && JSON.stringify(storedUser) !== JSON.stringify(user)) {
      console.warn(
        "⚠️ Incohérence entre les données en mémoire et dans localStorage"
      );
    }
  }, [user, showNotification]);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    company: user?.company || "",
    phone: user?.phone || "",
    jobTitle: user?.jobTitle || "",
  });

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        company: user.company || "",
        phone: user.phone || "",
        jobTitle: user.jobTitle || "",
      });
    }
  }, [user]);

  const getUserInitials = () => {
    return initials;
  };

  const getUserFullName = () => {
    return fullName;
  };

  const getUserRole = () => {
    if (!user) return "Utilisateur";
    switch (user.role) {
      case "admin":
        return "Administrateur";
      case "manager":
        return "Gestionnaire";
      case "employee":
        return "Employé";
      default:
        return "Utilisateur";
    }
  };

  const handleAvatarUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification({
          type: "error",
          title: "Fichier trop volumineux",
          message: "La taille de l'image ne doit pas dépasser 5MB",
        });
        return;
      }

      const compressImage = (
        file,
        maxWidth = 800,
        maxHeight = 800,
        quality = 0.7
      ) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > maxWidth) {
                  height = Math.round((height * maxWidth) / width);
                  width = maxWidth;
                }
              } else {
                if (height > maxHeight) {
                  width = Math.round((width * maxHeight) / height);
                  height = maxHeight;
                }
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, width, height);

              const dataUrl = canvas.toDataURL("image/jpeg", quality);
              resolve(dataUrl);
            };
          };
        });
      };

      compressImage(file).then((compressedDataUrl) => {
        setPreviewUrl(compressedDataUrl);

        const base64String = compressedDataUrl.split(",")[1];

        if (base64String.length > 2 * 1024 * 1024) {
          showNotification({
            type: "error",
            title: "Image trop volumineuse",
            message:
              "Veuillez choisir une image de plus petite taille ou de qualité inférieure",
          });
          return;
        }

        setProfileImage(base64String);
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Valider le formulaire
      const isValid = validateForm();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      const token = localStorage.getItem("token");

      // Données à envoyer au serveur
      const dataToSend = {
        ...formData,
        ...(profileImage ? { profileImage } : {}),
      };

      console.log("Envoi des données de profil:", {
        ...dataToSend,
        profileImageLength: dataToSend.profileImage
          ? dataToSend.profileImage.length
          : 0,
      });

      // Tenter d'abord avec /api/user/profile
      let response = null;
      let success = false;
      let errorMessage = "Erreur lors de la mise à jour du profil";

      const endpoints = [
        buildApiUrl("/user/profile"),
        buildApiUrl("/auth/profile"),
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Tentative de mise à jour avec: ${endpoint}`);

          response = await fetch(endpoint, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(dataToSend),
            credentials: "include",
          });

          console.log(`Réponse de ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
          });

          if (response.ok) {
            success = true;
            break;
          }
        } catch (endpointError) {
          console.error(`Erreur avec l'endpoint ${endpoint}:`, endpointError);
        }
      }

      if (!success) {
        if (response) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // Si la réponse n'est pas du JSON valide, utiliser le message d'erreur par défaut
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      updateUser(data);

      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        company: data.company || "",
        phone: data.phone || "",
        jobTitle: data.jobTitle || "",
      });

      setPreviewUrl(null);

      showNotification({
        type: "success",
        title: "Profil mis à jour",
        message: "Vos informations ont été mises à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);

      showNotification({
        type: "error",
        title: "Erreur",
        message:
          error.message ||
          "Une erreur est survenue lors de la mise à jour du profil",
      });

      if (
        error.message.includes("fetch") ||
        error.message.includes("network")
      ) {
        showNotification({
          type: "warning",
          title: "Problème avec l'image",
          message:
            "La photo de profil semble poser problème pour être sauvegardée. Essayez avec une image plus petite.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        company: user.company || "",
        jobTitle: user.jobTitle || "",
      });
    }
    setPreviewUrl(null);
    setErrors({});
    setIsEditing(false);
  };

  return (
    <ProfileContainer>
      <PageHeader>
        <PageTitle>Mon profil</PageTitle>
        <PageDescription>Gérez vos informations personnelles.</PageDescription>
      </PageHeader>

      <ProfileCard>
        <ProfileHeader>
          <AvatarContainer>
            <Avatar>
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt="Photo de profil" />
              ) : user?.profileImage ? (
                <AvatarImage
                  src={`data:image/jpeg;base64,${user.profileImage}`}
                  alt="Photo de profil"
                />
              ) : (
                getUserInitials()
              )}
            </Avatar>
            {isEditing && (
              <>
                <AvatarUploadButton
                  onClick={handleAvatarUploadClick}
                  title="Changer la photo de profil"
                >
                  <i className="fas fa-camera"></i>
                </AvatarUploadButton>
                <HiddenFileInput
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </>
            )}
          </AvatarContainer>
          <ProfileInfo>
            <ProfileName>{getUserFullName()}</ProfileName>
            <ProfileRole>{getUserRole()}</ProfileRole>
            <ProfileEmail>{user?.email}</ProfileEmail>
          </ProfileInfo>
        </ProfileHeader>

        {!isEditing ? (
          <FormActions>
            <PrimaryButton onClick={() => setIsEditing(true)}>
              Modifier mon profil
            </PrimaryButton>
          </FormActions>
        ) : (
          <ProfileForm onSubmit={handleSubmit}>
            <FormSection>
              <SectionTitle>Informations personnelles</SectionTitle>
              <FormGroup>
                <FormLabel htmlFor="first_name">Prénom</FormLabel>
                <FormInput
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                  error={errors.first_name}
                />
                {errors.first_name && (
                  <ErrorMessage>{errors.first_name}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="last_name">Nom</FormLabel>
                <FormInput
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  error={errors.last_name}
                />
                {errors.last_name && (
                  <ErrorMessage>{errors.last_name}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormInput
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Votre email"
                  error={errors.email}
                />
                {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="jobTitle">Fonction</FormLabel>
                <FormInput
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="Votre fonction"
                />
              </FormGroup>
            </FormSection>

            <FormSection>
              <SectionTitle>Coordonnées</SectionTitle>
              <FormGroup>
                <FormLabel htmlFor="phone">Téléphone</FormLabel>
                <FormInput
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Votre numéro de téléphone"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="company">Entreprise</FormLabel>
                <FormInput
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Votre entreprise"
                />
              </FormGroup>
            </FormSection>

            <FormActions>
              <SecondaryButton type="button" onClick={handleCancel}>
                Annuler
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Enregistrement..."
                  : "Enregistrer les modifications"}
              </PrimaryButton>
            </FormActions>
          </ProfileForm>
        )}
      </ProfileCard>
    </ProfileContainer>
  );
};

export default Profile;
