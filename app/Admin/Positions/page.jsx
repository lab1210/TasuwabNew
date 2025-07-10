"use client";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import positionService from "@/Services/positionService";
import roleService from "@/Services/roleService";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import AddPosition from "./AddPosition";
import EditPosition from "./EditPosition";
import DeletePosition from "./DeletePosition";
import Modal from "@/app/components/Modal";

const Positions = () => {
  const [filterText, setFilterText] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await positionService.getAllPositions();
      if (response?.data && Array.isArray(response.data)) {
        setPositions(response.data);
      } else if (Array.isArray(response)) {
        setPositions(response);
      } else {
        console.warn("Unexpected position data format:", response);
        setError("Failed to load positions: Data format incorrect.");
        setPositions([]);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
      setError("Failed to load positions.");
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  const hasPrivilege = (privilegeName) => {
    return !loadingPrivileges && rolePrivileges.includes(privilegeName);
  };

  const filteredPositions =
    positions?.filter(
      (position) =>
        position.name?.toLowerCase().includes(filterText.toLowerCase()) ||
        position.description
          ?.toLowerCase()
          .includes(filterText.toLowerCase()) ||
        String(position.position_id)
          ?.toLowerCase()
          .includes(filterText.toLowerCase())
    ) || [];

  if (loading || loadingPrivileges) {
    return (
      <Layout>
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="relative w-14 h-14">
            <div className="absolute w-full h-full border-4 border-[#333] border-t-[#3D873B] rounded-full animate-spin"></div>

            <div className="absolute inset-0 flex items-center justify-center font-bold text-[#3D873B] text-xl">
              T
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div>
          <p>{error}</p>
          <button onClick={fetchPositions}>Retry</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center bg-[#DFF6DD] p-5 rounded-md mb-4">
        <div>
          <p className="font-bold text-lg">Total Positions</p>
          <p className="font-extrabold text-4xl">{positions.length}</p>
        </div>
        {hasPrivilege("AddPosition") && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-[#333] text-white px-4 py-2 rounded-md hover:scale-95"
          >
            + Add Position
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search by ID, name or description..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded-md w-full"
      />

      <div className="overflow-x-auto">
        <table className="w-full table-auto divide-y divide-gray-200 shadow-lg rounded-md">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="text-left py-3 px-4">ID</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Description</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-200">
            {filteredPositions.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  No positions found.
                </td>
              </tr>
            ) : (
              filteredPositions.map((position) => (
                <tr key={position.position_id}>
                  <td className="py-3 px-4">{position.position_id}</td>
                  <td className="py-3 px-4">{position.name}</td>
                  <td className="py-3 px-4">{position.description}</td>
                  <td className="py-3 px-4 flex gap-3">
                    {hasPrivilege("UpdatePosition") && (
                      <FaEdit
                        size={18}
                        className="cursor-pointer text-[#333]                ]"
                        onClick={() => {
                          setSelectedPosition(position);
                          setEditModalOpen(true);
                        }}
                      />
                    )}
                    {hasPrivilege("DeletePosition") && (
                      <FaTrash
                        size={18}
                        className="cursor-pointer text-red-500"
                        onClick={() => {
                          setSelectedPosition(position);
                          setDeleteModalOpen(true);
                        }}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Position"
        description="Fill in the form to add a position."
      >
        <AddPosition
          onClose={() => setAddModalOpen(false)}
          onAdd={fetchPositions}
        />
      </Modal>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Position"
        description="Fill in the form to edit the position."
      >
        {selectedPosition && (
          <EditPosition
            position={selectedPosition}
            onClose={() => setEditModalOpen(false)}
            onUpdate={fetchPositions}
          />
        )}
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        {selectedPosition && (
          <DeletePosition
            position={selectedPosition}
            onClose={() => setDeleteModalOpen(false)}
            onDelete={fetchPositions}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default Positions;
