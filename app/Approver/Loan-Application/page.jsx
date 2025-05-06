"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "@/app/components/Layout";
import roleService from "@/Services/roleService";
import staffService from "@/Services/staffService";
import Select from "react-select";

const LoanApproverAssignmentPage = () => {
  const [assignmentType, setAssignmentType] = useState("role"); // "role" or "staff"
  const [roles, setRoles] = useState([]);
  const [staffs, setStaffs] = useState([]);

  const loanTypes = [
    { value: "personal", label: "Personal Loan" },
    { value: "business", label: "Business Loan" },
    { value: "mortgage", label: "Mortgage Loan" },
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

  const [selectedLoanType, setSelectedLoanType] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");

  useEffect(() => {
    roleService.getAllRoles().then(setRoles).catch(console.error);
    staffService.getStaffs().then(setStaffs).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      loanTypeId: selectedLoanType,
      assigneeType: assignmentType,
      assigneeId: selectedAssignee,
    };

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/LoanApprover/assign`,
        payload
      );
      alert("Assignment successful");
    } catch (error) {
      console.error("Error assigning approver:", error);
      alert("Assignment failed");
    }
  };

  return (
    <Layout>
      <div className="w-full">
        <h2 className="text-4xl font-extrabold mb-4">
          Loan Approver Assignment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Loan Type</span>
            <Select
              options={loanTypes}
              styles={customStyles}
              onChange={(option) => setSelectedLoanType(option?.value)}
              placeholder="Select loan type"
              isClearable
            />
          </label>

          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="assignmentType"
                value="role"
                className="accent-green-600"
                checked={assignmentType === "role"}
                onChange={() => setAssignmentType("role")}
              />
              <span className="ml-2">Assign by Role</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                className="accent-green-600"
                name="assignmentType"
                value="staff"
                checked={assignmentType === "staff"}
                onChange={() => setAssignmentType("staff")}
              />
              <span className="ml-2">Assign by Staff</span>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">
              {assignmentType === "role" ? "Select Role" : "Select Staff"}
            </span>
            <Select
              options={
                assignmentType === "role"
                  ? roles.map((role) => ({
                      value: role.role_id,
                      label: role.name,
                    }))
                  : staffs.map((staff) => ({
                      value: staff.staffCode,
                      label: `${staff.firstName} ${staff.lastName}`,
                    }))
              }
              styles={customStyles}
              onChange={(option) => setSelectedAssignee(option?.value)}
              placeholder={`Select ${
                assignmentType === "role" ? "Role" : "Staff"
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

export default LoanApproverAssignmentPage;
