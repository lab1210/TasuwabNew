"use client";
import React, { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaFilter,
  FaChevronLeft,
  FaSearch,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import approvalService from "@/Services/approvalService";
import roleService from "@/Services/roleService";
import formatDate from "@/app/components/formatdate";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

const CommentModal = ({ isOpen, onClose, onSubmit, actionType }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (!comment) {
      toast.error("Comments are required");
      return;
    }
    if (actionType === 2 && comment.length < 10) {
      toast.error("Rejection requires comments with at least 10 characters");
      return;
    }
    onSubmit(comment);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {actionType === 1 ? "Approval Comments" : "Rejection Reason"}
        </h2>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          rows={4}
          placeholder={
            actionType === 1
              ? "Enter approval comments (required)..."
              : "Enter rejection reason (minimum 10 characters)..."
          }
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-white rounded-md ${
              actionType === 1
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {actionType === 1 ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ApprovalsPage = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    entityType: "",
    requester: "",
    startDate: "",
    endDate: "",
  });
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [currentApprovalId, setCurrentApprovalId] = useState(null);

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "N/A";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const entityTypeMap = {
    0: "Loan",
    1: "Supplier Transaction",
    2: "Account",
    3: "Loan Top up",
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Approved";
      case 2:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return "bg-yellow-100 text-yellow-800";
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const approvalsResponse = await approvalService.getApprovals();
        setApprovals(approvalsResponse || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch approvals:", err);
        setError(err.message || "Failed to load approvals");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPrivileges = async () => {
      if (user?.role) {
        setLoadingPrivileges(true);
        try {
          const role = await roleService.getRoleById(user.role);
          setRolePrivileges(role?.privileges?.map((p) => p.name) || []);
        } catch (error) {
          console.error("Error fetching role by ID:", error);
          setRolePrivileges([]);
        } finally {
          setLoadingPrivileges(false);
        }
      } else {
        setRolePrivileges([]);
        setLoadingPrivileges(false);
      }
    };
    fetchPrivileges();
  }, [user?.role]);

  useEffect(() => {
    const handleFilter = () => {
      const lowerCaseFilter = filterText.toLowerCase();
      const results = approvals.filter((approval) => {
        const matchesText =
          approval.approvalRequestId.toLowerCase().includes(lowerCaseFilter) ||
          approval.requestedByName.toLowerCase().includes(lowerCaseFilter) ||
          (approval.notes &&
            approval.notes.toLowerCase().includes(lowerCaseFilter));

        const matchesStatus =
          filters.status === "" ||
          approval.status.toString() === filters.status;

        const matchesEntityType =
          filters.entityType === "" ||
          approval.entityType.toString() === filters.entityType;

        const matchesRequester =
          filters.requester === "" ||
          approval.requestedBy === filters.requester;

        return (
          matchesText && matchesStatus && matchesEntityType && matchesRequester
        );
      });
      setFilteredApprovals(results);
      setCurrentPage(1);
    };
    handleFilter();
  }, [approvals, filterText, filters]);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApprovals = filteredApprovals.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredApprovals.length / ITEMS_PER_PAGE);

  const hasPrivilege = (privilegeName) => {
    return !loadingPrivileges && rolePrivileges.includes(privilegeName);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      entityType: "",
      requester: "",
      startDate: "",
      endDate: "",
    });
    setFilterText("");
  };

  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    setShowDetails(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setTimeout(() => {
      setSelectedApproval(null);
    }, 300);
  };

  const handleActionInitiation = (approvalId, action) => {
    setCurrentApprovalId(approvalId);
    setCurrentAction(action);
    setShowCommentModal(true);
  };

  const handleApproveReject = async (comment) => {
    try {
      await approvalService.processApproval(
        currentApprovalId,
        currentAction,
        user.StaffCode,
        comment
      );

      toast.success(`Request ${currentAction === 1 ? "approved" : "rejected"}`);

      setApprovals((prev) =>
        prev.map((approval) =>
          approval.approvalRequestId === currentApprovalId
            ? {
                ...approval,
                status: currentAction,
                history: [
                  ...(approval.history || []),
                  {
                    actionedByName: user.name,
                    actionDate: new Date().toISOString(),
                    status: currentAction,
                    comments: comment,
                    level: (approval.history?.length || 0) + 1,
                  },
                ],
              }
            : approval
        )
      );

      const approvalsResponse = await approvalService.getApprovals();
      setApprovals(approvalsResponse || []);
    } catch (error) {
      console.log("Approval error:", error);
      toast.error(error || "Failed to process approval");

      setApprovals((prev) =>
        prev.map((approval) =>
          approval.approvalRequestId === currentApprovalId
            ? { ...approval, status: 0 }
            : approval
        )
      );
    } finally {
      setShowCommentModal(false);
      setCurrentApprovalId(null);
      setCurrentAction(null);
    }
  };

  if (loading || loadingPrivileges) {
    return (
      <Layout>
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="relative w-14 h-14">
            <div className="absolute w-full h-full border-4 border-[#333] border-t-[#3D873B] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-[#3D873B] text-xl">
              T
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center gap-2">
          <p className="font-bold">{error}</p>
          <button
            className="bg-red-500 cursor-pointer shadow-md text-white p-1 rounded-lg"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full">
        <CommentModal
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          onSubmit={handleApproveReject}
          actionType={currentAction}
        />

        <AnimatePresence mode="wait">
          {showDetails && selectedApproval ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="">
                <button
                  onClick={handleCloseDetails}
                  className="flex items-center text-[#3D873B] hover:text-[#2a5d28] mb-4"
                >
                  <FaChevronLeft className="mr-1" />
                  Back
                </button>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-2xl font-bold">Approval Details</h1>
                      <p className="text-sm text-gray-600">
                        Request ID: {selectedApproval.approvalRequestId} | Type:{" "}
                        {entityTypeMap[selectedApproval.entityType] ||
                          "Unknown"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Status</p>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            selectedApproval.status
                          )}`}
                        >
                          {getStatusText(selectedApproval.status)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Request Date</p>
                        <p className="font-medium">
                          {formatDate(selectedApproval.requestDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">
                          Request Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Request ID</p>
                            <p className="font-medium">
                              {selectedApproval.approvalRequestId}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Entity Type</p>
                            <p className="font-medium">
                              {entityTypeMap[selectedApproval.entityType] ||
                                "Unknown"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Entity ID</p>
                            <p className="font-medium">
                              {selectedApproval.entityId}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Requested By
                            </p>
                            <p className="font-medium">
                              {selectedApproval.requestedByName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Request Date
                            </p>
                            <p className="font-medium">
                              {formatDate(selectedApproval.requestDate)}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="font-medium">
                              {selectedApproval.notes || "No notes provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {selectedApproval.metadata && (
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h2 className="text-lg font-semibold mb-4">
                            Additional Information
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(selectedApproval.metadata).map(
                              ([key, value]) => (
                                <div key={key}>
                                  <p className="text-sm text-gray-500 capitalize">
                                    {key === "PaymentPeriodDays"
                                      ? "Payment Period (months)"
                                      : key.replace(/([A-Z])/g, " $1").trim()}
                                  </p>
                                  <p className="font-medium">
                                    {key.toLowerCase().includes("amount") ||
                                    key.toLowerCase().includes("price") ||
                                    key.toLowerCase().includes("value")
                                      ? formatCurrency(value)
                                      : value || "N/A"}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      {selectedApproval.status === 0 &&
                        hasPrivilege("ProcessApprovals") && (
                          <div className="bg-gray-50 rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">
                              Approval Actions
                            </h2>
                            <div className="flex gap-4">
                              <button
                                onClick={() =>
                                  handleActionInitiation(
                                    selectedApproval.approvalRequestId,
                                    1
                                  )
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                              >
                                <FaCheck /> Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleActionInitiation(
                                    selectedApproval.approvalRequestId,
                                    2
                                  )
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                              >
                                <FaTimes /> Reject
                              </button>
                            </div>
                          </div>
                        )}

                      {selectedApproval.history?.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h2 className="text-lg font-semibold mb-4">
                            Approval History
                          </h2>
                          <div className="space-y-4">
                            {selectedApproval.history.map((item, index) => (
                              <div
                                key={index}
                                className="border-l-2 border-gray-300 pl-3 py-1"
                              >
                                <div className="flex justify-between">
                                  <span className="font-medium">
                                    {item.actionedByName}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {formatDate(item.actionDate)}
                                  </span>
                                </div>
                                <p className="text-sm">
                                  {item.comments || "No comments"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Status: {getStatusText(item.status)} | Level:{" "}
                                  {item.level}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-4xl font-extrabold">Approval Requests</p>
                  <p className="text-sm text-gray-600">
                    View all pending and processed approval requests.
                  </p>
                </div>
              </div>

              <div className="mt-4 mb-5 space-y-3">
                <div className="flex gap-3">
                  <div className="relative flex-grow">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search approvals..."
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      className="placeholder:text-sm border p-2 pl-10 w-full rounded-md border-gray-300 outline-none shadow-sm"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                      showFilters
                        ? "bg-[#3D873B] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <FaFilter />
                    <span>Filters</span>
                  </button>
                </div>

                {showFilters && (
                  <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) =>
                            handleFilterChange("status", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">All Statuses</option>
                          <option value="0">Pending</option>
                          <option value="1">Approved</option>
                          <option value="2">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Entity Type
                        </label>
                        <select
                          value={filters.entityType}
                          onChange={(e) =>
                            handleFilterChange("entityType", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">All Types</option>
                          {Object.entries(entityTypeMap).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) =>
                            handleFilterChange("startDate", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) =>
                            handleFilterChange("endDate", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={resetFilters}
                        className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requested By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedApprovals.map((approval) => (
                        <tr
                          key={approval.approvalRequestId}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {entityTypeMap[approval.entityType] || "Unknown"}
                            </div>
                            {/* <div className="text-sm text-gray-500">
                              {approval.entityId}
                            </div> */}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {approval.requestedByName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(approval.requestDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                approval.status
                              )}`}
                            >
                              {getStatusText(approval.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDetails(approval)}
                                className="text-[#3D873B] hover:text-[#2a5d28] hover:underline"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedApprovals.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No approval requests available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === i + 1
                          ? "bg-[#3D873B] text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default ApprovalsPage;
