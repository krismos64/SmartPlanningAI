import { fireEvent, render, screen } from "@testing-library/react";
import { useTheme } from "../../components/ThemeProvider";
import VacationList from "../../components/vacations/VacationList";
import { useAuth } from "../../contexts/AuthContext";
import { mockUsers, mockVacations } from "../mocks/mockData";

// Mock des hooks utilisés par le composant
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../components/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

// Mock de formatage de date à partir de date-fns pour éviter les erreurs
jest.mock("date-fns", () => ({
  format: jest.fn((date, formatString, options) => {
    if (typeof date === "string") {
      return date; // Simplement retourner la chaîne de date pour les tests
    }
    return "01 janvier 2023"; // Valeur par défaut pour les tests
  }),
}));

// Mock du hook d'internationalisation
jest.mock("date-fns/locale", () => ({
  fr: {},
}));

describe("VacationList Component", () => {
  // Configuration par défaut pour chaque test
  beforeEach(() => {
    // Mock du hook useTheme
    useTheme.mockReturnValue({
      theme: "light",
    });

    // Reset des mocks
    jest.clearAllMocks();
  });

  it("affiche la liste des congés", () => {
    // Mock du hook useAuth avec un utilisateur admin
    useAuth.mockReturnValue({
      user: mockUsers.admin,
    });

    // Rendu du composant avec des données mockées
    render(
      <VacationList
        vacations={mockVacations}
        loading={false}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onApprove={jest.fn()}
        onReject={jest.fn()}
      />
    );

    // Vérifier que les employés sont bien affichés
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    expect(screen.getByText("Marie Martin")).toBeInTheDocument();
    expect(screen.getByText("Paul Durand")).toBeInTheDocument();

    // Vérifier que les dates de début et fin sont affichées
    mockVacations.forEach((vacation) => {
      expect(screen.getAllByText(vacation.start_date).length).toBeGreaterThan(
        0
      );
      expect(screen.getAllByText(vacation.end_date).length).toBeGreaterThan(0);
    });
  });

  it("affiche les boutons d'action pour un admin avec accès manager_id", () => {
    // Mock du hook useAuth avec un utilisateur admin
    useAuth.mockReturnValue({
      user: mockUsers.admin, // Admin avec ID 100 (correspond au manager_id des employés 1 et 2)
    });

    const onApproveMock = jest.fn();
    const onRejectMock = jest.fn();

    // Rendu du composant
    render(
      <VacationList
        vacations={mockVacations}
        loading={false}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onApprove={onApproveMock}
        onReject={onRejectMock}
      />
    );

    // Trouver les boutons d'action pour le congé en attente (id 1)
    const approveButtons = screen.getAllByRole("button", { name: "approve" });
    const rejectButtons = screen.getAllByRole("button", { name: "reject" });

    // Vérifier qu'ils sont présents uniquement pour les employés gérés par l'admin (2 employés sur 3)
    // Le statut "pending" doit aussi être présent
    expect(approveButtons.length).toBe(1); // 1 seul est en "pending" et a le bon manager_id
    expect(rejectButtons.length).toBe(1);
  });

  it("n'affiche pas les boutons d'action quand le manager_id ne correspond pas", () => {
    // Mock du hook useAuth avec un utilisateur admin mais qui n'est pas le manager de l'employé 3
    useAuth.mockReturnValue({
      user: mockUsers.admin, // Admin avec ID 100, l'employé 3 a un manager_id de 200
    });

    // Rendu du composant avec uniquement le congé de l'employé 3
    render(
      <VacationList
        vacations={[mockVacations[2]]} // Uniquement le congé de Paul Durand (manager_id: 200)
        loading={false}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onApprove={jest.fn()}
        onReject={jest.fn()}
      />
    );

    // Vérifier que l'employé est affiché
    expect(screen.getByText("Paul Durand")).toBeInTheDocument();

    // Mais aucun bouton d'action ne doit être affiché car l'admin n'est pas son manager
    const editButtons = screen.queryAllByRole("button", { name: "edit" });
    const deleteButtons = screen.queryAllByRole("button", { name: "delete" });

    // Vérifier que les boutons ne sont pas présents
    expect(editButtons.length).toBe(0);
    expect(deleteButtons.length).toBe(0);
  });

  it("appelle les fonctions de callback lors du clic sur les boutons", () => {
    // Mock du hook useAuth avec un utilisateur admin
    useAuth.mockReturnValue({
      user: mockUsers.admin,
    });

    const onEditMock = jest.fn();
    const onDeleteMock = jest.fn();
    const onApproveMock = jest.fn();
    const onRejectMock = jest.fn();

    // Rendu du composant avec seulement le congé en attente de l'employé 1
    render(
      <VacationList
        vacations={[mockVacations[0]]} // Jean Dupont avec congé "pending"
        loading={false}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
        onApprove={onApproveMock}
        onReject={onRejectMock}
      />
    );

    // Trouver les boutons d'action
    const editButton = screen.getByRole("button", { name: "edit" });
    const deleteButton = screen.getByRole("button", { name: "delete" });
    const approveButton = screen.getByRole("button", { name: "approve" });
    const rejectButton = screen.getByRole("button", { name: "reject" });

    // Cliquer sur les boutons
    fireEvent.click(editButton);
    fireEvent.click(deleteButton);
    fireEvent.click(approveButton);
    fireEvent.click(rejectButton);

    // Vérifier que les fonctions de callback ont été appelées
    expect(onEditMock).toHaveBeenCalledWith(mockVacations[0]);
    expect(onDeleteMock).toHaveBeenCalledWith(mockVacations[0].id);
    expect(onApproveMock).toHaveBeenCalledWith(mockVacations[0].id);
    expect(onRejectMock).toHaveBeenCalledWith(mockVacations[0].id);
  });

  it("affiche un message quand la liste est vide", () => {
    // Mock du hook useAuth
    useAuth.mockReturnValue({
      user: mockUsers.admin,
    });

    // Rendu du composant avec une liste vide
    render(
      <VacationList
        vacations={[]}
        loading={false}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onApprove={jest.fn()}
        onReject={jest.fn()}
      />
    );

    // Vérifier qu'un message d'absence de données est affiché
    expect(screen.getByText("Aucune demande de congé")).toBeInTheDocument();
  });

  it("affiche un indicateur de chargement", () => {
    // Mock du hook useAuth
    useAuth.mockReturnValue({
      user: mockUsers.admin,
    });

    // Rendu du composant en état de chargement
    render(
      <VacationList
        vacations={mockVacations}
        loading={true}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onApprove={jest.fn()}
        onReject={jest.fn()}
      />
    );

    // Vérifier que l'indicateur de chargement est affiché
    // CircularProgress est généralement rendu comme un élément SVG avec un role progressbar
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
