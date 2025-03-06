export const EmployeeName = ({ employee }) => {
  const first_name = employee?.first_name || "";
  const last_name = employee?.last_name || "";
  return `${first_name} ${last_name}`.trim() || "Nom inconnu";
};

export const getEmployeeFullName = (employee) => {
  const first_name = employee?.first_name || "";
  const last_name = employee?.last_name || "";
  return `${first_name} ${last_name}`.trim() || "Nom inconnu";
};

export const getEmployeeInitials = (employee) => {
  const first_name = employee?.first_name || "";
  const last_name = employee?.last_name || "";
  if (first_name && last_name) {
    return `${first_name[0]}${last_name[0]}`.toUpperCase();
  }
  return "??";
};

export const filterEmployeesByName = (employees, query) => {
  if (!query) return employees;
  query = query.toLowerCase();
  return employees.filter((emp) => {
    const first_name = emp?.first_name || "";
    const last_name = emp?.last_name || "";
    return (
      first_name.toLowerCase().includes(query) ||
      last_name.toLowerCase().includes(query)
    );
  });
};
