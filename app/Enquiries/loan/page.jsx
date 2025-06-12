"use client";
import Layout from "@/app/components/Layout";
import dummyLoans from "@/app/Loan/DummyLoan";
import React, { useState } from "react";
import { jsPDF } from "jspdf";

const LoanEnquiryPage = () => {
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("");

  const uniqueClients = [...new Set(dummyLoans.map((loan) => loan.name))];
  const clientLoans = dummyLoans.filter((loan) => loan.name === selectedClient);
  const selectedLoan = clientLoans.find(
    (loan) => loan.loanId === selectedLoanId
  );

  // Function to generate PDF
  const generatePDF = () => {
    if (!selectedLoan) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Loan Enquiry Report", 14, 22);

    doc.setFontSize(12);
    let y = 35;

    const addLine = (label, value) => {
      doc.text(`${label}: ${value}`, 14, y);
      y += 8;
    };

    addLine("Client ID", selectedLoan.clientId);
    addLine("Loan ID", selectedLoan.loanId);
    addLine("Business Name", selectedLoan.businessName);
    addLine("Purpose", selectedLoan.purpose);
    addLine("Loan Amount", `₦${selectedLoan.loanAmount.toLocaleString()}`);
    addLine("Status", selectedLoan.status);
    addLine("Date", selectedLoan.date);
    addLine("Installment Period", `${selectedLoan.InstallmentPeriod} months`);
    addLine(
      "Equity Contribution",
      `₦${selectedLoan.equityContribution.toLocaleString()}`
    );
    addLine("Asset", selectedLoan.asset);
    addLine("Supplier", selectedLoan.Supplier);

    if (selectedLoan.repayment) {
      y += 8;
      doc.setFontSize(14);
      doc.text("Repayment Info", 14, y);
      y += 8;
      doc.setFontSize(12);

      addLine("Repayment Date", selectedLoan.repayment.RepaymentDate);
      addLine(
        "Repaid Amount",
        `₦${selectedLoan.repayment.Repaidamount.toLocaleString()}`
      );
      addLine("Months Remaining", selectedLoan.repayment.MonthsRemaining);
      addLine(
        "Opening Balance",
        `₦${(
          selectedLoan.repayment.amountRemaining +
          selectedLoan.repayment.Repaidamount
        ).toLocaleString()}`
      );
      addLine(
        "Closing Balance",
        `₦${selectedLoan.repayment.amountRemaining.toLocaleString()}`
      );
    }

    doc.save(`LoanEnquiry_${selectedLoan.loanId}.pdf`);
  };

  return (
    <Layout className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Loan Enquiry</h2>

      {/* Select Client */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Client</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedClient}
          onChange={(e) => {
            setSelectedClient(e.target.value);
            setSelectedLoanId("");
          }}
        >
          <option value="">-- Choose a Client --</option>
          {uniqueClients.map((client) => (
            <option key={client} value={client}>
              {client}
            </option>
          ))}
        </select>
      </div>

      {/* Select Loan */}
      {selectedClient && (
        <div className="mb-4">
          <label className="block font-semibold mb-1">Select Loan</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedLoanId}
            onChange={(e) => setSelectedLoanId(e.target.value)}
          >
            <option value="">-- Choose a Loan --</option>
            {clientLoans.map((loan) => (
              <option key={loan.loanId} value={loan.loanId}>
                {loan.loanId} - {loan.loanDetails} ({loan.status})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Display Loan Details */}
      {selectedLoan && (
        <>
          {/* Download PDF Button */}
          <div className="flex justify-end">
            <button
              onClick={generatePDF}
              className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:opacity-90"
            >
              Download PDF
            </button>
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-bold mb-3 underline">Loan Details</h3>
            <div className="space-y-2">
              <p>
                <strong>Client ID:</strong> {selectedLoan.clientId}
              </p>
              <p>
                <strong>Loan ID:</strong> {selectedLoan.loanId}
              </p>
              <p>
                <strong>Business Name:</strong> {selectedLoan.businessName}
              </p>
              <p>
                <strong>Purpose:</strong> {selectedLoan.purpose}
              </p>
              <p>
                <strong>Loan Amount:</strong> ₦
                {selectedLoan.loanAmount.toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> {selectedLoan.status}
              </p>
              <p>
                <strong>Date:</strong> {selectedLoan.date}
              </p>
              <p>
                <strong>Installment Period:</strong>{" "}
                {selectedLoan.InstallmentPeriod} months
              </p>
              <p>
                <strong>Equity Contribution:</strong> ₦
                {selectedLoan.equityContribution.toLocaleString()}
              </p>
              <p>
                <strong>Asset:</strong> {selectedLoan.asset}
              </p>
              <p>
                <strong>Supplier:</strong> {selectedLoan.Supplier}
              </p>
            </div>

            {/* Repayment Details */}
            {selectedLoan.repayment && (
              <div className="mt-6">
                <h4 className="text-lg underline font-semibold mb-2">
                  Repayment Info
                </h4>
                <p>
                  <strong>Repayment Date:</strong>{" "}
                  {selectedLoan.repayment.RepaymentDate}
                </p>
                <p>
                  <strong>Repaid Amount:</strong> ₦
                  {selectedLoan.repayment.Repaidamount.toLocaleString()}
                </p>
                <p>
                  <strong>Months Remaining:</strong>{" "}
                  {selectedLoan.repayment.MonthsRemaining}
                </p>
                <p>
                  <strong>Opening Balance:</strong> ₦
                  {(
                    selectedLoan.repayment.amountRemaining +
                    selectedLoan.repayment.Repaidamount
                  ).toLocaleString()}
                </p>
                <p>
                  <strong>Closing Balance:</strong> ₦
                  {selectedLoan.repayment.amountRemaining.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default LoanEnquiryPage;
