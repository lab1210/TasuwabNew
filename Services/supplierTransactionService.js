import axios from "axios";
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/supplier-transactions`;

const supplierTransactionService = {
  createSupplierTransaction: async (supplierTransaction) => {
    try {
      const response = await axios.post(API_BASE_URL, supplierTransaction);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to create supplier transaction"
      );
    }
  },
  getSupplierTransactions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/loans-needing-action`);
      return response.data.items;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to get supplier transactions"
      );
    }
  },
   getSupplierTransactionsbyStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/by-status`);
      return response.data.items;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to get supplier transactions"
      );
    }
  },
  getSupplierTransactionbyId: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to get supplier transaction by id"
      );
    }
  },
  updateSupplierTransaction: async (id, supplierTransaction) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${id}`,
        supplierTransaction
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to update supplier transaction"
      );
    }
  },
  ApproveSupplierTransaction: async (id, data, actionby) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/${id}/approve?actionedBy=${actionby}`,
        data
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to approve supplier transaction"
      );
    }
  },
  getTransactionByFileNumber: async (fileNumber) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/by-file/${fileNumber}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to get transaction by file number"
      );
    }
  },
  getSupplierPaymentHistory: async (fileNo) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/payment-summary/${fileNo}`
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to get supplier payment history"
      );
    }
  },
  getApprovedTransactions: async (fileNo) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/approved/${fileNo}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to get approved transactions"
      );
    }
  },
  getDeclinedTransactions: async (fileNo) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/declined/${fileNo}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to get declined transactions"
      );
    }
  },
  getPendingTransactions: async (fileNo) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pending/${fileNo}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to get pending transactions"
      );
    }
  },
};
export default supplierTransactionService;
