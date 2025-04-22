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
          <div className="w-full overflow-y-auto overflow-x-hidden">
            {filteredBranch.map((branch) => (
              <div
                className="w-full shadow-md flex flex-col lg:grid lg:grid-cols-2 p-5 lg:items-start rounded-md"
                key={branch.branch_id}
              >
                <div>
                  <div className="flex-1 lg:mb-0 mb-4">
                    <p className="font-extrabold text-lg mb-1.5">
                      {branch.name}
                    </p>
                    <p className="text-[#3D873B] text-sm">
                      {branch.description}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex gap-3 flex-wrap lg:justify-end ">
                    <div className="text-xs flex items-center gap-2">
                      <p className="font-bold text-sm">ID:</p>{" "}
                      {branch.branch_id}
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      <p className="font-bold text-sm">Email:</p> {branch.email}
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      <p className="font-bold text-sm">Phone:</p> {branch.phone}
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      <p className="font-bold text-sm">Status:</p>{" "}
                      {branch.is_active ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    {hasPrivilege("UpdateBranch") && (
                      <FaEdit
                        className="cursor-pointer"
                        size={20}
                        onClick={() => {
                          setSelectedBranch(branch);
                          setEditModalOpen(true);
                        }}
                      />
                    )}
                    {hasPrivilege("DeleteBranch") && (
                      <FaTrash
                        size={20}
                        className="text-red-500 cursor-pointer"
                        onClick={() => {
                          setSelectedBranch(branch);
                          setDeleteModalOpen(true);
                        }}
                      />
                    )}
                  </div>
                </div>

                <div>
                  {branch.is_active
                    ? hasPrivilege("DeactivateBranch") && (
                        <button
                          onClick={() => handleDeactivate(branch.branch_id)}
                          disabled={deactivatingId === branch.branch_id}
                          className="bg-red-600 text-white text-sm p-2 rounded-md mt-8 cursor-pointer"
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
                          className="bg-green-600 text-white text-sm p-2 rounded-md mt-8 cursor-pointer"
                        >
                          {deactivatingId === branch.branch_id
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
