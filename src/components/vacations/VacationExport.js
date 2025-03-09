import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { FaFilePdf, FaFilter } from "react-icons/fa";
import styled from "styled-components";
import { VACATION_TYPES } from "../../config/constants";
import useDepartments from "../../hooks/useDepartments";
import useEmployees from "../../hooks/useEmployees";

const ExportContainer = styled.div`
  margin-bottom: 2rem;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors?.primary || "#4F46E5"};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius?.small || "0.25rem"};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) =>
      `${theme.colors?.primary}dd` || "#4338CA"};
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, active }) =>
    active ? theme.colors?.primary || "#4F46E5" : "white"};
  color: ${({ active }) => (active ? "white" : "#374151")};
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.colors?.primary || "#4F46E5" : "#D1D5DB"};
  border-radius: ${({ theme }) => theme.borderRadius?.small || "0.25rem"};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 1rem;

  &:hover {
    background-color: ${({ theme, active }) =>
      active ? `${theme.colors?.primary}dd` || "#4338CA" : "#F9FAFB"};
  }
`;

const FilterContainer = styled.div`
  margin-bottom: 1rem;
  display: ${({ show }) => (show ? "block" : "none")};
  background-color: ${({ theme }) => theme.colors?.surface || "#F9FAFB"};
  border: 1px solid ${({ theme }) => theme.colors?.border || "#E5E7EB"};
  border-radius: ${({ theme }) => theme.borderRadius?.medium || "0.375rem"};
  padding: 1rem;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.text?.primary || "#111827"};
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || "#E5E7EB"};
  border-radius: ${({ theme }) => theme.borderRadius?.small || "0.25rem"};
  font-size: 0.875rem;
  background-color: white;
`;

const FilterInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || "#E5E7EB"};
  border-radius: ${({ theme }) => theme.borderRadius?.small || "0.25rem"};
  font-size: 0.875rem;
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const VacationExport = ({ vacations, isGlobal = false, employeeName = "" }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    employeeId: "",
    departmentId: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  const { employees } = useEmployees();
  const { departments } = useDepartments();

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Formater la date pour le nom de fichier
  const formatDateForFileName = (date) => {
    return date
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

  // Traduire le statut en français
  const translateStatus = (status) => {
    switch (status) {
      case "approved":
        return "Approuvé";
      case "rejected":
        return "Refusé";
      case "pending":
        return "En attente";
      default:
        return status;
    }
  };

  // Traduire le type de congé en français
  const translateType = (type) => {
    const vacationType = VACATION_TYPES.find((t) => t.value === type);
    return vacationType ? vacationType.label : type;
  };

  // Filtrer les congés selon les critères
  const filterVacations = useCallback(() => {
    return vacations.filter((vacation) => {
      // Filtre par employé
      if (
        filters.employeeId &&
        vacation.employeeId !== parseInt(filters.employeeId)
      ) {
        return false;
      }

      // Filtre par département (nécessite que les données d'employé incluent le département)
      if (
        filters.departmentId &&
        employees.find((e) => e.id === vacation.employeeId)?.departmentId !==
          parseInt(filters.departmentId)
      ) {
        return false;
      }

      // Filtre par date de début
      if (
        filters.startDate &&
        new Date(vacation.startDate) < new Date(filters.startDate)
      ) {
        return false;
      }

      // Filtre par date de fin
      if (
        filters.endDate &&
        new Date(vacation.endDate) > new Date(filters.endDate)
      ) {
        return false;
      }

      // Filtre par statut
      if (filters.status && vacation.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [vacations, filters, employees]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      employeeId: "",
      departmentId: "",
      startDate: "",
      endDate: "",
      status: "",
    });
  };

  // Gérer les changements de filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Exporter les congés en PDF
  const exportToPdf = useCallback(() => {
    try {
      // Filtrer les congés selon les critères
      const filteredVacations = filterVacations();

      if (filteredVacations.length === 0) {
        toast.warning(
          "Aucune demande de congé ne correspond aux critères de filtrage"
        );
        return;
      }

      // Créer un nouveau document PDF en mode paysage
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Définir le titre du document
      const title = isGlobal
        ? "Récapitulatif des congés - Tous les employés"
        : `Récapitulatif des congés - ${employeeName}`;

      // Ajouter le titre
      doc.setFontSize(18);
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, {
        align: "center",
      });

      // Ajouter la date d'exportation
      doc.setFontSize(10);
      doc.text(
        `Exporté le ${new Date().toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        doc.internal.pageSize.getWidth() - 15,
        10,
        { align: "right" }
      );

      // Ajouter les informations de filtrage si des filtres sont appliqués
      let startY = 30;
      if (Object.values(filters).some((v) => v !== "")) {
        let filterText = "Filtres appliqués: ";
        const filterParts = [];

        if (filters.employeeId) {
          const employee = employees.find(
            (e) => e.id === parseInt(filters.employeeId)
          );
          if (employee) {
            filterParts.push(
              `Employé: ${employee.first_name} ${employee.last_name}`
            );
          }
        }

        if (filters.departmentId) {
          const department = departments.find(
            (d) => d.id === parseInt(filters.departmentId)
          );
          if (department) {
            filterParts.push(`Département: ${department.name}`);
          }
        }

        if (filters.startDate) {
          filterParts.push(`Après le: ${formatDate(filters.startDate)}`);
        }

        if (filters.endDate) {
          filterParts.push(`Avant le: ${formatDate(filters.endDate)}`);
        }

        if (filters.status) {
          filterParts.push(`Statut: ${translateStatus(filters.status)}`);
        }

        filterText += filterParts.join(", ");

        doc.setFontSize(10);
        doc.text(filterText, 15, 30);
        startY = 35;
      }

      // Définir les colonnes du tableau
      const columns = isGlobal
        ? [
            { header: "Employé", dataKey: "employee" },
            { header: "Type", dataKey: "type" },
            { header: "Début", dataKey: "start" },
            { header: "Fin", dataKey: "end" },
            { header: "Durée", dataKey: "duration" },
            { header: "Statut", dataKey: "status" },
            { header: "Motif", dataKey: "reason" },
          ]
        : [
            { header: "Type", dataKey: "type" },
            { header: "Début", dataKey: "start" },
            { header: "Fin", dataKey: "end" },
            { header: "Durée", dataKey: "duration" },
            { header: "Statut", dataKey: "status" },
            { header: "Motif", dataKey: "reason" },
          ];

      // Préparer les données
      const data = filteredVacations.map((vacation) => {
        const row = {
          type: translateType(vacation.type),
          start: formatDate(vacation.startDate),
          end: formatDate(vacation.endDate),
          duration: vacation.duration || "-",
          status: translateStatus(vacation.status),
          reason: vacation.reason || "-",
        };

        if (isGlobal) {
          row.employee =
            vacation.employeeName || vacation.employee_name || "Inconnu";
        }

        return row;
      });

      // Ajouter le tableau
      autoTable(doc, {
        columns: columns,
        body: data,
        startY: 60,
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
      });

      // Ajouter les numéros de page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Page ${i} sur ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Sauvegarder le PDF
      const fileName = isGlobal
        ? `demandes_conges_${formatDateForFileName(new Date())}.pdf`
        : `demandes_conges_${employeeName || "Employe"}_${formatDateForFileName(
            new Date()
          )}.pdf`;

      doc.save(fileName);

      toast.success("Export PDF réussi");
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error("Erreur lors de l'export PDF: " + error.message);
    }
  }, [
    isGlobal,
    employeeName,
    filterVacations,
    filters,
    employees,
    departments,
  ]);

  return (
    <ExportContainer>
      <ButtonsContainer>
        <FilterButton
          onClick={() => setShowFilters(!showFilters)}
          active={showFilters}
        >
          <FaFilter /> Filtres
        </FilterButton>

        <ExportButton onClick={exportToPdf}>
          <FaFilePdf />
          Exporter en PDF
        </ExportButton>
      </ButtonsContainer>

      <FilterContainer show={showFilters}>
        <FilterGrid>
          {isGlobal && (
            <>
              <FilterGroup>
                <FilterLabel>Employé</FilterLabel>
                <FilterSelect
                  name="employeeId"
                  value={filters.employeeId}
                  onChange={handleFilterChange}
                >
                  <option value="">Tous les employés</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))}
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Département</FilterLabel>
                <FilterSelect
                  name="departmentId"
                  value={filters.departmentId}
                  onChange={handleFilterChange}
                >
                  <option value="">Tous les départements</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </FilterSelect>
              </FilterGroup>
            </>
          )}

          <FilterGroup>
            <FilterLabel>Date de début (après)</FilterLabel>
            <FilterInput
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Date de fin (avant)</FilterLabel>
            <FilterInput
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Statut</FilterLabel>
            <FilterSelect
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Refusé</option>
            </FilterSelect>
          </FilterGroup>
        </FilterGrid>

        <FilterActions>
          <ExportButton
            onClick={resetFilters}
            style={{ backgroundColor: "#6B7280" }}
          >
            Réinitialiser
          </ExportButton>
        </FilterActions>
      </FilterContainer>
    </ExportContainer>
  );
};

export default VacationExport;
