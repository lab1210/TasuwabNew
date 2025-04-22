"use client";
import staffService from "@/Services/staffService";
import React, { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";

const DeleteStaff = ({ staff = {}, onClose, onDelete }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(""); // State for delete-specific error

  const handleDelete = async () => {
    if (!staff?.staffCode) {
      setMessage("Staff code is missing.");
      return;
    }

    try {
      setLoading(true);
      setDeleteError(""); // Clear any previous error
      await staffService.deleteStaff(staff?.staffCode); // Use deleteStaff from service

      setMessage(`Deleted Staff: ${staff?.firstName} ${staff?.lastName}`);

      // Refresh the staff list after successful deletion
      onDelete();

      setTimeout(() => {
        setMessage(""); // Remove message after 2 seconds
        onClose(); // Close modal
      }, 2000);
    } catch (error) {
      console.error("Error deleting staff:", error);
      setDeleteError(
        error.response?.data?.message ||
          "Error deleting staff. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {" "}
      {message && <p className="text-green-500 font-bold text-sm">{message}</p>}
      {deleteError && <p className="text-red-500 font-bold text-sm">{error}</p>}
      <div className="text-gray-400 flex justify-center">
        <FaTrashAlt size={30} />
      </div>
      <p className="mt-6 font-bold text-gray-500 text-center">
        Are you sure you want to delete "
        <span className="text-[#3D873B]">{staff?.firstName}</span>"
      </p>
      <div className="flex justify-center gap-5 mt-6">
        <button
          onClick={onClose}
          className="border border-gray-300 font-bold p-1 rounded-md shadow-md cursor-pointer"
        >
          No, Cancel
        </button>
        <button
          onClick={handleDelete}
          className="border border-red-500 bg-red-500 text-white p-1 rounded-md shadow-md cursor-pointer"
        >
          Yes, i'm sure
        </button>
      </div>
    </div>
  );
};

export default DeleteStaff;
