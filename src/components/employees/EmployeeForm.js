import { useState, useCallback, memo } from "react";
import styled from "styled-components";
import { Button } from "../ui";
import { FormInput, FormSelect } from "../ui/Form";
import {
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUSES,
} from "../../config/constants";

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

const EmployeeForm = ({ employee, onSubmit, onDelete }) => {
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    email: employee?.email || "",
    department: employee?.department || "",
    role: employee?.role || "",
    status: employee?.status || "active",
    birthDate: employee?.birthDate || "",
    startDate: employee?.startDate || new Date().toISOString().split("T")[0],
  });

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
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Nom"
          name="lastName"
          value={formData.lastName}
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
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
          helpText="Facultatif"
        />
        <FormSelect
          label="Département"
          name="department"
          value={formData.department}
          onChange={handleChange}
          helpText="Facultatif"
        >
          <option value="">Sélectionner un département</option>
          {EMPLOYEE_DEPARTMENTS.map((dept) => (
            <option key={dept.value} value={dept.value}>
              {dept.label}
            </option>
          ))}
        </FormSelect>
        <FormSelect
          label="Rôle"
          name="role"
          value={formData.role}
          onChange={handleChange}
          helpText="Facultatif"
        >
          <option value="">Sélectionner un rôle</option>
          {EMPLOYEE_ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </FormSelect>
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
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          helpText="Facultatif"
        />
      </FormGrid>

      <FormActions>
        {onDelete && (
          <Button type="button" onClick={handleDelete} danger>
            Supprimer
          </Button>
        )}
        <Button type="submit" primary>
          {employee ? "Enregistrer" : "Ajouter"}
        </Button>
      </FormActions>
    </form>
  );
};

export default memo(EmployeeForm);
