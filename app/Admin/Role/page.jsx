"use client";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import roleService from "@/Services/roleService";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaEdit, FaTrash } from "react-icons/fa";
import AddRole from "./AddRole";
import EditRole from "./EditRole";
import DeleteRole from "./DeleteRole";
import Modal from "@/app/components/Modal";

const Role = () => {
  const [filterText, setFilterText] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRoleId, setExpandedRoleId] = useState(null);
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

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await roleService.getAllRoles();
      if (response?.data && Array.isArray(response.data)) {
        setRoles(response.data);
      } else if (Array.isArray(response)) {
        setRoles(response);
      } else {
        console.warn("Unexpected role data format:", response);
        setError("Failed to load roles: Data format incorrect.");
        setRoles([]);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setError("Failed to load roles.");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  //Fetching Roles
  useEffect(() => {
    fetchRoles();
  }, []);

  const hasPrivilege = (privilegeName) => {
    return !loadingPrivileges && rolePrivileges.includes(privilegeName);
  };

  const togglePrivileges = (roleId) => {
    setExpandedRoleId((prevId) => (prevId === roleId ? null : roleId));
  };

  const isExpanded = (roleId) => expandedRoleId === roleId;

  const filteredRoles =
    roles?.filter(
      (role) =>
        role.name?.toLowerCase().includes(filterText.toLowerCase()) ||
        role.description?.toLowerCase().includes(filterText.toLowerCase()) ||
        role.role_id?.toLowerCase().includes(filterText.toLowerCase())
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
          <button onClick={fetchRoles}>Retry</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid grid-rows-[100px_1fr] gap-5 w-full">
        <div className="bg-[#DFF6DD] w-full flex justify-between items-center rounded-md p-5">
          <div className="flex flex-col gap-3">
            <p className="font-bold text-lg">Total Roles</p>
            <p className="font-extrabold text-4xl">{roles.length}</p>
          </div>
          <div>
            {hasPrivilege("CreateRole") && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="bg-[#333] text-white p-2 rounded-md cursor-pointer hover:scale-90"
              >
                + Add Role
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
            {filteredRoles.map((role) => (
              <div>
                <div
                  className="w-full shadow-md flex flex-col lg:grid lg:grid-cols-2 p-5 lg:items-start rounded-md"
                  key={role.role_id}
                >
                  <div>
                    <div className="flex-1 lg:mb-0 mb-4">
                      <p className="font-extrabold text-lg mb-1.5">
                        {role.name}
                      </p>
                      <p className="text-[#3D873B] text-sm">
                        {role.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex gap-3 flex-wrap lg:justify-end ">
                      <div className="text-xs flex items-center gap-2">
                        <p className="font-bold text-sm">ID:</p> {role.role_id}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        className="border border-[#ccc] rounded-md p-1 cursor-pointer text-sm flex items-center gap-2 hover:border-[#999] transition-all"
                        onClick={() => togglePrivileges(role.role_id)}
                      >
                        Privileges{" "}
                        {isExpanded(role.role_id) ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </button>
                      {hasPrivilege("UpdateRole") && (
                        <FaEdit
                          size={20}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedRole(role);
                            setEditModalOpen(true);
                          }}
                        />
                      )}
                      {hasPrivilege("DeleteRole") && (
                        <FaTrash
                          size={20}
                          className="text-red-500 cursor-pointer"
                          onClick={() => {
                            setSelectedRole(role);
                            setDeleteModalOpen(true);
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded(role.role_id) && role.privileges && (
                  <div className="w-full h-50 mt-4 p-4 border border-[#eee] rounded-md bg-[#f9f9f9] overflow-y-scroll">
                    <ul>
                      {role.privileges.map((privilege) => (
                        <li
                          key={privilege.privilegeId}
                          className="flex gap-4 font-bold text-sm"
                        >
                          {privilege.name || "Unknown Privilege"}:
                          <span className="text-xs">
                            {privilege.description}
                          </span>
                        </li>
                      ))}
                      {role.privileges.length === 0 && (
                        <li className="text-sm">
                          No privileges assigned to this role.
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Role"
        description="Fill in the form to add a role."
      >
        {hasPrivilege("CreateRole") && (
          <AddRole onClose={() => setAddModalOpen(false)} onAdd={fetchRoles} />
        )}
      </Modal>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Role"
        description="Fill in the form to edit a role."
      >
        {selectedRole && hasPrivilege("UpdateRole") && (
          <EditRole
            role={selectedRole}
            onClose={() => setEditModalOpen(false)}
            onUpdate={fetchRoles}
          />
        )}
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        {selectedRole && hasPrivilege("DeleteRole") && (
          <DeleteRole
            role={selectedRole}
            onClose={() => setDeleteModalOpen(false)}
            onDelete={fetchRoles}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default Role;
