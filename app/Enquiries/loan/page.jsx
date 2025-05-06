"use client";
import React, { useState } from "react";
import jsPDF from "jspdf";
import dummyLoans from "@/app/Loan/DummyLoan";
import Layout from "@/app/components/Layout";
import Select from "react-select"; // Import react-select for dropdown
import dummyClients from "@/app/Loan/DummyClient";
import { format } from "date-fns"; // For date formatting

const LoanEnquiry = () => {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [startDate, setStartDate] = useState(""); // State for start date
  const [endDate, setEndDate] = useState(""); // State for end date

  // Create a list of all unique clientIds from loans
  const clients = [...new Set([...dummyLoans.map((l) => l.clientId)])];

  const allClients = clients.map((clientId) => {
    const client = dummyClients.find((c) => c.clientId === clientId);
    const clientName = client
      ? `${client.firstName} ${client.lastName} -(${client.accountnumber})`
      : `Client ${clientId}`;
    return { value: clientId, label: clientName };
  });

  // Filter loans for the selected client and date range
  const filteredLoans = dummyLoans.filter((loan) => {
    const isClientMatch = loan.clientId === selectedClientId;
    const isDateInRange =
      (startDate ? new Date(loan.date) >= new Date(startDate) : true) &&
      (endDate ? new Date(loan.date) <= new Date(endDate) : true);
    return isClientMatch && isDateInRange;
  });

  // Calculate Opening and Closing Balances
  const calculateBalances = (loan) => {
    const transactions = loan.transactions;
    let openingBalance = 0;
    let closingBalance = 0;

    if (transactions.length > 0) {
      openingBalance = transactions[0].amount; // Assuming first transaction is the opening balance
      closingBalance = transactions[transactions.length - 1].amount; // Last transaction as closing balance
    }

    return { openingBalance, closingBalance };
  };

  // Handle export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const content = document.getElementById("statement-content");

    doc.html(content, {
      callback: function (doc) {
        doc.save(`Client_${selectedClientId}_Loan_Statement.pdf`);
      },
      x: 10,
      y: 10,
      width: 180,
      windowWidth: 1000,
    });
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-4xl font-extrabold">Client Loan </p>
            <p className="text-sm text-gray-600">View selected client Loans.</p>
          </div>
        </div>
        <div className="mt-4 mb-5">
          <Select
            id="clientId"
            options={allClients}
            value={allClients.find(
              (client) => client.value === selectedClientId
            )}
            onChange={(selectedOption) =>
              setSelectedClientId(selectedOption ? selectedOption.value : "")
            }
            placeholder="Select Client"
          />
        </div>

        <div className="flex gap-4 mt-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date:{" "}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {selectedClientId && (
            <div id="statement-content">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-lg text-[#4a5565]">
                  Loan Statement for Client:{" "}
                  <span className="text-[#3D873B] font-bold">
                    {selectedClientId
                      ? allClients.find(
                          (client) => client.value === selectedClientId
                        )?.label
                      : "Select a client"}
                  </span>
                </p>

                <button
                  onClick={handleExportPDF}
                  className="bg-[#3D873B] text-white px-4 py-2 rounded mt-4 cursor-pointer"
                >
                  Export to PDF
                </button>
              </div>

              <div className="mb-4">
                {filteredLoans.length > 0 ? (
                  filteredLoans.map((loan, index) => {
                    const { openingBalance, closingBalance } =
                      calculateBalances(loan);
                    return (
                      <div key={index}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#364153]">
                          <div className="p-4 bg-[#f1f5f9] rounded shadow">
                            <p className="font-semibold">Opening Balance</p>
                            <p className="text-[#3D873B] font-bold">
                              {new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                              }).format(openingBalance)}
                            </p>
                          </div>

                          <div className="p-4 bg-[#f1f5f9] rounded shadow">
                            <p className="font-semibold">Closing Balance</p>
                            <p className="text-[#3D873B] font-bold">
                              {new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                              }).format(closingBalance)}
                            </p>
                          </div>
                          <div className="p-4 bg-[#f1f5f9] rounded shadow">
                            <p className="font-semibold">Date Range</p>
                            <p className="text-[#3D873B] font-bold">
                              {startDate && endDate
                                ? `${format(
                                    new Date(startDate),
                                    "MM/dd/yyyy"
                                  )} - ${format(
                                    new Date(endDate),
                                    "MM/dd/yyyy"
                                  )}`
                                : "All Time"}
                            </p>
                          </div>
                        </div>

                        <table className="w-full table-auto divide-y divide-[#e5e7eb] shadow-lg rounded-md mt-4">
                          <thead className="bg-[#f9fafb] text-[#6a7282] text-sm">
                            <tr>
                              <th className="text-left py-3 px-4">Date</th>
                              <th className="text-left py-3 px-4">Amount</th>
                              <th className="text-left py-3 px-4">Type</th>
                              <th className="text-left py-3 px-4">
                                Description
                              </th>
                              <th className="text-left py-3 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm text-[#364153]">
                            {loan.transactions.map((d, index) => (
                              <tr key={index}>
                                <td className="py-3 px-4">{d.date}</td>
                                <td className="py-3 px-4">
                                  {new Intl.NumberFormat("en-NG", {
                                    style: "currency",
                                    currency: "NGN",
                                  }).format(d.amount)}
                                </td>
                                <td className="py-3 px-4">{d.type}</td>
                                <td className="py-3 px-4">{d.description}</td>
                                <td className="py-3 px-4">{d.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })
                ) : (
                  <p>No Loans found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LoanEnquiry;
