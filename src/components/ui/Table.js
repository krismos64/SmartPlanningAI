import React, { useState } from "react";
import styled, { css } from "styled-components";
import { fadeIn, slideInUp } from "../../styles/animations";

// Icônes pour le tri
const SortIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 3V13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 7L8 3L12 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SortAscIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 3V13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 7L8 3L12 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SortDescIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 13V3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 9L8 13L12 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Composants stylisés
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  background-color: ${({ theme }) => theme.colors.surface};
  animation: ${fadeIn} 0.3s ease-in-out;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => `${theme.colors.primary}66`};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => `${theme.colors.primary}99`};
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => `${theme.colors.background}`};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableHeadCell = styled.th`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  text-align: left;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
  transition: all 0.2s ease;

  ${({ $sortable }) =>
    $sortable &&
    css`
      cursor: pointer;
      user-select: none;

      &:hover {
        color: ${({ theme }) => theme.colors.primary};
        background-color: ${({ theme }) => `${theme.colors.primary}11`};
      }
    `}

  ${({ $sorted, $direction, theme }) =>
    $sorted &&
    css`
      color: ${theme.colors.primary};
      background-color: ${`${theme.colors.primary}11`};
    `}
`;

const SortIconContainer = styled.span`
  display: inline-flex;
  margin-left: ${({ theme }) => theme.spacing.xs};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "inherit"};
  transition: transform 0.2s ease;

  ${({ $direction }) =>
    $direction === "desc" &&
    css`
      transform: rotate(180deg);
    `}
`;

const TableBody = styled.tbody`
  & tr:nth-child(even) {
    background-color: ${({ theme }) => `${theme.colors.background}66`};
  }
`;

const TableRow = styled.tr`
  transition: all 0.2s ease;
  animation: ${slideInUp} 0.3s ease-in-out;
  animation-delay: ${({ $index }) => `${$index * 0.05}s`};

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
  }

  ${({ $clickable }) =>
    $clickable &&
    css`
      cursor: pointer;
    `}

  ${({ $selected, theme }) =>
    $selected &&
    css`
      background-color: ${`${theme.colors.primary}22`} !important;
      border-left: 3px solid ${theme.colors.primary};
    `}
`;

const TableCell = styled.td`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s ease;

  ${({ $align }) =>
    $align &&
    css`
      text-align: ${$align};
    `}
`;

const TableFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $active }) =>
    $active ? `${theme.colors.primary}22` : "transparent"};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.text.secondary};
  font-weight: ${({ theme, $active }) =>
    $active
      ? theme.typography.fontWeights.semiBold
      : theme.typography.fontWeights.regular};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme, $active }) =>
      $active ? `${theme.colors.primary}33` : `${theme.colors.primary}11`};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: ${({ theme }) => theme.colors.border};
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text.disabled};

    &:hover {
      background-color: transparent;
      border-color: ${({ theme }) => theme.colors.border};
      color: ${({ theme }) => theme.colors.text.disabled};
    }
  }
`;

const PageInfo = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

const RowsPerPage = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

const Select = styled.select`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}33`};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg}`};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => `${theme.colors.text.disabled}`};
  }

  h4 {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    max-width: 300px;
    margin: 0 auto;
  }
`;

// Composant Table
const Table = ({
  columns,
  data,
  onRowClick,
  selectedRow,
  pagination = true,
  initialSortBy = null,
  initialSortDirection = "asc",
  emptyStateTitle = "Aucune donnée",
  emptyStateMessage = "Il n'y a aucune donnée à afficher pour le moment.",
}) => {
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Gérer le tri
  const handleSort = (column) => {
    if (!column.sortable) return;

    if (sortBy === column.key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column.key);
      setSortDirection("asc");
    }
  };

  // Trier les données
  const sortedData = React.useMemo(() => {
    if (!sortBy) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortBy, sortDirection]);

  // Paginer les données
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData;

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, page, rowsPerPage, pagination]);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  // Gérer le changement de page
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Gérer le changement du nombre de lignes par page
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  // Rendu de l'icône de tri
  const renderSortIcon = (column) => {
    if (!column.sortable) return null;

    if (sortBy !== column.key) {
      return (
        <SortIconContainer $active={false}>
          <SortIcon />
        </SortIconContainer>
      );
    }

    return (
      <SortIconContainer $active={true} $direction={sortDirection}>
        {sortDirection === "asc" ? <SortAscIcon /> : <SortDescIcon />}
      </SortIconContainer>
    );
  };

  // Rendu de l'état vide
  const renderEmptyState = () => (
    <EmptyState>
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 3H5C3.89543 3 3 3.89543 3 5V9M9 3H15M9 3V5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5V3M15 3H19C20.1046 3 21 3.89543 21 5V9M21 9V15M21 9H19C17.8954 9 17 9.89543 17 11V13C17 14.1046 17.8954 15 19 15H21M21 15V19C21 20.1046 20.1046 21 19 21H15M15 21H9M15 21V19C15 17.8954 14.1046 17 13 17H11C9.89543 17 9 17.8954 9 19V21M9 21H5C3.89543 21 3 20.1046 3 19V15M3 15V9M3 15H5C6.10457 15 7 14.1046 7 13V11C7 9.89543 6.10457 9 5 9H3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h4>{emptyStateTitle}</h4>
      <p>{emptyStateMessage}</p>
    </EmptyState>
  );

  return (
    <TableContainer>
      <StyledTable>
        <TableHead>
          <tr>
            {columns.map((column) => (
              <TableHeadCell
                key={column.key}
                $sortable={column.sortable}
                $sorted={sortBy === column.key}
                $direction={sortDirection}
                onClick={() => column.sortable && handleSort(column)}
                style={{ width: column.width || "auto" }}
              >
                {column.label}
                {column.sortable && renderSortIcon(column)}
              </TableHeadCell>
            ))}
          </tr>
        </TableHead>

        {data.length > 0 ? (
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow
                key={row.id || index}
                $index={index}
                $clickable={!!onRowClick}
                $selected={selectedRow && selectedRow.id === row.id}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={`${row.id || index}-${column.key}`}
                    $align={column.align}
                  >
                    {column.render
                      ? column.render(row)
                      : row[column.key] !== undefined
                      ? row[column.key]
                      : "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        ) : null}
      </StyledTable>

      {data.length === 0 && renderEmptyState()}

      {pagination && data.length > 0 && (
        <TableFooter>
          <RowsPerPage>
            <span>Lignes par page:</span>
            <Select value={rowsPerPage} onChange={handleRowsPerPageChange}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Select>
          </RowsPerPage>

          <Pagination>
            <PageButton
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
            >
              &laquo;
            </PageButton>
            <PageButton
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              &lsaquo;
            </PageButton>

            <PageInfo>
              {page} sur {totalPages}
            </PageInfo>

            <PageButton
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              &rsaquo;
            </PageButton>
            <PageButton
              onClick={() => handlePageChange(totalPages)}
              disabled={page === totalPages}
            >
              &raquo;
            </PageButton>
          </Pagination>
        </TableFooter>
      )}
    </TableContainer>
  );
};

export default Table;
