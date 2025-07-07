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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

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
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="placeholder:text-sm border p-1 w-full rounded-md border-gray-200 outline-0"
            />
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full table-auto divide-y divide-gray-200 shadow-lg rounded-md">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Code</th>
                  <th className="text-left py-3 px-4">Branch</th>
                  <th className="text-left py-3 px-4">Department</th>
                  <th className="text-left py-3 px-4">Position</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4 ">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-200">
                {currentItems.map((staff) => (
                  <tr
                    key={staff.staffCode}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      {staff.firstName + " " + staff.lastName}
                    </td>
                    <td className="py-3 px-4">{staff.staffCode}</td>
                    <td className="py-3 px-4">{staff.branchID}</td>
                    <td className="py-3 px-4">{staff.departmentID}</td>
                    <td className="py-3 px-4">{staff.positionID}</td>
                    <td className="py-3 px-4">{staff.roleID}</td>
                    <td className="py-3 px-4 ">
                      <div className="flex items-center gap-2 justify-center flex-wrap">
                        {hasPrivilege("UpdateStaff") && (
                          <FaEdit
                            className="cursor-pointer text-blue-600"
                            onClick={() => {
                              setSelectedStaff(staff);
                              setEditModalOpen(true);
                            }}
                          />
                        )}
                        {hasPrivilege("DeleteStaff") && (
                          <FaTrash
                            className="cursor-pointer text-red-600"
                            onClick={() => {
                              setSelectedStaff(staff);
                              setDeleteModalOpen(true);
                            }}
                          />
                        )}
                        <FaEye
                          className="cursor-pointer text-green-600"
                          onClick={() => {
                            setSelectedStaff(staff);
                            setDetailModalOpen(true);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-3 text-gray-500">
                      No staff found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {filteredStaff.length > itemsPerPage && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === index + 1
                        ? "bg-[#3D873B] text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
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
