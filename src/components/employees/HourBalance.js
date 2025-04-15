import axios from "axios";
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const BalanceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease-out;
  max-width: 250px;
  margin: 0 auto;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const BalanceValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ isPositive, theme }) =>
    isPositive ? theme.colors.success : theme.colors.error};
  margin-bottom: 0.5rem;
  animation: ${pulse} 0.5s ease-in-out;
`;

const BalanceLabel = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const BalanceIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const LoadingSpinner = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 2rem;
  height: 2rem;
  border: 3px solid ${({ theme }) => theme.colors.background.hover};
  border-top: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${LoadingSpinner} 1s linear infinite;
  margin: 1rem auto;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  margin: 1rem 0;
  font-size: 0.9rem;
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.8rem;
  cursor: pointer;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
`;

const HourBalance = ({ employeeId }) => {
  const [hourBalance, setHourBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/hour-balance/${employeeId}`, {
        withCredentials: true,
      });
      setHourBalance(parseFloat(response.data.hour_balance));

      setLoading(false);
    } catch (err) {
      console.error("Erreur lors de la récupération du solde d'heures:", err);
      setError("Impossible de récupérer le solde d'heures");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchBalance();
    }
  }, [employeeId, fetchBalance]);

  if (loading) {
    return (
      <BalanceContainer>
        <Spinner />
        <BalanceLabel>Chargement du solde...</BalanceLabel>
      </BalanceContainer>
    );
  }

  if (error) {
    return (
      <BalanceContainer>
        <ErrorMessage>{error}</ErrorMessage>
        <RefreshButton onClick={fetchBalance}>Réessayer</RefreshButton>
      </BalanceContainer>
    );
  }

  const isPositive = hourBalance >= 0;
  const formattedBalance = `${isPositive ? "+" : ""}${hourBalance.toFixed(2)}h`;

  return (
    <BalanceContainer>
      <BalanceIcon>{isPositive ? "✅" : "🔴"}</BalanceIcon>
      <BalanceValue isPositive={isPositive}>{formattedBalance}</BalanceValue>
      <BalanceLabel>
        {isPositive ? "Heures supplémentaires" : "Heures manquantes"}
      </BalanceLabel>
      <RefreshButton onClick={fetchBalance}>Actualiser</RefreshButton>
    </BalanceContainer>
  );
};

export default HourBalance;
