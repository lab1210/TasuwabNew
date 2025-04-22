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
          <div>
            {hasPrivilege("AddDepartment") && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="bg-[#333] text-white p-2 rounded-md cursor-pointer hover:scale-90"
              >
                + Add Department
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col w-full gap-10">
          <div className="bg-white">
            <input
              type="text"
              placeholder="Search..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="placeholder:text-sm border p-1 w-full rounded-md border-gray-200 outline-0"
            />
          </div>
          <div className="w-full overflow-x-hidden">
            {filteredDepartments.map((department) => (
              <div
                className="w-full shadow-md flex flex-col lg:grid lg:grid-cols-2 p-5 lg:items-start rounded-md"
                key={department.department_id}
              >
                <div>
                  <div className="flex-1 lg:mb-0 mb-4">
                    <p className="font-extrabold text-lg mb-1.5">
                      {department.name}
                    </p>
                    <p className="text-[#3D873B] text-sm">
                      {department.description}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex gap-3 flex-wrap lg:justify-end ">
                    <div className="text-xs flex items-center gap-2">
                      <p className="font-bold text-sm">ID:</p>{" "}
                      {department.department_id}
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      <p className="font-bold text-sm">Email:</p>{" "}
                      {department.email}
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      <p className="font-bold text-sm">Phone:</p>{" "}
                      {department.phone}
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      <p className="font-bold text-sm">Status:</p>{" "}
                      {department.is_active ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    {hasPrivilege("UpdateDepartment") && (
                      <FaEdit
                        className="cursor-pointer"
                        size={20}
                        onClick={() => {
                          setSelectedDepartment(department);
                          setEditModalOpen(true);
                        }}
                      />
                    )}
                    {hasPrivilege("DeleteDepartment") && (
                      <FaTrash
                        size={20}
                        className="text-red-500 cursor-pointer"
                        onClick={() => {
                          setSelectedDepartment(department);
                          setDeleteModalOpen(true);
                        }}
                      />
                    )}
                  </div>
                </div>

                <div>
                  {department.is_active
                    ? hasPrivilege("DeactivateDepartment") && (
                        <button
                          onClick={() =>
                            handleDeactivate(department.department_id)
                          }
                          disabled={deactivatingId === department.department_id}
                          className="bg-red-600 text-white text-sm p-2 rounded-md mt-8 cursor-pointer"
                        >
                          {deactivatingId === department.department_id
                            ? "Deactivating..."
                            : "Deactivate"}
                        </button>
                      )
                    : hasPrivilege("DeactivateDepartment") && (
                        <button
                          onClick={() =>
                            handleActivate(department.department_id)
                          }
                          disabled={activatingId === department.department_id}
                          className="bg-green-600 text-white text-sm p-2 rounded-md mt-8 cursor-pointer"
                        >
                          {deactivatingId === department.department_id
                            ? "Activating..."
                            : "Activate"}
                        </button>
                      )}
                  {activationError && (
                    <p className="text-xs text-red-500">{activationError}</p>
                  )}
                  {deactivationError && (
                    <p className="text-xs text-red-500">{deactivationError}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
