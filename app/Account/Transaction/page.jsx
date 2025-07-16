"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/Services/authService";
import { FaPlus } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import AddDeposit from "./AddTransaction/page";
import Layout from "@/app/components/Layout";
import transactionService from "@/Services/transactionService";
import branchService from "@/Services/branchService";
import roleService from "@/Services/roleService";
import formatDate from "@/app/components/formatdate";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 3;

const TransactionPage = () => {
  const { user } = useAuth();
  const [selectedDescription, setSelectedDescription] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const router = useRouter();
  const openDocumentInNewTab = (documentId) => {
    const documentUrl = `/documents/${documentId}`;
    window.open(documentUrl, "_blank");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch branches
        const branchesResponse = await branchService.getAllBranches();
        setBranches(branchesResponse || []);

        // Fetch transactions
        const transactionsResponse = await transactionService.getTransactions({
          // Add any required parameters here
          // accountCode: 'ACC123',
          // startDate: '2023-01-01',
          // endDate: '2023-12-31'
        });
        setTransactions(transactionsResponse || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getBranchName = (code) =>
    branches.find((branch) => branch.branch_id === code)?.name || code;

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
      const results = transactions.filter((transaction) =>
        Object.values(transaction).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseFilter)
        )
      );
      setFilteredTransactions(results);
      setCurrentPage(1);
    };
    handleFilter();
  }, [transactions, filterText]);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

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
        <div className="flex items-center gap-2">
          <p className="font-bold">{error}</p>
          <button
            className="bg-red-500 cursor-pointer shadow-md text-white p-1 rounded-lg"
            onClick={() => window.location.reload()}
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
          {hasPrivilege("ManageAccountTransactions") && (
            <div
              onClick={() => router.push("/Account/Transaction/AddTransaction")}
              id="add-transaction-icon"
              className="w-7 h-7 rounded-full cursor-pointer hover:bg-gray-100 p-1"
            >
              <FaPlus className="text-[#3D873B] w-full h-full" />
            </div>
          )}
          <Tooltip
            anchorId="add-transaction-icon"
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
                <th className="text-left py-3 px-4">Transaction Code</th>
                <th className="text-left py-3 px-4">Account Code</th>
                <th className="text-left py-3 px-4">Transaction Type</th>
                <th className="text-left py-3 px-4">Transaction Date</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Previous balance</th>
                <th className="text-left py-3 px-4">New balance</th>
                <th className="text-left py-3 px-4">Narration</th>
                <th className="text-left py-3 px-4">Reference</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {paginatedTransactions.map((transaction, index) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{startIdx + index + 1}</td>
                  <td className="py-3 px-4">{transaction.transactionCode}</td>
                  <td className="py-3 px-4">{transaction.accountCode}</td>
                  <td className="py-3 px-4">
                    {transaction.transactionTypeIndicator}
                  </td>
                  <td className="py-3 px-4">
                    {formatDate(transaction.transactionDate)}
                  </td>
                  <td className="py-3 px-4">
                    {transaction.amount.toLocaleString("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    })}
                  </td>
                  <td className="py-3 px-4">
                    {transaction.balanceBefore.toLocaleString("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    })}
                  </td>
                  <td className="py-3 px-4">
                    {transaction.balanceAfter.toLocaleString("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    })}
                  </td>
                  <td className="py-3 px-4">
                    {transaction.narration || "No narration provided"}
                  </td>
                  <td className="py-3 px-4">
                    {transaction.reference || "No reference provided"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {transaction.status === "approved"
                        ? "Approved"
                        : "Pending"}
                    </span>
                  </td>

                  <td
                    onClick={() => openDocumentInNewTab(transaction.documentId)}
                    className="py-3 px-4 text-[#3D873B] text-sm cursor-pointer hover:text-gray-500"
                  >
                    View Document
                  </td>
                </tr>
              ))}
              {paginatedTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan="10"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No Transactions available.
                  </td>
                </tr>
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

export default TransactionPage;
