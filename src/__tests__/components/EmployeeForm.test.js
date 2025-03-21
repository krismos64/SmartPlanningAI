import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "react-hot-toast";
import EmployeeForm from "../../components/employees/EmployeeForm";
import { mockEmployees } from "../mocks/mockData";

// Mock de react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe("EmployeeForm Component", () => {
  // Configuration par défaut pour chaque test
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.getItem.mockReturnValue("fake-token"); // Simuler un token d'authentification
  });

  it("affiche tous les champs du formulaire", () => {
    render(<EmployeeForm />);

    // Vérifier que les champs obligatoires sont présents
    expect(screen.getByLabelText(/Prénom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Téléphone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adresse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ville/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Code postal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Département/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rôle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heures contractuelles/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Statut/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date d'embauche/i)).toBeInTheDocument();

    // Vérifier la présence du bouton de soumission
    expect(
      screen.getByRole("button", { name: /Ajouter/i })
    ).toBeInTheDocument();
  });

  it("remplit le formulaire avec les données de l'employé", () => {
    // Utiliser un employé de mock
    const employee = mockEmployees[0];

    render(<EmployeeForm employee={employee} />);

    // Vérifier que les champs sont pré-remplis avec les données de l'employé
    expect(screen.getByLabelText(/Prénom/i)).toHaveValue(employee.first_name);
    expect(screen.getByLabelText(/Nom/i)).toHaveValue(employee.last_name);
    expect(screen.getByLabelText(/Email/i)).toHaveValue(employee.email);
    expect(screen.getByLabelText(/Téléphone/i)).toHaveValue(employee.phone);
    expect(screen.getByLabelText(/Adresse/i)).toHaveValue(employee.address);
    expect(screen.getByLabelText(/Ville/i)).toHaveValue(employee.city);
    expect(screen.getByLabelText(/Code postal/i)).toHaveValue(
      employee.zip_code
    );
    expect(screen.getByLabelText(/Département/i)).toHaveValue(
      employee.department
    );
    expect(screen.getByLabelText(/Rôle/i)).toHaveValue(employee.role);

    // Vérifier que le bouton affiche "Enregistrer" au lieu de "Ajouter"
    expect(
      screen.getByRole("button", { name: /Enregistrer/i })
    ).toBeInTheDocument();
  });

  it("affiche des erreurs de validation pour les champs requis vides", async () => {
    const onSubmitMock = jest.fn();

    render(<EmployeeForm onSubmit={onSubmitMock} />);

    // Soumettre le formulaire sans remplir les champs requis
    const submitButton = screen.getByRole("button", { name: /Ajouter/i });
    fireEvent.click(submitButton);

    // Vérifier que les erreurs de validation sont affichées
    await waitFor(() => {
      expect(
        screen.getByText(/Le prénom est obligatoire/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Le nom est obligatoire/i)).toBeInTheDocument();

    // Vérifier que la fonction onSubmit n'a pas été appelée
    expect(onSubmitMock).not.toHaveBeenCalled();

    // Vérifier que toast.error a été appelé
    expect(toast.error).toHaveBeenCalledWith(
      "Veuillez corriger les erreurs dans le formulaire."
    );
  });

  it("valide les champs email et téléphone correctement", async () => {
    render(<EmployeeForm />);

    // Email invalide
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: "email-invalide" } });
    fireEvent.blur(emailInput);

    // Téléphone invalide
    const phoneInput = screen.getByLabelText(/Téléphone/i);
    fireEvent.change(phoneInput, { target: { value: "123" } });
    fireEvent.blur(phoneInput);

    // Vérifier que les erreurs de validation sont affichées
    await waitFor(() => {
      expect(screen.getByText(/Format d'email invalide/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Format de téléphone invalide/i)
    ).toBeInTheDocument();

    // Corriger les valeurs
    fireEvent.change(emailInput, { target: { value: "email@valide.com" } });
    fireEvent.blur(emailInput);

    fireEvent.change(phoneInput, { target: { value: "0612345678" } });
    fireEvent.blur(phoneInput);

    // Vérifier que les erreurs ont disparu
    await waitFor(() => {
      expect(
        screen.queryByText(/Format d'email invalide/i)
      ).not.toBeInTheDocument();
    });

    expect(
      screen.queryByText(/Format de téléphone invalide/i)
    ).not.toBeInTheDocument();
  });

  it("soumet le formulaire avec les données valides", async () => {
    const onSubmitMock = jest.fn();

    render(<EmployeeForm onSubmit={onSubmitMock} />);

    // Remplir les champs obligatoires
    const firstNameInput = screen.getByLabelText(/Prénom/i);
    const lastNameInput = screen.getByLabelText(/Nom/i);
    const hireDateInput = screen.getByLabelText(/Date d'embauche/i);

    fireEvent.change(firstNameInput, { target: { value: "Jean" } });
    fireEvent.change(lastNameInput, { target: { value: "Dupont" } });
    fireEvent.change(hireDateInput, { target: { value: "2023-01-01" } });

    // Soumettre le formulaire
    const submitButton = screen.getByRole("button", { name: /Ajouter/i });
    fireEvent.click(submitButton);

    // Vérifier que onSubmit a été appelé avec les données correctes
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: "Jean",
        last_name: "Dupont",
        hire_date: "2023-01-01",
      })
    );
  });

  it("affiche les confirmations pour supprimer et modifier", async () => {
    const onDeleteMock = jest.fn();

    // Rendre le formulaire avec un employé existant pour avoir le bouton supprimer
    render(
      <EmployeeForm
        employee={mockEmployees[0]}
        onDelete={onDeleteMock}
        onSubmit={jest.fn()}
      />
    );

    // Cliquer sur le bouton supprimer
    const deleteButton = screen.getByRole("button", { name: /Supprimer/i });
    fireEvent.click(deleteButton);

    // Vérifier que la modale de confirmation s'affiche
    await waitFor(() => {
      expect(screen.getByText(/Confirmer la suppression/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Cette action est irréversible/i)
    ).toBeInTheDocument();

    // Confirmer la suppression
    const confirmButton = screen.getByRole("button", { name: /^Supprimer$/i });
    fireEvent.click(confirmButton);

    // Vérifier que onDelete a été appelé
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
  });
});
