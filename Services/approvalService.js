import axios from "axios";
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/approvals`;

const approvalService = {
  getApprovals: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      console.log(response.data);
      return response.data.items;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data || error.message || "Failed to fetch suppliers"
      );
    }
  },
  getApprovalById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error.response?.data || error.message || "Failed to fetch approval";
    }
  },
  processApproval: async (
    approvalRequestID,
    status,
    staffId,
    comments = ""
  ) => {
    try {
      // Validate required fields
      if (!staffId) {
        throw new Error("Staff ID is required");
      }

      if (status === 2 && (!comments || comments.length < 10)) {
        throw new Error(
          "Rejection requires comments with at least 10 characters"
        );
      }

      const response = await axios.post(
        `${API_BASE_URL}/${approvalRequestID}/process`,
        {
          staffId,
          status, // 1 for approve, 2 for reject
          comments: status === 2 ? comments : comments,
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data?.message ||
        error.message ||
        "Failed to process approval"
      );
    }
  },
  getApprovalHistorybyStaffId: async (staffId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history/${staffId}`);
      return response.data.items;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data ||
        error.message ||
        "Failed to fetch approval history"
      );
    }
  },
  getApprovalHistory: async (approvalRequestID) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${approvalRequestID}/history`
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data ||
        error.message ||
        "Failed to fetch approval history"
      );
    }
  },
  checkApprovalCompletion: async (entityId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/check-completion/${entityId}`
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data ||
        error.message ||
        "Failed to check approval completion"
      );
    }
  },
  postApprovalConfiguration: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/configurations`, data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data ||
        error.message ||
        "Failed to post approval configuration"
      );
    }
  },
  getApprovalConfigurationbyEntityId: async (entityType) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/configurations/${entityType}`
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error.response?.data ||
        error.message ||
        "Failed to fetch approval configuration"
      );
    }
  },
};
export default approvalService;
