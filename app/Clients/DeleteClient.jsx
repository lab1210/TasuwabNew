import clientService from "@/Services/clientService";
import React from "react";

const DeleteClient = ({ client = {}, onClose, onDelete }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(""); // State for delete-specific error

  const handleDelete = async () => {
    if (!client?.clientId) {
      setMessage("Client code is missing.");
      return;
    }

    try {
      setLoading(true);
      setDeleteError(""); // Clear any previous error
      await clientService.del(staff?.staffCode); // Use deleteStaff from service

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

  return <div></div>;
};

export default DeleteClient;
