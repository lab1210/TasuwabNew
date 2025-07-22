"use client";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaFilter, FaSearch } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import loanService from "@/Services/loanService";
import roleService from "@/Services/roleService";
import formatDate from "@/app/components/formatdate";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

const LoanTransactionsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fileNo: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactionsResponse = await loanService.getLoanTransactions();
        setTransactions(transactionsResponse || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError(err.message || "Failed to load transaction data");
        setLoading(false);
      }
    };

    fetchData();
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
      const results = transactions.filter((transaction) => {
        // Text search
        const matchesText = Object.values(transaction).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseFilter)
        );

        // Filter by file number
        const matchesFileNo =
          !filters.fileNo ||
          transaction.fileNo
            .toLowerCase()
            .includes(filters.fileNo.toLowerCase());

        // Filter by status
        const matchesStatus =
          !filters.status ||
          transaction.status.toLowerCase() === filters.status.toLowerCase();

        // Filter by date range
        const transactionDate = new Date(transaction.transactionDate);
        const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
        const toDate = filters.toDate ? new Date(filters.toDate) : null;

        const matchesDateRange =
          (!fromDate || transactionDate >= fromDate) &&
          (!toDate || transactionDate <= toDate);

        return (
          matchesText && matchesFileNo && matchesStatus && matchesDateRange
        );
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

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };
  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setFilters({
      fileNo: "",
      status: "",
      fromDate: "",
      toDate: "",
    });
    setFilterText("");
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
            <p className="text-4xl font-extrabold">Loan Transactions</p>
            <p className="text-sm text-gray-600">View all loan transactions.</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mt-4 mb-5 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search transactions..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-10 placeholder:text-sm border p-2 w-full rounded-md border-gray-300 outline-none shadow-sm"
              />
            </div>
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
          </div>

          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-md shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* File Number Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Number
                  </label>
                  <input
                    type="text"
                    value={filters.fileNo}
                    onChange={(e) =>
                      handleFilterChange("fileNo", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Filter by file number"
                  />
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
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {/* Date Range Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) =>
                      handleFilterChange("fromDate", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) =>
                      handleFilterChange("toDate", e.target.value)
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
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performed By
                  </th>
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
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.transactionId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.loanId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.amount.toLocaleString("en-NG", {
                          style: "currency",
                          currency: "NGN",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.transactionCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.transactionDate)}
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
                        <td colSpan="7" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">
                                File Number:
                              </p>
                              <p className="text-gray-500">
                                {transaction.fileNo || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Performed By:
                              </p>
                              <p className="text-gray-500">
                                {transaction.performedBy || "N/A"}
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
                            <div>
                              <p className="font-medium text-gray-900">
                                Balance Before:
                              </p>
                              <p className="text-gray-500">
                                {transaction.loanBalanceBefore?.toLocaleString(
                                  "en-NG",
                                  {
                                    style: "currency",
                                    currency: "NGN",
                                  }
                                ) || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Balance After:
                              </p>
                              <p className="text-gray-500">
                                {transaction.loanBalanceAfter?.toLocaleString(
                                  "en-NG",
                                  {
                                    style: "currency",
                                    currency: "NGN",
                                  }
                                ) || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Approved At:
                              </p>
                              <p className="text-gray-500">
                                {transaction.approvedAt
                                  ? formatDate(transaction.approvedAt)
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {paginatedTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No transactions found.
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
    </Layout>
  );
};

export default LoanTransactionsPage;
