import { useEffect, useRef, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiSun,
  FiUser,
  FiX,
  FiXCircle,
} from "react-icons/fi";
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

// Fonction de recherche par défaut (utilisée uniquement si customGetResults n'est pas fourni)
const getSearchResults = (query) => {
  // Cette fonction est un placeholder et ne sera utilisée que si customGetResults n'est pas fourni
  return [];
};

// Composant principal
const SearchBar = ({
  placeholder = "Rechercher...",
  onSearch,
  initialResults = [],
  customGetResults,
}) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(initialResults);

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

  // Mettre à jour les résultats lorsque la requête change
  useEffect(() => {
    if (query.length > 1) {
      if (customGetResults) {
        // Utiliser la fonction personnalisée si fournie
        onSearch(query);
      } else {
        // Utiliser la fonction par défaut
        const searchResults = getSearchResults(query);
        setResults(searchResults);
      }
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query, customGetResults, onSearch]);

  // Mettre à jour les résultats lorsque initialResults change
  useEffect(() => {
    if (initialResults && initialResults.length > 0) {
      setResults(initialResults);
      if (query.length > 1) {
        setShowResults(true);
      }
    }
  }, [initialResults, query]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    setFocused(true);
    if (query.length > 1) {
      setShowResults(true);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current.focus();
  };

  const handleResultClick = (item) => {
    if (onSearch) {
      onSearch(item);
    }
    setShowResults(false);
  };

  // Mettre en surbrillance les termes de recherche
  const highlightText = (text, query) => {
    if (!query || !text) return text;

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
      <SearchContainer>
        <SearchInputWrapper focused={focused ? "true" : undefined}>
          <SearchIcon>
            <FiSearch />
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
            visible={query.length > 0 ? "true" : undefined}
            onClick={handleClear}
            aria-label="Effacer la recherche"
          >
            <FiX />
          </ClearButton>
        </SearchInputWrapper>

        <SearchResults
          visible={showResults && results.length > 0 ? "true" : undefined}
        >
          {results.length === 0 ? (
            <NoResults>Aucun résultat trouvé pour "{query}"</NoResults>
          ) : (
            results.map((group, groupIndex) => (
              <ResultGroup key={groupIndex}>
                <ResultGroupTitle>{group.title}</ResultGroupTitle>
                {group.items.map((item, itemIndex) => (
                  <ResultItem
                    key={itemIndex}
                    onClick={() => handleResultClick(item)}
                  >
                    <ResultIcon color={item.color}>
                      {item.type === "employee" ? (
                        <FiUser />
                      ) : item.type === "vacation" ? (
                        <FiSun />
                      ) : (
                        <FiCalendar />
                      )}
                    </ResultIcon>
                    <ResultContent>
                      <ResultTitle>
                        {highlightText(item.name, query)}
                        {item.status && (
                          <span style={{ marginLeft: "8px" }}>
                            {item.status === "approved" ? (
                              <FiCheckCircle color="#10B981" />
                            ) : item.status === "rejected" ? (
                              <FiXCircle color="#EF4444" />
                            ) : (
                              <FiClock color="#F59E0B" />
                            )}
                          </span>
                        )}
                      </ResultTitle>
                      <ResultDescription>
                        {item.type === "employee"
                          ? item.role
                          : item.type === "vacation"
                          ? `${item.employee} (${item.dates})`
                          : item.date}
                      </ResultDescription>
                    </ResultContent>
                  </ResultItem>
                ))}
              </ResultGroup>
            ))
          )}
        </SearchResults>
      </SearchContainer>
    </div>
  );
};

export default SearchBar;
