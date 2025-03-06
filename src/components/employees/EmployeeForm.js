import { memo, useCallback, useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import styled, { keyframes } from "styled-components";
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

const HoursCounterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  max-width: 300px;
  margin: 0 auto;
`;

const CounterControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  justify-content: space-between;
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const CounterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${({ theme, increment }) =>
    increment ? theme.colors.success : theme.colors.error};
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: none;
    animation: ${pulse} 0.5s ease-in-out;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const CounterDisplay = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const CounterValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  min-width: 120px;
  transition: all 0.3s ease;
`;

const CounterLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const CounterInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
`;

const QuickAdjustButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const QuickAdjustButton = styled.button`
  padding: 0.25rem 0.5rem;
  background-color: ${({ theme }) => theme.colors.background.hover};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }
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
    hoursWorked: employee?.hoursWorked ?? 0,
    hourlyRate: employee?.hourlyRate ?? 0,
  };

  const [formData, setFormData] = useState(initialFormData);

  const [animateHours, setAnimateHours] = useState(false);

  useEffect(() => {
    if (animateHours) {
      const timer = setTimeout(() => {
        setAnimateHours(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [animateHours]);

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
        hoursWorked: employee.hoursWorked ?? 0,
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

  const handleHoursChange = useCallback((e) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({
      ...prev,
      hoursWorked: value,
    }));
    setAnimateHours(true);
  }, []);

  const adjustHours = useCallback((increment) => {
    setFormData((prev) => ({
      ...prev,
      hoursWorked: Math.max(
        0,
        parseFloat((prev.hoursWorked + increment).toFixed(2))
      ),
    }));
    setAnimateHours(true);
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

      {employee && (
        <FormSection>
          <SectionTitle>Compteur d'heures</SectionTitle>
          <HoursCounterContainer>
            <CounterControls>
              <CounterButton
                type="button"
                onClick={() => adjustHours(-0.25)}
                aria-label="Diminuer de 15 minutes"
              >
                <FaMinus />
              </CounterButton>

              <CounterDisplay key={animateHours ? "animate" : "static"}>
                <CounterValue>{formData.hoursWorked.toFixed(2)}</CounterValue>
                <CounterLabel>Heures travaillées</CounterLabel>
                <CounterInput
                  type="number"
                  min="0"
                  step="0.25"
                  value={formData.hoursWorked}
                  onChange={handleHoursChange}
                  aria-label="Heures travaillées"
                />
              </CounterDisplay>

              <CounterButton
                type="button"
                onClick={() => adjustHours(0.25)}
                aria-label="Augmenter de 15 minutes"
                increment
              >
                <FaPlus />
              </CounterButton>
            </CounterControls>

            <QuickAdjustButtons>
              <QuickAdjustButton type="button" onClick={() => adjustHours(1)}>
                +1h
              </QuickAdjustButton>
              <QuickAdjustButton type="button" onClick={() => adjustHours(2)}>
                +2h
              </QuickAdjustButton>
              <QuickAdjustButton type="button" onClick={() => adjustHours(4)}>
                +4h
              </QuickAdjustButton>
              <QuickAdjustButton type="button" onClick={() => adjustHours(8)}>
                +8h
              </QuickAdjustButton>
            </QuickAdjustButtons>
          </HoursCounterContainer>
        </FormSection>
      )}

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
