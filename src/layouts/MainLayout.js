import { Outlet } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/layout/Navbar";
import { NavLink } from "react-router-dom";

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  margin-top: 64px; // Hauteur de la navbar

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const MainLayout = () => {
  const user = { role: "admin" }; // Replace with actual user data

  return (
    <LayoutContainer>
      <Navbar />
      <MainContent>
        <Outlet />
        {user && user.role === "admin" && (
          <li>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center px-4 py-2 text-white bg-blue-600 rounded-md"
                  : "flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Gestion des utilisateurs
            </NavLink>
          </li>
        )}
      </MainContent>
    </LayoutContainer>
  );
};

export default MainLayout;
