import { memo, useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { EMPLOYEE_STATUSES } from "../../config/constants";
import { Button } from "../ui";
import { FormInput, FormSelect } from "../ui/Form";

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const FormSection = styled.div`
  margin-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const EmployeeForm = ({ employee, onSubmit, onDelete }) => {
  // Fonction pour formater les dates ISO en format YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      // Si la date est déjà au format YYYY-MM-DD, la retourner telle quelle
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      // Sinon, convertir la date ISO en format YYYY-MM-DD
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return "";
    }
  };

  const initialFormData = {
    first_name: employee?.first_name || "",
    last_name: employee?.last_name || "",
    email: employee?.email || "",
    department: employee?.department || "",
    role: employee?.role || "",
    status: employee?.status || "active",
    birthdate: formatDateForInput(employee?.birthdate) || "",
    hire_date:
      formatDateForInput(employee?.hire_date) ||
      formatDateForInput(new Date().toISOString()),
    contractHours: employee?.contractHours ?? 35,
    hourlyRate: employee?.hourlyRate ?? 0,
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    // Mettre à jour le formulaire quand l'employé change
    if (employee) {
      setFormData({
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email || "",
        department: employee.department || "",
        role: employee.role || "",
        status: employee.status || "active",
        birthdate: formatDateForInput(employee.birthdate) || "",
        hire_date:
          formatDateForInput(employee.hire_date) ||
          formatDateForInput(new Date().toISOString()),
        contractHours: employee.contractHours ?? 35,
        hourlyRate: employee.hourlyRate ?? 0,
      });
    }
  }, [employee]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      console.log("Données du formulaire à soumettre:", formData);
      onSubmit(formData);
    },
    [formData, onSubmit]
  );

  const handleDelete = useCallback(() => {
    if (onDelete) onDelete();
  }, [onDelete]);

  return (
    <form onSubmit={handleSubmit}>
      <FormGrid>
        <FormInput
          label="Prénom"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Nom"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          helpText="Facultatif"
        />
        <FormInput
          label="Date de naissance"
          name="birthdate"
          type="date"
          value={formData.birthdate}
          onChange={handleChange}
          helpText="Facultatif"
        />
        <FormInput
          label="Département"
          name="department"
          value={formData.department}
          onChange={handleChange}
          helpText="Facultatif"
        />
        <FormInput
          label="Rôle"
          name="role"
          value={formData.role}
          onChange={handleChange}
          helpText="Facultatif"
        />
        <FormInput
          label="Heures contractuelles"
          name="contractHours"
          type="number"
          min="0"
          step="0.5"
          value={formData.contractHours}
          onChange={handleChange}
          helpText="Nombre d'heures hebdomadaires"
        />
        <FormSelect
          label="Statut"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          {EMPLOYEE_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </FormSelect>
        <FormInput
          label="Date d'embauche"
          name="hire_date"
          type="date"
          value={formData.hire_date}
          onChange={handleChange}
          helpText="Facultatif"
        />
      </FormGrid>

      <FormActions>
        {onDelete && (
          <Button type="button" onClick={handleDelete} variant="error">
            Supprimer
          </Button>
        )}
        <Button type="submit" variant="primary">
          {employee ? "Enregistrer" : "Ajouter"}
        </Button>
      </FormActions>
    </form>
  );
};

export default memo(EmployeeForm);
