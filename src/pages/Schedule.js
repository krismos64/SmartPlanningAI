import {
  useState,
  useEffect,
  useCallback,
  startTransition,
  Suspense,
} from "react";
import styled from "styled-components";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { useShifts } from "../hooks/useShifts";
import { useEmployees } from "../hooks/useEmployees";
import { Button } from "../components/ui";
import ShiftForm from "../components/schedule/ShiftForm";

// Composants stylisés
const PageContainer = styled.div`
  padding: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const PageDescription = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0.5rem 0 0 0;
`;

const CalendarContainer = styled.div`
  background: white;
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const Schedule = () => {
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    shifts,
    loading: shiftsLoading,
    error: shiftsError,
    fetchShifts,
    createShift,
    updateShift,
    deleteShift,
  } = useShifts();

  const { employees, loading: employeesLoading } = useEmployees();

  useEffect(() => {
    startTransition(() => {
      fetchShifts();
    });
  }, [fetchShifts]);

  // Convertir les shifts pour FullCalendar
  const events = shifts.map((shift) => ({
    id: shift._id,
    title: `${shift.employee.firstName} ${shift.employee.lastName}`,
    start: shift.startTime,
    end: shift.endTime,
    extendedProps: {
      employee: shift.employee,
      notes: shift.notes,
    },
  }));

  const handleDateSelect = useCallback((selectInfo) => {
    startTransition(() => {
      setSelectedDate(selectInfo.start);
      setSelectedEmployee(null);
      setSelectedShift({
        startTime: selectInfo.start,
        endTime: selectInfo.end,
      });
      setIsFormOpen(true);
    });
  }, []);

  const handleEventClick = useCallback((clickInfo) => {
    startTransition(() => {
      setSelectedShift(clickInfo.event.extendedProps);
      setIsFormOpen(true);
    });
  }, []);

  const handleEventDrop = useCallback(
    async (dropInfo) => {
      const shift = dropInfo.event.extendedProps;
      await updateShift(shift.id, {
        ...shift,
        startTime: dropInfo.event.start,
        endTime: dropInfo.event.end,
      });
    },
    [updateShift]
  );

  const handleEventResize = useCallback(
    async (resizeInfo) => {
      const shift = resizeInfo.event.extendedProps;
      await updateShift(shift.id, {
        ...shift,
        startTime: resizeInfo.event.start,
        endTime: resizeInfo.event.end,
      });
    },
    [updateShift]
  );

  const handleSubmit = useCallback(
    async (data) => {
      const success = selectedShift
        ? await updateShift(selectedShift.id, data)
        : await createShift(data);

      if (success) {
        startTransition(() => {
          setSelectedShift(null);
          setSelectedDate(null);
          setSelectedEmployee(null);
          setIsFormOpen(false);
        });
        fetchShifts();
      }
    },
    [selectedShift, updateShift, createShift, fetchShifts]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedShift) return;

    const success = await deleteShift(selectedShift.id);
    if (success) {
      startTransition(() => {
        setSelectedShift(null);
        setIsFormOpen(false);
      });
      fetchShifts();
    }
  }, [selectedShift, deleteShift, fetchShifts]);

  const handleCloseModal = useCallback(() => {
    startTransition(() => {
      setSelectedShift(null);
      setSelectedDate(null);
      setSelectedEmployee(null);
      setIsFormOpen(false);
    });
  }, []);

  if (shiftsLoading || employeesLoading) {
    return <LoadingSpinner>Chargement...</LoadingSpinner>;
  }

  return (
    <PageContainer>
      <PageHeader>
        <HeaderLeft>
          <PageTitle>Planning</PageTitle>
          <PageDescription>Gérez les plannings de vos employés</PageDescription>
        </HeaderLeft>
        <HeaderRight>
          <Button onClick={() => startTransition(() => setIsFormOpen(true))}>
            Ajouter un planning
          </Button>
        </HeaderRight>
      </PageHeader>

      <Suspense
        fallback={<LoadingSpinner>Chargement du calendrier...</LoadingSpinner>}
      >
        {shiftsError ? (
          <div>Erreur: {shiftsError}</div>
        ) : (
          <CalendarContainer>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              locale={frLocale}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              events={events}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              height="auto"
            />
          </CalendarContainer>
        )}
      </Suspense>

      {isFormOpen && (
        <ShiftForm
          shift={selectedShift}
          selectedDate={selectedDate}
          selectedEmployee={selectedEmployee}
          employees={employees}
          onSubmit={handleSubmit}
          onDelete={selectedShift ? handleDelete : undefined}
          onCancel={handleCloseModal}
        />
      )}
    </PageContainer>
  );
};

export default Schedule;
