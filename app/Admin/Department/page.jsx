"use client";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import departmentService from "@/Services/departmentService";
import roleService from "@/Services/roleService";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditDept from "./EditDept";
import AddDept from "./AddDept";
import DeleteDept from "./DeleteDept";
import Modal from "@/app/components/Modal";

const Departments = () => {
  const [filterText, setFilterText] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activatingId, setActivatingId] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);
  const [activationError, setActivationError] = useState(null);
  const [deactivationError, setDeactivationError] = useState(null);
  const { user } = useAuth();
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);

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
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentService.getAllDepartments();
      if (response?.data && Array.isArray(response.data)) {
        setDepartments(response.data);
      } else if (Array.isArray(response)) {
        setDepartments(response);
      } else {
        console.warn("Unexpected department data format:", response);
        setError("Failed to load departments: Data format incorrect.");
        setDepartments([]);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      setError("Failed to load departments.");
      setDepartments([]);
    } finally {
      setLoading(false);
      setActivatingId(null);
      setDeactivatingId(null);
    }
  };

  const hasPrivilege = (privilegeName) => {
    return !loadingPrivileges && rolePrivileges.includes(privilegeName);
  };

  const handleActivate = async (id) => {
    setActivatingId(id);
    setActivationError(null);
    try {
      await departmentService.activateDepartment(id);
      fetchDepartments();
    } catch (error) {
      console.error("Error activating department:", error);
      setActivationError(`Failed to activate department with ID ${id}`);
    } finally {
      setActivatingId(null);
    }
  };

  const handleDeactivate = async (id) => {
    setDeactivatingId(id);
    setDeactivationError(null);
    try {
      await departmentService.deactivateDepartment(id);
      fetchDepartments();
    } catch (error) {
      console.error("Error deactivating department:", error);
      setDeactivationError(`Failed to deactivate department with ID ${id}`);
    } finally {
      setDeactivatingId(null);
    }
  };

  const filteredDepartments =
    departments?.filter(
      (department) =>
        department.name?.toLowerCase().includes(filterText.toLowerCase()) ||
        department.description
          ?.toLowerCase()
          .includes(filterText.toLowerCase()) ||
        department.email?.toLowerCase().includes(filterText.toLowerCase()) ||
        department.phone?.includes(filterText.toLowerCase()) ||
        String(department.department_id)
          ?.toLowerCase()
          .includes(filterText.toLowerCase())
    ) || [];

  if (loading || loadingPrivileges) {
    return (
      <Layout>
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="w-12 h-12 border-4 border-[#333] border-t-[#3D873B] rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div>
          <p>{error}</p>
          <button onClick={fetchDepartments}>Retry</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid grid-rows-[100px_1fr] gap-5 w-full">
        <div className="bg-[#DFF6DD] w-full flex justify-between items-center rounded-md p-5">
          <div className="flex flex-col gap-3">
            <p className="font-bold text-lg">Total Departments</p>
            <p className="font-extrabold text-4xl">{departments.length}</p>
          </div>
          {hasPrivilege("AddDepartment") && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="bg-[#333] text-white p-2 rounded-md cursor-pointer hover:scale-90"
            >
              + Add Department
            </button>
          )}
        </div>

        <div className="flex flex-col w-full gap-5">
          <div className="bg-white">
            <input
              type="text"
              placeholder="Search..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="placeholder:text-sm border p-1 w-full rounded-md border-gray-200 outline-0"
            />
          </div>

          <div className="overflow-x-auto ">
            <table className="w-full table-auto divide-y divide-gray-200 shadow-lg rounded-md">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Description</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-200">
                {filteredDepartments.map((dept) => (
                  <tr
                    key={dept.department_id}
                    className="text-sm text-gray-700"
                  >
                    <td className="py-3 px-4">{dept.department_id}</td>
                    <td className="py-3 px-4 font-semibold">{dept.name}</td>
                    <td className="py-3 px-4">{dept.description}</td>
                    <td className="py-3 px-4">{dept.email}</td>
                    <td className="py-3 px-4">{dept.phone}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded ${
                          dept.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {dept.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap space-x-2">
                      {hasPrivilege("UpdateDepartment") && (
                        <button
                          onClick={() => {
                            setSelectedDepartment(dept);
                            setEditModalOpen(true);
                          }}
                          className="text-[#333] cursor-pointer"
                        >
                          <FaEdit />
                        </button>
                      )}
                      {hasPrivilege("DeleteDepartment") && (
                        <button
                          onClick={() => {
                            setSelectedDepartment(dept);
                            setDeleteModalOpen(true);
                          }}
                          className="text-red-500 cursor-pointer hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      )}
                      {dept.is_active
                        ? hasPrivilege("DeactivateDepartment") && (
                            <button
                              onClick={() =>
                                handleDeactivate(dept.department_id)
                              }
                              disabled={deactivatingId === dept.department_id}
                              className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                            >
                              {deactivatingId === dept.department_id
                                ? "..."
                                : "Deactivate"}
                            </button>
                          )
                        : hasPrivilege("DeactivateDepartment") && (
                            <button
                              onClick={() => handleActivate(dept.department_id)}
                              disabled={activatingId === dept.department_id}
                              className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                            >
                              {activatingId === dept.department_id
                                ? "..."
                                : "Activate"}
                            </button>
                          )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activationError && (
              <p className="text-xs text-red-500 px-4">{activationError}</p>
            )}
            {deactivationError && (
              <p className="text-xs text-red-500 px-4">{deactivationError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Department"
        description="Fill in the form to edit a department."
      >
        {selectedDepartment && hasPrivilege("UpdateDepartment") && (
          <EditDept
            department={selectedDepartment}
            onClose={() => setEditModalOpen(false)}
            onUpdate={fetchDepartments}
          />
        )}
      </Modal>

      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Department"
        description="Fill in the form to add a department."
      >
        {hasPrivilege("AddDepartment") && (
          <AddDept
            onClose={() => setAddModalOpen(false)}
            onAdd={fetchDepartments}
          />
        )}
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        {selectedDepartment && hasPrivilege("DeleteDepartment") && (
          <DeleteDept
            department={selectedDepartment}
            onClose={() => setDeleteModalOpen(false)}
            onDelete={fetchDepartments}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default Departments;
