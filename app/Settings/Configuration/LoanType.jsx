"use client";

import React, { useState } from "react";
import Table from "./Table";

const LoanTypeConfiguration = ({ loanTypes, setLoanTypes }) => {
  const [loanType, setLoanType] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");

  const handleAddLoanType = () => {
    setLoanTypes([...loanTypes, { code, name: loanType, description }]);
    setLoanType("");
    setDescription("");
    setCode("");
  };

  return (
    <div className="p-6">
      <h3 className="font-semibold text-[#333] mb-4">Add Loan Type</h3>
      <div className="flex gap-3 items-end">
        <div className="flex gap-3">
          <input
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Loan Type Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <input
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Loan Type Name"
            value={loanType}
            onChange={(e) => setLoanType(e.target.value)}
          />
          <textarea
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          className="bg-[#3D873B] text-white p-2 pl-5 pr-5 hover:bg-green-600 cursor-pointer rounded-md"
          onClick={handleAddLoanType}
        >
          Add
        </button>
      </div>

      <Table
        headers={["Loan Type Code", "Loan Type", "Description"]}
        rows={loanTypes}
      />
    </div>
  );
};

export default LoanTypeConfiguration;
