import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/ChargeCode`;

const chargeService = {
  getChargeCodes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}`);
      return response.data.items;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to fetch charge codes"
      );
    }
  },
  createChargeCode: async (chargeCode) => {
    try {
      const response = await axios.post(`${API_BASE_URL}`, chargeCode);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to create charge code"
      );
    }
  },
  updateChargeCode: async (chargeCode, chargeData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${chargeCode}`,
        chargeData
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to update charge code"
      );
    }
  },
  deleteChargeCode: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to delete charge code"
      );
    }
  },
};
export default chargeService;
