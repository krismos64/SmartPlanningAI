import {
  Add,
  CheckCircle,
  Delete,
  Edit,
  ExpandMore,
  Refresh,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useCallback, useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTranslation } from "react-i18next";
import { formatDateToLocale, getWeekDayName } from "../../utils/dateUtils";

// Styles
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    width: "90%",
    maxWidth: 1200,
    maxHeight: "90vh",
  },
}));

const StatCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 400,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ShiftCell = styled(Box)(({ theme, isDragging, isOver, canDrop }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: isOver
    ? canDrop
      ? theme.palette.success.light
      : theme.palette.error.light
    : isDragging
    ? "transparent"
    : theme.palette.primary.light,
  opacity: isDragging ? 0.5 : 1,
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
}));

const StatsValue = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: theme.palette.primary.main,
}));

// Type pour le drag and drop
const ItemTypes = {
  SHIFT: "shift",
};

// Composant pour le drag and drop des shifts
const DraggableShift = ({ shift, employeeId, onDelete, onEdit }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SHIFT,
    item: { ...shift, sourceEmployeeId: employeeId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Formatage de l'heure
  const formatTime = (time) => {
    if (!time) return "";
    return time;
  };

  // Calcul durée en heures
  const getDuration = () => {
    if (!shift.start || !shift.end) return "";

    const [startHours, startMinutes] = shift.start.split(":").map(Number);
    const [endHours, endMinutes] = shift.end.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    const durationMinutes = endTotalMinutes - startTotalMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return `${hours}h${minutes > 0 ? minutes : ""}`;
  };

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <ShiftCell isDragging={isDragging}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2">
            {formatTime(shift.start)} - {formatTime(shift.end)}
          </Typography>
          <Box>
            <Tooltip title="Modifier">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(shift, employeeId);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(shift, employeeId);
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Typography variant="caption" color="textSecondary">
          {getDuration()}
        </Typography>
      </ShiftCell>
    </div>
  );
};

// Zone où on peut déposer un shift
const DropZone = ({ date, employeeId, onDrop }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.SHIFT,
    drop: (item) => onDrop(item, date, employeeId),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  return (
    <ShiftCell ref={drop} isOver={isOver} canDrop={canDrop}>
      {isOver && canDrop && (
        <Box sx={{ textAlign: "center", color: "success.main" }}>
          <Typography variant="caption">Déposer ici</Typography>
        </Box>
      )}
    </ShiftCell>
  );
};

const ScheduleValidationModal = ({
  open,
  onClose,
  generatedSchedule,
  onApplySchedule,
  onRegenerateSchedule,
  loading,
  error,
}) => {
  const { t } = useTranslation();
  const [schedule, setSchedule] = useState(null);
  const [editingShift, setEditingShift] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Initialiser le planning et les statistiques
  useEffect(() => {
    if (generatedSchedule) {
      setSchedule(JSON.parse(JSON.stringify(generatedSchedule.schedule)));
      setStats(generatedSchedule.stats);

      // Sélectionner le premier employé par défaut
      if (
        generatedSchedule.schedule &&
        generatedSchedule.schedule.employeeSchedules &&
        generatedSchedule.schedule.employeeSchedules.length > 0
      ) {
        setSelectedEmployeeId(
          generatedSchedule.schedule.employeeSchedules[0].employeeId
        );
      }
    }
  }, [generatedSchedule]);

  // Gérer le drag and drop d'un shift
  const handleShiftDrop = useCallback(
    (item, targetDate, targetEmployeeId) => {
      if (!schedule) return;

      // Créer une copie du planning
      const newSchedule = { ...schedule };

      // Trouver les employés source et cible
      const sourceEmployee = newSchedule.employeeSchedules.find(
        (emp) => emp.employeeId === item.sourceEmployeeId
      );

      const targetEmployee = newSchedule.employeeSchedules.find(
        (emp) => emp.employeeId === targetEmployeeId
      );

      if (!sourceEmployee || !targetEmployee) return;

      // Retirer le shift de l'employé source
      const shiftIndex = sourceEmployee.shifts.findIndex(
        (s) =>
          s.date === item.date && s.start === item.start && s.end === item.end
      );

      if (shiftIndex === -1) return;

      // Retirer le shift et réduire les heures totales
      const [shiftToMove] = sourceEmployee.shifts.splice(shiftIndex, 1);
      sourceEmployee.totalHours -= shiftToMove.duration;

      // Créer un nouveau shift pour l'employé cible avec la nouvelle date
      const newShift = {
        ...shiftToMove,
        date: targetDate,
      };

      // Ajouter le shift à l'employé cible
      targetEmployee.shifts.push(newShift);
      targetEmployee.totalHours += newShift.duration;

      // Mettre à jour l'état
      setSchedule(newSchedule);
      calculateStats(newSchedule);
    },
    [schedule, calculateStats]
  );

  // Calculer les statistiques du planning
  const calculateStats = useCallback((currentSchedule) => {
    const totalEmployees = currentSchedule.employeeSchedules.length;
    let totalHours = 0;
    let minEmployeeHours = Infinity;
    let maxEmployeeHours = 0;
    let totalShifts = 0;

    for (const employeeSchedule of currentSchedule.employeeSchedules) {
      totalHours += employeeSchedule.totalHours;
      minEmployeeHours = Math.min(
        minEmployeeHours,
        employeeSchedule.totalHours
      );
      maxEmployeeHours = Math.max(
        maxEmployeeHours,
        employeeSchedule.totalHours
      );
      totalShifts += employeeSchedule.shifts.length;
    }

    const avgHoursPerEmployee =
      totalEmployees > 0 ? totalHours / totalEmployees : 0;
    const avgShiftsPerEmployee =
      totalEmployees > 0 ? totalShifts / totalEmployees : 0;

    setStats({
      totalEmployees,
      totalHours,
      totalShifts,
      avgHoursPerEmployee,
      avgShiftsPerEmployee,
      minEmployeeHours: minEmployeeHours === Infinity ? 0 : minEmployeeHours,
      maxEmployeeHours,
    });
  }, []);

  // Supprimer un shift
  const handleDeleteShift = useCallback(
    (shift, employeeId) => {
      if (!schedule) return;

      // Créer une copie du planning
      const newSchedule = { ...schedule };

      // Trouver l'employé
      const employee = newSchedule.employeeSchedules.find(
        (emp) => emp.employeeId === employeeId
      );

      if (!employee) return;

      // Trouver et supprimer le shift
      const shiftIndex = employee.shifts.findIndex(
        (s) =>
          s.date === shift.date &&
          s.start === shift.start &&
          s.end === shift.end
      );

      if (shiftIndex === -1) return;

      // Retirer le shift et mettre à jour les heures totales
      employee.totalHours -= employee.shifts[shiftIndex].duration;
      employee.shifts.splice(shiftIndex, 1);

      // Mettre à jour l'état
      setSchedule(newSchedule);
      calculateStats(newSchedule);
    },
    [schedule, calculateStats]
  );

  // Modifier un shift
  const handleEditShift = useCallback((shift, employeeId) => {
    setEditingShift({ employeeId, ...shift });
    setEditDialogOpen(true);
  }, []);

  // Sauvegarder les modifications d'un shift
  const handleSaveShift = useCallback(
    (newShift) => {
      const newSchedule = { ...schedule };
      const employeeSchedule = newSchedule.employeeSchedules.find(
        (es) => es.employeeId === editingShift.employeeId
      );

      const shiftIndex = employeeSchedule.shifts.findIndex(
        (s) =>
          s.date === editingShift.date &&
          s.start === editingShift.start &&
          s.end === editingShift.end
      );

      // Calculer la nouvelle durée
      const [startHours, startMinutes] = newShift.start.split(":").map(Number);
      const [endHours, endMinutes] = newShift.end.split(":").map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      const newDuration = (endTotalMinutes - startTotalMinutes) / 60;

      // Mettre à jour le shift
      const oldDuration = employeeSchedule.shifts[shiftIndex].duration;
      employeeSchedule.shifts[shiftIndex] = {
        ...newShift,
        duration: newDuration,
      };

      // Mettre à jour les heures totales
      employeeSchedule.totalHours =
        employeeSchedule.totalHours - oldDuration + newDuration;

      setSchedule(newSchedule);
      calculateStats(newSchedule);
      setEditDialogOpen(false);
    },
    [editingShift, schedule, calculateStats]
  );

  // Ajouter un nouveau shift
  const handleAddShift = useCallback((employeeId, date) => {
    // Shift par défaut de 9h à 17h
    const newShift = {
      date,
      start: "09:00",
      end: "17:00",
      duration: 8, // 8 heures
    };

    setEditingShift({ employeeId, ...newShift, isNew: true });
    setEditDialogOpen(true);
  }, []);

  // Fermer le dialogue d'édition sans enregistrer
  const handleCloseEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    setEditingShift(null);
  }, []);

  // Générer les options de sélection pour les employés
  const employeeOptions = schedule
    ? schedule.employeeSchedules.map((es) => ({
        value: es.employeeId,
        label: es.employeeName,
      }))
    : [];

  // Si aucun planning n'est fourni ou en cours de chargement
  if (loading) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // En cas d'erreur
  if (error) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Erreur de génération</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            {error.message ||
              "Une erreur s'est produite lors de la génération du planning."}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Fermer
          </Button>
          <Button
            onClick={onRegenerateSchedule}
            color="primary"
            variant="contained"
            startIcon={<Refresh />}
          >
            Réessayer
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Si aucun planning n'est disponible
  if (!schedule) {
    return null;
  }

  // Générer les dates de la semaine
  const weekDates = [];
  const startDate = new Date(schedule.weekStart);
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    weekDates.push({
      date: date.toISOString().split("T")[0],
      dayName: getWeekDayName(date),
      formattedDate: formatDateToLocale(date),
    });
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <StyledDialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              Validation du planning - Semaine du{" "}
              {formatDateToLocale(new Date(schedule.weekStart))}
            </Typography>
            <Box>
              <Button
                onClick={onRegenerateSchedule}
                color="secondary"
                variant="outlined"
                startIcon={<Refresh />}
                sx={{ mr: 1 }}
              >
                Régénérer
              </Button>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Statistiques */}
          <Box my={2}>
            <Typography variant="h6" gutterBottom>
              Résumé du planning
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <Typography variant="subtitle1" color="textSecondary">
                    Total des heures
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats?.totalHours.toFixed(1)}h
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <Typography variant="subtitle1" color="textSecondary">
                    Moyenne par employé
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats?.avgHoursPerEmployee.toFixed(1)}h
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <Typography variant="subtitle1" color="textSecondary">
                    Min / Max heures
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats?.minEmployeeHours.toFixed(1)}h /{" "}
                    {stats?.maxEmployeeHours.toFixed(1)}h
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <Typography variant="subtitle1" color="textSecondary">
                    Nombre de shifts
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats?.totalShifts}
                  </Typography>
                </StatCard>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Interface d'édition */}
          <Box>
            <Box mb={2} display="flex" alignItems="center">
              <Typography variant="h6" gutterBottom>
                Édition du planning
              </Typography>
              <Box flexGrow={1} />
              <TextField
                select
                label="Employé"
                value={selectedEmployeeId || ""}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ minWidth: 200 }}
              >
                {employeeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Tableau des plannings */}
            <StyledTableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="15%">Employé</TableCell>
                    {weekDates.map((date) => (
                      <TableCell key={date.date} align="center">
                        <Typography variant="subtitle2">
                          {date.dayName}
                        </Typography>
                        <Typography variant="caption">
                          {date.formattedDate}
                        </Typography>
                      </TableCell>
                    ))}
                    <TableCell width="10%" align="center">
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedule.employeeSchedules
                    .filter(
                      (es) =>
                        !selectedEmployeeId ||
                        es.employeeId === selectedEmployeeId
                    )
                    .map((employeeSchedule) => (
                      <TableRow
                        key={employeeSchedule.employeeId}
                        sx={{
                          "&:nth-of-type(odd)": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="bold">
                            {employeeSchedule.employeeName}
                          </Typography>
                        </TableCell>
                        {weekDates.map((date) => {
                          const shifts = employeeSchedule.shifts.filter(
                            (shift) => shift.date === date.date
                          );
                          return (
                            <TableCell
                              key={date.date}
                              align="center"
                              sx={{ minWidth: 120 }}
                            >
                              {shifts.map((shift) => (
                                <DraggableShift
                                  key={`${shift.date}-${shift.start}-${shift.end}`}
                                  shift={shift}
                                  employeeId={employeeSchedule.employeeId}
                                  onDelete={(s, eId) =>
                                    handleDeleteShift(s, eId)
                                  }
                                  onEdit={(s, eId) => handleEditShift(s, eId)}
                                />
                              ))}
                              <DropZone
                                date={date.date}
                                employeeId={employeeSchedule.employeeId}
                                onDrop={handleShiftDrop}
                              />
                              <Tooltip title="Ajouter un créneau">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleAddShift(
                                      employeeSchedule.employeeId,
                                      date.date
                                    )
                                  }
                                >
                                  <Add fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          );
                        })}
                        <TableCell align="center">
                          <Chip
                            label={`${employeeSchedule.totalHours.toFixed(1)}h`}
                            color={
                              employeeSchedule.totalHours < 35
                                ? "warning"
                                : employeeSchedule.totalHours > 45
                                ? "error"
                                : "success"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </StyledTableContainer>

            {/* Informations complémentaires */}
            <Box mt={2}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Instructions d'édition</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Glisser-déposer"
                        secondary="Déplacez les créneaux entre les jours et les employés"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Ajouter un créneau"
                        secondary="Cliquez sur + pour ajouter un nouveau créneau horaire"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Modifier/Supprimer"
                        secondary="Utilisez les icônes sur chaque créneau pour le modifier ou le supprimer"
                      />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={() => onApplySchedule(schedule)}
            color="primary"
            variant="contained"
            startIcon={<CheckCircle />}
          >
            Appliquer ce planning
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Dialogue d'édition de shift */}
      {editingShift && (
        <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
          <DialogTitle>
            {editingShift.isNew ? "Ajouter un créneau" : "Modifier le créneau"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Date"
                  value={editingShift.date}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Heure de début"
                  type="time"
                  value={editingShift.start}
                  onChange={(e) =>
                    setEditingShift({ ...editingShift, start: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 900 }} // 15min steps
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Heure de fin"
                  type="time"
                  value={editingShift.end}
                  onChange={(e) =>
                    setEditingShift({ ...editingShift, end: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 900 }} // 15min steps
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} color="inherit">
              Annuler
            </Button>
            <Button
              onClick={() => handleSaveShift(editingShift)}
              color="primary"
              variant="contained"
            >
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </DndProvider>
  );
};

export default ScheduleValidationModal;
