// departmentService.js
import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/Department`; // Assuming your DepartmentController is under /api/Department

const departmentService = {
  addDepartment: async (departmentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/add`, departmentData);
      return response.data;
    } catch (error) {
      console.error("Error adding department:", error);
      throw error.response?.data || error.message || "Failed to add department";
    }
  },

  editDepartment: async (id, departmentData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/edit/${id}`,
        departmentData
      );
      return response.data;
    } catch (error) {
      console.error(`Error editing department with ID ${id}:`, error);
      throw (
        error.response?.data || error.message || "Failed to edit department"
      );
    }
  },

  activateDepartment: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/activate/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error activating department with ID ${id}:`, error);
      throw (
        error.response?.data || error.message || "Failed to activate department"
      );
    }
  },

  deactivateDepartment: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/deactivate/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deactivating department with ID ${id}:`, error);
      throw (
        error.response?.data ||
        error.message ||
        "Failed to deactivate department"
      );
    }
  },

  deleteDepartment: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting department with ID ${id}:`, error);
      throw (
        error.response?.data || error.message || "Failed to delete department"
      );
    }
  },

  getAllDepartments: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all departments:", error);
      throw (
        error.response?.data || error.message || "Failed to fetch departments"
      );
    }
  },

  getDepartmentById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching department with ID ${id}:`, error);
      throw (
        error.response?.data || error.message || "Failed to fetch department"
      );
    }
  },

  // You can add more functions here if your DepartmentController expands
};

export default departmentService;
