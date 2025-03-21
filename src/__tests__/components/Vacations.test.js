import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "react-hot-toast";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../contexts/AuthContext";
import useVacations from "../../hooks/useVacations";
import Vacations from "../../pages/Vacations";
import { mockErrors, mockUsers, mockVacations } from "../mocks/mockData";

// Mock des hooks
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../components/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

jest.mock("../../hooks/useVacations", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock de react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock des composants qui ne sont pas directement testés
jest.mock("../../components/vacations/VacationForm", () => {
  return function MockVacationForm(props) {
    return <div data-testid="vacation-form" onClick={props.onSubmit}></div>;
  };
});

jest.mock("../../components/vacations/VacationList", () => {
  return function MockVacationList(props) {
    return (
      <div data-testid="vacation-list">
        {props.vacations && props.vacations.length === 0 && (
          <span>Aucune demande</span>
        )}
        <button onClick={() => props.onEdit(mockVacations[0])}>Edit</button>
        <button onClick={() => props.onDelete(1)}>Delete</button>
        <button onClick={() => props.onApprove(1)}>Approve</button>
        <button onClick={() => props.onReject(1)}>Reject</button>
      </div>
    );
  };
});

describe("Vacations Page", () => {
  // Setup par défaut avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock des hooks de base
    useAuth.mockReturnValue({
      user: mockUsers.admin,
    });

    useTheme.mockReturnValue({
      theme: "light",
    });

    // Mock de base du hook useVacations
    useVacations.mockReturnValue({
      vacations: mockVacations,
      loading: false,
      error: null,
      createVacation: jest.fn(),
      updateVacation: jest.fn(),
      deleteVacation: jest.fn(),
      updateVacationStatus: jest.fn(),
      getVacationsByStatus: jest.fn((status) =>
        mockVacations.filter((v) => v.status === status)
      ),
      refreshVacations: jest.fn(),
    });
  });

  it("affiche la liste des congés à partir du hook useVacations", () => {
    render(<Vacations />);

    // Vérifier que le composant VacationList reçoit les données
    expect(screen.getByTestId("vacation-list")).toBeInTheDocument();

    // Vérifier que le titre est affiché
    expect(screen.getByText("Gestion des congés")).toBeInTheDocument();
    expect(
      screen.getByText("Liste des demandes de congés")
    ).toBeInTheDocument();
  });

  it("affiche un écran de chargement pendant le chargement des données", () => {
    // Simuler l'état de chargement
    useVacations.mockReturnValue({
      vacations: [],
      loading: true,
      error: null,
      createVacation: jest.fn(),
      updateVacation: jest.fn(),
      deleteVacation: jest.fn(),
      updateVacationStatus: jest.fn(),
      getVacationsByStatus: jest.fn(),
      refreshVacations: jest.fn(),
    });

    render(<Vacations />);

    // Vérifier que l'écran de chargement est affiché
    expect(screen.getByText("Chargement des congés...")).toBeInTheDocument();
  });

  it("affiche un message d'erreur en cas d'erreur API", () => {
    // Simuler une erreur d'API
    useVacations.mockReturnValue({
      vacations: [],
      loading: false,
      error: mockErrors.loadError,
      createVacation: jest.fn(),
      updateVacation: jest.fn(),
      deleteVacation: jest.fn(),
      updateVacationStatus: jest.fn(),
      getVacationsByStatus: jest.fn(),
      refreshVacations: jest.fn(),
    });

    render(<Vacations />);

    // Vérifier que le message d'erreur est affiché
    expect(screen.getByText(mockErrors.loadError)).toBeInTheDocument();
  });

  it("affiche un message quand la liste est vide", () => {
    // Simuler une liste vide
    useVacations.mockReturnValue({
      vacations: [],
      loading: false,
      error: null,
      createVacation: jest.fn(),
      updateVacation: jest.fn(),
      deleteVacation: jest.fn(),
      updateVacationStatus: jest.fn(),
      getVacationsByStatus: jest.fn(() => []),
      refreshVacations: jest.fn(),
    });

    render(<Vacations />);

    // Vérifier que le message "Aucune demande" est affiché
    expect(screen.getByText("Aucune demande")).toBeInTheDocument();
  });

  it("filtre les congés en fonction de l'onglet sélectionné", () => {
    const getVacationsByStatusMock = jest.fn((status) =>
      mockVacations.filter((v) => v.status === status)
    );

    // Setup des mocks
    useVacations.mockReturnValue({
      vacations: mockVacations,
      loading: false,
      error: null,
      getVacationsByStatus: getVacationsByStatusMock,
      createVacation: jest.fn(),
      updateVacation: jest.fn(),
      deleteVacation: jest.fn(),
      updateVacationStatus: jest.fn(),
      refreshVacations: jest.fn(),
    });

    render(<Vacations />);

    // Cliquer sur l'onglet "En attente"
    const pendingTab = screen.getByRole("tab", { name: /En attente/i });
    fireEvent.click(pendingTab);

    // Vérifier que getVacationsByStatus a été appelé avec "pending"
    expect(getVacationsByStatusMock).toHaveBeenCalledWith("pending");
  });

  it("gère correctement les actions sur les congés", async () => {
    // Mock des fonctions de mutation
    const deleteVacationMock = jest
      .fn()
      .mockResolvedValue({
        success: true,
        message: "Congé supprimé avec succès",
      });
    const updateVacationStatusMock = jest
      .fn()
      .mockResolvedValue({
        success: true,
        message: "Statut mis à jour avec succès",
      });

    useVacations.mockReturnValue({
      vacations: mockVacations,
      loading: false,
      error: null,
      getVacationsByStatus: jest.fn((status) =>
        mockVacations.filter((v) => v.status === status)
      ),
      createVacation: jest.fn(),
      updateVacation: jest.fn(),
      deleteVacation: deleteVacationMock,
      updateVacationStatus: updateVacationStatusMock,
      refreshVacations: jest.fn(),
    });

    render(<Vacations />);

    // Tester la suppression
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteVacationMock).toHaveBeenCalledWith(1);
    });

    // Tester l'approbation
    const approveButton = screen.getByText("Approve");
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(updateVacationStatusMock).toHaveBeenCalledWith(1, "approved");
    });

    // Tester le rejet
    const rejectButton = screen.getByText("Reject");
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(updateVacationStatusMock).toHaveBeenCalledWith(
        1,
        "rejected",
        undefined
      );
    });
  });

  it("ouvre le formulaire de création et le ferme", () => {
    render(<Vacations />);

    // Cliquer sur le bouton "Nouvelle demande"
    const newButton = screen.getByText("Nouvelle demande");
    fireEvent.click(newButton);

    // Vérifier que le formulaire est affiché
    expect(screen.getByTestId("vacation-form")).toBeInTheDocument();

    // Simuler la soumission du formulaire
    fireEvent.click(screen.getByTestId("vacation-form"));

    // Vérifier que les notifications sont affichées
    expect(toast.success).toHaveBeenCalled();
  });
});
