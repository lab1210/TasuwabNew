"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/Services/authService";
import { useRouter } from "next/navigation";
import roleService from "@/Services/roleService";
import { Tooltip } from "react-tooltip";
import { FaEdit, FaEye, FaPlus, FaWallet } from "react-icons/fa";
import LoanInfo from "@/app/Loan/LoanInfo";
import Layout from "@/app/components/Layout";
import dummyLoans from "@/app/Loan/DummyLoan";
import RepaymentModal from "@/app/components/RepaymentModal";
const ITEMS_PER_PAGE = 2;

const ActiveLoans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [openRepayModal, setOpenRepayModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    console.log("Loaded dummyLoans:", dummyLoans);
    const pending = dummyLoans.filter((loan) => loan.status === "Active");
    setLoans(pending);
    setLoading(false);
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
      if (!Array.isArray(loans)) {
        setFilteredLoans([]);
        return;
      }

      let results = loans;

      // Filter by text
      if (filterText) {
        results = results.filter((loan) =>
          Object.values(loan).some(
            (value) =>
              value && value.toString().toLowerCase().includes(lowerCaseFilter)
          )
        );
      }

      // Filter by status
      if (statusFilter) {
        results = results.filter(
          (loan) =>
            loan.status &&
            loan.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }

      // Filter by date range
      if (startDate || endDate) {
        results = results.filter((loan) => {
          const loanDate = new Date(loan.createdDate);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;

          if (start && end) return loanDate >= start && loanDate <= end;
          if (start) return loanDate >= start;
          if (end) return loanDate <= end;

          return true;
        });
      }

      setFilteredLoans(results);
      setCurrentPage(1);
    };

    handleFilter();
  }, [loans, filterText, statusFilter, startDate, endDate]);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLoans = filteredLoans.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE);

  const hasPrivilege = (privilegeName) => {
    return !loadingPrivileges && rolePrivileges.includes(privilegeName);
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
            <p className="text-4xl font-extrabold">Active Loans</p>
            <p className="text-sm text-gray-600">View all Active loans.</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <input
            type="text"
            placeholder="Search Financed Assets..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="placeholder:text-sm border p-2 w-full rounded-md border-gray-300 outline-none shadow-sm"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border  w-full p-2 rounded-md shadow-sm border-gray-300"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 w-full rounded-md shadow-sm border-gray-300"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border w-full p-2 rounded-md shadow-sm border-gray-300"
          >
            <option value="">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto divide-y divide-gray-200 shadow-lg rounded-md">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="text-left py-3 px-4">S/N</th>
                <th className="text-left py-3 px-4">DocNbr </th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Business Name </th>
                <th className="text-left py-3 px-4">Phone</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Loan Type</th>
                <th className="text-left py-3 px-4">Loan Amount</th>
                <th className="text-left py-3 px-4">Payment Period</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Created By</th>
                <th className="text-left py-3 px-4">Created Date</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {paginatedLoans.map((loan, index) => {
                return (
                  <tr key={index}>
                    <td className="py-3 px-4">{startIdx + index + 1}</td>
                    <td className="py-3 px-4">{loan.fileName}</td>
                    <td className="py-3 px-4">{loan.name}</td>
                    <td className="py-3 px-4">{loan.businessName}</td>
                    <td className="py-3 px-4">{loan.phone}</td>
                    <td className="py-3 px-4">{loan.email}</td>
                    <td className="py-3 px-4">{loan.purpose}</td>
                    <td className="py-3 px-4">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      }).format(
                        loan.loanAmount === "NA"
                          ? loan.totalCostofAsset
                          : loan.loanAmount
                      )}
                    </td>
                    <td className="py-3 px-4">{loan.InstallmentPeriod}</td>

                    <td className="py-3 px-4">
                      {loan.status === "Pending" ? (
                        <p className="text-yellow-500 font-bold rounded-md bg-yellow-50 text-center p-1">
                          {loan.status}
                        </p>
                      ) : loan.status === "Approved" ? (
                        <p className="text-green-500 font-bold rounded-md bg-green-50 text-center p-1">
                          {loan.status}
                        </p>
                      ) : loan.status === "Rejected" ? (
                        <p className="text-red-500 font-bold rounded-md bg-red-50 text-center p-1">
                          {loan.status}
                        </p>
                      ) : (
                        loan.status === "Active" && (
                          <p className="text-blue-500 font-bold rounded-md bg-blue-50 text-center p-1">
                            {loan.status}
                          </p>
                        )
                      )}
                    </td>
                    <td className="py-3 px-4">{loan.createdBy}</td>
                    <td className="py-3 px-4">{loan.date}</td>

                    <td className="py-3 px-4 text-center flex items-center justify-center gap-4">
                      <FaEye
                        onClick={() => {
                          setSelectedLoan(loan.loanId);
                          setIsSidebarOpen(true);
                        }}
                        size={18}
                        className="cursor-pointer text-gray-500 hover:text-black"
                      />
                      {(loan.status === "Pending" ||
                        loan.status === "Rejected") && (
                        <FaEdit
                          onClick={() => {
                            setSelectedLoan(loan.loanId);
                            router.push(
                              `/Loan/Update-Request-Form/${loan.loanId}`
                            );
                          }}
                          size={18}
                          className="cursor-pointer  hover:text-gray-500"
                        />
                      )}
                      <div
                        onClick={() => {
                          setOpenRepayModal(true);
                          setSelectedLoan(loan);
                        }}
                        title="Repay Loan"
                        className="bg-gray-200 flex justify-center items-center rounded-full cursor-pointer w-8 h-8 hover:opacity-90"
                      >
                        <FaWallet size={18} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedLoans.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No Loans available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
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
      </div>
      <LoanInfo
        loans={
          Array.isArray(loans)
            ? loans.find((c) => c.loanId === selectedLoan)
            : null
        }
        onClose={() => setIsSidebarOpen(false)}
        isOpen={isSidebarOpen}
      />
      {openRepayModal && selectedLoan && (
        <RepaymentModal
          onClose={() => setOpenRepayModal(false)}
          loan={selectedLoan}
        />
      )}
    </Layout>
  );
};

export default ActiveLoans;
