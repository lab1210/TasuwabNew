"use client";
import React, { useState, useEffect } from "react";
import {
  Download,
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { useAuth } from "@/Services/authService";
import loanService from "@/Services/loanService";
import formatDate from "@/app/components/formatdate";
import Layout from "@/app/components/Layout";
import toast from "react-hot-toast";
import formatCurrency from "@/app/components/formatCurrency";

const LoanTopUpHistoryPage = () => {
  const { user } = useAuth();
  const [loanAccounts, setLoanAccounts] = useState([]);
  const [selectedFileNo, setSelectedFileNo] = useState("");
  const [topUpHistory, setTopUpHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [loading, setLoading] = useState(false);


  const [searchTerm, setSearchTerm] = useState("");
  const [loanDetails, setLoanDetails] = useState(null);

  // Fetch loan accounts on component mount
  useEffect(() => {
    const fetchLoanAccounts = async () => {
      try {
        setLoading(true);
        const loans = await loanService.getLoanAccounts();
        setLoanAccounts(loans);
      } catch (err) {
        toast.error("Failed to load loan accounts");
      } finally {
        setLoading(false);
      }
    };

    fetchLoanAccounts();
  }, []);

  // Fetch top-up history when fileNo is selected
  useEffect(() => {
    if (!selectedFileNo) return;

    const fetchTopUpHistory = async () => {
      try {
        setLoading(true);

        // Find the selected loan details
        const details = loanAccounts.find(
          (loan) => loan.fileNo === selectedFileNo
        );
        setLoanDetails(details);

        // Fetch top-up history for the loan using fileNo
        const history = await loanService.getTopUpHistory(selectedFileNo);

        // Sort history by date in descending order (newest first)
        const sortedHistory = [...history].sort(
          (a, b) => new Date(b.topUpDate) - new Date(a.topUpDate)
        );

        setTopUpHistory(sortedHistory);
        setFilteredHistory(sortedHistory);
      } catch (err) {
        toast.error("Failed to load top-up history");
      } finally {
        setLoading(false);
      }
    };

    fetchTopUpHistory();
  }, [selectedFileNo, loanAccounts]);

  // Apply filters when date range or search term changes
  useEffect(() => {
    let filtered = [...topUpHistory];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.performedBy.toLowerCase().includes(term) ||
          item.status.toLowerCase().includes(term) ||
          item.amount.toString().includes(term)
      );
    }

    setFilteredHistory(filtered);
  }, [searchTerm, topUpHistory]);

  const toggleRow = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
    };

    const statusClass =
      statusMap[status.toLowerCase()] || "bg-gray-100 text-gray-800";

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
        {status}
      </span>
    );
  };

  return (
    <Layout>
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-6">Loan Top-Up History</h1>
        {/* Loan Account Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select File Number
          </label>
          <select
            value={selectedFileNo}
            onChange={(e) => setSelectedFileNo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={loading}
          >
            <option value="">Select a Loan File Number</option>
            {loanAccounts.map((loan) => (
              <option key={loan.fileNo} value={loan.fileNo}>
                {loan.fileNo} - {loan.loanTypeCode} (₦
                {formatCurrency(loan.loanBorrowed)})
              </option>
            ))}
          </select>
        </div>
        {/* Loan Summary */}
        {loanDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700">
                Original Loan Amount
              </h3>
              <p className="text-xl font-bold text-[#3D873B]">
                {formatCurrency(loanDetails.loanBorrowed)}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700">
                Current Balance
              </h3>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(loanDetails.loanUnpaid)}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700">Status</h3>
              <p
                className={`text-xl font-bold ${
                  loanDetails.fullyPaid ? "text-[#3D873B]" : "text-yellow-600"
                }`}
              >
                {loanDetails.fullyPaid
                  ? "Fully Paid"
                  : loanDetails.statusMessage}
              </p>
            </div>
          </div>
        )}
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by performer or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3D873B]"></div>
          </div>
        )}
        {/* Top-Up History Table */}
        {selectedFileNo && !loading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Payment Period Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Tenure Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((topUp, index) => (
                      <React.Fragment key={index}>
                        <tr className="hover:bg-gray-50 cursor-pointer">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(topUp.topUpDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#3D873B]">
                            {formatCurrency(topUp.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500">
                            {topUp.newPaymentPeriodDays}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(topUp.newTotalBorrowed)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500">
                            {formatDate(topUp.newTenureEndingDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {topUp.performedBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(topUp.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => toggleRow(index)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {expandedRows.includes(index) ? (
                                <ChevronUp />
                              ) : (
                                <ChevronDown />
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedRows.includes(index) && (
                          <tr className="bg-gray-50">
                            <td colSpan="7" className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    New Tenure Ending Date:
                                  </p>
                                  <p className="text-gray-500">
                                    {formatDate(topUp.newTenureEndingDate)}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    New Payment Period:
                                  </p>
                                  <p className="text-gray-500">
                                    {topUp.newPaymentPeriodDays} days
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Loan File No:
                                  </p>
                                  <p className="text-gray-500">
                                    {selectedFileNo}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Loan Type:
                                  </p>
                                  <p className="text-gray-500">
                                    {loanDetails?.loanTypeCode}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No top-up history found for the selected loan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LoanTopUpHistoryPage;
