import { useState } from "react";
import styled from "styled-components";
import useEmployeeActivity from "../../hooks/useEmployeeActivity";

// Composants stylisés
const ChartContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  margin-bottom: 1.5rem;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ChartControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ChartButton = styled.button`
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primary : "transparent"};
  color: ${({ active, theme }) =>
    active ? theme.colors.white : theme.colors.text.secondary};
  border: 1px solid
    ${({ active, theme }) =>
      active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ active, theme }) =>
      active ? theme.colors.primary : theme.colors.background};
  }
`;

const ChartContent = styled.div`
  height: 300px;
  position: relative;
`;

const BarChartContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 250px;
  width: 100%;
  padding-left: 40px;
  padding-bottom: 30px;
  position: relative;
`;

const BarGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
  position: relative;
`;

const Bar = styled.div`
  width: 30px;
  height: ${({ height }) => height}%;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.3s ease;
  display: flex;
  justify-content: center;
  min-height: 4px;
`;

const BarLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.5rem;
  text-align: center;
`;

const BarValue = styled.div`
  position: absolute;
  top: -25px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const YAxis = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 250px;
  width: 40px;
  position: absolute;
  left: 0;
  bottom: 30px;
`;

const YAxisLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: right;
  padding-right: 0.5rem;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const XAxis = styled.div`
  position: absolute;
  bottom: 30px;
  left: 40px;
  right: 0;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: ${({ theme }) => theme.colors.error};
`;

// Composant de graphique à barres
const BarChart = ({ data, period }) => {
  // Calculer la valeur maximale pour l'axe Y
  const maxValue = Math.max(...data.map((item) => item.count), 10);
  const yAxisMax = Math.ceil(maxValue / 10) * 10; // Arrondir à la dizaine supérieure

  // Générer les étiquettes de l'axe Y
  const yAxisLabels = Array.from({ length: 6 }, (_, i) =>
    Math.round((yAxisMax / 5) * i)
  );

  return (
    <div style={{ position: "relative", height: "280px" }}>
      <YAxis>
        {yAxisLabels.reverse().map((label, index) => (
          <YAxisLabel key={index}>{label}</YAxisLabel>
        ))}
      </YAxis>
      <XAxis />
      <div style={{ paddingLeft: "40px", height: "250px" }}>
        <BarChartContainer>
          {data.map((item, index) => {
            // Calculer la hauteur de la barre en pourcentage
            const barHeight = (item.count / yAxisMax) * 100;
            return (
              <BarGroup key={index}>
                <Bar height={barHeight}>
                  <BarValue>{item.count}</BarValue>
                </Bar>
                <BarLabel>{item.date}</BarLabel>
              </BarGroup>
            );
          })}
        </BarChartContainer>
      </div>
    </div>
  );
};

// Composant principal pour les graphiques du tableau de bord
const DashboardCharts = () => {
  const [period, setPeriod] = useState("week");
  const { activityData, loading, error, fetchActivityData } =
    useEmployeeActivity(period);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>Activité des employés</ChartTitle>
        <ChartControls>
          <ChartButton
            active={period === "week"}
            onClick={() => handlePeriodChange("week")}
          >
            Semaine
          </ChartButton>
          <ChartButton
            active={period === "month"}
            onClick={() => handlePeriodChange("month")}
          >
            Mois
          </ChartButton>
          <ChartButton
            active={period === "year"}
            onClick={() => handlePeriodChange("year")}
          >
            Année
          </ChartButton>
        </ChartControls>
      </ChartHeader>

      <ChartContent>
        {loading ? (
          <LoadingIndicator>Chargement des données...</LoadingIndicator>
        ) : error ? (
          <ErrorMessage>
            Une erreur est survenue lors du chargement des données.
          </ErrorMessage>
        ) : (
          <BarChart data={activityData} period={period} />
        )}
      </ChartContent>
    </ChartContainer>
  );
};

export default DashboardCharts;
