"use client";
import React, { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaFilter,
  FaChevronLeft,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import loanService from "@/Services/loanService";
import roleService from "@/Services/roleService";
import formatDate from "@/app/components/formatdate";
import { useRouter } from "next/navigation";
import LoanTypeService from "@/Services/loanTypeService";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import branchService from "@/Services/branchService";
import supplierService from "@/Services/supplierService";

const ITEMS_PER_PAGE = 10;

const LoanRequestsPage = () => {
  const { user } = useAuth();
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
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [supplierNames, setSupplierNames] = useState({});
  const [branchNames, setBranchNames] = useState({});
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  // Helper function to render approval status
  const getApprovalStatusText = (status) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Approved";
      case 2:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  useEffect(() => {
    const fetchNames = async () => {
      const newSupplierNames = {};
      const newBranchNames = {};

      // Get unique supplier and branch IDs from loans
      const supplierIds = [
        ...new Set(loans.map((loan) => loan.supplierId).filter(Boolean)),
      ];
      const branchIds = [
        ...new Set(loans.map((loan) => loan.branchCode).filter(Boolean)),
      ];

      // Fetch all suppliers
      await Promise.all(
        supplierIds.map(async (id) => {
          try {
            const supplier = await supplierService.getSupplierbyId(id);
            if (supplier) newSupplierNames[id] = supplier.name;
          } catch (error) {
            console.error(`Error fetching supplier ${id}:`, error);
          }
        })
      );

      // Fetch all branches
      await Promise.all(
        branchIds.map(async (id) => {
          try {
            const branch = await branchService.getBranchById(id);
            if (branch) newBranchNames[id] = branch.name;
          } catch (error) {
            console.error(`Error fetching branch ${id}:`, error);
          }
        })
      );

      setSupplierNames(newSupplierNames);
      setBranchNames(newBranchNames);
    };

    if (loans.length > 0) {
      fetchNames();
    }
  }, [loans]);

  // Render document links if they exist
  const renderDocumentLink = (doc, label) => {
    if (!doc) return null;
    return (
      <div className="mb-2">
        <p className="text-sm text-gray-500">{label}</p>
        <a
          href={doc}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#3D873B] hover:underline text-sm"
        >
          View Document
        </a>
      </div>
    );
  };

  const renderStatusBadge = (status) => {
    let badgeClass = "";
    switch (status) {
      case "Approved":
        badgeClass = "bg-green-100 text-green-800";
        break;
      case "Rejected":
        badgeClass = "bg-red-100 text-red-800";
        break;
      case "Pending":
        badgeClass = "bg-yellow-100 text-yellow-800";
        break;
      default:
        badgeClass = "bg-gray-100 text-gray-800";
    }

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}
      >
        {status}
      </span>
    );
  };

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
          return new Date(b.createdAt) - new Date(a.createdAt);
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
        const matchesText = Object.values(loan).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseFilter)
        );
        const matchesType =
          !filters.loanType || loan.loanTypeCode === filters.loanType;
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

  const handleViewDetails = (loan) => {
    setSelectedLoan(loan);
    setShowDetails(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setTimeout(() => {
      setSelectedLoan(null);
    }, 300);
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
        <AnimatePresence mode="wait">
          {showDetails && selectedLoan ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mt-6">
                <button
                  onClick={handleCloseDetails}
                  className="flex items-center text-[#3D873B] hover:text-[#2a5d28] mb-4"
                >
                  <FaChevronLeft className="mr-1" />
                  Back to Loans
                </button>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-2xl font-bold">Loan Details</h1>
                      <p className="text-sm text-gray-600">
                        File Number: {selectedLoan.fileNo} | Created:{" "}
                        {formatDate(selectedLoan.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Status</p>
                        {renderStatusBadge(selectedLoan.status)}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-bold">
                          {formatCurrency(selectedLoan.initialAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Basic Information */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">
                          Basic Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Account Code
                            </p>
                            <p className="font-medium">
                              {selectedLoan.accountCode}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Loan Type</p>
                            <p className="font-medium">
                              {selectedLoan.loanTypeCode}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Business Name
                            </p>
                            <p className="font-medium">
                              {selectedLoan.businessName || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Ownership Type
                            </p>
                            <p className="font-medium">
                              {selectedLoan.businessOwnershipType || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Number of Staff
                            </p>
                            <p className="font-medium">
                              {selectedLoan.numberOfStaff || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Business Start Date
                            </p>
                            <p className="font-medium">
                              {selectedLoan.businessStartDate
                                ? new Date(
                                    selectedLoan.businessStartDate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Purpose</p>
                            <p className="font-medium">
                              {selectedLoan.purpose || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Branch Code</p>
                            <p className="font-medium">
                              {branchNames[selectedLoan.branchCode] || "N/A"}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">
                              Other Information
                            </p>
                            <p className="font-medium">
                              {selectedLoan.otherInformation || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Financial Details */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">
                          Financial Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Loan Amount</p>
                            <p className="font-medium">
                              {formatCurrency(selectedLoan.initialAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Minimum Equity Contribution
                            </p>
                            <p className="font-medium">
                              {formatCurrency(
                                selectedLoan.minimumEquityContribution || 0
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Additional Client Contribution
                            </p>
                            <p className="font-medium">
                              {formatCurrency(
                                selectedLoan.additionalClientContribution || 0
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Cost of Asset Financed
                            </p>
                            <p className="font-medium">
                              {formatCurrency(
                                selectedLoan.costOfAssetFinanced || 0
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Payment Period (Months)
                            </p>
                            <p className="font-medium">
                              {selectedLoan.paymentPeriodDays || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              New Payment Period (Months)
                            </p>
                            <p className="font-medium">
                              {selectedLoan.newPaymentPeriodDays || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Average Inflation Rate
                            </p>
                            <p className="font-medium">
                              {selectedLoan.avgInflationRate + "%" || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Inflation Multiplier
                            </p>
                            <p className="font-medium">
                              {selectedLoan.inflationMultiplier || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Total Post Inflation Cost
                            </p>
                            <p className="font-medium">
                              {formatCurrency(
                                selectedLoan.postInflationCost || 0
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-500">
                              Market Risk Premium
                            </p>
                            <p className="font-medium">
                              {selectedLoan.marketRiskPremium + "%" || "N/A"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-500">
                              Operation Expenses
                            </p>
                            <p className="font-medium">
                              {selectedLoan.operationExpenses + "%" || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Total Real Operational Cost
                            </p>
                            <p className="font-medium">
                              {formatCurrency(
                                selectedLoan.totalRealOperationalCost || 0
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-500">
                              Required Profit Margin
                            </p>
                            <p className="font-medium">
                              {selectedLoan.profitMargin + "%" || 0}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-500">
                              Minimum Asset Financing
                            </p>
                            <p className="font-medium">
                              {formatCurrency(
                                selectedLoan.minimumAssetFinancing || 0
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Estimated Profit
                            </p>
                            <p className="font-medium">
                              {formatCurrency(
                                selectedLoan.estimatedProfit || 0
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Percent of Profit
                            </p>
                            <p className="font-medium">
                              {selectedLoan.percentOfProfit || 0}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Asset Information */}
                      {selectedLoan.assetName && (
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h2 className="text-lg font-semibold mb-4">
                            Asset Information
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Asset Name
                              </p>
                              <p className="font-medium">
                                {selectedLoan.assetName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Asset Description
                              </p>
                              <p className="font-medium">
                                {selectedLoan.assetDescription || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Asset Quantity
                              </p>
                              <p className="font-medium">
                                {selectedLoan.assetQuantity || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Price Per Unit
                              </p>
                              <p className="font-medium">
                                {formatCurrency(
                                  selectedLoan.assetPricePerUnit || 0
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Guarantor Information */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">
                          Guarantor Information
                        </h2>

                        {/* Guarantor 1 */}
                        {(selectedLoan.guarantor1Name ||
                          selectedLoan.guarantor1Phone) && (
                          <div className="mb-6">
                            <h3 className="font-medium mb-2">Guarantor 1</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">
                                  {selectedLoan.guarantor1Name || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  Occupation
                                </p>
                                <p className="font-medium">
                                  {selectedLoan.guarantor1Occupation || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">
                                  {selectedLoan.guarantor1Phone || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium">
                                  {selectedLoan.guarantor1Address || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  Relationship
                                </p>
                                <p className="font-medium">
                                  {selectedLoan.guarantor1Relationship || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                              {renderDocumentLink(
                                selectedLoan.guarantor1IdCard,
                                "ID Card"
                              )}
                              {renderDocumentLink(
                                selectedLoan.guarantor1Passport,
                                "Passport"
                              )}
                              {renderDocumentLink(
                                selectedLoan.guarantor1FormUpload,
                                "Form"
                              )}
                            </div>
                          </div>
                        )}

                        {/* Guarantor 2 */}
                        {(selectedLoan.guarantor2Name ||
                          selectedLoan.guarantor2Phone) && (
                          <div>
                            <h3 className="font-medium mb-2">Guarantor 2</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">
                                  {selectedLoan.guarantor2Name || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  Occupation
                                </p>
                                <p className="font-medium">
                                  {selectedLoan.guarantor2Occupation || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">
                                  {selectedLoan.guarantor2Phone || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium">
                                  {selectedLoan.guarantor2Address || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  Relationship
                                </p>
                                <p className="font-medium">
                                  {selectedLoan.guarantor2Relationship || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                              {renderDocumentLink(
                                selectedLoan.guarantor2IdCard,
                                "ID Card"
                              )}
                              {renderDocumentLink(
                                selectedLoan.guarantor2Passport,
                                "Passport"
                              )}
                              {renderDocumentLink(
                                selectedLoan.guarantor2FormUpload,
                                "Form"
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Sidebar Information */}
                    <div className="space-y-6">
                      {/* Approval Process */}
                      {selectedLoan.approvalRequest && (
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h2 className="text-lg font-semibold mb-4">
                            Approval Process
                          </h2>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Requested By
                              </p>
                              <p className="font-medium">
                                {selectedLoan.approvalRequest.requestedByName ||
                                  "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Request Date
                              </p>
                              <p className="font-medium">
                                {formatDate(
                                  selectedLoan.approvalRequest.requestDate
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Current Status
                              </p>
                              <p className="font-medium">
                                {getApprovalStatusText(
                                  selectedLoan.approvalRequest.status
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Notes</p>
                              <p className="font-medium">
                                {selectedLoan.approvalRequest.notes ||
                                  "No notes provided"}
                              </p>
                            </div>
                          </div>

                          {/* Approval History */}
                          {selectedLoan.approvalRequest.history?.length > 0 && (
                            <div className="mt-6">
                              <h3 className="font-medium mb-3">
                                Approval History
                              </h3>
                              <div className="space-y-3">
                                {selectedLoan.approvalRequest.history.map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="border-l-2 border-gray-300 pl-3 py-1"
                                    >
                                      <div className="flex justify-between">
                                        <span className="font-medium">
                                          {item.actionedByName}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                          {formatDate(item.actionDate)}
                                        </span>
                                      </div>
                                      <p className="text-sm">
                                        {item.comments || "No comments"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Status:{" "}
                                        {getApprovalStatusText(item.status)}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Documents */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">
                          Documents
                        </h2>
                        <div className="space-y-4">
                          {renderDocumentLink(
                            selectedLoan.statementOfAccountDoc,
                            "Statement of Account"
                          )}
                          {renderDocumentLink(
                            selectedLoan.idCardDoc,
                            "ID Card"
                          )}
                          {renderDocumentLink(
                            selectedLoan.passportDoc,
                            "Passport"
                          )}
                          {renderDocumentLink(
                            selectedLoan.loanInvoiceDoc,
                            "Loan Invoice"
                          )}
                          {renderDocumentLink(selectedLoan.formDoc, "Form")}
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">
                          Additional Information
                        </h2>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Performed By
                            </p>
                            <p className="font-medium">
                              {selectedLoan.performedBy || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Supplier</p>
                            <p className="font-medium">
                              {supplierNames[selectedLoan.supplierId] || "N/A"}
                              {selectedLoan.needsSupplierRequest &&
                                "(Request Needed)"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Employer</p>
                            <p className="font-medium">
                              {selectedLoan.employerId || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Last Updated
                            </p>
                            <p className="font-medium">
                              {formatDate(selectedLoan.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-4xl font-extrabold">Loan Requests</p>
                  <p className="text-sm text-gray-600">
                    View all loan applications.
                  </p>
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

              <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File Number
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedLoans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {loan.fileNo}
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
                            <div className="text-sm text-gray-500">
                              {loan.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(loan.initialAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {loan.loanTypeCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(loan.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDetails(loan)}
                                className="text-[#3D873B] hover:text-[#2a5d28] hover:underline"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
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

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default LoanRequestsPage;
