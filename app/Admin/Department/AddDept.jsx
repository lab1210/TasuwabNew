import departmentService from "@/Services/departmentService";
import React, { useState } from "react";

const AddDept = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    is_active: true,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (name === "description") {
      if (value.length > 30) {
        setDescriptionError("Description cannot exceed 30 characters.");
      } else {
        setDescriptionError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (descriptionError) {
      return; // Prevent submission if description character limit is exceeded
    }
    setLoading(true);
    setError("");

    try {
      const response = await departmentService.addDepartment({
        ...formData,
        is_visible: true, // Set is_visible to true (or your desired default)
      });
      setMessage("Department added successfully!");
      onAdd(response);
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 2000);
    } catch (err) {
      setError("Failed to add department. Please try again.");
      console.error("Error adding department:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {message && <p className="text-green-500 font-bold text-sm">{message}</p>}
      {error && <p className="text-red-500 font-bold text-sm">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <label className="font-bold" htmlFor="name">
              Department Name:
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="border-b-2 border-b-gray-400 text-gray-400 outline-0  text-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-bold" htmlFor="email">
                Email:
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="border-b-2 border-b-gray-400 text-gray-400 outline-0  text-lg"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold" htmlFor="phone">
                Phone:
              </label>
              <input
                type="text"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="border-b-2 border-b-gray-400 text-gray-400 outline-0  text-lg"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold" htmlFor="description">
              Description:
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="border-b-2 border-b-gray-400 text-gray-400 outline-0  text-lg"
            />
            {descriptionError && (
              <p className="text-red-500 text-xs text-right">
                {descriptionError}
              </p>
            )}
            {!descriptionError && (
              <p className="text-xs text-right text-[#3D873B]">
                max characters 30
              </p>
            )}
          </div>
        </div>
        <div>
          <button
            type="submit"
            className={`bg-[#3D873B] text-white rounded-md w-full mt-6 p-2 cursor-pointer hover:shadow-lg hover:opacity-70 ${
              loading || descriptionError ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading || descriptionError}
          >
            {loading ? "Adding" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDept;
