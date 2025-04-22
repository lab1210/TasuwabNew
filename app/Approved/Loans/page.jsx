"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/Services/authService";
import { useRouter } from "next/navigation";
import roleService from "@/Services/roleService";
import { Tooltip } from "react-tooltip";
import { FaExchangeAlt, FaEye, FaPlus } from "react-icons/fa";
import LoanInfo from "@/app/Loan/LoanInfo";
import dummyClients from "@/app/Loan/DummyClient";
import dummyLoans from "@/app/Loan/DummyLoan";
import Layout from "@/app/components/Layout";

const ITEMS_PER_PAGE = 2;

const ApprovedLoans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const approvedOnly = dummyLoans.filter(
      (loan) => loan.status === "Approved" || loan.status === "Active"
    );
    setLoans(approvedOnly);
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
      const results = loans.filter((loan) =>
        Object.values(loan).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseFilter)
        )
      );
      setFilteredLoans(results);
      setCurrentPage(1); // reset to first page on search
    };
    handleFilter();
  }, [loans, filterText]);

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
            <p className="text-4xl font-extrabold">Approved Loans</p>
            <p className="text-sm text-gray-600">
              These are loans that have been approved.
            </p>
          </div>

          <Tooltip
            anchorId="add-loan-icon"
            content="Add Loan"
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
            placeholder="Search Approved /Active Loans..."
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
                <th className="text-left py-3 px-4">Client ID</th>
                <th className="text-left py-3 px-4">Client Name</th>

                <th className="text-left py-3 px-4">Bank</th>
                <th className="text-left py-3 px-4">Loan Amount</th>
                <th className="text-left py-3 px-4">Loan Type</th>
                <th className="text-left py-3 px-4">Loan Purpose</th>

                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {paginatedLoans.map((loan, index) => {
                const client =
                  (loan?.clientId &&
                    dummyClients.find((c) => c.clientId === loan.clientId)) ||
                  null;

                // Safely display the client's full name
                const clientName = client
                  ? `${client.firstName} ${client.lastName}`
                  : "Client Not Found";
                return (
                  <tr key={index}>
                    <td className="py-3 px-4">{startIdx + index + 1}</td>
                    <td className="py-3 px-4">{loan.clientId}</td>

                    <td className="py-3 px-4">{clientName}</td>

                    <td className="py-3 px-4">{loan.bank}</td>
                    <td className="py-3 px-4">{loan.loanAmount}</td>
                    <td className="py-3 px-4">{loan.loanType}</td>
                    <td className="py-3 px-4">{loan.loanPurpose}</td>
                    <td className="py-3 px-4">
                      {loan.status === "Active" ? (
                        <p className="text-blue-500 font-bold rounded-md bg-blue-50 text-center p-1">
                          {loan.status}
                        </p>
                      ) : (
                        <p className="text-green-500 font-bold rounded-md bg-green-50 text-center p-1">
                          {loan.status}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <FaEye
                          onClick={() => {
                            setSelectedLoan(loan.LoanID);
                            setIsSidebarOpen(true);
                          }}
                          size={18}
                          className="cursor-pointer text-gray-500 hover:text-black"
                        />
                        <FaExchangeAlt
                          onClick={() => {}}
                          size={18}
                          className="cursor-pointer  hover:text-gray-500"
                        />
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
        loans={loans.find((c) => c.LoanID === selectedLoan)}
        onClose={() => setIsSidebarOpen(false)}
        isOpen={isSidebarOpen}
      />
    </Layout>
  );
};

export default ApprovedLoans;
