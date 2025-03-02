import { useState } from "react";
import styled, { keyframes } from "styled-components";
import Button from "../components/ui/Button";

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideInUp = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Composants stylisés
const PlanningContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const PageTitleContainer = styled.div`
  flex: 1;
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

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const CalendarContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const MonthNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MonthTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ViewOptions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ViewButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: none;
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primary : "transparent"};
  color: ${({ active, theme }) =>
    active ? "white" : theme.colors.text.secondary};
  font-size: 0.875rem;
  cursor: pointer;

  &:hover {
    background-color: ${({ active, theme }) =>
      active ? theme.colors.primary : `${theme.colors.primary}11`};
    color: ${({ active, theme }) => (active ? "white" : theme.colors.primary)};
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const WeekdayHeader = styled.div`
  padding: 1rem 0.5rem;
  text-align: center;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DayCell = styled.div`
  min-height: 120px;
  padding: 0.5rem;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  background-color: ${({ isToday, theme }) =>
    isToday ? `${theme.colors.primary}05` : "transparent"};

  &:nth-child(7n) {
    border-right: none;
  }

  ${({ isCurrentMonth, theme }) =>
    !isCurrentMonth &&
    `
    opacity: 0.5;
    background-color: ${`${theme.colors.background}66`};
  `}
`;

const DayNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: ${({ isToday }) => (isToday ? 600 : 400)};
  color: ${({ isToday, theme }) =>
    isToday ? "white" : theme.colors.text.primary};
  background-color: ${({ isToday, theme }) =>
    isToday ? theme.colors.primary : "transparent"};
`;

const EventsContainer = styled.div`
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Event = styled.div`
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ color, theme }) => color || theme.colors.primary};
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    filter: brightness(1.1);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  animation: ${slideInUp} 0.3s ease-in-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.5rem;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}33`};
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}33`};
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}33`};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const ColorOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ColorOption = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  cursor: pointer;
  border: 2px solid
    ${({ selected, theme }) =>
      selected ? theme.colors.primary : "transparent"};

  &:hover {
    transform: scale(1.1);
  }
`;

// Composant Planning
const Planning = () => {
  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    type: "meeting",
  });

  // Données fictives pour les événements
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Réunion d'équipe",
      date: new Date(2023, 9, 15),
      time: "10:00 - 11:30",
      type: "meeting",
    },
    {
      id: 2,
      title: "Formation React",
      date: new Date(2023, 9, 20),
      time: "14:00 - 16:00",
      type: "training",
    },
    {
      id: 3,
      title: "Entretien annuel",
      date: new Date(2023, 9, 25),
      time: "09:00 - 10:00",
      type: "personal",
    },
  ]);

  // Données fictives pour les employés
  const employees = [
    { id: 1, name: "Sophie Martin" },
    { id: 2, name: "Thomas Dubois" },
    { id: 3, name: "Julie Leroy" },
    { id: 4, name: "Lucas Bernard" },
    { id: 5, name: "Emma Petit" },
  ];

  // Couleurs disponibles pour les événements
  const colors = [
    "#3a86ff", // Bleu
    "#8338ec", // Violet
    "#ff006e", // Rose
    "#06d6a0", // Vert
    "#ffbe0b", // Jaune
  ];

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
      });
    }

    // Ajouter les jours du mois courant
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(date.getFullYear(), date.getMonth(), i);
      days.push({
        date: day,
        isCurrentMonth: true,
        isToday: isSameDay(day, new Date()),
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

  // Gérer le clic sur un jour
  const handleDayClick = (day) => {
    setSelectedEvent(day);

    // Préremplir la date dans le formulaire
    const formattedDate = day.toISOString().split("T")[0];
    setNewEvent((prev) => ({
      ...prev,
      date: formattedDate,
    }));

    setShowModal(true);
  };

  // Gérer le clic sur un événement
  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);

    // Préremplir le formulaire avec les données de l'événement
    const startDate = new Date(event.date);
    const endDate = new Date(event.endDate);

    setNewEvent({
      title: event.title,
      description: event.description,
      date: startDate.toISOString().split("T")[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      employee: event.employee,
      color: event.color,
    });

    setShowModal(true);
  };

  // Gérer la soumission du formulaire d'événement
  const handleSubmit = (e) => {
    e.preventDefault();

    // Valider le formulaire
    if (
      !newEvent.title ||
      !newEvent.date ||
      !newEvent.startTime ||
      !newEvent.endTime ||
      !newEvent.employee
    ) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Créer l'objet événement
    const startDate = new Date(`${newEvent.date}T${newEvent.startTime}:00`);
    const endDate = new Date(`${newEvent.date}T${newEvent.endTime}:00`);

    if (startDate >= endDate) {
      alert("L'heure de fin doit être postérieure à l'heure de début.");
      return;
    }

    const eventToSave = {
      id: selectedEvent ? selectedEvent.id : Date.now(),
      title: newEvent.title,
      description: newEvent.description,
      date: startDate.toISOString(),
      endDate: endDate.toISOString(),
      employee: newEvent.employee,
      color: newEvent.color,
    };

    // Mettre à jour les événements
    if (selectedEvent) {
      // Modifier un événement existant
      setEvents((prev) =>
        prev.map((event) =>
          event.id === selectedEvent.id ? eventToSave : event
        )
      );
    } else {
      // Ajouter un nouvel événement
      setEvents((prev) => [...prev, eventToSave]);
    }

    // Fermer le modal
    setShowModal(false);
  };

  // Jours de la semaine
  const weekdays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  // Jours du mois
  const days = getDaysInMonth(currentDate);

  return (
    <PlanningContainer>
      <PageHeader>
        <PageTitleContainer>
          <PageTitle>Planning</PageTitle>
          <PageDescription>
            Gérez les plannings de vos équipes et visualisez les événements à
            venir.
          </PageDescription>
        </PageTitleContainer>

        <ActionButtons>
          <Button variant="outline">
            <span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Filtrer
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setSelectedEvent(null);
              setNewEvent({
                title: "",
                date: new Date().toISOString().split("T")[0],
                time: "",
                type: "meeting",
              });
              setShowModal(true);
            }}
          >
            <span>+</span>
            Nouvel événement
          </Button>
        </ActionButtons>
      </PageHeader>

      <CalendarContainer>
        <CalendarHeader>
          <MonthNavigation>
            <NavButton onClick={goToPreviousMonth}>
              <svg
                width="16"
                height="16"
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
            </NavButton>
            <MonthTitle>{formatMonthYear(currentDate)}</MonthTitle>
            <NavButton onClick={goToNextMonth}>
              <svg
                width="16"
                height="16"
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
            </NavButton>
            <Button variant="outline" onClick={goToToday}>
              Aujourd'hui
            </Button>
          </MonthNavigation>

          <ViewOptions>
            <ViewButton
              active={view === "month"}
              onClick={() => setView("month")}
            >
              Mois
            </ViewButton>
            <ViewButton
              active={view === "week"}
              onClick={() => setView("week")}
            >
              Semaine
            </ViewButton>
            <ViewButton active={view === "day"} onClick={() => setView("day")}>
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

            return (
              <DayCell
                key={index}
                isCurrentMonth={day.isCurrentMonth}
                isToday={day.isToday}
                onClick={() => handleDayClick(day.date)}
              >
                <DayNumber isToday={day.isToday}>
                  {day.date.getDate()}
                </DayNumber>

                <EventsContainer>
                  {dayEvents.map((event) => (
                    <Event
                      key={event.id}
                      color={event.color}
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      {event.title}
                    </Event>
                  ))}
                </EventsContainer>
              </DayCell>
            );
          })}
        </CalendarGrid>
      </CalendarContainer>

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {selectedEvent ? "Modifier l'événement" : "Nouvel événement"}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder="Titre de l'événement"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  placeholder="Description de l'événement"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="startTime">Heure de début</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, startTime: e.target.value })
                  }
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="endTime">Heure de fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, endTime: e.target.value })
                  }
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="employee">Employé</Label>
                <Select
                  id="employee"
                  value={newEvent.employee}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, employee: e.target.value })
                  }
                  required
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Couleur</Label>
                <ColorOptions>
                  {colors.map((color) => (
                    <ColorOption
                      key={color}
                      color={color}
                      selected={newEvent.color === color}
                      onClick={() => setNewEvent({ ...newEvent, color })}
                    />
                  ))}
                </ColorOptions>
              </FormGroup>

              <ButtonGroup>
                {selectedEvent && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Êtes-vous sûr de vouloir supprimer cet événement ?"
                        )
                      ) {
                        setEvents((prev) =>
                          prev.filter((event) => event.id !== selectedEvent.id)
                        );
                        setShowModal(false);
                      }
                    }}
                  >
                    Supprimer
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  {selectedEvent ? "Modifier" : "Ajouter"}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </PlanningContainer>
  );
};

export default Planning;
