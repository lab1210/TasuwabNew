"use client";
import useAccountService from "@/Services/accountService";
import branchService from "@/Services/branchService";
import clientService from "@/Services/clientService";
import React, { useEffect, useState } from "react";
import Select from "react-select";

const AddAccount = ({ onClose, onAdd, branchCode }) => {
  const [accountTypes, setAccountTypes] = useState([]);
  const [entityTypes, setEntityTypes] = useState([]);
  const [branches, setBranches] = useState("");
  const [clients, setClients] = useState([]);

  const [formData, setFormData] = useState({
    accountCode: "",
    accountTypeCode: "",
    entityTypeCode: "",
    branchCode: "",
    owners: "",
    accountName: "",
    performedBy: "",
  });

  useEffect(() => {
    console.log("Branch code:", branchCode);
    if (branchCode) {
      branchService
        .getBranchById(branchCode)
        .then((data) => {
          console.log("Fetched branch data:", data);
          setBranches(data.name);
        })
        .catch((err) => {
          console.error("Failed to fetch branch name", err);
        });
    }
  }, [branchCode]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [accounts, entities, clientsRes] = await Promise.all([
          useAccountService().getAllAccountTypes(),
          useAccountService().getAllAccountEntityTypes(),
          clientService.getAllClients(),
        ]);

        // Log each individual response
        console.log("Accounts:", accounts);
        console.log("Entities:", entities);
        console.log("Clients Response:", clientsRes);

        // Extract data from the response (assuming 'data' is the correct key)
        setAccountTypes(accounts || []);
        setEntityTypes(entities || []);
        setClients(clientsRes || []);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    fetchMetadata();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const accountPayload = {
        accountTypeCode: formData.accountType,
        entityTypeCode: formData.entityType,
        branchCode: formData.branch,
        owners: formData.owners.map((o) => o.value),
      };

      await useAccountService().createNewAccount(accountPayload);
      onAdd();
      onClose();
    } catch (error) {
      console.error("Error creating account:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Account Type */}
      <div>
        <label className="block text-sm font-medium">Deposit Type</label>
        <select
          value={formData.accountType}
          onChange={(e) =>
            setFormData({ ...formData, accountType: e.target.value })
          }
          className="w-full p-2 border rounded"
        >
          <option value="">Select Deposit Type</option>
          {accountTypes.map((type) => (
            <option key={type.accountTypeCode} value={type.accountTypeCode}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Entity Type */}
      <div>
        <label className="block text-sm font-medium">Entity Type</label>
        <select
          value={formData.entityType}
          onChange={(e) =>
            setFormData({ ...formData, entityType: e.target.value })
          }
          className="w-full p-2 border rounded"
        >
          <option value="">Select Entity Type</option>
          {entityTypes.map((et) => (
            <option key={et.entityTypeCode} value={et.entityTypeCode}>
              {et.name}
            </option>
          ))}
        </select>
      </div>

      {/* Branch */}
      <div>
        <label className="block text-sm font-medium">Branch</label>
        <input
          type="text"
          value={branches}
          disabled
          className="w-full p-2 border rounded bg-gray-100 text-gray-500"
        />
      </div>

      {/* Owners */}
      <div>
        <label className="block text-sm font-medium">Owners</label>
        <Select
          isMulti
          options={clients.map((c) => ({
            label: `${c.firstName} ${c.lastName}`,
            value: c.clientId,
          }))}
          value={formData.owners}
          onChange={(selected) => {
            setFormData({ ...formData, owners: selected });
          }}
        />
      </div>

      <div className="flex justify-end">
        {/* Submit */}
        <button
          type="submit"
          disabled={
            !formData.accountType ||
            !formData.entityType ||
            !formData.branch ||
            formData.owners.length > 0
          }
          className="bg-green-600  text-white p-2 rounded hover:bg-green-700"
        >
          Create Account
        </button>
      </div>
    </form>
  );
};

export default AddAccount;
