"use client";

import React, { useEffect, useState } from "react";
import Table from "./Table";
import useAccountService from "@/Services/accountService";

const EntityTypeTab = ({ entityTypes, setEntityTypes }) => {
  const {
    createAccountEntityType,
    getAllAccountEntityTypes, // ✅ imported
  } = useAccountService();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  const [entityTypeRow, setEntityTypeRow] = useState({
    entityTypeCode: "",
    name: "",
    minOwners: 0,
    maxOwners: 0,
    description: "",
  });

  // ✅ Fetch entity types when component mounts
  useEffect(() => {
    const fetchEntityTypes = async () => {
      try {
        const data = await getAllAccountEntityTypes();
        setEntityTypes(data);
      } catch (err) {
        setError(err?.message || "Failed to load entity types");
      } finally {
        setFetching(false);
      }
    };

    fetchEntityTypes();
  }, [getAllAccountEntityTypes, setEntityTypes]);

  const handleAddEntityType = async () => {
    try {
      setLoading(true);
      setError(null);

      const dto = {
        ...entityTypeRow,
        minOwners: Number(entityTypeRow.minOwners),
        maxOwners: Number(entityTypeRow.maxOwners),
      };

      const created = await createAccountEntityType(dto);
      setEntityTypes((prev) => [...prev, created]);

      setEntityTypeRow({
        entityTypeCode: "",
        name: "",
        minOwners: 0,
        maxOwners: 0,
        description: "",
      });
    } catch (err) {
      setError(err?.message || "Failed to add entity type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h3 className="font-semibold text-[#333] mb-4">Add Entity Type</h3>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <input
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          placeholder="Entity Type Code"
          value={entityTypeRow.entityTypeCode}
          onChange={(e) =>
            setEntityTypeRow({
              ...entityTypeRow,
              entityTypeCode: e.target.value,
            })
          }
        />
        <input
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          placeholder="Entity Type Name"
          value={entityTypeRow.name}
          onChange={(e) =>
            setEntityTypeRow({ ...entityTypeRow, name: e.target.value })
          }
        />
        <textarea
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          placeholder="Entity Type Description"
          value={entityTypeRow.description}
          onChange={(e) =>
            setEntityTypeRow({ ...entityTypeRow, description: e.target.value })
          }
        />
        <input
          type="number"
          min={0}
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          placeholder="Min Owners"
          value={entityTypeRow.minOwners}
          onChange={(e) =>
            setEntityTypeRow({
              ...entityTypeRow,
              minOwners: Math.max(0, Number(e.target.value)),
            })
          }
        />
        <input
          type="number"
          min={0}
          className="border border-gray-400 shadow-md p-2 rounded-md focus:border-[#3D873B] outline-0"
          placeholder="Max Owners"
          value={entityTypeRow.maxOwners}
          onChange={(e) =>
            setEntityTypeRow({
              ...entityTypeRow,
              maxOwners: Math.max(0, Number(e.target.value)),
            })
          }
        />
      </div>
      {Number(entityTypeRow.maxOwners) < Number(entityTypeRow.minOwners) && (
        <p className="text-red-500 mb-2">
          Max Owners cannot be less than Min Owners.
        </p>
      )}

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <button
        className="bg-[#3D873B] text-white p-2 pl-5 pr-5 hover:bg-green-600 cursor-pointer rounded-md"
        onClick={handleAddEntityType}
        disabled={loading}
      >
        {loading ? "Adding..." : "Add"}
      </button>

      {fetching ? (
        <p className="mt-4 text-gray-600">Loading entity types...</p>
      ) : (
        <Table
          headers={[
            "Entity Type Code",
            "Name",
            "Min Owners",
            "Max Owners",
            "Description",
          ]}
          rows={entityTypes}
        />
      )}
    </div>
  );
};

export default EntityTypeTab;
