import { useState, useEffect, useRef } from "react";
import styled from "styled-components";

// Composants stylisés
const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: ${({ expanded }) => (expanded ? "600px" : "300px")};
  transition: max-width 0.3s ease;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid
    ${({ theme, focused }) =>
      focused ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 0.5rem 1rem;
  box-shadow: ${({ theme, focused }) =>
    focused ? `0 0 0 2px ${theme.colors.primary}22` : "none"};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme, focused }) =>
      focused ? theme.colors.primary : `${theme.colors.primary}88`};
  }
`;

const SearchIcon = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  padding: 0.25rem 0;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.disabled};
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 0.5rem;
  border-radius: 50%;
  display: ${({ visible }) => (visible ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const AdvancedButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  transform: ${({ expanded }) => (expanded ? "rotate(180deg)" : "rotate(0)")};

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.large};
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
  display: ${({ visible }) => (visible ? "block" : "none")};
`;

const ResultGroup = styled.div`
  padding: 0.5rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const ResultGroupTitle = styled.div`
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ResultItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
  }
`;

const ResultIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme, color }) =>
    color ? `${color}22` : `${theme.colors.primary}22`};
  color: ${({ theme, color }) => color || theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`;

const ResultContent = styled.div`
  flex: 1;
`;

const ResultTitle = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const ResultDescription = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const HighlightedText = styled.span`
  background-color: ${({ theme }) => `${theme.colors.primary}33`};
  color: ${({ theme }) => theme.colors.primary};
  padding: 0 0.25rem;
  border-radius: 2px;
`;

const NoResults = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AdvancedFilters = styled.div`
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-top: 0.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  display: ${({ visible }) => (visible ? "block" : "none")};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ primary, theme }) =>
    primary
      ? `
    background-color: ${theme.colors.primary};
    color: white;
    border: 1px solid ${theme.colors.primary};
    
    &:hover {
      background-color: ${theme.colors.primary}dd;
    }
  `
      : `
    background-color: transparent;
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border};
    
    &:hover {
      background-color: ${theme.colors.background};
      border-color: ${theme.colors.text.secondary};
    }
  `}
`;

// Icônes
const SearchSvg = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClearSvg = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronSvg = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 9L12 16L5 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Données fictives pour les résultats de recherche
const getSearchResults = (query, filters) => {
  if (!query) return [];

  const employees = [
    {
      id: 1,
      type: "employee",
      name: "Sophie Martin",
      role: "Designer",
      icon: "👩‍🎨",
      color: "#4F46E5",
    },
    {
      id: 2,
      type: "employee",
      name: "Thomas Dubois",
      role: "Développeur",
      icon: "👨‍💻",
      color: "#4F46E5",
    },
    {
      id: 3,
      type: "employee",
      name: "Julie Lefebvre",
      role: "Marketing",
      icon: "👩‍💼",
      color: "#4F46E5",
    },
    {
      id: 4,
      type: "employee",
      name: "Nicolas Moreau",
      role: "Comptable",
      icon: "👨‍💼",
      color: "#4F46E5",
    },
  ];

  const events = [
    {
      id: 1,
      type: "event",
      name: "Réunion d'équipe",
      date: "15 Mars 2023",
      icon: "📅",
      color: "#10B981",
    },
    {
      id: 2,
      type: "event",
      name: "Présentation client",
      date: "22 Mars 2023",
      icon: "📊",
      color: "#10B981",
    },
    {
      id: 3,
      type: "event",
      name: "Formation Excel",
      date: "5 Avril 2023",
      icon: "📚",
      color: "#10B981",
    },
  ];

  const vacations = [
    {
      id: 1,
      type: "vacation",
      name: "Congés d'été",
      employee: "Sophie Martin",
      icon: "🏖️",
      color: "#F59E0B",
    },
    {
      id: 2,
      type: "vacation",
      name: "RTT",
      employee: "Thomas Dubois",
      icon: "🏖️",
      color: "#F59E0B",
    },
    {
      id: 3,
      type: "vacation",
      name: "Congé maladie",
      employee: "Julie Lefebvre",
      icon: "🏖️",
      color: "#F59E0B",
    },
  ];

  // Filtrer les résultats en fonction de la requête
  const lowercaseQuery = query.toLowerCase();

  let filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(lowercaseQuery) ||
      employee.role.toLowerCase().includes(lowercaseQuery)
  );

  let filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(lowercaseQuery) ||
      event.date.toLowerCase().includes(lowercaseQuery)
  );

  let filteredVacations = vacations.filter(
    (vacation) =>
      vacation.name.toLowerCase().includes(lowercaseQuery) ||
      vacation.employee.toLowerCase().includes(lowercaseQuery)
  );

  // Appliquer les filtres avancés
  if (filters.type !== "all") {
    if (filters.type === "employees") {
      filteredEvents = [];
      filteredVacations = [];
    } else if (filters.type === "events") {
      filteredEmployees = [];
      filteredVacations = [];
    } else if (filters.type === "vacations") {
      filteredEmployees = [];
      filteredEvents = [];
    }
  }

  // Regrouper les résultats
  const results = [];

  if (filteredEmployees.length > 0) {
    results.push({
      title: "Employés",
      items: filteredEmployees,
    });
  }

  if (filteredEvents.length > 0) {
    results.push({
      title: "Événements",
      items: filteredEvents,
    });
  }

  if (filteredVacations.length > 0) {
    results.push({
      title: "Congés",
      items: filteredVacations,
    });
  }

  return results;
};

// Composant principal
const SearchBar = ({ placeholder = "Rechercher...", onSearch }) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    type: "all",
    date: "all",
    status: "all",
  });

  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Gérer les clics en dehors du composant
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setFocused(false);
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mettre à jour les résultats lorsque la requête ou les filtres changent
  useEffect(() => {
    if (query.length > 0) {
      const searchResults = getSearchResults(query, filters);
      setResults(searchResults);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query, filters]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    setFocused(true);
    if (query.length > 0) {
      setShowResults(true);
    }
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current.focus();
  };

  const toggleAdvanced = () => {
    setExpanded(!expanded);
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const resetFilters = () => {
    setFilters({
      type: "all",
      date: "all",
      status: "all",
    });
  };

  const handleResultClick = (item) => {
    if (onSearch) {
      onSearch(item);
    }
    setShowResults(false);
  };

  // Mettre en surbrillance les termes de recherche
  const highlightText = (text, query) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <HighlightedText key={index}>{part}</HighlightedText>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef}>
      <SearchContainer expanded={expanded}>
        <SearchInputWrapper focused={focused}>
          <SearchIcon>
            <SearchSvg />
          </SearchIcon>
          <SearchInput
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
          />
          <ClearButton
            visible={query.length > 0}
            onClick={handleClear}
            aria-label="Effacer la recherche"
          >
            <ClearSvg />
          </ClearButton>
          <AdvancedButton
            expanded={expanded}
            onClick={toggleAdvanced}
            aria-label="Recherche avancée"
          >
            <ChevronSvg />
          </AdvancedButton>
        </SearchInputWrapper>

        <AdvancedFilters visible={showFilters}>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel htmlFor="type">Type</FilterLabel>
              <FilterSelect
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="all">Tous</option>
                <option value="employees">Employés</option>
                <option value="events">Événements</option>
                <option value="vacations">Congés</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel htmlFor="date">Date</FilterLabel>
              <FilterSelect
                id="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel htmlFor="status">Statut</FilterLabel>
              <FilterSelect
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="pending">En attente</option>
                <option value="completed">Terminé</option>
              </FilterSelect>
            </FilterGroup>
          </FiltersGrid>

          <FilterActions>
            <FilterButton onClick={resetFilters}>Réinitialiser</FilterButton>
            <FilterButton primary>Appliquer</FilterButton>
          </FilterActions>
        </AdvancedFilters>

        <SearchResults visible={showResults && results.length > 0}>
          {results.map((group, groupIndex) => (
            <ResultGroup key={groupIndex}>
              <ResultGroupTitle>{group.title}</ResultGroupTitle>
              {group.items.map((item, itemIndex) => (
                <ResultItem
                  key={`${groupIndex}-${itemIndex}`}
                  onClick={() => handleResultClick(item)}
                >
                  <ResultIcon color={item.color}>{item.icon}</ResultIcon>
                  <ResultContent>
                    <ResultTitle>{highlightText(item.name, query)}</ResultTitle>
                    <ResultDescription>
                      {item.type === "employee" &&
                        highlightText(item.role, query)}
                      {item.type === "event" && highlightText(item.date, query)}
                      {item.type === "vacation" &&
                        highlightText(item.employee, query)}
                    </ResultDescription>
                  </ResultContent>
                </ResultItem>
              ))}
            </ResultGroup>
          ))}
        </SearchResults>

        {showResults && query.length > 0 && results.length === 0 && (
          <SearchResults visible={true}>
            <NoResults>Aucun résultat trouvé pour "{query}"</NoResults>
          </SearchResults>
        )}
      </SearchContainer>
    </div>
  );
};

export default SearchBar;
