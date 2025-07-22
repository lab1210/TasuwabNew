import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/loans`;

const loanService = {
  getLoans: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/requests`);
      return response.data.items;
    } catch (error) {
      throw (
        error.response?.data || error.message || "Failed to fetch suppliers"
      );
    }
  },
  postLoan: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/requests`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Detailed error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create loan request"
      );
    }
  },
  ApproveLoan: async (loanId, data) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/requests/${loanId}/status`,
        data
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to approve loan request"
      );
    }
  },

  getLoanAccounts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts`);
      return response.data.items;
    } catch (error) {
      throw (
        error.response?.data || error.message || "Failed to get loan accounts"
      );
    }
  },
  getLoanAccount: async (loanID) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts/${loanID}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to get loan account by id"
      );
    }
  },
  postLoanRepayment: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/repayments`, data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error.message || "Failed to post loan repayment"
      );
    }
  },
  postTopupLoan: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/accounts/topups`,
        data
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error.message || "Failed to post topup loan"
      );
    }
  },
  getTopUpHistory: async (fileNo) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/accounts/${fileNo}/topup-history`
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to get topup history for loan"
      );
    }
  },
  getLoanTransactions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions`);
      return response.data.items;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to get loan transactions"
      );
    }
  },
};
export default loanService;
