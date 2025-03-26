import { Settings as SettingsIcon } from "@mui/icons-material";
import { alpha, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import LanguageSelector from "../components/LanguageSelector";
import DeleteAccountModal from "../components/modals/DeleteAccountModal";
import {
  useTheme,
  useTheme as useThemeProvider,
} from "../components/ThemeProvider";

// Icône stylisée pour les paramètres
const StyledIcon = styled(Box)(({ theme }) => {
  const { theme: themeMode } = useThemeProvider();
  const isDarkMode = themeMode === "dark";

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: isDarkMode
      ? `linear-gradient(135deg, ${alpha("#F43F5E", 0.2)}, ${alpha(
          "#E11D48",
          0.4
        )})`
      : `linear-gradient(135deg, ${alpha("#F43F5E", 0.1)}, ${alpha(
          "#E11D48",
          0.3
        )})`,
    boxShadow: isDarkMode
      ? `0 4px 20px ${alpha("#000", 0.25)}`
      : `0 4px 15px ${alpha("#000", 0.08)}`,
    color: isDarkMode ? "#FDA4AF" : "#E11D48",
    flexShrink: 0,
    transition: "all 0.3s ease",
    "& .MuiSvgIcon-root": {
      fontSize: 40,
    },
  };
});

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

// Styled component pour le sélecteur de langue
const LanguageWrapper = styled.div`
  display: flex;
  align-items: center;
`;

// Composant Settings
const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  // S'assurer que le modal de suppression de compte n'est pas ouvert automatiquement
  // quand l'utilisateur navigue vers la page des paramètres
  useEffect(() => {
    // Si la navigation vient du sidebar, on force la fermeture du modal
    if (location.state?.fromSidebar) {
      console.log(
        "Navigation depuis sidebar vers Settings détectée, modal fermé"
      );
      setIsDeleteModalOpen(false);
    }

    // Nettoyage lors du démontage
    return () => {
      setIsDeleteModalOpen(false);
    };
  }, [location]);

  // Ouvrir le modal de suppression de compte uniquement lors d'un clic explicite
  const openDeleteModal = (event) => {
    // Vérifier qu'on est sur la page des paramètres et que c'est bien un clic utilisateur
    if (location.pathname === "/settings" && event?.isTrusted) {
      console.log(
        "Ouverture du modal de suppression de compte via clic utilisateur"
      );
      setIsDeleteModalOpen(true);
    } else {
      console.log(
        "Tentative d'ouverture du modal ignorée - navigation automatique détectée"
      );
    }
  };

  // Fermer le modal de suppression de compte
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <SettingsContainer>
      <Box
        component="div"
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          component="div"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box
            component="div"
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <StyledIcon>
              <SettingsIcon />
            </StyledIcon>

            <Box component="div" sx={{ ml: 2 }}>
              <PageTitle>Paramètres</PageTitle>
              <PageDescription>
                Configurez vos préférences et gérez votre compte
              </PageDescription>
            </Box>
          </Box>
        </Box>
      </Box>

      <SettingsCard>
        <SettingsSection>
          <SectionTitle>Préférences d'affichage</SectionTitle>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>{t("settings.theme")}</SettingTitle>
              <SettingDescription>
                {isDarkMode ? t("settings.lightMode") : t("settings.darkMode")}
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

          <SettingItem>
            <SettingLabel>
              <SettingTitle>{t("settings.language")}</SettingTitle>
              <SettingDescription>{t("language.select")}</SettingDescription>
            </SettingLabel>
            <LanguageWrapper>
              <LanguageSelector />
            </LanguageWrapper>
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>{t("settings.security")}</SectionTitle>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>{t("security.twoFactor")}</SettingTitle>
              <SettingDescription>
                {t("security.twoFactorDescription")}
              </SettingDescription>
            </SettingLabel>
            <Button variant="primary">{t("security.enable")}</Button>
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>{t("settings.changePassword")}</SettingTitle>
              <SettingDescription>
                {t("security.passwordDescription")}
              </SettingDescription>
            </SettingLabel>
            <Button variant="outline">{t("common.edit")}</Button>
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>{t("settings.account")}</SectionTitle>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>{t("settings.deleteAccount")}</SettingTitle>
              <SettingDescription>
                {t("settings.confirmDeleteAccount")}
              </SettingDescription>
            </SettingLabel>
            <Button variant="danger" onClick={openDeleteModal}>
              {t("common.delete")}
            </Button>
          </SettingItem>
        </SettingsSection>
      </SettingsCard>

      {/* Modal de suppression de compte */}
      <DeleteAccountModal
        $isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
      />
    </SettingsContainer>
  );
};

export default Settings;
