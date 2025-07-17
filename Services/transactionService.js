import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/transactions`;

const transactionService = {
  // In transactionService.js
  getTransactions: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.accountCode)
        queryParams.append("accountCode", params.accountCode);
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);

      const response = await axios.get(
        `${API_BASE_URL}?${queryParams.toString()}`
      );
      return response.data.items || []; // Ensure we always return an array
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw (
        error.response?.data || error.message || "Failed to fetch transactions"
      );
    }
  },
  createTransaction: async (transaction) => {
    try {
      const response = await axios.post(API_BASE_URL, transaction, {});
      return response.data;
    } catch (error) {
      console.error("Error creating new transaction:", error);
      throw (
        error.response?.data || error.message || "Failed to create transaction"
      );
    }
  },
  getTransactionById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching transaction by id:", error);
      throw (
        error.response?.data || error.message || "Failed to fetch transaction"
      );
    }
  },
  reverseTransaction: async (id, data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${id}/reverse`, data);
      return response.data;
    } catch (error) {
      console.error("Error reversing transaction:", error);
      throw (
        error.response?.data || error.message || "Failed to reverse transaction"
      );
    }
  },
  exportTransactions: async ({ accountCode, startDate, endDate, format }) => {
    try {
      const queryParams = new URLSearchParams();
      if (accountCode) queryParams.append("accountCode", accountCode);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (format) queryParams.append("format", format);

      const response = await axios.get(
        `${API_BASE_URL}/export?${queryParams.toString()}`,
        {
          responseType: "blob", // Important for file downloads
        }
      );
      return response;
    } catch (error) {
      console.error("Error exporting transactions:", error);
      throw (
        error.response?.data || error.message || "Failed to export transactions"
      );
    }
  },
  getTransactionbyLoanId: async (loanId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/loans/${loanId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching transaction by loan id:", error);
      throw (
        error.response?.data || error.message || "Failed to fetch transaction"
      );
    }
  },
  loanRepayment: async (loanId, data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/loans/payment`, data);
      return response.data;
    } catch (error) {
      console.error("Error loan repayment:", error);
      throw error.response?.data || error.message || "Failed to loan repayment";
    }
  },
  filterApprovedLoans: async (loanId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/loans/${loanId}/approved`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching approved loans:", error);
      throw (
        error.response?.data ||
        error.message ||
        "Failed to fetch approved loans"
      );
    }
  },
  filterPendingLoans: async (loanId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/loans/${loanId}/pending`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending loans:", error);
      throw (
        error.response?.data || error.message || "Failed to fetch pending loans"
      );
    }
  },
};
export default transactionService;
