import { useState, useEffect } from "react";
import styled from "styled-components";
import DataTable from "../components/ui/DataTable";

// Composants stylisés
const PageContainer = styled.div`
  padding: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 1rem;

  @media (min-width: 768px) {
    justify-content: flex-end;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const PageDescription = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0.5rem 0 0 0;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ primary, theme }) =>
    primary
      ? `
    background-color: ${theme.colors.primary};
    color: white;
    border: 1px solid ${theme.colors.primary};
    
    &:hover {
      background-color: ${theme.colors.primary}dd;
    }
  `
      : `
    background-color: transparent;
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border};
    
    &:hover {
      background-color: ${theme.colors.background};
      border-color: ${theme.colors.text.secondary};
    }
  `}
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.text.secondary};
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ theme, active }) => (active ? theme.colors.primary : "transparent")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme, active }) =>
      active ? theme.colors.primary : theme.colors.text.primary};
  }
`;

const TabBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background-color: ${({ theme, active }) =>
    active ? theme.colors.primary : `${theme.colors.text.disabled}33`};
  color: ${({ theme, active }) =>
    active ? "white" : theme.colors.text.secondary};
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  margin-left: 0.5rem;
`;

// Icônes
const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 5V19M5 12H19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ExportIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 10V16M12 16L9 13M12 16L15 13M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Données fictives pour les employés
const generateEmployees = (count) => {
  const departments = ["Marketing", "Développement", "Design", "Finance", "RH"];
  const roles = ["Manager", "Senior", "Junior", "Stagiaire", "Directeur"];
  const statuses = ["active", "inactive", "pending"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Employé ${i + 1}`,
    email: `employe${i + 1}@example.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    joinDate: new Date(
      2020 + Math.floor(Math.random() * 3),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    ).toISOString(),
  }));
};

// Composant principal
const EmployeeList = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  // Simuler le chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmployees(generateEmployees(50));
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filtrer les employés en fonction de l'onglet actif
  const filteredEmployees = employees.filter((employee) => {
    if (activeTab === "all") return true;
    return employee.status === activeTab;
  });

  // Définir les colonnes pour le tableau
  const columns = [
    {
      id: "name",
      header: "Nom",
      accessor: (employee) => employee.name,
      sortable: true,
    },
    {
      id: "email",
      header: "Email",
      accessor: (employee) => employee.email,
      sortable: true,
    },
    {
      id: "department",
      header: "Département",
      accessor: (employee) => employee.department,
      sortable: true,
    },
    {
      id: "role",
      header: "Rôle",
      accessor: (employee) => employee.role,
      sortable: true,
    },
    {
      id: "status",
      header: "Statut",
      accessor: (employee) => employee.status,
      sortable: true,
      type: "status",
    },
    {
      id: "joinDate",
      header: "Date d'embauche",
      accessor: (employee) => employee.joinDate,
      sortable: true,
      type: "date",
    },
  ];

  // Gérer le clic sur une ligne
  const handleRowClick = (employee) => {
    console.log("Employé sélectionné:", employee);
    // Ici, vous pourriez naviguer vers une page de détails ou afficher un modal
  };

  // Compter les employés par statut
  const countByStatus = {
    all: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    pending: employees.filter((e) => e.status === "pending").length,
    inactive: employees.filter((e) => e.status === "inactive").length,
  };

  return (
    <PageContainer>
      <PageHeader>
        <HeaderLeft>
          <PageTitle>Employés</PageTitle>
          <PageDescription>
            Gérez les employés de votre entreprise
          </PageDescription>
        </HeaderLeft>
        <HeaderRight>
          <Button>
            <ExportIcon />
            Exporter
          </Button>
          <Button primary>
            <PlusIcon />
            Ajouter un employé
          </Button>
        </HeaderRight>
      </PageHeader>

      <TabsContainer>
        <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>
          Tous
          <TabBadge active={activeTab === "all"}>{countByStatus.all}</TabBadge>
        </Tab>
        <Tab
          active={activeTab === "active"}
          onClick={() => setActiveTab("active")}
        >
          Actifs
          <TabBadge active={activeTab === "active"}>
            {countByStatus.active}
          </TabBadge>
        </Tab>
        <Tab
          active={activeTab === "pending"}
          onClick={() => setActiveTab("pending")}
        >
          En attente
          <TabBadge active={activeTab === "pending"}>
            {countByStatus.pending}
          </TabBadge>
        </Tab>
        <Tab
          active={activeTab === "inactive"}
          onClick={() => setActiveTab("inactive")}
        >
          Inactifs
          <TabBadge active={activeTab === "inactive"}>
            {countByStatus.inactive}
          </TabBadge>
        </Tab>
      </TabsContainer>

      <DataTable
        title={`Liste des employés (${filteredEmployees.length})`}
        data={filteredEmployees}
        columns={columns}
        loading={loading}
        pagination={true}
        pageSize={10}
        onRowClick={handleRowClick}
        emptyStateTitle="Aucun employé trouvé"
        emptyStateMessage="Il n'y a pas d'employés correspondant à vos critères de recherche."
      />
    </PageContainer>
  );
};

export default EmployeeList;
