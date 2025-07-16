import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/Announcement`;

const announcementService = {
  getAnnouncements: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to create announcement"
      );
    }
  },
  getActiveAnnouncements: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/active`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to create announcement"
      );
    }
  },
  getAnnouncementsbyId: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to get announcement"
      );
    }
  },
  createAnnouncement: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}`, data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to create announcement"
      );
    }
  },
  updateAnnouncement: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to update announcement"
      );
    }
  },
  deleteAnnouncement: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to delete announcement"
      );
    }
  },
};
export default announcementService;
