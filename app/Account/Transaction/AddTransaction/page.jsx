"use client";
import Layout from "@/app/components/Layout";
import useAccountService from "@/Services/accountService";
import { useAuth } from "@/Services/authService";
import branchService from "@/Services/branchService";
import transactionService from "@/Services/transactionService";
import transactionTypeService from "@/Services/transTypeService";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaFileUpload, FaTimes } from "react-icons/fa";
import Select from "react-select";

const AddTransaction = () => {
  const { user } = useAuth();
  const [branchName, setBranchName] = useState("");

  const [formData, setFormData] = useState({
    Reference: "",
    AccountCode: "",
    TransactionCode: "",
    Amount: 0,
    Narration: "",
    PerformedBy: user?.StaffCode || "",
    BranchId: user?.BranchCode || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [TransactionDocument, setTransactionDocument] = useState(null);
  const docsInputRef = useRef(null);
  const router = useRouter();
  const [transactionType, setTransactionType] = useState([]);
  const [Accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        BranchId: user?.BranchCode || "",
        PerformedBy: user?.StaffCode || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchBranchName = async () => {
      if (formData.BranchId) {
        try {
          const data = await branchService.getBranchById(
            Number(formData.BranchId)
          );
          setBranchName(data?.name || formData.BranchId); // Fallback to branch code if name not found
        } catch (error) {
          console.error("Error fetching branch name:", error);
          setBranchName(formData.BranchId); // Fallback to branch code on error
        }
      }
    };

    fetchBranchName();
  }, [formData.BranchId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accounts, transactionTypes] = await Promise.all([
          useAccountService.getAllAccounts(),
          transactionTypeService.getAlltransactionTypes(),
        ]);
        const activeAccounts = accounts.filter(
          (account) => account.isActive === true
        );
        setAccounts(activeAccounts);
        setTransactionType(transactionTypes);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data");
      }
    };
    fetchData();
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes

      if (!validTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and PDF files are allowed");
        setTransactionDocument(null);
        if (docsInputRef.current) {
          docsInputRef.current.value = "";
        }
        return;
      }

      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        setTransactionDocument(null);
        if (docsInputRef.current) {
          docsInputRef.current.value = "";
        }
        return;
      }

      // If validation passes
      setTransactionDocument(file);
    }
  };

  const handleRemoveDocument = () => {
    setTransactionDocument(null);
    if (docsInputRef.current) {
      docsInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.AccountCode) {
      toast.error("Please select an account");
      return;
    }
    if (!formData.TransactionCode) {
      toast.error("Please select a transaction type");
      return;
    }
    if (
      !formData.Amount ||
      isNaN(formData.Amount) ||
      Number(formData.Amount) <= 0
    ) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Append all fields with proper type conversion
      formDataToSend.append("Reference", formData.Reference || "");
      formDataToSend.append("AccountCode", formData.AccountCode);
      formDataToSend.append("TransactionCode", formData.TransactionCode);
      formDataToSend.append("Narration", formData.Narration || "");
      formDataToSend.append("PerformedBy", formData.PerformedBy || "");
      formDataToSend.append("Amount", parseFloat(formData.Amount).toString());
      formDataToSend.append("BranchId", parseInt(formData.BranchId).toString());

      if (TransactionDocument) {
        formDataToSend.append("DocumentFile", TransactionDocument);
      }

      // Debug: Log the actual payload
      console.log(
        "Transaction payload:",
        Object.fromEntries(formDataToSend.entries())
      );

      await transactionService.createTransaction(formDataToSend);

      toast.success("Transaction created successfully");
      // Reset form
      setFormData({
        Reference: "",
        AccountCode: "",
        TransactionCode: "",
        Amount: "",
        Narration: "",
        PerformedBy: user?.StaffCode || "",
        BranchId: user?.BranchCode || "",
      });
      setTransactionDocument(null);
      router.push("/Account/Transaction");
    } catch (error) {
      console.error("Transaction submission error:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Layout>
      <div className="w-full">
        <div>
          <p className="text-4xl font-extrabold mb-2">Post Transaction</p>
          <p className="text-sm text-gray-600">
            Fill in the form below to post a new transaction.
          </p>
        </div>
        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="mt-6 mb-5">
            <h3 className="text-sm font-semibold mb-3">Transaction Document</h3>
            <div className="border border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                ref={docsInputRef}
                onChange={handleDocumentUpload}
                multiple
                className="hidden"
                id="DocumentFile"
              />
              <label
                htmlFor="DocumentFile"
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <FaFileUpload className="text-[#3D873B] text-3xl mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold text-[#3D873B]">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG (MAX. 5MB each)
                </p>
              </label>

              {/* Uploaded Documents List */}
              {TransactionDocument && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">
                    Selected Documents:
                  </h4>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm truncate max-w-xs">
                      {TransactionDocument.name}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveDocument}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="TransactionCode">
                Transaction Type <span className="text-red-500">*</span>
              </label>
              <select
                type="text"
                name="TransactionCode"
                value={formData.TransactionCode}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
              >
                <option value="" disabled>
                  Select Transaction Type
                </option>
                {transactionType.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="AccountCode">
                Account <span className="text-red-500">*</span>
              </label>
              <Select
                isClearable
                isSearchable
                required
                placeholder="Select Account"
                noOptionsMessage={() => "No account found"}
                options={Accounts.map((c) => ({
                  label: `${c.accountName} ${c.accountCode}`,
                  value: c.accountCode, // Make sure this is the string value you want
                }))}
                value={
                  Accounts.find((c) => c.accountCode === formData.AccountCode)
                    ? {
                        label: `${
                          Accounts.find(
                            (c) => c.accountCode === formData.AccountCode
                          ).accountName
                        } 
               ${formData.AccountCode}`,
                        value: formData.AccountCode,
                      }
                    : null
                }
                onChange={(selected) => {
                  setFormData({
                    ...formData,
                    AccountCode: selected ? selected.value : "", // This will be the string value
                  });
                }}
                classNamePrefix="select"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "42px",
                    borderColor: "#d1d5db",
                    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                    "&:hover": {
                      borderColor: "#3D873B",
                      borderWidth: "2px",
                    },
                  }),
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="Amount">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                name="Amount"
                value={formData.Amount}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="Narration">
                Narration <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Narration"
                value={formData.Narration}
                required
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="Reference">
                Reference
              </label>
              <input
                type="text"
                name="Reference"
                value={formData.Reference}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="Reference">
                Created By<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="PerformedBy"
                value={formData.PerformedBy}
                disabled
                className="w-full p-2  rounded bg-[#3D873B]/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="BranchId">
                Branch<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="BranchId"
                value={branchName}
                disabled
                className="w-full p-2  rounded bg-[#3D873B]/20"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => router.push("/Account/Transaction")}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#3D873B] cursor-pointer text-white rounded hover:bg-green-700 disabled:bg-green-400"
            >
              {isSubmitting ? "Processing..." : "Post Transaction"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddTransaction;
