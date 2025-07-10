// clientService.js
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const clientService = {
  createClient: async (clientData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Client/new-client`,
        clientData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  },
  getClientById: async (clientId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Client/client/${clientId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching client with ID ${clientId}:`, error);
      throw error;
    }
  },

  getAllClients: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Client/all-client`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all clients:", error);
      throw error;
    }
  },

  updateClient: async (clientId, clientData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/Client/update-client/${clientId}`,
        clientData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating client with ID ${clientId}:`, error);
      throw error;
    }
  },

  checkExistingClient: async (clientId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Client/exists/${clientId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default clientService;
