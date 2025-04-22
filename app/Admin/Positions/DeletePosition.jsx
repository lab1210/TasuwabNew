"use client";
import positionService from "@/Services/positionService";
import React, { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";

const DeletePosition = ({ position, onClose, onDelete }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      await positionService.deletePosition(position?.position_id);
      setMessage(`Deleted position: ${position?.name || ""}`);
      onDelete(); // Callback to refresh the position list
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 2000);
    } catch (err) {
      setError("Failed to delete position. Please try again.");
      console.error("Error deleting position:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {message && <p className="text-green-500 font-bold text-sm">{message}</p>}
      {error && <p className="text-red-500 font-bold text-sm">{error}</p>}

      <div className="text-gray-400 flex justify-center">
        <FaTrashAlt size={30} />
      </div>
      <p className="mt-6 font-bold text-gray-500">
        Are you sure you want to delete "
        <span className="text-[#3D873B]">{position?.name}</span>"
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

export default DeletePosition;
