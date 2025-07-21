"use client";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaPlus, FaFilter } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import loanService from "@/Services/loanService";
import branchService from "@/Services/branchService";
import roleService from "@/Services/roleService";
import formatDate from "@/app/components/formatdate";
import { useRouter } from "next/navigation";
import LoanTypeService from "@/Services/loanTypeService";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

const LoanRequestsPage = () => {
  const { user } = useAuth();
  const [expandedRows, setExpandedRows] = useState([]);
  const [loans, setLoans] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loanTypes, setLoanTypes] = useState([]);
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    loanType: "",
    status: "",
    accountCode: "",
    startDate: "",
    endDate: "",
  });

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loanTypesResponse = await LoanTypeService.getLoanTypes();
        setLoanTypes(loanTypesResponse || []);

        const loansResponse = await loanService.getLoans({
          accountCode: filters.accountCode,
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
        const sortedLoans = [...(loansResponse || [])].sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
        setLoans(sortedLoans);
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
      const results = loans.filter((loan) => {
        // Text search
        const matchesText = Object.values(loan).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseFilter)
        );

        // Filter by loan type
        const matchesType =
          !filters.loanType || loan.loanTypeCode === filters.loanType;

        // Filter by status
        const matchesStatus =
          filters.status === "" ||
          loan.status.toLowerCase() === filters.status.toLowerCase();

        return matchesText && matchesType && matchesStatus;
      });

      setFilteredLoans(results);
      setCurrentPage(1);
    };
    handleFilter();
  }, [loans, filterText, filters]);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLoans = filteredLoans.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE);

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
      loanType: "",
      status: "",
      accountCode: "",
      startDate: "",
      endDate: "",
    });
    setFilterText("");
  };

  const handleApproveLoan = async (loanId) => {
    try {
      await loanService.approveLoan(loanId);
      toast.success("Loan approved successfully");
      // Refresh loans after approval
      const loansResponse = await loanService.getLoans();
      setLoans(loansResponse || []);
    } catch (error) {
      toast.error(error.message || "Failed to approve loan");
    }
  };

  const handleRejectLoan = async (loanId) => {
    try {
      await loanService.rejectLoan(loanId);
      toast.success("Loan rejected successfully");
      // Refresh loans after rejection
      const loansResponse = await loanService.getLoans();
      setLoans(loansResponse || []);
    } catch (error) {
      toast.error(error.message || "Failed to reject loan");
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
            <p className="text-4xl font-extrabold">Loan Requests</p>
            <p className="text-sm text-gray-600">View all loan applications.</p>
          </div>
          {hasPrivilege("CreateLoanRequests") && (
            <div
              onClick={() => router.push("/Loan/Request-Form")}
              id="add-loan-icon"
              className="w-7 h-7 rounded-full cursor-pointer hover:bg-gray-100 p-1"
            >
              <FaPlus className="text-[#3D873B] w-full h-full" />
            </div>
          )}
          <Tooltip
            anchorId="add-loan-icon"
            content="New Loan Application"
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
              placeholder="Search Loans..."
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
          </div>

          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-md shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Loan Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Type
                  </label>
                  <select
                    value={filters.loanType}
                    onChange={(e) =>
                      handleFilterChange("loanType", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Types</option>
                    {loanTypes.map((type) => (
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
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Disbursed">Disbursed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

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

        {/* Loans Table */}
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLoans.map((loan) => (
                  <React.Fragment key={loan.loanId}>
                    <tr
                      onClick={() => toggleRow(loan.loanId)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {loan.loanId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(loan.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {loan.accountCode}
                        </div>
                        <div className="text-sm text-gray-500">{loan.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(loan.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.loanTypeCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            loan.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : loan.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : loan.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : loan.status === "Disbursed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(loan.loanId);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title="More Details"
                        >
                          {expandedRows.includes(loan.loanId) ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.includes(loan.loanId) && (
                      <tr className="bg-gray-50">
                        <td colSpan="6" className="px-6 py-4">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">
                                Purpose:
                              </p>
                              <p className="text-gray-500">
                                {loan.purpose || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Term:</p>
                              <p className="text-gray-500">
                                {loan.paymentPeriod} months
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Created By:
                              </p>
                              <p className="text-gray-500">
                                {loan.performedBy}
                              </p>
                            </div>
                            {loan.needSupplierRequest && (
                              <>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Asset:
                                  </p>
                                  <p className="text-gray-500">
                                    {loan.assetName || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Quantity:
                                  </p>
                                  <p className="text-gray-500">
                                    {loan.assetQuantity || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Supplier:
                                  </p>
                                  <p className="text-gray-500">
                                    {loan.supplierId || "N/A"}
                                  </p>
                                </div>
                              </>
                            )}
                            {hasPrivilege("ApproveLoans") &&
                              loan.status === "Pending" && (
                                <div className="col-span-3 flex justify-end gap-3">
                                  <button
                                    onClick={() =>
                                      handleApproveLoan(loan.loanId)
                                    }
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectLoan(loan.loanId)
                                    }
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {paginatedLoans.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No loan requests available.
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

export default LoanRequestsPage;
