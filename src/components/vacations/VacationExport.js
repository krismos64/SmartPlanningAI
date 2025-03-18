import { PictureAsPdf } from "@mui/icons-material";
import { Button, useTheme } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTheme as useThemeProvider } from "../../components/ThemeProvider";
import { VACATION_TYPES } from "../../config/constants";
import useDepartments from "../../hooks/useDepartments";
import useEmployees from "../../hooks/useEmployees";

/**
 * Composant pour exporter les congés en PDF
 */
const VacationExport = ({ vacations, isGlobal = false, employeeName = "" }) => {
  const theme = useTheme();
  const { theme: themeMode } = useThemeProvider();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";

  const [filters, setFilters] = useState({
    employeeId: "",
    departmentId: "",
    startDate: "",
    endDate: "",
    status: "",
  });
  const [cachedEmployees, setCachedEmployees] = useState([]);

  const { employees } = useEmployees();
  const { departments } = useDepartments();

  useEffect(() => {
    if (employees && employees.length > 0) {
      setCachedEmployees(employees);

      try {
        localStorage.setItem("cachedEmployeesList", JSON.stringify(employees));
        localStorage.setItem("cachedEmployeesTimestamp", Date.now().toString());
      } catch (error) {
        console.error("Erreur lors de la mise en cache des employés:", error);
      }
    } else {
      const cachedData = localStorage.getItem("cachedEmployeesList");
      const cachedTimestamp = localStorage.getItem("cachedEmployeesTimestamp");

      if (cachedData && cachedTimestamp) {
        try {
          const now = Date.now();
          const timestamp = parseInt(cachedTimestamp);
          const oneHour = 60 * 60 * 1000;

          if (now - timestamp < oneHour) {
            const parsedData = JSON.parse(cachedData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              console.log("Utilisation des données en cache pour les employés");
              setCachedEmployees(parsedData);
            }
          }
        } catch (error) {
          console.error(
            "Erreur lors de la lecture du cache des employés:",
            error
          );
        }
      }
    }
  }, [employees]);

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
        // Calcul de la durée selon les normes françaises (jours ouvrés)
        let calculatedDuration;
        if (vacation.duration) {
          // Si la durée est déjà fournie, l'utiliser
          calculatedDuration = `${vacation.duration} jour(s)`;
        } else if (
          (vacation.startDate && vacation.endDate) ||
          (vacation.start_date && vacation.end_date)
        ) {
          // Sinon calculer les jours ouvrés (exclusion week-ends et jours fériés)
          const start = new Date(vacation.startDate || vacation.start_date);
          const end = new Date(vacation.endDate || vacation.end_date);

          // Importer la fonction de calcul des jours ouvrés
          const { getWorkingDaysCount } = require("../../utils/dateUtils");
          const workingDays = getWorkingDaysCount(start, end);

          calculatedDuration = `${workingDays} jour(s)`;
        } else {
          calculatedDuration = "-";
        }

        const row = {
          type: translateType(vacation.type),
          start: formatDate(vacation.startDate || vacation.start_date),
          end: formatDate(vacation.endDate || vacation.end_date),
          duration: calculatedDuration,
          status: translateStatus(vacation.status),
          reason: vacation.reason || "-",
        };

        if (isGlobal) {
          row.employee =
            vacation.employeeName ||
            vacation.employee_name ||
            (vacation.employee
              ? `${vacation.employee.first_name || ""} ${
                  vacation.employee.last_name || ""
                }`.trim()
              : "Inconnu");
        }

        return row;
      });

      // Ajouter le tableau
      autoTable(doc, {
        columns: columns,
        body: data,
        startY: 30,
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [79, 70, 229],
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
    <Button
      variant="contained"
      color="success"
      startIcon={<PictureAsPdf />}
      onClick={exportToPdf}
      sx={{
        bgcolor: isDarkMode ? "#10B981" : "#10B981",
        color: "#FFFFFF",
        "&:hover": {
          bgcolor: isDarkMode ? "#059669" : "#059669",
        },
      }}
    >
      Exporter en PDF
    </Button>
  );
};

export default VacationExport;
