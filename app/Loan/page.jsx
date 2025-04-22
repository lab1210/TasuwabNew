"use client";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "@/Services/authService";
import { useRouter } from "next/navigation";
import dummyLoans from "./DummyLoan";
import roleService from "@/Services/roleService";
import LargeModal from "../components/LargeModal";
import AddLoan from "./AddLoan";
import { Tooltip } from "react-tooltip";
import { FaEye, FaPlus } from "react-icons/fa";
import LoanInfo from "./LoanInfo";
import dummyClients from "./DummyClient";

const ITEMS_PER_PAGE = 2;

const Loans = () => {
  const { user } = useAuth();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [loans, setLoans] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleAddLoan = (newLoan) => {
    setLoans((prevLoans) => [...prevLoans, newLoan]);
  };
  useEffect(() => {
    setLoans(dummyLoans);
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
            <p className="text-4xl font-extrabold">Loans</p>
            <p className="text-sm text-gray-600">
              View all of your loan applications.
            </p>
          </div>
          {hasPrivilege("CreateLoanApplication") && (
            <div
              onClick={() => setAddModalOpen(true)}
              id="add-loan-icon"
              className="w-7 h-7 rounded-full cursor-pointer hover:bg-gray-100 p-1"
            >
              <FaPlus className="text-[#3D873B] w-full h-full" />
            </div>
          )}
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
            placeholder="Search Loans..."
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
                      {loan.status === "Rejected" ? (
                        <p className="text-red-500 font-bold rounded-md bg-red-50 text-center p-1">
                          {loan.status}
                        </p>
                      ) : loan.status === "Approved" ? (
                        <p className="text-green-500 font-bold rounded-md bg-green-50 text-center p-1">
                          {loan.status}
                        </p>
                      ) : loan.status === "Active" ? (
                        <p className="text-blue-500 font-bold rounded-md bg-blue-50 text-center p-1">
                          {loan.status}
                        </p>
                      ) : (
                        <p className="text-yellow-500 font-bold rounded-md bg-yellow-50 text-center p-1">
                          {loan.status}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <FaEye
                        onClick={() => {
                          setSelectedLoan(loan.LoanID);
                          setIsSidebarOpen(true);
                        }}
                        size={18}
                        className="cursor-pointer text-gray-500 hover:text-black"
                      />
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
      {addModalOpen && (
        <LargeModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title={"Add Loan"}
          description="Fill in the form to add a Loan."
        >
          <AddLoan
            onClose={() => setAddModalOpen(false)}
            onAdd={handleAddLoan}
          />
        </LargeModal>
      )}
    </Layout>
  );
};

export default Loans;
