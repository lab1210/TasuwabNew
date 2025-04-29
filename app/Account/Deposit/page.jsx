"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/Services/authService";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import AddDeposit from "./AddDeposit/page";
import Layout from "@/app/components/Layout";
import LargeModal from "@/app/components/LargeModal";
import Modal from "@/app/components/Modal";

const ITEMS_PER_PAGE = 4;

const DepositList = () => {
  const { user } = useAuth();
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [deposits, setDeposits] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Dummy branches data
        setBranches([
          { branch_id: "1", name: "Lagos Branch" },
          { branch_id: "2", name: "Abuja Branch" },
          { branch_id: "3", name: "Port Harcourt Branch" },
        ]);
      } catch (err) {
        console.error("Failed to fetch metadata:", err);
      }
    };

    fetchMetadata();
  }, []);

  const getBranchName = (code) =>
    branches.find((branch) => branch.branch_id === code)?.name || code;

  useEffect(() => {
    // Use dummy data for deposits
    const dummyDeposits = [
      {
        depositId: "D001",
        amount: 1000,
        depositType: "Savings",
        branchId: "1",
        date: "2025-04-20T10:00:00Z",
        status: "Active",
      },
      {
        depositId: "D002",
        amount: 1500,
        depositType: "Current",
        branchId: "2",
        date: "2025-04-21T10:00:00Z",
        status: "Inactive",
      },
      {
        depositId: "D003",
        amount: 2000,
        depositType: "Savings",
        branchId: "3",
        date: "2025-04-22T10:00:00Z",
        status: "Active",
      },
      {
        depositId: "D004",
        amount: 500,
        depositType: "Current",
        branchId: "1",
        date: "2025-04-23T10:00:00Z",
        status: "Inactive",
      },
    ];

    setDeposits(dummyDeposits);
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchPrivileges = async () => {
      if (user?.role) {
        setLoadingPrivileges(true);
        try {
          // Dummy role privileges (replace with real role fetching logic when available)
          setRolePrivileges(["CreateDeposit", "ViewDeposit"]);
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
      const results = deposits.filter((deposit) =>
        Object.values(deposit).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseFilter)
        )
      );
      setFilteredDeposits(results);
      setCurrentPage(1); // reset to first page on search
    };
    handleFilter();
  }, [deposits, filterText]);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDeposits = filteredDeposits.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredDeposits.length / ITEMS_PER_PAGE);

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
            onClick={() => setError(null)}
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
            <p className="text-4xl font-extrabold">Deposits</p>
            <p className="text-sm text-gray-600">
              View all of your deposit transactions.
            </p>
          </div>
          {hasPrivilege("CreateDeposit") && (
            <div
              onClick={() => setAddModalOpen(true)}
              id="add-deposit-icon"
              className="w-7 h-7 rounded-full cursor-pointer hover:bg-gray-100 p-1"
            >
              <FaPlus className="text-[#3D873B] w-full h-full" />
            </div>
          )}
          <Tooltip
            anchorId="add-deposit-icon"
            content="Add Deposit"
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
            placeholder="Search Deposits..."
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
                <th className="text-left py-3 px-4">Deposit ID</th>
                <th className="text-left py-3 px-4">Deposit Amount</th>
                <th className="text-left py-3 px-4">Deposit Type</th>
                <th className="text-left py-3 px-4">Branch</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {paginatedDeposits.map((deposit, index) => (
                <tr key={deposit.depositId} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{startIdx + index + 1}</td>
                  <td className="py-3 px-4">{deposit.depositId}</td>
                  <td className="py-3 px-4">{deposit.amount}</td>
                  <td className="py-3 px-4">{deposit.depositType}</td>
                  <td className="py-3 px-4">
                    {getBranchName(deposit.branchId)}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(deposit.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {deposit.status === "Active" ? (
                      <p className="text-green-500 font-bold rounded-md bg-green-50 text-center p-1">
                        Active
                      </p>
                    ) : (
                      <p className="text-red-500 font-bold rounded-md bg-red-50 text-center p-1">
                        Inactive
                      </p>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedDeposits.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No Deposits available.
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
        title={"Add Deposit"}
        description="Fill in the form to add a deposit."
      >
        <AddDeposit
          onClose={() => setAddModalOpen(false)}
          onAdd={() =>
            setDeposits([
              ...deposits,
              {
                depositId: "D005",
                amount: 1200,
                depositType: "Savings",
                branchId: "2",
                date: new Date().toISOString(),
                status: "Active",
              },
            ])
          } // Dummy data addition
        />
      </Modal>
    </Layout>
  );
};

export default DepositList;
