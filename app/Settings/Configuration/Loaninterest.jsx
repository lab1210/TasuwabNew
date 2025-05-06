"use client";
import React, { useState } from "react";
import Table from "./Table";

const LoanInterestTableConfiguration = ({
  loanTypes,
  loanInterest,
  setLoanInterest,
}) => {
  const [loanInterestRow, setLoanInterestRow] = useState({
    type: "",
    minDays: "",
    maxDays: "",
    interestRate: "",
    penaltyRate: "",
    minAmount: "",
    maxAmount: "",
  });
  const [error, setError] = useState("");

  const validateRow = () => {
    const { minDays, maxDays, minAmount, maxAmount, type } = loanInterestRow;
    // if (!type) return "Please select a loan type.";
    if (Number(minDays) > Number(maxDays))
      return "Min days cannot exceed max days.";
    if (Number(minAmount) > Number(maxAmount))
      return "Min amount cannot exceed max amount.";
    return "";
  };
  const handleAddLoanInterest = () => {
    const validationMessage = validateRow();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setLoanInterest([...loanInterest, loanInterestRow]);
    setLoanInterestRow({
      type: "",
      minDays: "",
      maxDays: "",
      interestRate: "",
      penaltyRate: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  return (
    <div className="p-6">
      <h3 className="font-semibold text-[#333] mb-4">Add Loan Interest Row</h3>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <select
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          value={loanInterestRow.type}
          onChange={(e) =>
            setLoanInterestRow({ ...loanInterestRow, type: e.target.value })
          }
        >
          <option value="">Select Loan Type</option>
          {loanTypes.map((l, i) => (
            <option key={i} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          placeholder="Min Days"
          value={loanInterestRow.minDays}
          onChange={(e) =>
            setLoanInterestRow({ ...loanInterestRow, minDays: e.target.value })
          }
        />
        <input
          type="number"
          min={1}
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          placeholder="Max Days"
          value={loanInterestRow.maxDays}
          onChange={(e) =>
            setLoanInterestRow({ ...loanInterestRow, maxDays: e.target.value })
          }
        />
        <input
          type="number"
          min={1}
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          placeholder="Interest Rate (%)"
          value={loanInterestRow.interestRate}
          onChange={(e) =>
            setLoanInterestRow({
              ...loanInterestRow,
              interestRate: e.target.value,
            })
          }
        />
        <input
          type="number"
          min={0}
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          placeholder="Penalty Rate"
          value={loanInterestRow.penaltyRate}
          onChange={(e) =>
            setLoanInterestRow({
              ...loanInterestRow,
              penaltyRate: e.target.value,
            })
          }
        />
        <input
          type="number"
          min={1}
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          placeholder="Min Amount"
          value={loanInterestRow.minAmount}
          onChange={(e) =>
            setLoanInterestRow({
              ...loanInterestRow,
              minAmount: e.target.value,
            })
          }
        />
        <input
          type="number"
          min={1}
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          placeholder="Max Amount"
          value={loanInterestRow.maxAmount}
          onChange={(e) =>
            setLoanInterestRow({
              ...loanInterestRow,
              maxAmount: e.target.value,
            })
          }
        />
      </div>
      <button
        className="bg-[#3D873B] text-white p-2 pl-5 pr-5 hover:bg-green-600 cursor-pointer rounded-md"
        onClick={handleAddLoanInterest}
      >
        Add
      </button>
      <Table
        headers={[
          "Type",
          "Min Days",
          "Max Days",
          "Interest %",
          "Penalty",
          "Min Amount",
          "Max Amount",
        ]}
        rows={loanInterest}
      />
    </div>
  );
};

export default LoanInterestTableConfiguration;
