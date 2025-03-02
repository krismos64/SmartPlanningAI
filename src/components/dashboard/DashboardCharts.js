import { useState } from "react";
import styled from "styled-components";

// Composants stylisés
const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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
  background-color: ${({ theme, active }) =>
    active ? theme.colors.primary : "transparent"};
  color: ${({ theme, active }) =>
    active ? "white" : theme.colors.text.secondary};
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme, active }) =>
      active ? theme.colors.primary : `${theme.colors.primary}11`};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ChartContent = styled.div`
  height: 300px;
  position: relative;
`;

const BarChartContainer = styled.div`
  display: flex;
  height: 100%;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 2rem;
`;

const BarGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const Bar = styled.div`
  width: 30px;
  height: ${({ height }) => height}%;
  background-color: ${({ theme, color }) => color || theme.colors.primary};
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
  position: relative;

  &:hover::after {
    content: "${({ value }) => value}";
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${({ theme }) => theme.colors.text.primary};
    color: ${({ theme }) => theme.colors.surface};
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
  }
`;

const BarLabel = styled.div`
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const LineChartContainer = styled.div`
  height: 100%;
  position: relative;
  padding: 1rem 0;
`;

const LineChartSvg = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const LineChartPath = styled.path`
  fill: none;
  stroke: ${({ theme, color }) => color || theme.colors.primary};
  stroke-width: 2;
  transition: all 0.5s ease;
`;

const LineChartDot = styled.circle`
  fill: ${({ theme, color }) => color || theme.colors.primary};
  stroke: ${({ theme }) => theme.colors.surface};
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    r: 6;
  }
`;

const LineChartTooltip = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.colors.text.primary};
  color: ${({ theme }) => theme.colors.surface};
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  pointer-events: none;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.2s ease;
  z-index: 10;
  white-space: nowrap;
  transform: translate(-50%, -100%);
  margin-top: -8px;
`;

const PieChartContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PieChartSvg = styled.svg`
  width: 200px;
  height: 200px;
  transform: rotate(-90deg);
`;

const PieChartSlice = styled.circle`
  fill: transparent;
  stroke-width: 40;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    stroke-width: 45;
  }
`;

const PieChartLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 2rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${({ color }) => color};
`;

// Composant de graphique en barres
const BarChart = ({ data, period }) => {
  // Filtrer les données en fonction de la période
  const filteredData = data.filter((item) => item.period === period);

  return (
    <BarChartContainer>
      {filteredData.map((item, index) => (
        <BarGroup key={index}>
          <Bar height={item.value * 2} value={item.value} color={item.color} />
          <BarLabel>{item.label}</BarLabel>
        </BarGroup>
      ))}
    </BarChartContainer>
  );
};

// Composant de graphique en ligne
const LineChart = ({ data, period }) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    value: 0,
    label: "",
  });

  // Filtrer les données en fonction de la période
  const filteredData = data.filter((item) => item.period === period);

  // Calculer les dimensions du graphique
  const padding = 30;
  const width = 100 - padding * 2;
  const height = 100 - padding * 2;

  // Trouver les valeurs min et max pour l'échelle
  const maxValue = Math.max(...filteredData.map((d) => d.value));

  // Générer les points du graphique
  const points = filteredData.map((item, index) => {
    const x = padding + (index / (filteredData.length - 1)) * width;
    const y = padding + (1 - item.value / maxValue) * height;
    return { x, y, ...item };
  });

  // Générer le chemin pour la ligne
  const pathData = points
    .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const handleMouseEnter = (point) => {
    setTooltip({
      visible: true,
      x: point.x,
      y: point.y,
      value: point.value,
      label: point.label,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  return (
    <LineChartContainer>
      <LineChartSvg viewBox="0 0 100 100">
        <LineChartPath d={pathData} />
        {points.map((point, index) => (
          <LineChartDot
            key={index}
            cx={point.x}
            cy={point.y}
            r={4}
            onMouseEnter={() => handleMouseEnter(point)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </LineChartSvg>
      <LineChartTooltip
        visible={tooltip.visible}
        style={{ left: `${tooltip.x}%`, top: `${tooltip.y}%` }}
      >
        {tooltip.label}: {tooltip.value}
      </LineChartTooltip>
    </LineChartContainer>
  );
};

// Composant de graphique en camembert
const PieChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  // Calculer les arcs pour chaque segment
  const segments = data.map((item) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle: currentAngle,
      dashArray: `${percentage * 251.2} 251.2`, // Circonférence d'un cercle de rayon 40
    };
  });

  return (
    <PieChartContainer>
      <PieChartSvg viewBox="0 0 100 100">
        {segments.map((segment, index) => (
          <PieChartSlice
            key={index}
            cx="50"
            cy="50"
            r="40"
            stroke={segment.color}
            strokeDasharray={segment.dashArray}
            strokeDashoffset={0}
          />
        ))}
      </PieChartSvg>
      <PieChartLegend>
        {segments.map((segment, index) => (
          <LegendItem key={index}>
            <LegendColor color={segment.color} />
            <span>
              {segment.label} ({Math.round(segment.percentage * 100)}%)
            </span>
          </LegendItem>
        ))}
      </PieChartLegend>
    </PieChartContainer>
  );
};

// Données fictives pour les graphiques
const getBarChartData = () => {
  return [
    // Données hebdomadaires
    { period: "week", label: "Lun", value: 25, color: "#4F46E5" },
    { period: "week", label: "Mar", value: 32, color: "#4F46E5" },
    { period: "week", label: "Mer", value: 18, color: "#4F46E5" },
    { period: "week", label: "Jeu", value: 40, color: "#4F46E5" },
    { period: "week", label: "Ven", value: 35, color: "#4F46E5" },
    { period: "week", label: "Sam", value: 10, color: "#4F46E5" },
    { period: "week", label: "Dim", value: 5, color: "#4F46E5" },

    // Données mensuelles
    { period: "month", label: "Sem 1", value: 85, color: "#4F46E5" },
    { period: "month", label: "Sem 2", value: 92, color: "#4F46E5" },
    { period: "month", label: "Sem 3", value: 78, color: "#4F46E5" },
    { period: "month", label: "Sem 4", value: 90, color: "#4F46E5" },

    // Données annuelles
    { period: "year", label: "Jan", value: 220, color: "#4F46E5" },
    { period: "year", label: "Fév", value: 240, color: "#4F46E5" },
    { period: "year", label: "Mar", value: 280, color: "#4F46E5" },
    { period: "year", label: "Avr", value: 260, color: "#4F46E5" },
    { period: "year", label: "Mai", value: 300, color: "#4F46E5" },
    { period: "year", label: "Juin", value: 320, color: "#4F46E5" },
    { period: "year", label: "Juil", value: 340, color: "#4F46E5" },
    { period: "year", label: "Août", value: 280, color: "#4F46E5" },
    { period: "year", label: "Sep", value: 310, color: "#4F46E5" },
    { period: "year", label: "Oct", value: 330, color: "#4F46E5" },
    { period: "year", label: "Nov", value: 350, color: "#4F46E5" },
    { period: "year", label: "Déc", value: 370, color: "#4F46E5" },
  ];
};

const getLineChartData = () => {
  return [
    // Données hebdomadaires
    { period: "week", label: "Lun", value: 15 },
    { period: "week", label: "Mar", value: 22 },
    { period: "week", label: "Mer", value: 18 },
    { period: "week", label: "Jeu", value: 25 },
    { period: "week", label: "Ven", value: 30 },
    { period: "week", label: "Sam", value: 18 },
    { period: "week", label: "Dim", value: 12 },

    // Données mensuelles
    { period: "month", label: "Sem 1", value: 65 },
    { period: "month", label: "Sem 2", value: 72 },
    { period: "month", label: "Sem 3", value: 68 },
    { period: "month", label: "Sem 4", value: 80 },

    // Données annuelles
    { period: "year", label: "Jan", value: 180 },
    { period: "year", label: "Fév", value: 200 },
    { period: "year", label: "Mar", value: 220 },
    { period: "year", label: "Avr", value: 210 },
    { period: "year", label: "Mai", value: 240 },
    { period: "year", label: "Juin", value: 260 },
    { period: "year", label: "Juil", value: 280 },
    { period: "year", label: "Août", value: 250 },
    { period: "year", label: "Sep", value: 270 },
    { period: "year", label: "Oct", value: 290 },
    { period: "year", label: "Nov", value: 310 },
    { period: "year", label: "Déc", value: 330 },
  ];
};

const getPieChartData = () => {
  return [
    { label: "Congés payés", value: 45, color: "#4F46E5" },
    { label: "RTT", value: 25, color: "#10B981" },
    { label: "Maladie", value: 15, color: "#F59E0B" },
    { label: "Formation", value: 10, color: "#EF4444" },
    { label: "Autres", value: 5, color: "#6B7280" },
  ];
};

// Composant principal
const DashboardCharts = () => {
  const [activityPeriod, setActivityPeriod] = useState("week");
  const [productivityPeriod, setProductivityPeriod] = useState("week");

  const barChartData = getBarChartData();
  const lineChartData = getLineChartData();
  const pieChartData = getPieChartData();

  return (
    <ChartsContainer>
      <ChartCard>
        <ChartHeader>
          <ChartTitle>Activité des employés</ChartTitle>
          <ChartControls>
            <ChartButton
              active={activityPeriod === "week"}
              onClick={() => setActivityPeriod("week")}
            >
              Semaine
            </ChartButton>
            <ChartButton
              active={activityPeriod === "month"}
              onClick={() => setActivityPeriod("month")}
            >
              Mois
            </ChartButton>
            <ChartButton
              active={activityPeriod === "year"}
              onClick={() => setActivityPeriod("year")}
            >
              Année
            </ChartButton>
          </ChartControls>
        </ChartHeader>
        <ChartContent>
          <BarChart data={barChartData} period={activityPeriod} />
        </ChartContent>
      </ChartCard>

      <ChartCard>
        <ChartHeader>
          <ChartTitle>Productivité</ChartTitle>
          <ChartControls>
            <ChartButton
              active={productivityPeriod === "week"}
              onClick={() => setProductivityPeriod("week")}
            >
              Semaine
            </ChartButton>
            <ChartButton
              active={productivityPeriod === "month"}
              onClick={() => setProductivityPeriod("month")}
            >
              Mois
            </ChartButton>
            <ChartButton
              active={productivityPeriod === "year"}
              onClick={() => setProductivityPeriod("year")}
            >
              Année
            </ChartButton>
          </ChartControls>
        </ChartHeader>
        <ChartContent>
          <LineChart data={lineChartData} period={productivityPeriod} />
        </ChartContent>
      </ChartCard>

      <ChartCard>
        <ChartHeader>
          <ChartTitle>Répartition des congés</ChartTitle>
        </ChartHeader>
        <ChartContent>
          <PieChart data={pieChartData} />
        </ChartContent>
      </ChartCard>
    </ChartsContainer>
  );
};

export default DashboardCharts;
