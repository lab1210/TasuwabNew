"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "@/app/components/Layout";
import roleService from "@/Services/roleService";
import staffService from "@/Services/staffService";
import Select from "react-select";

const TransactionApprovalPage = () => {
  const [approvalType, setApprovalType] = useState("role"); // "role" or "staff"
  const [roles, setRoles] = useState([]);
  const [staffs, setStaffs] = useState([]);

  const transactionTypes = [
    { value: "Disburse", label: "Disbursement" },
    { value: "repay", label: "Repayment" },
  ];
  const customStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#22c55e", // Tailwind green-500
      "&:hover": { borderColor: "#16a34a" }, // Tailwind green-600
      boxShadow: "none",
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? "#22c55e" : isFocused ? "#bbf7d0" : "white",
      color: isSelected ? "white" : "black",
      cursor: "pointer",
    }),
  };

  const [selectedTransactionType, setSelectedTransactionType] = useState("");
  const [selectedApprover, setSelectedApprover] = useState("");

  useEffect(() => {
    roleService.getAllRoles().then(setRoles).catch(console.error);
    staffService.getStaffs().then(setStaffs).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      transactionTypeId: selectedTransactionType,
      approverType: approvalType,
      approverId: selectedApprover,
    };

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/TransactionApprover/assign`,
        payload
      );
      alert("Transaction approved successfully");
    } catch (error) {
      console.error("Error approving transaction:", error);
      alert("Approval failed");
    }
  };

  return (
    <Layout>
      <div className="w-full">
        <h2 className="text-4xl font-extrabold mb-4">
          Transaction Approver Assignment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Transaction Type</span>
            <Select
              options={transactionTypes}
              styles={customStyles}
              onChange={(option) => setSelectedTransactionType(option?.value)}
              placeholder="Select transaction type"
            />
          </label>

          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="approvalType"
                value="role"
                className="accent-green-600"
                checked={approvalType === "role"}
                onChange={() => setApprovalType("role")}
              />
              <span className="ml-2">Approve by Role</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                className="accent-green-600"
                name="approvalType"
                value="staff"
                checked={approvalType === "staff"}
                onChange={() => setApprovalType("staff")}
              />
              <span className="ml-2">Approve by Staff</span>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">
              {approvalType === "role" ? "Select Role" : "Select Staff"}
            </span>
            <Select
              options={
                approvalType === "role"
                  ? roles.map((role) => ({
                      value: role.id,
                      label: role.name,
                    }))
                  : staffs.map((staff) => ({
                      value: staff.staffCode,
                      label: `${staff.firstName} ${staff.lastName}`,
                    }))
              }
              styles={customStyles}
              onChange={(option) => setSelectedApprover(option?.value)}
              placeholder={`Select ${
                approvalType === "role" ? "Role" : "Staff"
              }`}
              isClearable
            />
          </label>

          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 cursor-pointer"
          >
            Assign
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default TransactionApprovalPage;
