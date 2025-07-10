import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

const staffService = {
  createStaff: async (staffData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Staff/create-staff`,
        staffData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating staff:", error);
      throw error.response?.data || error.message || "Failed to create staff";
    }
  },

  deactivateStaff: async (staffCode) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Staff/deactivate-staff`,
        { staffCode }
      );
      return response.data;
    } catch (error) {
      console.error("Error deactivating staff:", error);
      throw (
        error.response?.data || error.message || "Failed to deactivate staff"
      );
    }
  },

  activateStaff: async (staffCode) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Staff/activate-staff`,
        { staffCode }
      );
      return response.data;
    } catch (error) {
      console.error("Error activating staff:", error);
      throw error.response?.data || error.message || "Failed to activate staff";
    }
  },

  deleteStaff: async (staffCode) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/Staff/delete-staff`,
        { data: { staffCode } }
      ); // Axios delete with body requires 'data'
      return response.data;
    } catch (error) {
      console.error("Error deleting staff:", error);
      throw error.response?.data || error.message || "Failed to delete staff";
    }
  },

  getStaffs: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Staff/get-allstaffs`);
      console.log("API Response:", response.data.staffs); // Debugging
      return response.data.staffs; // ✅ Return only the array
    } catch (error) {
      console.error("Error fetching staffs:", error);
      throw error.response?.data || error.message || "Failed to fetch staffs";
    }
  },

  editStaff: async (staffData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/Staff/edit-staff`,
        staffData
      );
      return response.data;
    } catch (error) {
      console.error("Error editing staff:", error);
      throw error.response?.data || error.message || "Failed to edit staff";
    }
  },

  getStaff: async (staffCode) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Staff/get-staff/${staffCode}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching staff with code ${staffCode}:`, error);
      throw error.response?.data || error.message || "Failed to fetch staff";
    }
  },
};

export default staffService;
