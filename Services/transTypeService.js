import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/TransactionType`;

const transactionTypeService = {
  getAlltransactionTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}`);
      return response.data.items;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data ||
        error.message ||
        "Failed to fetch transaction types"
      );
    }
  },
  createTransactionType: async (transactionType) => {
    try {
      const response = await axios.post(`${API_BASE_URL}`, transactionType);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data ||
        error.message ||
        "Failed to create transaction type"
      );
    }
  },
  updateTransactionType: async (id, transactionType) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${id}`,
        transactionType
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data ||
        error.message ||
        "Failed to update transaction type"
      );
    }
  },
  deleteTransactionType: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data ||
        error.message ||
        "Failed to delete transaction type"
      );
    }
  },
};
export default transactionTypeService;
