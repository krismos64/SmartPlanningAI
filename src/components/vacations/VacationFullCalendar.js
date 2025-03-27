import styled from "@emotion/styled";
import frLocale from "@fullcalendar/core/locales/fr";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { ViewList } from "@mui/icons-material";
import {
  Box,
  Fab,
  IconButton,
  Paper,
  Tooltip,
  Zoom,
  alpha,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useTheme as useThemeProvider } from "../../components/ThemeProvider";
import { FRENCH_HOLIDAYS_2024, VACATION_TYPES } from "../../config/constants";

// Style pour le conteneur du calendrier
const CalendarWrapper = styled(Paper)(({ theme }) => {
  const { theme: themeMode } = useThemeProvider();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";

  return {
    padding: "16px",
    borderRadius: theme?.shape?.borderRadius || "8px",
    boxShadow: isDarkMode
      ? `0 8px 32px ${alpha("#000", 0.3)}`
      : `0 8px 32px ${alpha("#000", 0.1)}`,
    background: isDarkMode ? "#1F2937" : "#FFFFFF",
    overflow: "hidden",
    transition: "all 0.3s ease",
    height: "100%",
    "&:hover": {
      boxShadow: isDarkMode
        ? `0 12px 48px ${alpha("#000", 0.4)}`
        : `0 12px 48px ${alpha("#000", 0.15)}`,
    },
    ".fc": {
      "--fc-border-color": isDarkMode
        ? alpha("#6B7280", 0.3)
        : alpha("#E5E7EB", 0.8),
      "--fc-daygrid-event-dot-width": "8px",
      "--fc-event-text-color": "#fff",
      "--fc-event-selected-overlay-color": alpha("#1A69C5", 0.3),
      "--fc-today-bg-color": isDarkMode
        ? alpha("#4F46E5", 0.15)
        : alpha("#4F46E5", 0.07),
      "--fc-page-bg-color": "transparent",
      "--fc-neutral-bg-color": isDarkMode ? "#374151" : "#F9FAFB",
      "--fc-list-event-hover-bg-color": isDarkMode ? "#374151" : "#F3F4F6",
      "--fc-highlight-color": isDarkMode
        ? alpha("#4F46E5", 0.2)
        : alpha("#4F46E5", 0.1),
      color: isDarkMode ? "#D1D5DB" : "#111827",
    },
    ".fc .fc-toolbar-title": {
      fontSize: "1.5rem",
      fontWeight: "600",
      color: isDarkMode ? "#F3F4F6" : "#111827",
    },
    ".fc .fc-toolbar-chunk": {
      display: "flex",
      gap: "8px",
    },
    ".fc .fc-button": {
      backgroundColor: isDarkMode ? "#4B5563" : "#F3F4F6",
      borderColor: isDarkMode ? "#4B5563" : "#E5E7EB",
      color: isDarkMode ? "#F3F4F6" : "#111827",
      fontWeight: "500",
      "&:hover": {
        backgroundColor: isDarkMode ? "#6B7280" : "#E5E7EB",
        borderColor: isDarkMode ? "#6B7280" : "#D1D5DB",
      },
      "&:focus": {
        boxShadow: `0 0 0 0.2rem ${alpha("#4F46E5", 0.25)}`,
      },
    },
    ".fc .fc-button-primary:not(:disabled).fc-button-active, .fc .fc-button-primary:not(:disabled):active":
      {
        backgroundColor: isDarkMode ? "#6366F1" : "#4F46E5",
        borderColor: isDarkMode ? "#6366F1" : "#4F46E5",
        color: "#ffffff",
      },
    ".fc-direction-ltr .fc-button-group > .fc-button:not(:last-child)": {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    ".fc-direction-ltr .fc-button-group > .fc-button:not(:first-child)": {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      marginLeft: "-1px",
    },
    ".fc-col-header-cell": {
      padding: "8px 0",
      backgroundColor: isDarkMode
        ? alpha("#4F46E5", 0.08)
        : alpha("#4F46E5", 0.04),
      borderWidth: "0 0 1px 0",
    },
    ".fc-col-header-cell-cushion": {
      padding: "8px 4px",
      color: isDarkMode ? "#93C5FD" : "#4F46E5",
      fontWeight: "600",
      textDecoration: "none !important",
    },
    ".fc-day-sat, .fc-day-sun": {
      backgroundColor: isDarkMode
        ? alpha("#1F2937", 0.5)
        : alpha("#F3F4F6", 0.5),
    },
    ".weekend-day": {
      backgroundColor: isDarkMode
        ? alpha("#374151", 0.6)
        : alpha("#F3F4F6", 0.7),
    },
    ".holiday-day": {
      position: "relative",
      backgroundColor: isDarkMode
        ? alpha("#7F1D1D", 0.15)
        : alpha("#FECACA", 0.5),
      border: `1px solid ${
        isDarkMode ? alpha("#F87171", 0.3) : alpha("#F87171", 0.2)
      } !important`,
    },
    ".holiday-tooltip": {
      position: "absolute",
      top: "4px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: isDarkMode
        ? alpha("#1F2937", 0.9)
        : alpha("#FFFFFF", 0.9),
      color: isDarkMode ? "#F87171" : "#DC2626",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "0.75rem",
      fontWeight: "500",
      zIndex: 10,
      boxShadow: `0 2px 10px ${alpha("#000", 0.2)}`,
      whiteSpace: "nowrap",
    },
    ".holiday-event-title": {
      padding: "4px 0",
      textAlign: "center",
      fontSize: "0.75rem",
      fontWeight: "500",
      color: isDarkMode ? "#F87171" : "#DC2626",
    },
    ".fc-daygrid-day-number": {
      fontSize: "0.875rem",
      padding: "8px",
      color: isDarkMode ? "#D1D5DB" : "#111827",
      textDecoration: "none",
    },
    ".fc-daygrid-day-top": {
      justifyContent: "flex-end",
    },
    ".fc-daygrid-day-events": {
      padding: "0 4px",
    },
    ".fc-daygrid-day": {
      transition: "background-color 0.2s ease",
      "&:hover": {
        backgroundColor: isDarkMode
          ? alpha("#374151", 0.6)
          : alpha("#F3F4F6", 0.6),
      },
    },
    ".fc-daygrid-event": {
      borderRadius: "4px",
      padding: "2px 4px",
      fontSize: "0.75rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: `0 4px 8px ${alpha("#000", 0.15)}`,
      },
    },
    ".fc-day-other .fc-daygrid-day-top": {
      opacity: 0.5,
    },
  };
});

// Bouton de navigation personnalisé
const NavButton = styled(IconButton)(({ theme }) => {
  const { theme: themeMode } = useThemeProvider();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";

  return {
    backgroundColor: isDarkMode
      ? alpha("#4F46E5", 0.1)
      : alpha("#4F46E5", 0.05),
    color: isDarkMode ? "#93C5FD" : "#4F46E5",
    margin: "0 4px",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: isDarkMode
        ? alpha("#4F46E5", 0.2)
        : alpha("#4F46E5", 0.1),
      transform: "scale(1.05)",
    },
  };
});

const MotionBox = styled(motion.div)`
  height: 100%;
`;

/**
 * Composant de calendrier amélioré pour visualiser les congés
 */
const VacationFullCalendar = ({
  vacations,
  onEventClick,
  onDateClick,
  onSwitchToList,
}) => {
  const theme = useTheme();
  const { theme: themeMode } = useThemeProvider();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";
  const [calendarApi, setCalendarApi] = useState(null);

  // Préparer les événements pour le calendrier à partir des données de congés
  const events = useMemo(() => {
    if (!vacations || !Array.isArray(vacations)) return [];

    const vacationEvents = vacations.map((vacation) => {
      // Trouver le type de congé pour déterminer la couleur
      const vacationType = VACATION_TYPES.find(
        (t) => t.value === vacation.type
      );

      // Couleurs par défaut selon le statut
      let color;
      let textColor = "#FFFFFF";
      let opacity = 1;

      switch (vacation.status) {
        case "approved":
          color = vacationType?.color || "#4F46E5";
          break;
        case "pending":
          color = "#F59E0B";
          opacity = 0.8;
          break;
        case "rejected":
          color = "#EF4444";
          opacity = 0.7;
          break;
        default:
          color = "#9CA3AF";
      }

      // Format du nom pour l'affichage
      const employeeName =
        vacation.employee_name ||
        `${vacation.employee_first_name || ""} ${
          vacation.employee_last_name || ""
        }`.trim() ||
        `Employé #${vacation.employee_id}`;

      // Trouver le label du type de congé
      const typeLabel =
        VACATION_TYPES.find((t) => t.value === vacation.type)?.label ||
        vacation.type;

      return {
        id: `vacation-${vacation.id}`,
        title: `${employeeName} - ${typeLabel}`,
        start: vacation.start_date,
        end: vacation.end_date
          ? new Date(
              new Date(vacation.end_date).setDate(
                new Date(vacation.end_date).getDate() + 1
              )
            )
          : null, // +1 jour pour l'affichage inclusif
        backgroundColor: color,
        borderColor: color,
        textColor: textColor,
        extendedProps: {
          ...vacation,
          opacity: opacity,
          typeLabel: typeLabel,
          type: "vacation",
        },
      };
    });

    // Ajouter les jours fériés comme événements non modifiables
    const holidayEvents = FRENCH_HOLIDAYS_2024.map((holiday) => ({
      id: `holiday-${holiday.date}`,
      title: holiday.name,
      start: holiday.date,
      allDay: true,
      display: "background",
      backgroundColor: isDarkMode
        ? alpha("#EF4444", 0.25)
        : alpha("#EF4444", 0.15),
      borderColor: "transparent",
      classNames: ["holiday-event"],
      extendedProps: {
        type: "holiday",
      },
    }));

    return [...vacationEvents, ...holidayEvents];
  }, [vacations, isDarkMode]);

  // Gérer les clics sur les événements
  const handleEventClick = (info) => {
    // Ne pas réagir aux clics sur les jours fériés
    if (info.event.extendedProps.type === "holiday") return;

    if (onEventClick) {
      onEventClick(info.event.extendedProps);
    }
  };

  // Gérer les clics sur les dates
  const handleDateClick = (info) => {
    if (onDateClick) {
      onDateClick(info.date);
    }
  };

  // Configuration personnalisée des boutons de la barre d'outils
  const customButtons = {
    today: {
      text: "Aujourd'hui",
      click: () => {
        if (calendarApi) {
          calendarApi.today();
        }
      },
    },
  };

  // Fonction pour personnaliser le rendu des cellules de jour
  const dayCellDidMount = (arg) => {
    const { date, el } = arg;
    const day = date.getDay();

    // Mise en forme des week-ends (samedi = 6, dimanche = 0)
    if (day === 0 || day === 6) {
      el.classList.add("weekend-day");
    }

    // Chercher si c'est un jour férié
    const isHoliday = FRENCH_HOLIDAYS_2024.some(
      (holiday) => holiday.date === date.toISOString().split("T")[0]
    );

    if (isHoliday) {
      el.classList.add("holiday-day");

      // Ajouter une info-bulle pour les jours fériés
      const holiday = FRENCH_HOLIDAYS_2024.find(
        (h) => h.date === date.toISOString().split("T")[0]
      );

      if (holiday) {
        const tooltipEl = document.createElement("div");
        tooltipEl.className = "holiday-tooltip";
        tooltipEl.textContent = holiday.name;
        tooltipEl.style.display = "none";
        el.appendChild(tooltipEl);

        el.addEventListener("mouseenter", () => {
          tooltipEl.style.display = "block";
        });

        el.addEventListener("mouseleave", () => {
          tooltipEl.style.display = "none";
        });
      }
    }
  };

  // Animation pour le rendu initial
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <MotionBox initial="hidden" animate="visible" variants={containerVariants}>
      {/* Bouton flottant pour revenir à la vue liste */}
      <Fab
        color="primary"
        aria-label="Retour à la liste"
        size="medium"
        onClick={onSwitchToList}
        sx={{
          position: "absolute",
          top: "16px",
          right: "16px",
          zIndex: 10,
          backgroundColor: isDarkMode ? "#6366F1" : "#4F46E5",
          "&:hover": {
            backgroundColor: isDarkMode ? "#818CF8" : "#3730A3",
          },
        }}
      >
        <ViewList />
      </Fab>

      <CalendarWrapper elevation={isDarkMode ? 2 : 1}>
        <Box sx={{ height: "100%", p: { xs: "0px", sm: "8px" } }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek",
            }}
            locale={frLocale}
            events={events}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="auto"
            customButtons={customButtons}
            buttonText={{
              today: "Aujourd'hui",
              month: "Mois",
              week: "Semaine",
            }}
            dayCellDidMount={dayCellDidMount}
            eventContent={(arg) => {
              // Ne pas personnaliser l'affichage des jours fériés
              if (arg.event.extendedProps.type === "holiday") {
                return {
                  html: `<div class="holiday-event-title">${arg.event.title}</div>`,
                };
              }

              const opacity = arg.event.extendedProps.opacity || 1;

              return (
                <Tooltip
                  title={`${arg.event.title} (${
                    arg.event.extendedProps.status === "approved"
                      ? "Approuvé"
                      : arg.event.extendedProps.status === "pending"
                      ? "En attente"
                      : "Refusé"
                  })`}
                  arrow
                  TransitionComponent={Zoom}
                >
                  <Box
                    sx={{
                      width: "100%",
                      p: "2px",
                      opacity: opacity,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease",
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    {arg.event.title}
                  </Box>
                </Tooltip>
              );
            }}
            ref={(el) => {
              if (el) {
                setCalendarApi(el.getApi());
              }
            }}
          />
        </Box>
      </CalendarWrapper>

      {/* Légende du calendrier */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          mt: "16px",
          p: "16px",
          bgcolor: isDarkMode ? alpha("#1F2937", 0.7) : alpha("#F9FAFB", 0.7),
          borderRadius: "8px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "4px",
              bgcolor: "#4F46E5",
              mr: "8px",
            }}
          />
          <Box>Congé payé</Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "4px",
              bgcolor: "#10B981",
              mr: "8px",
            }}
          />
          <Box>Congé parental</Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "4px",
              bgcolor: "#EF4444",
              mr: "8px",
            }}
          />
          <Box>Congé maladie</Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "4px",
              bgcolor: "#F59E0B",
              mr: "8px",
            }}
          />
          <Box>En attente</Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "4px",
              bgcolor: isDarkMode
                ? alpha("#EF4444", 0.25)
                : alpha("#EF4444", 0.15),
              mr: "8px",
            }}
          />
          <Box>Jour férié</Box>
        </Box>
      </Box>
    </MotionBox>
  );
};

export default VacationFullCalendar;
