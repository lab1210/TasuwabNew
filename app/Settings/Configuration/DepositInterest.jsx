"use client";

import React, { useState, useEffect } from "react";
import Table from "./Table";
import useAccountService from "@/Services/accountService";

const DepositInterestTableConfiguration = ({
  depositInterest,
  setDepositInterest,
}) => {
  const { getAllAccountTypes } = useAccountService();

  const [depositTypes, setDepositTypes] = useState([]);
  const [error, setError] = useState("");
  const [depositInterestRow, setDepositInterestRow] = useState({
    type: "",
    minDays: "",
    maxDays: "",
    interestRate: "",
    penaltyRate: "",
    minAmount: "",
    maxAmount: "",
  });

  useEffect(() => {
    const fetchDepositTypes = async () => {
      try {
        const types = await getAllAccountTypes();
        setDepositTypes(types);
      } catch (err) {
        setError("Failed to load deposit types");
      }
    };

    fetchDepositTypes();
  }, []);

  const validateRow = () => {
    const { minDays, maxDays, minAmount, maxAmount, type } = depositInterestRow;
    if (!type) return "Please select a deposit type.";
    if (Number(minDays) > Number(maxDays))
      return "Min days cannot exceed max days.";
    if (Number(minAmount) > Number(maxAmount))
      return "Min amount cannot exceed max amount.";
    return "";
  };

  const handleAddDepositInterest = () => {
    const validationMessage = validateRow();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setDepositInterest([...depositInterest, depositInterestRow]);
    setDepositInterestRow({
      type: "",
      minDays: "",
      maxDays: "",
      interestRate: "",
      penaltyRate: "",
      minAmount: "",
      maxAmount: "",
    });
    setError("");
  };

  return (
    <div className="p-6">
      <h3 className="font-semibold text-[#333] mb-4">
        Add Deposit Interest Row
      </h3>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <select
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          value={depositInterestRow.type}
          onChange={(e) =>
            setDepositInterestRow({
              ...depositInterestRow,
              type: e.target.value,
            })
          }
        >
          <option value="">Select Deposit Type</option>
          {depositTypes.map((d, i) => (
            <option key={i} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={1}
          placeholder="Min Days"
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          value={depositInterestRow.minDays}
          onChange={(e) =>
            setDepositInterestRow({
              ...depositInterestRow,
              minDays: e.target.value,
            })
          }
        />

        <input
          type="number"
          min={1}
          placeholder="Max Days"
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          value={depositInterestRow.maxDays}
          onChange={(e) =>
            setDepositInterestRow({
              ...depositInterestRow,
              maxDays: e.target.value,
            })
          }
        />

        <input
          type="number"
          min={1}
          placeholder="Interest Rate (%)"
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          value={depositInterestRow.interestRate}
          onChange={(e) =>
            setDepositInterestRow({
              ...depositInterestRow,
              interestRate: e.target.value,
            })
          }
        />

        <input
          type="number"
          min={0}
          placeholder="Penalty Rate"
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          value={depositInterestRow.penaltyRate}
          onChange={(e) =>
            setDepositInterestRow({
              ...depositInterestRow,
              penaltyRate: e.target.value,
            })
          }
        />

        <input
          type="number"
          min={1}
          placeholder="Min Amount"
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          value={depositInterestRow.minAmount}
          onChange={(e) =>
            setDepositInterestRow({
              ...depositInterestRow,
              minAmount: e.target.value,
            })
          }
        />

        <input
          type="number"
          min={1}
          placeholder="Max Amount"
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          value={depositInterestRow.maxAmount}
          onChange={(e) =>
            setDepositInterestRow({
              ...depositInterestRow,
              maxAmount: e.target.value,
            })
          }
        />
      </div>

      <button
        className="bg-[#3D873B] text-white p-2 pl-5 pr-5 hover:bg-green-600 cursor-pointer rounded-md"
        onClick={handleAddDepositInterest}
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
        rows={depositInterest}
      />
    </div>
  );
};

export default DepositInterestTableConfiguration;
