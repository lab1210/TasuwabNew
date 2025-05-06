"use client";

import branchService from "@/Services/branchService";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { v4 as uuidv4 } from "uuid";

const AddDeposit = ({ onClose, onAdd, branchcode }) => {
  // Step 1: Account Code and Branch
  const [accountCode, setAccountCode] = useState("");
  const [branch, setBranch] = useState("");

  // Step 2: Deposit Amount, Deposit Type, Interest Rate, Method
  const [amount, setAmount] = useState("");
  const [depositType, setDepositType] = useState("");

  // Step 3: DocNbr, Date, and Upload
  const [docNbr, setDocNbr] = useState(uuidv4());
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [file, setFile] = useState(null);
  const [otherInfo, setOtherInfo] = useState("");

  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (branchcode) {
      branchService
        .getBranchById(branchcode)
        .then((data) => {
          setBranch(data.name);
        })
        .catch((err) => {
          console.error("Failed to fetch branch name", err);
        });
    }
  }, [branchcode]);

  const TransactionTypes = [
    { value: "Deposit", label: "Deposit" },
    { value: "Withdrawal", label: "Withdrawal" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (step === 1 && (!accountCode || !branch)) {
      setError("Please select Account Code.");
      return;
    }
    if (step === 2 && (!amount || !TransactionTypes)) {
      setError("Please fill in all transaction details.");
      return;
    }
    if (step === 3 && !file) {
      setError("Please upload a document or image.");
      return;
    }

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      const newDeposit = {
        accountCode,
        branch,
        otherInfo,
        amount: parseFloat(amount),
        TransactionTypes,
        docNbr,
        date,
        file,
      };

      onAdd(newDeposit);
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setAccountCode("");
    setBranch("");
    setAmount("");
    setOtherInfo("");
    setDepositType("");
    setInterestRate("");
    setMethod("");
    setDocNbr(uuidv4());
    setDate(new Date().toISOString().split("T")[0]);
    setFile(null);
    setStep(1);
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
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Step 1: Select Account
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Account Number
              </label>
              <Select
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
                placeholder="Select Account "
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Branch :{" "}
                <span className="font-bold text-[#3D873B]">{branch}</span>
              </label>
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

        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Step 2: Transaction Details
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Transaction Type
              </label>
              <Select
                value={
                  depositType
                    ? TransactionTypes.find(
                        (type) => type.value === depositType
                      )
                    : null
                }
                onChange={(selected) => setDepositType(selected.value)}
                options={TransactionTypes}
                placeholder="Select Transaction Type"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                min={0}
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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

        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Step 3: Upload Supporting Document or Image
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Upload File (PDF, Image, etc.)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files[0])}
                className="mt-1 block w-full rounded-md bg-gray-100 p-2 border border-gray-300 cursor-pointer"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Other Information
              </label>
              <textarea
                rows={1}
                value={otherInfo}
                onChange={(e) => setOtherInfo(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-black rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#3D873B] text-white rounded-md"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddDeposit;
