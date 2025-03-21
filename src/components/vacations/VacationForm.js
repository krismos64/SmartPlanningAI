import styled from "@emotion/styled";
import {
  AccessTime,
  CalendarMonth,
  EventNote,
  Person,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Slide,
  TextField,
  Typography,
  useTheme as useMuiTheme,
  Zoom,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { fr } from "date-fns/locale";
import { useEffect, useState } from "react";
import { useTheme } from "../../components/ThemeProvider";
import { VACATION_TYPES } from "../../config/constants";
import { useAuth } from "../../contexts/AuthContext";
import useEmployees from "../../hooks/useEmployees";
import { getWorkingDaysCount } from "../../utils/dateUtils";

// Composants stylisés pour améliorer l'apparence
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => {
  const { theme: themeMode } = useTheme();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";
  return {
    background: isDarkMode ? alpha("#6366F1", 0.8) : alpha("#4F46E5", 0.8),
    color: "#FFFFFF",
    borderBottom: `1px solid ${isDarkMode ? "#374151" : "#E5E7EB"}`,
    padding: theme?.spacing?.(2) || "16px",
    transition: "all 0.3s ease",
  };
});

const StyledDialogContent = styled(DialogContent)(({ theme }) => {
  const { theme: themeMode } = useTheme();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";
  return {
    padding: theme?.spacing?.(3) || "24px",
    background: isDarkMode ? "#1F2937" : "#FFFFFF",
    color: isDarkMode ? "#D1D5DB" : "inherit",
    transition: "all 0.3s ease",
  };
});

const StyledDialogActions = styled(DialogActions)(({ theme }) => {
  const { theme: themeMode } = useTheme();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";
  return {
    borderTop: `1px solid ${isDarkMode ? "#374151" : "#E5E7EB"}`,
    padding: theme?.spacing?.(2) || "16px",
    background: isDarkMode ? "#1F2937" : "#FFFFFF",
    transition: "all 0.3s ease",
  };
});

const InfoChip = styled(Chip)(({ theme }) => {
  const { theme: themeMode } = useTheme();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";
  return {
    margin: theme?.spacing?.(1, 0) || "8px 0",
    background: isDarkMode ? alpha("#60A5FA", 0.2) : alpha("#3B82F6", 0.1),
    color: isDarkMode ? "#93C5FD" : "#2563EB",
    border: isDarkMode ? `1px solid ${alpha("#60A5FA", 0.3)}` : "none",
    transition: "all 0.3s ease",
    "&:hover": {
      background: isDarkMode ? alpha("#60A5FA", 0.3) : alpha("#3B82F6", 0.2),
    },
  };
});

const WarningChip = styled(Chip)(({ theme }) => {
  const { theme: themeMode } = useTheme();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";
  return {
    margin: theme?.spacing?.(1, 0) || "8px 0",
    background: isDarkMode ? alpha("#F59E0B", 0.2) : alpha("#F59E0B", 0.1),
    color: isDarkMode ? "#FBBF24" : "#D97706",
    border: isDarkMode ? `1px solid ${alpha("#F59E0B", 0.3)}` : "none",
    transition: "all 0.3s ease",
  };
});

const AnimatedFormControl = styled(FormControl)(({ theme }) => {
  const { theme: themeMode } = useTheme();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";
  return {
    transition: "all 0.3s ease",
    transform: "translateZ(0)",
    "& .MuiInputBase-root": {
      color: isDarkMode ? "#D1D5DB" : undefined,
    },
    "& .MuiInputLabel-root": {
      color: isDarkMode ? "#9CA3AF" : undefined,
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      padding: "0 8px",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: isDarkMode ? "#4B5563" : undefined,
      },
      "&:hover fieldset": {
        borderColor: isDarkMode ? "#6B7280" : undefined,
      },
      "&.Mui-focused fieldset": {
        borderColor: isDarkMode ? "#6366F1" : undefined,
      },
    },
    "& .MuiMenuItem-root": {
      color: isDarkMode ? "#D1D5DB" : undefined,
    },
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: isDarkMode
        ? `0 4px 8px ${alpha("#000", 0.3)}`
        : `0 4px 8px ${alpha("#000", 0.1)}`,
    },
  };
});

/**
 * Formulaire de création/édition de congé
 */
const VacationForm = ({ open, onClose, onSubmit, vacation, currentUser }) => {
  const { user } = useAuth();
  const { employees, loading: loadingEmployees } = useEmployees();
  const theme = useMuiTheme();
  const { theme: themeMode } = useTheme();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";
  const [formData, setFormData] = useState({
    employeeId: "",
    startDate: null,
    endDate: null,
    type: "paid",
    reason: "",
    duration: null,
  });
  const [errors, setErrors] = useState({});
  const [daysCount, setDaysCount] = useState(0);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (user && user.role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Initialiser le formulaire avec les données du congé à éditer
  useEffect(() => {
    if (vacation) {
      setFormData({
        employeeId: vacation.employee_id?.toString() || "",
        startDate: vacation.start_date ? new Date(vacation.start_date) : null,
        endDate: vacation.end_date ? new Date(vacation.end_date) : null,
        type: vacation.type || "paid",
        reason: vacation.reason || "",
      });
    } else {
      // Valeurs par défaut pour un nouveau congé
      setFormData({
        employeeId: currentUser ? currentUser.id.toString() : "",
        startDate: null,
        endDate: null,
        type: "paid",
        reason: "",
      });
    }
  }, [vacation, currentUser]);

  // S'assurer que l'employé sélectionné est disponible dans la liste
  useEffect(() => {
    if (employees && employees.length > 0 && formData.employeeId) {
      // Vérifier si l'employé sélectionné existe dans la liste
      const employeeExists = employees.some(
        (emp) => emp.id.toString() === formData.employeeId.toString()
      );

      // Si l'employé n'existe pas, sélectionner le premier de la liste
      if (!employeeExists) {
        console.log(
          `Employé ID ${formData.employeeId} non disponible, sélection du premier employé disponible`
        );
        setFormData((prev) => ({
          ...prev,
          employeeId: employees[0].id.toString(),
        }));
      }
    }
  }, [employees, formData.employeeId]);

  // Gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Gérer les changements de date
  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.employeeId) {
      newErrors.employeeId = "L'identifiant de l'employé est requis";
    }

    if (!formData.startDate) {
      newErrors.startDate = "La date de début est requise";
    }

    if (!formData.endDate) {
      newErrors.endDate = "La date de fin est requise";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      newErrors.endDate =
        "La date de fin doit être postérieure à la date de début";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = () => {
    if (validateForm()) {
      // Formater les dates au format ISO (YYYY-MM-DD)
      const formattedData = {
        ...formData,
        startDate: formData.startDate
          ? formData.startDate.toISOString().split("T")[0]
          : null,
        endDate: formData.endDate
          ? formData.endDate.toISOString().split("T")[0]
          : null,
        duration: daysCount > 0 ? daysCount : null,
      };
      onSubmit(formattedData);
    }
  };

  // Calculer le nombre de jours entre les dates sélectionnées
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      // Vérifier que la date de fin est après la date de début
      if (end < start) {
        setErrors((prev) => ({
          ...prev,
          endDate: "La date de fin doit être après la date de début",
        }));
        setDaysCount(0);
        return;
      }

      // Calculer le nombre de jours ouvrés
      const count = getWorkingDaysCount(start, end);
      setDaysCount(count);

      // Stocker la durée calculée dans formData
      setFormData((prev) => ({
        ...prev,
        duration: count,
      }));

      setErrors((prev) => ({ ...prev, endDate: null }));

      // Vérifier si le quota est dépassé (uniquement pour les congés payés et RTT)
      if (formData.type === "paid" || formData.type === "rtt") {
        const vacationType = VACATION_TYPES.find(
          (t) => t.value === formData.type
        );
        const defaultQuota = vacationType ? vacationType.defaultQuota : 0;

        // TODO: Récupérer le quota restant de l'employé depuis l'API
        // Pour l'instant, on utilise le quota par défaut
        const remainingQuota = defaultQuota;

        setQuotaExceeded(count > remainingQuota);
      } else {
        setQuotaExceeded(false);
      }
    } else {
      setDaysCount(0);
      setQuotaExceeded(false);
    }
  }, [formData.startDate, formData.endDate, formData.type]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="vacation-form-dialog-title"
      TransitionComponent={Zoom}
      transitionDuration={400}
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 2,
          overflow: "hidden",
          transition: "all 0.3s ease",
          background: isDarkMode ? "#1F2937" : "#FFFFFF",
        },
      }}
    >
      <StyledDialogTitle id="vacation-form-dialog-title">
        <Fade in={open} timeout={500}>
          <Typography variant="h6" component="div">
            {vacation
              ? "✏️ Modifier la demande de congé"
              : "🏖️ Nouvelle demande de congé"}
          </Typography>
        </Fade>
      </StyledDialogTitle>
      <StyledDialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Sélection de l'employé (visible uniquement pour les admins) */}
            {isAdmin && (
              <Grid item xs={12}>
                <Slide direction="right" in={open} timeout={500}>
                  <AnimatedFormControl fullWidth error={!!errors.employeeId}>
                    <InputLabel id="employee-label">
                      <Person
                        fontSize="small"
                        sx={{ mr: 1, verticalAlign: "middle" }}
                      />
                      Employé
                    </InputLabel>
                    <Select
                      labelId="employee-label"
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      label="Employé"
                      disabled={loadingEmployees}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                            color: isDarkMode ? "#D1D5DB" : "inherit",
                            "& .MuiMenuItem-root": {
                              color: isDarkMode ? "#D1D5DB" : "inherit",
                              "&:hover": {
                                backgroundColor: isDarkMode
                                  ? alpha("#374151", 0.5)
                                  : undefined,
                              },
                              "&.Mui-selected": {
                                backgroundColor: isDarkMode
                                  ? alpha("#6366F1", 0.2)
                                  : undefined,
                                "&:hover": {
                                  backgroundColor: isDarkMode
                                    ? alpha("#6366F1", 0.3)
                                    : undefined,
                                },
                              },
                            },
                          },
                        },
                      }}
                    >
                      {employees &&
                        employees.map((employee) => (
                          <MenuItem key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name}
                          </MenuItem>
                        ))}
                    </Select>
                    {errors.employeeId && (
                      <FormHelperText
                        sx={{ color: isDarkMode ? "#F87171" : undefined }}
                      >
                        {errors.employeeId}
                      </FormHelperText>
                    )}
                  </AnimatedFormControl>
                </Slide>
              </Grid>
            )}

            <Grid item xs={12}>
              <Slide direction="right" in={open} timeout={600}>
                <AnimatedFormControl fullWidth error={!!errors.type}>
                  <InputLabel id="type-label">
                    <EventNote
                      fontSize="small"
                      sx={{ mr: 1, verticalAlign: "middle" }}
                    />
                    Type de congé
                  </InputLabel>
                  <Select
                    labelId="type-label"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Type de congé"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                          color: isDarkMode ? "#D1D5DB" : "inherit",
                          "& .MuiMenuItem-root": {
                            color: isDarkMode ? "#D1D5DB" : "inherit",
                            "&:hover": {
                              backgroundColor: isDarkMode
                                ? alpha("#374151", 0.5)
                                : undefined,
                            },
                            "&.Mui-selected": {
                              backgroundColor: isDarkMode
                                ? alpha("#6366F1", 0.2)
                                : undefined,
                              "&:hover": {
                                backgroundColor: isDarkMode
                                  ? alpha("#6366F1", 0.3)
                                  : undefined,
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    {VACATION_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.type && (
                    <FormHelperText
                      sx={{ color: isDarkMode ? "#F87171" : undefined }}
                    >
                      {errors.type}
                    </FormHelperText>
                  )}
                </AnimatedFormControl>
              </Slide>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Slide direction="right" in={open} timeout={700}>
                <Box>
                  <DatePicker
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CalendarMonth fontSize="small" sx={{ mr: 1 }} />
                        Date de début
                      </Box>
                    }
                    value={formData.startDate}
                    onChange={(date) => handleDateChange("startDate", date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.startDate,
                        helperText: errors.startDate,
                        sx: {
                          transition: "all 0.3s ease",
                          "& .MuiInputBase-root": {
                            color: isDarkMode ? "#D1D5DB" : undefined,
                          },
                          "& .MuiInputLabel-root": {
                            color: isDarkMode ? "#9CA3AF" : undefined,
                            backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                            padding: "0 8px",
                          },
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: isDarkMode ? "#4B5563" : undefined,
                            },
                            "&:hover fieldset": {
                              borderColor: isDarkMode ? "#6B7280" : undefined,
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: isDarkMode ? "#6366F1" : undefined,
                            },
                          },
                          "& .MuiFormHelperText-root": {
                            color:
                              isDarkMode && !!errors.startDate
                                ? "#F87171"
                                : undefined,
                          },
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: isDarkMode
                              ? `0 4px 8px ${alpha("#000", 0.3)}`
                              : `0 4px 8px ${alpha("#000", 0.1)}`,
                          },
                        },
                      },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": {
                            backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                            color: isDarkMode ? "#D1D5DB" : "inherit",
                            "& .MuiPickersDay-root": {
                              color: isDarkMode ? "#D1D5DB" : undefined,
                              "&:hover": {
                                backgroundColor: isDarkMode
                                  ? alpha("#374151", 0.5)
                                  : undefined,
                              },
                              "&.Mui-selected": {
                                backgroundColor: isDarkMode
                                  ? "#6366F1"
                                  : undefined,
                                color: "#FFFFFF",
                              },
                            },
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </Slide>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Slide direction="left" in={open} timeout={700}>
                <Box>
                  <DatePicker
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CalendarMonth fontSize="small" sx={{ mr: 1 }} />
                        Date de fin
                      </Box>
                    }
                    value={formData.endDate}
                    onChange={(date) => handleDateChange("endDate", date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.endDate,
                        helperText: errors.endDate,
                        sx: {
                          transition: "all 0.3s ease",
                          "& .MuiInputBase-root": {
                            color: isDarkMode ? "#D1D5DB" : undefined,
                          },
                          "& .MuiInputLabel-root": {
                            color: isDarkMode ? "#9CA3AF" : undefined,
                            backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                            padding: "0 8px",
                          },
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: isDarkMode ? "#4B5563" : undefined,
                            },
                            "&:hover fieldset": {
                              borderColor: isDarkMode ? "#6B7280" : undefined,
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: isDarkMode ? "#6366F1" : undefined,
                            },
                          },
                          "& .MuiFormHelperText-root": {
                            color:
                              isDarkMode && !!errors.endDate
                                ? "#F87171"
                                : undefined,
                          },
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: isDarkMode
                              ? `0 4px 8px ${alpha("#000", 0.3)}`
                              : `0 4px 8px ${alpha("#000", 0.1)}`,
                          },
                        },
                      },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": {
                            backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                            color: isDarkMode ? "#D1D5DB" : "inherit",
                            "& .MuiPickersDay-root": {
                              color: isDarkMode ? "#D1D5DB" : undefined,
                              "&:hover": {
                                backgroundColor: isDarkMode
                                  ? alpha("#374151", 0.5)
                                  : undefined,
                              },
                              "&.Mui-selected": {
                                backgroundColor: isDarkMode
                                  ? "#6366F1"
                                  : undefined,
                                color: "#FFFFFF",
                              },
                            },
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </Slide>
            </Grid>

            {daysCount > 0 && (
              <Grid item xs={12}>
                <Fade in={daysCount > 0} timeout={800}>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", my: 1 }}
                  >
                    <InfoChip
                      icon={<AccessTime />}
                      label={`Durée: ${daysCount} jour${
                        daysCount > 1 ? "s" : ""
                      } ouvré${daysCount > 1 ? "s" : ""}`}
                    />
                    {quotaExceeded && (
                      <WarningChip
                        color="warning"
                        label="Quota dépassé"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </Fade>
              </Grid>
            )}

            <Grid item xs={12}>
              <Slide direction="up" in={open} timeout={800}>
                <TextField
                  id="reason"
                  name="reason"
                  label="Motif (optionnel)"
                  multiline
                  rows={3}
                  fullWidth
                  value={formData.reason}
                  onChange={handleChange}
                  error={!!errors.reason}
                  helperText={errors.reason}
                  sx={{
                    transition: "all 0.3s ease",
                    "& .MuiInputBase-root": {
                      color: isDarkMode ? "#D1D5DB" : undefined,
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkMode ? "#9CA3AF" : undefined,
                      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                      padding: "0 8px",
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: isDarkMode ? "#4B5563" : undefined,
                      },
                      "&:hover fieldset": {
                        borderColor: isDarkMode ? "#6B7280" : undefined,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: isDarkMode ? "#6366F1" : undefined,
                      },
                    },
                    "& .MuiFormHelperText-root": {
                      color:
                        isDarkMode && !!errors.reason ? "#F87171" : undefined,
                    },
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: isDarkMode
                        ? `0 4px 8px ${alpha("#000", 0.3)}`
                        : `0 4px 8px ${alpha("#000", 0.1)}`,
                    },
                  }}
                />
              </Slide>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button
          onClick={onClose}
          sx={{
            transition: "all 0.2s ease",
            color: isDarkMode ? "#D1D5DB" : undefined,
            "&:hover": {
              transform: "scale(1.05)",
              color: isDarkMode ? "#FFFFFF" : undefined,
            },
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={{
            transition: "all 0.2s ease",
            "&:hover": { transform: "scale(1.05)" },
          }}
        >
          {vacation ? "Mettre à jour" : "Créer"}
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};

export default VacationForm;
