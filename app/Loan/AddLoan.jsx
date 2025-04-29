"use client";

import React, { useState } from "react";
import Select from "react-select";
import { v4 as uuidv4 } from "uuid";
import dummyClients from "./DummyClient";

const AddLoan = ({ onClose, onAdd }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [docNbr, setDocNbr] = useState(uuidv4()); // Random DocNbr using uuid
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Set current date

  // Step 1: Client Info
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");

  // Step 2: Loan Details
  const [bank, setBank] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanType, setLoanType] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [Equity, setEquity] = useState("");

  // Step 3: Guarantor Info
  const [guarantorName1, setGuarantorName1] = useState("");
  const [guarantorPhone1, setGuarantorPhone1] = useState("");
  const [guarantorEmail1, setGuarantorEmail1] = useState("");

  const [guarantorName2, setGuarantorName2] = useState("");
  const [guarantorPhone2, setGuarantorPhone2] = useState("");
  const [guarantorEmail2, setGuarantorEmail2] = useState("");

  // Step 4: Document Upload and Memo
  const [document, setDocument] = useState(null);
  const [memo, setMemo] = useState("");

  const loanTypes = [
    { value: "Personal", label: "Personal" },
    { value: "Mortgage", label: "Mortgage" },
    { value: "Car Loan", label: "Car Loan" },
    { value: "Business Loan", label: "Business Loan" },
    { value: "Education Loan", label: "Education Loan" },
  ];

  // Step 1: Client options
  const clientOptions = dummyClients.map((client) => ({
    value: client.clientId,
    label: `${client.firstName} ${client.lastName}`,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (step === 1 && !clientId) {
      setError("Please select a client in Step 1.");
      return;
    }
    if (
      step === 2 &&
      (!bank ||
        !bankAccount ||
        !loanAmount ||
        !loanType ||
        !interestRate ||
        !loanPurpose ||
        !Equity)
    ) {
      setError("Please fill in all fields in Step 2.");
      return;
    }
    if (
      step === 3 &&
      (!guarantorName1 ||
        !guarantorPhone1 ||
        !guarantorEmail1 ||
        !guarantorName2 ||
        !guarantorPhone2 ||
        !guarantorEmail2)
    ) {
      setError("Please fill in all fields for both guarantors.");
      return;
    }
    if (step === 4 && !document) {
      setError("Please upload a document in Step 4.");
      return;
    }

    // Proceed to next step
    if (step < 4) {
      setError("");
      setStep(step + 1);
    } else {
      const newLoan = {
        LoanID: uuidv4(),
        clientId,
        clientName,
        bank,
        bankAccount,
        loanAmount: parseFloat(loanAmount),
        loanType,
        interestRate: parseFloat(interestRate),
        loanPurpose,
        Equity,
        guarantorName1,
        guarantorPhone1,
        guarantorEmail1,
        guarantorName2,
        guarantorPhone2,
        guarantorEmail2,
        document,
        memo,
        docNbr,
        date,
      };

      onAdd(newLoan);
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setClientId("");
    setClientName("");
    setBank("");
    setEquity("");
    setBankAccount("");
    setLoanAmount("");
    setLoanType("");
    setInterestRate("");
    setLoanPurpose("");
    setGuarantorName1("");
    setGuarantorName2("");
    setGuarantorEmail1("");
    setGuarantorEmail2("");
    setGuarantorPhone1("");
    setGuarantorPhone2("");
    setDocNbr(uuidv4()); // Reset DocNbr with new uuid
    setDate(new Date().toISOString().split("T")[0]); // Reset Date to current date

    setDocument(null);
    setMemo("");
    setStep(1);
    setError("");
  };

  return (
    <div className="p-4 max-h-95">
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-4 text-sm text-gray-600 ">
        <div>
          Document Number: <strong>{docNbr}</strong>
        </div>
        <div className="flex items-center gap-3">
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
            <h3 className="text-lg font-semibold mb-4">Step 1: Client Info</h3>
            <Select
              className="mb-4"
              placeholder="Select Client"
              options={clientOptions}
              isSearchable
              onChange={(selected) => {
                setClientId(selected.value);
                const client = dummyClients.find(
                  (c) => c.clientId === selected.value
                );
                setClientName(`${client.firstName} ${client.lastName}`);
              }}
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Step 2: Loan Details</h3>
            <div className="">
              <input
                className="mt-1 outline-0 focus:border-[#3D873B] block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Bank"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              />
              <input
                className="mt-1 outline-0 focus:border-[#3D873B] block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Bank Account"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
              />
              <input
                className="mt-1 outline-0 focus:border-[#3D873B] block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Loan Amount"
                value={loanAmount}
                type="number"
                onChange={(e) => setLoanAmount(e.target.value)}
              />
              <Select
                className="mt-1 outline-0 focus:border-[#3D873B]  w-full"
                placeholder="Loan Type"
                options={loanTypes}
                onChange={(selected) => setLoanType(selected.value)}
              />
              <input
                className="mt-1 outline-0 focus:border-[#3D873B] block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Interest Rate (%)"
                value={interestRate}
                type="number"
                onChange={(e) => setInterestRate(e.target.value)}
              />
              <input
                className="mt-1 outline-0 focus:border-[#3D873B] block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Equity Contribution (%)"
                value={Equity}
                type="number"
                onChange={(e) => setEquity(e.target.value)}
              />
              <input
                className="mt-1 outline-0 focus:border-[#3D873B] block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Loan Purpose"
                value={loanPurpose}
                onChange={(e) => setLoanPurpose(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Step 3: Guarantor Info
            </h3>

            {/* Guarantor 1 */}
            <h4 className="text-md font-medium mb-2">Guarantor 1</h4>
            <div className="mb-2">
              <input
                className="mt-1 outline-0 focus:border-[#3D873B] block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Guarantor Name"
                value={guarantorName1}
                onChange={(e) => setGuarantorName1(e.target.value)}
              />
              <input
                className="mt-1 outline-0 focus:border-[#3D873B] block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Guarantor Phone"
                value={guarantorPhone1}
                onChange={(e) => setGuarantorPhone1(e.target.value)}
              />
              <input
                className="mt-1 outline-0 focus:border-[#3D873B] block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Guarantor Email"
                value={guarantorEmail1}
                onChange={(e) => setGuarantorEmail1(e.target.value)}
              />
            </div>

            {/* Guarantor 2 */}
            <h4 className="text-md font-medium mt-4">Guarantor 2</h4>
            <div className="">
              <input
                className="mt-1 outline-0 focus:border-[#3D873B] block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Guarantor Name"
                value={guarantorName2}
                onChange={(e) => setGuarantorName2(e.target.value)}
              />
              <input
                className="mt-1 outline-0 focus:border-[#3D873B] block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Guarantor Phone"
                value={guarantorPhone2}
                onChange={(e) => setGuarantorPhone2(e.target.value)}
              />
              <input
                className="mt-1 outline-0 focus:border-[#3D873B] block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Guarantor Email"
                value={guarantorEmail2}
                onChange={(e) => setGuarantorEmail2(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Step 4: Document Upload and Memo
            </h3>
            <input
              type="file"
              className="mt-1 outline-0 text-[#3D873B] font-bold hover:text-white cursor-pointer hover:bg-[#3D873B] block w-full p-2 border border-gray-300 rounded-md"
              onChange={(e) => setDocument(e.target.files[0])}
            />
            <textarea
              className="mt-1 outline-0 focus:border-[#3D873B] block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-[#3D873B] cursor-pointer text-white rounded"
          >
            {step < 4 ? "Next" : "Submit Loan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLoan;
