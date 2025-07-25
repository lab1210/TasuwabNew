import axios from "axios";
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/suppliers`;

const supplierService = {
  addSupplier: async (supplierData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}`, supplierData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || "Failed to add supplier";
    }
  },
  getSuppliers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}`);
      return response.data.items;
    } catch (error) {
      throw (
        error.response?.data || error.message || "Failed to fetch suppliers"
      );
    }
  },
  getSupplierbyId: async (supplierId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${supplierId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to fetch supplier by ID"
      );
    }
  },
  updateSupplier: async (supplierId, supplierData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${supplierId}`,
        supplierData
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error.message || "Failed to update supplier"
      );
    }
  },
  getSupplierbyCategory: async (category) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/by-category/${category}`
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to fetch suppliers by category"
      );
    }
  },
  toggleSupplierStatus: async (supplierId, data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/${supplierId}/toggle-status`,
        data
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to toggle supplier status"
      );
    }
  },
};
export default supplierService;
