import { alpha, Box } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiUsers } from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import EmployeeCard from "../components/employees/EmployeeCard";
import EmployeeExport from "../components/employees/EmployeeExport";
import EmployeeForm from "../components/employees/EmployeeForm";
import HourBalanceManager from "../components/employees/HourBalanceManager";
import { useTheme as useThemeProvider } from "../components/ThemeProvider";
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

// Icône stylisée pour les employés
const StyledIcon = styled(Box)(({ theme }) => {
  const { theme: themeMode } = useThemeProvider();
  const isDarkMode = themeMode === "dark";

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: isDarkMode
      ? `linear-gradient(135deg, ${alpha("#10B981", 0.2)}, ${alpha(
          "#34D399",
          0.4
        )})`
      : `linear-gradient(135deg, ${alpha("#10B981", 0.1)}, ${alpha(
          "#34D399",
          0.3
        )})`,
    boxShadow: isDarkMode
      ? `0 4px 20px ${alpha("#000", 0.25)}`
      : `0 4px 15px ${alpha("#000", 0.08)}`,
    color: isDarkMode ? "#A7F3D0" : "#059669",
    flexShrink: 0,
    transition: "all 0.3s ease",
    "& .MuiSvgIcon-root": {
      fontSize: 40,
    },
    "& svg": {
      fontSize: 40,
    },
  };
});

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

// Composant principal
const Employees = () => {
  const { showNotification } = useNotification();
  const [, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
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
  const { employeeId } = useParams();
  const location = useLocation();

  // S'assurer que le modal ne s'ouvre pas automatiquement lors de la navigation simple
  useEffect(() => {
    // Si nous venons juste d'arriver sur la page via une navigation normale, fermer le modal
    if (location.pathname === "/employees" && !employeeId) {
      setShowModal(false);
      setEditingEmployee(null);
      setViewingEmployee(null);
    }
  }, [location.pathname, employeeId]);

  // Vérifier si un ID d'employé est présent dans l'URL et afficher les détails
  useEffect(() => {
    if (employeeId && employees.length > 0) {
      const employee = employees.find((emp) => emp.id === parseInt(employeeId));
      if (employee) {
        setViewingEmployee(employee);
        setEditingEmployee(employee);
        setShowModal(true);
      } else {
        // Si l'employé n'existe pas, rediriger vers la liste des employés
        navigate("/employees");
        showNotification({
          type: "error",
          message: `L'employé avec l'ID ${employeeId} n'existe pas.`,
        });
      }
    }
  }, [employeeId, employees, navigate, showNotification]);

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

  const handleAddEmployee = useCallback((event) => {
    console.log("Clic sur Ajouter un employé", event);

    // Forcer l'ouverture du modal quoi qu'il arrive
    setEditingEmployee(null);
    setViewingEmployee(null);
    setShowEditForm(false);
    setActiveModalTab("infos");
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingEmployee(null);
    setViewingEmployee(null);
    setShowEditForm(false);

    // Nettoyer l'URL si nécessaire
    if (employeeId) {
      navigate("/employees", { replace: true });
    }
  }, [employeeId, navigate]);

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
    console.log("Sélection de l'employé pour édition:", employee);
    setEditingEmployee(employee);
    setViewingEmployee(employee);
    setShowEditForm(false);
    setShowModal(true);
  }, []);

  const handleStartEditing = useCallback(() => {
    setShowEditForm(true);
  }, []);

  // Nouvelle fonction pour gérer le clic sur une cellule spécifique du tableau
  const handleCellClick = useCallback((employee, columnId) => {
    // Cette fonction ne sera appelée que pour la colonne hour_balance grâce à la modification dans DataTable
    if (columnId === "hour_balance") {
      console.log("Clic sur le solde d'heures de l'employé:", employee.id);
      setEditingEmployee(employee);
      setViewingEmployee(employee);
      setActiveModalTab("balance");
      setShowModal(true);
    }
  }, []);

  return (
    <PageContainer>
      <PageHeader>
        <HeaderLeft>
          <StyledIcon>
            <FiUsers />
          </StyledIcon>
          <div>
            <PageTitle>Gestion des employés</PageTitle>
            <PageDescription>
              Gérez les informations de vos employés
            </PageDescription>
          </div>
        </HeaderLeft>
        <HeaderRight>
          <EmployeeExport
            employees={employees}
            filteredEmployees={filteredEmployees}
          />
          <Button
            onClick={() => {
              setEditingEmployee(null);
              setShowEditForm(true);
              setActiveModalTab("infos");
              setShowModal(true);
            }}
            startIcon={<PlusIcon />}
          >
            Ajouter un employé
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
            onCellClick={handleCellClick}
            emptyStateTitle="Aucun employé trouvé"
            emptyStateMessage="Aucun employé ne correspond à vos critères de recherche."
          />
        </>
      )}

      {/* Modal d'ajout ou d'édition d'employé */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={
          !editingEmployee
            ? "Ajouter un employé"
            : showEditForm
            ? `Modifier ${editingEmployee.first_name} ${editingEmployee.last_name}`
            : activeModalTab === "balance"
            ? `Gestion du solde d'heures - ${editingEmployee.first_name} ${editingEmployee.last_name}`
            : `Détails de ${editingEmployee.first_name} ${editingEmployee.last_name}`
        }
        size="large"
      >
        {editingEmployee && !showEditForm && activeModalTab !== "balance" ? (
          <EmployeeCard
            employee={viewingEmployee}
            onEdit={handleStartEditing}
            onClose={handleCloseModal}
          />
        ) : (
          <>
            {activeModalTab === "infos" && (
              <EmployeeForm
                employee={editingEmployee}
                onSubmit={handleSubmit}
                onDelete={editingEmployee ? handleDeleteEmployee : undefined}
              />
            )}
            {activeModalTab === "balance" && editingEmployee && (
              <HourBalanceManager employeeId={editingEmployee.id} />
            )}
          </>
        )}
      </Modal>
    </PageContainer>
  );
};

export default Employees;
