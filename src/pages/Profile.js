import { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../components/ui/Notification";

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
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    username: user?.username || "",
    phone: user?.phone || "",
    company: user?.company || "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Mettre à jour les données du formulaire lorsque l'utilisateur change
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.username || "",
        phone: user.phone || "",
        company: user.company || "",
      });
    }
  }, [user]);

  // Obtenir les initiales de l'utilisateur
  const getInitials = () => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username ? user.username[0].toUpperCase() : "U";
  };

  // Obtenir le nom complet de l'utilisateur
  const getFullName = () => {
    if (!user) return "Utilisateur";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || "Utilisateur";
  };

  // Obtenir le rôle de l'utilisateur en français
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

  // Mise à jour du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) {
      newErrors.firstName = "Le prénom est requis";
    }

    if (!formData.lastName) {
      newErrors.lastName = "Le nom est requis";
    }

    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email est invalide";
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

    setIsLoading(true);

    try {
      // Simuler une requête API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showNotification({
        type: "success",
        title: "Profil mis à jour",
        message: "Vos informations ont été mises à jour avec succès",
      });
    } catch (error) {
      showNotification({
        type: "error",
        title: "Erreur",
        message: "Une erreur est survenue lors de la mise à jour du profil",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileContainer>
      <PageHeader>
        <PageTitle>Mon profil</PageTitle>
        <PageDescription>
          Gérez vos informations personnelles et vos préférences.
        </PageDescription>
      </PageHeader>

      <ProfileCard>
        <ProfileHeader>
          <Avatar>{getInitials()}</Avatar>
          <ProfileInfo>
            <ProfileName>{getFullName()}</ProfileName>
            <ProfileRole>{getUserRole()}</ProfileRole>
            <ProfileEmail>{user?.email}</ProfileEmail>
          </ProfileInfo>
        </ProfileHeader>

        <ProfileForm onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Informations personnelles</SectionTitle>
            <FormGroup>
              <FormLabel htmlFor="firstName">Prénom</FormLabel>
              <FormInput
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Votre prénom"
                error={errors.firstName}
              />
              {errors.firstName && (
                <ErrorMessage>{errors.firstName}</ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="lastName">Nom</FormLabel>
              <FormInput
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Votre nom"
                error={errors.lastName}
              />
              {errors.lastName && (
                <ErrorMessage>{errors.lastName}</ErrorMessage>
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
              <FormLabel htmlFor="username">Nom d'utilisateur</FormLabel>
              <FormInput
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Votre nom d'utilisateur"
                disabled
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
            <SecondaryButton type="button">Annuler</SecondaryButton>
            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading
                ? "Enregistrement..."
                : "Enregistrer les modifications"}
            </PrimaryButton>
          </FormActions>
        </ProfileForm>
      </ProfileCard>
    </ProfileContainer>
  );
};

export default Profile;
