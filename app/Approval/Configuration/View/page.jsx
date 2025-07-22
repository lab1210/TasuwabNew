"use client";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import approvalService from "@/Services/approvalService";
import staffService from "@/Services/staffService";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaInfoCircle,
  FaEdit,
  FaTrash,
  FaHistory,
  FaUserClock,
} from "react-icons/fa";
import Select from "react-select";

const ApprovalConfigurations = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntityType, setSelectedEntityType] = useState("0");
  const [showRequestHistoryModal, setShowRequestHistoryModal] = useState(false);
  const [showStaffHistoryModal, setShowStaffHistoryModal] = useState(false);
  const [requestHistory, setRequestHistory] = useState([]);
  const [staffHistory, setStaffHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [allStaff, setAllStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const entityTypeOptions = [
    { value: 0, label: "Loan" },
    { value: 1, label: "SupplierTransaction" },
    { value: 2, label: "Account" },
    { value: 3, label: "LoanTopUp" },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [config, staffData] = await Promise.all([
          approvalService.getApprovalConfigurationbyEntityId(
            selectedEntityType
          ),
          staffService.getStaffs(),
        ]);
        setConfigurations(config.levels || []);
        setAllStaff(staffData);

        // Set default selected staff to current user
        if (user?.StaffCode) {
          const currentUser = staffData.find(
            (s) => s.staffCode === user.StaffCode
          );
          if (currentUser) {
            setSelectedStaff({
              value: currentUser.staffCode,
              label: `${currentUser.firstName} ${currentUser.lastName} (${currentUser.staffCode})`,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [selectedEntityType, user]);

  const handleEntityTypeChange = (e) => {
    setSelectedEntityType(e.target.value);
  };

  const fetchRequestHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await approvalService.getApprovalConfigurationbyEntityId(
        selectedEntityType
      );

      // Handle the expected response structure
      let historyData = [];
      if (response && Array.isArray(response.levels)) {
        // If response has the expected structure with 'levels' array
        historyData = response.levels.map((level) => ({
          ...level,
          entityType: response.entityType, // Include entityType if needed
        }));
      } else if (Array.isArray(response)) {
        // If response is directly an array (fallback)
        historyData = response;
      } else {
        historyData = [];
      }

      setRequestHistory(historyData);
      setShowRequestHistoryModal(true);
    } catch (error) {
      toast.error("Failed to load request history");
      console.error("Error fetching request history:", error);
      setRequestHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchStaffHistory = async (staffId = null) => {
    try {
      setHistoryLoading(true);
      const idToFetch = staffId || user?.StaffCode;
      if (!idToFetch) {
        toast.error("No staff selected");
        return;
      }

      const history = await approvalService.getApprovalHistorybyStaffId(
        idToFetch
      );
      setStaffHistory(history);
      setShowStaffHistoryModal(true);
    } catch (error) {
      toast.error("Failed to load approval history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStaffChange = (selectedOption) => {
    setSelectedStaff(selectedOption);
    fetchStaffHistory(selectedOption.value);
  };

  // Prepare staff options for dropdown
  const staffOptions = allStaff.map((staff) => ({
    value: staff.staffCode,
    label: `${staff.firstName} ${staff.lastName} (${staff.staffCode})`,
  }));

  // Group configurations by level for better display
  const groupedByLevel = configurations.reduce((acc, config) => {
    if (!acc[config.level]) {
      acc[config.level] = [];
    }
    acc[config.level].push(config);
    return acc;
  }, {});

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-4xl font-extrabold mb-2">
              Approval Configurations
            </p>
            <p className="text-sm text-gray-600">
              View and manage approval workflows for different entity types.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex flex-col gap-2 flex-1">
              <label className="font-bold text-sm flex items-center gap-2">
                Entity Type
                <div className="group relative">
                  <FaInfoCircle className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                  <div className="absolute z-10 hidden group-hover:block w-64 bg-white p-2 border border-gray-200 rounded shadow-lg text-xs">
                    <p>
                      Select the type of entity this approval configuration
                      applies to:
                    </p>
                    <ul className="list-disc pl-4 mt-1">
                      <li>
                        <strong>Loan</strong>: For loan applications
                      </li>
                      <li>
                        <strong>SupplierTransaction</strong>: For supplier
                        transactions
                      </li>
                      <li>
                        <strong>Account</strong>: For account-related changes
                      </li>
                      <li>
                        <strong>LoanTopUp</strong>: For loan top-up requests
                      </li>
                    </ul>
                  </div>
                </div>
              </label>
              <select
                value={selectedEntityType}
                onChange={handleEntityTypeChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
              >
                {entityTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchRequestHistory}
                className="flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md px-4 py-2"
              >
                <FaHistory /> Request History
              </button>
              <button
                onClick={() => fetchStaffHistory()}
                className="flex items-center gap-1 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-md px-4 py-2"
              >
                <FaUserClock /> Approval History
              </button>
              <button
                onClick={() => router.push("/Approval/Configuration")}
                className="bg-[#3D873B] text-white rounded-md px-4 py-2 hover:shadow-lg hover:opacity-70"
              >
                Create New
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3D873B]"></div>
            </div>
          ) : configurations.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">
                No approval configuration found for this entity type.
              </p>
              <button
                onClick={() => router.push(`/Approval/Configuration`)}
                className="text-[#3D873B] hover:underline mt-2"
              >
                Create one now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {
                    entityTypeOptions.find(
                      (e) => e.value.toString() === selectedEntityType
                    )?.label
                  }{" "}
                  Approval Workflow
                </h3>
              </div>

              {Object.entries(groupedByLevel).map(([level, approvers]) => (
                <div
                  key={level}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Level {level}</h4>
                    <span className="text-sm text-gray-500">
                      {approvers.some((a) => a.isMandatory)
                        ? `${
                            approvers.filter((a) => a.isMandatory).length
                          } mandatory approver(s)`
                        : "No mandatory approvers"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {approvers.map((approver, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Approver
                          </p>
                          <p className="font-medium">{approver.staffId}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Approval Type
                          </p>
                          <p
                            className={`font-medium ${
                              approver.isMandatory
                                ? "text-[#3D873B]"
                                : "text-gray-600"
                            }`}
                          >
                            {approver.isMandatory ? "Mandatory" : "Optional"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500">
                  {configurations.length} total approvers across{" "}
                  {Object.keys(groupedByLevel).length} levels
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Request History Modal */}
        {showRequestHistoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Request History for{" "}
                  {
                    entityTypeOptions.find(
                      (e) => e.value.toString() === selectedEntityType
                    )?.label
                  }
                </h3>
                <button
                  onClick={() => setShowRequestHistoryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-auto">
                {historyLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3D873B]"></div>
                  </div>
                ) : requestHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-10">
                    No history found for this entity type
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Level</th>
                          <th className="text-left py-2 px-4">Staff</th>
                          <th className="text-left py-2 px-4">Mandatory?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requestHistory.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">{item.level}</td>
                            <td className="py-2 px-4">{item.staffId || "-"}</td>
                            <td className="py-2 px-4">
                              {item.isMandatory ? "Yes" : "No"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={() => setShowRequestHistoryModal(false)}
                  className="bg-[#3D873B] text-white rounded-md px-4 py-2 hover:opacity-80"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Staff Approval History Modal with Dropdown */}
        {showStaffHistoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Approval History</h3>
                <button
                  onClick={() => setShowStaffHistoryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 border-b">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <label className="text-sm font-medium min-w-[120px]">
                    View History For:
                  </label>
                  <Select
                    options={staffOptions}
                    value={selectedStaff}
                    onChange={handleStaffChange}
                    className="flex-1"
                    placeholder="Select staff member"
                    isLoading={historyLoading}
                  />
                </div>
              </div>
              <div className="p-4 overflow-auto">
                {historyLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3D873B]"></div>
                  </div>
                ) : staffHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-10">
                    No approval history found{" "}
                    {selectedStaff ? `for ${selectedStaff.label}` : ""}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Action</th>
                          <th className="text-left py-2 px-4">Level</th>
                          <th className="text-left py-2 px-4">Date</th>
                          <th className="text-left py-2 px-4">Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffHistory.map((item) => (
                          <tr
                            key={item.approvalHistoryId}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-2 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  item.status === 1
                                    ? "bg-green-100 text-green-800"
                                    : item.status === 2
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {item.status === 1
                                  ? "Approved"
                                  : item.status === 2
                                  ? "Rejected"
                                  : "Pending"}
                              </span>
                            </td>
                            <td className="py-2 px-4">{item.level}</td>
                            <td className="py-2 px-4">
                              {new Date(item.actionDate).toLocaleString()}
                            </td>
                            <td className="py-2 px-4">
                              {item.comments || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={() => setShowStaffHistoryModal(false)}
                  className="bg-[#3D873B] text-white rounded-md px-4 py-2 hover:opacity-80"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ApprovalConfigurations;
