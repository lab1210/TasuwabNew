"use client";
import Layout from "@/app/components/Layout";
import approvalService from "@/Services/approvalService";
import { useAuth } from "@/Services/authService";
import staffService from "@/Services/staffService";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaInfoCircle, FaPlus, FaTimes, FaTrash } from "react-icons/fa";

const ApprovalConfiguration = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [staffList, setStaffList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    entityType: 0,
    levels: [
      {
        level: 1,
        staffId: "",
        isMandatory: true,
      },
    ],
  });

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const staffs = await staffService.getStaffs();
        setStaffList(staffs);
      } catch (error) {
        console.error("Error fetching staffs:", error);
        toast.error("Failed to load staff list");
      }
    };
    fetchStaffs();
  }, []);

  const handleEntityTypeChange = (e) => {
    setFormData({
      ...formData,
      entityType: parseInt(e.target.value),
    });
  };

  const handleAddApprover = (currentLevel) => {
    const newApprover = {
      level: currentLevel,
      staffId: "",
      isMandatory: false,
    };
    setFormData({
      ...formData,
      levels: [...formData.levels, newApprover],
    });
  };

  const handleAddNewLevel = () => {
    // Find the highest current level
    const highestLevel = Math.max(...formData.levels.map((l) => l.level), 0);
    const newLevel = {
      level: highestLevel + 1,
      staffId: "",
      isMandatory: false,
    };
    setFormData({
      ...formData,
      levels: [...formData.levels, newLevel],
    });
  };

  const handleRemoveApprover = (index) => {
    if (formData.levels.length <= 1) {
      toast.error("At least one approver is required");
      return;
    }

    const newLevels = formData.levels.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      levels: newLevels,
    });
  };

  const handleStaffChange = (index, staffId) => {
    const newLevels = [...formData.levels];
    newLevels[index].staffId = staffId;
    setFormData({
      ...formData,
      levels: newLevels,
    });
  };

  const handleMandatoryChange = (index, isMandatory) => {
    const newLevels = [...formData.levels];

    // Check if we're setting to true and there are other mandatory approvers at the same level
    if (isMandatory) {
      const currentLevel = newLevels[index].level;
      const otherMandatoryAtSameLevel = newLevels.some(
        (l, i) => l.level === currentLevel && l.isMandatory && i !== index
      );

      if (otherMandatoryAtSameLevel) {
        if (
          !confirm(
            "Warning: Multiple mandatory approvers at the same level means ALL must approve. Continue?"
          )
        ) {
          return;
        }
      }
    }

    newLevels[index].isMandatory = isMandatory;
    setFormData({
      ...formData,
      levels: newLevels,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const levelsPresent = new Set(formData.levels.map((l) => l.level));
    let hasErrors = false;

    // Check each level has at least one mandatory approver
    levelsPresent.forEach((level) => {
      const approversAtLevel = formData.levels.filter((l) => l.level === level);
      if (!approversAtLevel.some((a) => a.isMandatory)) {
        toast.error(`Level ${level} must have at least one mandatory approver`);
        hasErrors = true;
      }
    });

    // Check all approvers have staff selected
    if (formData.levels.some((l) => !l.staffId)) {
      toast.error("Please select a staff member for all approvers");
      hasErrors = true;
    }

    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await approvalService.postApprovalConfiguration(
        formData
      );

      toast.success("Approval configuration saved successfully!");
      router.push("/Approval/Configuration/View");
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error(error.message || "Failed to save configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const entityTypeOptions = [
    { value: 0, label: "Loan" },
    { value: 1, label: "SupplierTransaction" },
    { value: 2, label: "Account" },
    { value: 3, label: "LoanTopUp" },
  ];

  // Group approvers by level for display
  const groupedApprovers = {};
  formData.levels.forEach((approver, index) => {
    if (!groupedApprovers[approver.level]) {
      groupedApprovers[approver.level] = [];
    }
    groupedApprovers[approver.level].push({
      ...approver,
      originalIndex: index,
    });
  });

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-extrabold mb-2">
              Approval Configuration
            </p>
            <p className="text-sm text-gray-600">
              Configure approval workflows for different entity types.
            </p>
          </div>
        </div>

        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
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
                        transactions and payments
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
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.entityType}
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
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Approval Levels</h3>

            {Object.entries(groupedApprovers).map(([level, approvers]) => (
              <div
                key={level}
                className="border border-gray-200 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Level {level}</h4>
                  <button
                    type="button"
                    onClick={() => handleAddApprover(parseInt(level))}
                    className="text-[#3D873B] hover:text-[#2d6e2b] flex items-center gap-1 text-sm"
                  >
                    <FaPlus size={12} /> Add Approver
                  </button>
                </div>

                {approvers.map((approver, idx) => (
                  <div
                    key={idx}
                    className="grid md:grid-cols-2 gap-4 mb-4 last:mb-0"
                  >
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Approver</label>
                      <div className="flex gap-2">
                        <select
                          value={approver.staffId}
                          onChange={(e) =>
                            handleStaffChange(
                              approver.originalIndex,
                              e.target.value
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all flex-1"
                          required
                        >
                          <option value="">Select Approver</option>
                          {staffList.map((staff) => (
                            <option
                              key={staff.staffCode}
                              value={staff.staffCode}
                            >
                              {staff.firstName} {staff.lastName} (
                              {staff.staffCode})
                            </option>
                          ))}
                        </select>
                        {approvers.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveApprover(approver.originalIndex)
                            }
                            className="text-red-500 hover:text-red-700 flex items-center px-2"
                          >
                            <FaTimes size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={approver.isMandatory}
                          onChange={(e) =>
                            handleMandatoryChange(
                              approver.originalIndex,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-[#3D873B] focus:ring-[#3D873B] border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium">
                          Mandatory Approver
                        </span>
                      </label>
                      {approver.isMandatory && (
                        <p className="text-xs text-gray-500">
                          {approvers.filter((a) => a.isMandatory).length > 1
                            ? "ALL mandatory approvers must approve"
                            : "This approver must approve before proceeding"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddNewLevel}
              className="flex items-center gap-2 text-[#3D873B] hover:text-[#2d6e2b] mt-2"
            >
              <FaPlus /> Add New Level
            </button>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="bg-[#3D873B] text-white rounded-md w-full md:w-auto mt-6 px-6 py-2 cursor-pointer hover:shadow-lg hover:opacity-70 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ApprovalConfiguration;
