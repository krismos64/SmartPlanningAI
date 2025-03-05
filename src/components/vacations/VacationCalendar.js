import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styled from "styled-components";
import { FRENCH_HOLIDAYS_2024, VACATION_TYPES } from "../../config/constants";
import { isHoliday, isWeekend } from "../../utils/dateUtils";

// Fonction pour détecter le mode sombre du système ou du thème
const isDarkMode = () => {
  // Vérifier d'abord le thème de l'application si disponible
  if (document.documentElement.getAttribute("data-theme") === "dark") {
    return true;
  }
  // Sinon, vérifier les préférences du système
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
};

const CalendarContainer = styled.div`
  background-color: ${({ theme }) =>
    isDarkMode() ? "#1F2937" : theme.colors?.surface || "white"};
  border-radius: ${({ theme }) => theme.borderRadius?.medium || "0.375rem"};
  box-shadow: ${({ theme }) =>
    theme.shadows?.medium || "0 4px 6px -1px rgba(0, 0, 0, 0.1)"};
  padding: 1.5rem;
  margin-bottom: 2rem;
  color: ${({ theme }) =>
    isDarkMode() ? "#F3F4F6" : theme.colors?.text?.primary || "#111827"};
  width: 100%;
  overflow-x: auto;

  @media (max-width: ${({ theme }) => theme.breakpoints?.md || "768px"}) {
    padding: 1rem 0.5rem;
    border-radius: ${({ theme }) => theme.borderRadius?.small || "0.25rem"};
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;

  @media (max-width: ${({ theme }) => theme.breakpoints?.sm || "576px"}) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const MonthTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) =>
    isDarkMode() ? "#F3F4F6" : theme.colors?.text?.primary || "#111827"};

  @media (max-width: ${({ theme }) => theme.breakpoints?.sm || "576px"}) {
    font-size: 1.25rem;
  }
`;

const NavigationButton = styled.button`
  background-color: ${({ theme }) =>
    isDarkMode() ? "#6B7280" : theme.colors?.background || "#f8f9fa"};
  border: 1px solid
    ${({ theme }) =>
      isDarkMode() ? "#6B7280" : theme.colors?.border || "#E5E7EB"};
  border-radius: ${({ theme }) => theme.borderRadius?.small || "0.25rem"};
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: ${({ theme }) =>
    isDarkMode() ? "#F3F4F6" : theme.colors?.text?.primary || "#111827"};

  &:hover {
    background-color: ${({ theme }) =>
      isDarkMode() ? "#4F46E5" : theme.colors?.primary + "22" || "#f5f5f5"};
    color: ${({ theme }) =>
      isDarkMode() ? "white" : theme.colors?.primary || "#111827"};
  }
`;

const NavigationContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  min-width: min-content;

  @media (max-width: ${({ theme }) => theme.breakpoints?.sm || "576px"}) {
    gap: 0.25rem;
  }
`;

const DayHeader = styled.div`
  text-align: center;
  font-weight: 600;
  padding: 0.5rem;
  color: ${({ theme }) =>
    isDarkMode() ? "#F3F4F6" : theme.colors?.text?.primary || "#111827"};

  @media (max-width: ${({ theme }) => theme.breakpoints?.sm || "576px"}) {
    padding: 0.25rem;
    font-size: 0.75rem;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints?.xs || "400px"}) {
    font-size: 0.7rem;
  }
`;

const DayCell = styled.div`
  position: relative;
  min-height: 80px;
  min-width: 80px;
  padding: 0.5rem;
  border: 1px solid
    ${({ theme }) =>
      isDarkMode() ? "#6B7280" : theme.colors?.border || "#E5E7EB"};
  border-radius: ${({ theme }) => theme.borderRadius?.small || "0.25rem"};
  background-color: ${({
    isCurrentMonth,
    isToday,
    isWeekend,
    isHoliday,
    theme,
  }) => {
    if (isDarkMode()) {
      if (isHoliday) return "#3D1A1A"; // Rouge foncé pour les jours fériés
      if (isWeekend) return "#2D3748"; // Gris foncé pour les weekends
      if (isToday) return "#1A365D"; // Bleu foncé pour aujourd'hui
      return isCurrentMonth ? "#2D3748" : "#1F2937"; // Gris foncé pour le mois courant, plus foncé pour les autres mois
    } else {
      if (isHoliday) return "#ffeeee"; // Rouge clair pour les jours fériés
      if (isWeekend) return theme.colors?.background || "#f5f5f5"; // Gris clair pour les weekends
      if (isToday) return theme.colors?.primary + "11" || "#e6f7ff"; // Bleu clair pour aujourd'hui
      return isCurrentMonth
        ? theme.colors?.surface || "white"
        : theme.colors?.background || "#f9f9f9"; // Blanc pour le mois courant, gris clair pour les autres mois
    }
  }};
  color: ${({ isCurrentMonth, isToday, isWeekend, isHoliday, theme }) => {
    if (isDarkMode()) {
      if (isHoliday) return "#F56565"; // Rouge clair pour le texte des jours fériés
      if (isWeekend) return "#CBD5E0"; // Gris clair pour le texte des weekends
      return isCurrentMonth ? "#F3F4F6" : "#A0AEC0"; // Blanc pour le mois courant, gris pour les autres
    } else {
      if (isHoliday) return theme.colors?.error || "#d32f2f"; // Rouge pour le texte des jours fériés
      if (isWeekend) return theme.colors?.text?.secondary || "#757575"; // Gris pour le texte des weekends
      return isCurrentMonth
        ? theme.colors?.text?.primary || "#111827"
        : theme.colors?.text?.disabled || "#aaa"; // Noir pour le mois courant, gris pour les autres
    }
  }};
  font-weight: ${({ isToday }) => (isToday ? "600" : "normal")};

  @media (max-width: ${({ theme }) => theme.breakpoints?.sm || "576px"}) {
    min-height: 60px;
    min-width: 60px;
    padding: 0.25rem;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints?.xs || "400px"}) {
    min-height: 50px;
    min-width: 40px;
  }
`;

const DayNumber = styled.div`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  font-size: 0.875rem;

  @media (max-width: ${({ theme }) => theme.breakpoints?.sm || "576px"}) {
    font-size: 0.75rem;
  }
`;

const HolidayName = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) =>
    isDarkMode() ? "#F56565" : theme.colors?.error || "#d32f2f"};
  font-weight: 500;
  margin-top: 1.5rem;
  text-align: center;

  @media (max-width: ${({ theme }) => theme.breakpoints?.sm || "576px"}) {
    font-size: 0.65rem;
    margin-top: 1rem;
  }
`;

const VacationList = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 60px;
  overflow-y: auto;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) =>
      isDarkMode() ? "#2D3748" : theme.colors?.background || "#f1f1f1"};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) =>
      isDarkMode() ? "#4A5568" : theme.colors?.border || "#888"};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints?.sm || "576px"}) {
    margin-top: 1rem;
    max-height: 40px;
  }
`;

const VacationItem = styled.div`
  font-size: 0.7rem;
  padding: 0.15rem 0.3rem;
  border-radius: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: ${({ type, status }) => {
    // Trouver la couleur correspondant au type
    const vacationType = VACATION_TYPES.find((t) => t.value === type);
    const baseColor = vacationType ? vacationType.color : "#3498db";

    // Ajuster l'opacité en fonction du statut
    switch (status) {
      case "approved":
        return baseColor;
      case "pending":
        return `${baseColor}99`; // 60% opacity
      case "rejected":
        return `${baseColor}66`; // 40% opacity
      default:
        return baseColor;
    }
  }};
  color: white;
  cursor: pointer;

  @media (max-width: ${({ theme }) => theme.breakpoints?.sm || "576px"}) {
    font-size: 0.6rem;
    padding: 0.1rem 0.2rem;
  }
`;

const Legend = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  color: ${({ theme }) =>
    isDarkMode() ? "#F3F4F6" : theme.colors?.text?.primary || "#111827"};
  padding: 0 0.5rem;

  @media (max-width: ${({ theme }) => theme.breakpoints?.sm || "576px"}) {
    gap: 0.5rem;
    margin-top: 1rem;
    justify-content: center;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;

  @media (max-width: ${({ theme }) => theme.breakpoints?.sm || "576px"}) {
    font-size: 0.75rem;
    gap: 0.25rem;
  }
`;

const LegendColor = styled.div`
  width: 1rem;
  height: 1rem;
  border-radius: 2px;
  background-color: ${({ color, theme }) => {
    if (typeof color === "function") {
      return color(theme);
    }
    return color;
  }};

  @media (max-width: ${({ theme }) => theme.breakpoints?.sm || "576px"}) {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

const VacationCalendar = ({ vacations, onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  // Générer les jours du calendrier
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Premier jour du mois
    const firstDayOfMonth = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
    let firstDayOfWeek = firstDayOfMonth.getDay();
    // Ajuster pour commencer par lundi (0 = lundi, 6 = dimanche)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Nombre de jours du mois précédent à afficher
    const daysFromPrevMonth = firstDayOfWeek;

    // Nombre de jours du mois suivant à afficher pour compléter la grille (6 semaines = 42 jours)
    const totalDaysToShow = 42;
    const daysFromNextMonth =
      totalDaysToShow - lastDayOfMonth.getDate() - daysFromPrevMonth;

    // Générer les jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from({ length: daysFromPrevMonth }, (_, i) => {
      const day = prevMonthLastDay - daysFromPrevMonth + i + 1;
      const date = new Date(year, month - 1, day);
      return {
        date,
        day,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isWeekend: isWeekend(date),
        isHoliday: isHoliday(date),
        holidayName: getHolidayName(date),
      };
    });

    // Générer les jours du mois courant
    const currentMonthDays = Array.from(
      { length: lastDayOfMonth.getDate() },
      (_, i) => {
        const day = i + 1;
        const date = new Date(year, month, day);
        return {
          date,
          day,
          isCurrentMonth: true,
          isToday: isSameDay(date, new Date()),
          isWeekend: isWeekend(date),
          isHoliday: isHoliday(date),
          holidayName: getHolidayName(date),
        };
      }
    );

    // Générer les jours du mois suivant
    const nextMonthDays = Array.from({ length: daysFromNextMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month + 1, day);
      return {
        date,
        day,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isWeekend: isWeekend(date),
        isHoliday: isHoliday(date),
        holidayName: getHolidayName(date),
      };
    });

    // Combiner tous les jours
    setCalendarDays([...prevMonthDays, ...currentMonthDays, ...nextMonthDays]);
  }, [currentDate]);

  // Vérifier si une date est aujourd'hui
  function isSameDay(date1, date2) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  // Obtenir le nom du jour férié
  function getHolidayName(date) {
    const dateStr = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const holiday = FRENCH_HOLIDAYS_2024.find((h) => h.date === dateStr);
    return holiday ? holiday.name : null;
  }

  // Naviguer au mois précédent
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Naviguer au mois suivant
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Naviguer au mois courant
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Formater le mois et l'année
  const formatMonthYear = (date) => {
    return date.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  // Obtenir les congés pour une date donnée
  const getVacationsForDate = (date) => {
    return vacations.filter((vacation) => {
      const startDate = new Date(vacation.startDate);
      const endDate = new Date(vacation.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  // Jours de la semaine
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  // Modifier les fonctions de couleur pour prendre en compte le thème
  const getTodayColor = (theme) =>
    isDarkMode() ? "#1A365D" : theme.colors?.primary + "11" || "#e6f7ff";
  const getWeekendColor = (theme) =>
    isDarkMode() ? "#2D3748" : theme.colors?.background || "#f5f5f5";
  const getHolidayColor = (theme) => (isDarkMode() ? "#3D1A1A" : "#ffeeee");

  return (
    <CalendarContainer>
      <CalendarHeader>
        <MonthTitle>{formatMonthYear(currentDate)}</MonthTitle>
        <NavigationContainer>
          <NavigationButton onClick={goToPreviousMonth}>
            <FaChevronLeft />
          </NavigationButton>
          <NavigationButton onClick={goToCurrentMonth}>
            Aujourd'hui
          </NavigationButton>
          <NavigationButton onClick={goToNextMonth}>
            <FaChevronRight />
          </NavigationButton>
        </NavigationContainer>
      </CalendarHeader>

      <CalendarGrid>
        {weekDays.map((day) => (
          <DayHeader key={day}>{day}</DayHeader>
        ))}

        {calendarDays.map((day, index) => {
          const dayVacations = getVacationsForDate(day.date);
          return (
            <DayCell
              key={index}
              isCurrentMonth={day.isCurrentMonth}
              isToday={day.isToday}
              isWeekend={day.isWeekend}
              isHoliday={day.isHoliday}
            >
              <DayNumber>{day.day}</DayNumber>

              {day.holidayName && <HolidayName>{day.holidayName}</HolidayName>}

              {dayVacations.length > 0 && (
                <VacationList>
                  {dayVacations.map((vacation, vIndex) => (
                    <VacationItem
                      key={vIndex}
                      type={vacation.type}
                      status={vacation.status}
                      title={`${vacation.employeeName} - ${vacation.type} (${vacation.status})`}
                    >
                      {vacation.employeeName}
                    </VacationItem>
                  ))}
                </VacationList>
              )}
            </DayCell>
          );
        })}
      </CalendarGrid>

      <Legend>
        {/* Légende pour les types de congés */}
        {VACATION_TYPES.map((type) => (
          <LegendItem key={type.value}>
            <LegendColor color={type.color} />
            {type.label}
          </LegendItem>
        ))}

        {/* Légende pour les jours spéciaux */}
        <LegendItem>
          <LegendColor color={getTodayColor} />
          Aujourd'hui
        </LegendItem>
        <LegendItem>
          <LegendColor color={getWeekendColor} />
          Weekend
        </LegendItem>
        <LegendItem>
          <LegendColor color={getHolidayColor} />
          Jour férié
        </LegendItem>
      </Legend>
    </CalendarContainer>
  );
};

export default VacationCalendar;
