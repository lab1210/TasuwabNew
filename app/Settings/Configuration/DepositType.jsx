"use client";
import React, { useEffect, useState } from "react";
import Table from "./Table";
import { MdModeEditOutline } from "react-icons/md";
import accountTypeService from "@/Services/accountTypeService";
import { FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const DepositTypeConfiguration = () => {
  const [loading, setLoading] = useState(false);
  const [depositTypes, setDepositTypes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Track which item is being deleted

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    minimumBalance: "",
    maximumBalance: "",
    status: true,
  });

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await accountTypeService.getAllAccountTypes();
        setDepositTypes(types);
      } catch (err) {
        console.error("Failed to fetch deposit types", err);
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
      minimumBalance: "",
      maximumBalance: "",
      status: true,
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.code ||
      !formData.name ||
      !formData.description ||
      !formData.maximumBalance
    ) {
      toast.error(
        "Deposit Type Code, Name, Description and Maximum Balance are required"
      );
      return;
    }

    try {
      setLoading(true);
      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        minimumBalance: Number(formData.minimumBalance),
        maximumBalance: Number(formData.maximumBalance),
      };

      if (isEditing) {
        await accountTypeService.updateAccountType("A", payload, formData.code);
      } else {
        await accountTypeService.addAccountType(payload);
      }

      const updatedTypes = await accountTypeService.getAllAccountTypes();
      setDepositTypes(updatedTypes);
      clearForm();
    } catch (err) {
      console.error("Failed to process deposit type", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (type) => {
    setFormData({
      code: type.code,
      name: type.name,
      description: type.description,
      minimumBalance: type.minimumBalance,
      maximumBalance: type.maximumBalance,
      status: type.status,
    });
    setIsEditing(true);
  };

  const handleDelete = async (code) => {
    if (!window.confirm("Are you sure you want to delete this deposit type?")) {
      return;
    }

    try {
      setDeletingId(code); // Set the ID of the item being deleted
      await accountTypeService.deleteAccountType(code, "A");
      toast.success("Deposit type deleted successfully");
      await accountTypeService.getAllAccountTypes(); // Refresh the table after delete
    } catch (err) {
      console.error("Failed to delete deposit type", err);
      toast.error(err.response?.data?.message || "Delete operation failed");
    } finally {
      setDeletingId(null); // Reset deleting state
    }
  };

  return (
    <div className="p-6">
      <h3 className="font-semibold text-[#333] mb-4">
        {isEditing ? "Edit Deposit Type" : "Add Deposit Type"}
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col  gap-3 ">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 w-full">
          <input
            name="code"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Deposit Type Code"
            value={formData.code}
            onChange={handleInputChange}
            disabled={isEditing}
            required
            minLength={3}
            maxLength={5}
            pattern=".{3,5}" // This ensures the length is between 3-5 characters
            title="Code must be between 3 and 5 characters"
          />
          <input
            name="name"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Deposit Type Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            name="minimumBalance"
            type="number"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Minimum Balance"
            value={formData.minimumBalance}
            onChange={handleInputChange}
          />
          <input
            name="maximumBalance"
            type="number"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Maximum Balance"
            value={formData.maximumBalance}
            onChange={handleInputChange}
          />
          <textarea
            name="description"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
          />

          {isEditing && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="status"
                name="status"
                checked={formData.status}
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
          "Deposit Type",
          "Description",
          "Min Balance",
          "Max Balance",
          "Status",
          "",
        ]}
        rows={depositTypes.map((dt) => [
          dt.code,
          dt.name,
          dt.description,
          dt.minimumBalance.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
          }),
          dt.maximumBalance.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
          }),
          dt.status ? (
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
          <button
            key={`delete-${dt.code}`}
            disabled={deletingId === dt.code}
            onClick={() => handleDelete(dt.code)}
          >
            <FaTrash
              size={20}
              className={`${
                deletingId === dt.code
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-red-500 hover:text-red-600 cursor-pointer"
              }`}
            />
          </button>,
        ])}
      />
    </div>
  );
};

export default DepositTypeConfiguration;
