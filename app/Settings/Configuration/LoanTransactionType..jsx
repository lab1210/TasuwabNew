"use client";
import React, { useEffect, useState } from "react";
import Table from "./Table";
import chargeService from "@/Services/chargeService";
import Select from "react-select";
import transactionTypeService from "@/Services/transTypeService";
import toast from "react-hot-toast";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrash } from "react-icons/fa";

const LoanTransactionTypeTab = () => {
  const [loading, setLoading] = useState(false);
  const [transactionTypes, settransactionTypes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Track which item is being deleted
  const [chargeOptions, setchargeOptions] = useState([]);
  const [isLoadingCharges, setisLoadingCharges] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
    chargeTrigger: true,
    linkedCodes: "",
    isPlus: true,
  });

  const handleChargeCodeChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      linkedCodes: selectedOption ? selectedOption.value : "",
    }));
  };

  useEffect(() => {
    const fetchChargeCodes = async () => {
      setisLoadingCharges(true);
      try {
        const data = await chargeService.getChargeCodes();
        const options = data.map((charge) => ({
          value: charge.code,
          label: charge.name,
        }));
        setchargeOptions(options);
      } catch (err) {
        toast.error("Failed to fetch charge codes", err);
      } finally {
        setisLoadingCharges(false);
      }
    };

    fetchChargeCodes();
  }, []);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await transactionTypeService.getAlltransactionTypes();
        settransactionTypes(Array.isArray(response) ? response : []);
      } catch (err) {
        toast.error("Failed to fetch transaction types", err);
      }
    };

    fetchTypes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]:
          type === "radio"
            ? value === "true"
            : type === "checkbox"
            ? checked
            : value,
      };

      if (name === "chargeTrigger" && value === "false") {
        newFormData.linkedCodes = "";
      }

      return newFormData;
    });
  };
  const clearForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      isActive: true,
      chargeTrigger: true,
      linkedCodes: "",
      isPlus: true,
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.description) {
      toast.error("Transaction Type Code, Name, Description  are required");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        linkedCodes: formData.linkedCodes,
        chargeTrigger: formData.chargeTrigger,
        isActive: formData.isActive,
        isPlus: formData.isPlus,
      };
      console.log("Final payload:", payload);

      if (isEditing) {
        await transactionTypeService.updateTransactionType(
          formData.code,
          payload
        );
        toast.success("transaction type updated successfully");
      } else {
        await transactionTypeService.createTransactionType(payload);
        toast.success("Transaction type added successfully");
      }
      const updatedTypes =
        await transactionTypeService.getAlltransactionTypes();
      settransactionTypes(Array.isArray(updatedTypes) ? updatedTypes : []);

      clearForm();
    } catch (err) {
      console.error("Failed to process transaction type", err);
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
      linkedCodes: type.linkedCodes,
      chargeTrigger: type.chargeTrigger,
      isActive: type.isActive,
      isPlus: type.isPlus,
    });
    setIsEditing(true);
  };

  const handleDelete = async (code) => {
    if (
      !window.confirm("Are you sure you want to delete this transaction type?")
    ) {
      return;
    }

    try {
      setDeletingId(code); // Set the ID of the item being deleted
      await transactionTypeService.deleteTransactionType(code);
      toast.success("Transaction type deleted successfully");
      const refreshedTypes =
        await transactionTypeService.getAlltransactionTypes();
      settransactionTypes(Array.isArray(refreshedTypes) ? refreshedTypes : []);
    } catch (err) {
      console.error("Failed to delete transaction type", err);
      toast.error(err.response?.data?.message || "Delete operation failed");
    } finally {
      setDeletingId(null); // Reset deleting state
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col mb-4">
        <h3 className="font-bold text-[#333] ">
          {isEditing ? "Edit Transaction Type" : "Add Transaction Type"}
        </h3>
        <p className="text-sm text-gray-500">
          ( <span className="italic">Withdrawal, Deposits,... </span>)
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col  gap-3 ">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 w-full">
          <input
            name="code"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Transaction Type Code"
            value={formData.code}
            onChange={handleInputChange}
            disabled={isEditing}
            required
          />
          <input
            name="name"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Transaction Type Name"
            value={formData.name}
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
          />
          <Select
            options={chargeOptions}
            value={
              formData.chargeTrigger
                ? chargeOptions.find(
                    (option) => option.value === formData.linkedCodes
                  ) || null
                : null
            }
            onChange={handleChargeCodeChange}
            isClearable
            isSearchable
            placeholder={
              formData.chargeTrigger
                ? "Search for Charge Code"
                : "Enable charges to select"
            }
            isDisabled={formData.chargeTrigger === false}
            noOptionsMessage={() => "Add Charge Code in previous tab"}
            formatOptionLabel={(I) => (
              <div style={{ display: "flex", alignItems: "center" }}>
                {I.label}
              </div>
            )}
            isLoading={isLoadingCharges}
            className="basic-single"
            classNamePrefix="select"
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: "42px",
                borderColor: "#d1d5db",
                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                "&:hover": {
                  borderColor: state.isDisabled ? "#d1d5db" : "#3D873B",
                },
                backgroundColor: state.isDisabled ? "#f3f4f6" : "white",
                cursor: state.isDisabled ? "not-allowed" : "default",
              }),
            }}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Transaction Effect on Balance
              <span className="block text-xs text-gray-500">
                (Credit = Add to balance, Debit = Subtract from balance)
              </span>
            </label>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="isPlus"
                  value="true"
                  checked={formData.isPlus === true}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#3D873B] focus:ring-[#3D873B] border-gray-300"
                />
                Credit
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="isPlus"
                  value="false"
                  checked={formData.isPlus === false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#3D873B] focus:ring-[#3D873B] border-gray-300"
                />
                Debit
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Should charges be included?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="chargeTrigger"
                  value="true"
                  checked={formData.chargeTrigger === true}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#3D873B] focus:ring-[#3D873B] border-gray-300"
                />
                Yes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="chargeTrigger"
                  value="false"
                  checked={formData.chargeTrigger === false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#3D873B] focus:ring-[#3D873B] border-gray-300"
                />
                No
              </label>
            </div>
          </div>

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
          "Transaction Type",
          "Description",
          "Effect on Balance",
          "Charges?",
          "Charge",
          "Status",
          "",
        ]}
        rows={transactionTypes.map((dt) => [
          dt.code,
          dt.name,
          dt.description,
          dt.isPlus ? "Credit" : "Debit",
          dt.chargeTrigger ? "Yes" : "No",
          dt.linkedCodes || "No Charge",
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

export default LoanTransactionTypeTab;
