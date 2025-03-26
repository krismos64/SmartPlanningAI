import { PictureAsPdf } from "@mui/icons-material";
import { Button, useTheme } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { useTheme as useThemeProvider } from "../ThemeProvider";

/**
 * Composant pour exporter les employés en PDF
 */
const EmployeeExport = ({ employees, filteredEmployees }) => {
  const theme = useTheme();
  const { theme: themeMode } = useThemeProvider();
  const isDarkMode = theme?.palette?.mode === "dark" || themeMode === "dark";

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

  // Exporter les employés en PDF
  const exportToPdf = useCallback(() => {
    try {
      // Utiliser les employés filtrés pour l'exportation
      const employeesToExport = filteredEmployees || employees;

      if (employeesToExport.length === 0) {
        toast.warning("Aucun employé ne correspond aux critères de filtrage");
        return;
      }

      // Créer un nouveau document PDF en mode paysage
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Définir le titre du document
      const title = "Liste des employés";

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
      const columns = [
        { header: "Nom", dataKey: "name" },
        { header: "Département", dataKey: "department" },
        { header: "Rôle", dataKey: "role" },
        { header: "Heures hebdo", dataKey: "contractHours" },
        { header: "Date d'embauche", dataKey: "hireDate" },
        { header: "Solde d'heures", dataKey: "hourBalance" },
      ];

      // Préparer les données
      const data = employeesToExport.map((employee) => {
        return {
          name: `${employee.first_name} ${employee.last_name}`,
          department: employee.department || "-",
          role: employee.role || "-",
          contractHours: employee.contractHours
            ? `${employee.contractHours}h`
            : "-",
          hireDate: formatDate(employee.hire_date),
          hourBalance: employee.hour_balance
            ? `${employee.hour_balance > 0 ? "+" : ""}${employee.hour_balance}h`
            : "0h",
        };
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
      const fileName = `liste_employes_${formatDateForFileName(
        new Date()
      )}.pdf`;
      doc.save(fileName);

      toast.success("Export PDF réussi");
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error("Erreur lors de l'export PDF: " + error.message);
    }
  }, [employees, filteredEmployees]);

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

export default EmployeeExport;
