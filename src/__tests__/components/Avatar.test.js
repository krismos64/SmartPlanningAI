import { render, screen } from "@testing-library/react";
import { mockEmployees, mockUsers } from "../mocks/mockData";

// Mock du composant Avatar
const Avatar = ({ user, size = "md", showStatus = false, onClick }) => {
  // Extraction du nom et des initiales
  const fullName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.name || "Utilisateur";

  const initials = fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  // Définition des tailles
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-base",
    xl: "h-24 w-24 text-lg",
  };

  // Définition des couleurs de statut
  const statusColors = {
    online: "bg-green-500",
    busy: "bg-red-500",
    away: "bg-yellow-500",
    offline: "bg-gray-500",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${sizes[size]} rounded-full bg-blue-100 text-blue-800`}
      data-testid="avatar"
      onClick={onClick}
    >
      {user.image ? (
        <img
          src={user.image}
          alt={fullName}
          className="h-full w-full rounded-full object-cover"
          data-testid="avatar-image"
        />
      ) : (
        <span data-testid="avatar-initials">{initials}</span>
      )}

      {showStatus && user.status && (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
            statusColors[user.status]
          }`}
          data-testid="avatar-status"
          title={user.status}
        />
      )}
    </div>
  );
};

describe("Avatar Component", () => {
  it("affiche les initiales quand aucune image n'est fournie", () => {
    const user = {
      first_name: "Jean",
      last_name: "Dupont",
    };

    render(<Avatar user={user} />);

    const initialsElement = screen.getByTestId("avatar-initials");
    expect(initialsElement).toBeInTheDocument();
    expect(initialsElement).toHaveTextContent("JD");
  });

  it("affiche l'image quand une URL d'image est fournie", () => {
    const user = {
      first_name: "Marie",
      last_name: "Martin",
      image: "https://example.com/avatar.jpg",
    };

    render(<Avatar user={user} />);

    const imageElement = screen.getByTestId("avatar-image");
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute(
      "src",
      "https://example.com/avatar.jpg"
    );
    expect(imageElement).toHaveAttribute("alt", "Marie Martin");
  });

  it("applique différentes tailles en fonction de la prop 'size'", () => {
    const user = { first_name: "Jean", last_name: "Dupont" };

    const { rerender } = render(<Avatar user={user} size="sm" />);
    let avatarElement = screen.getByTestId("avatar");
    expect(avatarElement).toHaveClass("h-8 w-8");

    rerender(<Avatar user={user} size="lg" />);
    avatarElement = screen.getByTestId("avatar");
    expect(avatarElement).toHaveClass("h-16 w-16");
  });

  it("affiche l'indicateur de statut quand showStatus est true", () => {
    const user = {
      first_name: "Jean",
      last_name: "Dupont",
      status: "online",
    };

    const { rerender } = render(<Avatar user={user} showStatus={true} />);

    const statusElement = screen.getByTestId("avatar-status");
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveClass("bg-green-500");

    // Tester avec un statut différent
    user.status = "busy";
    rerender(<Avatar user={user} showStatus={true} />);
    expect(statusElement).toHaveClass("bg-red-500");
  });

  it("n'affiche pas l'indicateur de statut quand showStatus est false", () => {
    const user = {
      first_name: "Jean",
      last_name: "Dupont",
      status: "online",
    };

    render(<Avatar user={user} showStatus={false} />);

    const statusElement = screen.queryByTestId("avatar-status");
    expect(statusElement).not.toBeInTheDocument();
  });

  it("fonctionne avec les données mockées d'employés", () => {
    render(<Avatar user={mockEmployees[0]} />);

    const initialsElement = screen.getByTestId("avatar-initials");
    expect(initialsElement).toHaveTextContent(
      `${mockEmployees[0].first_name[0]}${mockEmployees[0].last_name[0]}`
    );
  });

  it("fonctionne avec les données mockées d'utilisateurs", () => {
    const adminUser = mockUsers.admin;
    adminUser.status = "online"; // Ajouter un statut pour le test

    render(<Avatar user={adminUser} showStatus={true} />);

    const initialsElement = screen.getByTestId("avatar-initials");
    expect(initialsElement).toHaveTextContent(
      `${adminUser.first_name[0]}${adminUser.last_name[0]}`
    );

    const statusElement = screen.getByTestId("avatar-status");
    expect(statusElement).toBeInTheDocument();
  });

  it("gère correctement le cas d'un utilisateur sans nom", () => {
    const user = {};

    render(<Avatar user={user} />);

    const initialsElement = screen.getByTestId("avatar-initials");
    expect(initialsElement).toHaveTextContent("U");
  });

  it("gère correctement le cas d'un utilisateur avec juste un nom d'utilisateur", () => {
    const user = {
      name: "utilisateur123",
    };

    render(<Avatar user={user} />);

    const initialsElement = screen.getByTestId("avatar-initials");
    expect(initialsElement).toHaveTextContent("U");
  });
});
