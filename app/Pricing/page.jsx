"use client";
import React, { useState } from "react";
import Layout from "../components/Layout";

const LoanCalculator = () => {
  // States to track inputs
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("monthly");

  // States for calculated results
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [totalInterest, setTotalInterest] = useState(null);
  const [totalPayment, setTotalPayment] = useState(null);

  // Function to calculate loan details
  const calculateLoan = () => {
    const principal = loanAmount - downPayment;
    const annualInterestRate = interestRate / 100;
    const monthlyInterestRate = annualInterestRate / 12;
    const numberOfPayments = loanTerm * 12; // Monthly payments
    const loanType = paymentFrequency;

    // Amortization formula for monthly payments
    const monthlyPayment =
      (principal *
        (monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    const totalPaid = monthlyPayment * numberOfPayments;
    const totalInterestPaid = totalPaid - principal;

    setMonthlyPayment(monthlyPayment.toFixed(2));
    setTotalPayment(totalPaid.toFixed(2));
    setTotalInterest(totalInterestPaid.toFixed(2));
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full ">
          <h1 className="text-3xl font-bold text-center text-[#3d873b] mb-6">
            Pricing Model
          </h1>
          <p className="text-center mb-8">
            Calculate your monthly payment, total interest, and total loan cost.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Loan Amount ($):
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter loan amount"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                Interest Rate (% per year):
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter interest rate"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                Loan Term (Years):
              </label>
              <input
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter loan term in years"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                Down Payment ($):
              </label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter down payment"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                Payment Frequency:
              </label>
              <select
                value={paymentFrequency}
                onChange={(e) => setPaymentFrequency(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <button
              onClick={calculateLoan}
              className="w-full bg-[#3D873B] text-white p-3 rounded-lg hover:bg-green-700 transition duration-200"
            >
              Calculate
            </button>
          </div>

          {monthlyPayment && (
            <div className="mt-8 space-y-4">
              <h3 className="text-2xl font-semibold text-[#3D873B]">
                Calculation Results:
              </h3>
              <p className="text-lg text-gray-800">
                <strong>Monthly Payment:</strong> ${monthlyPayment}
              </p>
              <p className="text-lg text-gray-800">
                <strong>Total Interest Paid:</strong> ${totalInterest}
              </p>
              <p className="text-lg text-gray-800">
                <strong>Total Amount Paid (Loan + Interest):</strong> $
                {totalPayment}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LoanCalculator;
