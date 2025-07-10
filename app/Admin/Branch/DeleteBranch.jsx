import branchService from "@/Services/branchService";
import React, { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";

const DeleteBranch = ({ branch = {}, onClose, onDelete }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      await branchService.deleteBranch(branch?.branch_id); // Use branch_id
      setMessage(`Deleted branch: ${branch?.name || ""}`); // Use branch.name
      onDelete();
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 2000);
    } catch (err) {
      setError("Failed to delete branch. Please try again.");
      console.error("Error deleting branch:", err);
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
      <p className="mt-6 font-bold text-gray-500 text-center">
        Are you sure you want to delete "
        <span className="text-[#3D873B]">{branch?.name}</span>"
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

export default DeleteBranch;
