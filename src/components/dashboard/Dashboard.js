import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import styled from "styled-components";
import useAuth from "../../hooks/useAuth";
import useEmployees from "../../hooks/useEmployees";
import SearchBar from "../ui/SearchBar";
import DashboardCharts from "./DashboardCharts";
import DashboardHeader from "./DashboardHeader";
import DashboardStats from "./DashboardStats";
import RecentActivities from "./RecentActivities";

// Composants stylisés
const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const DashboardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
`;

const SearchContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const { employees, searchEmployees } = useEmployees();
  const [searchResults, setSearchResults] = useState([]);

  // Fonction de recherche
  const handleSearch = (query, filters) => {
    const results = searchEmployees(query, filters);
    setSearchResults(results);
  };

  // Réinitialiser les résultats de recherche lorsque la page est chargée
  useEffect(() => {
    setSearchResults([]);
  }, []);

  return (
    <>
      <Helmet>
        <title>Tableau de bord | SmartPlanning</title>
      </Helmet>
      <DashboardContainer>
        <DashboardHeader
          title="Tableau de bord"
          subtitle={`Bienvenue, ${user?.first_name || "Utilisateur"}`}
        />

        <SearchContainer>
          <SearchBar
            placeholder="Rechercher un employé..."
            onSearch={handleSearch}
            searchResults={searchResults}
            filters={[
              { id: "department", label: "Département" },
              { id: "position", label: "Poste" },
              { id: "status", label: "Statut" },
            ]}
          />
        </SearchContainer>

        <DashboardContent>
          <DashboardStats />
          <DashboardCharts />
          <RecentActivities />
        </DashboardContent>
      </DashboardContainer>
    </>
  );
};

export default Dashboard;
