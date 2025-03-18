import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  width: 100%;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const PublicLayout = () => {
  // Nettoyer les styles précédents et réinitialiser le viewport
  useEffect(() => {
    // Reset scroll et styles
    window.scrollTo(0, 0);
    document.body.style.removeProperty("width");
    document.body.style.removeProperty("margin");
    document.body.style.removeProperty("padding");
    document.body.style.removeProperty("overflow");

    // Forcer un reflow
    // eslint-disable-next-line no-unused-vars
    const forceReflow = document.body.offsetHeight;
  }, []);

  return (
    <LayoutContainer>
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default PublicLayout;
