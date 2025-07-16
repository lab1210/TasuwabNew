"use client";
import chargeService from "@/Services/chargeService";
import React, { useEffect, useState } from "react";
import Table from "./Table";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const Charges = () => {
  const [loading, setLoading] = useState(false);
  const [chargeCodes, setchargeCodes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setformData] = useState({
    code: "",
    name: "",
    description: "",
    amount: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchChargeCodes = async () => {
      try {
        const response = await chargeService.getChargeCodes();
        setchargeCodes(
          Array.isArray(response?.items)
            ? response.items
            : Array.isArray(response)
            ? response
            : []
        );
      } catch (err) {
        toast.error(err?.message || "Failed to load charge codes");
        setchargeCodes([]); // Reset to empty array on error
      }
    };

    fetchChargeCodes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setformData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const clearForm = () => {
    setformData({
      code: "",
      name: "",
      description: "",
      amount: "",
      isActive: true,
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
      toast.error("Charge Code, Name, Description and Amount are required");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        amount: formData.amount,
      };

      if (isEditing) {
        await chargeService.updateChargeCode(formData.code, payload);
        toast.success("Charge code updated successfully");
      } else {
        await chargeService.createChargeCode(payload);
        toast.success("Charge code added successfully");
      }

      const updatedTypes = await chargeService.getChargeCodes();
      setchargeCodes(Array.isArray(updatedTypes) ? updatedTypes : []);

      setchargeCodes(updatedTypes);
      clearForm();
    } catch (err) {
      toast.error(err?.message || "Failed to process charge code");
      console.error("Failed to process charge code", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (type) => {
    setformData({
      code: type.code,
      name: type.name,
      description: type.description,
      isActive: type.isActive,
      amount: type.amount,
    });
    setIsEditing(true);
  };

  const handleDelete = async (code) => {
    if (!window.confirm("Are you sure you want to delete this charge code?")) {
      return;
    }

    try {
      setDeletingId(code); // Set the ID of the item being deleted
      await chargeService.deleteChargeCode(code);
      toast.success("Charge code deleted successfully");
      const refreshedTypes = await chargeService.getChargeCodes(); // Refresh the table after delete
      setchargeCodes(Array.isArray(refreshedTypes) ? refreshedTypes : []);
    } catch (err) {
      toast.error(
        err.response?.data?.message || " Failed to delete charge code"
      );
    } finally {
      setDeletingId(null); // Reset deleting state
    }
  };
  return (
    <div className="p-6">
      <div className="flex flex-col mb-4">
        <h3 className="font-bold text-[#333] ">
          {isEditing ? "Edit Charges" : "Add Charges"}
        </h3>
        <p className="text-sm text-gray-500">
          <span className="italic">
            for your transaction types (e.g. withdrawal,deposit,....){" "}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col  gap-3 ">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 w-full">
          <input
            name="code"
            type="text"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Charge Code"
            value={formData.code}
            onChange={handleInputChange}
            disabled={isEditing}
            required
          />
          <input
            name="name"
            type="text"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Charge Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="amount"
            min={0}
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Charge Amount"
            value={formData.amount}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            className="border w-full border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            rows={1}
          />

          {isEditing && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="status"
                name="isActive"
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
        headers={["Code", "Charge Name", "Description", "Amount", "Status", ""]}
        rows={chargeCodes.map((dt) => [
          dt.code,
          dt.name,
          dt.description,
          dt.amount.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
          }),
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

export default Charges;
