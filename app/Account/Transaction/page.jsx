"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/Services/authService";
import { FaPlus } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import AddDeposit from "./AddTransaction/page";
import Layout from "@/app/components/Layout";
import Modal from "@/app/components/Modal";
import dummyTransactions from "./dummyDeposit";
import { MdOutlineMoreVert } from "react-icons/md";

const ITEMS_PER_PAGE = 3;

const DepositList = () => {
  const { user } = useAuth();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deposits, setDeposits] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [branches, setBranches] = useState([]);

  const openDocumentInNewTab = (documentId) => {
    const documentUrl = `/documents/${documentId}`;
    window.open(documentUrl, "_blank");
  };
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Dummy branches data
        setBranches([
          { branch_id: "1", name: "Lagos Branch" },
          { branch_id: "2", name: "Abuja Branch" },
          { branch_id: "3", name: "Port Harcourt Branch" },
        ]);
      } catch (err) {
        console.error("Failed to fetch metadata:", err);
      }
    };

    fetchMetadata();
  }, []);

  const getBranchName = (code) =>
    branches.find((branch) => branch.branch_id === code)?.name || code;

  useEffect(() => {
    setDeposits(dummyTransactions);
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchPrivileges = async () => {
      if (user?.role) {
        setLoadingPrivileges(true);
        try {
          // Dummy role privileges (replace with real role fetching logic when available)
          setRolePrivileges(["CreateDeposit", "ViewDeposit"]);
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
      const results = deposits.filter((deposit) =>
        Object.values(deposit).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseFilter)
        )
      );
      setFilteredDeposits(results);
      setCurrentPage(1); // reset to first page on search
    };
    handleFilter();
  }, [deposits, filterText]);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDeposits = filteredDeposits.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredDeposits.length / ITEMS_PER_PAGE);

  const hasPrivilege = (privilegeName) => {
    return !loadingPrivileges && rolePrivileges.includes(privilegeName);
  };

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
        <div className="flex items-center gap-2 ">
          <p className="font-bold">{error}</p>
          <button
            className="bg-red-500 cursor-pointer shadow-md text-white p-1 rounded-lg "
            onClick={() => setError(null)}
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
            <p className="text-4xl font-extrabold">Transactions</p>
            <p className="text-sm text-gray-600">View all transactions.</p>
          </div>
          {hasPrivilege("CreateDeposit") && (
            <div
              onClick={() => setAddModalOpen(true)}
              id="add-deposit-icon"
              className="w-7 h-7 rounded-full cursor-pointer hover:bg-gray-100 p-1"
            >
              <FaPlus className="text-[#3D873B] w-full h-full" />
            </div>
          )}
          <Tooltip
            anchorId="add-deposit-icon"
            content="Add Transaction"
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
            placeholder="Search Transactions..."
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
                <th className="text-left py-3 px-4">DocNbr</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Account </th>
                <th className="text-left py-3 px-4">Transaction Type</th>
                <th className="text-left py-3 px-4"> Amount</th>
                <th className="text-left py-3 px-4">Branch</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4"></th>
                <th className="text-left py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {paginatedDeposits.map((deposit, index) => (
                <tr key={deposit.depositId} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{startIdx + index + 1}</td>
                  <td className="py-3 px-4">{deposit.DocNbr}</td>
                  <td className="py-3 px-4">{deposit.Customer}</td>
                  <td className="py-3 px-4">{deposit.Accountnumber}</td>
                  <td className="py-3 px-4">{deposit.TransactionType}</td>

                  <td className="py-3 px-4">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    }).format(deposit.amount)}
                  </td>
                  <td className="py-3 px-4">{getBranchName(deposit.Branch)}</td>
                  <td className="py-3 px-4">
                    {new Date(deposit.Date).toLocaleDateString()}
                  </td>
                  <td
                    onClick={() => openDocumentInNewTab(deposit.DocumentUrl)}
                    className="py-3 px-4 text-[#3D873B] text-sm cursor-pointer hover:text-gray-500 "
                  >
                    View Document
                  </td>
                  <td className="py-3 px-4 cursor-pointer">
                    <MdOutlineMoreVert
                      size={20}
                      onClick={() => {
                        setSelectedDescription(deposit.OtherInfo);
                        setIsModalOpen(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
              {paginatedDeposits.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No Transactions available.
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
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={"Add Transaction"}
        description="Fill in the form to add a transaction."
      >
        <AddDeposit
          onClose={() => setAddModalOpen(false)}
          onAdd={() =>
            setDeposits([
              ...deposits,
              {
                depositId: "D007",
                amount: 1200,
                depositType: "Savings",
                branchId: "2",
                date: new Date().toISOString(),
                status: "Active",
              },
            ])
          }
          branchcode={user?.BranchCode}
        />
      </Modal>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Other Information</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {selectedDescription}
            </p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 px-4 py-2 bg-[#3D873B] text-white rounded hover:bg-green-300 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DepositList;
