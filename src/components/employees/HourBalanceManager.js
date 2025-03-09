import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import styled from "styled-components";

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

const HourBalanceManager = ({ employeeId, onBalanceUpdated }) => {
  const [hours, setHours] = useState("");
  const [currentBalance, setCurrentBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  // Charger le solde actuel
  const fetchCurrentBalance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/hour-balance/${employeeId}`);
      setCurrentBalance(parseFloat(response.data.hour_balance));
    } catch (error) {
      console.error("Erreur lors de la récupération du solde d'heures:", error);
      toast.error("Impossible de récupérer le solde d'heures");
    } finally {
      setLoading(false);
    }
  };

  // Charger le solde au montage du composant
  useEffect(() => {
    if (employeeId) {
      fetchCurrentBalance();
    }
  }, [employeeId]);

  // Mettre à jour le solde d'heures
  const updateBalance = async (operation) => {
    if (!hours || isNaN(parseFloat(hours)) || parseFloat(hours) <= 0) {
      toast.error("Veuillez entrer un nombre d'heures valide");
      return;
    }

    try {
      setLoading(true);

      // Créer un nouvel enregistrement dans work_hours
      const response = await axios.post("/api/work-hours", {
        employee_id: employeeId,
        date: new Date().toISOString().split("T")[0],
        hours: parseFloat(hours),
        balance: operation === "add" ? parseFloat(hours) : -parseFloat(hours),
        description:
          operation === "add"
            ? "Ajout manuel d'heures"
            : "Soustraction manuelle d'heures",
      });

      if (response.data && response.data.success) {
        // Récupérer le solde mis à jour
        await fetchCurrentBalance();

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
        setHours("");
      } else {
        throw new Error(
          response.data?.message || "Erreur lors de la mise à jour du solde"
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
            min="0.01"
            step="0.01"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="Entrez le nombre d'heures"
            disabled={loading}
          />
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
