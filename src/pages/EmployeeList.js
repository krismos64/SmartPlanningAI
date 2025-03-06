import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import styled from "styled-components";
import DataTable from "../components/ui/DataTable";
import useEmployees from "../hooks/useEmployees";

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
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const TabBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.375rem;
  margin-left: 0.5rem;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme, active }) =>
    active ? "white" : theme.colors.text.secondary};
  background-color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.background};
  border-radius: 1rem;
  transition: all 0.2s ease;
`;

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 3.33334V12.6667"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.33334 8H12.6667"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ExportIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.6667 11.3333L14 8.00001L10.6667 4.66667"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 8H6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Composant principal
const EmployeeList = () => {
  const { employees, loading, error, fetchEmployees } = useEmployees();
  const [activeTab, setActiveTab] = useState("all");

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
      accessor: (employee) => `${employee.first_name} ${employee.last_name}`,
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
      accessor: (employee) => employee.department || "-",
      sortable: true,
    },
    {
      id: "role",
      header: "Rôle",
      accessor: (employee) => employee.role || "-",
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
      id: "hire_date",
      header: "Date d'embauche",
      accessor: (employee) => {
        if (!employee.hire_date) return "-";
        try {
          return format(new Date(employee.hire_date), "dd MMMM yyyy", {
            locale: fr,
          });
        } catch (e) {
          return employee.hire_date;
        }
      },
      sortable: true,
      type: "date",
    },
    {
      id: "contractHours",
      header: "Heures contractuelles",
      accessor: (employee) => employee.contractHours || "-",
      sortable: true,
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
    inactive: employees.filter((e) => e.status === "inactive").length,
    vacation: employees.filter((e) => e.status === "vacation").length,
    sick: employees.filter((e) => e.status === "sick").length,
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
          <Button onClick={() => fetchEmployees()}>
            <ExportIcon />
            Rafraîchir
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
          active={activeTab === "vacation"}
          onClick={() => setActiveTab("vacation")}
        >
          En congés
          <TabBadge active={activeTab === "vacation"}>
            {countByStatus.vacation}
          </TabBadge>
        </Tab>
        <Tab active={activeTab === "sick"} onClick={() => setActiveTab("sick")}>
          Malades
          <TabBadge active={activeTab === "sick"}>
            {countByStatus.sick}
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
        emptyStateMessage={
          error ||
          "Il n'y a pas d'employés correspondant à vos critères de recherche."
        }
      />
    </PageContainer>
  );
};

export default EmployeeList;
