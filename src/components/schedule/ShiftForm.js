import { useState, useEffect } from "react";
import styled from "styled-components";
import { FormInput, FormSelect, FormTextarea, Button } from "../ui/Form";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const ShiftForm = ({
  shift,
  selectedDate,
  selectedEmployee,
  employees,
  onSubmit,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    employee: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  useEffect(() => {
    if (shift) {
      setFormData({
        employee: shift.extendedProps.employee._id,
        startTime: new Date(shift.start).toISOString().slice(0, 16),
        endTime: new Date(shift.end).toISOString().slice(0, 16),
        notes: shift.extendedProps.notes || "",
      });
    } else if (selectedDate) {
      const date = new Date(selectedDate);
      const startTime = new Date(date);
      const endTime = new Date(date);
      endTime.setHours(endTime.getHours() + 1);

      setFormData({
        employee: selectedEmployee?._id || "",
        startTime: startTime.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16),
        notes: "",
      });
    }
  }, [shift, selectedDate, selectedEmployee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce planning ?")) {
      onDelete();
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormSelect
        label="Employé"
        name="employee"
        value={formData.employee}
        onChange={handleChange}
        required
      >
        <option value="">Sélectionner un employé</option>
        {employees.map((employee) => (
          <option key={employee._id} value={employee._id}>
            {employee.firstName} {employee.lastName}
          </option>
        ))}
      </FormSelect>

      <FormRow>
        <FormInput
          type="datetime-local"
          label="Heure de début"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          required
        />
        <FormInput
          type="datetime-local"
          label="Heure de fin"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          required
        />
      </FormRow>

      <FormTextarea
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
      />

      <FormActions>
        {onDelete && (
          <Button type="button" onClick={handleDelete} variant="danger">
            Supprimer
          </Button>
        )}
        <Button type="submit" primary>
          {shift ? "Modifier" : "Ajouter"}
        </Button>
      </FormActions>
    </Form>
  );
};

export default ShiftForm;
