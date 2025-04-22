// branchService.js
import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/Branch`; // Assuming your BranchController is under /api/Branch

const branchService = {
  addBranch: async (branchData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/add`, branchData);
      return response.data;
    } catch (error) {
      console.error("Error adding branch:", error);
      throw error.response?.data || error.message || "Failed to add branch";
    }
  },

  editBranch: async (id, branchData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/edit/${id}`,
        branchData
      );
      return response.data;
    } catch (error) {
      console.error(`Error editing branch with ID ${id}:`, error);
      throw error.response?.data || error.message || "Failed to edit branch";
    }
  },

  activateBranch: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/activate/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error activating branch with ID ${id}:`, error);
      throw (
        error.response?.data || error.message || "Failed to activate branch"
      );
    }
  },

  deactivateBranch: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/deactivate/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deactivating branch with ID ${id}:`, error);
      throw (
        error.response?.data || error.message || "Failed to deactivate branch"
      );
    }
  },

  deleteBranch: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting branch with ID ${id}:`, error);
      throw error.response?.data || error.message || "Failed to delete branch";
    }
  },

  getAllBranches: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all branches:", error);
      throw error.response?.data || error.message || "Failed to fetch branches";
    }
  },

  getBranchById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching branch with ID ${id}:`, error);
      throw error.response?.data || error.message || "Failed to fetch branch";
    }
  },

  // You can add more functions here if your BranchController expands
};

export default branchService;
