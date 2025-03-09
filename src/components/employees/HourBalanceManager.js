import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import styled from "styled-components";
import { API_ENDPOINTS, API_URL } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import useApi from "../../hooks/useApi";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.success};
  color: white;
`;

const SubtractButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
`;

const CurrentBalance = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const BalanceValue = styled.span`
  font-weight: 600;
  color: ${({ isPositive, theme }) =>
    isPositive ? theme.colors.success : theme.colors.error};
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
  background-color: ${({ theme }) => theme.colors.background.hover};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.active};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HoursDisplay = styled.div`
  font-size: 1rem;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
`;

const HourBalanceManager = ({ employeeId, onBalanceUpdated }) => {
  const [hours, setHours] = useState("1");
  const [currentBalance, setCurrentBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const api = useApi();
  const { token, user } = useAuth();

  // Charger les données de l'employé
  const fetchEmployeeData = useCallback(async () => {
    try {
      const response = await api.get(API_ENDPOINTS.EMPLOYEES.BY_ID(employeeId));
      if (response) {
        setEmployeeData(response);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données de l'employé:",
        error
      );
    }
  }, [employeeId, api]);

  // Charger le solde actuel
  const fetchCurrentBalance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(
        API_ENDPOINTS.HOUR_BALANCE.BY_EMPLOYEE(employeeId)
      );

      // Vérifier si la réponse contient hour_balance
      if (
        response &&
        (response.hour_balance !== undefined || response.balance !== undefined)
      ) {
        const balance =
          response.hour_balance !== undefined
            ? response.hour_balance
            : response.balance;
        setCurrentBalance(parseFloat(balance));
      } else {
        console.error("Format de réponse inattendu:", response);
        toast.error("Format de réponse inattendu");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du solde d'heures:", error);
      toast.error("Impossible de récupérer le solde d'heures");
    } finally {
      setLoading(false);
    }
  }, [employeeId, api]);

  // Charger le solde et les données de l'employé au montage du composant
  useEffect(() => {
    if (employeeId) {
      fetchCurrentBalance();
      fetchEmployeeData();
    }
  }, [employeeId, fetchCurrentBalance, fetchEmployeeData]);

  // Ajuster la valeur des heures
  const adjustHours = (increment) => {
    const currentValue = parseFloat(hours) || 0;
    const newValue = Math.max(0.25, currentValue + increment);
    setHours(newValue.toFixed(2));
  };

  // Ajouter une activité récente
  const logActivity = useCallback(
    async (operation, hoursValue) => {
      try {
        console.log("Tentative d'enregistrement d'une activité...");
        console.log("URL de l'API utilisée:", API_URL);
        console.log("Token d'authentification disponible:", !!token);
        console.log("Utilisateur connecté:", user);

        if (!employeeData) {
          console.warn("Données de l'employé non disponibles, récupération...");
          await fetchEmployeeData();
        }

        const employeeName = employeeData
          ? `${employeeData.first_name} ${employeeData.last_name}`
          : `Employé #${employeeId}`;

        const userName = user
          ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
          : "Un utilisateur";

        console.log("Nom de l'employé pour l'activité:", employeeName);
        console.log("Nom de l'utilisateur pour l'activité:", userName);

        // Créer une description claire pour l'activité
        const description = `${userName} a ${
          operation === "add" ? "ajouté" : "soustrait"
        } ${hoursValue}h au solde d'heures de ${employeeName}`;

        // Préparer les données de l'activité selon le format attendu par le serveur
        const activityData = {
          type: "update",
          entity_type: "employee",
          entity_id: employeeId,
          description: description,
          details: {
            userName,
            employeeName,
            action:
              operation === "add" ? "Ajout d'heures" : "Soustraction d'heures",
            hours: hoursValue,
            oldBalance: currentBalance,
            newBalance:
              operation === "add"
                ? currentBalance + parseFloat(hoursValue)
                : currentBalance - parseFloat(hoursValue),
          },
        };

        console.log("Données de l'activité à enregistrer:", activityData);

        // Utiliser directement l'API pour créer l'activité
        const response = await api.post(
          API_ENDPOINTS.ACTIVITIES.BASE,
          activityData
        );

        console.log("Réponse de l'enregistrement d'activité:", response);

        if (response && response.success) {
          console.log("Activité enregistrée avec succès");
          return true;
        } else {
          console.warn(
            "Réponse inattendue lors de l'enregistrement de l'activité:",
            response
          );
          return false;
        }
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'activité:", error);
        return false;
      }
    },
    [
      api,
      employeeId,
      employeeData,
      currentBalance,
      fetchEmployeeData,
      token,
      user,
    ]
  );

  // Mettre à jour le solde d'heures
  const updateBalance = async (operation) => {
    if (!hours || isNaN(parseFloat(hours)) || parseFloat(hours) <= 0) {
      toast.error("Veuillez entrer un nombre d'heures valide");
      return;
    }

    try {
      setLoading(true);

      // Créer un nouvel enregistrement dans work_hours
      const response = await api.post(API_ENDPOINTS.WORK_HOURS.BASE, {
        employeeId: employeeId,
        date: new Date().toISOString().split("T")[0],
        expectedHours: operation === "add" ? 0 : parseFloat(hours),
        actualHours: operation === "add" ? parseFloat(hours) : 0,
        balance: operation === "add" ? parseFloat(hours) : -parseFloat(hours),
        description:
          operation === "add"
            ? "Ajout manuel d'heures"
            : "Soustraction manuelle d'heures",
      });

      if (response && response.success) {
        // Récupérer le solde mis à jour
        await fetchCurrentBalance();

        // Enregistrer l'activité
        try {
          await logActivity(operation, hours);
          console.log(
            "Activité enregistrée avec succès après mise à jour du solde"
          );
        } catch (activityError) {
          console.error(
            "Erreur lors de l'enregistrement de l'activité:",
            activityError
          );
          // Ne pas bloquer le flux principal en cas d'erreur d'enregistrement d'activité
        }

        // Notifier le parent que le solde a été mis à jour
        if (onBalanceUpdated) {
          onBalanceUpdated();
        }

        toast.success(
          operation === "add"
            ? `${hours}h ajoutées au solde`
            : `${hours}h soustraites du solde`
        );

        // Réinitialiser le formulaire
        setHours("1");
      } else {
        throw new Error(
          response?.message || "Erreur lors de la mise à jour du solde"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du solde d'heures:", error);
      toast.error(
        error.message || "Erreur lors de la mise à jour du solde d'heures"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Gestion du solde d'heures</Title>

      {currentBalance !== null && (
        <CurrentBalance>
          Solde actuel:
          <BalanceValue isPositive={currentBalance >= 0}>
            {currentBalance >= 0 ? "+" : ""}
            {currentBalance.toFixed(2)}h
          </BalanceValue>
        </CurrentBalance>
      )}

      <Form onSubmit={(e) => e.preventDefault()}>
        <InputGroup>
          <Label htmlFor="hours">Nombre d'heures</Label>
          <Input
            id="hours"
            type="number"
            min="0.25"
            step="0.25"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="Entrez le nombre d'heures"
            disabled={loading}
          />

          <StepperContainer>
            <StepButton
              type="button"
              onClick={() => adjustHours(-0.25)}
              disabled={loading || parseFloat(hours) <= 0.25}
            >
              -
            </StepButton>
            <HoursDisplay>{hours}h</HoursDisplay>
            <StepButton
              type="button"
              onClick={() => adjustHours(0.25)}
              disabled={loading}
            >
              +
            </StepButton>
          </StepperContainer>
        </InputGroup>

        <ButtonGroup>
          <AddButton
            type="button"
            onClick={() => updateBalance("add")}
            disabled={loading || !hours}
          >
            Ajouter
          </AddButton>
          <SubtractButton
            type="button"
            onClick={() => updateBalance("subtract")}
            disabled={loading || !hours}
          >
            Soustraire
          </SubtractButton>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default HourBalanceManager;
