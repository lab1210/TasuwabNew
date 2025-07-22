"use client";
import React, { useState, useEffect } from "react";
import Table from "./Table";
import toast from "react-hot-toast";
import LoanTypeService from "@/Services/loanTypeService";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrash } from "react-icons/fa";

const LoanTypeConfiguration = () => {
  const [loading, setLoading] = useState(false);
  const [loanTypes, setloanTypes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Track which item is being deleted

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
    amount: "",
  });

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await LoanTypeService.getLoanTypes();
        setloanTypes(Array.isArray(response) ? response : []);
      } catch (err) {
        toast.error("Failed to fetch Loan types", err);
      }
    };

    fetchTypes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const clearForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      isActive: true,
      amount: "",
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.code ||
      !formData.name ||
      !formData.description ||
      !formData.amount
    ) {
      toast.error("Loan Type Code, Name, Description  and amount are required");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        amount: Number(formData.amount),
        isActive: formData.isActive,
      };
      console.log("Final payload:", payload);

      if (isEditing) {
        await LoanTypeService.updateLoanType(formData.code, payload);
        toast.success("Loan type updated successfully");
      } else {
        await LoanTypeService.createLoanType(payload);
        toast.success("Loan type added successfully");
      }
      const updatedTypes = await LoanTypeService.getLoanTypes();
      setloanTypes(Array.isArray(updatedTypes) ? updatedTypes : []);

      clearForm();
    } catch (err) {
      console.error("Failed to process Loan type", err);
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (type) => {
    setFormData({
      code: type.code,
      name: type.name,
      description: type.description,
      amount: type.amount,
      isActive: type.isActive,
    });
    setIsEditing(true);
  };

  const handleDelete = async (code) => {
    if (!window.confirm("Are you sure you want to delete this Loan type?")) {
      return;
    }

    try {
      setDeletingId(code); // Set the ID of the item being deleted
      await LoanTypeService.deleteLoanType(code);
      toast.success("Loan type deleted successfully");
      const refreshedTypes = await LoanTypeService.getLoanTypes();
      setloanTypes(Array.isArray(refreshedTypes) ? refreshedTypes : []);
    } catch (err) {
      console.error("Failed to delete Loan type", err);
      toast.error(err.response?.data?.message || "Delete operation failed");
    } finally {
      setDeletingId(null); // Reset deleting state
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col mb-4">
        <h3 className="font-bold text-[#333] ">
          {isEditing ? "Edit Loan Type" : "Add Loan Type"}
        </h3>
        <p className="text-sm text-gray-500">
          ( <span className="italic">Asset Financing, Car Loans,... </span>)
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col  gap-3 ">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 w-full">
          <input
            name="code"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Loan Type Code"
            value={formData.code}
            onChange={handleInputChange}
            disabled={isEditing}
            required
          />
          <input
            name="name"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Loan Type Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="amount"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Equity Contribution %"
            value={formData.amount}
            onChange={handleInputChange}
            required
          />

          <textarea
            name="description"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            rows={1}
            required
          />
          {isEditing && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="status"
                name="status"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              <label
                htmlFor="status"
                className="text-sm font-medium text-gray-700"
              >
                Active
              </label>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className="bg-[#3D873B] text-white p-2 pl-5 pr-5 hover:bg-green-600 cursor-pointer rounded-md"
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

          {isEditing && (
            <button
              type="button"
              onClick={clearForm}
              className="bg-gray-500 text-white p-2 pl-5 pr-5 hover:bg-gray-600 cursor-pointer rounded-md"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <Table
        headers={[
          "Code",
          "Loan Type",
          "Equity Contribution ",
          "Description",
          "Status",
          "",
          "",
        ]}
        rows={loanTypes.map((dt) => [
          dt.code,
          dt.name,
          dt.amount + "%",
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
            key={dt.code}
            size={22}
            className="hover:text-gray-500 cursor-pointer"
            onClick={() => handleEditClick(dt)}
          />,
          // <button
          //   key={`delete-${dt.code}`}
          //   disabled={deletingId === dt.code}
          //   onClick={() => handleDelete(dt.code)}
          // >
          //   <FaTrash
          //     size={20}
          //     className={`${
          //       deletingId === dt.code
          //         ? "text-gray-400 cursor-not-allowed"
          //         : "text-red-500 hover:text-red-600 cursor-pointer"
          //     }`}
          //   />
          // </button>,
        ])}
      />
    </div>
  );
};

export default LoanTypeConfiguration;
