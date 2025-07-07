import axios from "axios";
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/Supplier/banks`;

const bankService = {
  addBank: async (bankData) => {
    try {
      const response = await axios.post(API_BASE_URL, bankData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || "Failed to add bank";
    }
  },
  editBank: async (id, bankData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, bankData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || "Failed to edit bank";
    }
  },
  getBank: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || "Failed to fetch banks";
    }
  },
};
export default bankService;
