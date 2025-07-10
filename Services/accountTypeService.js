import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/account-types`;

const accountTypeService = {
  getAllAccountTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/account`);
      return response.data;
    } catch (error) {
      console.error("Error fetching deposit types:", error);
      throw (
        error.response?.data || error.message || "Failed to fetch deposit types"
      );
    }
  },
  addAccountType: async (accountTypeData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/account`,
        accountTypeData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating deposit type:", error);
      throw (
        error.response?.data || error.message || "Failed to create deposit type"
      );
    }
  },
  updateAccountType: async (type, accountTypeData, accountCode) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${accountCode}/${type}`,
        accountTypeData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating :", error);
      throw error.response?.data || error.message || "Failed to update ";
    }
  },
  deleteAccountType: async (accountCode, type) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/${accountCode}/${type}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting :", error);
      throw error.response?.data || error.message || "Failed to delete ";
    }
  },
  getAccountTypeByCode: async (accountCode, type) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${accountCode}/${type}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching  by code:", error);
      throw error.response?.data || error.message || "Failed to fetch ";
    }
  },

  //Entity Type
  getAllEntityTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equity`);
      return response.data;
    } catch (error) {
      console.error("Error fetching entity types:", error);
      throw (
        error.response?.data || error.message || "Failed to fetch entity types"
      );
    }
  },
  addEntityType: async (entityTypeData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/equity`,
        entityTypeData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating entity type:", error);
      throw (
        error.response?.data || error.message || "Failed to create entity type"
      );
    }
  },
};
export default accountTypeService;
