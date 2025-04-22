// roleService.js
import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/Role`; // Assuming your RoleController is under /api/Role

const roleService = {
  createRole: async (roleData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/create-role`,
        roleData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating role:", error);
      throw error.response?.data || error.message || "Failed to create role";
    }
  },

  getAllRoles: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all roles:", error);
      throw error.response?.data || error.message || "Failed to fetch roles";
    }
  },

  getRoleById: async (roleId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${roleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching role with ID ${roleId}:`, error);
      throw error.response?.data || error.message || "Failed to fetch role";
    }
  },

  updateRole: async (roleId, roleData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/update-role/${roleId}`,
        roleData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating role with ID ${roleId}:`, error);
      throw error.response?.data || error.message || "Failed to update role";
    }
  },

  deleteRole: async (roleId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/delete/${roleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting role with ID ${roleId}:`, error);
      throw error.response?.data || error.message || "Failed to delete role";
    }
  },

  getAllPrivileges: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/privileges/all`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all privileges:", error);
      throw (
        error.response?.data || error.message || "Failed to fetch privileges"
      );
    }
  },

  // You can add more functions here if your RoleController expands
};

export default roleService;
