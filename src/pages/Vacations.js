import styled from "@emotion/styled";
import { Add, BeachAccess } from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTheme as useThemeProvider } from "../components/ThemeProvider";
import ErrorDisplay from "../components/ui/ErrorDisplay";
import LoadingScreen from "../components/ui/LoadingScreen";
import PageHeader from "../components/ui/PageHeader";
import VacationExport from "../components/vacations/VacationExport";
import VacationForm from "../components/vacations/VacationForm";
import VacationList from "../components/vacations/VacationList";
import { useAuth } from "../contexts/AuthContext";
import useVacations from "../hooks/useVacations";

// Icône stylisée pour les congés
const StyledIcon = styled(Box)(({ theme }) => {
  const { theme: themeMode } = useThemeProvider();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: isDarkMode
      ? `linear-gradient(135deg, ${alpha("#6366F1", 0.2)}, ${alpha(
          "#60A5FA",
          0.4
        )})`
      : `linear-gradient(135deg, ${alpha("#4F46E5", 0.1)}, ${alpha(
          "#3B82F6",
          0.3
        )})`,
    boxShadow: isDarkMode
      ? `0 4px 20px ${alpha("#000", 0.25)}`
      : `0 4px 15px ${alpha("#000", 0.08)}`,
    color: isDarkMode ? "#93C5FD" : "#4F46E5",
    flexShrink: 0,
    transition: "all 0.3s ease",
    "& .MuiSvgIcon-root": {
      fontSize: 40,
    },
  };
});

/**
 * Page de gestion des congés
 * Version adaptée à la nouvelle API avec structure { success, message, data }
 */
const Vacations = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [tabValue, setTabValue] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedVacation, setSelectedVacation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const {
    vacations,
    loading,
    error,
    createVacation,
    updateVacation,
    deleteVacation,
    updateVacationStatus,
    getVacationsByStatus,
    refreshVacations,
  } = useVacations();
  const { theme: themeMode } = useThemeProvider();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";

  // Fonction pour rafraîchir manuellement les données
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshVacations();
      toast.success("Données des congés rafraîchies");
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données:", error);
      toast.error(
        error.message || "Erreur lors du rafraîchissement des données"
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Gérer le changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Ouvrir le formulaire pour créer un nouveau congé
  const handleOpenCreateForm = () => {
    setSelectedVacation(null);
    setShowForm(true);
  };

  // Ouvrir le formulaire pour éditer un congé existant
  const handleOpenEditForm = (vacation) => {
    setSelectedVacation(vacation);
    setShowForm(true);
  };

  // Fermer le formulaire
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedVacation(null);
  };

  // Soumettre le formulaire
  const handleSubmitForm = async (data) => {
    try {
      let result;

      if (selectedVacation) {
        // Mise à jour d'un congé existant
        result = await updateVacation(selectedVacation.id, data);
      } else {
        // Création d'un nouveau congé
        result = await createVacation(data);
      }

      if (result && result.success) {
        toast.success(result.message || "Opération réussie");
        handleCloseForm();
      } else {
        toast.error(
          result?.message || "Une erreur est survenue lors de l'opération"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      toast.error(
        error.message ||
          "Une erreur est survenue lors de la soumission du formulaire"
      );
    }
  };

  // Supprimer un congé
  const handleDeleteVacation = async (id) => {
    try {
      const result = await deleteVacation(id);
      if (result && result.success) {
        toast.success(result.message || "Congé supprimé avec succès");
      } else {
        toast.error(
          result?.message || "Une erreur est survenue lors de la suppression"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du congé:", error);
      toast.error(
        error.message ||
          "Une erreur est survenue lors de la suppression du congé"
      );
    }
  };

  // Approuver un congé
  const handleApproveVacation = async (id) => {
    try {
      const result = await updateVacationStatus(id, "approved");
      if (result && result.success) {
        toast.success(result.message || "Congé approuvé avec succès");
      } else {
        toast.error(
          result?.message || "Une erreur est survenue lors de l'approbation"
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'approbation du congé:", error);
      toast.error(
        error.message ||
          "Une erreur est survenue lors de l'approbation du congé"
      );
    }
  };

  // Rejeter un congé
  const handleRejectVacation = async (id, comment) => {
    try {
      const result = await updateVacationStatus(id, "rejected", comment);
      if (result && result.success) {
        toast.success(result.message || "Congé rejeté avec succès");
      } else {
        toast.error(result?.message || "Une erreur est survenue lors du rejet");
      }
    } catch (error) {
      console.error("Erreur lors du rejet du congé:", error);
      toast.error(
        error.message || "Une erreur est survenue lors du rejet du congé"
      );
    }
  };

  // Filtrer les congés en fonction de l'onglet sélectionné
  const filteredVacations = useMemo(() => {
    // Vérifie si vacations est un array ou s'il est contenu dans data
    const vacationData = Array.isArray(vacations)
      ? vacations
      : vacations?.data || [];

    switch (tabValue) {
      case 0:
        return vacationData; // Tous les congés
      case 1:
        return getVacationsByStatus("pending"); // Congés en attente
      case 2:
        return getVacationsByStatus("approved"); // Congés approuvés
      case 3:
        return getVacationsByStatus("rejected"); // Congés rejetés
      default:
        return vacationData;
    }
  }, [vacations, tabValue, getVacationsByStatus]);

  // Afficher un écran de chargement pendant le chargement initial des données
  if (loading && !refreshing) {
    return <LoadingScreen message="Chargement des congés..." />;
  }

  // Afficher un message d'erreur en cas d'erreur
  if (error && !refreshing) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Gestion des congés"
        subtitle="Consultez et gérez les demandes de congés"
        icon={
          <StyledIcon>
            <BeachAccess />
          </StyledIcon>
        }
      />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
              color: isDarkMode ? "#D1D5DB" : "inherit",
              borderRadius: 2,
              boxShadow: isDarkMode
                ? `0 4px 20px ${alpha("#000", 0.4)}`
                : `0 4px 20px ${alpha("#000", 0.1)}`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h5"
                color={isDarkMode ? "#F9FAFB" : "inherit"}
              >
                Liste des demandes de congés
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <VacationExport vacations={filteredVacations} isGlobal={true} />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={handleOpenCreateForm}
                  sx={{
                    transition: "all 0.2s ease",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  Nouvelle demande
                </Button>
              </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="vacation tabs"
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : false}
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  "& .MuiTab-root": {
                    color: isDarkMode ? "#9CA3AF" : "inherit",
                    "&.Mui-selected": {
                      color: isDarkMode ? "#93C5FD" : undefined,
                    },
                  },
                }}
              >
                <Tab
                  label="Tous"
                  id="vacation-tab-0"
                  aria-controls="vacation-tabpanel-0"
                />
                <Tab
                  label="En attente"
                  id="vacation-tab-1"
                  aria-controls="vacation-tabpanel-1"
                />
                <Tab
                  label="Approuvés"
                  id="vacation-tab-2"
                  aria-controls="vacation-tabpanel-2"
                />
                <Tab
                  label="Rejetés"
                  id="vacation-tab-3"
                  aria-controls="vacation-tabpanel-3"
                />
              </Tabs>
            </Box>

            {refreshing && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <CircularProgress
                  size={24}
                  sx={{ color: isDarkMode ? "#6366F1" : undefined }}
                />
              </Box>
            )}

            <VacationList
              vacations={filteredVacations}
              loading={loading && !refreshing}
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteVacation}
              onApprove={handleApproveVacation}
              onReject={handleRejectVacation}
            />
          </Paper>
        </Grid>
      </Grid>

      <VacationForm
        open={showForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        vacation={selectedVacation}
        currentUser={user}
      />
    </Container>
  );
};

export default Vacations;
