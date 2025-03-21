import axios from "axios";
import { getCSRFToken } from "../config/api";

class DepartmentService {
  static async getDepartments() {
    try {
      const csrfToken = getCSRFToken();
      const response = await axios.get("/api/departments", {
        headers: {
          "X-CSRF-TOKEN": csrfToken,
        },
      });
      return {
        ...response,
        data: response.data.data || response.data,
        success: response.data.success,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  }

  static async getDepartment(id) {
    try {
      const csrfToken = getCSRFToken();
      const response = await axios.get(`/api/departments/${id}`, {
        headers: {
          "X-CSRF-TOKEN": csrfToken,
        },
      });
      return {
        ...response,
        data: response.data.data || response.data,
        success: response.data.success,
        message: response.data.message,
      };
    } catch (error) {
      console.error(`Error fetching department ${id}:`, error);
      throw error;
    }
  }

  static async createDepartment(departmentData) {
    try {
      const csrfToken = getCSRFToken();
      const response = await axios.post("/api/departments", departmentData, {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
      });
      return {
        ...response,
        data: response.data.data || response.data,
        success: response.data.success,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error creating department:", error);
      throw error;
    }
  }

  static async updateDepartment(id, departmentData) {
    try {
      const csrfToken = getCSRFToken();
      const response = await axios.put(
        `/api/departments/${id}`,
        departmentData,
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
          },
        }
      );
      return {
        ...response,
        data: response.data.data || response.data,
        success: response.data.success,
        message: response.data.message,
      };
    } catch (error) {
      console.error(`Error updating department ${id}:`, error);
      throw error;
    }
  }

  static async deleteDepartment(id) {
    try {
      const csrfToken = getCSRFToken();
      const response = await axios.delete(`/api/departments/${id}`, {
        headers: {
          "X-CSRF-TOKEN": csrfToken,
        },
      });
      return {
        ...response,
        data: response.data.data || response.data,
        success: response.data.success,
        message: response.data.message,
      };
    } catch (error) {
      console.error(`Error deleting department ${id}:`, error);
      throw error;
    }
  }
}

export default DepartmentService;
