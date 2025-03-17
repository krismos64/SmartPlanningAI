import { useState } from "react";
import styled from "styled-components";
import { useTheme } from "../components/ThemeProvider";
import DeleteAccountModal from "../components/modals/DeleteAccountModal";

// Composants stylisés
const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

const SettingsCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const SettingsSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  display: flex;
  flex-direction: column;
`;

const SettingTitle = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const SettingDescription = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.colors.border};
    transition: 0.4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme, variant }) =>
    variant === "primary"
      ? theme.colors.primary
      : variant === "danger"
      ? theme.colors.error
      : "transparent"};
  color: ${({ theme, variant }) =>
    variant === "primary" || variant === "danger"
      ? "white"
      : theme.colors.text.primary};
  border: ${({ theme, variant }) =>
    variant === "outline" ? `1px solid ${theme.colors.border}` : "none"};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, variant }) =>
      variant === "primary"
        ? `${theme.colors.primary}dd`
        : variant === "danger"
        ? `${theme.colors.error}dd`
        : `${theme.colors.border}33`};
  }
`;

// Composant Settings
const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Ouvrir le modal de suppression de compte
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  // Fermer le modal de suppression de compte
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <SettingsContainer>
      <PageHeader>
        <PageTitle>Paramètres</PageTitle>
        <PageDescription>
          Gérez les paramètres de votre application SmartPlanning AI.
        </PageDescription>
      </PageHeader>

      <SettingsCard>
        <SettingsSection>
          <SectionTitle>Apparence</SectionTitle>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Mode sombre</SettingTitle>
              <SettingDescription>
                Basculer entre le mode clair et le mode sombre.
              </SettingDescription>
            </SettingLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span></span>
            </ToggleSwitch>
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>Notifications</SectionTitle>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Notifications par email</SettingTitle>
              <SettingDescription>
                Recevoir des notifications par email pour les événements
                importants.
              </SettingDescription>
            </SettingLabel>
            <ToggleSwitch>
              <input type="checkbox" defaultChecked />
              <span></span>
            </ToggleSwitch>
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Notifications push</SettingTitle>
              <SettingDescription>
                Recevoir des notifications push dans le navigateur.
              </SettingDescription>
            </SettingLabel>
            <ToggleSwitch>
              <input type="checkbox" defaultChecked />
              <span></span>
            </ToggleSwitch>
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>Sécurité</SectionTitle>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Authentification à deux facteurs</SettingTitle>
              <SettingDescription>
                Ajouter une couche de sécurité supplémentaire à votre compte.
              </SettingDescription>
            </SettingLabel>
            <Button variant="primary">Activer</Button>
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Changer le mot de passe</SettingTitle>
              <SettingDescription>
                Mettre à jour votre mot de passe actuel.
              </SettingDescription>
            </SettingLabel>
            <Button variant="outline">Modifier</Button>
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>Compte</SectionTitle>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Supprimer le compte</SettingTitle>
              <SettingDescription>
                Supprimer définitivement votre compte et toutes vos données.
              </SettingDescription>
            </SettingLabel>
            <Button variant="danger" onClick={openDeleteModal}>
              Supprimer
            </Button>
          </SettingItem>
        </SettingsSection>
      </SettingsCard>

      {/* Modal de suppression de compte */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
      />
    </SettingsContainer>
  );
};

export default Settings;
