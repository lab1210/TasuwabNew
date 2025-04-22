"use client";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import roleService from "@/Services/roleService";
import staffService from "@/Services/staffService";
import React, { useEffect, useState } from "react";
import { FaEdit, FaEye, FaTrash, FaUser } from "react-icons/fa";
import EditStaff from "./EditStaff";
import Modal from "@/app/components/Modal";
import AddStaff from "./AddStaff";
import DeleteStaff from "./DeleteStaff";
import DetailStaff from "./DetailStaff";
import LargeModal from "@/app/components/LargeModal";

const Staff = () => {
  const [filterText, setFilterText] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staff, setStaff] = useState([]);
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
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await staffService.getStaffs();
      if (response && Array.isArray(response)) {
        setStaff(response);
      } else if (Array.isArray(response)) {
        setStaff(response);
      } else {
        console.warn("Unexpected staff data format:", response);
        setError("Failed to load staff: Data format incorrect.");
        setStaff([]);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      setError("Failed to load staff.");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const hasPrivilege = (privilegeName) => {
    return !loadingPrivileges && rolePrivileges.includes(privilegeName);
  };

  const filteredStaff =
    staff?.filter(
      (s) =>
        `${s.firstName} ${s.lastName}`
          .toLowerCase()
          .includes(filterText.toLowerCase()) ||
        s.staffCode?.toLowerCase().includes(filterText.toLowerCase()) ||
        s.email?.toLowerCase().includes(filterText.toLowerCase()) ||
        s.phone?.includes(filterText.toLowerCase())
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
          <button onClick={fetchStaff}>Retry</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid grid-rows-[100px_1fr] gap-5 w-full">
        <div className="bg-[#DFF6DD] w-full flex justify-between items-center rounded-md p-5">
          <div className="flex flex-col gap-3">
            <p className="font-bold text-lg">Total Staff</p>
            <p className="font-extrabold text-4xl">{staff.length}</p>
          </div>
          <div>
            {hasPrivilege("CreateStaff") && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="bg-[#333] text-white p-2 rounded-md cursor-pointer hover:scale-90"
              >
                + Add Staff
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
            {filteredStaff.map((staff) => {
              return (
                <div
                  className="w-full shadow-md flex flex-col lg:grid lg:grid-cols-2 p-5 lg:items-start rounded-md"
                  key={staff.staffCode}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-full w-8 h-8 p-2 object-contain bg-gray-100 flex items-center">
                        <FaUser className="w-full h-full" />
                      </div>
                      <div>
                        <p className="font-extrabold text-lg mb-1.5">
                          {staff.firstName + " " + staff.lastName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div>
                      <div className="flex gap-3 flex-wrap lg:justify-end ">
                        <div className="text-xs flex items-center gap-2">
                          <p className="font-bold text-sm">Code:</p>{" "}
                          {staff.staffCode}
                        </div>
                        <div className="text-xs flex items-center gap-2">
                          <p className="font-bold text-sm">Branch:</p>{" "}
                          {staff.branchID}
                        </div>
                        <div className="text-xs flex items-center gap-2">
                          <p className="font-bold text-sm">Department:</p>{" "}
                          {staff.departmentID}
                        </div>
                        <div className="text-xs flex items-center gap-2">
                          <p className="font-bold text-sm">Position:</p>{" "}
                          {staff.positionID}
                        </div>
                        <div className="text-xs flex items-center gap-2">
                          <p className="font-bold text-sm">Role:</p>{" "}
                          {staff.roleID}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-2 gap-2">
                      {hasPrivilege("UpdateStaff") && (
                        <FaEdit
                          className="cursor-pointer"
                          size={20}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStaff(staff);
                            setEditModalOpen(true);
                          }}
                        />
                      )}
                      {hasPrivilege("DeleteStaff") && (
                        <FaTrash
                          size={20}
                          className="text-red-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStaff(staff);
                            setDeleteModalOpen(true);
                          }}
                        />
                      )}
                      <FaEye
                        size={20}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStaff(staff);
                          setDetailModalOpen(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <LargeModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Staff"
        description="Fill in the form to edit a staff."
      >
        {selectedStaff && hasPrivilege("UpdateStaff") && (
          <EditStaff
            staffCode={selectedStaff.staffCode}
            onClose={() => setEditModalOpen(false)}
            onUpdate={fetchStaff}
          />
        )}
      </LargeModal>
      <LargeModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Staff Information"
        description="View complete staff details."
      >
        {selectedStaff && <DetailStaff staffCode={selectedStaff.staffCode} />}
      </LargeModal>

      <LargeModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Staff"
        description="Fill in the form to add a staff."
      >
        {hasPrivilege("CreateStaff") && (
          <AddStaff onClose={() => setAddModalOpen(false)} onAdd={fetchStaff} />
        )}
      </LargeModal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        {selectedStaff && hasPrivilege("DeleteStaff") && (
          <DeleteStaff
            staff={selectedStaff}
            onClose={() => setDeleteModalOpen(false)}
            onDelete={fetchStaff}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default Staff;
