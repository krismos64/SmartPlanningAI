import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";

// Composants stylisés
const TableContainer = styled.div`
  width: 100%;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TableTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const TableActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 0.5rem 0.75rem;
  width: 250px;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}22`};
  }

  svg {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-right: 0.5rem;
  }

  input {
    border: none;
    background: none;
    outline: none;
    width: 100%;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.primary};

    &::placeholder {
      color: ${({ theme }) => theme.colors.text.disabled};
    }
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${({ theme, active }) =>
    active ? `${theme.colors.primary}11` : "transparent"};
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme, active }) =>
      active ? `${theme.colors.primary}22` : `${theme.colors.background}`};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const THead = styled.thead`
  background-color: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Th = styled.th`
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: ${({ sortable }) => (sortable ? "pointer" : "default")};
  user-select: none;
  white-space: nowrap;

  &:hover {
    color: ${({ theme, sortable }) =>
      sortable ? theme.colors.primary : theme.colors.text.secondary};
  }
`;

const SortIcon = styled.span`
  display: inline-flex;
  margin-left: 0.5rem;
  transition: transform 0.2s ease;
  transform: ${({ direction }) =>
    direction === "desc" ? "rotate(180deg)" : "rotate(0deg)"};
  opacity: ${({ active }) => (active ? 1 : 0.3)};
`;

const TBody = styled.tbody`
  & tr:nth-child(even) {
    background-color: ${({ theme }) => `${theme.colors.background}55`};
  }
`;

const Tr = styled.tr`
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
  }
`;

const Td = styled.td`
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  background-color: ${({ theme, status }) => {
    switch (status) {
      case "active":
        return `${theme.colors.success}22`;
      case "pending":
        return `${theme.colors.warning}22`;
      case "inactive":
        return `${theme.colors.error}22`;
      default:
        return `${theme.colors.text.disabled}22`;
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case "active":
        return theme.colors.success;
      case "pending":
        return theme.colors.warning;
      case "inactive":
        return theme.colors.error;
      default:
        return theme.colors.text.disabled;
    }
  }};
`;

const HourCounter = styled.span`
  display: inline-flex;
  align-items: center;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme, value }) => {
    if (value > 0) return theme.colors.success;
    if (value < 0) return theme.colors.error;
    return theme.colors.text.primary;
  }};
`;

const TableFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const PageInfo = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, active }) =>
    active ? `${theme.colors.primary}11` : "transparent"};
  color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.text.primary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme, active }) =>
      active ? `${theme.colors.primary}22` : `${theme.colors.background}`};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 1rem;
    color: ${({ theme }) => `${theme.colors.text.disabled}66`};
  }

  h3 {
    font-size: 1.25rem;
    font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    font-size: 0.875rem;
    max-width: 300px;
    margin: 0 auto;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => `${theme.colors.background}99`};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(2px);
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${({ theme }) => `${theme.colors.primary}22`};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Icônes
const SearchIcon = () => (
  <svg
    width="16"
    height="16"
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

const FilterIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 6H21M6 12H18M10 18H14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronUpIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 15L12 8L19 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 19L8 12L15 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 5L16 12L9 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EmptyIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 17H15M9 13H15M9 9H10M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Composant principal
const DataTable = ({
  title,
  data = [],
  columns = [],
  loading = false,
  pagination = true,
  pageSize = 10,
  onRowClick,
  emptyStateTitle = "Aucune donnée disponible",
  emptyStateMessage = "Il n'y a pas de données à afficher pour le moment.",
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Réinitialiser la page lorsque les données changent
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Gérer le tri des données
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filtrer et trier les données
  const filteredAndSortedData = useMemo(() => {
    // Filtrer par recherche
    let filteredData = [...data];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredData = filteredData.filter((item) => {
        return columns.some((column) => {
          const value = column.accessor(item);
          return (
            value &&
            value.toString().toLowerCase().includes(lowerCaseSearchTerm)
          );
        });
      });
    }

    // Trier les données
    if (sortConfig.key) {
      const column = columns.find((col) => col.id === sortConfig.key);
      if (column) {
        filteredData.sort((a, b) => {
          const aValue = column.accessor(a);
          const bValue = column.accessor(b);

          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        });
      }
    }

    return filteredData;
  }, [data, columns, searchTerm, sortConfig]);

  // Paginer les données
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredAndSortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize, pagination]);

  // Calculer le nombre total de pages
  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    return Math.ceil(filteredAndSortedData.length / pageSize);
  }, [filteredAndSortedData, pageSize, pagination]);

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Gérer la recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Gérer les filtres
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Formater les valeurs de cellule
  const formatCellValue = (column, value) => {
    if (value === null || value === undefined) return "-";

    if (column.format) {
      return column.format(value);
    }

    if (column.type === "status") {
      return <StatusBadge status={value}>{value}</StatusBadge>;
    }

    if (column.type === "date") {
      return new Date(value).toLocaleDateString("fr-FR");
    }

    if (column.type === "number") {
      if (column.id === "hourCounter") {
        return (
          <HourCounter value={value}>
            {value > 0 ? `+${value}` : value}
          </HourCounter>
        );
      }
      return value.toString();
    }

    return value;
  };

  // Générer les boutons de pagination
  const renderPaginationButtons = () => {
    const buttons = [];

    // Bouton précédent
    buttons.push(
      <PageButton
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeftIcon />
      </PageButton>
    );

    // Première page
    if (currentPage > 3) {
      buttons.push(
        <PageButton key="1" onClick={() => handlePageChange(1)}>
          1
        </PageButton>
      );

      if (currentPage > 4) {
        buttons.push(<span key="ellipsis1">...</span>);
      }
    }

    // Pages autour de la page courante
    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      buttons.push(
        <PageButton
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </PageButton>
      );
    }

    // Dernière page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        buttons.push(<span key="ellipsis2">...</span>);
      }

      buttons.push(
        <PageButton
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </PageButton>
      );
    }

    // Bouton suivant
    buttons.push(
      <PageButton
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRightIcon />
      </PageButton>
    );

    return buttons;
  };

  return (
    <TableContainer>
      <TableHeader>
        <TableTitle>{title}</TableTitle>
        <TableActions>
          <SearchInput>
            <SearchIcon />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </SearchInput>
        </TableActions>
      </TableHeader>

      <div style={{ position: "relative", overflowX: "auto" }}>
        {loading && (
          <LoadingOverlay>
            <LoadingSpinner />
          </LoadingOverlay>
        )}

        {paginatedData.length > 0 ? (
          <Table>
            <THead>
              <tr>
                {columns.map((column) => (
                  <Th
                    key={column.id}
                    sortable={column.sortable}
                    onClick={() => column.sortable && handleSort(column.id)}
                    style={{ width: column.width }}
                  >
                    {column.header}
                    {column.sortable && (
                      <SortIcon
                        active={sortConfig.key === column.id}
                        direction={
                          sortConfig.key === column.id
                            ? sortConfig.direction
                            : "asc"
                        }
                      >
                        <ChevronUpIcon />
                      </SortIcon>
                    )}
                  </Th>
                ))}
              </tr>
            </THead>
            <TBody>
              {paginatedData.map((row, rowIndex) => (
                <Tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map((column) => (
                    <Td key={`${rowIndex}-${column.id}`}>
                      {formatCellValue(column, column.accessor(row))}
                    </Td>
                  ))}
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState>
            <EmptyIcon />
            <h3>{emptyStateTitle}</h3>
            <p>{emptyStateMessage}</p>
          </EmptyState>
        )}
      </div>

      {pagination && paginatedData.length > 0 && (
        <TableFooter>
          <PageInfo>
            Affichage de {(currentPage - 1) * pageSize + 1} à{" "}
            {Math.min(currentPage * pageSize, filteredAndSortedData.length)} sur{" "}
            {filteredAndSortedData.length} entrées
          </PageInfo>
          <Pagination>{renderPaginationButtons()}</Pagination>
        </TableFooter>
      )}
    </TableContainer>
  );
};

export default DataTable;
