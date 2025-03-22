import styled from "@emotion/styled";
import {
  ArrowDownward,
  ArrowUpward,
  CheckCircle,
  Delete,
  Edit,
  HourglassEmpty,
  RemoveCircle,
} from "@mui/icons-material";
import {
  alpha,
  Box,
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
  TableSortLabel,
  Tooltip,
  Typography,
  Zoom,
} from "@mui/material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useCallback, useMemo, useState } from "react";
import { useTheme } from "../../components/ThemeProvider";
import { VACATION_TABLE_COLUMNS, VACATION_TYPES } from "../../config/constants";
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
    "& .MuiTableSortLabel-root:hover": {
      color: isDarkMode ? "#93C5FD" : "#3B82F6",
      transition: "color 0.2s ease",
    },
    "& .MuiTableSortLabel-root.Mui-active": {
      color: isDarkMode ? "#93C5FD" : "#3B82F6",
    },
    "& .MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon": {
      color: isDarkMode ? "#93C5FD" : "#3B82F6",
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

  // Normaliser le statut pour gérer différents cas
  let normalizedStatus = "pending"; // valeur par défaut

  if (status) {
    const statusStr = String(status).toLowerCase();
    if (statusStr === "approved" || statusStr === "approuvé") {
      normalizedStatus = "approved";
    } else if (statusStr === "rejected" || statusStr === "rejeté") {
      normalizedStatus = "rejected";
    }
  }

  // Utiliser le statut normalisé pour obtenir les couleurs
  const statusColor = colors[normalizedStatus] || colors.pending;

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

const ActionButton = styled(IconButton)(({ $actionType, theme }) => {
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

  const actionColor = colors[$actionType] || colors.edit;

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
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("startDate");

  // Vérifier si l'utilisateur est admin (seul rôle supporté maintenant)
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

  // Gérer le changement d'ordre de tri
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Fonction de comparaison pour le tri
  const compareValues = useCallback((a, b, orderByField, sortOrder) => {
    // Traitement spécial pour le tri par employé
    if (orderByField === "employee") {
      const nameA = a.employee
        ? `${a.employee.first_name || ""} ${a.employee.last_name || ""}`.trim()
        : a.employeeName || "";
      const nameB = b.employee
        ? `${b.employee.first_name || ""} ${b.employee.last_name || ""}`.trim()
        : b.employeeName || "";

      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }

    // Gestion des valeurs nulles ou undefined
    const valueA =
      a[orderByField] === null || a[orderByField] === undefined
        ? ""
        : a[orderByField];
    const valueB =
      b[orderByField] === null || b[orderByField] === undefined
        ? ""
        : b[orderByField];

    // Comparer des dates
    if (orderByField === "startDate" || orderByField === "endDate") {
      const dateA = valueA ? new Date(valueA).getTime() : 0;
      const dateB = valueB ? new Date(valueB).getTime() : 0;
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }

    // Comparaison standard pour les strings et autres types
    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortOrder === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    // Comparaison numérique par défaut
    return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
  }, []);

  // Obtenir le libellé du type de congé
  const getVacationType = useMemo(() => {
    // Création d'un objet map pour accélérer les recherches
    const typeMap = {};

    // Si VACATION_TYPES est un tableau, pré-calculer le mapping
    if (Array.isArray(VACATION_TYPES)) {
      VACATION_TYPES.forEach((t) => {
        typeMap[t.value] = t.label;
      });
    }

    // Fonction optimisée pour obtenir le type
    return (type) => {
      // Vérifier d'abord dans notre map pré-calculé
      if (typeMap[type]) {
        return typeMap[type];
      }

      // Fallback vers le switch case
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
  }, []);

  // Obtenir le libellé du statut (memoized)
  const getStatusLabel = useMemo(() => {
    // Mapping simple des statuts possibles
    const statusMap = {
      pending: "En attente",
      approved: "Approuvé",
      rejected: "Rejeté",
      // Ajout des codes d'erreur HTTP qui pourraient être reçus par erreur
      404: "En attente",
      500: "En attente",
      undefined: "En attente",
      null: "En attente",
    };

    return (status) => {
      // Vérifier si le statut est défini et l'utiliser s'il est valide
      if (!status) return "En attente";

      // Normaliser le statut en minuscules pour éviter les problèmes de casse
      const normalizedStatus = String(status).toLowerCase();

      // Si le statut existe dans notre mapping, le retourner
      if (statusMap[normalizedStatus]) {
        return statusMap[normalizedStatus];
      }

      // Fallback pour les statuts inconnus
      console.warn(`Statut non reconnu: ${status}`);
      return "En attente";
    };
  }, []);

  // Obtenir l'icône du statut (memoized)
  const getStatusIcon = useMemo(() => {
    const iconMap = {
      approved: <CheckCircle fontSize="small" />,
      rejected: <RemoveCircle fontSize="small" />,
      pending: <HourglassEmpty fontSize="small" />,
    };

    const pendingIcon = <HourglassEmpty fontSize="small" />;

    return (status) => {
      if (!status) return pendingIcon;

      // Normaliser le statut en minuscules pour éviter les problèmes de casse
      const normalizedStatus = String(status).toLowerCase();

      // Si le statut existe dans notre mapping, retourner l'icône correspondante
      if (iconMap[normalizedStatus]) {
        return iconMap[normalizedStatus];
      }

      // Pour les codes d'erreur ou autres statuts non reconnus, retourner l'icône "en attente"
      return pendingIcon;
    };
  }, []);

  // Formater une date avec memo
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    try {
      // Format français plus lisible
      return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
    } catch (error) {
      console.error("Erreur de formatage de la date:", error);
      return dateString || "-";
    }
  }, []);

  // Trier et calculer les lignes à afficher en fonction de la pagination
  const sortedRows = useMemo(() => {
    if (!vacations) return [];

    return [...vacations].sort((a, b) => compareValues(a, b, orderBy, order));
  }, [vacations, orderBy, order, compareValues]);

  const visibleRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Vérifier si l'utilisateur peut éditer une demande de congé
  const canEdit = useCallback(
    (vacation) => {
      // Tous les admins peuvent éditer les demandes de congés
      return isAdmin;
    },
    [isAdmin]
  );

  // Vérifier si l'utilisateur peut supprimer une demande de congé
  const canDelete = useCallback(
    (vacation) => {
      // Tous les admins peuvent supprimer les demandes de congés
      return isAdmin;
    },
    [isAdmin]
  );

  // Vérifier si l'utilisateur peut approuver/rejeter une demande de congé
  const canApproveReject = useCallback(
    (vacation) => {
      // Tous les admins peuvent approuver/rejeter les demandes de congés
      return isAdmin;
    },
    [isAdmin]
  );

  return (
    <Box sx={{ width: "100%" }}>
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
                    <StyledTableCell>
                      <TableSortLabel
                        active={orderBy === "employee"}
                        direction={orderBy === "employee" ? order : "asc"}
                        onClick={() => handleRequestSort("employee")}
                        IconComponent={
                          orderBy === "employee"
                            ? order === "asc"
                              ? ArrowUpward
                              : ArrowDownward
                            : undefined
                        }
                      >
                        Employé
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell>
                      <TableSortLabel
                        active={orderBy === "type"}
                        direction={orderBy === "type" ? order : "asc"}
                        onClick={() => handleRequestSort("type")}
                        IconComponent={
                          orderBy === "type"
                            ? order === "asc"
                              ? ArrowUpward
                              : ArrowDownward
                            : undefined
                        }
                      >
                        Type
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell>
                      <TableSortLabel
                        active={orderBy === "startDate"}
                        direction={orderBy === "startDate" ? order : "asc"}
                        onClick={() => handleRequestSort("startDate")}
                        IconComponent={
                          orderBy === "startDate"
                            ? order === "asc"
                              ? ArrowUpward
                              : ArrowDownward
                            : undefined
                        }
                      >
                        Date de début
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell>
                      <TableSortLabel
                        active={orderBy === "endDate"}
                        direction={orderBy === "endDate" ? order : "asc"}
                        onClick={() => handleRequestSort("endDate")}
                        IconComponent={
                          orderBy === "endDate"
                            ? order === "asc"
                              ? ArrowUpward
                              : ArrowDownward
                            : undefined
                        }
                      >
                        Date de fin
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell>
                      <TableSortLabel
                        active={orderBy === "duration"}
                        direction={orderBy === "duration" ? order : "asc"}
                        onClick={() => handleRequestSort("duration")}
                        IconComponent={
                          orderBy === "duration"
                            ? order === "asc"
                              ? ArrowUpward
                              : ArrowDownward
                            : undefined
                        }
                      >
                        Durée
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell>
                      <TableSortLabel
                        active={orderBy === "status"}
                        direction={orderBy === "status" ? order : "asc"}
                        onClick={() => handleRequestSort("status")}
                        IconComponent={
                          orderBy === "status"
                            ? order === "asc"
                              ? ArrowUpward
                              : ArrowDownward
                            : undefined
                        }
                      >
                        Statut
                      </TableSortLabel>
                    </StyledTableCell>
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
                      key={
                        vacation && vacation.id
                          ? vacation.id
                          : `row-${visibleRows.indexOf(vacation)}`
                      }
                    >
                      <StyledTableRow>
                        <StyledTableCell component="th" scope="row">
                          {console.log("Données de l'employé:", {
                            vacation_id: vacation?.id,
                            employee_name: vacation?.employee_name,
                            employee_obj: vacation?.employee,
                            employee_first_name: vacation?.employee?.first_name,
                            employee_last_name: vacation?.employee?.last_name,
                            // Afficher toutes les propriétés pour voir si le nom est disponible sous un autre format
                            all_props: Object.keys(vacation || {}),
                          })}
                          {/* Utiliser l'accesseur standardisé de VACATION_TABLE_COLUMNS pour le nom de l'employé */}
                          {vacation &&
                            VACATION_TABLE_COLUMNS[0].accessor(vacation)}
                        </StyledTableCell>
                        <StyledTableCell>
                          {vacation && vacation.type
                            ? getVacationType(vacation.type)
                            : "-"}
                        </StyledTableCell>
                        <StyledTableCell>
                          {vacation &&
                          (vacation.startDate || vacation.start_date)
                            ? formatDate(
                                vacation.startDate || vacation.start_date
                              )
                            : "-"}
                        </StyledTableCell>
                        <StyledTableCell>
                          {vacation && (vacation.endDate || vacation.end_date)
                            ? formatDate(vacation.endDate || vacation.end_date)
                            : "-"}
                        </StyledTableCell>
                        <StyledTableCell>
                          {vacation && vacation.duration
                            ? `${vacation.duration} jour${
                                vacation.duration > 1 ? "s" : ""
                              }`
                            : vacation &&
                              ((vacation.startDate && vacation.endDate) ||
                                (vacation.start_date && vacation.end_date))
                            ? (() => {
                                try {
                                  const start = new Date(
                                    vacation.startDate || vacation.start_date
                                  );
                                  const end = new Date(
                                    vacation.endDate || vacation.end_date
                                  );

                                  // Vérification des dates valides
                                  if (
                                    isNaN(start.getTime()) ||
                                    isNaN(end.getTime())
                                  ) {
                                    console.error("Dates invalides:", {
                                      start:
                                        vacation.startDate ||
                                        vacation.start_date,
                                      end:
                                        vacation.endDate || vacation.end_date,
                                    });
                                    return "-";
                                  }

                                  const {
                                    getWorkingDaysCount,
                                  } = require("../../utils/dateUtils");
                                  const duration = getWorkingDaysCount(
                                    start,
                                    end
                                  );
                                  return `${duration} jour${
                                    duration > 1 ? "s" : ""
                                  }`;
                                } catch (error) {
                                  console.error(
                                    "Erreur de calcul de durée:",
                                    error,
                                    {
                                      vacation_id: vacation.id,
                                      start:
                                        vacation.startDate ||
                                        vacation.start_date,
                                      end:
                                        vacation.endDate || vacation.end_date,
                                    }
                                  );
                                  return "-";
                                }
                              })()
                            : "-"}
                        </StyledTableCell>
                        <StyledTableCell>
                          {vacation ? (
                            <StatusChip
                              icon={getStatusIcon(vacation.status)}
                              label={getStatusLabel(vacation.status)}
                              status={vacation.status || "pending"}
                              size="small"
                            />
                          ) : (
                            <StatusChip
                              icon={getStatusIcon("pending")}
                              label={getStatusLabel("pending")}
                              status="pending"
                              size="small"
                            />
                          )}
                          {vacation &&
                            vacation.id &&
                            console.log(
                              "Statut actuel:",
                              vacation.id,
                              vacation.status || "non défini",
                              typeof vacation.status,
                              "=>",
                              getStatusLabel(vacation.status)
                            )}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1,
                            }}
                          >
                            {vacation && vacation.id && canEdit(vacation) && (
                              <Tooltip title="Modifier">
                                <ActionButton
                                  size="small"
                                  onClick={() => {
                                    try {
                                      onEdit(vacation);
                                    } catch (error) {
                                      console.error(
                                        "Erreur lors de la modification:",
                                        error
                                      );
                                    }
                                  }}
                                  $actionType="edit"
                                >
                                  <Edit fontSize="small" />
                                </ActionButton>
                              </Tooltip>
                            )}

                            {vacation && vacation.id && canDelete(vacation) && (
                              <Tooltip title="Supprimer">
                                <ActionButton
                                  size="small"
                                  onClick={() => {
                                    try {
                                      onDelete(vacation.id);
                                    } catch (error) {
                                      console.error(
                                        "Erreur lors de la suppression:",
                                        error
                                      );
                                    }
                                  }}
                                  $actionType="delete"
                                >
                                  <Delete fontSize="small" />
                                </ActionButton>
                              </Tooltip>
                            )}

                            {vacation &&
                              vacation.id &&
                              canApproveReject(vacation) &&
                              (vacation.status === "pending" ||
                                String(vacation.status || "").toLowerCase() ===
                                  "pending" ||
                                !vacation.status ||
                                ["undefined", "404", "500", "null"].includes(
                                  String(vacation.status || "")
                                )) && (
                                <>
                                  <Tooltip title="Approuver">
                                    <ActionButton
                                      size="small"
                                      onClick={() => {
                                        try {
                                          console.log(
                                            `Tentative d'approbation de la demande ${vacation.id}`
                                          );
                                          onApprove(vacation.id);
                                        } catch (error) {
                                          console.error(
                                            "Erreur lors de l'approbation:",
                                            error
                                          );
                                        }
                                      }}
                                      $actionType="approve"
                                    >
                                      <CheckCircle fontSize="small" />
                                    </ActionButton>
                                  </Tooltip>

                                  <Tooltip title="Rejeter">
                                    <ActionButton
                                      size="small"
                                      onClick={() => {
                                        try {
                                          console.log(
                                            `Tentative de rejet de la demande ${vacation.id}`
                                          );
                                          onReject(vacation.id);
                                        } catch (error) {
                                          console.error(
                                            "Erreur lors du rejet:",
                                            error
                                          );
                                        }
                                      }}
                                      $actionType="reject"
                                    >
                                      <RemoveCircle fontSize="small" />
                                    </ActionButton>
                                  </Tooltip>
                                </>
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
            </EmptyStateContainer>
          )}
        </StyledTableContainer>
      </Fade>
    </Box>
  );
};

export default VacationList;
