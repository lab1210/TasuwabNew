"use client";
import React, { useEffect, useState } from "react";
import Table from "./Table";
import toast from "react-hot-toast";
import { MdModeEditOutline } from "react-icons/md";
import bankService from "@/Services/bankService";

const Bank = () => {
  const [editIndex, setEditIndex] = useState(null);
  const [banks, setBanks] = useState([]);
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    accountType: "",
    status: true,
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const data = await bankService.getBank();
      setBanks(data);
    } catch (err) {
      toast.error("Failed to fetch banks. Please try again later.");
    }
  };

  const handleEdit = (index) => {
    const selected = banks[index];
    setFormData({
      bankName: selected.bankName,
      accountNumber: selected.accountNumber,
      accountName: selected.accountName,
      accountType: selected.accountType,
      status: selected.status || true,
    });
    setEditIndex(index);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "accountNumber") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: digitsOnly,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddBank = async () => {
    if (
      !formData.bankName ||
      !formData.accountNumber ||
      !formData.accountName
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const parsedStatus = formData.status === "true" || formData.status === true;

    const bankData = {
      ...formData,
      status: parsedStatus,
    };

    try {
      if (editIndex !== null) {
        const id = banks[editIndex]?.id;
        await bankService.editBank(id, bankData);
        toast.success("Bank updated successfully.");
      } else {
        await bankService.addBank(bankData);
        toast.success("Bank added successfully.");
      }
      setFormData({
        bankName: "",
        accountNumber: "",
        accountName: "",
        accountType: "",
        status: true,
      });
      setEditIndex(null);
      fetchBanks();
    } catch (error) {
      toast.error(error.message || "Failed to submit bank data.");
    }
  };

  return (
    <div className="p-6">
      <h3 className="font-semibold text-[#333] mb-4">Add Bank Account</h3>
      <div className="flex gap-3 items-end">
        <div className="flex gap-3 flex-wrap">
          <input
            name="bankName"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Bank Name"
            value={formData.bankName}
            onChange={handleChange}
          />
          <input
            name="accountNumber"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Account Number"
            value={formData.accountNumber}
            onChange={handleChange}
          />
          <input
            name="accountName"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Account Name"
            value={formData.accountName}
            onChange={handleChange}
          />
          <select
            name="accountType"
            value={formData.accountType}
            onChange={handleChange}
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          >
            <option value="">Select Account Type</option>
            <option value="Savings">Savings</option>
            <option value="Current">Current</option>
          </select>
          {editIndex !== null && (
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          )}
        </div>
        <button
          className="bg-[#3D873B] text-white p-2 pl-5 pr-5 hover:bg-green-600 cursor-pointer rounded-md"
          onClick={handleAddBank}
        >
          {editIndex !== null ? "Update" : "Add"}
        </button>
      </div>
      <Table
        headers={[
          "Bank Name",
          "Account Number",
          "Account Name",
          "Account Type",
          "Status",
          "",
        ]}
        rows={banks.map((bank, idx) => [
          bank.bankName,
          bank.accountNumber,
          bank.accountName,
          bank.accountType,
          bank.status === true || bank.status === "true" ? (
            <p className="text-green-500 max-w-20 font-bold rounded-md bg-green-50 text-center p-1">
              Active
            </p>
          ) : (
            <p className="text-red-500 max-w-20 font-bold rounded-md bg-red-50 text-center p-1">
              Inactive
            </p>
          ),
          <MdModeEditOutline
            key={bank.id || idx}
            size={22}
            className="hover:text-gray-500 cursor-pointer"
            onClick={() => handleEdit(idx)}
          />,
        ])}
      />
    </div>
  );
};

export default Bank;
