"use client";
import React, { useState } from "react";
import {
  User,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Search,
  Filter,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import Layout from "../components/Layout";

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("loans");

  // Helper function to check if a date falls within the selected period
  const isDateInPeriod = (dateString, period) => {
    const date = new Date(dateString);
    const now = new Date();

    switch (period) {
      case "today":
        return date.toDateString() === now.toDateString();

      case "thisWeek":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return date >= startOfWeek && date <= now;

      case "thisMonth":
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );

      case "thisYear":
        return date.getFullYear() === now.getFullYear();

      default:
        return true;
    }
  };

  // Mock data for loans with more varied dates
  const dummyLoans = [
    {
      loanId: "L001",
      name: "John Doe",
      loanAmount: 10000000,
      purpose: "Personal",
      status: "Approved",
      date: "2024-05-30", // Today
    },
    {
      loanId: "L002",
      name: "Jane Smith",
      loanAmount: 20000000,
      purpose: "Business",
      status: "Pending",
      date: "2024-05-29", // This week
    },
    {
      loanId: "L003",
      name: "Mike Johnson",
      loanAmount: 6000000,
      purpose: "Auto",
      status: "Approved",
      date: "2024-05-15", // This month
    },
    {
      loanId: "L004",
      name: "Sarah Wilson",
      loanAmount: 30000000,
      purpose: "Home",
      status: "Active",
      date: "2024-03-25", // This year
    },
    {
      loanId: "L005",
      name: "David Brown",
      loanAmount: 12000000,
      purpose: "Personal",
      status: "Rejected",
      date: "2023-12-24", // Last year
    },
    {
      loanId: "L006",
      name: "Emma Davis",
      loanAmount: 8000000,
      purpose: "Education",
      status: "Approved",
      date: "2024-05-30", // Today
    },
  ];

  // Mock data for bank transactions with more varied dates
  const bankTransactions = [
    {
      id: "T001",
      accountHolder: "Alice Johnson",
      type: "Deposit",
      amount: 500000,
      balance: 2500000,
      date: "2024-05-30", // Today
      time: "10:30 AM",
    },
    {
      id: "T002",
      accountHolder: "Bob Wilson",
      type: "Withdrawal",
      amount: 150000,
      balance: 1850000,
      date: "2024-05-29", // This week
      time: "09:15 AM",
    },
    {
      id: "T003",
      accountHolder: "Carol Davis",
      type: "Deposit",
      amount: 750000,
      balance: 3200000,
      date: "2024-05-15", // This month
      time: "02:45 PM",
    },
    {
      id: "T004",
      accountHolder: "David Miller",
      type: "Withdrawal",
      amount: 300000,
      balance: 1200000,
      date: "2024-03-20", // This year
      time: "11:20 AM",
    },
    {
      id: "T005",
      accountHolder: "Emma Brown",
      type: "Deposit",
      amount: 1200000,
      balance: 4500000,
      date: "2023-12-28", // Last year
      time: "04:10 PM",
    },
    {
      id: "T006",
      accountHolder: "Frank White",
      type: "Deposit",
      amount: 200000,
      balance: 1500000,
      date: "2024-05-30", // Today
      time: "03:20 PM",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-[#3D873B] bg-green-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      case "Rejected":
        return "text-red-600 bg-red-100";
      case "Active":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTransactionColor = (type) => {
    return type === "Deposit"
      ? "text-[#3D873B] bg-green-100"
      : "text-red-600 bg-red-100";
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    change,
    changeType,
    color = "blue",
  }) => {
    const colorClasses = {
      blue: "bg-[#3D873B]",
      green: "bg-[#3D873B]",
      yellow: "bg-[#3D873B]",
      red: "bg-red-500",
      purple: "bg-[#3D873B]",
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {change && (
              <p
                className={`text-sm mt-2 ${
                  changeType === "positive" ? "text-[#3D873B]" : "text-red-600"
                }`}
              >
                {changeType === "positive" ? "↗" : "↘"} {change} from last
                period
              </p>
            )}
          </div>
          <div className={`${colorClasses[color]} p-4 rounded-full`}>
            <Icon className="text-white text-xl" />
          </div>
        </div>
      </div>
    );
  };

  // Filter data based on active tab, search, status, and date period
  const currentData = activeTab === "loans" ? dummyLoans : bankTransactions;
  const filteredData = currentData.filter((item) => {
    const matchesSearch =
      activeTab === "loans"
        ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.loanId.toLowerCase().includes(searchTerm.toLowerCase())
        : item.accountHolder.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (activeTab === "loans"
        ? item.status.toLowerCase() === filterStatus.toLowerCase()
        : item.type.toLowerCase() === filterStatus.toLowerCase());

    const matchesDatePeriod = isDateInPeriod(item.date, selectedPeriod);

    return matchesSearch && matchesStatus && matchesDatePeriod;
  });

  // Calculate dynamic metrics based on filtered data
  const getMetrics = () => {
    const filteredCurrentData = currentData.filter((item) =>
      isDateInPeriod(item.date, selectedPeriod)
    );

    if (activeTab === "loans") {
      const totalLoans = filteredCurrentData.length;
      const approvedLoans = filteredCurrentData.filter(
        (loan) => loan.status === "Approved"
      ).length;
      const pendingLoans = filteredCurrentData.filter(
        (loan) => loan.status === "Pending"
      ).length;
      const totalAmount = filteredCurrentData.reduce(
        (sum, loan) => sum + loan.loanAmount,
        0
      );

      return {
        totalLoans,
        approvedLoans,
        pendingLoans,
        totalAmount: `₦${(totalAmount / 1000000).toFixed(0)}M`,
      };
    } else {
      const totalTransactions = filteredCurrentData.length;
      const deposits = filteredCurrentData.filter((t) => t.type === "Deposit");
      const withdrawals = filteredCurrentData.filter(
        (t) => t.type === "Withdrawal"
      );
      const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);
      const totalWithdrawals = withdrawals.reduce(
        (sum, t) => sum + t.amount,
        0
      );

      return {
        totalTransactions,
        totalDeposits: `₦${(totalDeposits / 1000000).toFixed(0)}M`,
        totalWithdrawals: `₦${(totalWithdrawals / 1000000).toFixed(0)}M`,
        netFlow: `₦${((totalDeposits - totalWithdrawals) / 1000000).toFixed(
          0
        )}M`,
      };
    }
  };

  const metrics = getMetrics();

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "today":
        return "Today";
      case "thisWeek":
        return "This Week";
      case "thisMonth":
        return "This Month";
      case "thisYear":
        return "This Year";
      default:
        return "This Month";
    }
  };

  return (
    <Layout>
      {/* Header with Date Filter */}
      <div className="mb-8">
        <div className="flex items-center justify-end mb-1">
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D873B] bg-white"
            >
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("loans")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "loans"
                  ? "border-[#3D873B] text-[#3D873B]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <CreditCard className="inline-block w-5 h-5 mr-2" />
              Loan Management
            </button>
            <button
              onClick={() => setActiveTab("banking")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "banking"
                  ? "border-[#3D873B] text-[#3D873B]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Wallet className="inline-block w-5 h-5 mr-2" />
              Banking Operations
            </button>
          </nav>
        </div>
      </div>

      {/* Dynamic Metrics based on active tab and date filter */}
      {activeTab === "loans" ? (
        <>
          {/* Loan Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 leading-0 lg:grid-cols-4 text-xs gap-6 mb-8">
            <StatCard
              icon={CreditCard}
              title={`Total Loans (${getPeriodLabel()})`}
              value={metrics.totalLoans.toString()}
              change="12%"
              changeType="positive"
              color="blue"
            />
            <StatCard
              icon={CheckCircle}
              title={`Approved (${getPeriodLabel()})`}
              value={metrics.approvedLoans.toString()}
              change="8%"
              changeType="positive"
              color="green"
            />
            <StatCard
              icon={DollarSign}
              title={`Total Amount (${getPeriodLabel()})`}
              value={metrics.totalAmount}
              change="15%"
              changeType="positive"
              color="purple"
            />
            <StatCard
              icon={Clock}
              title={`Pending (${getPeriodLabel()})`}
              value={metrics.pendingLoans.toString()}
              change="5%"
              changeType="negative"
              color="yellow"
            />
          </div>
        </>
      ) : (
        <>
          {/* Banking Metrics */}
          <div className="grid grid-cols-1 text-xs md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Wallet}
              title={`Transactions (${getPeriodLabel()})`}
              value={metrics.totalTransactions.toString()}
              change="8%"
              changeType="positive"
              color="blue"
            />
            <StatCard
              icon={ArrowDownLeft}
              title={`Deposits (${getPeriodLabel()})`}
              value={metrics.totalDeposits}
              change="12%"
              changeType="positive"
              color="green"
            />
            <StatCard
              icon={ArrowUpRight}
              title={`Withdrawals (${getPeriodLabel()})`}
              value={metrics.totalWithdrawals}
              change="5%"
              changeType="positive"
              color="purple"
            />
            <StatCard
              icon={DollarSign}
              title={`Net Flow (${getPeriodLabel()})`}
              value={metrics.netFlow}
              change="18%"
              changeType="positive"
              color="yellow"
            />
          </div>
        </>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === "loans"
                ? `Loan Applications (${getPeriodLabel()})`
                : `Banking Transactions (${getPeriodLabel()})`}
            </h3>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={
                    activeTab === "loans"
                      ? "Search loans..."
                      : "Search transactions..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D873B]"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D873B]"
              >
                {activeTab === "loans" ? (
                  <>
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="active">Active</option>
                  </>
                ) : (
                  <>
                    <option value="all">All Types</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                  </>
                )}
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Showing {filteredData.length}{" "}
            {activeTab === "loans" ? "loans" : "transactions"} for{" "}
            {getPeriodLabel().toLowerCase()}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === "loans" ? (
                  <>
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
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Holder
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "loans" ? 6 : 7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No {activeTab === "loans" ? "loans" : "transactions"} found
                    for {getPeriodLabel().toLowerCase()}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={activeTab === "loans" ? item.loanId : item.id}
                    className="hover:bg-gray-50"
                  >
                    {activeTab === "loans" ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.loanId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₦{item.loanAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.purpose}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.date}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.accountHolder}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionColor(
                              item.type
                            )}`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₦{item.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₦{item.balance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.time}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
