import { Outlet } from "react-router-dom";
import styled from "styled-components";
import Footer from "../components/layout/Footer";

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const PublicLayout = () => {
  return (
    <LayoutContainer>
      <MainContent>
        <Outlet />
      </MainContent>
      <Footer />
    </LayoutContainer>
  );
};

export default PublicLayout;
