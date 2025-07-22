"use client";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaPlus, FaFilter } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import transactionService from "@/Services/transactionService";
import branchService from "@/Services/branchService";
import roleService from "@/Services/roleService";
import formatDate from "@/app/components/formatdate";
import { useRouter } from "next/navigation";
import transactionTypeService from "@/Services/transTypeService";
import useAccountService from "@/Services/accountService";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 3;

const TransactionPage = () => {
  const { user } = useAuth();
  const [expandedRows, setExpandedRows] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transType, settransType] = useState([]);
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    transactionType: "",
    status: "",
    accountCode: "",
    startDate: "",
    endDate: "",
  });
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [exportFormat, setExportFormat] = useState("CSV"); // 'CSV' or 'PDF'
  const [isExporting, setIsExporting] = useState(false);
  const [accountCodes, setAccountCodes] = useState([]);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [reversalReason, setReversalReason] = useState("");
  const [isReversing, setIsReversing] = useState(false);
  const [reversalError, setReversalError] = useState(null);

  const openDocumentInNewTab = (documentId) => {
    const documentUrl = documentId;
    window.open(documentUrl, "_blank");
  };

  const handleExport = async () => {
    try {
      if (!filters.accountCode && !filters.startDate && !filters.endDate) {
        toast.error(
          "Please select account code, start date and end date to export transactions"
        );
        return;
      }
      setIsExporting(true);

      const response = await transactionService.exportTransactions({
        accountCode: filters.accountCode,
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: exportFormat,
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Set the filename based on the export parameters
      const fileName = `transactions_${filters.accountCode || "all"}_${
        filters.startDate || "start"
      }_to_${filters.endDate || "end"}.${exportFormat.toLowerCase()}`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowExportPopup(false);
      resetFilters();
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountCodesResponse = await useAccountService.getAllAccounts();
        setAccountCodes(accountCodesResponse || []);
        const typeResponse =
          await transactionTypeService.getAlltransactionTypes();
        settransType(typeResponse || []);

        const transactionsResponse = await transactionService.getTransactions({
          accountCode: filters.accountCode,
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
        const sortedTransactions = [...(transactionsResponse || [])].sort(
          (a, b) => {
            return new Date(a.transactionDate) - new Date(b.transactionDate);
          }
        );
        setTransactions(sortedTransactions);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.accountCode, filters.startDate, filters.endDate]);

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
      const results = transactions.filter((transaction) => {
        // Text search
        const matchesText = Object.values(transaction).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseFilter)
        );

        // Filter by transaction type
        const matchesType =
          !filters.transactionType ||
          transaction.transactionCode === filters.transactionType;

        // Filter by status
        const matchesStatus =
          filters.status === "" ||
          transaction.status.toLowerCase() === filters.status.toLowerCase();

        return matchesText && matchesType && matchesStatus;
      });

      setFilteredTransactions(results);
      setCurrentPage(1);
    };
    handleFilter();
  }, [transactions, filterText, filters]);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const hasPrivilege = (privilegeName) => {
    return !loadingPrivileges && rolePrivileges.includes(privilegeName);
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      transactionType: "",
      status: "",
      accountCode: "",
      startDate: "",
      endDate: "",
    });
    setFilterText("");
  };

  const handleReverseClick = (transaction) => {
    setSelectedTransaction(transaction);
    setReversalReason("");
    setReversalError(null);
    setShowReverseModal(true);
  };

  const handleReverseTransaction = async () => {
    if (!reversalReason || reversalReason.length < 10) {
      setReversalError("Reversal reason must be at least 10 characters");
      return;
    }

    try {
      setIsReversing(true);
      setReversalError(null);

      const reversalData = {
        reversedBy: user?.StaffCode, // Assuming user object has staffCode
        reversalReason: reversalReason,
      };

      await transactionService.reverseTransaction(
        selectedTransaction.transactionId,
        reversalData
      );

      // Refresh transactions after successful reversal
      const transactionsResponse = await transactionService.getTransactions({
        accountCode: filters.accountCode,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      setTransactions(transactionsResponse || []);

      setShowReverseModal(false);
    } catch (error) {
      console.error("Reversal failed:", error);
      setReversalError(error.message || "Failed to reverse transaction");
    } finally {
      setIsReversing(false);
    }
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

        {/* Search and Filter Section */}
        <div className="mt-4 mb-5 space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search Transactions..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="placeholder:text-sm border p-2 w-full rounded-md border-gray-300 outline-none shadow-sm"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                showFilters
                  ? "bg-[#3D873B] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <FaFilter />
              <span>Filters</span>
            </button>
            <button
              onClick={() => setShowExportPopup(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#3D873B] text-white hover:opacity-90 cursor-pointer"
            >
              Export
            </button>
          </div>

          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-md shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transaction Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type
                  </label>
                  <select
                    value={filters.transactionType}
                    onChange={(e) =>
                      handleFilterChange("transactionType", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Types</option>
                    {transType.map((type) => (
                      <option key={type.code} value={type.code}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Code
                  </label>
                  <input
                    type="text"
                    value={filters.accountCode}
                    onChange={(e) =>
                      handleFilterChange("accountCode", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter account code"
                  />
                </div> */}

                {/* Date Range Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.map((transaction) => (
                  <React.Fragment key={transaction.transactionId}>
                    <tr
                      onClick={() => toggleRow(transaction.transactionId)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.transactionCode}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(transaction.transactionDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.accountCode}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.amount.toLocaleString("en-NG", {
                          style: "currency",
                          currency: "NGN",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(transaction.transactionId);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title="More Details"
                        >
                          {expandedRows.includes(transaction.transactionId) ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.includes(transaction.transactionId) && (
                      <tr className="bg-gray-50">
                        <td colSpan="6" className="px-6 py-4">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">
                                Previous Balance:
                              </p>
                              <p className="text-gray-500">
                                {transaction.balanceBefore.toLocaleString(
                                  "en-NG",
                                  {
                                    style: "currency",
                                    currency: "NGN",
                                  }
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                New Balance:
                              </p>
                              <p className="text-gray-500">
                                {transaction.balanceAfter.toLocaleString(
                                  "en-NG",
                                  {
                                    style: "currency",
                                    currency: "NGN",
                                  }
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Narration:
                              </p>
                              <p className="text-gray-500">
                                {transaction.narration || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Reference:
                              </p>
                              <p className="text-gray-500">
                                {transaction.reference || "N/A"}
                              </p>
                            </div>
                            {transaction.documentFile && (
                              <div>
                                <p className="font-medium text-gray-900">
                                  Document:
                                </p>
                                <button
                                  onClick={() =>
                                    openDocumentInNewTab(
                                      transaction.documentFile
                                    )
                                  }
                                  className="text-[#3D873B] hover:underline"
                                >
                                  View Document
                                </button>
                              </div>
                            )}
                            {transaction.status === "Completed" && (
                              <div className="col-span-3 flex justify-end">
                                <button
                                  onClick={() =>
                                    handleReverseClick(transaction)
                                  }
                                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                >
                                  Reverse Transaction
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {paginatedTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No Transactions available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
      {showExportPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Export Transactions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Code
                </label>
                <select
                  value={filters.accountCode}
                  required
                  onChange={(e) =>
                    setFilters({ ...filters, accountCode: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="" disabled>
                    Select Account
                  </option>
                  {accountCodes.map((account) => (
                    <option
                      key={account.accountCode}
                      value={account.accountCode}
                    >
                      {account.accountCode} - {account.accountName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    required
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={exportFormat === "CSV"}
                      onChange={() => setExportFormat("CSV")}
                      className="form-radio"
                    />
                    <span className="ml-2">CSV</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={exportFormat === "PDF"}
                      onChange={() => setExportFormat("PDF")}
                      className="form-radio"
                    />
                    <span className="ml-2">PDF</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowExportPopup(false);
                  resetFilters();
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 bg-[#3D873B] text-white rounded-md hover:bg-[#2d6e2b] disabled:opacity-50"
              >
                {isExporting ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>
        </div>
      )}{" "}
      {showReverseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Reverse Transaction</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">Transaction ID:</p>
                  <p>{selectedTransaction?.transactionId}</p>
                </div>
                <div>
                  <p className="font-bold">Account:</p>
                  <p>{selectedTransaction?.accountCode}</p>
                </div>
              </div>
              <div>
                <p className="font-bold">Amount:</p>
                <p>
                  {selectedTransaction?.amount.toLocaleString("en-NG", {
                    style: "currency",
                    currency: "NGN",
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reversal Reason (min 10 characters)
                </label>
                <textarea
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md h-24"
                  placeholder="Enter reason for reversal..."
                />
                {reversalError && (
                  <p className="text-red-500 text-sm mt-1">{reversalError}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowReverseModal(false)}
                disabled={isReversing}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReverseTransaction}
                disabled={isReversing || !reversalReason}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {isReversing ? "Reversing..." : "Confirm Reversal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TransactionPage;
