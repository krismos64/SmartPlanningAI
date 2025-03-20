import axios from "axios";
import { getCSRFToken } from "../config/api";

class WeeklyScheduleService {
  static async getSchedules(startDate) {
    try {
      const csrfToken = getCSRFToken();
      const response = await axios.get("/api/schedules", {
        params: { start_date: startDate },
        headers: {
          "X-CSRF-TOKEN": csrfToken,
        },
      });
      return response;
    } catch (error) {
      console.error("Error fetching schedules:", error);
      throw error;
    }
  }

  static async getScheduleById(id) {
    try {
      const csrfToken = getCSRFToken();
      const response = await axios.get(`/api/schedules/${id}`, {
        headers: {
          "X-CSRF-TOKEN": csrfToken,
        },
      });
      return response;
    } catch (error) {
      console.error(`Error fetching schedule ${id}:`, error);
      throw error;
    }
  }

  static async createSchedule(scheduleData) {
    try {
      const csrfToken = getCSRFToken();
      const response = await axios.post("/api/schedules", scheduleData, {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
      });
      return response;
    } catch (error) {
      console.error("Error creating schedule:", error);
      throw error;
    }
  }

  static async updateSchedule(id, scheduleData) {
    try {
      const csrfToken = getCSRFToken();
      const response = await axios.put(`/api/schedules/${id}`, scheduleData, {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
      });
      return response;
    } catch (error) {
      console.error(`Error updating schedule ${id}:`, error);
      throw error;
    }
  }

  static async deleteSchedule(id) {
    try {
      const csrfToken = getCSRFToken();
      const response = await axios.delete(`/api/schedules/${id}`, {
        headers: {
          "X-CSRF-TOKEN": csrfToken,
        },
      });
      return response;
    } catch (error) {
      console.error(`Error deleting schedule ${id}:`, error);
      throw error;
    }
  }

  static async generateSchedule(generateOptions) {
    try {
      const csrfToken = getCSRFToken();
      const response = await axios.post(
        "/api/schedules/generate",
        generateOptions,
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error generating schedule:", error);
      throw error;
    }
  }
}

export default WeeklyScheduleService;
