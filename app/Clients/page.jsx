"use client";
import clientService from "@/Services/clientService";
import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaPlus } from "react-icons/fa";
import Layout from "../components/Layout";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { useAuth } from "@/Services/authService";
import roleService from "@/Services/roleService";
import { useRouter } from "next/navigation";
import Clientinfo from "./Clientinfo";

const ITEMS_PER_PAGE = 10;

export default function ClientList() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [clients, setClients] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedClient, setselectedClient] = useState(null);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await clientService.getAllClients();
      const data = Array.isArray(response?.data) ? response.data : response;
      if (Array.isArray(data)) {
        setClients(data);
      } else {
        setClients([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch clients");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

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
    const handleFilter = () => {
      const lowerCaseFilter = filterText.toLowerCase();
      const results = clients.filter((client) =>
        Object.values(client).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseFilter)
        )
      );
      setFilteredClients(results);
      setCurrentPage(1); // reset to first page on search
    };
    handleFilter();
  }, [clients, filterText]);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClients = filteredClients.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);

  const hasPrivilege = (privilegeName) => {
    return !loadingPrivileges && rolePrivileges.includes(privilegeName);
  };

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
        <div className="flex items-center gap-2 ">
          <p className="font-bold">{error}</p>
          <button
            className="bg-red-500 cursor-pointer shadow-md text-white p-1 rounded-lg "
            onClick={fetchClients}
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-4xl font-extrabold">Clients</p>
            <p className="text-sm text-gray-600">
              View all of your client information.
            </p>
          </div>
          {hasPrivilege("CreateClients") && (
            <div
              id="add-client-icon"
              className="w-7 h-7 rounded-full cursor-pointer hover:bg-gray-100 p-1"
              onClick={() => router.push("/Clients/AddClient")}
            >
              <FaPlus className="text-[#3D873B] w-full h-full" />
            </div>
          )}
          <Tooltip
            anchorId="add-client-icon"
            content="Add Client"
            place="top"
            style={{
              backgroundColor: "#3D873B",
              fontSize: "12px",
              borderRadius: "6px",
            }}
          />
        </div>

        <div className="mt-4 mb-5">
          <input
            type="text"
            placeholder="Search Clients..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="placeholder:text-sm border p-2 w-full rounded-md border-gray-300 outline-none shadow-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto divide-y divide-gray-200 shadow-lg rounded-md">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="text-left py-3 px-4">S/N</th>
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">First Name</th>
                <th className="text-left py-3 px-4">Last Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Phone</th>
                <th className="text-left py-3 px-4">Status</th>

                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {paginatedClients.map((client, index) => (
                <tr key={client.clientId} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{startIdx + index + 1}</td>
                  <td className="py-3 px-4">{client.clientId}</td>
                  <td className="py-3 px-4">{client.firstName}</td>
                  <td className="py-3 px-4">{client.lastName}</td>
                  <td className="py-3 px-4">{client.email}</td>
                  <td className="py-3 px-4">{client.phoneNumber}</td>
                  <td className="py-3 px-4">
                    {client.status ? (
                      <p className="text-green-500 font-bold rounded-md bg-green-50 text-center p-1">
                        Active
                      </p>
                    ) : (
                      <p className="text-red-500 font-bold rounded-md bg-red-50 text-center p-1">
                        InActive
                      </p>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <FaEye
                        onClick={() => {
                          setselectedClient(client.clientId);
                          setIsSidebarOpen(true);
                        }}
                        size={18}
                        className="cursor-pointer text-gray-500 hover:text-black"
                      />
                      {hasPrivilege("UpdateClients") && (
                        <FaEdit
                          size={18}
                          className="cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            router.push(
                              `/Clients/EditClient/${client.clientId}`
                            )
                          }
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedClients.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No clients available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 text-sm border rounded ${
                  currentPage === i + 1
                    ? "bg-[#3D873B] text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Clientinfo
        client={clients.find((c) => c.clientId === selectedClient)}
        onClose={() => setIsSidebarOpen(false)}
        isOpen={isSidebarOpen}
      />
      {/* <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DeleteClient
          client={selectedClient}
          onClose={() => setDeleteModalOpen(false)}
          onDelete={fetchClients}
        />
      </Modal> */}
    </Layout>
  );
}
