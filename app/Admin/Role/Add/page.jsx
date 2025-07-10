"use client";
import Layout from "@/app/components/Layout";
import roleService from "@/Services/roleService";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AddRole = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    role_id: "",
    name: "",
    description: "",
    privilegeIds: [],
  });

  const [allPrivileges, setAllPrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrivileges = allPrivileges.filter((priv) =>
    `${priv.name} ${priv.description}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const fetchPrivileges = async () => {
    setLoadingPrivileges(true);
    try {
      const res = await roleService.getAllPrivileges();
      setAllPrivileges(Array.isArray(res?.data) ? res.data : res);
    } catch (err) {
      console.error("Failed to fetch privileges", err);
    } finally {
      setLoadingPrivileges(false);
    }
  };

  useEffect(() => {
    fetchPrivileges();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "description") {
      setDescriptionError(value.length > 20 ? "Max 20 characters." : "");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePrivilege = (privilegeId) => {
    setFormData((prev) => {
      const isSelected = prev.privilegeIds.includes(privilegeId);
      return {
        ...prev,
        privilegeIds: isSelected
          ? prev.privilegeIds.filter((id) => id !== privilegeId)
          : [...prev.privilegeIds, privilegeId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (descriptionError) return;

    setLoading(true);
    try {
      const res = await roleService.createRole(formData);
      setMessage(`✅ Role "${res.name}" created!`);
      setTimeout(() => {
        router.push("/roles");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to create role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto mt-2">
        <h1 className="text-2xl font-bold mb-6">Add Role</h1>

        {message && <p className="mb-4 text-green-600 text-sm">{message}</p>}
        {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold">Role Code:</label>
              <input
                type="text"
                name="role_id"
                value={formData.role_id}
                onChange={handleInputChange}
                required
                className="w-full border-b-2 border-gray-300 text-gray-700 outline-none text-lg"
              />
            </div>
            <div>
              <label className="font-bold">Role Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border-b-2 border-gray-300 text-gray-700 outline-none text-lg"
              />
            </div>
          </div>

          <div>
            <label className="font-bold">Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full border-b-2 border-gray-300 text-gray-700 outline-none text-lg"
            />
            {descriptionError ? (
              <p className="text-red-500 text-xs text-right">
                {descriptionError}
              </p>
            ) : (
              <p className="text-xs text-right text-green-600">
                Max characters: 20
              </p>
            )}
          </div>

          <div>
            <label className="font-bold">Assign Privileges:</label>
            {loadingPrivileges ? (
              <p>Loading...</p>
            ) : (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Search privileges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 mb-3 border border-gray-300 rounded"
                />

                <div className="flex gap-4 mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        privilegeIds: allPrivileges.map((p) => p.privilegeId),
                      }))
                    }
                    className="text-sm text-[#3D873B] hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, privilegeIds: [] }))
                    }
                    className="text-sm text-red-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto border rounded">
                  <table className="min-w-full text-sm table-auto border-separate border-spacing-y-1">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2">Select</th>
                        <th className="text-left px-3 py-2">Name</th>
                        <th className="text-left px-3 py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrivileges.length > 0 ? (
                        filteredPrivileges.map((priv) => (
                          <tr
                            key={priv.privilegeId}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-3 py-1">
                              <input
                                type="checkbox"
                                checked={formData.privilegeIds.includes(
                                  priv.privilegeId
                                )}
                                onChange={() =>
                                  togglePrivilege(priv.privilegeId)
                                }
                              />
                            </td>
                            <td className="px-3 py-1">{priv.name}</td>
                            <td className="px-3 py-1 text-gray-500">
                              {priv.description}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center py-2 text-gray-400"
                          >
                            No privileges found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !!descriptionError}
            className={`fixed cursor-pointer bottom-6 right-6 bg-[#3D873B] text-white rounded-full shadow-lg p-3 px-6 z-50 hover:bg-green-600 focus:outline-none ${
              loading || descriptionError ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Adding..." : "Save"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddRole;
