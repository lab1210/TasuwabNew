import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/Loan`;

const loanService = {
  createLoanType: async (loanTypeData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/types`, loanTypeData);
      return response.data;
    } catch (error) {
      console.error("Error creating loan type:", error);
      throw (
        error.response?.data || error.message || "Failed to create loan type"
      );
    }
  },
  updateLoanType: async (loanTypeCode, loanTypeData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/types/${loanTypeCode}`,
        loanTypeData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating loan type:", error);
      throw (
        error.response?.data || error.message || "Failed to update loan type"
      );
    }
  },
  deleteLoanType: async (loanTypeCode) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/types/${loanTypeCode}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting loan type:", error);
      throw (
        error.response?.data || error.message || "Failed to delete loan type"
      );
    }
  },
  getAllLoanTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/types`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all loan types:", error);
      throw (
        error.response?.data || error.message || "Failed to fetch loan types"
      );
    }
  },
};
export default loanService;
