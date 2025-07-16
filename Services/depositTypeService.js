import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/DepositType`;

const depositTypeService = {
  getallDepositTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all`);
      return response.data.items;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to fetch deposit types"
      );
    }
  },
  getdepositType: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to fetch deposit type"
      );
    }
  },
  createDepositType: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}`, data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to create deposit type"
      );
    }
  },
  updateDepositType: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to update deposit type"
      );
    }
  },
  deleteDepositType: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to delete deposit type"
      );
    }
  },
};
export default depositTypeService;
