import { motion } from "framer-motion";
import styled from "styled-components";

// Conteneur principal
export const ScheduleContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.background.primary};
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

// En-tête du planning
export const ScheduleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

// Filtres du planning
export const ScheduleFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: 1rem;
  border-radius: 0.5rem;
`;

// Groupe de filtres
export const FiltersGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

// Navigation de semaine
export const WeekNavigation = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

// Affichage de la semaine
export const WeekDisplay = styled.div`
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
  }
`;

// Actions de semaine
export const WeekActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

// Bouton d'action
export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: none;
  border-radius: 0.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.quaternary};
  }
`;

// Bouton d'export
export const ExportAllButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.colors.info.light};
  color: ${({ theme }) => theme.colors.info.contrastText};

  &:hover {
    background-color: ${({ theme }) => theme.colors.info.main};
  }
`;

// Conteneur de filtre
export const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 200px;
`;

// Étiquette de formulaire
export const FormLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Sélecteur de filtre
export const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 0.25rem;
  background-color: ${({ theme }) => theme.colors.background.primary};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
  width: 100%;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

// Conteneur de recherche
export const SearchContainer = styled(FilterContainer)`
  flex-grow: 1;
  max-width: 400px;
`;

// Champ de recherche d'employé
export const EmployeeSearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 0.25rem;
  background-color: ${({ theme }) => theme.colors.background.primary};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
  width: 100%;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

// Message de pas de résultats
export const NoResultsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 0.5rem;
  margin: 1rem 0;
`;

// Titre du planning
export const PlanningTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

// Partie gauche de l'en-tête
export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// Conteneur d'animation
export const AnimationContainer = styled.div`
  width: 60px;
  height: 60px;
`;

// Conteneur de titre
export const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

// Titre de page
export const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
  margin: 0;
`;

// Description de page
export const PageDescription = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0.5rem 0 0 0;
`;

// Options d'export
export const ExportOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// Titre des options d'export
export const ExportOptionsTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;

  svg {
    color: ${({ theme }) => theme.colors.info.main};
  }
`;

// Grille des options d'export
export const ExportOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

// Carte d'option d'export
export const ExportOptionCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    transform: translateY(-2px);
  }
`;

// Titre d'option d'export
export const ExportOptionTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;

  svg {
    color: ${({ theme }) => theme.colors.info.main};
  }
`;

// Description d'option d'export
export const ExportOptionDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

// Message d'information
export const InfoMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.info.light};
  color: ${({ theme }) => theme.colors.info.dark};
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;

  svg {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.info.main};
  }
`;

// Bouton de génération automatique
export const AutoGenButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary.main},
    ${({ theme }) => theme.colors.secondary.main}
  );
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);

  svg {
    font-size: 1.2rem;
  }

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }
`;

// Carte de contrainte
export const ConstraintCard = styled.div`
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
`;

// Titre de contrainte
export const ConstraintTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 1rem 0;

  svg {
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

// Grille d'options
export const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
`;

// Carte d'option
export const OptionCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  border: 2px solid
    ${({ selected, theme }) =>
      selected ? theme.colors.success.main : "transparent"};
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

// Titre d'option
export const OptionTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

// Description d'option
export const OptionDescription = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

// Champ de saisie de formulaire
export const FormInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 0.25rem;
  background-color: ${({ theme }) => theme.colors.background.primary};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
  width: 100%;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;
