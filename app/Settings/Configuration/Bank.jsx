"use client";

import React, { useState } from "react";
import Table from "./Table";
import toast from "react-hot-toast";
import { MdModeEditOutline } from "react-icons/md";

const Bank = () => {
  const [editIndex, setEditIndex] = useState(null);
  const [banks, setBanks] = useState([
    {
      bank_name: "First Bank",
      account_number: "1234567890",
      account_name: "Tasuwab 1",
      account_type: "Current",
      status: true,
    },
    {
      bank_name: "GTBank",
      account_number: "9876543210",
      account_name: "Tasuwab 2",
      account_type: "Savings",
      status: false,
    },
  ]);
  const [formData, setFormData] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
    account_type: "",
    status: true,
  });

  const handleEdit = (index) => {
    const selected = banks[index];
    setFormData({
      bank_name: selected.bank_name,
      account_number: selected.account_number,
      account_name: selected.account_name,
      account_type: selected.account_type,
      status: selected.status || true,
    });
    setEditIndex(index);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "account_number") {
      // Only allow digits
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

  const handleAddBank = () => {
    if (
      !formData.bank_name ||
      !formData.account_number ||
      !formData.account_name
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const parsedStatus = formData.status === "true" || formData.status === true;

    const bankData = {
      ...formData,
      status: parsedStatus,
    };

    if (editIndex !== null) {
      // Editing existing
      const updatedBanks = [...banks];
      updatedBanks[editIndex] = bankData;
      setBanks(updatedBanks);
      toast.success("Bank details updated.");
      setEditIndex(null);
    } else {
      // Adding new
      setBanks((prev) => [...prev, bankData]);
      toast.success("Bank added.");
    }

    // Reset form
    setFormData({
      bank_name: "",
      account_number: "",
      account_name: "",
      account_type: "",
      status: true,
    });
  };

  return (
    <div className="p-6">
      <h3 className="font-semibold text-[#333] mb-4">Add Bank Account</h3>
      <div className="flex gap-3 items-end">
        <div className="flex gap-3">
          <input
            name="bank_name"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Bank Name"
            value={formData.bank_name}
            onChange={handleChange}
          />
          <input
            name="account_number"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Account Number"
            value={formData.account_number}
            onChange={handleChange}
          />
          <input
            name="account_name"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Account Name"
            value={formData.account_name}
            onChange={handleChange}
          />
          <select
            name="account_type"
            value={formData.account_type}
            onChange={handleChange}
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          >
            <option value="">Select Account Type</option>
            <option value="Savings">Savings</option>
            <option value="Current">Current</option>
          </select>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
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
          bank.bank_name,
          bank.account_number,
          bank.account_name,
          bank.account_type,
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
            key={bank.account_number}
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
