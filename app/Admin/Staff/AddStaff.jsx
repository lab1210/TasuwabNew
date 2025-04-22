"use client";
import branchService from "@/Services/branchService";
import departmentService from "@/Services/departmentService";
import positionService from "@/Services/positionService";
import roleService from "@/Services/roleService";
import staffService from "@/Services/staffService";
import React, { useEffect, useState } from "react";
const AddStaff = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    martialStatus: "",
    dateOfBirth: "",
    address: "",
    email: "",
    phone: "",
    staffImage: "", // Now directly input for image URL
    roleID: "",
    positionID: "",
    departmentID: "",
    branchID: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Branch state
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branchError, setBranchError] = useState(null);

  // Department state
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentError, setDepartmentError] = useState(null);

  // Position state
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [positionError, setPositionError] = useState(null);

  // Role state
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roleError, setRoleError] = useState(null);

  useEffect(() => {
    async function fetchBranches() {
      try {
        setLoadingBranches(true);
        const response = await branchService.getAllBranches();
        if (response && Array.isArray(response)) {
          setBranches(response);
        } else if (response?.data && Array.isArray(response.data)) {
          setBranches(response.data);
        } else {
          console.error("Unexpected response format for branches:", response);
          setBranchError("Failed to load branches.");
          setBranches([]);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        setBranchError("Error fetching branches.");
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    }

    async function fetchDepartments() {
      try {
        setLoadingDepartments(true);
        const response = await departmentService.getAllDepartments();
        if (response && Array.isArray(response)) {
          setDepartments(response);
        } else if (response?.data && Array.isArray(response.data)) {
          setDepartments(response.data);
        } else {
          console.error(
            "Unexpected response format for departments:",
            response
          );
          setDepartmentError("Failed to load departments.");
          setDepartments([]);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartmentError("Error fetching departments.");
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    }

    async function fetchPositions() {
      try {
        setLoadingPositions(true);
        const response = await positionService.getAllPositions();
        if (response && Array.isArray(response)) {
          setPositions(response);
        } else if (response?.data && Array.isArray(response.data)) {
          setPositions(response.data);
        } else {
          console.error("Unexpected response format for positions:", response);
          setPositionError("Failed to load positions.");
          setPositions([]);
        }
      } catch (error) {
        console.error("Error fetching positions:", error);
        setPositionError("Error fetching positions.");
        setPositions([]);
      } finally {
        setLoadingPositions(false);
      }
    }

    async function fetchRoles() {
      try {
        setLoadingRoles(true);
        const response = await roleService.getAllRoles();
        if (response && Array.isArray(response)) {
          setRoles(response);
        } else if (response?.data && Array.isArray(response.data)) {
          setRoles(response.data);
        } else {
          console.error("Unexpected response format for roles:", response);
          setRoleError("Failed to load roles.");
          setRoles([]);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRoleError("Failed to load roles.");
        setRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    }

    fetchBranches();
    fetchDepartments();
    fetchPositions();
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formattedDOB = formData.dateOfBirth.replace(/-/g, ""); // Remove hyphens

    const staffDataToSend = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      martialStatus: formData.martialStatus,
      dateOfBirth: formattedDOB, // Send the formatted DOB
      address: formData.address,
      email: { value: formData.email },
      phone: formData.phone,
      staffImage: formData.staffImage,
      roleID: formData.roleID,
      positionID: formData.positionID,
      departmentID: formData.departmentID,
      branchID: formData.branchID,
    };

    console.log("Form Data being sent:", staffDataToSend); // Log to verify the format

    try {
      const response = await staffService.createStaff(staffDataToSend);
      console.log("Create Staff Response:", response);
      onAdd();
      onClose();
    } catch (err) {
      console.error("Create Staff Error:", err.response || err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to add staff. Please try again."
      );
    }

    setLoading(false);
  };

  return (
    <div>
      {error && <p className="text-red-500 font-bold text-sm">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col">
            <label className="font-bold text-sm" htmlFor="firstName">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="border-b-2 border-b-gray-400 text-gray-400 outline-0  text-lg"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-bold text-sm" htmlFor="lastName">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="border-b-2 border-b-gray-400 text-gray-400 outline-0  text-lg"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-bold text-sm" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border-b-2 border-b-gray-400 text-gray-400 outline-0  text-lg"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-bold text-sm" htmlFor="address">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="border-b-2 border-b-gray-400 text-gray-400 outline-0  text-lg"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-bold text-sm" htmlFor="phone">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="border-b-2 border-b-gray-400 text-gray-400 outline-0  text-lg"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="dateOfBirth" className="font-bold text-sm">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="border-b-2 border-b-gray-400 text-gray-400 outline-0  text-lg"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-bold text-sm" htmlFor="firstName">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="border-b-2 border-b-gray-400 text-gray-400 outline-0  "
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-bold text-sm" htmlFor="martialStatus">
              Marital Status
            </label>
            <select
              name="martialStatus"
              value={formData.martialStatus}
              onChange={handleChange}
              className="border-b-2 border-b-gray-400 text-gray-400 outline-0  "
            >
              <option value="">Select Marital Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="roleID" className="font-bold text-sm">
              Role:
            </label>
            <select
              name="roleID"
              value={formData.roleID}
              onChange={handleChange}
              className="border-b-2 border-b-gray-400 text-gray-400 outline-0  "
              disabled={loadingRoles}
            >
              <option value="">Select Role</option>
              {loadingRoles ? (
                <option disabled>Loading roles...</option>
              ) : roleError ? (
                <option disabled>{roleError}</option>
              ) : (
                roles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="positionID" className="font-bold text-sm">
              Position:
            </label>
            <select
              name="positionID"
              value={formData.positionID}
              onChange={handleChange}
              className="border-b-2 border-b-gray-400 text-gray-400 outline-0"
              disabled={loadingPositions}
            >
              <option value="">Select Position</option>
              {loadingPositions ? (
                <option disabled>Loading positions...</option>
              ) : positionError ? (
                <option disabled>{positionError}</option>
              ) : (
                positions.map((pos) => (
                  <option key={pos.position_id} value={pos.position_id}>
                    {pos.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="departmentID" className="font-bold text-sm">
              Department
            </label>
            <select
              name="departmentID"
              value={formData.departmentID}
              onChange={handleChange}
              className="border-b-2 border-b-gray-400 text-gray-400 outline-0 "
              disabled={loadingDepartments}
            >
              <option value="">Select Department</option>
              {loadingDepartments ? (
                <option disabled>Loading departments...</option>
              ) : departmentError ? (
                <option disabled>{departmentError}</option>
              ) : (
                departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="branchID" className="font-bold text-sm">
              Branch:
            </label>
            <select
              name="branchID"
              value={formData.branchID}
              onChange={handleChange}
              className="border-b-2 border-b-gray-400 text-gray-400 outline-0 "
              disabled={loadingBranches}
            >
              <option value="">Select Branch</option>
              {loadingBranches ? (
                <option disabled>Loading branches...</option>
              ) : branchError ? (
                <option disabled>{branchError}</option>
              ) : (
                branches.map((branch) => (
                  <option key={branch.branch_id} value={branch.branch_id}>
                    {branch.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>{" "}
        <div>
          <button
            type="submit"
            className="bg-[#3D873B] text-white rounded-md w-full mt-6 p-2 cursor-pointer hover:shadow-lg hover:opacity-70 "
            onClick={handleSubmit}
          >
            {loading ? "Adding" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStaff;
