"use client";
import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/Modal";
import Layout from "@/app/components/Layout";
import Details from "../Details";

const CompletedPaymenttoSupplier = () => {
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      clientName: "Client one",
      transactionId: "TXN12345",
      name: "Supplier A",
      amount: 1000,
      date: "2023-10-01",
      status: "Pending",
      categories: [
        {
          id: 1,
          name: "Electronics",
          products: [
            { id: 1, name: "Smartphone", quantity: 2, price: 600 },
            { id: 2, name: "Tablet", quantity: 1, price: 400 },
          ],
        },
      ],
    },
    {
      id: 2,
      clientName: "Client two",
      transactionId: "TXN67890",
      name: "Supplier B",
      amount: 2000,
      date: "2023-10-02",
      status: "Completed",
      categories: [
        {
          id: 2,
          name: "Furniture",
          products: [
            { id: 3, name: "Office Chair", quantity: 1, price: 1000 },
            { id: 4, name: "Desk", quantity: 1, price: 1000 },
          ],
        },
      ],
    },
    {
      id: 3,
      clientName: "Client two",
      transactionId: "TXN11223",
      name: "Supplier C",
      amount: 1500,
      date: "2023-10-03",
      status: "Pending",
      categories: [
        {
          id: 3,
          name: "Stationery",
          products: [
            { id: 5, name: "Notebook", quantity: 1, price: 500 },
            { id: 6, name: "Pens", quantity: 1, price: 300 },
            { id: 7, name: "Stapler", quantity: 1, price: 200 },
          ],
        },
      ],
    },
    {
      id: 4,
      clientName: "Client three",
      transactionId: "TXN44556",
      name: "Supplier D",
      amount: 2500,
      date: "2023-10-04",
      status: "Completed",
      categories: [
        {
          id: 4,
          name: "Electronics",
          products: [
            { id: 8, name: "Laptop", quantity: 1, price: 2000 },
            { id: 9, name: "Keyboard", quantity: 1, price: 500 },
          ],
        },
      ],
    },
    {
      id: 5,
      clientName: "Client four",
      transactionId: "TXN77889",
      name: "Supplier E",
      amount: 3000,
      date: "2023-10-05",
      status: "Pending",
      categories: [
        {
          id: 5,
          name: "Cleaning Supplies",
          products: [
            { id: 10, name: "Detergent", quantity: 1, price: 1000 },
            { id: 11, name: "Bleach", quantity: 1, price: 800 },
            { id: 12, name: "Mop", quantity: 1, price: 1200 },
          ],
        },
      ],
    },
    {
      id: 6,
      clientName: "Client five",
      transactionId: "TXN99000",
      name: "Supplier F",
      amount: 1800,
      date: "2023-10-06",
      status: "Completed",
      categories: [
        {
          id: 6,
          name: "Catering",
          products: [
            { id: 13, name: "Snacks", quantity: 1, price: 800 },
            { id: 14, name: "Drinks", quantity: 1, price: 1000 },
          ],
        },
      ],
    },
    {
      id: 7,
      clientName: "Client two",
      transactionId: "TXN12346",
      name: "Supplier G",
      amount: 2200,
      date: "2023-10-07",
      status: "Pending",
      categories: [
        {
          id: 7,
          name: "Stationery",
          products: [
            { id: 15, name: "Markers", quantity: 1, price: 1200 },
            { id: 16, name: "Paper", quantity: 1, price: 1000 },
          ],
        },
      ],
    },
    {
      id: 8,
      clientName: "Client three",
      transactionId: "TXN78901",
      name: "Supplier H",
      amount: 2700,
      date: "2023-10-08",
      status: "Completed",
      categories: [
        {
          id: 8,
          name: "Networking",
          products: [
            { id: 17, name: "Router", quantity: 1, price: 1500 },
            { id: 18, name: "Switch", quantity: 1, price: 1200 },
          ],
        },
      ],
    },
    {
      id: 9,
      clientName: "Client four",
      transactionId: "TXN23456",
      name: "Supplier I",
      amount: 3200,
      date: "2023-10-09",
      status: "Pending",
      categories: [
        {
          id: 9,
          name: "Furniture",
          products: [
            { id: 19, name: "Sofa", quantity: 1, price: 2000 },
            { id: 20, name: "Dining Table", quantity: 1, price: 1200 },
          ],
        },
      ],
    },
    {
      id: 10,
      clientName: "Client five",
      transactionId: "TXN34567",
      name: "Supplier J",
      amount: 4000,
      date: "2023-10-10",
      status: "Completed",
      categories: [
        {
          id: 10,
          name: "Catering",
          products: [
            { id: 21, name: "Lunch Boxes", quantity: 1, price: 1500 },
            { id: 22, name: "Cutlery", quantity: 1, price: 2500 },
          ],
        },
      ],
    },
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

  const CompletedSupplierPayment = filteredSuppliers.filter(
    (supplier) => supplier.status === "Completed"
  );

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSuppliers = CompletedSupplierPayment.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(
    CompletedSupplierPayment.length / ITEMS_PER_PAGE
  );

  return (
    <Layout>
      <div className="w-full">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <p className="text-4xl font-extrabold">
              Completed Suppliers Payments
            </p>
            <p className="text-sm text-gray-600">
              View all completed supplier payments here.
            </p>
          </div>
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
                <th className="text-left py-3 px-4">Transaction Number</th>
                <th className="text-left py-3 px-4">Client Name</th>
                <th className="text-left py-3 px-4">Supplier Name</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {CompletedSupplierPayment.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
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
                    <td className="py-3 px-4">
                      <FaEye
                        onClick={() => {
                          setModalOpen(true);
                          setSelectedSupplier(supplier);
                        }}
                        size={18}
                        className="cursor-pointer text-gray-500 hover:text-black"
                        title="View"
                      />
                    </td>
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

export default CompletedPaymenttoSupplier;
