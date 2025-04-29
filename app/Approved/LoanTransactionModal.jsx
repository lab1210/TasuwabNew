"use client";
import React, { useState } from "react";
import Select from "react-select";
import { v4 as uuidv4 } from "uuid";
const LoanTransactionModal = ({ onClose, onAdd }) => {
  // Step 1: Transaction Details
  const [transactionType, setTransactionType] = useState("");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [notes, setNotes] = useState("");

  // Step 2: DocNbr and Date
  const [docNbr, setDocNbr] = useState(uuidv4()); // Random DocNbr using uuid
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Set current date

  // Error state
  const [error, setError] = useState("");

  // Transaction types
  const transactionTypes = [
    { value: "Disbursement", label: "Disbursement" },
    { value: "repayment", label: "repayment" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check for missing fields
    if (!transactionType || !amount || !interestRate) {
      setError("Please fill in all transaction details.");
      return;
    }

    if (notes.split(" ").length > 20) {
      setError("Notes should not exceed 20 words.");
      return;
    }

    const newTransaction = {
      docNbr,
      date,
      transactionType,
      amount: parseFloat(amount),
      interestRate: parseFloat(interestRate),
      notes,
    };

    onAdd(newTransaction); // Pass transaction to parent component
    onClose(); // Close the modal
    resetForm(); // Reset form data
  };

  const resetForm = () => {
    setTransactionType("");
    setAmount("");
    setInterestRate("");
    setNotes("");
    setDocNbr(uuidv4()); // Reset DocNbr with new uuid
    setDate(new Date().toISOString().split("T")[0]); // Reset Date to current date
    setError(""); // Reset error state
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
        {/* Transaction Type */}
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="transactionType"
          >
            Transaction Type
          </label>
          <Select
            id="transactionType"
            value={
              transactionType
                ? { value: transactionType, label: transactionType }
                : null
            }
            onChange={(selected) => setTransactionType(selected.value)}
            options={transactionTypes}
            isSearchable
            placeholder="Select Transaction Type"
          />
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="amount"
          >
            Amount
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

        {/* Interest Rate */}
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="interestRate"
          >
            Interest Rate (%)
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

        {/* Notes */}
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="notes"
          >
            Notes (Max 20 words)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            maxLength={300} // Approx 50 words (assuming average word length)
          />
        </div>

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
            Submit Transaction
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanTransactionModal;
