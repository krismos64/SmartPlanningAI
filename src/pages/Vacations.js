import { Add, Refresh } from "@mui/icons-material";
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
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTheme as useThemeProvider } from "../components/ThemeProvider";
import ErrorDisplay from "../components/ui/ErrorDisplay";
import LoadingScreen from "../components/ui/LoadingScreen";
import PageHeader from "../components/ui/PageHeader";
import VacationForm from "../components/vacations/VacationForm";
import VacationList from "../components/vacations/VacationList";
import { useAuth } from "../contexts/AuthContext";
import useVacations from "../hooks/useVacations";

/**
 * Page de gestion des congés
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

  // Nettoyer les ressources lors du démontage du composant
  useEffect(() => {
    return () => {
      // Aucun nettoyage spécifique nécessaire, tout est géré dans le hook useVacations
    };
  }, []);

  // Fonction pour rafraîchir manuellement les données
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshVacations();
      toast.success("Données des congés rafraîchies");
    } catch (error) {
      toast.error("Erreur lors du rafraîchissement des données");
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
      if (selectedVacation) {
        // Mise à jour d'un congé existant
        await updateVacation(selectedVacation.id, data);
      } else {
        // Création d'un nouveau congé
        await createVacation(data);
      }
      handleCloseForm();
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      toast.error(
        "Une erreur est survenue lors de la soumission du formulaire"
      );
    }
  };

  // Supprimer un congé
  const handleDeleteVacation = async (id) => {
    try {
      await deleteVacation(id);
    } catch (error) {
      console.error("Erreur lors de la suppression du congé:", error);
      toast.error("Une erreur est survenue lors de la suppression du congé");
    }
  };

  // Approuver un congé
  const handleApproveVacation = async (id) => {
    try {
      await updateVacationStatus(id, "approved");
    } catch (error) {
      console.error("Erreur lors de l'approbation du congé:", error);
      toast.error("Une erreur est survenue lors de l'approbation du congé");
    }
  };

  // Rejeter un congé
  const handleRejectVacation = async (id, comment) => {
    try {
      await updateVacationStatus(id, "rejected", comment);
    } catch (error) {
      console.error("Erreur lors du rejet du congé:", error);
      toast.error("Une erreur est survenue lors du rejet du congé");
    }
  };

  // Filtrer les congés en fonction de l'onglet sélectionné
  const getFilteredVacations = () => {
    switch (tabValue) {
      case 0:
        return vacations; // Tous les congés
      case 1:
        return getVacationsByStatus("pending"); // Congés en attente
      case 2:
        return getVacationsByStatus("approved"); // Congés approuvés
      case 3:
        return getVacationsByStatus("rejected"); // Congés rejetés
      default:
        return vacations;
    }
  };

  // Afficher un écran de chargement pendant le chargement des données
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
        icon="🏖️"
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
              <Box>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Refresh />}
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    mr: 1,
                    color: isDarkMode ? "#F9FAFB" : undefined,
                    borderColor: isDarkMode ? "#6366F1" : undefined,
                    "&:hover": {
                      borderColor: isDarkMode ? "#818CF8" : undefined,
                    },
                  }}
                >
                  {refreshing ? "Rafraîchissement..." : "Rafraîchir"}
                </Button>
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

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              sx={{
                mb: 2,
                "& .MuiTab-root": {
                  color: isDarkMode ? "#9CA3AF" : undefined,
                  "&.Mui-selected": {
                    color: isDarkMode ? "#F9FAFB" : undefined,
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: isDarkMode ? "#6366F1" : undefined,
                },
              }}
            >
              <Tab label="Tous" />
              <Tab label="En attente" />
              <Tab label="Approuvés" />
              <Tab label="Rejetés" />
            </Tabs>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <VacationList
                vacations={getFilteredVacations()}
                onEdit={handleOpenEditForm}
                onDelete={handleDeleteVacation}
                onApprove={handleApproveVacation}
                onReject={handleRejectVacation}
                currentUser={user}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Formulaire de création/édition de congé */}
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
