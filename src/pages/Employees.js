import { useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import {
  DataTable,
  Button,
  Modal,
  PlusIcon,
  ExportIcon,
} from "../components/ui";
import EmployeeForm from "../components/employees/EmployeeForm";
import { useEmployees } from "../hooks/useEmployees";
import { FormSelect } from "../components/ui/Form";
import {
  EMPLOYEE_TABLE_COLUMNS,
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUSES,
} from "../config/constants";

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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

// Composant principal
const Employees = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [filters, setFilters] = useState({
    department: "",
    role: "",
    status: "",
  });

  const {
    loading,
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeesByStatus,
  } = useEmployees();

  // Filtrer les employés avec useMemo pour éviter les recalculs inutiles
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      if (activeTab !== "all" && employee.status !== activeTab) return false;
      if (filters.department && employee.department !== filters.department)
        return false;
      if (filters.role && employee.role !== filters.role) return false;
      if (filters.status && employee.status !== filters.status) return false;
      return true;
    });
  }, [employees, activeTab, filters]);

  const handleSubmit = useCallback(
    async (data) => {
      const success = editingEmployee
        ? await updateEmployee(editingEmployee.id, data)
        : await addEmployee(data);

      if (success) {
        setShowModal(false);
        setEditingEmployee(null);
      }
    },
    [editingEmployee, updateEmployee, addEmployee]
  );

  const handleDelete = useCallback(async () => {
    const success = await deleteEmployee(editingEmployee.id);
    if (success) {
      setShowModal(false);
      setEditingEmployee(null);
    }
  }, [deleteEmployee, editingEmployee]);

  const handleAddEmployee = useCallback(() => {
    setEditingEmployee(null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingEmployee(null);
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const countByStatus = getEmployeesByStatus();

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
          <Button onClick={() => window.print()}>
            <ExportIcon />
            Exporter
          </Button>
          <Button primary onClick={handleAddEmployee}>
            <PlusIcon />
            Ajouter un employé
          </Button>
        </HeaderRight>
      </PageHeader>

      <TabsContainer>
        <Tab
          active={activeTab === "all"}
          onClick={() => handleTabChange("all")}
        >
          Tous
          <TabBadge active={activeTab === "all"}>{countByStatus.all}</TabBadge>
        </Tab>
        <Tab
          active={activeTab === "active"}
          onClick={() => handleTabChange("active")}
        >
          Actifs
          <TabBadge active={activeTab === "active"}>
            {countByStatus.active}
          </TabBadge>
        </Tab>
        <Tab
          active={activeTab === "pending"}
          onClick={() => handleTabChange("pending")}
        >
          En attente
          <TabBadge active={activeTab === "pending"}>
            {countByStatus.pending}
          </TabBadge>
        </Tab>
        <Tab
          active={activeTab === "inactive"}
          onClick={() => handleTabChange("inactive")}
        >
          Inactifs
          <TabBadge active={activeTab === "inactive"}>
            {countByStatus.inactive}
          </TabBadge>
        </Tab>
      </TabsContainer>

      <FormGrid>
        <FormSelect
          label="Département"
          name="department"
          value={filters.department}
          onChange={handleFilterChange}
        >
          <option value="">Tous les départements</option>
          {EMPLOYEE_DEPARTMENTS.map((dept) => (
            <option key={dept.value} value={dept.value}>
              {dept.label}
            </option>
          ))}
        </FormSelect>
          <FormSelect
          label="Rôle"
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
        >
          <option value="">Tous les rôles</option>
          {EMPLOYEE_ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </FormSelect>
          <FormSelect
          label="Statut"
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">Tous les statuts</option>
          {EMPLOYEE_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </FormSelect>
      </FormGrid>

      <DataTable
        title={`Liste des employés (${filteredEmployees.length})`}
          data={filteredEmployees}
        columns={EMPLOYEE_TABLE_COLUMNS}
        loading={loading}
          pagination={true}
        pageSize={10}
        onRowClick={(employee) => {
          setEditingEmployee(employee);
          setShowModal(true);
        }}
          emptyStateTitle="Aucun employé trouvé"
          emptyStateMessage="Aucun employé ne correspond à vos critères de recherche."
        />

      {showModal && (
        <Modal
          title={editingEmployee ? "Modifier un employé" : "Ajouter un employé"}
          onClose={handleCloseModal}
        >
          <EmployeeForm
            employee={editingEmployee}
            onSubmit={handleSubmit}
            onDelete={editingEmployee ? handleDelete : undefined}
          />
        </Modal>
      )}
    </PageContainer>
  );
};

export default Employees;
