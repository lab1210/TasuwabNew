// positionService.js
import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/Position`; // Assuming your PositionController is under /api/Position

const positionService = {
  addPosition: async (positionData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/add`, positionData);
      return response.data;
    } catch (error) {
      console.error("Error adding position:", error);
      throw error.response?.data || error.message || "Failed to add position";
    }
  },

  editPosition: async (id, positionData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/edit/${id}`,
        positionData
      );
      return response.data;
    } catch (error) {
      console.error(`Error editing position with ID ${id}:`, error);
      throw error.response?.data || error.message || "Failed to edit position";
    }
  },

  deletePosition: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting position with ID ${id}:`, error);
      throw (
        error.response?.data || error.message || "Failed to delete position"
      );
    }
  },

  getAllPositions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all positions:", error);
      throw (
        error.response?.data || error.message || "Failed to fetch positions"
      );
    }
  },

  getPositionById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching position with ID ${id}:`, error);
      throw error.response?.data || error.message || "Failed to fetch position";
    }
  },

  // You can add more functions here if your PositionController expands
};

export default positionService;
