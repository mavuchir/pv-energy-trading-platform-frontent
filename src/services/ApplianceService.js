import api from "./api";

const applianceService = {
  // Get all appliances
  getAppliances: async (householdId) => {
    try {
      const params = householdId ? { household_id: householdId } : {};
      const response = await api.get("/appliance/", { params });
      return { success: true, appliances: response.data.appliances || [] };
    } catch (error) {
      console.error("Error fetching appliances:", error);
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch appliances",
      };
    }
  },

  // Get a single appliance
  getAppliance: async (id) => {
    try {
      const response = await api.get(`/appliance/${id}`);
      return { success: true, appliance: response.data };
    } catch (error) {
      console.error(`Error fetching appliance ${id}:`, error);
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch appliance",
      };
    }
  },

  // Create a new appliance
  createAppliance: async (applianceData) => {
    try {
      const response = await api.post("/appliance/", applianceData);
      return { success: true, appliance: response.data.appliance };
    } catch (error) {
      console.error("Error creating appliance:", error);
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to create appliance",
      };
    }
  },

  // Update an appliance
  updateAppliance: async (id, applianceData) => {
    try {
      const response = await api.put(`/appliance/${id}`, applianceData);
      return { success: true, appliance: response.data.appliance };
    } catch (error) {
      console.error(`Error updating appliance ${id}:`, error);
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to update appliance",
      };
    }
  },

  // Delete an appliance
  deleteAppliance: async (id) => {
    try {
      const response = await api.delete(`/appliance/${id}`);
      return { success: true, message: response.data.msg };
    } catch (error) {
      console.error(`Error deleting appliance ${id}:`, error);
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to delete appliance",
      };
    }
  },

  // Update appliance status (on/off/standby)
  updateApplianceStatus: async (id, status) => {
    try {
      const response = await api.put(`/appliance/${id}/status`, { status });
      return { success: true, appliance: response.data.appliance };
    } catch (error) {
      console.error(`Error updating appliance ${id} status:`, error);
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to update appliance status",
      };
    }
  },

  // Set appliance schedule
  setApplianceSchedule: async (id, schedule) => {
    try {
      const response = await api.put(`/appliance/${id}/schedule`, { schedule });
      return { success: true, appliance: response.data.appliance };
    } catch (error) {
      console.error(`Error setting schedule for appliance ${id}:`, error);
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to set appliance schedule",
      };
    }
  },

  // Get appliance consumption history
  getApplianceConsumption: async (id, startDate, endDate) => {
    try {
      let url = `/energy/consumption?appliance_id=${id}`;
      if (startDate) url += `&start_date=${startDate.toISOString()}`;
      if (endDate) url += `&end_date=${endDate.toISOString()}`;

      const response = await api.get(url);
      return { success: true, data: response.data.consumptions || [] };
    } catch (error) {
      console.error(`Error fetching consumption for appliance ${id}:`, error);
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch appliance consumption",
      };
    }
  },
};

export default applianceService;