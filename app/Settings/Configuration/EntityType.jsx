"use client";
import React, { useEffect, useState } from "react";
import Table from "./Table";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import entityTypeService from "@/Services/entityTypeService";
import toast from "react-hot-toast";

const EntityTypeTab = () => {
  const [loading, setLoading] = useState(false);
  const [entityTypes, setEntityTypes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setformData] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchEntityTypes = async () => {
      try {
        const response = await entityTypeService.getAllEntityTypes();
        setEntityTypes(Array.isArray(response) ? response : []);
      } catch (err) {
        toast.error(err?.message || "Failed to load entity types");
        setEntityTypes([]); // Reset to empty array on error
      }
    };

    fetchEntityTypes();
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
      isActive: true,
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.description) {
      toast.error("Entity Type Code, Name and Description are required");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
      };

      if (isEditing) {
        await entityTypeService.updateEntityType(formData.code, payload);
        toast.success("Entity type updated successfully");
      } else {
        await entityTypeService.createEntityType(payload);
        toast.success("Entity type added successfully");
      }

      const updatedTypes = await entityTypeService.getAllEntityTypes();
      setEntityTypes(Array.isArray(updatedTypes) ? updatedTypes : []);
      clearForm();
    } catch (err) {
      toast.error(err?.message || "Failed to process entity type");
      console.error("Failed to process entity type", err);
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
    });
    setIsEditing(true);
  };

  const handleDelete = async (code) => {
    if (!window.confirm("Are you sure you want to delete this entity type?")) {
      return;
    }

    try {
      setDeletingId(code); // Set the ID of the item being deleted
      await entityTypeService.deleteAccountType(code);
      toast.success("Entity type deleted successfully");
      const refreshedTypes = await entityTypeService.getAllEntityTypes(); // Refresh the table after delete
      setEntityTypes(Array.isArray(refreshedTypes) ? refreshedTypes : []);
    } catch (err) {
      console.error("Failed to delete entity type", err);
      toast.error(err.response?.data?.message || "Delete operation failed");
    } finally {
      setDeletingId(null); // Reset deleting state
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col mb-4">
        <h3 className="font-bold text-[#333] ">
          {isEditing ? "Edit Entity Type" : "Add Entity Type"}
        </h3>
        <p className="text-sm text-gray-500">
          ( <span className="italic">Individual, Joint,... </span>)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col  gap-3 ">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 w-full">
          <input
            name="code"
            className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
            placeholder="Entity Type Code"
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
            placeholder="Entity Type Name"
            value={formData.name}
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
        headers={["Code", "Entity Type", "Description", "Status", ""]}
        rows={entityTypes.map((dt) => [
          dt.code,
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

export default EntityTypeTab;
