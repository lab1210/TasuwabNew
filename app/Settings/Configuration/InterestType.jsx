"use client";
import React, { useState } from "react";

const InterestSettings = () => {
  const [loanDays, setLoanDays] = useState("");
  const [depositDays, setDepositDays] = useState("");

  return (
    <div className="p-6 mt-6">
      {/* Loan Interest Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Loan Interest
        </h3>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Number of Days
        </label>
        <input
          type="number"
          min={1}
          value={loanDays}
          onChange={(e) => setLoanDays(e.target.value)}
          placeholder="Enter number of days for loan interest"
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {/* Deposit Interest Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Deposit Interest
        </h3>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Number of Days
        </label>
        <input
          type="number"
          min={1}
          value={depositDays}
          onChange={(e) => setDepositDays(e.target.value)}
          placeholder="Enter number of days for deposit interest"
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>
    </div>
  );
};

export default InterestSettings;
