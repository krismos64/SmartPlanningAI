import styled from "@emotion/styled";
import {
  Add,
  CheckCircle,
  Delete,
  Edit,
  HourglassEmpty,
  RemoveCircle,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Fade,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  Zoom,
} from "@mui/material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { useTheme } from "../../components/ThemeProvider";
import { VACATION_STATUS, VACATION_TYPES } from "../../config/constants";
import { useAuth } from "../../contexts/AuthContext";

// Composants stylisés pour améliorer l'apparence
const StyledTableContainer = styled(TableContainer)(({ theme }) => {
  const { theme: themeMode } = useTheme();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";
  return {
    borderRadius: theme?.shape?.borderRadius || 8,
    boxShadow: isDarkMode
      ? `0 4px 20px ${alpha("#000", 0.3)}`
      : `0 2px 10px ${alpha("#000", 0.1)}`,
    overflow: "hidden",
    transition: "all 0.3s ease",
    background: isDarkMode ? "#1F2937" : "#FFFFFF",
    "&:hover": {
      boxShadow: isDarkMode
        ? `0 8px 25px ${alpha("#000", 0.4)}`
        : `0 4px 15px ${alpha("#000", 0.15)}`,
    },
  };
});

const StyledTableHead = styled(TableHead)(({ theme }) => {
  const { theme: themeMode } = useTheme();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";
  return {
    background: isDarkMode ? alpha("#6366F1", 0.15) : alpha("#4F46E5", 0.05),
    "& th": {
      fontWeight: 600,
      color: isDarkMode ? "#D1D5DB" : "#111827",
      borderBottom: `2px solid ${
        isDarkMode ? alpha("#6366F1", 0.3) : alpha("#4F46E5", 0.2)
      }`,
    },
  };
});

const StyledTableRow = styled(TableRow)(({ theme }) => {
  const { theme: themeMode } = useTheme();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";
  return {
    transition: "all 0.2s ease",
    "&:nth-of-type(odd)": {
      backgroundColor: isDarkMode
        ? alpha("#374151", 0.3)
        : alpha("#F3F4F6", 0.5),
    },
    "&:hover": {
      backgroundColor: isDarkMode
        ? alpha("#4B5563", 0.4)
        : alpha("#E5E7EB", 0.7),
      transform: "translateY(-2px)",
      boxShadow: isDarkMode
        ? `0 4px 8px ${alpha("#000", 0.3)}`
        : `0 2px 5px ${alpha("#000", 0.1)}`,
    },
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  };
});

const StyledTableCell = styled(TableCell)(({ theme }) => {
  const { theme: themeMode } = useTheme();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";
  return {
    padding: theme?.spacing?.(1.5) || "12px",
    color: isDarkMode ? "#D1D5DB" : "inherit",
    borderColor: isDarkMode ? alpha("#4B5563", 0.5) : undefined,
  };
});

const StatusChip = styled(Chip)(({ status, theme }) => {
  const { theme: themeMode } = useTheme();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";

  let colors = {
    pending: {
      bg: isDarkMode ? alpha("#F59E0B", 0.2) : alpha("#F59E0B", 0.1),
      color: isDarkMode ? "#FBBF24" : "#D97706",
      border: isDarkMode ? alpha("#F59E0B", 0.3) : alpha("#F59E0B", 0.2),
    },
    approved: {
      bg: isDarkMode ? alpha("#10B981", 0.2) : alpha("#10B981", 0.1),
      color: isDarkMode ? "#34D399" : "#059669",
      border: isDarkMode ? alpha("#10B981", 0.3) : alpha("#10B981", 0.2),
    },
    rejected: {
      bg: isDarkMode ? alpha("#EF4444", 0.2) : alpha("#EF4444", 0.1),
      color: isDarkMode ? "#F87171" : "#DC2626",
      border: isDarkMode ? alpha("#EF4444", 0.3) : alpha("#EF4444", 0.2),
    },
  };

  const statusColor = colors[status] || colors.pending;

  return {
    backgroundColor: statusColor.bg,
    color: statusColor.color,
    border: `1px solid ${statusColor.border}`,
    fontWeight: 500,
    transition: "all 0.3s ease",
    "& .MuiChip-icon": {
      color: "inherit",
    },
  };
});

const ActionButton = styled(IconButton)(({ actionType, theme }) => {
  const { theme: themeMode } = useTheme();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";

  let colors = {
    edit: {
      color: isDarkMode ? "#60A5FA" : "#3B82F6",
      hoverBg: isDarkMode ? alpha("#3B82F6", 0.2) : alpha("#3B82F6", 0.1),
    },
    delete: {
      color: isDarkMode ? "#F87171" : "#EF4444",
      hoverBg: isDarkMode ? alpha("#EF4444", 0.2) : alpha("#EF4444", 0.1),
    },
    approve: {
      color: isDarkMode ? "#34D399" : "#10B981",
      hoverBg: isDarkMode ? alpha("#10B981", 0.2) : alpha("#10B981", 0.1),
    },
    reject: {
      color: isDarkMode ? "#F87171" : "#EF4444",
      hoverBg: isDarkMode ? alpha("#EF4444", 0.2) : alpha("#EF4444", 0.1),
    },
  };

  const actionColor = colors[actionType] || colors.edit;

  return {
    color: actionColor.color,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: actionColor.hoverBg,
      transform: "scale(1.1)",
    },
  };
});

const EmptyStateContainer = styled(Box)(({ theme }) => {
  const { theme: themeMode } = useTheme();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";
  return {
    padding: theme?.spacing?.(4) || "32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "200px",
    backgroundColor: isDarkMode ? alpha("#1F2937", 0.7) : alpha("#F9FAFB", 0.7),
    borderRadius: theme?.shape?.borderRadius || 8,
    border: `1px dashed ${isDarkMode ? "#4B5563" : "#D1D5DB"}`,
    color: isDarkMode ? "#9CA3AF" : "#6B7280",
  };
});

/**
 * Composant affichant la liste des congés
 */
const VacationList = ({
  vacations,
  loading,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onCreateNew,
}) => {
  const { user } = useAuth();
  const { theme: themeMode } = useTheme();
  const isDarkMode = themeMode === "dark";
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Vérifier si l'utilisateur est admin
  const isAdmin = user && user.role === "admin";

  // Gérer le changement de page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Gérer le changement du nombre de lignes par page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Obtenir le libellé du type de congé
  const getVacationType = (type) => {
    // Vérifier que VACATION_TYPES est bien un tableau avant d'utiliser find()
    if (Array.isArray(VACATION_TYPES)) {
      const vacationType = VACATION_TYPES.find((t) => t.value === type);
      return vacationType ? vacationType.label : type;
    }

    // Fallback si VACATION_TYPES n'est pas un tableau
    switch (type) {
      case "paid":
        return "Congé payé";
      case "unpaid":
        return "Congé sans solde";
      case "sick":
        return "Congé maladie";
      case "parental":
        return "Congé parental";
      case "other":
        return "Autre";
      default:
        return type;
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    // VACATION_STATUS est un objet et non un tableau, donc find() ne fonctionne pas
    // Utilisons un mapping direct des statuts vers leurs libellés
    switch (status) {
      case VACATION_STATUS.PENDING:
        return "En attente";
      case VACATION_STATUS.APPROVED:
        return "Approuvé";
      case VACATION_STATUS.REJECTED:
        return "Rejeté";
      default:
        return status;
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle fontSize="small" />;
      case "rejected":
        return <RemoveCircle fontSize="small" />;
      case "pending":
      default:
        return <HourglassEmpty fontSize="small" />;
    }
  };

  // Formater une date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Calculer les lignes à afficher en fonction de la pagination
  const visibleRows = vacations
    ? vacations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : [];

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 600,
            color: isDarkMode ? "#E5E7EB" : "#111827",
            transition: "color 0.3s ease",
          }}
        >
          Liste des demandes de congés
        </Typography>
        <Zoom in={true} timeout={500}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={onCreateNew}
            sx={{
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: isDarkMode
                  ? `0 8px 16px ${alpha("#000", 0.4)}`
                  : `0 6px 12px ${alpha("#000", 0.15)}`,
              },
            }}
          >
            Nouvelle demande
          </Button>
        </Zoom>
      </Box>

      <Fade in={true} timeout={800}>
        <StyledTableContainer component={Paper}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 4,
                minHeight: 300,
              }}
            >
              <CircularProgress
                color="primary"
                sx={{
                  color: isDarkMode ? "#6366F1" : undefined,
                }}
              />
            </Box>
          ) : vacations && vacations.length > 0 ? (
            <>
              <Table sx={{ minWidth: 650 }} aria-label="tableau des congés">
                <StyledTableHead>
                  <TableRow>
                    <StyledTableCell>Employé</StyledTableCell>
                    <StyledTableCell>Type</StyledTableCell>
                    <StyledTableCell>Date de début</StyledTableCell>
                    <StyledTableCell>Date de fin</StyledTableCell>
                    <StyledTableCell>Statut</StyledTableCell>
                    <StyledTableCell align="right">Actions</StyledTableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {visibleRows.map((vacation) => (
                    <Zoom
                      in={true}
                      style={{
                        transitionDelay: `${
                          visibleRows.indexOf(vacation) * 50
                        }ms`,
                      }}
                      key={vacation.id}
                    >
                      <StyledTableRow>
                        <StyledTableCell component="th" scope="row">
                          {vacation.employee
                            ? `${vacation.employee.first_name} ${vacation.employee.last_name}`
                            : "-"}
                        </StyledTableCell>
                        <StyledTableCell>
                          {getVacationType(vacation.type)}
                        </StyledTableCell>
                        <StyledTableCell>
                          {formatDate(vacation.startDate)}
                        </StyledTableCell>
                        <StyledTableCell>
                          {formatDate(vacation.endDate)}
                        </StyledTableCell>
                        <StyledTableCell>
                          <StatusChip
                            icon={getStatusIcon(vacation.status)}
                            label={getStatusLabel(vacation.status)}
                            status={vacation.status}
                            size="small"
                          />
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1,
                            }}
                          >
                            {/* Boutons d'approbation/rejet (admin uniquement) */}
                            {isAdmin && vacation.status === "pending" && (
                              <>
                                <Tooltip title="Approuver">
                                  <ActionButton
                                    size="small"
                                    onClick={() => onApprove(vacation.id)}
                                    actionType="approve"
                                  >
                                    <CheckCircle fontSize="small" />
                                  </ActionButton>
                                </Tooltip>
                                <Tooltip title="Rejeter">
                                  <ActionButton
                                    size="small"
                                    onClick={() => onReject(vacation.id)}
                                    actionType="reject"
                                  >
                                    <RemoveCircle fontSize="small" />
                                  </ActionButton>
                                </Tooltip>
                              </>
                            )}

                            {/* Bouton d'édition (admin ou propriétaire) */}
                            {(isAdmin || vacation.employeeId === user?.id) && (
                              <Tooltip title="Modifier">
                                <ActionButton
                                  size="small"
                                  onClick={() => onEdit(vacation)}
                                  actionType="edit"
                                >
                                  <Edit fontSize="small" />
                                </ActionButton>
                              </Tooltip>
                            )}

                            {/* Bouton de suppression (admin ou propriétaire) */}
                            {(isAdmin || vacation.employeeId === user?.id) && (
                              <Tooltip title="Supprimer">
                                <ActionButton
                                  size="small"
                                  onClick={() => onDelete(vacation.id)}
                                  actionType="delete"
                                >
                                  <Delete fontSize="small" />
                                </ActionButton>
                              </Tooltip>
                            )}
                          </Box>
                        </StyledTableCell>
                      </StyledTableRow>
                    </Zoom>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={vacations.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  color: isDarkMode ? "#D1D5DB" : "inherit",
                  "& .MuiToolbar-root": {
                    color: isDarkMode ? "#D1D5DB" : "inherit",
                  },
                  "& .MuiSvgIcon-root": {
                    color: isDarkMode ? "#9CA3AF" : undefined,
                  },
                }}
              />
            </>
          ) : (
            <EmptyStateContainer>
              <Typography variant="h6" sx={{ mb: 2, color: "inherit" }}>
                Aucune demande de congé
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, textAlign: "center" }}>
                Il n'y a pas encore de demandes de congés. Créez-en une nouvelle
                en cliquant sur le bouton ci-dessus.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Add />}
                onClick={onCreateNew}
                sx={{
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  borderColor: isDarkMode ? "#6366F1" : undefined,
                  color: isDarkMode ? "#6366F1" : undefined,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    borderColor: isDarkMode ? "#818CF8" : undefined,
                    backgroundColor: isDarkMode
                      ? alpha("#6366F1", 0.1)
                      : undefined,
                  },
                }}
              >
                Créer une demande
              </Button>
            </EmptyStateContainer>
          )}
        </StyledTableContainer>
      </Fade>
    </Box>
  );
};

export default VacationList;
