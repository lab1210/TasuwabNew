"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/app/components/Layout";
import { FaEdit, FaEye, FaPlus } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import toast, { Toaster } from "react-hot-toast";
import supplierService from "@/Services/supplierService";
import formatDate from "@/app/components/formatdate";
import { useAuth } from "@/Services/authService";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const ITEMS_PER_PAGE = 5;
  const [formData, setFormData] = useState({
    performedBy: user?.StaffCode,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        performedBy: user?.StaffCode || "",
      }));
    }
  }, [user]);

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getSuppliers();
      const data = Array.isArray(response?.data) ? response.data : response;
      if (Array.isArray(data)) {
        setSuppliers(data);
      } else {
        setSuppliers([]);
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch clients");
      setSuppliers([]);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filter suppliers based on search term (case-insensitive)
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSuppliers = filteredSuppliers.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE);

  const handleStatusToggle = async (supplierID) => {
    try {
      // Create the payload with current values
      const payload = {
        performedBy: user?.StaffCode || "",
      };

      const response = await supplierService.toggleSupplierStatus(
        supplierID,
        payload
      );

      if (response.status === 200) {
        const updatedSuppliers = suppliers.map((supplier) => ({
          ...supplier,
          status:
            supplier.id === supplierID ? !supplier.status : supplier.status,
        }));
        setSuppliers(updatedSuppliers);
        toast.success("Supplier status updated successfully");
      } else {
        toast.error("Failed to update supplier status");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update supplier status");
    }
  };
  return (
    <Layout>
      <Toaster position="top-right" />
      <div className="w-full">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-4xl font-extrabold">Suppliers</p>
            <p className="text-sm text-gray-600">
              View all of your supplier information.
            </p>
          </div>
          <div
            id="add-client-icon"
            className="w-7 h-7 rounded-full cursor-pointer hover:bg-gray-100 p-1"
          >
            <FaPlus
              onClick={() => router.push("/Supplier/Suppliers/Add-Supplier")}
              className="text-[#3D873B] w-full h-full"
            />
          </div>
          <Tooltip
            anchorId="add-client-icon"
            content="Add Supplier"
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
            placeholder="Search Suppliers..."
            className="placeholder:text-sm border p-2 w-full rounded-md border-gray-300 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto divide-y divide-gray-200 shadow-lg rounded-md">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="text-left py-3 px-4">S/N</th>
                <th className="text-left py-3 px-4">Supplier Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Phone</th>
                <th className="text-left py-3 px-4">Account Number</th>
                <th className="text-left py-3 px-4">Account Name</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Created At</th>
                <th className="text-left py-3 px-4">Updated At</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-700">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-400">
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                paginatedSuppliers.map((supplier, index) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{supplier.name}</td>
                    <td className="py-3 px-4">{supplier.email}</td>
                    <td className="py-3 px-4">{supplier.phone}</td>
                    <td className="py-3 px-4">
                      {supplier.supplierAccountNumber}
                    </td>
                    <td className="py-3 px-4">{supplier.supplierBankName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          supplier.status
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {supplier.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {formatDate(supplier.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      {formatDate(supplier.updatedAt)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <FaEye
                          size={18}
                          className="cursor-pointer text-gray-500 hover:text-black"
                          onClick={() =>
                            router.push(
                              `/Supplier/Suppliers/View-Supplier/${supplier.id}`
                            )
                          }
                          title="View"
                        />
                        <FaEdit
                          size={18}
                          className="cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            router.push(
                              `/Supplier/Suppliers/Edit-Supplier/${supplier.id}`
                            )
                          }
                          title="Edit"
                        />
                        <button
                          onClick={() => handleStatusToggle(supplier.id)}
                          className="text-white p-1 rounded-lg cursor-pointer hover:bg-gray-50"
                          style={
                            supplier.status
                              ? { backgroundColor: "red" }
                              : { backgroundColor: "green" }
                          }
                        >
                          {supplier.status ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
    </Layout>
  );
};

export default Suppliers;
