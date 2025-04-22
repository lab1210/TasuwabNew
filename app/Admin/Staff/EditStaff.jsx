import { useAuth } from "@/Services/authService";
import branchService from "@/Services/branchService";
import departmentService from "@/Services/departmentService";
import positionService from "@/Services/positionService";
import roleService from "@/Services/roleService";
import React, { useEffect, useState } from "react";
import axios from "axios";
import staffService from "@/Services/staffService";

const EditStaff = ({ staffCode, onClose, onUpdate }) => {
  console.log("EditStaff rendered with staffCode:", staffCode);

  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPrivileges = async () => {
      if (user?.role) {
        setLoadingPrivileges(true);
        try {
          const allRolesResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/Role/all`
          );
          const allRoles = allRolesResponse.data;
          const foundRole = allRoles.find((r) => r.role_id === user.role);
          setRolePrivileges(foundRole?.privileges?.map((p) => p.name) || []);
        } catch (error) {
          console.error("Error fetching roles:", error);
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

  const hasPrivilege = (privilegeName) => {
    return !loadingPrivileges && rolePrivileges.includes(privilegeName);
  };
  // Change prop to staffCode
  const [formData, setFormData] = useState({
    staffCode: "",
    firstName: "",
    lastName: "",
    gender: "",
    martialStatus: "",
    dateOfBirth: "",
    address: "",
    email: { value: "" },
    phone: "",
    staffImage: "",
    roleID: "",
    positionID: "",
    departmentID: "",
    branchID: "",
  });

  const [message, setMessage] = useState("");
  const [branches, setBranches] = useState();
  const [error, setError] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branchError, setBranchError] = useState(null);

  const [departments, setDepartments] = useState();
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentError, setDepartmentError] = useState(null);

  const [positions, setPositions] = useState();
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [positionError, setPositionError] = useState(null);

  const [roles, setRoles] = useState();
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roleError, setRoleError] = useState(null);

  const [loadingStaff, setLoadingStaff] = useState(true); // New loading state for staff

  useEffect(() => {
    async function fetchBranches() {
      try {
        setLoadingBranches(true);
        const response = await branchService.getAllBranches();
        if (response?.data && Array.isArray(response.data)) {
          setBranches(response.data);
        } else if (response && Array.isArray(response)) {
          setBranches(response);
        } else {
          console.error("Unexpected response format for branches:", response);
          setBranchError("Failed to load branches.");
          setBranches();
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        setBranchError("Error fetching branches.");
        setBranches();
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
          setDepartments();
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartmentError("Error fetching departments.");
        setDepartments();
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
          setPositions();
        }
      } catch (error) {
        console.error("Error fetching positions:", error);
        setPositionError("Error fetching positions.");
        setPositions();
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
          setRoles();
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRoleError("Error fetching roles.");
        setRoles();
      } finally {
        setLoadingRoles(false);
      }
    }

    fetchBranches();
    fetchDepartments();
    fetchPositions();
    fetchRoles();
  }, []);

  useEffect(() => {
    console.log(
      "fetchStaffDetails useEffect triggered with staffCode:",
      staffCode
    );
    const fetchStaffDetails = async () => {
      if (staffCode) {
        setLoadingStaff(true);
        try {
          const response = await staffService.getStaff(staffCode);
          if (response.success && response.staff) {
            const staffData = response.staff;
            const userData = response.user; // Extract user data

            const dobInteger = staffData.dateOfBirth;
            const yyyy = String(dobInteger).slice(0, 4);
            const mm = String(dobInteger).slice(4, 6);
            const dd = String(dobInteger).slice(6, 8);
            const formattedDOBForInput = `${yyyy}-${mm}-${dd}`;

            setFormData({
              staffCode: staffData.staffCode || "",
              firstName: staffData.firstName || "",
              lastName: staffData.lastName || "",
              gender: staffData.gender || "",
              martialStatus: staffData.martialStatus || "",
              dateOfBirth: formattedDOBForInput || "", // Set formatted DOB for date input
              address: staffData.address || "",
              email: { value: staffData.email || "" },
              phone: staffData.phone || "",
              staffImage: staffData.staffImage || "",
              roleID: userData.roleCode || "", // Use roleCode from user
              positionID: userData.positionCode || "", // Use positionCode from user
              departmentID: userData.departmentCode || "", // Use departmentCode from user
              branchID: userData.branchCode || "", // Use branchCode from user
            });
          } else {
            setError(response.message || "Failed to fetch staff details.");
          }
        } catch (error) {
          console.error("Error fetching staff details:", error);
          setError("Error fetching staff details.");
        } finally {
          setLoadingStaff(false);
        }
      }
    };

    fetchStaffDetails();
  }, [staffCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setFormData({ ...formData, [name]: { value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit triggered");
    setMessage("");
    setError("");

    try {
      const formattedDOBForBackend = formData.dateOfBirth.replace(/-/g, "");

      const updatedFormData = {
        ...formData,
        dateOfBirth: formattedDOBForBackend,
      };
      console.log("Data being sent to editStaff:", updatedFormData);
      const response = await staffService.editStaff(updatedFormData);
      if (response.success) {
        setMessage("Staff updated successfully!");
        onUpdate();
        setTimeout(() => {
          setMessage("");
          onClose();
        }, 2000);
      } else {
        setError(response.message || "Failed to update staff.");
      }
    } catch (err) {
      setError("Failed to update staff. Please try again.");
      console.error("Error updating staff:", err);
    }
  };

  if (loadingStaff) {
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="w-12 h-12 border-4 border-[#333] border-t-[#3D873B] rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div>
      {message && <p className="text-green-500 font-bold text-sm">{message}</p>}
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
              value={formData.email.value}
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
              disabled={loadingRoles || !hasPrivilege("EditStaffRole")}
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
            {!hasPrivilege("EditStaffRole") && (
              <p className="text-red-500 mt-2 text-xs font-bold ">
                Not Authorized to edit roles.
              </p>
            )}
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
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStaff;
