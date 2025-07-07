"use client";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import branchService from "@/Services/branchService";
import roleService from "@/Services/roleService";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Modal from "@/app/components/Modal";
import AddBranch from "./AddBranch";
import EditBranch from "./EditBranch";
import DeleteBranch from "./DeleteBranch";
const BranchList = () => {
  const [filterText, setFilterText] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);
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
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await branchService.getAllBranches();
      if (response?.data && Array.isArray(response.data)) {
        setBranches(response.data);
      } else if (Array.isArray(response)) {
        setBranches(response);
      } else {
        console.warn("Unexpected branch data format:", response);
        setError("Failed to load branches: Data format incorrect.");
        setBranches([]);
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      setError("Failed to load branches.");
      setBranches([]);
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
      await branchService.activateBranch(id);
      fetchBranches();
    } catch (error) {
      console.error("Error activating branch:", error);
      setActivationError(`Failed to activate branch with ID ${id}`);
    } finally {
      setActivatingId(null);
    }
  };
  const handleDeactivate = async (id) => {
    setDeactivatingId(id);
    setDeactivationError(null);
    try {
      await branchService.deactivateBranch(id);
      fetchBranches();
    } catch (error) {
      console.error("Error deactivating branch:", error);
      setDeactivationError(`Failed to deactivate branch with ID ${id}`);
    } finally {
      setDeactivatingId(null);
    }
  };
  const filteredBranch =
    branches?.filter(
      (branch) =>
        branch.name?.toLowerCase().includes(filterText.toLowerCase()) ||
        branch.description?.toLowerCase().includes(filterText.toLowerCase()) ||
        branch.email?.toLowerCase().includes(filterText.toLowerCase()) ||
        branch.phone?.includes(filterText.toLowerCase()) ||
        String(branch.branch_id)
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
          <button onClick={fetchBranches}>Retry</button>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="grid grid-rows-[100px_1fr] gap-5 w-full">
        <div className="bg-[#DFF6DD] w-full flex justify-between items-center rounded-md p-5 sticky top-0">
          <div className="flex flex-col gap-3">
            <p className="font-bold text-lg">Total Branches</p>
            <p className="font-extrabold text-4xl">{branches.length}</p>
          </div>
          <div>
            {hasPrivilege("AddBranch") && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="bg-[#333] text-white p-2 rounded-md cursor-pointer hover:scale-90"
              >
                + Add Branch
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col w-full gap-10">
          <div className="sticky top-30 z-[1000] bg-white">
            <input
              type="text"
              placeholder="Search..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="placeholder:text-sm border p-1 w-full rounded-md border-gray-200 outline-0"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto divide-y divide-gray-200 shadow-lg rounded-md">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Description</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Status</th>
                  {hasPrivilege(
                    "UpdateBranch" ||
                      "DeleteBranch" ||
                      "ActivateBranch" ||
                      "DeactivateBranch"
                  ) && <th className="text-left py-3 px-4 ">Actions</th>}
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-200">
                {filteredBranch.map((branch) => (
                  <tr key={branch.branch_id}>
                    <td className="py-3 px-4">{branch.name}</td>
                    <td className="py-3 px-4">{branch.description}</td>
                    <td className="py-3 px-4">{branch.email}</td>
                    <td className="py-3 px-4">{branch.phone}</td>
                    <td className="py-3 px-4">{branch.branch_id}</td>
                    <td className="py-3 px-4">
                      {branch.is_active ? "Active" : "Inactive"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center gap-2 justify-center flex-wrap">
                        {hasPrivilege("UpdateBranch") && (
                          <FaEdit
                            className="cursor-pointer text-[#333]"
                            onClick={() => {
                              setSelectedBranch(branch);
                              setEditModalOpen(true);
                            }}
                          />
                        )}
                        {hasPrivilege("DeleteBranch") && (
                          <FaTrash
                            className="cursor-pointer text-red-600"
                            onClick={() => {
                              setSelectedBranch(branch);
                              setDeleteModalOpen(true);
                            }}
                          />
                        )}
                        {branch.is_active
                          ? hasPrivilege("DeactivateBranch") && (
                              <button
                                onClick={() =>
                                  handleDeactivate(branch.branch_id)
                                }
                                disabled={deactivatingId === branch.branch_id}
                                className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                              >
                                {deactivatingId === branch.branch_id
                                  ? "Deactivating..."
                                  : "Deactivate"}
                              </button>
                            )
                          : hasPrivilege("ActivateBranch") && (
                              <button
                                onClick={() => handleActivate(branch.branch_id)}
                                disabled={activatingId === branch.branch_id}
                                className="bg-green-600 text-white text-xs px-2 py-1 rounded"
                              >
                                {activatingId === branch.branch_id
                                  ? "Activating..."
                                  : "Activate"}
                              </button>
                            )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredBranch.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No Branches available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Branch"
        description="Fill in the form to edit a branch."
      >
        {selectedBranch && hasPrivilege("UpdateBranch") && (
          <EditBranch
            branch={selectedBranch}
            onClose={() => setEditModalOpen(false)}
            onUpdate={fetchBranches}
          />
        )}
      </Modal>

      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Branch"
        description="Fill in the form to add a branch."
      >
        {hasPrivilege("AddBranch") && (
          <AddBranch
            onClose={() => setAddModalOpen(false)}
            onAdd={fetchBranches}
          />
        )}
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        {selectedBranch && hasPrivilege("DeleteBranch") && (
          <DeleteBranch
            branch={selectedBranch}
            onClose={() => setDeleteModalOpen(false)}
            onDelete={fetchBranches}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default BranchList;
