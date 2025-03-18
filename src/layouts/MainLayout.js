import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import styled from "styled-components";
import Sidebar from "../components/layout/Sidebar";

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.background};
  width: 100%;
  margin-top: 64px; /* Ajouter un décalage pour la navbar */
`;

const SidebarWrapper = styled.div`
  flex: 0 0 260px;
  height: calc(100vh - 64px); /* Hauteur de la page moins la navbar */
  position: fixed;
  top: 64px; /* Position sous la navbar */
  left: 0;
  z-index: 10;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  width: calc(100% - 260px);
  margin-left: 260px; /* Décalage pour la sidebar */

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
    margin-left: 0;
  }
`;

const MainContent = styled.main`
  padding: ${({ theme }) => theme.spacing.xl};
  width: 100%;
  min-height: 100vh;
  animation: fadeIn 0.3s ease-in-out;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  @keyframes fadeIn {
    from {
      opacity: 0.8;
    }
    to {
      opacity: 1;
    }
  }
`;

const MainLayout = () => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  // Reset le viewport et force un recalcul
  useEffect(() => {
    const timer = setTimeout(() => {
      // Force le reflow
      document.documentElement.style.overflow = "hidden auto";
      document.body.style.overflow = "hidden auto";
      document.body.style.width = "100%";

      // Force un recalcul
      // eslint-disable-next-line no-unused-vars
      const forceReflow = document.body.offsetHeight;

      setMounted(true);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
    };
  }, [location.pathname]);

  return (
    <LayoutContainer>
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
      <ContentWrapper>
        <MainContent>
          <Outlet />
        </MainContent>
      </ContentWrapper>
    </LayoutContainer>
  );
};

export default MainLayout;
