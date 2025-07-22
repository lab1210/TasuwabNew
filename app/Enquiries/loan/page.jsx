"use client";
import React, { useState, useEffect } from "react";
import { Download, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/Services/authService";
import loanService from "@/Services/loanService"; // Assuming you have a loanService
import formatDate from "@/app/components/formatdate";
import Layout from "@/app/components/Layout";
import toast from "react-hot-toast";

const LoanStatementPage = () => {
  const { user } = useAuth();
  const [loanAccounts, setLoanAccounts] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  // Fetch transactions and details when loan is selected
  useEffect(() => {
    if (!selectedLoan) return;

    const fetchLoanData = async () => {
      try {
        setLoading(true);

        // Fetch loan details
        const details = loanAccounts.find(
          (loan) => loan.loanId === selectedLoan
        );
        setLoanDetails(details);

        // Fetch transactions for the loan
        const transactions = await loanService.getLoanTransactions(
          selectedLoan
        );

        // Sort transactions by date in descending order (newest first)
        const sortedTransactions = [...transactions].sort(
          (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
        );

        setTransactions(sortedTransactions);
        setFilteredTransactions(sortedTransactions);
      } catch (err) {
        toast.error("Failed to load loan data");
      } finally {
        setLoading(false);
      }
    };

    fetchLoanData();
  }, [selectedLoan, loanAccounts]);

  useEffect(() => {
    if (!dateRange.startDate && !dateRange.endDate) {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter((tx) => {
      const txDate = new Date(tx.transactionDate);
      const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
      const end = dateRange.endDate ? new Date(dateRange.endDate) : null;

      if (start && txDate < start) return false;
      if (end && txDate > end) return false;
      return true;
    });

    setFilteredTransactions(filtered);
  }, [dateRange, transactions]);

  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  return (
    <Layout>
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-6">Loan Statement of Account</h1>

        {/* Loan Account Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Loan Account
          </label>
          <select
            value={selectedLoan}
            onChange={(e) => setSelectedLoan(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={loading}
          >
            <option value="">Select a loan account</option>
            {loanAccounts.map((loan) => (
              <option key={loan.loanId} value={loan.loanId}>
                {loan.fileNo} - {loan.loanTypeCode} (₦
                {loan.loanBorrowed.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        {/* Loan Summary */}
        {loanDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700">Loan Amount</h3>
              <p className="text-xl font-bold text-[#3D873B]">
                ₦{loanDetails.loanBorrowed.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700">
                Outstanding Balance
              </h3>
              <p className="text-xl font-bold text-red-600">
                ₦{loanDetails.loanUnpaid.toLocaleString()}
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

        {/* Date Range Filter */}
        <div className="mb-6 relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <Calendar className="w-5 h-5" />
            {dateRange.startDate || dateRange.endDate ? (
              <span>
                {dateRange.startDate || "Start"} to {dateRange.endDate || "End"}
              </span>
            ) : (
              <span>Filter by date range</span>
            )}
            {showDatePicker ? <ChevronUp /> : <ChevronDown />}
          </button>

          {showDatePicker && (
            <div className="absolute z-10 mt-2 bg-white p-4 border rounded-md shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, startDate: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, endDate: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setDateRange({ startDate: "", endDate: "" });
                    setShowDatePicker(false);
                  }}
                  className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="px-3 py-1 text-sm bg-[#3D873B] text-white rounded hover:bg-[#2d6e2b]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3D873B]"></div>
          </div>
        )}

        {/* Transactions Table */}
        {selectedLoan && !loading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <React.Fragment key={transaction.transactionId}>
                        <tr className="hover:bg-gray-50 cursor-pointer">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.transactionDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.reference || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.narration}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm font-bold"
                            style={{
                              color:
                                transaction.transactionType === "DEBIT"
                                  ? "red"
                                  : "green",
                            }}
                          >
                            ₦{transaction.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.transactionType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₦{transaction.balanceAfter.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() =>
                                toggleRow(transaction.transactionId)
                              }
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {expandedRows.includes(
                                transaction.transactionId
                              ) ? (
                                <ChevronUp />
                              ) : (
                                <ChevronDown />
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedRows.includes(transaction.transactionId) && (
                          <tr className="bg-gray-50">
                            <td colSpan="7" className="px-6 py-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Transaction ID:
                                  </p>
                                  <p className="text-gray-500">
                                    {transaction.transactionId}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Loan ID:
                                  </p>
                                  <p className="text-gray-500">
                                    {transaction.loanId}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Payment Method:
                                  </p>
                                  <p className="text-gray-500">
                                    {transaction.paymentMethod || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Status:
                                  </p>
                                  <p className="text-gray-500">
                                    {transaction.status}
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
                        colSpan="7"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No transactions found for the selected loan
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

export default LoanStatementPage;
