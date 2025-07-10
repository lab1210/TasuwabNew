"use client";
import React, { useState } from "react";
import Table from "./Table";

const LoanTransactionTypeTab = () => {
  const [loanTransactionRow, setLoanTransactionRow] = useState({
    name: "",
    description: "",
    sign: "+", // Default value
  });

  const handleAddLoanTransactionType = () => {
    setLoanTransactionTypes([...loanTransactionTypes, loanTransactionRow]);
    setLoanTransactionRow({
      name: "",
      description: "",
      sign: "+", // Reset to default after adding
    });
  };

  return (
    <div className="p-6">
      <h3 className="font-semibold text-[#333] mb-4">
        Add Loan Transaction Type
      </h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <input
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          placeholder="Transaction Type Name"
          value={loanTransactionRow.name}
          onChange={(e) =>
            setLoanTransactionRow({
              ...loanTransactionRow,
              name: e.target.value,
            })
          }
        />
        <textarea
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          placeholder="Transaction Type Description"
          value={loanTransactionRow.description}
          onChange={(e) =>
            setLoanTransactionRow({
              ...loanTransactionRow,
              description: e.target.value,
            })
          }
        />
        <select
          className=" text-2xl text-center border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          value={loanTransactionRow.sign}
          onChange={(e) =>
            setLoanTransactionRow({
              ...loanTransactionRow,
              sign: e.target.value,
            })
          }
        >
          <option value="+">+</option>
          <option value="-">-</option>
        </select>
      </div>
      <button
        className="bg-[#3D873B] text-white p-2 pl-5 pr-5 hover:bg-green-600 cursor-pointer rounded-md"
        onClick={handleAddLoanTransactionType}
      >
        Add
      </button>
      <Table
        headers={["Name", "Description", "Sign"]}
        rows={loanTransactionTypes}
      />
    </div>
  );
};

export default LoanTransactionTypeTab;
