"use client";

import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "@/Services/authService";
import { useRouter } from "next/navigation";
import useAccountService from "@/Services/accountService";
import roleService from "@/Services/roleService";
import { FaPlus } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import Modal from "../components/Modal";
import AddAccount from "./AddAccount";
import branchService from "@/Services/branchService";

const ITEMS_PER_PAGE = 4;

const Accounts = () => {
  const { user } = useAuth();
  const [addModalOpen, setAddModalOpen] = useState(false);

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

  const [accountTypes, setAccountTypes] = useState([]);
  const [entityTypes, setEntityTypes] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [accountRes, entityRes, branchRes] = await Promise.all([
          useAccountService().getAllAccountTypes(),
          useAccountService().getAllAccountEntityTypes(),
          branchService.getAllBranches(),
        ]);

        setAccountTypes(accountRes?.data || []);
        setEntityTypes(entityRes?.data || []);
        setBranches(branchRes?.data || []);
      } catch (err) {
        console.error("Failed to fetch metadata:", err);
      }
    };

    fetchMetadata();
  }, []);

  const getAccountTypeName = (code) =>
    accountTypes.find((type) => type.accountTypeCode === code)?.name || code;

  const getEntityTypeName = (code) =>
    entityTypes.find((type) => type.entityTypeCode === code)?.name || code;

  const getBranchName = (code) =>
    branches.find((branch) => branch.branch_id === code)?.name || code;

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    const accountService = useAccountService(); // ✅ important

    try {
      const response = await accountService.getAllAccounts(); // ✅ correct usage
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
      const results = Accounts.filter((Account) =>
        Object.values(Account).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseFilter)
        )
      );
      setfilteredAccounts(results);
      setCurrentPage(1); // reset to first page on search
    };
    handleFilter();
  }, [Accounts, filterText]);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClients = filteredAccounts.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE);

  const hasPrivilege = (privilegeName) => {
    return !loadingPrivileges && rolePrivileges.includes(privilegeName);
  };

  if (loading || loadingPrivileges) {
    return (
      <Layout>
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="w-12 h-12 border-4 border-[#333] border-t-[#3D873B] rounded-full animate-spin"></div>
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
              onClick={() => setAddModalOpen(true)}
              id="add-account-icon"
              className="w-7 h-7 rounded-full cursor-pointer hover:bg-gray-100 p-1"
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
        <div className="mt-4 mb-5">
          <input
            type="text"
            placeholder="Search Accounts..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="placeholder:text-sm border p-2 w-full rounded-md border-gray-300 outline-none shadow-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto divide-y divide-gray-200 shadow-lg rounded-md">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="text-left py-3 px-4">S/N</th>
                <th className="text-left py-3 px-4">Account Code</th>
                <th className="text-left py-3 px-4">Account Type</th>
                <th className="text-left py-3 px-4">Entity Type</th>
                <th className="text-left py-3 px-4">Branch</th>
                <th className="text-left py-3 px-4">Account Balance</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {paginatedClients.map((account, index) => (
                <tr key={account.accountCode} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{startIdx + index + 1}</td>
                  <td className="py-3 px-4">{account.accountCode}</td>
                  <td className="py-3 px-4">
                    {getAccountTypeName(account.accountTypeCode)}
                  </td>
                  <td className="py-3 px-4">
                    {getEntityTypeName(account.entityTypeCode)}
                  </td>
                  <td className="py-3 px-4">
                    {getBranchName(account.branchCode)}
                  </td>

                  <td className="py-3 px-4">{account.balance}</td>
                  <td className="py-3 px-4">
                    {account.isActive ? (
                      <p className="text-green-500 font-bold rounded-md bg-green-50 text-center p-1">
                        Active
                      </p>
                    ) : (
                      <p className="text-red-500 font-bold rounded-md bg-red-50 text-center p-1">
                        InActive
                      </p>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedClients.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No Accounts available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={"Add Account"}
        description="Fill in the form to add an account."
      >
        <AddAccount
          onClose={() => setAddModalOpen(false)}
          onAdd={fetchAccounts}
        />
      </Modal>
    </Layout>
  );
};

export default Accounts;
