"use client";
import React, { useState } from "react";
import { FaCheck, FaExclamation, FaEye } from "react-icons/fa";
import Modal from "@/app/components/Modal";
import Layout from "@/app/components/Layout";
import Details from "@/app/Supplier/Transactions/Details";
import { ImCross } from "react-icons/im";
import ApprovalModal from "@/app/components/ApprovalModal";
import toast from "react-hot-toast";

const ApprovePaymenttoSupplier = () => {
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
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [Approvalreply, setApprovalReply] = useState("cancel");
  const [Rejectionreply, setRejectionReply] = useState("cancel");

  const handleConfirmation = () => {
    if (Approvalreply == "confirm" && selectedSupplier) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === selectedSupplier.id ? { ...s, status: "Completed" } : s
        )
      );
      toast.success("Payment has been approved successfully");
      setOpenApprovalModal(false);
      setApprovalReply("cancel");
    } else if (Rejectionreply == "confirm" && selectedSupplier) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === selectedSupplier.id ? { ...s, status: "Rejected" } : s
        )
      );
      toast.success("Payment has been rejected successfully");
      setOpenRejectModal(false);
      setRejectionReply("cancel");
    }
  };

  const ITEMS_PER_PAGE = 3;

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = supplier.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesDate =
      (!startDate || new Date(supplier.date) >= new Date(startDate)) &&
      (!endDate || new Date(supplier.date) <= new Date(endDate));
    return matchesSearch && matchesDate;
  });

  const PendingSupplierPayment = filteredSuppliers.filter(
    (supplier) => supplier.status === "Pending"
  );

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSuppliers = PendingSupplierPayment.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(PendingSupplierPayment.length / ITEMS_PER_PAGE);

  const handleCloseModalforApproval = () => {
    setOpenApprovalModal(false);
  };
  const handleCloseModalforRejection = () => {
    setOpenRejectModal(false);
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <p className="text-4xl font-extrabold">
              Approve Suppliers Payments
            </p>
            <p className="text-sm text-gray-600">
              View and approve or reject all pending supplier payments here.
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
                <th className="text-center py-3 px-4">S/N</th>
                <th className="text-center py-3 px-4">Transaction Number</th>
                <th className="text-center py-3 px-4">Client Name</th>
                <th className="text-center py-3 px-4">Supplier Name</th>
                <th className="text-center py-3 px-4">Amount</th>
                <th className="text-center py-3 px-4">Date</th>
                <th className="text-center py-3 px-4">Sending Bank</th>
                <th className="text-center py-3 px-4">Sending Acc. No.</th>
                <th className="text-center py-3 px-4">Sending Acc. Name</th>
                <th className="text-center py-3 px-4">Supplier Bank</th>
                <th className="text-center py-3 px-4">Supplier Acc. No.</th>
                <th className="text-center py-3 px-4">Supplier Acc. Name</th>
                <th className="text-center py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {PendingSupplierPayment.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    No payment awaiting approval.
                  </td>
                </tr>
              ) : (
                paginatedSuppliers.map((supplier, index) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-center">
                      {startIdx + index + 1}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {supplier.transactionId}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {supplier.clientName}
                    </td>
                    <td className="py-3 px-4 text-center">{supplier.name}</td>
                    <td className="py-3 px-4 text-center">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      }).format(supplier.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">{supplier.date}</td>
                    <td className="py-3 px-4 text-center">
                      {supplier.sendingBank}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {supplier.sendingAccountNumber}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {supplier.sendingAccountName}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {supplier.supplierBank}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {supplier.supplierAccountNumber}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {supplier.supplierAccountName}
                    </td>

                    <td className="py-3 px-4 text-center gap-3 flex items-center justify-between">
                      <div
                        onClick={() => {
                          setOpenApprovalModal(true);
                          setSelectedSupplier(supplier);
                        }}
                        className="bg-green-50 text-green-500 w-7 h-7 flex justify-center items-center rounded-full cursor-pointer hover:bg-gray-200"
                      >
                        <FaCheck title="Approve" />
                      </div>
                      <div
                        onClick={() => {
                          setOpenRejectModal(true);
                          setSelectedSupplier(supplier);
                        }}
                        className="bg-red-50 text-red-500 w-7 h-7 flex justify-center items-center rounded-full cursor-pointer hover:bg-gray-200"
                      >
                        <ImCross title="Reject" size={12} />
                      </div>
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
      {openApprovalModal && selectedSupplier && (
        <ApprovalModal
          isOpen={openApprovalModal}
          onClose={() => handleCloseModalforApproval()}
          icon={<FaCheck className="text-white" size={15} />}
          title="Approval"
          description={"approve"}
          supplier={selectedSupplier.name}
          amount={selectedSupplier.amount}
          client={selectedSupplier.clientName}
          reply={setApprovalReply}
          handleConfirmation={handleConfirmation}
        />
      )}
      {openRejectModal && selectedSupplier && (
        <ApprovalModal
          isOpen={openRejectModal}
          onClose={() => handleCloseModalforRejection()}
          icon={<FaExclamation className="text-white" size={15} />}
          title="Rejection"
          description={"reject"}
          supplier={selectedSupplier.name}
          amount={selectedSupplier.amount}
          client={selectedSupplier.clientName}
          reply={setRejectionReply}
          handleConfirmation={handleConfirmation}
        />
      )}
    </Layout>
  );
};

export default ApprovePaymenttoSupplier;
