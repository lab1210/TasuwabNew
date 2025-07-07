"use client";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import roleService from "@/Services/roleService";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaEdit, FaTrash } from "react-icons/fa";
import AddRole from "./AddRole";
import DeleteRole from "./DeleteRole";
import Modal from "@/app/components/Modal";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
                onClick={() => router.push("/Admin/Role/Add")}
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
          <div className="overflow-x-auto w-full">
            <table className="w-full table-auto divide-y divide-gray-200 shadow-lg rounded-md">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Description</th>
                  <th className="text-left py-3 px-4">Role ID</th>
                  <th className="text-left py-3 px-4">Privileges</th>
                  <th className="text-left py-3 px-4 ">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-200">
                {filteredRoles.map((role) => (
                  <React.Fragment key={role.role_id}>
                    <tr className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 ">{role.name}</td>
                      <td className="py-3 px-4 text-[#3D873B]">
                        {role.description}
                      </td>
                      <td className="py-3 px-4">{role.role_id}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => togglePrivileges(role.role_id)}
                          className="border border-[#ccc] rounded-md px-2 py-1 text-xs flex items-center gap-1 hover:border-[#999] transition-all"
                        >
                          View{" "}
                          {isExpanded(role.role_id) ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-3">
                          {hasPrivilege("UpdateRole") && (
                            <FaEdit
                              className="cursor-pointer text-[#333]"
                              onClick={() => {
                                router.push(`/Admin/Role/${role.role_id}/edit`);
                              }}
                            />
                          )}
                          {hasPrivilege("DeleteRole") && (
                            <FaTrash
                              className="cursor-pointer text-red-600"
                              onClick={() => {
                                setSelectedRole(role);
                                setDeleteModalOpen(true);
                              }}
                            />
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Privileges Row */}
                    {isExpanded(role.role_id) && (
                      <tr>
                        <td colSpan={5} className="p-4 bg-[#f9f9f9] ">
                          {role.privileges?.length > 0 ? (
                            <ul className="list-disc ml-4">
                              {role.privileges.map((priv) => (
                                <li key={priv.privilegeId}>
                                  <span className="font-bold">
                                    {priv.name}:
                                  </span>{" "}
                                  <span className="text-sm">
                                    {priv.description}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm">
                              No privileges assigned to this role.
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filteredRoles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      No roles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
