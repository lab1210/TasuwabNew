"use client";
import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import dummyLoans from "@/app/Loan/DummyLoan";
import { getSuppliers } from "@/Services/supplierService";
import Layout from "@/app/components/Layout";

const AddSupplierTransaction = () => {
  const router = useRouter();
  const [supplierInfo, setSupplierInfo] = useState(null);

  const [formData, setFormData] = useState({
    status: "Pending",
  });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [sendingBank, setSendingBank] = useState("");

  const supplierOptions = getSuppliers().map((s) => ({
    label: s.name,
    value: s.id,
  }));

  const tasuwabBanks = [
    {
      bank: "GTBank",
      accountNumber: "0123456789",
      accountName: "Tasuwab Ltd",
    },
    {
      bank: "Access Bank",
      accountNumber: "1234567890",
      accountName: "Tasuwab Ltd",
    },
    {
      bank: "UBA",
      accountNumber: "1122334455",
      accountName: "Tasuwab Ltd",
    },
  ];
  const sendingBankOptions = tasuwabBanks.map((acc) => ({
    label: `${acc.bank} - ${acc.accountNumber} (${acc.accountName})`,
    value: JSON.stringify(acc), // store full object as string
  }));

  useEffect(() => {
    if (selectedSupplier) {
      const loans = dummyLoans.filter(
        (loan) =>
          loan.Supplier === selectedSupplier.label && loan.status === "Approved"
      );
      setApprovedLoans(loans);
      setSelectedLoanId(null);

      // Get full supplier info from dummySuppliers
      const allSuppliers = getSuppliers(); // comes from supplierService
      const fullInfo = allSuppliers.find(
        (s) => s.name === selectedSupplier.label
      );
      setSupplierInfo(fullInfo || null);
    } else {
      setApprovedLoans([]);
      setSupplierInfo(null);
    }
  }, [selectedSupplier]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLoanId || !invoiceFile || !sendingBank) {
      toast.error("Please complete all required fields.");
      return;
    }

    // ⬇️ Parse the selected sending bank from string to object
    const selectedBank = JSON.parse(sendingBank);

    const transactionData = {
      ...formData,
      supplierId: selectedSupplier.value,
      loanId: selectedLoanId,
      invoiceFileName: invoiceFile.name,
      amount: approvedLoans.find((l) => l.loanId === selectedLoanId).assetPrice,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],

      // ✅ Use parsed bank details
      sendingBank: selectedBank.bank,
      sendingAccountNumber: selectedBank.accountNumber,
      sendingAccountName: selectedBank.accountName,

      supplierBank: supplierInfo?.bank,
      supplierAccountNumber: supplierInfo?.accountNumber,
      supplierAccountName: supplierInfo?.accountName,
    };

    console.log("Transaction Data:", transactionData);

    toast.success("Supplier transaction submitted!");
    router.push("/Supplier/Transactions");
  };

  return (
    <Layout>
      <div className=" mx-auto p-4 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-6">Add Supplier Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1">Select Supplier</label>
            <CreatableSelect
              isClearable
              placeholder="Select or type supplier name"
              options={supplierOptions}
              value={selectedSupplier}
              onChange={(option) => setSelectedSupplier(option)}
            />
            {supplierInfo && (
              <div className="mt-4 border p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Supplier Bank Info</h3>
                <p>
                  <strong>Bank:</strong> {supplierInfo.bank}
                </p>
                <p>
                  <strong>Account Number:</strong> {supplierInfo.accountNumber}
                </p>
                <p>
                  <strong>Account Name:</strong> {supplierInfo.accountName}
                </p>
              </div>
            )}
          </div>

          {approvedLoans.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-2">Approved Loans</h3>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-center">Loan ID</th>
                    <th className="p-2 text-center">Client</th>
                    <th className="p-2 text-center">Asset</th>
                    <th className="p-2 text-center">Quantity</th>
                    <th className="p-2 text-center">Amount</th>
                    <th className="p-2 text-center">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedLoans.map((loan) => (
                    <tr key={loan.loanId} className="border-t">
                      <td className="p-2 text-center">{loan.loanId}</td>
                      <td className="p-2 text-center">{loan.name}</td>
                      <td className="p-2 text-center">{loan.asset}</td>
                      <td className="p-2 text-center">{loan.assetQuantity}</td>
                      <td className="p-2 text-center">
                        ₦{Number(loan.assetPrice).toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="radio"
                          name="selectedLoan"
                          value={loan.loanId}
                          checked={selectedLoanId === loan.loanId}
                          onChange={() => setSelectedLoanId(loan.loanId)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedLoanId && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">
                  Upload Supplier Invoice
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => setInvoiceFile(e.target.files[0])}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Sending Bank</label>
                <select
                  value={sendingBank}
                  onChange={(e) => setSendingBank(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Select Bank</option>
                  {sendingBankOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="text-right">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 cursor-pointer"
            >
              Submit Transaction
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddSupplierTransaction;
