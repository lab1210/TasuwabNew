"use client";
import React, { useEffect, useState } from "react";
import Table from "./Table";
import { MdModeEditOutline } from "react-icons/md";
import useAccountService from "@/Services/accountService";

const DepositTypeConfiguration = () => {
  const { getAllAccountTypes, createAccountType, updateAccountType } =
    useAccountService();

  const [depositTypes, setDepositTypes] = useState([]);
  const [depositType, setDepositType] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await getAllAccountTypes();
        setDepositTypes(types);
      } catch (err) {
        console.error("Failed to fetch deposit types", err);
      }
    };

    fetchTypes();
  }, []);

  const clearForm = () => {
    setDepositType("");
    setDescription("");
    setCode("");
    setIsActive(true);
    setIsEditing(false);
  };

  const handleAddDepositType = async () => {
    if (!depositType || !code) return;

    const newType = {
      name: depositType,
      description,
      accountTypeCode: code,
      isActive,
    };

    try {
      setLoading(true);
      await createAccountType(newType);
      const updatedTypes = await getAllAccountTypes();
      setDepositTypes(updatedTypes);
      clearForm();
    } catch (err) {
      console.error("Failed to create deposit type", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (type) => {
    setCode(type.accountTypeCode);
    setDepositType(type.name);
    setDescription(type.description);
    setIsActive(type.isActive);
    setIsEditing(true);
  };

  const handleUpdateDepositType = async () => {
    if (!code) return;

    const updatedType = {
      name: depositType,
      description,
      isActive,
    };

    try {
      setLoading(true);
      await updateAccountType(code, updatedType);
      const refreshed = await getAllAccountTypes();
      setDepositTypes(refreshed);
      clearForm();
    } catch (err) {
      console.error("Failed to update deposit type", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h3 className="font-semibold text-[#333] mb-4">
        {isEditing ? "Edit Deposit Type" : "Add Deposit Type"}
      </h3>
      <div className="flex gap-3 items-end">
        <div className="flex gap-3">
          <input
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Deposit Type Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isEditing}
          />
          <input
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Deposit Type Name"
            value={depositType}
            onChange={(e) => setDepositType(e.target.value)}
          />
          <textarea
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {isEditing && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="status"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label
              htmlFor="status"
              className="text-sm font-medium text-gray-700"
            >
              Active
            </label>
          </div>
        )}
        <button
          className="bg-[#3D873B] text-white p-2 pl-5 pr-5 hover:bg-green-600 cursor-pointer rounded-md"
          onClick={isEditing ? handleUpdateDepositType : handleAddDepositType}
          disabled={loading}
        >
          {loading
            ? isEditing
              ? "Updating..."
              : "Adding..."
            : isEditing
            ? "Update"
            : "Add"}
        </button>
      </div>
      <Table
        headers={["Code", "Deposit Type", "Description", "Status", ""]}
        rows={depositTypes.map((dt) => [
          dt.accountTypeCode,
          dt.name,
          dt.description,
          dt.isActive ? (
            <p className="text-green-500 max-w-20 font-bold rounded-md bg-green-50 text-center p-1">
              Active
            </p>
          ) : (
            <p className="text-red-500 max-w-20 font-bold rounded-md bg-red-50 text-center p-1">
              InActive
            </p>
          ),
          <MdModeEditOutline
            key={dt.accountTypeCode}
            size={22}
            className="hover:text-gray-500 cursor-pointer"
            onClick={() => handleEditClick(dt)}
          />,
        ])}
      />
    </div>
  );
};

export default DepositTypeConfiguration;
