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
          <button onClick={fetchPositions}>Retry</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid grid-rows-[100px_1fr] gap-5 w-full">
        <div className="bg-[#DFF6DD] w-full flex justify-between items-center rounded-md p-5">
          <div className="flex flex-col gap-3">
            <p className="font-bold text-lg">Total Positions</p>
            <p className="font-extrabold text-4xl">{positions.length}</p>
          </div>
          <div>
            {hasPrivilege("AddPosition") && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="bg-[#333] text-white p-2 rounded-md cursor-pointer hover:scale-90"
              >
                + Add Position
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
            {filteredPositions.map((position) => (
              <div>
                <div
                  className="w-full shadow-md flex flex-col lg:grid lg:grid-cols-2 p-5 lg:items-start rounded-md"
                  key={position.position_id}
                >
                  <div>
                    <div className="flex-1 lg:mb-0 mb-4">
                      <p className="font-extrabold text-lg mb-1.5">
                        {position.name}
                      </p>
                      <p className="text-[#3D873B] text-sm">
                        {position.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex gap-3 flex-wrap lg:justify-end ">
                      <div className="text-xs flex items-center gap-2">
                        <p className="font-bold text-sm">ID:</p>{" "}
                        {position.position_id}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      {hasPrivilege("UpdatePosition") && (
                        <FaEdit
                          size={20}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedPosition(position);
                            setEditModalOpen(true);
                          }}
                        />
                      )}
                      {hasPrivilege("DeletePosition") && (
                        <FaTrash
                          size={20}
                          className="text-red-500 cursor-pointer"
                          onClick={() => {
                            setSelectedPosition(position);
                            setDeleteModalOpen(true);
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Position"
        description="Fill in the form to add a position."
      >
        {hasPrivilege("AddPosition") && (
          <AddPosition
            onClose={() => setAddModalOpen(false)}
            onAdd={fetchPositions}
          />
        )}
      </Modal>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Position"
        description="Fill in the form to edit a position."
      >
        {selectedPosition && hasPrivilege("UpdatePosition") && (
          <EditPosition
            position={selectedPosition}
            onClose={() => setEditModalOpen(false)}
            onUpdate={fetchPositions}
          />
        )}
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        {selectedPosition && hasPrivilege("DeletePosition") && (
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
