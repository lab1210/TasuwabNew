import roleService from "@/Services/roleService";
import React, { useEffect, useState } from "react";
import Select from "react-select";

const EditRole = ({ role, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    role_id: role?.role_id || "", // Added role_id field and initialized
    name: role?.name || "",
    description: role?.description || "",
    privilegeIds: role?.privileges?.map((p) => p.privilegeId) || [],
  });

  const [allPrivileges, setAllPrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [privilegesError, setPrivilegesError] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const privilegeOptions = allPrivileges.map((p) => ({
    value: p.privilegeId,
    label: `${p.name} (${p.description})`,
  }));
  const fetchPrivileges = async () => {
    setLoadingPrivileges(true);
    setPrivilegesError(null);
    try {
      const response = await roleService.getAllPrivileges();
      if (response?.data && Array.isArray(response.data)) {
        setAllPrivileges(response.data);
      } else if (Array.isArray(response)) {
        setAllPrivileges(response);
      } else {
        console.warn("Unexpected privileges data format:", response);
        setPrivilegesError("Failed to load privileges.");
        setAllPrivileges([]);
      }
    } catch (err) {
      console.error("Error fetching privileges:", err);
      setPrivilegesError("Failed to load privileges.");
      setAllPrivileges([]);
    } finally {
      setLoadingPrivileges(false);
    }
  };
  useEffect(() => {
    fetchPrivileges();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (name === "description") {
      if (value.length > 20) {
        setDescriptionError("Description cannot exceed 20 characters.");
      } else {
        setDescriptionError("");
      }
    }
  };

  const handlePrivilegeChange = (selectedOptions) => {
    setFormData((prevData) => ({
      ...prevData,
      privilegeIds: selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await roleService.updateRole(formData.role_id, {
        role_id: formData.role_id,
        name: formData.name,
        description: formData.description,
        privilegeIds: formData.privilegeIds,
      });
      setMessage(`Role "${response.name}" updated successfully!`);
      onUpdate(response);
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 2000);
    } catch (err) {
      setError("Failed to update role. Please try again.");
      console.error("Error updating role:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {message && <p className="text-green-500 font-bold text-sm">{message}</p>}
      {error && <p className="text-red-500 font-bold text-sm">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6 relative h-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-bold" htmlFor="name">
                Role Code:
              </label>
              <input
                type="text"
                name="role_id"
                id="role_id"
                value={formData.role_id}
                onChange={handleInputChange}
                required
                className="border-b-2 border-b-gray-400 text-gray-400 outline-0  text-lg"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold" htmlFor="name">
                Role Name:
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
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
              onChange={handleInputChange}
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
                max characters 20
              </p>
            )}
          </div>
        </div>
        <div className="flex-grow">
          <label className="font-bold">Assign Privileges:</label>
          {loadingPrivileges ? (
            <p>Loading privileges...</p>
          ) : privilegesError ? (
            <p className="text-red-500 font-bold text-sm">{privilegesError}</p>
          ) : (
            <div className="mt-2 h-20">
              <Select
                isMulti
                options={privilegeOptions}
                value={formData.privilegeIds
                  .map((id) =>
                    privilegeOptions.find((option) => option.value === id)
                  )
                  .filter(Boolean)}
                onChange={handlePrivilegeChange}
                placeholder="Select Privileges"
                className="basic-multi-select "
                classNamePrefix="select"
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          className={`fixed bottom-6 right-6 bg-[#3D873B] text-white rounded-full shadow-lg p-4 z-50 cursor-pointer hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 ${
            loading || descriptionError ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading || descriptionError}
          onClick={handleSubmit}
        >
          {loading ? "Updating" : "Save"}
        </button>
      </form>
    </div>
  );
};

export default EditRole;
