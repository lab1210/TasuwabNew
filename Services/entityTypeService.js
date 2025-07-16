import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/EntityType`;

const entityTypeService = {
  getAllEntityTypes: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data.items;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to fetch deposit types"
      );
    }
  },
  getEntityTypeById: async (id) => {
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
  createEntityType: async (entityType) => {
    try {
      const response = await axios.post(API_BASE_URL, entityType);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to create deposit type"
      );
    }
  },
  updateEntityType: async (id, entityType) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, entityType);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to update deposit type"
      );
    }
  },
  deleteEntityType: async (id) => {
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
export default entityTypeService;
