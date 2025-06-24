"use client";
import Layout from "@/app/components/Layout";
import React, { useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
// import Details from "./Details";
// import Modal from "@/app/components/Modal";
import { useRouter } from "next/navigation";

const SupplierPayment = () => {
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      clientName: "Client One",
      transactionId: "TXN12345",
      name: "Supplier A",
      amount: 1000,
      date: "2023-10-01",
      status: "Pending",
      sendingBank: "GTBank",
      sendingAccountNumber: "0123406789",
      sendingAccountName: "Loan Company 1",
      supplierBank: "Access Bank",
      supplierAccountNumber: "9876503210",
      supplierAccountName: "Supplier A Nig. Ltd",
    },
    // Add other entries similarly...
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const router = useRouter();

  const ITEMS_PER_PAGE = 4;

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = supplier.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter
      ? supplier.status === statusFilter
      : true;
    const matchesDate =
      (!startDate || new Date(supplier.date) >= new Date(startDate)) &&
      (!endDate || new Date(supplier.date) <= new Date(endDate));
    return matchesSearch && matchesStatus && matchesDate;
  });

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSuppliers = filteredSuppliers.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE);

  return (
    <Layout>
      <div className="w-full">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <p className="text-4xl font-extrabold">Suppliers Payments</p>
            <p className="text-sm text-gray-600">
              View all of your supplier payments here.
            </p>
          </div>
          <div
            id="add-client-icon"
            className="w-7 h-7 rounded-full cursor-pointer hover:bg-gray-100 p-1"
          >
            <FaPlus
              className="text-[#3D873B] w-full h-full"
              onClick={() => router.push("/Supplier/Transactions/Pay-Supplier")}
            />
          </div>
          <Tooltip
            anchorId="add-client-icon"
            content="Pay Supplier"
            place="top"
            style={{
              backgroundColor: "#3D873B",
              fontSize: "12px",
              borderRadius: "6px",
            }}
          />
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <input
            type="text"
            placeholder="Search Suppliers..."
            className="placeholder:text-sm border p-2 w-full rounded-md border-gray-300 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border p-2 w-full rounded-md border-gray-300 shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          <input
            type="date"
            className="border p-2 w-full rounded-md border-gray-300 shadow-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border p-2 w-full rounded-md border-gray-300 shadow-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto divide-y divide-gray-200 shadow-lg rounded-md">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="text-left py-3 px-4">S/N</th>
                <th className="text-left py-3 px-4">Transaction ID</th>
                <th className="text-left py-3 px-4">Client Name</th>
                <th className="text-left py-3 px-4">Supplier Name</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Sending Bank</th>
                <th className="text-left py-3 px-4">Sending Account</th>
                <th className="text-left py-3 px-4">Supplier Bank</th>
                <th className="text-left py-3 px-4">Supplier Account</th>
                <th className="text-left py-3 px-4">Status</th>
                {/* <th className="text-left py-3 px-4">Actions</th> */}
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-10 text-gray-400">
                    No payment history found.
                  </td>
                </tr>
              ) : (
                paginatedSuppliers.map((supplier, index) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{startIdx + index + 1}</td>
                    <td className="py-3 px-4">{supplier.transactionId}</td>
                    <td className="py-3 px-4">{supplier.clientName}</td>
                    <td className="py-3 px-4">{supplier.name}</td>
                    <td className="py-3 px-4">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      }).format(supplier.amount)}
                    </td>
                    <td className="py-3 px-4">{supplier.date}</td>
                    <td className="py-3 px-4">{supplier.sendingBank}</td>
                    <td className="py-3 px-4">
                      {supplier.sendingAccountName} (
                      {supplier.sendingAccountNumber})
                    </td>
                    <td className="py-3 px-4">{supplier.supplierBank}</td>
                    <td className="py-3 px-4">
                      {supplier.supplierAccountName} (
                      {supplier.supplierAccountNumber})
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`rounded-lg p-2 text-center ${
                          supplier.status === "Pending"
                            ? "bg-yellow-50 text-yellow-500"
                            : "bg-green-50 text-green-500"
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>
                    {/* <td className="py-3 px-4">
                      <FaEye
                        onClick={() => {
                          setModalOpen(true);
                          setSelectedSupplier(supplier);
                        }}
                        size={18}
                        className="cursor-pointer text-gray-500 hover:text-black"
                        title="View"
                      />
                    </td> */}
                  </tr>
                ))
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
      {/* {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={selectedSupplier.name}
          description="View the details of this transaction"
        >
          <Details supplier={selectedSupplier} />
        </Modal>
      )} */}
    </Layout>
  );
};

export default SupplierPayment;
