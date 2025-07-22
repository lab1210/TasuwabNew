"use client";

import React, { useState, useEffect } from "react";
import Table from "./Table";
import InterestService from "@/Services/InterestService";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import formatDate from "@/app/components/formatdate";
import toast from "react-hot-toast";

const DepositInterestTableConfiguration = () => {
  const [interestTypes, setInterestTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Track which item is being deleted
  const [fetching, setFetching] = useState(true);
  const [formData, setformData] = useState({
    code: "",
    name: "",
    description: "",
    amount: "",
    isActive: true,
    frequencyDays: "",
  });

  useEffect(() => {
    const fetchInterest = async () => {
      try {
        setFetching(true);
        const response = await InterestService.getInterestTypes();

        // Ensure response is an array
        const types = Array.isArray(response) ? response : [];
        setInterestTypes(types);
        console.log("Interest types fetched", types);
      } catch (err) {
        toast.error("Failed to load Interest types");
        setInterestTypes([]); // Set empty array on error
      } finally {
        setFetching(false);
      }
    };

    fetchInterest();
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
      frequencyDays: "",
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.code ||
      !formData.name ||
      !formData.description ||
      !formData.amount ||
      !formData.frequencyDays
    ) {
      toast.error(
        "Code, Name, Description, interest rate and frequency days are required"
      );
      return;
    }

    try {
      setLoading(true);
      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        amount: Number(formData.amount),
        frequencyDays: formData.frequencyDays,
      };

      if (isEditing) {
        await InterestService.updateInterestType(formData.code, payload);
        toast.success("Interest type updated successfully");
      } else {
        await InterestService.createInterestType(payload);
        toast.success("Interest Type added");
      }
      const updatedTypes = await InterestService.getInterestTypes();
      setInterestTypes(Array.isArray(updatedTypes) ? updatedTypes : []);

      clearForm();
    } catch (err) {
      console.error("Failed to process interest type", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (type) => {
    setformData({
      code: type.code,
      name: type.name,
      description: type.description,
      amount: type.amount,
      isActive: type.isActive,
      frequencyDays: type.frequencyDays,
    });
    setIsEditing(true);
  };

  const handleDelete = async (code) => {
    if (
      !window.confirm("Are you sure you want to delete this interest type?")
    ) {
      return;
    }

    try {
      setDeletingId(code); // Set the ID of the item being deleted
      await InterestService.deleteInterestType(code);
      toast.success("Interest type deleted successfully");
      const refreshedTypes = await InterestService.getInterestTypes();
      setInterestTypes(Array.isArray(refreshedTypes) ? refreshedTypes : []);
    } catch (err) {
      console.error("Failed to delete interest type", err);
      toast.error(err.response?.data?.message || "Delete operation failed");
    } finally {
      setDeletingId(null); // Reset deleting state
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col mb-4">
        <h3 className="font-bold text-[#333]">Add Interest Types</h3>
        <p className="text-sm text-gray-500">
          for your Deposit Types ({" "}
          <span className="italic">Savings, Current,...</span>)
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col  gap-3 ">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 w-full">
          <input
            type="text"
            name="code"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Interest Type Code"
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
            type="text"
            name="name"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Interest Type Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="amount"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Interest Rate (%)"
            value={formData.amount}
            onChange={handleInputChange}
            required
            min={0}
          />
          <input
            type="number"
            name="frequencyDays"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Frequency in days"
            value={formData.frequencyDays}
            onChange={handleInputChange}
            required
            min={1}
            title="Frequency Days must be 1 or greater"
          />
          <textarea
            name="description"
            className="border  border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
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
                htmlFor="isActive"
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
      {fetching ? (
        <div className="text-center py-4">Loading interest types...</div>
      ) : (
        <Table
          headers={[
            "Code",
            "Name",
            "Description",
            "Interest %",
            "Frequency Days",
            "Status",
            "Created Date",
            "Updated Date",
            "", // Edit column
            "", // Delete column
          ]}
          rows={interestTypes.map((dt) => [
            dt.code,
            dt.name,
            dt.description,
            dt.amount,
            dt.frequencyDays,

            dt.isActive ? (
              <p className="text-green-500 max-w-20 font-bold rounded-md bg-green-50 text-center p-1">
                Active
              </p>
            ) : (
              <p className="text-red-500 max-w-20 font-bold rounded-md bg-red-50 text-center p-1">
                InActive
              </p>
            ),
            formatDate(dt.createdAt),
            formatDate(dt.updatedAt),
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
      )}
    </div>
  );
};

export default DepositInterestTableConfiguration;
