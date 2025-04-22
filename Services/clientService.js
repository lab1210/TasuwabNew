// clientService.js
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const clientService = {
  createClient: async (clientData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/Client`, clientData);
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
      const response = await axios.get(`${API_BASE_URL}/Client`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all clients:", error);
      throw error;
    }
  },

  updateClient: async (clientId, clientData) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/Client/update/${clientId}`,
        clientData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating client with ID ${clientId}:`, error);
      throw error;
    }
  },

  getClientAccounts: async (clientId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Client/${clientId}/accounts`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching accounts for client ID ${clientId}:`,
        error
      );
      throw error;
    }
  },
};

export default clientService;
