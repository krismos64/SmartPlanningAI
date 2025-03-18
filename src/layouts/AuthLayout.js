import { Navigate, Outlet } from "react-router-dom";
import styled from "styled-components";
import Footer from "../components/layout/Footer";
import { useAuth } from "../contexts/AuthContext";

const AuthLayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
`;

const AuthContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
`;

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <AuthLayoutContainer>
        <AuthContainer>
          <div>Chargement...</div>
        </AuthContainer>
        <Footer />
      </AuthLayoutContainer>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayoutContainer>
      <AuthContainer>
        <Outlet />
      </AuthContainer>
      <Footer />
    </AuthLayoutContainer>
  );
};

export default AuthLayout;
