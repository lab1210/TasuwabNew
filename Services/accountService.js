// useAccountService.js
import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/Account`;

const useAccountService = {
  createNewAccount: async (dto) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/new-account`, dto);
      return response.data;
    } catch (error) {
      console.error("Error creating new account:", error);
      throw error.response?.data || error.message || "Failed to create account";
    }
  },
  updateAccount: async (accountCode, accountData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${accountCode}`,
        accountData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating account :", error);
      throw (
        error.response?.data || error.message || "Failed to update account "
      );
    }
  },
  getAccountByCode: async (accountCode) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${accountCode}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching account by code:", error);
      throw error.response?.data || error.message || "Failed to fetch account";
    }
  },

  getAllAccounts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all`);
      return response.data.items;
    } catch (error) {
      console.error("Error fetching all accounts:", error);
      throw (
        error.response?.data || error.message || "Failed to fetch all accounts"
      );
    }
  },
  checkExistingAccount: async (accountCode) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/exists/${accountCode}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  closeAccount: async (accountCode, data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/${accountCode}/close`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error closing  accountCode ${accountCode}:`, error);
      throw error.response?.data || error.message || "Failed to close account";
    }
  },
};

export default useAccountService;
