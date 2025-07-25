"use client";
import React, { useEffect, useState } from "react";
import Table from "./Table";
import toast from "react-hot-toast";
import { MdModeEditOutline } from "react-icons/md";
import bankService from "@/Services/bankService";
import { FaTrash } from "react-icons/fa";
import dynamic from "next/dynamic";
const Select = dynamic(() => import("react-select"), {
  ssr: false,
  loading: () => (
    <div className="min-w-[200px] h-[42px] border border-gray-400 rounded-md"></div>
  ),
});
const Bank = () => {
  const [editIndex, setEditIndex] = useState(null);
  const [banks, setBanks] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    accountType: "",
    isActive: true,
  });

  // Fetch banks from your local API
  useEffect(() => {
    fetchBanks();
  }, []);

  // Fetch Nigerian banks from external API
  useEffect(() => {
    const fetchNigerianBanks = async () => {
      setIsLoadingBanks(true);
      try {
        const data = await bankService.getNigerianBanks();
        const options = data.map((bank) => ({
          value: bank.name,
          label: bank.name,
          logo: bank.logo,
        }));
        setBankOptions(options);
      } catch (err) {
        toast.error("Failed to fetch bank list");
      } finally {
        setIsLoadingBanks(false);
      }
    };

    fetchNigerianBanks();
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
      isActive: selected.isActive || true,
    });
    setEditIndex(index);
  };

  const handleDelete = async (id) => {
    try {
      await bankService.deleteBank(id);
      toast.success("Bank deleted successfully.");
      fetchBanks();
    } catch (error) {
      toast.error(error.message || "Failed to delete bank.");
    }
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

  const handleBankNameChange = (selectedOption, { action }) => {
    if (action === "select-option") {
      setFormData((prev) => ({
        ...prev,
        bankName: selectedOption.value,
      }));
    } else if (action === "input-change") {
      setInputValue(selectedOption);
    } else if (action === "clear") {
      setFormData((prev) => ({
        ...prev,
        bankName: "",
      }));
      setInputValue("");
    }
  };

  const handleInputBlur = () => {
    if (
      inputValue &&
      !bankOptions.some((option) => option.value === inputValue)
    ) {
      setFormData((prev) => ({
        ...prev,
        bankName: inputValue,
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

    const parsedisActive =
      formData.isActive === "true" || formData.isActive === true;

    const bankData = {
      ...formData,
      isActive: parsedisActive,
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
        isActive: true,
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
          <div className="min-w-[200px]">
            <Select
              options={bankOptions}
              value={
                formData.bankName
                  ? {
                      value: formData.bankName,
                      label: formData.bankName,
                    }
                  : null
              }
              onChange={handleBankNameChange}
              onInputChange={(value) => setInputValue(value)}
              onBlur={handleInputBlur}
              isClearable
              isSearchable
              placeholder="Search or type bank name"
              isLoading={isLoadingBanks}
              noOptionsMessage={() => "Type to enter a custom bank name"}
              formatOptionLabel={(bank, { context }) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                  {bank.logo && context === "menu" && (
                    <img
                      src={bank.logo}
                      alt={bank.label}
                      style={{
                        width: "20px",
                        height: "20px",
                        marginRight: "10px",
                      }}
                    />
                  )}
                  {bank.label}
                </div>
              )}
              className="basic-single"
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "42px",
                  borderColor: "#d1d5db",
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                  "&:hover": {
                    borderColor: "#3D873B",
                  },
                }),
              }}
            />
          </div>
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
              name="isActive"
              value={formData.isActive}
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
          bank.isActive === true || bank.isActive === "true" ? (
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
          <FaTrash
            size={20}
            key={bank.id || idx}
            onClick={() => handleDelete(bank.id)}
            className="hover:text-gray-500 text-red-500 cursor-pointer"
          />,
        ])}
      />
    </div>
  );
};

export default Bank;
