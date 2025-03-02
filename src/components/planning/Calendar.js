import { useState } from "react";
import styled, { css } from "styled-components";
import { fadeIn, slideInUp } from "../../styles/animations";

// Icônes
const ChevronLeftIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 18L9 12L15 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 18L15 12L9 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 5V19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 12H19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Composants stylisés
const CalendarContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.xl}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const MonthNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const MonthTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 200px;
  text-align: center;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}33`};
  }
`;

const ViewOptions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ViewButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: none;
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primary : "transparent"};
  color: ${({ active, theme }) =>
    active ? "white" : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ active, theme }) =>
      active ? theme.colors.primary : `${theme.colors.primary}11`};
    color: ${({ active, theme }) => (active ? "white" : theme.colors.primary)};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}33`};
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const WeekdayHeader = styled.div`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.sm}`};
  text-align: center;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DayCell = styled.div`
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing.sm};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  background-color: ${({ isToday, isSelected, theme }) =>
    isSelected
      ? `${theme.colors.primary}11`
      : isToday
      ? `${theme.colors.primary}05`
      : "transparent"};

  &:nth-child(7n) {
    border-right: none;
  }

  &:last-child {
    border-bottom: none;
  }

  ${({ isCurrentMonth, theme }) =>
    !isCurrentMonth &&
    css`
      opacity: 0.5;
      background-color: ${`${theme.colors.background}66`};
    `}

  ${({ isWeekend, theme }) =>
    isWeekend &&
    css`
      background-color: ${`${theme.colors.background}33`};
    `}
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
  }

  animation: ${fadeIn} 0.3s ease-in-out;
`;

const DayNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: ${({ isToday, theme }) =>
    isToday
      ? theme.typography.fontWeights.bold
      : theme.typography.fontWeights.medium};
  color: ${({ isToday, theme }) =>
    isToday ? "white" : theme.colors.text.primary};
  background-color: ${({ isToday, theme }) =>
    isToday ? theme.colors.primary : "transparent"};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const EventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const Event = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ color, theme }) => color || theme.colors.primary};
  color: white;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.small};
  }

  animation: ${slideInUp} 0.3s ease-in-out;
`;

const MoreEvents = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  margin-top: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const AddEventButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.xs};
  right: ${({ theme }) => theme.spacing.xs};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background-color: ${({ theme }) => `${theme.colors.primary}22`};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;

  ${DayCell}:hover & {
    opacity: 1;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

// Composant Calendar
const Calendar = ({
  events = [],
  onEventClick,
  onAddEvent,
  onDayClick,
  onViewChange,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // 'month', 'week', 'day'

  // Obtenir le premier jour du mois
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Obtenir le dernier jour du mois
  const getLastDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // Obtenir tous les jours à afficher dans le calendrier
  const getDaysInMonth = (date) => {
    const firstDay = getFirstDayOfMonth(date);
    const lastDay = getLastDayOfMonth(date);
    const days = [];

    // Ajouter les jours du mois précédent pour compléter la première semaine
    const firstDayOfWeek = firstDay.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const prevMonthLastDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      0
    ).getDate();

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(
        date.getFullYear(),
        date.getMonth() - 1,
        prevMonthLastDay - i
      );
      days.push({
        date: day,
        isCurrentMonth: false,
        isToday: isSameDay(day, new Date()),
        isWeekend: day.getDay() === 0 || day.getDay() === 6,
      });
    }

    // Ajouter les jours du mois courant
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(date.getFullYear(), date.getMonth(), i);
      days.push({
        date: day,
        isCurrentMonth: true,
        isToday: isSameDay(day, new Date()),
        isWeekend: day.getDay() === 0 || day.getDay() === 6,
      });
    }

    // Ajouter les jours du mois suivant pour compléter la dernière semaine
    const lastDayOfWeek = lastDay.getDay();
    const daysToAdd = 6 - lastDayOfWeek;

    for (let i = 1; i <= daysToAdd; i++) {
      const day = new Date(date.getFullYear(), date.getMonth() + 1, i);
      days.push({
        date: day,
        isCurrentMonth: false,
        isToday: isSameDay(day, new Date()),
        isWeekend: day.getDay() === 0 || day.getDay() === 6,
      });
    }

    return days;
  };

  // Vérifier si deux dates sont le même jour
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Obtenir les événements pour un jour spécifique
  const getEventsForDay = (day) => {
    return events.filter((event) => isSameDay(new Date(event.date), day));
  };

  // Formater la date pour l'affichage
  const formatMonthYear = (date) => {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };

  // Naviguer vers le mois précédent
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Naviguer vers le mois suivant
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Naviguer vers aujourd'hui
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Changer la vue
  const handleViewChange = (newView) => {
    setView(newView);
    if (onViewChange) {
      onViewChange(newView);
    }
  };

  // Gérer le clic sur un jour
  const handleDayClick = (day) => {
    if (onDayClick) {
      onDayClick(day);
    }
  };

  // Gérer le clic sur un événement
  const handleEventClick = (event, e) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // Gérer l'ajout d'un événement
  const handleAddEvent = (day, e) => {
    e.stopPropagation();
    if (onAddEvent) {
      onAddEvent(day);
    }
  };

  // Obtenir les jours de la semaine
  const weekdays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  // Obtenir les jours à afficher
  const days = getDaysInMonth(currentDate);

  return (
    <CalendarContainer>
      <CalendarHeader>
        <MonthNavigation>
          <NavButton onClick={goToPreviousMonth} aria-label="Mois précédent">
            <ChevronLeftIcon />
          </NavButton>
          <MonthTitle>{formatMonthYear(currentDate)}</MonthTitle>
          <NavButton onClick={goToNextMonth} aria-label="Mois suivant">
            <ChevronRightIcon />
          </NavButton>
          <ViewButton onClick={goToToday}>Aujourd'hui</ViewButton>
        </MonthNavigation>

        <ViewOptions>
          <ViewButton
            active={view === "month"}
            onClick={() => handleViewChange("month")}
          >
            Mois
          </ViewButton>
          <ViewButton
            active={view === "week"}
            onClick={() => handleViewChange("week")}
          >
            Semaine
          </ViewButton>
          <ViewButton
            active={view === "day"}
            onClick={() => handleViewChange("day")}
          >
            Jour
          </ViewButton>
        </ViewOptions>
      </CalendarHeader>

      <CalendarGrid>
        {weekdays.map((weekday) => (
          <WeekdayHeader key={weekday}>{weekday}</WeekdayHeader>
        ))}

        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day.date);
          const displayEvents = dayEvents.slice(0, 3);
          const hasMoreEvents = dayEvents.length > 3;

          return (
            <DayCell
              key={index}
              isCurrentMonth={day.isCurrentMonth}
              isToday={day.isToday}
              isWeekend={day.isWeekend}
              onClick={() => handleDayClick(day.date)}
            >
              <DayNumber isToday={day.isToday}>{day.date.getDate()}</DayNumber>

              <EventsContainer>
                {displayEvents.map((event, eventIndex) => (
                  <Event
                    key={eventIndex}
                    color={event.color}
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    {event.title}
                  </Event>
                ))}

                {hasMoreEvents && (
                  <MoreEvents>+{dayEvents.length - 3} plus</MoreEvents>
                )}
              </EventsContainer>

              <AddEventButton
                onClick={(e) => handleAddEvent(day.date, e)}
                aria-label="Ajouter un événement"
              >
                <PlusIcon />
              </AddEventButton>
            </DayCell>
          );
        })}
      </CalendarGrid>
    </CalendarContainer>
  );
};

export default Calendar;
