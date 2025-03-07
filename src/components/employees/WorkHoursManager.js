import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaCheck,
  FaEdit,
  FaHistory,
  FaMinus,
  FaPlus,
  FaSave,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import styled, { keyframes } from "styled-components";
import { API_ENDPOINTS } from "../../config/api";
import HourBalance from "./HourBalance";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Container = styled.div`
  margin: 2rem 0;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.background.card};
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h4`
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 600;
  font-size: 0.9rem;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme, variant }) =>
    variant === "delete"
      ? theme.colors.error
      : variant === "edit"
      ? theme.colors.primary
      : variant === "save"
      ? theme.colors.success
      : theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}30;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, variant }) =>
    variant === "negative" ? theme.colors.error : theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, variant }) =>
      variant === "negative"
        ? theme.colors.errorDark
        : theme.colors.primaryDark};
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EditableInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  width: 80px;
`;

const StepperContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const StepButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme, variant }) =>
    variant === "decrease"
      ? theme.colors.error + "20"
      : theme.colors.success + "20"};
  color: ${({ theme, variant }) =>
    variant === "decrease" ? theme.colors.error : theme.colors.success};
  border: 1px solid
    ${({ theme, variant }) =>
      variant === "decrease" ? theme.colors.error : theme.colors.success};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, variant }) =>
      variant === "decrease"
        ? theme.colors.error + "40"
        : theme.colors.success + "40"};
  }
`;

const HoursDisplay = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  min-width: 60px;
  text-align: center;
  color: ${({ theme, isNegative }) =>
    isNegative ? theme.colors.error : theme.colors.text.primary};
`;

const DateSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const DateInput = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
`;

const DateIcon = styled.div`
  position: absolute;
  right: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
  pointer-events: none;
`;

const ExpectedHoursInfo = styled.div`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const HistoryTitle = styled.h4`
  font-size: 1rem;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ConfirmationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
`;

const ConfirmationDialog = styled.div`
  background-color: ${({ theme }) => theme.colors.primary + "F0"};
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid ${({ theme }) => theme.colors.primary};
  animation: ${fadeIn} 0.3s ease-out;
`;

const ConfirmationTitle = styled.h4`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

  &::before {
    content: "⚠️";
    font-size: 1.5rem;
  }
`;

const ConfirmationMessage = styled.p`
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: white;
  line-height: 1.5;
  padding-left: 2.25rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const ConfirmationButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const ConfirmButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  background-color: ${({ theme, variant }) =>
    variant === "cancel"
      ? theme.colors.error
      : variant === "negative"
      ? theme.colors.error
      : theme.colors.primary};

  color: white;

  border: 1px solid
    ${({ theme, variant }) =>
      variant === "cancel"
        ? theme.colors.error
        : variant === "negative"
        ? theme.colors.error
        : theme.colors.primary};

  &:hover {
    background-color: ${({ theme, variant }) =>
      variant === "cancel"
        ? theme.colors.errorDark
        : variant === "negative"
        ? theme.colors.errorDark
        : theme.colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ValidateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  margin-top: 1rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const WorkHoursManager = ({ employeeId, employeeName }) => {
  const [workHours, setWorkHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    expected_hours: 7.0,
    actual_hours: 0.0,
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const fetchWorkHours = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        API_ENDPOINTS.WORK_HOURS.BY_EMPLOYEE(employeeId)
      );
      setWorkHours(response.data);

      setLoading(false);
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des heures travaillées:",
        err
      );
      setError("Impossible de récupérer les heures travaillées");
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) {
      fetchWorkHours();
    }
  }, [employeeId, fetchWorkHours]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Si la date change, vérifier s'il y a déjà des heures prévues pour cette date
    if (name === "date") {
      const existingEntry = workHours.find(
        (wh) => wh.date.split("T")[0] === value
      );
      if (existingEntry) {
        setFormData((prev) => ({
          ...prev,
          expected_hours: existingEntry.expected_hours,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          expected_hours: 7.0,
        }));
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const adjustHours = (increment) => {
    setFormData((prev) => ({
      ...prev,
      actual_hours: parseFloat(
        (parseFloat(prev.actual_hours) + increment).toFixed(2)
      ),
    }));
  };

  const confirmAction = (action, message) => {
    setConfirmationAction(() => action);
    setConfirmationMessage(message);
    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(API_ENDPOINTS.WORK_HOURS.BASE, {
        employee_id: employeeId,
        date: formData.date,
        expected_hours: formData.expected_hours,
        actual_hours: Math.abs(formData.actual_hours), // Toujours enregistrer la valeur absolue
        // Si les heures sont négatives, on inverse expected_hours et actual_hours
        ...(formData.actual_hours < 0
          ? {
              expected_hours: Math.abs(formData.actual_hours),
              actual_hours: 0,
            }
          : {}),
      });

      // Réinitialiser le formulaire
      setFormData({
        date: new Date().toISOString().split("T")[0],
        expected_hours: 7.0,
        actual_hours: 0.0,
      });

      // Rafraîchir les données
      fetchWorkHours();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement des heures:", err);
      setError("Impossible d'enregistrer les heures");
    }
  };

  const startEditing = (workHour) => {
    setEditingId(workHour.id);
    setEditData({
      expected_hours: workHour.expected_hours,
      actual_hours: workHour.actual_hours,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(API_ENDPOINTS.WORK_HOURS.BY_ID(id), {
        ...editData,
      });

      setEditingId(null);
      setEditData({});

      // Rafraîchir les données
      fetchWorkHours();
    } catch (err) {
      console.error(
        "Erreur lors de la mise à jour des heures travaillées:",
        err
      );
      setError("Impossible de mettre à jour les heures travaillées");
    }
  };

  const deleteWorkHour = async (id) => {
    try {
      await axios.delete(API_ENDPOINTS.WORK_HOURS.BY_ID(id));

      // Rafraîchir les données
      fetchWorkHours();
    } catch (err) {
      console.error(
        "Erreur lors de la suppression des heures travaillées:",
        err
      );
      setError("Impossible de supprimer les heures travaillées");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <Container>
      <Title>
        <FaPlus /> Gestion des heures travaillées
      </Title>

      <Grid>
        <Card>
          <CardTitle>Solde d'heures</CardTitle>
          <HourBalance employeeId={employeeId} />
        </Card>

        <Card>
          <CardTitle>Modifier les heures</CardTitle>
          <Form>
            <DateSelector>
              <Label htmlFor="date">Date</Label>
              <DateInput>
                <Input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
                <DateIcon>
                  <FaCalendarAlt />
                </DateIcon>
              </DateInput>
              <ExpectedHoursInfo>
                Heures prévues ce jour : {formData.expected_hours}h
              </ExpectedHoursInfo>
            </DateSelector>

            <FormGroup>
              <Label htmlFor="actual_hours">
                Heures travaillées (+ pour ajouter, - pour enlever)
              </Label>
              <StepperContainer>
                <StepButton
                  type="button"
                  variant="decrease"
                  onClick={() => adjustHours(-0.25)}
                  title="Diminuer de 15 minutes"
                >
                  <FaMinus />
                </StepButton>

                <HoursDisplay
                  isNegative={parseFloat(formData.actual_hours) < 0}
                >
                  {parseFloat(formData.actual_hours).toFixed(2)}h
                </HoursDisplay>

                <StepButton
                  type="button"
                  onClick={() => adjustHours(0.25)}
                  title="Augmenter de 15 minutes"
                >
                  <FaPlus />
                </StepButton>
              </StepperContainer>

              <Input
                type="number"
                id="actual_hours"
                name="actual_hours"
                step="0.25"
                value={formData.actual_hours}
                onChange={handleInputChange}
                required
              />
              <ExpectedHoursInfo>
                {parseFloat(formData.actual_hours) > 0
                  ? "Valeur positive = heures travaillées à ajouter"
                  : "Valeur négative = heures à déduire"}
              </ExpectedHoursInfo>
            </FormGroup>

            <ValidateButton
              type="button"
              onClick={() =>
                confirmAction(
                  handleSubmit,
                  parseFloat(formData.actual_hours) >= 0
                    ? `Êtes-vous sûr de vouloir ajouter ${
                        formData.actual_hours
                      }h travaillées pour le ${formatDate(formData.date)} ?`
                    : `Êtes-vous sûr de vouloir déduire ${Math.abs(
                        formData.actual_hours
                      )}h pour le ${formatDate(formData.date)} ?`
                )
              }
            >
              <FaCheck /> Valider la modification
            </ValidateButton>
          </Form>
        </Card>
      </Grid>

      <Card style={{ marginTop: "2rem" }}>
        <HistoryTitle>
          <FaHistory /> Historique des modifications
        </HistoryTitle>

        {loading ? (
          <EmptyState>Chargement...</EmptyState>
        ) : error ? (
          <EmptyState>{error}</EmptyState>
        ) : workHours.length === 0 ? (
          <EmptyState>Aucun enregistrement d'heures trouvé</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Heures prévues</Th>
                <Th>Heures réelles</Th>
                <Th>Solde</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {workHours.map((workHour) => (
                <tr key={workHour.id}>
                  <Td>{formatDate(workHour.date)}</Td>
                  <Td>
                    {editingId === workHour.id ? (
                      <EditableInput
                        type="number"
                        name="expected_hours"
                        min="0"
                        step="0.25"
                        value={editData.expected_hours}
                        onChange={handleEditChange}
                      />
                    ) : (
                      `${workHour.expected_hours}h`
                    )}
                  </Td>
                  <Td>
                    {editingId === workHour.id ? (
                      <EditableInput
                        type="number"
                        name="actual_hours"
                        min="0"
                        step="0.25"
                        value={editData.actual_hours}
                        onChange={handleEditChange}
                      />
                    ) : (
                      `${workHour.actual_hours}h`
                    )}
                  </Td>
                  <Td
                    style={{
                      color: workHour.balance >= 0 ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {workHour.balance >= 0 ? "+" : ""}
                    {workHour.balance}h
                  </Td>
                  <Td>
                    <ActionButtons>
                      {editingId === workHour.id ? (
                        <>
                          <ActionButton
                            variant="save"
                            onClick={() => saveEdit(workHour.id)}
                            title="Enregistrer"
                          >
                            <FaSave />
                          </ActionButton>
                          <ActionButton
                            variant="cancel"
                            onClick={cancelEditing}
                            title="Annuler"
                          >
                            <FaTimes />
                          </ActionButton>
                        </>
                      ) : (
                        <>
                          <ActionButton
                            variant="edit"
                            onClick={() => startEditing(workHour)}
                            title="Modifier"
                          >
                            <FaEdit />
                          </ActionButton>
                          <ActionButton
                            variant="delete"
                            onClick={() =>
                              confirmAction(
                                () => deleteWorkHour(workHour.id),
                                `Êtes-vous sûr de vouloir supprimer cet enregistrement du ${formatDate(
                                  workHour.date
                                )} ?`
                              )
                            }
                            title="Supprimer"
                          >
                            <FaTrash />
                          </ActionButton>
                        </>
                      )}
                    </ActionButtons>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {showConfirmation && (
        <ConfirmationOverlay>
          <ConfirmationDialog>
            <ConfirmationTitle>Confirmation</ConfirmationTitle>
            <ConfirmationMessage>{confirmationMessage}</ConfirmationMessage>
            <ConfirmationButtons>
              <ConfirmButton
                variant="cancel"
                onClick={() => setShowConfirmation(false)}
              >
                <FaTimes /> Annuler
              </ConfirmButton>
              <ConfirmButton
                onClick={() => {
                  setShowConfirmation(false);
                  confirmationAction();
                }}
                variant={
                  parseFloat(formData.actual_hours) < 0 ? "negative" : "primary"
                }
              >
                <FaCheck /> Confirmer
              </ConfirmButton>
            </ConfirmationButtons>
          </ConfirmationDialog>
        </ConfirmationOverlay>
      )}
    </Container>
  );
};

export default WorkHoursManager;
