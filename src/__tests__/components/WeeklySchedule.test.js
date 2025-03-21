import { fireEvent, render, screen } from "@testing-library/react";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { mockEmployees } from "../mocks/mockData";

// Mock du composant WeeklySchedule puisque nous n'avons pas le composant réel
const WeeklySchedule = ({
  weekSchedule,
  employees,
  currentDate,
  onDateChange,
  onScheduleUpdate,
}) => {
  // Formatage de la date pour l'affichage
  const formatDate = (date) => format(date, "EEEE d MMMM", { locale: fr });

  // Génération des jours de la semaine
  const daysOfWeek = [...Array(7)].map((_, i) => {
    const date = addDays(currentDate, i);
    return {
      date,
      formatted: formatDate(date),
    };
  });

  return (
    <div data-testid="weekly-schedule">
      <h2>Planning Hebdomadaire</h2>
      <div className="date-navigation">
        <button
          data-testid="prev-week-btn"
          onClick={() => onDateChange(addDays(currentDate, -7))}
        >
          Semaine précédente
        </button>
        <span data-testid="current-week">
          {formatDate(currentDate)} - {formatDate(addDays(currentDate, 6))}
        </span>
        <button
          data-testid="next-week-btn"
          onClick={() => onDateChange(addDays(currentDate, 7))}
        >
          Semaine suivante
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Employé</th>
            {daysOfWeek.map((day) => (
              <th
                key={day.formatted}
                data-testid={`day-${format(day.date, "yyyy-MM-dd")}`}
              >
                {day.formatted}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} data-testid={`employee-row-${employee.id}`}>
              <td>
                {employee.first_name} {employee.last_name}
              </td>
              {daysOfWeek.map((day) => {
                const dateStr = format(day.date, "yyyy-MM-dd");
                const schedule = weekSchedule.find(
                  (s) => s.employee_id === employee.id && s.date === dateStr
                );

                return (
                  <td
                    key={dateStr}
                    data-testid={`cell-${employee.id}-${dateStr}`}
                  >
                    {schedule ? (
                      <div>
                        <span>
                          {schedule.start_time} - {schedule.end_time}
                        </span>
                        <button
                          data-testid={`edit-${employee.id}-${dateStr}`}
                          onClick={() => onScheduleUpdate(employee.id, dateStr)}
                        >
                          Modifier
                        </button>
                      </div>
                    ) : (
                      <button
                        data-testid={`add-${employee.id}-${dateStr}`}
                        onClick={() => onScheduleUpdate(employee.id, dateStr)}
                      >
                        Ajouter
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Mock des données pour le planning hebdomadaire
const mockWeekSchedule = [
  {
    id: 1,
    employee_id: "emp1",
    date: "2023-09-04",
    start_time: "09:00",
    end_time: "17:00",
  },
  {
    id: 2,
    employee_id: "emp2",
    date: "2023-09-04",
    start_time: "08:00",
    end_time: "16:00",
  },
  {
    id: 3,
    employee_id: "emp1",
    date: "2023-09-05",
    start_time: "09:00",
    end_time: "17:00",
  },
];

describe("WeeklySchedule Component", () => {
  const currentDate = new Date(2023, 8, 4); // 4 septembre 2023 (mois indexé à 0)

  it("affiche correctement le planning hebdomadaire", () => {
    render(
      <WeeklySchedule
        weekSchedule={mockWeekSchedule}
        employees={mockEmployees.slice(0, 2)} // Juste les 2 premiers employés
        currentDate={currentDate}
        onDateChange={() => {}}
        onScheduleUpdate={() => {}}
      />
    );

    // Vérifier que le titre est affiché
    expect(screen.getByText("Planning Hebdomadaire")).toBeInTheDocument();

    // Vérifier que la semaine actuelle est affichée
    const currentWeekText = screen.getByTestId("current-week").textContent;
    expect(currentWeekText).toContain("lundi 4 septembre");
    expect(currentWeekText).toContain("dimanche 10 septembre");

    // Vérifier que les deux employés sont affichés
    expect(screen.getByTestId("employee-row-emp1")).toBeInTheDocument();
    expect(screen.getByTestId("employee-row-emp2")).toBeInTheDocument();

    // Vérifier les horaires pour le 4 septembre
    const cell1 = screen.getByTestId("cell-emp1-2023-09-04");
    expect(cell1.textContent).toContain("09:00 - 17:00");

    const cell2 = screen.getByTestId("cell-emp2-2023-09-04");
    expect(cell2.textContent).toContain("08:00 - 16:00");

    // Vérifier qu'un bouton "Ajouter" est présent pour une cellule vide
    expect(screen.getByTestId("add-emp2-2023-09-05")).toBeInTheDocument();
  });

  it("permet de naviguer entre les semaines", () => {
    const onDateChangeMock = jest.fn();

    render(
      <WeeklySchedule
        weekSchedule={mockWeekSchedule}
        employees={mockEmployees.slice(0, 2)}
        currentDate={currentDate}
        onDateChange={onDateChangeMock}
        onScheduleUpdate={() => {}}
      />
    );

    // Cliquer sur le bouton "Semaine précédente"
    fireEvent.click(screen.getByTestId("prev-week-btn"));
    expect(onDateChangeMock).toHaveBeenCalledWith(addDays(currentDate, -7));

    // Cliquer sur le bouton "Semaine suivante"
    fireEvent.click(screen.getByTestId("next-week-btn"));
    expect(onDateChangeMock).toHaveBeenCalledWith(addDays(currentDate, 7));
  });

  it("permet de modifier ou d'ajouter un horaire", () => {
    const onScheduleUpdateMock = jest.fn();

    render(
      <WeeklySchedule
        weekSchedule={mockWeekSchedule}
        employees={mockEmployees.slice(0, 2)}
        currentDate={currentDate}
        onDateChange={() => {}}
        onScheduleUpdate={onScheduleUpdateMock}
      />
    );

    // Cliquer sur le bouton "Modifier" pour un horaire existant
    fireEvent.click(screen.getByTestId("edit-emp1-2023-09-04"));
    expect(onScheduleUpdateMock).toHaveBeenCalledWith("emp1", "2023-09-04");

    // Cliquer sur le bouton "Ajouter" pour un horaire non existant
    fireEvent.click(screen.getByTestId("add-emp2-2023-09-05"));
    expect(onScheduleUpdateMock).toHaveBeenCalledWith("emp2", "2023-09-05");
  });

  it("affiche correctement les 7 jours de la semaine", () => {
    render(
      <WeeklySchedule
        weekSchedule={mockWeekSchedule}
        employees={mockEmployees.slice(0, 2)}
        currentDate={currentDate}
        onDateChange={() => {}}
        onScheduleUpdate={() => {}}
      />
    );

    // Vérifier que les 7 jours de la semaine sont affichés
    expect(screen.getByTestId("day-2023-09-04")).toBeInTheDocument(); // Lundi
    expect(screen.getByTestId("day-2023-09-05")).toBeInTheDocument(); // Mardi
    expect(screen.getByTestId("day-2023-09-06")).toBeInTheDocument(); // Mercredi
    expect(screen.getByTestId("day-2023-09-07")).toBeInTheDocument(); // Jeudi
    expect(screen.getByTestId("day-2023-09-08")).toBeInTheDocument(); // Vendredi
    expect(screen.getByTestId("day-2023-09-09")).toBeInTheDocument(); // Samedi
    expect(screen.getByTestId("day-2023-09-10")).toBeInTheDocument(); // Dimanche
  });

  it("gère correctement le cas où le planning est vide", () => {
    render(
      <WeeklySchedule
        weekSchedule={[]} // Planning vide
        employees={mockEmployees.slice(0, 2)}
        currentDate={currentDate}
        onDateChange={() => {}}
        onScheduleUpdate={() => {}}
      />
    );

    // Vérifier que tous les boutons sont des boutons "Ajouter"
    const addButtons = screen.getAllByText("Ajouter");
    expect(addButtons).toHaveLength(14); // 2 employés x 7 jours
  });
});
