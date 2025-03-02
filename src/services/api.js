import { API_ROUTES, apiRequest } from "../config/api";

export const AuthService = {
  login: async (email, password) => {
    return apiRequest(API_ROUTES.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    return apiRequest(API_ROUTES.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    return apiRequest(API_ROUTES.AUTH.LOGOUT, {
      method: "POST",
    });
  },

  getCurrentUser: async () => {
    return apiRequest(API_ROUTES.AUTH.ME);
  },
};

export const EmployeeService = {
  getAll: async () => {
    return apiRequest(API_ROUTES.EMPLOYEES.BASE);
  },

  getById: async (id) => {
    return apiRequest(API_ROUTES.EMPLOYEES.DETAIL(id));
  },

  create: async (employeeData) => {
    return apiRequest(API_ROUTES.EMPLOYEES.BASE, {
      method: "POST",
      body: JSON.stringify(employeeData),
    });
  },

  update: async (id, employeeData) => {
    return apiRequest(API_ROUTES.EMPLOYEES.DETAIL(id), {
      method: "PUT",
      body: JSON.stringify(employeeData),
    });
  },

  delete: async (id) => {
    return apiRequest(API_ROUTES.EMPLOYEES.DETAIL(id), {
      method: "DELETE",
    });
  },
};

export const VacationService = {
  getAll: async () => {
    return apiRequest(API_ROUTES.VACATIONS.BASE);
  },

  getById: async (id) => {
    return apiRequest(API_ROUTES.VACATIONS.DETAIL(id));
  },

  create: async (vacationData) => {
    return apiRequest(API_ROUTES.VACATIONS.BASE, {
      method: "POST",
      body: JSON.stringify(vacationData),
    });
  },

  update: async (id, vacationData) => {
    return apiRequest(API_ROUTES.VACATIONS.DETAIL(id), {
      method: "PUT",
      body: JSON.stringify(vacationData),
    });
  },

  delete: async (id) => {
    return apiRequest(API_ROUTES.VACATIONS.DETAIL(id), {
      method: "DELETE",
    });
  },
};

export const PlanningService = {
  getAll: async () => {
    return apiRequest(API_ROUTES.PLANNING.BASE);
  },

  getById: async (id) => {
    return apiRequest(API_ROUTES.PLANNING.DETAIL(id));
  },

  create: async (eventData) => {
    return apiRequest(API_ROUTES.PLANNING.BASE, {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  },

  update: async (id, eventData) => {
    return apiRequest(API_ROUTES.PLANNING.DETAIL(id), {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
  },

  delete: async (id) => {
    return apiRequest(API_ROUTES.PLANNING.DETAIL(id), {
      method: "DELETE",
    });
  },
};

export const StatsService = {
  getOverview: async () => {
    return apiRequest(API_ROUTES.STATS.OVERVIEW);
  },

  getEmployeeStats: async () => {
    return apiRequest(API_ROUTES.STATS.EMPLOYEES);
  },

  getVacationStats: async () => {
    return apiRequest(API_ROUTES.STATS.VACATIONS);
  },

  getPlanningStats: async () => {
    return apiRequest(API_ROUTES.STATS.PLANNING);
  },
};
