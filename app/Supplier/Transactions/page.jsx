"use client";
import React, { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaFilter,
  FaChevronLeft,
  FaSearch,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import supplierTransactionService from "@/Services/supplierTransactionService";
import roleService from "@/Services/roleService";
import formatDate from "@/app/components/formatdate";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import bankService from "@/Services/bankService";
import supplierService from "@/Services/supplierService";
import toast from "react-hot-toast";
import categoryService from "@/Services/categoryService";
import productService from "@/Services/productService";

const ITEMS_PER_PAGE = 10;

const SupplierTransactionsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    supplier: "",
    startDate: "",
    endDate: "",
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [banks, setBanks] = useState({});
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierName,setSupplierName]=useState({})
  const [categoryName,setCategoryName]=useState({})
  const [productName,setProductName]=useState({})

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
        const [transactionsResponse, suppliersResponse, banksResponse,categoryResponse,productResponse] =
          await Promise.all([
            supplierTransactionService.getSupplierTransactionsbyStatus(),
            supplierService.getSuppliers(),
            bankService.getBank(),
            categoryService.getCategories(),
            productService.getAllProducts()
          ]);

        setTransactions(transactionsResponse || []);
        setSuppliers(suppliersResponse || []);
        setCategories(categoryResponse || []);
        setProducts(productResponse || []);
        const supplierMap={}
        suppliersResponse.forEach(supplier=>{
          supplierMap[supplier.id]=supplier.name
        })
        setSupplierName(supplierMap)

        // Create a map of bank IDs to bank names
        const banksMap = {};
        banksResponse.forEach((bank) => {
          banksMap[bank.id] = bank.bankName;
        });
        setBanks(banksMap);

        const categoryMap = {};
        categoryResponse.forEach((category) => {
          categoryMap[category.id] = category.name;
        });
        setCategoryName(categoryMap);

        const productMap = {};
        productResponse.forEach((product) => {
          productMap[product.id] = product.name;
        });
        setProductName(productMap);

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.message || "Failed to load data");
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
      const results = transactions.filter((transaction) => {
        const matchesText = Object.values(transaction).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseFilter)
        );
        const matchesStatus =
          filters.status === "" ||
          transaction.status.toLowerCase() === filters.status.toLowerCase();
        const matchesSupplier =
          filters.supplier === "" ||
          transaction.supplierId === filters.supplier;

        return matchesText && matchesStatus && matchesSupplier;
      });

      setFilteredTransactions(results);
      setCurrentPage(1);
    };
    handleFilter();
  }, [transactions, filterText, filters]);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

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
      status: "",
      supplier: "",
      startDate: "",
      endDate: "",
    });
    setFilterText("");
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setTimeout(() => {
      setSelectedTransaction(null);
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
          {showDetails && selectedTransaction ? (
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
                  Back to Transactions
                </button>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-2xl font-bold">
                        Transaction Details
                      </h1>
                      <p className="text-sm text-gray-600">
                        Transaction ID: {selectedTransaction.transactionId} |
                        Date: {formatDate(selectedTransaction.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Status</p>
                        {renderStatusBadge(selectedTransaction.status)}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-bold">
                          {formatCurrency(selectedTransaction.amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1  gap-6">
                    {/* Left Column - Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Transaction Information */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">
                          Transaction Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Account Code
                            </p>
                            <p className="font-medium">
                              {selectedTransaction.accountCode}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Supplier</p>
                            <p className="font-medium">
                              {supplierName[selectedTransaction.supplierId]}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Product</p>
                            <p className="font-medium">
                              {productName[selectedTransaction.productId] || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Category</p>
                            <p className="font-medium">
                              {categoryName[selectedTransaction.categoryId] || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Amount</p>
                            <p className="font-medium">
                              {formatCurrency(selectedTransaction.amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">
                              {formatDate(selectedTransaction.date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Sending Bank
                            </p>
                            <p className="font-medium">
                              {banks[selectedTransaction.sendingBank] || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Performed By
                            </p>
                            <p className="font-medium">
                              {selectedTransaction.performedBy || "N/A"}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="font-medium">
                              {selectedTransaction.notes || "No notes provided"}
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
                  <p className="text-4xl font-extrabold">
                    Supplier Transactions
                  </p>
                  <p className="text-sm text-gray-600">
                    View all supplier transactions.
                  </p>
                </div>
                {hasPrivilege("ManageSupplierTransactions") && (
                  <div
                    onClick={() =>
                      router.push("/Supplier/Transactions/Pay-Supplier")
                    }
                    id="add-transaction-icon"
                    className="w-7 h-7 rounded-full cursor-pointer hover:bg-gray-100 p-1"
                  >
                    <FaPlus className="text-[#3D873B] w-full h-full" />
                  </div>
                )}
                <Tooltip
                  anchorId="add-transaction-icon"
                  content="New Transaction"
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
                  <div className="relative flex-grow">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      className="placeholder:text-sm border p-2 pl-10 w-full rounded-md border-gray-300 outline-none shadow-sm"
                    />
                  </div>
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
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier
                        </label>
                        <select
                          value={filters.supplier}
                          onChange={(e) =>
                            handleFilterChange("supplier", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">All Suppliers</option>
                          {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </option>
                          ))}
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
                          Account Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedTransactions.map((transaction) => (
                        <tr key={transaction.transactionId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.accountCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {transaction.fileNo}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {supplierName[transaction.supplierId]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(transaction.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDetails(transaction)}
                                className="text-[#3D873B] hover:text-[#2a5d28] hover:underline"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedTransactions.length === 0 && (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No transactions available.
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

export default SupplierTransactionsPage;
