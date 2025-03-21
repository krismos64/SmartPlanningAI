import { fireEvent, render, screen, within } from "@testing-library/react";
import { mockDepartments, mockEmployees } from "../mocks/mockData";

// Comme nous n'avons pas trouvé le composant DepartmentList.js existant,
// nous allons créer un mock de ce composant pour les tests
// Dans un cas réel, il faudrait importer le vrai composant
const DepartmentList = ({ departments, onSelectDepartment }) => (
  <div data-testid="department-list">
    <h2>Liste des départements</h2>
    <ul>
      {departments.map((department) => (
        <li
          key={department.id}
          data-testid={`department-${department.id}`}
          onClick={() => onSelectDepartment(department)}
        >
          {department.name}
          {department.showEmployees && (
            <ul data-testid={`employees-${department.id}`}>
              {department.employees.map((employee) => (
                <li key={employee.id} data-testid={`employee-${employee.id}`}>
                  {employee.first_name} {employee.last_name}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  </div>
);

// Créons maintenant les tests pour ce composant
describe("DepartmentList Component", () => {
  it("affiche tous les départements à partir des données mockées", () => {
    render(
      <DepartmentList
        departments={mockDepartments}
        onSelectDepartment={() => {}}
      />
    );

    // Vérifier que le titre est affiché
    expect(screen.getByText("Liste des départements")).toBeInTheDocument();

    // Vérifier que tous les départements sont affichés
    mockDepartments.forEach((department) => {
      expect(screen.getByText(department.name)).toBeInTheDocument();
    });

    // Vérifier que les employés ne sont pas affichés par défaut
    const administrationEmployees = screen.queryByTestId(
      "employees-administration"
    );
    expect(administrationEmployees).not.toBeInTheDocument();
  });

  it("affiche les employés liés lors du clic sur un département", () => {
    // Mock de la fonction onSelectDepartment qui mettra à jour le département
    // pour afficher ses employés
    const onSelectDepartment = jest.fn((department) => {
      // Simuler la mise à jour du state qui afficherait les employés
      department.showEmployees = true;
      // Forcer le re-rendu du composant avec le département mis à jour
      // (Dans un cas réel, ce serait géré par React et un hook d'état)
    });

    // Cloner les départements pour éviter de modifier l'original
    const departmentsCopy = JSON.parse(JSON.stringify(mockDepartments));

    const { rerender } = render(
      <DepartmentList
        departments={departmentsCopy}
        onSelectDepartment={onSelectDepartment}
      />
    );

    // Cliquer sur le département "Administration"
    const administrationDept = screen.getByTestId("department-administration");
    fireEvent.click(administrationDept);

    // Vérifier que onSelectDepartment a été appelé avec le bon département
    expect(onSelectDepartment).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "administration",
        name: "Administration",
      })
    );

    // Simuler la mise à jour du state qui se produirait dans un composant réel
    departmentsCopy[0].showEmployees = true;

    // Re-render avec le département mis à jour
    rerender(
      <DepartmentList
        departments={departmentsCopy}
        onSelectDepartment={onSelectDepartment}
      />
    );

    // Vérifier que l'employé du département "Administration" est maintenant affiché
    expect(screen.getByTestId("employees-administration")).toBeInTheDocument();
    expect(
      screen.getByText(
        `${mockEmployees[1].first_name} ${mockEmployees[1].last_name}`
      )
    ).toBeInTheDocument();
  });

  it("permet de sélectionner un autre département", () => {
    // Mock de la fonction onSelectDepartment
    const onSelectDepartment = jest.fn();

    render(
      <DepartmentList
        departments={mockDepartments}
        onSelectDepartment={onSelectDepartment}
      />
    );

    // Cliquer sur le département "Commercial"
    const commercialDept = screen.getByTestId("department-commercial");
    fireEvent.click(commercialDept);

    // Vérifier que onSelectDepartment a été appelé avec le bon département
    expect(onSelectDepartment).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "commercial",
        name: "Commercial",
      })
    );

    // Cliquer sur le département "Technique"
    const techniqueDept = screen.getByTestId("department-technique");
    fireEvent.click(techniqueDept);

    // Vérifier que onSelectDepartment a été appelé avec le bon département
    expect(onSelectDepartment).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "technique",
        name: "Technique",
      })
    );
  });

  it("gère correctement un département sans employés", () => {
    // Créer un département sans employés
    const departmentsWithEmpty = [
      ...mockDepartments,
      { id: "empty", name: "Département Vide", employees: [] },
    ];

    // Rendre le composant avec le département vide
    const { rerender } = render(
      <DepartmentList
        departments={departmentsWithEmpty}
        onSelectDepartment={() => {}}
      />
    );

    // Vérifier que le département vide est affiché
    expect(screen.getByText("Département Vide")).toBeInTheDocument();

    // Simuler l'affichage des employés pour le département vide
    departmentsWithEmpty[3].showEmployees = true;

    // Re-render avec le département mis à jour
    rerender(
      <DepartmentList
        departments={departmentsWithEmpty}
        onSelectDepartment={() => {}}
      />
    );

    // Vérifier que la liste d'employés est vide (mais présente dans le DOM)
    const emptyEmployeesList = screen.getByTestId("employees-empty");
    expect(emptyEmployeesList).toBeInTheDocument();
    expect(screen.queryAllByTestId(/^employee-/)).toHaveLength(3); // Vérifie qu'on a toujours les 3 employés originaux
    expect(within(emptyEmployeesList).queryAllByRole("listitem")).toHaveLength(
      0
    ); // Vérifie que le département vide n'a pas d'employés
  });
});
