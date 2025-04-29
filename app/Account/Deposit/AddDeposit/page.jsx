"use client";

import React, { useState } from "react";
import Select from "react-select";
import { v4 as uuidv4 } from "uuid";

const AddDeposit = ({ onClose, onAdd }) => {
  // Step 1: Account Code and Branch
  const [accountCode, setAccountCode] = useState("");
  const [branch, setBranch] = useState("");

  // Step 2: Deposit Amount, Deposit Type, and Interest Rate
  const [amount, setAmount] = useState("");
  const [depositType, setDepositType] = useState("");
  const [interestRate, setInterestRate] = useState("");

  // Step 3: DocNbr and Date
  const [docNbr, setDocNbr] = useState(uuidv4()); // Random DocNbr using uuid
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Set current date

  // Error states
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  // Dummy data for branches and account types
  const branches = [
    { value: "1", label: "Lagos Branch" },
    { value: "2", label: "Abuja Branch" },
    { value: "3", label: "Port Harcourt Branch" },
  ];

  const accountTypes = [
    { value: "Savings", label: "Savings" },
    { value: "Current", label: "Current" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check for missing fields
    if (step === 1 && (!accountCode || !branch)) {
      setError("Please select Account Code and Branch.");
      return;
    }
    if (step === 2 && (!amount || !depositType || !interestRate)) {
      setError("Please fill in all deposit details.");
      return;
    }

    console.log(`Current step before transition: ${step}`);

    // If form is valid, proceed to add the deposit
    if (step === 1) {
      setStep(2); // Move to next step (step 2)
    } else if (step === 2) {
      setStep(3); // Move to next step (step 3)
    } else if (step === 3) {
      // Submit deposit and close the modal
      const newDeposit = {
        accountCode,
        branch,
        amount: parseFloat(amount),
        depositType,
        interestRate: parseFloat(interestRate),
        docNbr,
        date,
      };

      onAdd(newDeposit); // Pass deposit to parent component
      onClose(); // Close the modal
      resetForm(); // Reset form data
    }
  };

  const resetForm = () => {
    setAccountCode("");
    setBranch("");
    setAmount("");
    setDepositType("");
    setInterestRate("");
    setDocNbr(uuidv4()); // Reset DocNbr with new uuid
    setDate(new Date().toISOString().split("T")[0]); // Reset Date to current date
    setStep(1); // Reset to first step
    setError("");
  };

  return (
    <div className="p-4 max-h-100">
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Header with DocNbr and Date */}
      <div className="mb-4 text-sm text-gray-600">
        <div>
          Document Number: <strong>{docNbr}</strong>
        </div>
        <div>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-40 p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Step 1: Select Account and Branch
            </h3>

            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="accountCode"
              >
                Account Code
              </label>
              <Select
                id="accountCode"
                value={
                  accountCode
                    ? { value: accountCode, label: accountCode }
                    : null
                }
                onChange={(selected) => setAccountCode(selected.value)}
                options={[
                  { value: "A1001", label: "A1001" },
                  { value: "A1002", label: "A1002" },
                ]}
                isSearchable
                placeholder="Select Account Code"
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="branch"
              >
                Branch
              </label>
              <Select
                id="branch"
                value={branch ? { value: branch, label: branch } : null}
                onChange={(selected) => setBranch(selected.value)}
                options={branches}
                isSearchable
                placeholder="Select Branch"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#3D873B] text-white rounded-md"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Step 2: Deposit Details
            </h3>

            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="amount"
              >
                Deposit Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="depositType"
              >
                Deposit Type
              </label>
              <Select
                id="depositType"
                value={
                  depositType
                    ? { value: depositType, label: depositType }
                    : null
                }
                onChange={(selected) => setDepositType(selected.value)}
                options={accountTypes}
                placeholder="Select Deposit Type"
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="interestRate"
              >
                Interest Rate
              </label>
              <input
                type="number"
                id="interestRate"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#3D873B] text-white rounded-md"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Step 3: Confirm and Submit
            </h3>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-white rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#3D873B] text-white rounded-md"
              >
                Submit Deposit
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddDeposit;
