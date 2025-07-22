"use client";
import React, { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaFilter,
  FaMoneyBillWave,
  FaArrowUp,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import loanService from "@/Services/loanService";
import roleService from "@/Services/roleService";
import formatDate from "@/app/components/formatdate";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 5;

const LoanAccountPage = () => {
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
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    loanTypeCode: "",
    supplierStatus: "",
    fileNo: "",
    fullyPaid: "",
  });

  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [repaymentForm, setRepaymentForm] = useState({
    loanId: "",
    fileNo: "",
    amount: 0,
    performedBy: user?.StaffCode,
    narration: "",
    reference: "",
    branchId: user?.BranchCode,
  });

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpForm, setTopUpForm] = useState({
    loanId: "",
    accountCode: "",
    topUpAmount: 0,
    newPaymentPeriodDays: 0,
    performedBy: user?.StaffCode || "",
  });

  useEffect(() => {
    if (user) {
      setRepaymentForm((prev) => ({
        ...prev,
        branchId: user?.BranchCode || "",
        performedBy: user?.StaffCode || "",
      }));
    }
  }, [user]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const loansResponse = await loanService.getLoanAccounts();
        setLoans(loansResponse || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch loans:", err);
        setError(err.message || "Failed to load loan data");
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
      const results = loans.filter((loan) => {
        // Text search
        const matchesText = Object.values(loan).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseFilter)
        );

        // Filter by loan type
        const matchesType =
          !filters.loanTypeCode ||
          loan.loanTypeCode.toLowerCase() ===
            filters.loanTypeCode.toLowerCase();

        // Filter by supplier status
        const matchesSupplierStatus =
          !filters.supplierStatus ||
          loan.supplierStatus.toLowerCase() ===
            filters.supplierStatus.toLowerCase();

        // Filter by file number
        const matchesFileNo =
          !filters.fileNo ||
          loan.fileNo.toLowerCase().includes(filters.fileNo.toLowerCase());

        // Filter by fully paid status
        const matchesFullyPaid =
          filters.fullyPaid === "" ||
          loan.fullyPaid === (filters.fullyPaid === "true");

        return (
          matchesText &&
          matchesType &&
          matchesSupplierStatus &&
          matchesFileNo &&
          matchesFullyPaid
        );
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
      loanTypeCode: "",
      supplierStatus: "",
      fileNo: "",
      fullyPaid: "",
    });
    setFilterText("");
  };

  const handleRepaymentInputChange = (e) => {
    const { name, value } = e.target;
    setRepaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRepaymentSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = {};
    if (!repaymentForm.loanId) toast.error("Loan ID is required");
    if (!repaymentForm.fileNo) toast.error("File number is required");

    if (Object.keys(errors).length > 0) {
      toast.error(errors);
      return;
    }

    try {
      await loanService.postLoanRepayment(repaymentForm);
      toast.success("Loan repayment recorded successfully");
      setShowRepaymentModal(false);
      setRepaymentForm({
        loanId: "",
        fileNo: "",
        amount: 0,
        performedBy: "",
        narration: "",
        reference: "",
        branchId: "",
      });

      const loansResponse = await loanService.getLoanAccounts();
      setLoans(loansResponse || []);
    } catch (error) {
      console.error("Failed to record repayment:", error);
      toast.error(error.message || "Failed to record repayment");
    }
  };

  const openRepaymentModal = (loan) => {
    setRepaymentForm({
      loanId: loan.loanId,
      fileNo: loan.fileNo,
      amount: loan.loanUnpaid > 0 ? loan.loanUnpaid : 0,
      performedBy: user?.StaffCode || "",
      narration: "",
      reference: "",
      branchId: user?.BranchCode || "",
    });
    setShowRepaymentModal(true);
  };

  const handleTopUpInputChange = (e) => {
    const { name, value } = e.target;
    setTopUpForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!topUpForm.loanId) {
      toast.error("Loan ID is required");
      return;
    }
    if (!topUpForm.accountCode) {
      toast.error("Account code is required");
      return;
    }
    if (topUpForm.topUpAmount <= 0) {
      toast.error("Top-up amount must be greater than 0");
      return;
    }
    if (topUpForm.newPaymentPeriodDays <= 0) {
      toast.error("Payment period must be greater than 0");
      return;
    }

    try {
      await loanService.postTopupLoan(topUpForm);
      toast.success("Loan top-up successful");
      setShowTopUpModal(false);

      // Refresh loan data
      const loansResponse = await loanService.getLoanAccounts();
      setLoans(loansResponse || []);
    } catch (error) {
      console.error("Failed to process top-up:", error);
      toast.error(error.message || "Failed to process top-up");
    }
  };

  const openTopUpModal = (loan) => {
    setTopUpForm({
      loanId: loan.loanId,
      accountCode: loan.accountCode,
      topUpAmount: 0,
      newPaymentPeriodDays: loan.paymentPeriodDays || 0,
      performedBy: user?.StaffCode || "",
    });
    setShowTopUpModal(true);
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
            <p className="text-4xl font-extrabold">Loan Accounts</p>
            <p className="text-sm text-gray-600">View all loan accounts.</p>
          </div>
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
            <>
              <button
                onClick={() => {
                  if (loans.length > 0) {
                    openRepaymentModal(loans[0]);
                  } else {
                    toast.error("No loans available for repayment");
                  }
                }}
                disabled={!hasPrivilege("ProcessLoanPayments")}
                title={
                  !hasPrivilege("ProcessLoanPayments")
                    ? "You do not have permission to process loan payments"
                    : ""
                }
                className={` p-2 text-sm bg-[#3D873B] hover:opacity-95 font-bold text-white rounded-md cursor-pointer ${
                  !hasPrivilege("ProcessLoanPayments")
                    ? "opacity-50 hover:cursor-not-allowed"
                    : ""
                }`}
              >
                <span>Record Payment</span>
              </button>
              <button
                onClick={() => {
                  if (loans.length > 0) {
                    openTopUpModal(loans[0]);
                  } else {
                    toast.error("No loans available for top-up");
                  }
                }}
                className={`flex text-sm  cursor-pointer items-center gap-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 ${
                  !hasPrivilege("ProcessLoanTopUps")
                    ? "opacity-50 hover:cursor-not-allowed"
                    : ""
                }`}
                disabled={!hasPrivilege("ProcessLoanTopUps")}
                title={
                  !hasPrivilege("ProcessLoanTopUps")
                    ? "You do not have permission to top-up loans"
                    : ""
                }
              >
                <FaArrowUp />
                <span>Top Up Loan</span>
              </button>
            </>
          </div>

          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-md shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Loan Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Type
                  </label>
                  <input
                    type="text"
                    value={filters.loanTypeCode}
                    onChange={(e) =>
                      handleFilterChange("loanTypeCode", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Filter by loan type"
                  />
                </div>

                {/* Supplier Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Status
                  </label>
                  <input
                    type="text"
                    value={filters.supplierStatus}
                    onChange={(e) =>
                      handleFilterChange("supplierStatus", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Filter by supplier status"
                  />
                </div>

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

                {/* Fully Paid Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={filters.fullyPaid}
                    onChange={(e) =>
                      handleFilterChange("fullyPaid", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Statuses</option>
                    <option value="true">Fully Paid</option>
                    <option value="false">Not Fully Paid</option>
                  </select>
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
                    Account Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Borrowed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Unpaid
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
                        <div className="text-sm font-medium text-gray-900">
                          {loan.loanId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {loan.fileNo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.accountCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {loan.loanBorrowed.toLocaleString("en-NG", {
                          style: "currency",
                          currency: "NGN",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {loan.loanUnpaid.toLocaleString("en-NG", {
                          style: "currency",
                          currency: "NGN",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            loan.fullyPaid
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {loan.fullyPaid ? "Fully Paid" : "Active"}
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
                                Loan Type:
                              </p>
                              <p className="text-gray-500">
                                {loan.loanTypeCode || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Supplier Status:
                              </p>
                              <p className="text-gray-500">
                                {loan.supplierStatus || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Payment Period (Days):
                              </p>
                              <p className="text-gray-500">
                                {loan.paymentPeriodDays || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                First Payment Date:
                              </p>
                              <p className="text-gray-500">
                                {formatDate(loan.firstPaymentDate) || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Last Payment Date:
                              </p>
                              <p className="text-gray-500">
                                {formatDate(loan.lastPaymentDate) || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Tenure Ending Date:
                              </p>
                              <p className="text-gray-500">
                                {formatDate(loan.tenureEndingDate) || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Created At:
                              </p>
                              <p className="text-gray-500">
                                {formatDate(loan.createdAt) || "N/A"}
                              </p>
                            </div>
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
                      No loan accounts available.
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
        {showRepaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Record Loan Repayment</h3>
                <button
                  onClick={() => setShowRepaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleRepaymentSubmit}>
                <div className="space-y-4 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan ID
                    </label>
                    <select
                      name="loanId"
                      value={repaymentForm.loanId}
                      onChange={handleRepaymentInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Loan ID</option>
                      {loans.map((loan) => (
                        <option key={loan.loanId} value={loan.loanId}>
                          {loan.loanId}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Number
                    </label>
                    <select
                      name="fileNo"
                      value={repaymentForm.fileNo}
                      onChange={handleRepaymentInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select File Number</option>
                      {loans.map((loan) => (
                        <option key={loan.fileNo} value={loan.fileNo}>
                          {loan.fileNo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      min="0.01"
                      step="0.01"
                      value={repaymentForm.amount}
                      onChange={handleRepaymentInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Performed By
                    </label>
                    <input
                      type="text"
                      name="performedBy"
                      value={repaymentForm.performedBy}
                      onChange={handleRepaymentInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Narration
                    </label>
                    <input
                      type="text"
                      name="narration"
                      value={repaymentForm.narration}
                      onChange={handleRepaymentInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference
                    </label>
                    <input
                      type="text"
                      name="reference"
                      value={repaymentForm.reference}
                      onChange={handleRepaymentInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="hidden">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch ID
                    </label>
                    <input
                      type="text"
                      name="branchId"
                      value={repaymentForm.branchId}
                      onChange={handleRepaymentInputChange}
                      disabled
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRepaymentModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#3D873B] text-white rounded-md hover:bg-[#2d6d2b]"
                  >
                    Submit Repayment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showTopUpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Loan Top Up</h3>
                <button
                  onClick={() => setShowTopUpModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleTopUpSubmit}>
                <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan ID
                    </label>
                    <select
                      name="loanId"
                      value={topUpForm.loanId}
                      onChange={handleTopUpInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Loan ID</option>
                      {loans.map((loan) => (
                        <option key={loan.loanId} value={loan.loanId}>
                          {loan.loanId}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Code
                    </label>
                    <select
                      name="accountCode"
                      value={topUpForm.accountCode}
                      onChange={handleTopUpInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Account</option>
                      {loans.map((loan) => (
                        <option key={loan.accountCode} value={loan.accountCode}>
                          {loan.accountCode}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Top Up Amount
                    </label>
                    <input
                      type="number"
                      name="topUpAmount"
                      min="0.01"
                      step="0.01"
                      value={topUpForm.topUpAmount}
                      onChange={handleTopUpInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Payment Period (Days)
                    </label>
                    <input
                      type="number"
                      name="newPaymentPeriodDays"
                      min="1"
                      value={topUpForm.newPaymentPeriodDays}
                      onChange={handleTopUpInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="hidden">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Performed By
                    </label>
                    <input
                      type="text"
                      name="performedBy"
                      value={topUpForm.performedBy}
                      onChange={handleTopUpInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTopUpModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#3D873B] text-white rounded-md hover:bg-[#2d6d2b]"
                  >
                    Submit Top Up
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LoanAccountPage;
