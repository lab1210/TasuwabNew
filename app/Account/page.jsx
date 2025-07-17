"use client";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "@/Services/authService";
import { useRouter } from "next/navigation";
import roleService from "@/Services/roleService";
import {
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaPlus,
  FaWindowClose,
  FaFilter,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import branchService from "@/Services/branchService";
import useAccountService from "@/Services/accountService";
import formatDate from "@/app/components/formatdate";
import depositTypeService from "@/Services/depositTypeService";
import entityTypeService from "@/Services/entityTypeService";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 4;

const Accounts = () => {
  const { user } = useAuth();
  const [expandedRows, setExpandedRows] = useState([]);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [branches, setBranches] = useState([]);
  const [depositType, setDepositType] = useState([]);
  const [entityType, setEntityType] = useState([]);
  const [Accounts, setAccounts] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filteredAccounts, setfilteredAccounts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccount, setselectedAccount] = useState(null);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    closeDate: new Date(),
    closedByStaffCode: user?.StaffCode || "",
  });
  // New state for filters
  const [filters, setFilters] = useState({
    depositType: "",
    entityType: "",
    status: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        closedByStaffCode: user.StaffCode || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchService.getAllBranches();
        console.log("Fetched branches:", response);
        setBranches(response || []);
      } catch (err) {
        console.error("Failed to fetch branches", err);
        setBranches([]);
      }
    };
    const fetchDepositType = async () => {
      try {
        const response = await depositTypeService.getallDepositTypes();
        setDepositType(response || []);
      } catch (err) {
        setDepositType([]);
      }
    };
    const fetchEntityType = async () => {
      try {
        const response = await entityTypeService.getAllEntityTypes();
        setEntityType(response || []);
      } catch (err) {
        setEntityType([]);
      }
    };
    fetchEntityType();
    fetchDepositType();
    fetchBranches();
  }, []);

  const getBranchName = (branchCode) => {
    const branch = branches.find((b) => b.branch_id === branchCode);
    return branch ? branch.name : branchCode;
  };

  const getdepositname = (depCode) => {
    const deptype = depositType.find((b) => b.code === depCode);
    return deptype ? deptype.name : depCode;
  };

  const getEntityName = (depCode) => {
    const entity = entityType.find((b) => b.code === depCode);
    return entity ? entity.name : depCode;
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await useAccountService.getAllAccounts();
      const data = Array.isArray(response?.data) ? response.data : response;
      if (Array.isArray(data)) {
        setAccounts(data);
      } else {
        setAccounts([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch account");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
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

      let results = Accounts.filter((account) => {
        // Text search across all fields
        const matchesText = Object.values(account).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseFilter)
        );

        // Filter by selected criteria

        const matchesDepositType =
          !filters.depositType ||
          account.depositTypeCode === filters.depositType;
        const matchesEntityType =
          !filters.entityType || account.entityTypeCode === filters.entityType;
        const matchesStatus =
          filters.status === "" ||
          (filters.status === "active" && account.isActive) ||
          (filters.status === "closed" && !account.isActive);

        return (
          matchesText &&
          matchesDepositType &&
          matchesEntityType &&
          matchesStatus
        );
      });

      setfilteredAccounts(results);
      setCurrentPage(1); // reset to first page on filter change
    };

    handleFilter();
  }, [Accounts, filterText, filters]);

  const handleCloseAccount = async (accountCode) => {
    try {
      setIsProcessing(true);

      let dateOfClosure = null;
      if (formData.closeDate) {
        const date = new Date(formData.closeDate);
        dateOfClosure = date.toISOString();
      }

      const formToSend = {
        closeDate: dateOfClosure,
        closedByStaffCode: user?.StaffCode || formData.closedByStaffCode,
      };

      const response = await useAccountService.closeAccount(
        accountCode,
        formToSend
      );

      toast.success(`Account ${accountCode} closed successfully`);
      fetchAccounts();
      setShowCloseModal(false);
    } catch (error) {
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        toast.error(errorMessages.join("\n"));
      } else {
        toast.error(error.message || "Failed to close account");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      depositType: "",
      entityType: "",
      status: "",
    });
    setFilterText("");
  };

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClients = filteredAccounts.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE);

  const hasPrivilege = (privilegeName) => {
    return !loadingPrivileges && rolePrivileges.includes(privilegeName);
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  if (loading || loadingPrivileges || branches.length === 0) {
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
        <div className="flex items-center gap-2 ">
          <p className="font-bold">{error}</p>
          <button
            className="bg-red-500 cursor-pointer shadow-md text-white p-1 rounded-lg "
            onClick={fetchAccounts}
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
        <div className="flex justify-between items-start">
          <div>
            <p className="text-4xl font-extrabold">Accounts</p>
            <p className="text-sm text-gray-600">
              View all of your client account information.
            </p>
          </div>
          {hasPrivilege("CreateAccount") && (
            <div
              id="add-account-icon"
              className="w-7 h-7 rounded-full cursor-pointer hover:bg-gray-100 p-1"
              onClick={() => router.push("/Account/AddAccount")}
            >
              <FaPlus className="text-[#3D873B] w-full h-full" />
            </div>
          )}
          <Tooltip
            anchorId="add-account-icon"
            content="Add Account"
            place="top"
            style={{
              backgroundColor: "#3D873B",
              fontSize: "12px",
              borderRadius: "6px",
            }}
          />
        </div>

        {/* Search and Filter Section */}
        <div className="mt-4 mb-5 space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search Accounts..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Deposit Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deposit Type
                  </label>
                  <select
                    value={filters.depositType}
                    onChange={(e) =>
                      handleFilterChange("depositType", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Types</option>
                    {depositType.map((type) => (
                      <option key={type.code} value={type.code}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Entity Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entity Type
                  </label>
                  <select
                    value={filters.entityType}
                    onChange={(e) =>
                      handleFilterChange("entityType", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Entities</option>
                    {entityType.map((entity) => (
                      <option key={entity.code} value={entity.code}>
                        {entity.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
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
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
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

        {/* Accounts Table */}
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Account
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Branch
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Balance
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  ></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedClients.map((account, index) => (
                  <React.Fragment key={account.accountCode}>
                    <tr
                      onClick={() => toggleRow(account.accountCode)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {account.accountName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {account.accountCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getBranchName(account.branch_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{getdepositname(account.depositTypeCode)}</div>
                        <div className="text-gray-400">
                          {getEntityName(account.entityTypeCode)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {account.balance.toLocaleString("en-NG", {
                          style: "currency",
                          currency: "NGN",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            account.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {account.isActive ? "Active" : "Closed"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2 items-center">
                        {account.isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/Account/EditAccount/${account.accountCode}`
                              );
                            }}
                            className="flex items-center  px-3 py-1 text-sm text-[#333]  hover:text-[#333]/80 cursor-pointer transition-colors"
                            style={
                              !hasPrivilege("UpdateAccount")
                                ? { cursor: "not-allowed" }
                                : null
                            }
                            title={
                              !hasPrivilege("UpdateAccount")
                                ? "Not Authorized"
                                : ""
                            }
                            disabled={!hasPrivilege("UpdateAccount")}
                          >
                            <FaEdit size={20} />
                          </button>
                        )}
                        {account.isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setselectedAccount(account);
                              setShowCloseModal(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1 cursor-pointer text-red-600 transition-colors"
                            style={
                              !hasPrivilege("CloseAccount")
                                ? { cursor: "not-allowed" }
                                : null
                            }
                            title={
                              !hasPrivilege("CloseAccount")
                                ? "Not Authorized to close account"
                                : "Close Account"
                            }
                            disabled={
                              !account.isActive || !hasPrivilege("CloseAccount")
                            }
                          >
                            <span>
                              <FaWindowClose size={20} />
                            </span>
                          </button>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(account.accountCode);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title="More Details"
                        >
                          {expandedRows.includes(account.accountCode) ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.includes(account.accountCode) && (
                      <tr className="bg-gray-50 ">
                        <td colSpan="6" className="px-6 py-4">
                          <div className="grid grid-cols-3  gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">
                                Owners:
                              </p>
                              <p className="text-gray-500">{account.owners}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Last Interest Date:
                              </p>
                              <p className="text-gray-500">
                                {formatDate(account.lastInterestDate)}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Next Interest Date:
                              </p>
                              <p className="text-gray-500">
                                {formatDate(account.nextInterestDate)}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Open Date:
                              </p>
                              <p className="text-gray-500">
                                {formatDate(account.openDate)}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Close Date:
                              </p>
                              <p className="text-gray-500">
                                {formatDate(account.closeDate)}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Last Updated:
                              </p>
                              <p className="text-gray-500">
                                {formatDate(account.updatedAt)}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Created By:
                              </p>
                              <p className="text-gray-500">
                                {account.performedBy}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {paginatedClients.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No Accounts available.
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
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
        {showCloseModal && selectedAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">
                Confirm Account Closure
              </h3>

              <div className="mb-4">
                <label
                  htmlFor="closureDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Closure Date
                </label>
                <input
                  type="date"
                  id="closureDate"
                  value={formData.closeDate}
                  onChange={(e) =>
                    setFormData({ ...formData, closeDate: e.target.value })
                  }
                  className="w-full p-2 border focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all border-gray-300 rounded-md "
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="closedByStaffCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Closed By (Staff Code)
                </label>
                <input
                  type="text"
                  id="closedByStaffCode"
                  readOnly
                  value={formData.closedByStaffCode}
                  className="w-full p-2 border focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all border-gray-300 rounded-md bg-[#3D873B]/20"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleCloseAccount(selectedAccount.accountCode)
                  }
                  className={`px-4 py-2 text-white rounded-md flex items-center gap-2 ${
                    isProcessing ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={isProcessing}
                >
                  {isProcessing && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  Confirm Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Accounts;
