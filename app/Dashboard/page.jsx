"use client";
import React, { useState, useEffect } from "react";
import { CreditCard, Wallet, UserRoundCog } from "lucide-react";
import { FaBoxOpen, FaQuestionCircle, FaUserShield } from "react-icons/fa";
import { useAuth } from "@/Services/authService";
import roleService from "@/Services/roleService";
import Layout from "../components/Layout";
import LoanMetrics from "./LoanMetrics";
import BankingMetrics from "./BankMetrics";
import AdminMetrics from "./AdminMetrics";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [activeTab, setActiveTab] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const fetchPrivileges = async () => {
      if (user?.role) {
        try {
          const role = await roleService.getRoleById(user.role);
          const privileges = role?.privileges?.map((p) => p.name) || [];
          setRolePrivileges(privileges);
        } catch (error) {
          console.error("Error fetching privileges:", error);
        } finally {
          setLoadingPrivileges(false);
        }
      }
    };

    fetchPrivileges();
  }, [user?.role]);

  const hasPrivilege = (priv) =>
    !loadingPrivileges && rolePrivileges.includes(priv);

  const allTabs = [
    {
      key: "admin",
      label: "Administration",
      icon: <UserRoundCog className="inline-block w-5 h-5 mr-2" />,
      privilege:
        "ViewBranch" ||
        "ViewRoles" ||
        "ViewPositions" ||
        "ViewDepartments" ||
        "ViewStaffs",
    },
    {
      key: "loans",
      label: "Loan Management",
      icon: <CreditCard className="inline-block w-5 h-5 mr-2" />,
      privilege: "ViewLoanApplications",
    },
    {
      key: "banking",
      label: "Banking Operations",
      icon: <Wallet className="inline-block w-5 h-5 mr-2" />,
      privilege: "ViewAccount",
    },
    {
      key: "supplier",
      label: "Supplier",
      icon: <FaBoxOpen className="inline-block w-5 h-5 mr-2" />,
      privilege: "ViewSupplierPayments",
    },
  ];

  const availableTabs = allTabs.filter((tab) => hasPrivilege(tab.privilege));

  useEffect(() => {
    // Only start carousel if user has no privileges
    if (!loadingPrivileges && availableTabs.length === 0) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % 2); // Toggle between 0 and 1
      }, 5000); // Change message every 5 seconds
      return () => clearInterval(interval);
    }
  }, [loadingPrivileges, availableTabs.length]);

  useEffect(() => {
    if (!activeTab && availableTabs.length > 0) {
      setActiveTab(availableTabs[0].key);
    }
  }, [availableTabs]);

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

  // Messages to show in carousel when no privileges
  const noAccessMessages = [
    {
      icon: <FaUserShield className="text-4xl text-gray-400 mb-4" />,
      title: "Welcome to the Dashboard",
      content:
        "Hello! It looks like your account is being configured. Please contact your administrator to get the appropriate access permissions.",
    },
    {
      icon: <FaQuestionCircle className="text-4xl text-gray-400 mb-4" />,
      title: "Access Restricted",
      content:
        "You don't have permission to view any dashboard features. Please contact your administrator if you believe this is an error.",
    },
  ];

  // If no privileges after loading, show carousel of messages
  if (!loadingPrivileges && availableTabs.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="relative w-full max-w-md h-64">
            {/* Welcome Message */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${
                currentMessageIndex === 0 ? "opacity-100" : "opacity-0"
              }`}
            >
              {noAccessMessages[0].icon}
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {noAccessMessages[0].title}
              </h2>
              <p className="text-gray-500 text-center">
                {noAccessMessages[0].content}
              </p>
            </div>

            {/* Access Restricted Message */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${
                currentMessageIndex === 1 ? "opacity-100" : "opacity-0"
              }`}
            >
              {noAccessMessages[1].icon}
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {noAccessMessages[1].title}
              </h2>
              <p className="text-gray-500 text-center">
                {noAccessMessages[1].content}
              </p>
            </div>

            {/* Carousel indicators */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2">
              {noAccessMessages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMessageIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    currentMessageIndex === index
                      ? "bg-[#3D873B]"
                      : "bg-gray-300"
                  }`}
                  aria-label={`Go to message ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        {activeTab !== "admin" && availableTabs.length > 0 && (
          <div className="flex items-center justify-end mb-2">
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
        )}

        {availableTabs.length > 0 && (
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {availableTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? "border-[#3D873B] text-[#3D873B]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      {activeTab === "loans" && <LoanMetrics periodLabel={getPeriodLabel()} />}

      {activeTab === "banking" && (
        <BankingMetrics periodLabel={getPeriodLabel()} />
      )}

      {activeTab === "supplier" && (
        <div className="mb-8 text-center text-gray-700">
          <h3 className="text-lg font-semibold">Supplier Payment Metrics</h3>
          <p className="text-sm mt-2">Coming soon...</p>
        </div>
      )}

      {activeTab === "admin" && (
        <div className="mb-8 text-center text-gray-700">
          <AdminMetrics />
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
