import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/LoanType`;

const LoanTypeService = {
  getLoanTypes: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data.items;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to fetch loan types"
      );
    }
  },
  createLoanType: async (loanType) => {
    try {
      const response = await axios.post(API_BASE_URL, loanType);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to create loan type"
      );
    }
  },
  updateLoanType: async (id, loanType) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, loanType);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to update loan type"
      );
    }
  },
  deleteLoanType: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to delete loan type"
      );
    }
  },
};
export default LoanTypeService;
