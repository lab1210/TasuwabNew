// useAccountService.js
import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/Account`;

const useAccountService = () => {
  const createNewAccount = async (dto) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/Create`, dto);
      return response.data;
    } catch (error) {
      console.error("Error creating new account:", error);
      throw error.response?.data || error.message || "Failed to create account";
    }
  };

  const updateAccountStatus = async (accountCode, isActive) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/${accountCode}/status`,
        isActive
      );
      return response.data;
    } catch (error) {
      console.error("Error updating account status:", error);
      throw (
        error.response?.data ||
        error.message ||
        "Failed to update account status"
      );
    }
  };

  const getAccountByCode = async (accountCode) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${accountCode}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching account by code:", error);
      throw error.response?.data || error.message || "Failed to fetch account";
    }
  };

  const getAllAccounts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all accounts:", error);
      throw (
        error.response?.data || error.message || "Failed to fetch all accounts"
      );
    }
  };

  const updateAccountTypeInterestRate = async (
    accountTypeCode,
    interestRate
  ) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/types/${accountTypeCode}/interest-rate`,
        interestRate
      );
      return response.data;
    } catch (error) {
      console.error("Error updating account type interest rate:", error);
      throw (
        error.response?.data ||
        error.message ||
        "Failed to update interest rate"
      );
    }
  };

  const getAllAccountTypes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/types`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all account types:", error);
      throw (
        error.response?.data || error.message || "Failed to fetch account types"
      );
    }
  };

  const getAllAccountEntityTypes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/entity-types`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all account entity types:", error);
      throw (
        error.response?.data || error.message || "Failed to fetch entity types"
      );
    }
  };

  const createAccountType = async (dto) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/types`, dto);
      return response.data;
    } catch (error) {
      console.error("Error creating account type:", error);
      throw (
        error.response?.data || error.message || "Failed to create account type"
      );
    }
  };

  const createAccountEntityType = async (dto) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/entity-types`, dto);
      return response.data;
    } catch (error) {
      console.error("Error creating account entity type:", error);
      throw (
        error.response?.data || error.message || "Failed to create entity type"
      );
    }
  };

  const updateAccountType = async (accountTypeCode, dto) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/types/${accountTypeCode}`,
        dto
      );
      return response.data;
    } catch (error) {
      console.error("Error updating account type:", error);
      throw (
        error.response?.data || error.message || "Failed to update account type"
      );
    }
  };

  return {
    createNewAccount,
    updateAccountStatus,
    getAccountByCode,
    getAllAccounts,
    updateAccountTypeInterestRate,
    getAllAccountTypes,
    getAllAccountEntityTypes,
    createAccountType,
    createAccountEntityType,
    updateAccountType,
  };
};

export default useAccountService;
