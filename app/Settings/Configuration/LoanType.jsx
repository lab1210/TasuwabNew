"use client";

import React, { useState, useEffect } from "react";
import Table from "./Table";
import loanService from "@/Services/loanService";
import toast from "react-hot-toast";

const LoanTypeConfiguration = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    equityContribution: "",
  });
  const [loanTypes, setLoanTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLoanType, setCurrentLoanType] = useState(null);

  // Fetch loan types on component mount
  useEffect(() => {
    fetchLoanTypes();
  }, []);

  const fetchLoanTypes = async () => {
    try {
      setIsLoading(true);
      const response = await loanService.getAllLoanTypes();
      setLoanTypes(response.data);
    } catch (error) {
      toast.error("Failed to fetch loan types");
      console.error("Error fetching loan types:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddLoanType = async () => {
    if (!formData.code || !formData.name) {
      toast.error("Loan Type Code and Name are required");
      return;
    }

    try {
      setIsLoading(true);
      await loanService.createLoanType({
        code: formData.code,
        name: formData.name,
        description: formData.description,
        equityContribution: Number(formData.equityContribution) || 0,
      });

      toast.success("Loan type created successfully");
      fetchLoanTypes(); // Refresh the list
      resetForm();
    } catch (error) {
      toast.error(error.message || "Failed to create loan type");
      console.error("Error creating loan type:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLoanType = (loanType) => {
    setIsEditing(true);
    setCurrentLoanType(loanType);
    setFormData({
      code: loanType.code,
      name: loanType.name,
      description: loanType.description,
      equityContribution: loanType.equityContribution,
    });
  };

  const handleUpdateLoanType = async () => {
    if (!formData.code || !formData.name) {
      toast.error("Loan Type Code and Name are required");
      return;
    }

    try {
      setIsLoading(true);
      await loanService.updateLoanType(currentLoanType.code, {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        equityContribution: Number(formData.equityContribution) || 0,
      });

      toast.success("Loan type updated successfully");
      fetchLoanTypes(); // Refresh the list
      resetForm();
      setIsEditing(false);
      setCurrentLoanType(null);
    } catch (error) {
      toast.error(error.message || "Failed to update loan type");
      console.error("Error updating loan type:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLoanType = async (loanTypeCode) => {
    if (!window.confirm("Are you sure you want to delete this loan type?")) {
      return;
    }

    try {
      setIsLoading(true);
      await loanService.deleteLoanType(loanTypeCode);
      toast.success("Loan type deleted successfully");
      fetchLoanTypes(); // Refresh the list
    } catch (error) {
      toast.error(error.message || "Failed to delete loan type");
      console.error("Error deleting loan type:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      code: "",
      equityContribution: "",
    });
  };

  const handleCancelEdit = () => {
    resetForm();
    setIsEditing(false);
    setCurrentLoanType(null);
  };

  return (
    <div className="p-6">
      <h3 className="font-semibold text-[#333] mb-4 text-xl">
        {isEditing ? "Edit Loan Type" : "Add Loan Type"}
      </h3>
      <div className="flex gap-3 items-end w-full">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 w-full">
          <input
            required
            name="code"
            minLength={3}
            maxLength={5}
            pattern=".{3,5}"
            title="Code must be between 3 and 5 characters"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0 w-full"
            placeholder="Loan Type Code"
            value={formData.code}
            onChange={handleInputChange}
            disabled={isEditing}
          />
          <input
            required
            name="name"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0 w-full"
            placeholder="Loan Type Name"
            value={formData.name}
            disabled={formData.name === "Asset Financing"}
            onChange={handleInputChange}
          />
          <input
            name="equityContribution"
            type="number"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0 w-full"
            placeholder="Equity Contribution (%)"
            value={formData.equityContribution}
            onChange={handleInputChange}
            min={0}
          />
          <input
            type="text"
            name="description"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0 w-full"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                className="bg-[#3D873B] text-white p-2 px-4 hover:bg-green-600 cursor-pointer rounded-md disabled:opacity-50"
                onClick={handleUpdateLoanType}
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update"}
              </button>
              <button
                className="bg-gray-500 text-white p-2 px-4 hover:bg-gray-600 cursor-pointer rounded-md"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="bg-[#3D873B] text-white p-2 px-4 hover:bg-green-600 cursor-pointer rounded-md disabled:opacity-50"
              onClick={handleAddLoanType}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        {isLoading && loanTypes.length === 0 ? (
          <p>Loading loan types...</p>
        ) : (
          <Table
            headers={[
              "Loan Type Code",
              "Loan Type",
              "Description",
              "Equity Contribution",
              "Actions",
            ]}
            rows={loanTypes.map((lt) => ({
              ...lt,
              actions: (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditLoanType(lt)}
                    className="text-blue-500 hover:text-blue-700"
                    disabled={isLoading}
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLoanType(lt.code)}
                    className="text-red-500 hover:text-red-700"
                    disabled={isLoading}
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              ),
            }))}
          />
        )}
      </div>
    </div>
  );
};

export default LoanTypeConfiguration;
