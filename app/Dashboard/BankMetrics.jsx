"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  CreditCard,
  Wallet,
  ArrowUpDown,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  PieChart,
  Calendar,
} from "lucide-react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import StatCard from "./StatCard";
import accountService from "@/Services/accountService";
import clientService from "@/Services/clientService";
import transactionService from "@/Services/transactionService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AccountMetrics = () => {
  const [metrics, setMetrics] = useState({
    clients: 0,
    accounts: 0,
    transactions: 0,
    activeAccounts: 0,
    totalBalance: 0,
    deposits: 0,
    withdrawals: 0,
    depositAmount: 0,
    withdrawalAmount: 0,
  });
  const [transactionTrend, setTransactionTrend] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("thisWeek");
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [error, setError] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Generate date range based on selection
  const getDateRange = () => {
    const now = new Date();
    let startDate = null;
    let endDate = null;

    switch (timeRange) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;
      case "yesterday":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "thisWeek":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        break;
      case "lastWeek":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "thisQuarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date();
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date();
        break;
      case "custom":
        if (customRange.startDate && customRange.endDate) {
          startDate = new Date(customRange.startDate);
          endDate = new Date(customRange.endDate);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
    }

    return { startDate, endDate };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { startDate, endDate } = getDateRange();

        // Fetch all data in parallel
        const [clientsRes, accountsRes, transactionsRes] = await Promise.all([
          clientService.getAllClients(),
          accountService.getAllAccounts(),
          transactionService.getTransactions(),
        ]);

        // Filter transactions client-side based on date range
        const filteredTransactions = transactionsRes.filter((transaction) => {
          const transactionDate = new Date(transaction.transactionDate);

          if (!startDate) {
            return endDate ? transactionDate <= endDate : true;
          }

          if (!endDate) {
            return transactionDate >= startDate;
          }

          return transactionDate >= startDate && transactionDate <= endDate;
        });

        // Process accounts data
        const activeAccounts = accountsRes.filter((acc) => acc.isActive).length;
        const totalBalance = accountsRes.reduce(
          (sum, acc) => sum + (acc.balance || 0),
          0
        );

        // Process transactions data
        const transactionStats = filteredTransactions.reduce(
          (stats, transaction) => {
            const amount = transaction.amount || 0;
            if (transaction.transactionTypeIndicator === "C") {
              stats.deposits++;
              stats.depositAmount += amount;
            } else if (transaction.transactionTypeIndicator === "D") {
              stats.withdrawals++;
              stats.withdrawalAmount += amount;
            }
            return stats;
          },
          { deposits: 0, withdrawals: 0, depositAmount: 0, withdrawalAmount: 0 }
        );

        // Get recent transactions (last 5)
        const recent = [...filteredTransactions]
          .sort(
            (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
          )
          .slice(0, 5);

        setMetrics({
          clients: clientsRes.length,
          accounts: accountsRes.length,
          transactions: filteredTransactions.length,
          activeAccounts,
          totalBalance,
          ...transactionStats,
        });

        setRecentTransactions(recent);
        prepareTransactionTrend(filteredTransactions);
        prepareAccountTypes(accountsRes);
        prepareTransactionTypes(filteredTransactions);
      } catch (err) {
        console.error("Error loading account metrics:", err);
        setError("Failed to load account metrics. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange, customRange]);

  const prepareTransactionTrend = (transactions) => {
    if (transactions.length === 0) {
      setTransactionTrend({
        labels: [],
        datasets: [],
      });
      return;
    }

    // Group transactions by time period (day/week/month)
    let periodFormat;

    if (timeRange === "thisWeek" || timeRange === "lastWeek") {
      periodFormat = { weekday: "short" };
    } else if (timeRange === "thisMonth" || timeRange === "lastMonth") {
      periodFormat = { month: "short", day: "numeric" };
    } else {
      periodFormat = { month: "short" };
    }

    const grouped = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.transactionDate);
      const period = date.toLocaleDateString("en-NG", periodFormat);

      if (!acc[period]) {
        acc[period] = { total: 0, deposits: 0, withdrawals: 0 };
      }
      acc[period].total++;
      if (transaction.transactionTypeIndicator === "C") {
        acc[period].deposits++;
      } else if (transaction.transactionTypeIndicator === "D") {
        acc[period].withdrawals++;
      }
      return acc;
    }, {});

    const labels = Object.keys(grouped);
    const totalData = Object.values(grouped).map((item) => item.total);
    const depositData = Object.values(grouped).map((item) => item.deposits);
    const withdrawalData = Object.values(grouped).map(
      (item) => item.withdrawals
    );

    setTransactionTrend({
      labels,
      datasets: [
        {
          label: "Total Transactions",
          data: totalData,
          borderColor: "#3D873B",
          backgroundColor: "rgba(61, 135, 59, 0.2)",
          tension: 0.3,
        },
        {
          label: "Deposits",
          data: depositData,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          tension: 0.3,
        },
        {
          label: "Withdrawals",
          data: withdrawalData,
          borderColor: "#F44336",
          backgroundColor: "rgba(244, 67, 54, 0.2)",
          tension: 0.3,
        },
      ],
    });
  };

  const prepareAccountTypes = (accounts) => {
    const typeCounts = accounts.reduce((acc, account) => {
      const type = account.depositTypeCode || "Other";
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type]++;
      return acc;
    }, {});

    setAccountTypes({
      labels: Object.keys(typeCounts),
      datasets: [
        {
          label: "Accounts by Type",
          data: Object.values(typeCounts),
          backgroundColor: [
            "#3D873B",
            "#2d6e2b",
            "#4CAF50",
            "#8BC34A",
            "#CDDC39",
          ],
        },
      ],
    });
  };

  const prepareTransactionTypes = (transactions) => {
    const typeCounts = transactions.reduce(
      (acc, transaction) => {
        if (transaction.transactionTypeIndicator === "C") {
          acc.deposits++;
        } else if (transaction.transactionTypeIndicator === "D") {
          acc.withdrawals++;
        } else {
          acc.other++;
        }
        return acc;
      },
      { deposits: 0, withdrawals: 0, other: 0 }
    );

    setTransactionTypes({
      labels: ["Deposits", "Withdrawals", "Other"],
      datasets: [
        {
          data: [typeCounts.deposits, typeCounts.withdrawals, typeCounts.other],
          backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
          hoverBackgroundColor: ["#66BB6A", "#EF5350", "#FFCA28"],
        },
      ],
    });
  };

  const handleCustomRangeApply = () => {
    if (!customRange.startDate || !customRange.endDate) {
      setError("Please select both start and end dates");
      return;
    }
    if (new Date(customRange.startDate) > new Date(customRange.endDate)) {
      setError("Start date cannot be after end date");
      return;
    }
    setTimeRange("custom");
    setShowCustomRange(false);
    setError(null);
  };

  const getTimeRangeLabel = () => {
    const { startDate, endDate } = getDateRange();

    if (timeRange === "custom") {
      return `${new Date(
        customRange.startDate
      ).toLocaleDateString()} - ${new Date(
        customRange.endDate
      ).toLocaleDateString()}`;
    }

    switch (timeRange) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "thisWeek":
        return "This Week";
      case "lastWeek":
        return "Last Week";
      case "thisMonth":
        return "This Month";
      case "lastMonth":
        return "Last Month";
      case "thisQuarter":
        return "This Quarter";
      case "thisYear":
        return "This Year";
      default:
        return "This Month";
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="relative w-14 h-14">
          <div className="absolute w-full h-full border-4 border-[#333] border-t-[#3D873B] rounded-full animate-spin"></div>

          <div className="absolute inset-0 flex items-center justify-center font-bold text-[#3D873B] text-xl">
            T
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#3D873B] text-white rounded-md hover:bg-[#2d6e2b]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowCustomRange(!showCustomRange)}
            className="flex items-center gap-1 px-3 py-2 border rounded-md hover:bg-gray-50"
          >
            <Calendar className="w-4 h-4" />
            <span>{getTimeRangeLabel()}</span>
          </button>

          {showCustomRange && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 p-4">
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customRange.startDate}
                    onChange={(e) =>
                      setCustomRange({
                        ...customRange,
                        startDate: e.target.value,
                      })
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
                    value={customRange.endDate}
                    onChange={(e) =>
                      setCustomRange({
                        ...customRange,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowCustomRange(false)}
                    className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomRangeApply}
                    className="px-3 py-1 text-sm bg-[#3D873B] text-white rounded hover:bg-[#2d6e2b]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <select
          value={timeRange}
          onChange={(e) => {
            setTimeRange(e.target.value);
            setShowCustomRange(false);
          }}
          className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B]"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="thisWeek">This Week</option>
          <option value="lastWeek">Last Week</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="thisQuarter">This Quarter</option>
          <option value="thisYear">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          title="Clients"
          value={metrics.clients.toString()}
          color="blue"
        />
        <StatCard
          icon={CreditCard}
          title="Accounts"
          value={metrics.accounts.toString()}
          color="green"
        />
        <StatCard
          icon={ArrowUpDown}
          title="Transactions"
          value={metrics.transactions.toString()}
          color="purple"
        />
        <StatCard
          icon={Wallet}
          title="Active Accounts"
          value={metrics.activeAccounts.toString()}
          color="yellow"
        />
        <StatCard
          icon={TrendingUp}
          title="Total Balance"
          value={metrics.totalBalance.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
          })}
          color="red"
        />
      </div>

      {/* Transaction Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={ArrowUpCircle}
          title="Deposits"
          value={metrics.deposits.toString()}
          color="green"
        />
        <StatCard
          icon={ArrowDownCircle}
          title="Withdrawals"
          value={metrics.withdrawals.toString()}
          color="red"
        />
        <StatCard
          icon={TrendingUp}
          title="Total Deposits"
          value={metrics.depositAmount.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
          })}
          color="teal"
        />
        <StatCard
          icon={TrendingUp}
          title="Total Withdrawals"
          value={metrics.withdrawalAmount.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
          })}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-md shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Transaction Trend
          </h3>
          <div className="w-full h-64">
            {transactionTrend.labels && transactionTrend.labels.length > 0 ? (
              <Line
                data={transactionTrend}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top" },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">
                No transaction data available for selected period
              </p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-md shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Transaction Types
          </h3>
          <div className="w-full h-64">
            {transactionTypes.labels && transactionTypes.labels.length > 0 ? (
              <Pie
                data={transactionTypes}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "right" },
                  },
                }}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">
                No transaction data available for selected period
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-md shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Account Types Distribution
          </h3>
          <div className="w-full h-64">
            {accountTypes.labels && accountTypes.labels.length > 0 ? (
              <Bar
                data={accountTypes}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">
                No account data available
              </p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-md shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Transaction Amounts
          </h3>
          <div className="w-full h-64">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">
                  Deposits:{" "}
                  {metrics.depositAmount.toLocaleString("en-NG", {
                    style: "currency",
                    currency: "NGN",
                  })}
                </p>
                <p className="text-gray-500">
                  Withdrawals:{" "}
                  {metrics.withdrawalAmount.toLocaleString("en-NG", {
                    style: "currency",
                    currency: "NGN",
                  })}
                </p>
                <p className="text-gray-500 font-semibold mt-2">
                  Net Flow:{" "}
                  {(
                    metrics.depositAmount - metrics.withdrawalAmount
                  ).toLocaleString("en-NG", {
                    style: "currency",
                    currency: "NGN",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-md shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Recent Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.transactionDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.accountCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.transactionTypeIndicator === "D"
                      ? "Withdrawal"
                      : "Deposit"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-4">
                    No recent transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountMetrics;
