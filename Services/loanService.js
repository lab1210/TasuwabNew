import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/loans`;

const loanService = {
  getLoans: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/requests`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error.message || "Failed to fetch suppliers"
      );
    }
  },
  postLoan: async (loan) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/requests`, loan);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error.message || "Failed to create loan request"
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
  getLoanbyFileNumber: async (fileNumber) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requests/${fileNumber}`
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to get loan request by file number"
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
  postLoanRepayment: async (loanID, data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/accounts/${loanID}/payments`,
        data
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error.message || "Failed to post loan repayment"
      );
    }
  },
  postTopupLoan: async (loanID, data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/accounts/${loanID}/topups`,
        data
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error.message || "Failed to post topup loan"
      );
    }
  },
  getTopUpHistory: async (loanID) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/accounts/${loanID}/topup-history`
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
};
export default loanService;
