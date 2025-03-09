import Lottie from "lottie-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import employeesAnimation from "../assets/animations/employees.json";
import EmployeeForm from "../components/employees/EmployeeForm";
import HourBalanceManager from "../components/employees/HourBalanceManager";
import { Button, DataTable, Modal, PlusIcon } from "../components/ui";
import { FormSelect } from "../components/ui/Form";
import { useNotification } from "../components/ui/Notification";
import { EMPLOYEE_STATUSES, EMPLOYEE_TABLE_COLUMNS } from "../config/constants";
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
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const AnimationContainer = styled.div`
  width: 80px;
  height: 80px;
  flex-shrink: 0;
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

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  text-align: center;
  margin-top: 2rem;
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const EmptyStateDescription = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 500px;
  margin-bottom: 2rem;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const TabsModalContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 1rem;
`;

const TabModal = styled.button`
  padding: 0.75rem 1.25rem;
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

// Composant principal
const Employees = () => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [filters, setFilters] = useState({
    department: "",
    role: "",
    status: "",
  });
  const [activeModalTab, setActiveModalTab] = useState("infos");

  const {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    fetchEmployees,
    getEmployeesByStatus,
  } = useEmployees();

  const navigate = useNavigate();

  // Filtrer les employés avec useMemo pour éviter les recalculs inutiles
  const filteredEmployees = useMemo(() => {
    let employeesToFilter = employees;

    // Filtrer par statut si nécessaire
    if (activeTab !== "all") {
      employeesToFilter = getEmployeesByStatus(activeTab);
    }

    // Appliquer les autres filtres
    return employeesToFilter.filter((employee) => {
      if (filters.department && employee.department !== filters.department)
        return false;
      if (filters.role && employee.role !== filters.role) return false;
      if (filters.status && employee.status !== filters.status) return false;
      return true;
    });
  }, [employees, activeTab, filters, getEmployeesByStatus]);

  // Récupérer les départements et rôles uniques des employés
  const uniqueDepartments = useMemo(() => {
    const departments = employees
      .map((emp) => emp.department)
      .filter((dept, index, self) => dept && self.indexOf(dept) === index);
    return departments;
  }, [employees]);

  const uniqueRoles = useMemo(() => {
    const roles = employees
      .map((emp) => emp.role)
      .filter((role, index, self) => role && self.indexOf(role) === index);
    return roles;
  }, [employees]);

  const handleUpdateEmployee = useCallback(
    async (employeeData) => {
      try {
        if (!editingEmployee?.id) {
          throw new Error("Aucun employé sélectionné pour la mise à jour");
        }

        setIsLoading(true);
        console.log("ID de l'employé à mettre à jour:", editingEmployee.id);
        console.log("Données à envoyer:", employeeData);

        // Pas besoin de convertir les valeurs numériques ici, c'est fait dans le hook
        const result = await updateEmployee(editingEmployee.id, employeeData);

        console.log("Résultat de la mise à jour:", result);

        if (!result || !result.success) {
          throw new Error(result?.error || "La mise à jour a échoué");
        }

        // Rafraîchir la liste des employés
        await fetchEmployees();

        showNotification({
          type: "success",
          message: `Mise à jour des informations de l'employé ${employeeData.first_name} ${employeeData.last_name}`,
        });

        // Fermer le modal et réinitialiser l'état
        setShowModal(false);
        // Réinitialiser editingEmployee après la fermeture du modal
        setTimeout(() => setEditingEmployee(null), 0);
      } catch (error) {
        console.error("Erreur détaillée:", error);
        showNotification({
          type: "error",
          message:
            error.message || "Erreur lors de la mise à jour de l'employé",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [editingEmployee, updateEmployee, fetchEmployees, showNotification]
  );

  const handleCreateEmployee = useCallback(
    async (employeeData) => {
      try {
        setIsLoading(true);

        console.log("Données pour création d'employé:", employeeData);

        // Pas besoin de convertir les valeurs numériques ici, c'est fait dans le hook
        const result = await createEmployee(employeeData);

        console.log("Résultat de la création:", result);

        if (!result || !result.success) {
          throw new Error(result?.error || "La création a échoué");
        }

        // Rafraîchir la liste des employés
        await fetchEmployees();

        showNotification({
          type: "success",
          message: `Création d'un nouvel employé: ${employeeData.first_name} ${employeeData.last_name}`,
        });

        // Fermer le modal et rediriger vers la page des employés
        setShowModal(false);

        // Rediriger vers la page des employés
        navigate("/employees");
      } catch (error) {
        console.error("Erreur détaillée:", error);
        showNotification({
          type: "error",
          message: error.message || "Erreur lors de la création de l'employé",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [createEmployee, fetchEmployees, showNotification, navigate]
  );

  const handleDeleteEmployee = useCallback(async () => {
    try {
      if (!editingEmployee?.id) {
        throw new Error("Aucun employé sélectionné pour la suppression");
      }

      setIsLoading(true);

      console.log("Tentative de suppression de l'employé:", editingEmployee.id);

      const result = await deleteEmployee(editingEmployee.id);

      console.log("Résultat de la suppression:", result);

      if (!result || !result.success) {
        throw new Error(result?.error || "La suppression a échoué");
      }

      // Rafraîchir la liste des employés
      await fetchEmployees();

      showNotification({
        type: "success",
        message: `Suppression de l'employé ${editingEmployee.first_name} ${editingEmployee.last_name}`,
      });

      setEditingEmployee(null);
      setShowModal(false);
    } catch (error) {
      console.error("Erreur détaillée:", error);
      showNotification({
        type: "error",
        message: error.message || "Erreur lors de la suppression de l'employé",
      });
    } finally {
      setIsLoading(false);
    }
  }, [editingEmployee, deleteEmployee, fetchEmployees, showNotification]);

  const handleAddEmployee = useCallback(() => {
    setEditingEmployee(null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleSubmit = useCallback(
    async (formData) => {
      try {
        if (editingEmployee) {
          await handleUpdateEmployee(formData);
        } else {
          await handleCreateEmployee(formData);
        }
      } catch (error) {
        console.error("Erreur lors de la soumission:", error);
      }
    },
    [editingEmployee, handleUpdateEmployee, handleCreateEmployee]
  );

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

  const handleEditEmployee = useCallback((employee) => {
    if (employee && employee.id) {
      console.log("Sélection de l'employé pour édition:", employee);
      setEditingEmployee(employee);
      setShowModal(true);
    } else {
      console.error("Employé invalide sélectionné:", employee);
    }
  }, []);

  return (
    <PageContainer>
      <PageHeader>
        <HeaderLeft>
          <AnimationContainer>
            <Lottie
              animationData={employeesAnimation}
              loop={true}
              autoplay={true}
              style={{ width: 80, height: 80 }}
              rendererSettings={{
                preserveAspectRatio: "xMidYMid slice",
              }}
            />
          </AnimationContainer>
          <div>
            <PageTitle>Gestion des employés</PageTitle>
            <PageDescription>
              Gérez les informations de vos employés
            </PageDescription>
          </div>
        </HeaderLeft>
        <HeaderRight>
          <Button variant="primary" onClick={handleAddEmployee}>
            <PlusIcon /> Ajouter un employé
          </Button>
        </HeaderRight>
      </PageHeader>

      {error ? (
        <EmptyStateContainer>
          <EmptyStateIcon>⚠️</EmptyStateIcon>
          <EmptyStateTitle>Erreur d'authentification</EmptyStateTitle>
          <EmptyStateDescription>
            {error}. Veuillez vous connecter pour accéder à cette page.
          </EmptyStateDescription>
          <Button primary as="a" href="/login">
            Se connecter
          </Button>
        </EmptyStateContainer>
      ) : employees.length === 0 && !loading ? (
        <EmptyStateContainer>
          <EmptyStateIcon>👥</EmptyStateIcon>
          <EmptyStateTitle>Aucun employé</EmptyStateTitle>
          <EmptyStateDescription>
            Vous n'avez pas encore ajouté d'employés à votre entreprise.
            Commencez par ajouter votre premier employé.
          </EmptyStateDescription>
          <Button primary onClick={handleAddEmployee}>
            <PlusIcon />
            Ajouter un employé
          </Button>
        </EmptyStateContainer>
      ) : (
        <>
          <TabsContainer>
            <Tab
              active={activeTab === "all"}
              onClick={() => handleTabChange("all")}
            >
              Tous
              <TabBadge active={activeTab === "all"}>
                {countByStatus.all}
              </TabBadge>
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
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
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
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
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
            onRowClick={handleEditEmployee}
            emptyStateTitle="Aucun employé trouvé"
            emptyStateMessage="Aucun employé ne correspond à vos critères de recherche."
          />
        </>
      )}

      <Modal
        isOpen={showModal}
        title={
          editingEmployee
            ? `Modifier un employé (${editingEmployee.first_name} ${editingEmployee.last_name})`
            : "Ajouter un employé"
        }
        onClose={handleCloseModal}
        size={editingEmployee ? "large" : "medium"}
      >
        {editingEmployee ? (
          <>
            <TabsModalContainer>
              <TabModal
                active={activeModalTab === "infos"}
                onClick={() => setActiveModalTab("infos")}
              >
                Informations
              </TabModal>
              <TabModal
                active={activeModalTab === "balance"}
                onClick={() => setActiveModalTab("balance")}
              >
                Solde d'heures
              </TabModal>
            </TabsModalContainer>

            <ModalContent>
              {activeModalTab === "infos" ? (
                <EmployeeForm
                  key={editingEmployee.id}
                  employee={editingEmployee}
                  onSubmit={handleSubmit}
                  onDelete={handleDeleteEmployee}
                />
              ) : (
                <HourBalanceManager
                  employeeId={editingEmployee.id}
                  onBalanceUpdated={fetchEmployees}
                />
              )}
            </ModalContent>
          </>
        ) : (
          <EmployeeForm key="new" employee={null} onSubmit={handleSubmit} />
        )}
      </Modal>
    </PageContainer>
  );
};

export default Employees;
