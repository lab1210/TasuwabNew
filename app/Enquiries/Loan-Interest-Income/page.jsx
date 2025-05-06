"use client";
import React, { useState } from "react";
import jsPDF from "jspdf";
import dummyLoans from "@/app/Loan/DummyLoan";
import Layout from "@/app/components/Layout";
import Select from "react-select";
import dummyClients from "@/app/Loan/DummyClient";

const LoanInterestIncome = () => {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Get all unique client IDs from the loans
  const clients = [...new Set(dummyLoans.map((loan) => loan.clientId))];

  const allClients = clients.map((clientId) => {
    const client = dummyClients.find((c) => c.clientId === clientId);
    const clientName = client
      ? `${client.firstName} ${client.lastName} (${client.accountnumber})`
      : `Client ${clientId}`;
    return { value: clientId, label: clientName };
  });

  const filterByDateRange = (items) => {
    return items.filter((item) => {
      const itemDate = new Date(item.date || item.Date);
      const isAfterStart = startDate ? itemDate >= new Date(startDate) : true;
      const isBeforeEnd = endDate ? itemDate <= new Date(endDate) : true;
      return isAfterStart && isBeforeEnd;
    });
  };

  // Filter loans for the selected client
  const filteredLoans = dummyLoans
    .filter((loan) => !selectedClientId || loan.clientId === selectedClientId)
    .map((loan) => ({
      ...loan,
      transactions: filterByDateRange(loan.transactions),
    }))
    .filter((loan) => loan.transactions.length > 0);

  const calculateInterestIncome = () => {
    // Calculate interest income from all filtered loans within the date range
    return filteredLoans.reduce((totalIncome, loan) => {
      const loanInterestIncome = loan.transactions.reduce(
        (income, transaction) => {
          if (
            transaction.type === "Disbursement" &&
            transaction.status === "Approved"
          ) {
            const interest = (transaction.amount * loan.interestRate) / 100;
            return income + interest;
          }
          return income;
        },
        0
      );
      return totalIncome + loanInterestIncome;
    }, 0);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const content = document.getElementById("interest-income-content");

    doc.html(content, {
      callback: function (doc) {
        doc.save(`Client_${selectedClientId}_Interest_Income_Statement.pdf`);
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
            <p className="text-4xl font-extrabold">Loan Interest Income</p>
            <p className="text-sm text-gray-600">
              View interest income for loans made by clients.
            </p>
          </div>
        </div>

        <div className="mt-4 mb-5">
          <Select
            isSearchable
            isClearable
            options={allClients}
            value={allClients.find(
              (client) => client.value === selectedClientId
            )}
            onChange={(e) => setSelectedClientId(e ? e.value : "")}
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
              className="border border-gray-300 p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 p-2 rounded"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div id="interest-income-content">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-lg text-[#4a5565]">
                Statement for Client:{" "}
                <span className="text-[#3D873B] font-bold">
                  {allClients.find(
                    (client) => client.value === selectedClientId
                  )?.label || "All Clients"}
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
              <div className="p-4 bg-[#f1f5f9] rounded shadow">
                <p className="font-semibold">Total Interest Income</p>
                <p className="text-[#3D873B] font-bold">
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                  }).format(calculateInterestIncome())}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <table className="w-full table-auto divide-y divide-[#e5e7eb] shadow-lg rounded-md">
                <thead className="bg-[#f9fafb] text-[#6a7282] text-sm">
                  <tr>
                    <th className="text-left py-3 px-4">S/N</th>
                    <th className="text-left py-3 px-4">Loan Type</th>
                    <th className="text-left py-3 px-4">
                      Total Interest Income
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm text-[#364153]">
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan, index) => {
                      const totalInterestIncome = loan.transactions.reduce(
                        (income, transaction) => {
                          if (
                            transaction.type === "Disbursement" &&
                            transaction.status === "Approved"
                          ) {
                            const interest =
                              (transaction.amount * loan.interestRate) / 100;
                            return income + interest;
                          }
                          return income;
                        },
                        0
                      );

                      return (
                        <tr key={loan.LoanID}>
                          <td className="py-3 px-4">{index + 1}</td>
                          <td className="py-3 px-4">{loan.loanType}</td>
                          <td className="py-3 px-4">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                            }).format(totalInterestIncome)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-3 px-4 text-center">
                        No loans found for the selected client and date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoanInterestIncome;
