"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const RepaymentModal = ({ loan, onClose }) => {
  const expecttorepay =
    (loan.loanAmount === "NA" ? loan.minimumAssetPrice : loan.loanAmount) /
    loan.InstallmentPeriod;

  const [formData, setFormData] = useState({
    loanID: loan.loanId,
    DocNbr: "",
    RepaymentDate: "",
    date: new Date().toISOString().slice(0, 10),
    Repaidamount: expecttorepay,
    amountRemaining:
      loan.loanAmount === "NA" ? loan.minimumAssetPrice : loan.loanAmount,
    MonthsRemaining: loan.InstallmentPeriod,
  });

  useEffect(() => {
    const repaid = parseFloat(formData.Repaidamount) || 0;
    const remaining =
      (loan.loanAmount === "NA" ? loan.minimumAssetPrice : loan.loanAmount) -
      repaid;
    const months =
      ((loan.loanAmount === "NA" ? loan.minimumAssetPrice : loan.loanAmount) -
        repaid) /
      expecttorepay;

    setFormData((prev) => ({
      ...prev,
      amountRemaining: remaining,
      MonthsRemaining:
        repaid === "" || repaid === 0 ? loan.InstallmentPeriod : months,
    }));
  }, [
    formData.Repaidamount,
    loan.loanAmount === "NA" ? loan.minimumAssetPrice : loan.loanAmount,
    loan.InstallmentPeriod,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.Repaidamount >
      (loan.loanAmount === "NA" ? loan.minimumAssetPrice : loan.loanAmount)
    ) {
      toast.error("Amount Repaid cannot be greater than Loan Amount");
    } else {
      console.log("Repayment Data:", formData);
      loan.status = "Active";
      toast.success("Repayment submitted successfully!");
      onClose(); // Close modal after submission
    }
    // Perform submission logic here
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/90 bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white w-1/3 rounded-sm shadow-md relative">
        <div className="p-5">
          <div className="text-center mb-5">
            <h1 className="text-xl font-extrabold">Repayment</h1>
            <p className="text-sm text-gray-500">Document repaid loans here</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex justify-between">
              <label className="font-semibold">Date:</label>
              <span className="text-gray-500">{formData.date}</span>
            </div>
            <div className="flex justify-between">
              <label className="font-semibold">DocNbr:</label>
              <input
                type="text"
                name="DocNbr"
                value={formData.DocNbr}
                onChange={handleChange}
                className="border-b  px-2 py-1 placeholder:text-sm "
                placeholder="input transaction number"
                required
              />
            </div>
            <div className="flex justify-between">
              <label className="font-semibold">Repayment Date:</label>
              <input
                type="date"
                name="RepaymentDate"
                value={formData.RepaymentDate}
                onChange={handleChange}
                className="border-b  px-2 py-1 placeholder:text-sm "
                required
              />
            </div>
            <div className="flex justify-between">
              <label className="font-semibold">Name:</label>
              <span className="text-gray-500">{loan.name}</span>
            </div>
            <div className="flex justify-between">
              <label className="font-semibold">Repayment Period:</label>
              <span className="text-gray-500">
                {loan.InstallmentPeriod} months
              </span>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">Amount Repaid:</label>
              <input
                type="number"
                step={100}
                name="Repaidamount"
                value={formData.Repaidamount}
                onChange={handleChange}
                className="border px-2 py-1 rounded"
                required
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Expected Amount:</span>
              <span>
                ₦
                {Number(
                  loan.loanAmount === "NA"
                    ? loan.minimumAssetPrice
                    : loan.loanAmount
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Remaining Amount:</span>
              <span>₦{Number(formData.amountRemaining).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Months Remaining:</span>
              <span>{formData.MonthsRemaining}</span>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit Repayment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RepaymentModal;
