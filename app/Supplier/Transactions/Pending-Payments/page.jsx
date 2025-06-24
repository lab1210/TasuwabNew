"use client";
import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/Modal";
import Layout from "@/app/components/Layout";
import Details from "../Details";

const PendingPaymenttoSupplier = () => {
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      clientName: "Client One",
      transactionId: "TXN12345",
      name: "Supplier A",
      amount: 1000,
      date: "2023-10-01",
      status: "Completed",
      sendingBank: "GTBank",
      sendingAccountNumber: "0123416789",
      sendingAccountName: "Loan Company 1",
      supplierBank: "Access Bank",
      supplierAccountNumber: "9876513210",
      supplierAccountName: "Supplier A Nig. Ltd",
      categories: [],
    },
    {
      id: 2,
      clientName: "Client Two",
      transactionId: "TXN67890",
      name: "Supplier B",
      amount: 2000,
      date: "2023-10-02",
      status: "Pending",
      sendingBank: "Zenith Bank",
      sendingAccountNumber: "0123426789",
      sendingAccountName: "Loan Company 2",
      supplierBank: "Fidelity",
      supplierAccountNumber: "9876523210",
      supplierAccountName: "Supplier B Nig. Ltd",
      categories: [],
    },
    // Add more sample completed payments as needed
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const router = useRouter();

  const ITEMS_PER_PAGE = 4;

  const filteredSuppliers = suppliers.filter((supplier) => {
    const isPending = supplier.status === "Pending";
    const matchesSearch = supplier.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDate =
      (!startDate || new Date(supplier.date) >= new Date(startDate)) &&
      (!endDate || new Date(supplier.date) <= new Date(endDate));
    return isPending && matchesSearch && matchesDate;
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
            <p className="text-4xl font-extrabold">
              Pending Suppliers Payments
            </p>
            <p className="text-sm text-gray-600">
              View all Pending supplier payments here.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <input
            type="text"
            placeholder="Search Suppliers..."
            className="placeholder:text-sm border p-2 w-full rounded-md border-gray-300 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

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

        <div className="overflow-x-auto">
          <table className="w-full table-auto divide-y divide-gray-200 shadow-lg rounded-md">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="text-left py-3 px-4">S/N</th>
                <th className="text-left py-3 px-4">Transaction Number</th>
                <th className="text-left py-3 px-4">Client Name</th>
                <th className="text-left py-3 px-4">Supplier Name</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Sending Bank</th>
                <th className="text-left py-3 px-4">Sending Acc. No.</th>
                <th className="text-left py-3 px-4">Sending Acc. Name</th>
                <th className="text-left py-3 px-4">Supplier Bank</th>
                <th className="text-left py-3 px-4">Supplier Acc. No.</th>
                <th className="text-left py-3 px-4">Supplier Acc. Name</th>
                {/* <th className="text-left py-3 px-4">Actions</th> */}
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {paginatedSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-10 text-gray-400">
                    No completed payments found.
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
                      {supplier.sendingAccountNumber}
                    </td>
                    <td className="py-3 px-4">{supplier.sendingAccountName}</td>
                    <td className="py-3 px-4">{supplier.supplierBank}</td>
                    <td className="py-3 px-4">
                      {supplier.supplierAccountNumber}
                    </td>
                    <td className="py-3 px-4">
                      {supplier.supplierAccountName}
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

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={selectedSupplier.name}
          description="View the details of this transaction"
        >
          <Details supplier={selectedSupplier} />
        </Modal>
      )}
    </Layout>
  );
};

export default PendingPaymenttoSupplier;
