"use client";
import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
  DollarSign,
  PieChart,
  Calendar,
  TrendingUp,
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
import loanService from "@/Services/loanService";

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

const LoanMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalLoans: 0,
    approvedLoans: 0,
    pendingLoans: 0,
    rejectedLoans: 0,
    activeLoans: 0,
    totalLoanAmount: 0,
    totalOutstanding: 0,
    totalRepaid: 0,
    overdueLoans: 0,
  });
  const [loanTrend, setLoanTrend] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [loanStatuses, setLoanStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("thisYear");
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [error, setError] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);

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

        // Fetch loan requests and accounts in parallel
        const [requestsRes, accountsRes] = await Promise.all([
          loanService.getLoans(),
          loanService.getLoanAccounts(),
        ]);

        const loanRequests = requestsRes.items || [];
        const loanAccounts = accountsRes.items || [];

        // Filter loan requests based on date range
        const filteredRequests = loanRequests.filter((loan) => {
          const loanDate = new Date(loan.createdAt);
          return (
            (!startDate || loanDate >= startDate) &&
            (!endDate || loanDate <= endDate)
          );
        });

        // Calculate metrics
        const totalLoans = filteredRequests.length;
        const approvedLoans = filteredRequests.filter(
          (loan) => loan.status === "Approved"
        ).length;
        const pendingLoans = filteredRequests.filter(
          (loan) => loan.status === "Pending"
        ).length;
        const rejectedLoans = filteredRequests.filter(
          (loan) => loan.status === "Rejected"
        ).length;

        // Calculate loan amounts from accounts
        const totalLoanAmount = loanAccounts.reduce(
          (sum, account) => sum + (account.loanBorrowed || 0),
          0
        );
        const totalOutstanding = loanAccounts.reduce(
          (sum, account) => sum + (account.loanUnpaid || 0),
          0
        );
        const totalRepaid = loanAccounts.reduce(
          (sum, account) =>
            sum + ((account.loanBorrowed || 0) - (account.loanUnpaid || 0)),
          0
        );

        // Get active loans (not fully paid)
        const activeLoans = loanAccounts.filter(
          (account) => !account.fullyPaid
        ).length;

        // Get overdue loans (assuming overdue if past tenureEndingDate)
        const now = new Date();
        const overdueLoans = loanAccounts.filter(
          (account) =>
            !account.fullyPaid &&
            account.tenureEndingDate &&
            new Date(account.tenureEndingDate) < now
        ).length;

        // Get recent loans (last 5)
        const recent = [...filteredRequests]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setMetrics({
          totalLoans,
          approvedLoans,
          pendingLoans,
          rejectedLoans,
          activeLoans,
          totalLoanAmount,
          totalOutstanding,
          totalRepaid,
          overdueLoans,
        });

        setRecentLoans(recent);
        prepareLoanTrend(filteredRequests);
        prepareLoanTypes(filteredRequests);
        prepareLoanStatuses(filteredRequests);
      } catch (err) {
        console.error("Error loading loan metrics:", err);
        setError("Failed to load loan metrics. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange, customRange]);

  const prepareLoanTrend = (loans) => {
    if (loans.length === 0) {
      setLoanTrend({
        labels: [],
        datasets: [],
      });
      return;
    }

    // Group loans by time period (day/week/month)
    let periodFormat;

    if (timeRange === "thisWeek" || timeRange === "lastWeek") {
      periodFormat = { weekday: "short" };
    } else if (timeRange === "thisMonth" || timeRange === "lastMonth") {
      periodFormat = { month: "short", day: "numeric" };
    } else {
      periodFormat = { month: "short" };
    }

    const grouped = loans.reduce((acc, loan) => {
      const date = new Date(loan.createdAt);
      const period = date.toLocaleDateString("en-NG", periodFormat);

      if (!acc[period]) {
        acc[period] = { total: 0, approved: 0, pending: 0, rejected: 0 };
      }
      acc[period].total++;
      if (loan.status === "Approved") {
        acc[period].approved++;
      } else if (loan.status === "Pending") {
        acc[period].pending++;
      } else if (loan.status === "Rejected") {
        acc[period].rejected++;
      }
      return acc;
    }, {});

    const labels = Object.keys(grouped);
    const totalData = Object.values(grouped).map((item) => item.total);
    const approvedData = Object.values(grouped).map((item) => item.approved);
    const pendingData = Object.values(grouped).map((item) => item.pending);
    const rejectedData = Object.values(grouped).map((item) => item.rejected);

    setLoanTrend({
      labels,
      datasets: [
        {
          label: "Total Loans",
          data: totalData,
          borderColor: "#3D873B",
          backgroundColor: "rgba(61, 135, 59, 0.2)",
          tension: 0.3,
        },
        {
          label: "Approved",
          data: approvedData,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          tension: 0.3,
        },
        {
          label: "Pending",
          data: pendingData,
          borderColor: "#FFC107",
          backgroundColor: "rgba(255, 193, 7, 0.2)",
          tension: 0.3,
        },
        {
          label: "Rejected",
          data: rejectedData,
          borderColor: "#F44336",
          backgroundColor: "rgba(244, 67, 54, 0.2)",
          tension: 0.3,
        },
      ],
    });
  };

  const prepareLoanTypes = (loans) => {
    const typeCounts = loans.reduce((acc, loan) => {
      const type = loan.loanTypeCode || "Other";
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type]++;
      return acc;
    }, {});

    setLoanTypes({
      labels: Object.keys(typeCounts),
      datasets: [
        {
          label: "Loans by Type",
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

  const prepareLoanStatuses = (loans) => {
    const statusCounts = loans.reduce(
      (acc, loan) => {
        if (loan.status === "Approved") {
          acc.approved++;
        } else if (loan.status === "Pending") {
          acc.pending++;
        } else if (loan.status === "Rejected") {
          acc.rejected++;
        }
        return acc;
      },
      { approved: 0, pending: 0, rejected: 0 }
    );

    setLoanStatuses({
      labels: ["Approved", "Pending", "Rejected"],
      datasets: [
        {
          data: [
            statusCounts.approved,
            statusCounts.pending,
            statusCounts.rejected,
          ],
          backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
          hoverBackgroundColor: ["#66BB6A", "#FFD54F", "#EF5350"],
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

      {/* Loan Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={CreditCard}
          title="Total Loans"
          value={metrics.totalLoans.toString()}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          title="Approved"
          value={metrics.approvedLoans.toString()}
          color="green"
        />
        <StatCard
          icon={Clock}
          title="Pending"
          value={metrics.pendingLoans.toString()}
          color="yellow"
        />
        <StatCard
          icon={XCircle}
          title="Rejected"
          value={metrics.rejectedLoans.toString()}
          color="red"
        />
        <StatCard
          icon={Wallet}
          title="Active"
          value={metrics.activeLoans.toString()}
          color="purple"
        />
      </div>

      {/* Loan Amount Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          title="Total Amount"
          value={metrics.totalLoanAmount.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
          })}
          color="teal"
        />
        <StatCard
          icon={TrendingUp}
          title="Total Repaid"
          value={metrics.totalRepaid.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
          })}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="Outstanding"
          value={metrics.totalOutstanding.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
          })}
          color="orange"
        />
        <StatCard
          icon={Clock}
          title="Overdue"
          value={metrics.overdueLoans.toString()}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-md shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Loan Application Trend
          </h3>
          <div className="w-full h-64">
            {loanTrend.labels && loanTrend.labels.length > 0 ? (
              <Line
                data={loanTrend}
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
                No loan data available for selected period
              </p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-md shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Loan Status Distribution
          </h3>
          <div className="w-full h-64">
            {loanStatuses.labels && loanStatuses.labels.length > 0 ? (
              <Pie
                data={loanStatuses}
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
                No loan data available for selected period
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-md shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Loan Types Distribution
          </h3>
          <div className="w-full h-64">
            {loanTypes.labels && loanTypes.labels.length > 0 ? (
              <Bar
                data={loanTypes}
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
                No loan data available
              </p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-md shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Loan Amounts Summary
          </h3>
          <div className="w-full h-64">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">
                  Total Amount:{" "}
                  {metrics.totalLoanAmount.toLocaleString("en-NG", {
                    style: "currency",
                    currency: "NGN",
                  })}
                </p>
                <p className="text-gray-500">
                  Repaid:{" "}
                  {metrics.totalRepaid.toLocaleString("en-NG", {
                    style: "currency",
                    currency: "NGN",
                  })}
                </p>
                <p className="text-gray-500">
                  Outstanding:{" "}
                  {metrics.totalOutstanding.toLocaleString("en-NG", {
                    style: "currency",
                    currency: "NGN",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Loans Table */}
      <div className="bg-white rounded-md shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Recent Loan Applications
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLoans.map((loan, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(loan.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loan.fileNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loan.amount.toLocaleString("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loan.loanTypeCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        loan.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : loan.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {loan.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentLoans.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-4">
                    No recent loan applications found
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

export default LoanMetrics;
