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
import supplierService from "@/Services/supplierService";
import formatDate from "@/app/components/formatdate";
import Layout from "@/app/components/Layout";
import toast from "react-hot-toast";
import supplierTransactionService from "@/Services/supplierTransactionService";

const SupplierPaymentHistoryPage = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierDetails, setSupplierDetails] = useState(null);

  // Fetch suppliers on component mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const suppliersData =
          await supplierTransactionService.getSupplierTransactions();
        setSuppliers(suppliersData);
      } catch (err) {
        toast.error("Failed to load suppliers");
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Fetch payment history when supplier is selected
  useEffect(() => {
    if (!selectedSupplier) return;

    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);

        // Find the selected supplier details
        const details = suppliers.find((s) => s.fileNo === selectedSupplier);
        setSupplierDetails(details);

        // Fetch payment history for the supplier
        const history =
          await supplierTransactionService.getSupplierPaymentHistory(
            selectedSupplier
          );

        // Sort history by date in descending order (newest first)
        const sortedHistory = [...history].sort(
          (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
        );

        setPaymentHistory(sortedHistory);
        setFilteredHistory(sortedHistory);
      } catch (err) {
        toast.error("Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [selectedSupplier, suppliers]);

  // Apply filters when date range or search term changes
  useEffect(() => {
    let filtered = [...paymentHistory];

    // Apply date filter
    if (dateRange.startDate || dateRange.endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.paymentDate);
        const start = dateRange.startDate
          ? new Date(dateRange.startDate)
          : null;
        const end = dateRange.endDate ? new Date(dateRange.endDate) : null;

        if (start && itemDate < start) return false;
        if (end && itemDate > end) return false;
        return true;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.referenceNumber &&
            item.referenceNumber.toLowerCase().includes(term)) ||
          (item.paymentMethod &&
            item.paymentMethod.toLowerCase().includes(term)) ||
          (item.status && item.status.toLowerCase().includes(term)) ||
          item.amount.toString().includes(term)
      );
    }

    setFilteredHistory(filtered);
  }, [dateRange, searchTerm, paymentHistory]);

  const toggleRow = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      approved: "bg-blue-100 text-blue-800",
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
        <h1 className="text-2xl font-bold mb-6">Supplier Payment History</h1>

        {/* Supplier Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Supplier
          </label>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={loading}
          >
            <option value="">Select a supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.fileNo} value={supplier.fileNo}>
                {supplier.fileNo} - {supplier.supplierName}
              </option>
            ))}
          </select>
        </div>

        {/* Supplier Summary */}
        {supplierDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700">
                Supplier Name
              </h3>
              <p className="text-xl font-bold text-[#3D873B]">
                {supplierDetails.supplierName}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700">Contact</h3>
              <p className="text-xl font-bold text-gray-800">
                {supplierDetails.contactPhone || "N/A"}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700">Email</h3>
              <p className="text-xl font-bold text-gray-800">
                {supplierDetails.contactEmail || "N/A"}
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
              placeholder="Search by reference or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Calendar className="w-5 h-5" />
              {dateRange.startDate || dateRange.endDate ? (
                <span>
                  {dateRange.startDate || "Start"} to{" "}
                  {dateRange.endDate || "End"}
                </span>
              ) : (
                <span>Filter by date</span>
              )}
              {showDatePicker ? <ChevronUp /> : <ChevronDown />}
            </button>

            {showDatePicker && (
              <div className="absolute z-10 mt-2 right-0 bg-white p-4 border rounded-md shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) =>
                        setDateRange({
                          ...dateRange,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
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
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3D873B]"></div>
          </div>
        )}

        {/* Payment History Table */}
        {selectedSupplier && !loading && (
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
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((payment, index) => (
                      <React.Fragment key={index}>
                        <tr className="hover:bg-gray-50 cursor-pointer">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(payment.paymentDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.referenceNumber || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#3D873B]">
                            ₦{payment.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.paymentMethod || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
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
                            <td colSpan="6" className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Transaction ID:
                                  </p>
                                  <p className="text-gray-500">
                                    {payment.transactionId || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Processed By:
                                  </p>
                                  <p className="text-gray-500">
                                    {payment.processedBy || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Notes:
                                  </p>
                                  <p className="text-gray-500">
                                    {payment.notes || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    File No:
                                  </p>
                                  <p className="text-gray-500">
                                    {selectedSupplier}
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
                        No payment history found for the selected supplier
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

export default SupplierPaymentHistoryPage;
