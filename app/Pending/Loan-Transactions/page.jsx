"use client";
import React, { useEffect, useState } from "react";
import dummyLoans from "@/app/Loan/DummyLoan";
import Layout from "@/app/components/Layout";
import dummyClients from "@/app/Loan/DummyClient";
import { Tooltip } from "react-tooltip";
import { useAuth } from "@/Services/authService";
const ITEMS_PER_PAGE = 2;

const PendingLoanTransactions = () => {
  const [loansTransactions, setLoansTransactions] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filteredLoantransactions, setFilteredLoantransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const PendingTransactions = dummyLoans.flatMap((loan) =>
      loan.transactions
        .filter((transaction) => transaction.status === "Pending")
        .map((transaction) => ({
          ...loan, // keep loan-level info
          transactions: transaction, // but override transactions to single transaction
        }))
    );
    setLoansTransactions(PendingTransactions);
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleFilter = () => {
      const lowerCaseFilter = filterText.toLowerCase();
      const results = loansTransactions.filter((loan) =>
        Object.values(loan).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseFilter)
        )
      );
      setFilteredLoantransactions(results);
      setCurrentPage(1); // reset to first page on search
    };
    handleFilter();
  }, [loansTransactions, filterText]);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLoans = filteredLoantransactions.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(
    filteredLoantransactions.length / ITEMS_PER_PAGE
  );

  if (loading) {
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
            <p className="text-4xl font-extrabold">Pending Loan Transactions</p>
            <p className="text-sm text-gray-600">
              These are loan transactions that are still pending for approval.
            </p>
          </div>
        </div>
        <div className="mt-4 mb-5">
          <input
            type="text"
            placeholder="Search..."
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
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Client</th>
                <th className="text-left py-3 px-4">DocNbr</th>
                <th className="text-left py-3 px-4">Transaction type</th>
                <th className="text-left py-3 px-4">Interest rate</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-left py-3 px-4">Assigned to</th>

                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {paginatedLoans.map((loan, index) => {
                const client =
                  (loan?.clientId &&
                    dummyClients.find((c) => c.clientId === loan.clientId)) ||
                  null;

                const clientName = client
                  ? `${client.firstName} ${client.lastName}`
                  : "Client Not Found";
                return (
                  <tr key={index}>
                    <td className="py-3 px-4">{startIdx + index + 1}</td>
                    <td className="py-3 px-4">{loan.transactions.date}</td>
                    <td className="py-3 px-4">{clientName}</td>
                    <td className="py-3 px-4">{loan.transactions.docNbr}</td>

                    <td className="py-3 px-4">{loan.transactions.type}</td>
                    <td className="py-3 px-4">
                      {loan.transactions.interestRate + "%"}
                    </td>
                    <td className="py-3 px-4">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      }).format(loan.transactions.amount)}
                    </td>

                    <td className="py-3 px-4">
                      {loan.transactions.description}
                    </td>
                    <td className="py-3 px-4">
                      {loan.transactions.assignedRole}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-yellow-500 font-bold rounded-md bg-yellow-50 text-center p-1">
                        {loan.transactions.status}
                      </p>
                    </td>
                  </tr>
                );
              })}
              {paginatedLoans.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No Pending Transaction available.
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
    </Layout>
  );
};

export default PendingLoanTransactions;
