"use client";
import React, { useState, useEffect } from "react";
import { Download, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/Services/authService";
import transactionService from "@/Services/transactionService";
import formatDate from "@/app/components/formatdate";
import Layout from "@/app/components/Layout";
import useAccountService from "@/Services/accountService";
import toast from "react-hot-toast";

const ClientStatementPage = () => {
  const { user } = useAuth();
  const [accountCodes, setAccountCodes] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  // Fetch account codes on component mount
  useEffect(() => {
    const fetchAccountCodes = async () => {
      try {
        setLoading(true);
        const accounts = await useAccountService.getAllAccounts();
        setAccountCodes(
          accounts.map((acc) => ({
            code: acc.accountCode,
            name: `${acc.accountCode} - ${acc.accountName}`,
          }))
        );
      } catch (err) {
        toast.error("Failed to load account codes");
      } finally {
        setLoading(false);
      }
    };

    fetchAccountCodes();
  }, []);

  // Fetch transactions when account is selected
  useEffect(() => {
    if (!selectedAccount) return;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const transactions = await transactionService.getTransactions({
          accountCode: selectedAccount,
        });
        // Sort transactions by date in descending order (newest first)
        const sortedTransactions = [...transactions].sort(
          (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)
        );
        setTransactions(sortedTransactions);
        setFilteredTransactions(sortedTransactions);

        // Calculate current balance from transactions
        if (sortedTransactions.length > 0) {
          // The first transaction (most recent) will have the current balance
          setCurrentBalance(
            sortedTransactions[sortedTransactions.length - 1].balanceAfter
          );
        } else {
          setCurrentBalance(0);
        }
      } catch (err) {
        toast.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedAccount]);

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

    // Maintain the reversed order after filtering
    setFilteredTransactions(filtered);
  }, [dateRange, transactions]);

  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleExport = async (format) => {
    try {
      if (
        !selectedAccount ||
        dateRange.startDate === "" ||
        dateRange.endDate === ""
      ) {
        toast.error("Please select a date range to export");
        return;
      }
      setIsExporting(true);
      const response = await transactionService.exportTransactions({
        accountCode: selectedAccount,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format,
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Set filename
      const fileName = `Statement_${selectedAccount}_${
        dateRange.startDate || "all"
      }_to_${dateRange.endDate || "now"}.${format.toLowerCase()}`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Layout>
      <div className="w-full ">
        <h1 className="text-2xl font-bold mb-6">Client Statement of Account</h1>

        {/* Account Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Account
          </label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={loading}
          >
            <option value="">Select an account</option>
            {accountCodes.map((account) => (
              <option key={account.code} value={account.code}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

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

        {/* Export Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleExport("PDF")}
            disabled={!selectedAccount || isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {isExporting ? "Exporting..." : "Export as PDF"}
          </button>
          <button
            onClick={() => handleExport("CSV")}
            disabled={!selectedAccount || isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {isExporting ? "Exporting..." : "Export as CSV"}
          </button>
        </div>
        {/* Current Balance Display */}
        {selectedAccount && (
          <div className="flex justify-end">
            <div className="mb-6 p-4 bg-gray-200 rounded-md">
              <h2 className="text-sm flex flex-col font-medium text-[#333]">
                Current Account Balance:
                <span className="font-extrabold text-2xl text-[#3D873B]">
                  {currentBalance.toLocaleString("en-NG", {
                    style: "currency",
                    currency: "NGN",
                  })}
                </span>
              </h2>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3D873B]"></div>
          </div>
        )}

        {/* Transactions Table */}
        {selectedAccount && !loading && (
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
                      Debit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance Before
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance After
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
                            className="px-6 font-bold py-4 whitespace-nowrap text-sm text-gray-500"
                            style={{
                              color:
                                transaction.transactionTypeIndicator === "D"
                                  ? "red"
                                  : "green",
                            }}
                          >
                            {transaction.transactionTypeIndicator === "D"
                              ? transaction.amount.toLocaleString("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                })
                              : "-"}
                          </td>
                          <td
                            className="px-6 py-4 font-bold whitespace-nowrap text-sm text-gray-500"
                            style={{
                              color:
                                transaction.transactionTypeIndicator === "D"
                                  ? "red"
                                  : "green",
                            }}
                          >
                            {transaction.transactionTypeIndicator === "C"
                              ? transaction.amount.toLocaleString("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                })
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.balanceBefore.toLocaleString("en-NG", {
                              style: "currency",
                              currency: "NGN",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.balanceAfter.toLocaleString("en-NG", {
                              style: "currency",
                              currency: "NGN",
                            })}
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
                                    Account Code:
                                  </p>
                                  <p className="text-gray-500">
                                    {transaction.accountCode}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Transaction Type:
                                  </p>
                                  <p className="text-gray-500">
                                    {transaction.transactionTypeIndicator ===
                                    "C"
                                      ? "Credit"
                                      : "Debit"}
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
                        No transactions found for the selected account
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

export default ClientStatementPage;
