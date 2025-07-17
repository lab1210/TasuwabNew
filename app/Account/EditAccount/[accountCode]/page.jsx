"use client";
import Layout from "@/app/components/Layout";
import useAccountService from "@/Services/accountService";
import { useAuth } from "@/Services/authService";
import depositTypeService from "@/Services/depositTypeService";
import entityTypeService from "@/Services/entityTypeService";
import branchService from "@/Services/branchService";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HashLoader } from "react-spinners";
import Select from "react-select";
import clientService from "@/Services/clientService";

const EditAccount = () => {
  const { user, loading: authLoading } = useAuth();
  const [accountTypes, setAccountTypes] = useState([]);
  const [account, setAccount] = useState(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);
  const [entityTypes, setEntityTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [isloading, setisLoading] = useState(false);
  const [branchName, setBranchName] = useState("");

  const [errors, setErrors] = useState({
    accountCode: "",
    depositTypeCode: "",
    entityTypeCode: "",
    owners: "",
  });

  const router = useRouter();
  const params = useParams();
  const accountCode = params.accountCode;

  const [formData, setFormData] = useState({
    accountCode: "",
    depositTypeCode: "",
    entityTypeCode: "",
    branch_id: user?.BranchCode || "",
    owners: [],
    accountName: "",
    performedBy: user?.StaffCode || "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountData = await useAccountService.getAccountByCode(
          accountCode
        );
        setAccount(accountData);

        setFormData({
          accountCode: accountData.accountCode,
          depositTypeCode: accountData.depositTypeCode,
          entityTypeCode: accountData.entityTypeCode,
          branch_id: accountData.branch_id || user?.BranchCode || "",
          owners:
            accountData.owners?.split(",").map((owner) => ({
              value: owner,
              label: owner, // You might want to fetch client names here
            })) || [],
          accountName: accountData.accountName,
          performedBy: user?.StaffCode || "",
        });
      } catch (err) {
        toast.error("Failed to load account data.");
        console.error(err);
      }
    };

    if (accountCode) {
      fetchData();
    }
  }, [accountCode, user]);

  const checkAccountCode = async (code) => {
    if (!code) return;

    setIsCheckingAccount(true);
    try {
      const exists = await useAccountService.checkExistingAccount(code);
      if (exists && code !== accountCode) {
        toast.error("Account code already exists");
      }
    } catch (error) {
      console.error("Error checking account code:", error);
      toast.error("Failed to validate account code");
    } finally {
      setIsCheckingAccount(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.accountCode && formData.accountCode !== accountCode) {
        checkAccountCode(formData.accountCode);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.accountCode, accountCode]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        branch_id: user.BranchCode || "",
        performedBy: user.StaffCode || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchBranchName = async () => {
      if (formData.branch_id) {
        try {
          const data = await branchService.getBranchById(formData.branch_id);
          setBranchName(data?.name || formData.branch_id);
        } catch (error) {
          console.error("Error fetching branch name:", error);
          setBranchName(formData.branch_id);
        }
      }
    };

    fetchBranchName();
  }, [formData.branch_id]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [accounts, entities, clientsData] = await Promise.all([
          depositTypeService.getallDepositTypes(),
          entityTypeService.getAllEntityTypes(),
          clientService.getAllClients(),
        ]);

        setAccountTypes(accounts.data || accounts || []);
        setEntityTypes(entities.data || entities || []);
        setClients(clientsData.data || clientsData || []);
      } catch (error) {
        console.error("Error fetching metadata:", error);
        toast.error("Failed to load required data");
      }
    };

    fetchMetadata();
  }, []);

  const validateForm = () => {
    const newErrors = {
      accountCode: "",
      depositTypeCode: "",
      entityTypeCode: "",
      owners: "",
    };

    let isValid = true;

    if (!formData.accountCode) {
      newErrors.accountCode = "Account code is required";
      isValid = false;
    }

    if (!formData.depositTypeCode) {
      newErrors.depositTypeCode = "Account type is required";
      isValid = false;
    } else if (
      !accountTypes.some((type) => type.code === formData.depositTypeCode)
    ) {
      newErrors.depositTypeCode = "Selected account type is not valid";
      isValid = false;
    }

    if (!formData.entityTypeCode) {
      newErrors.entityTypeCode = "Entity type is required";
      isValid = false;
    }

    if (formData.owners.length === 0) {
      newErrors.owners = "At least one owner is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setisLoading(true);

      const ownersString = formData.owners
        .map((owner) => owner.value)
        .join(",");

      const accountPayload = {
        accountCode: formData.accountCode,
        depositTypeCode: formData.depositTypeCode,
        entityTypeCode: formData.entityTypeCode,
        branch_id: Number(formData.branch_id),
        owners: ownersString,
        accountName: formData.accountName,
        performedBy: formData.performedBy,
      };

      const updatedAccount = await useAccountService.updateAccount(
        accountCode,
        accountPayload
      );

      // Update local state with the returned data
      setAccount(updatedAccount);
      setFormData({
        ...formData,
        ...updatedAccount,
        owners:
          updatedAccount.owners?.split(",").map((owner) => ({
            value: owner,
            label: owner,
          })) || [],
      });
      toast.success("Account updated successfully");
      router.push("/Account");
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error(error.response?.data?.message || "Failed to update account");
    } finally {
      setisLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <HashLoader color="#3D873B" size={60} />
      </div>
    );
  }

  if (!account) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <HashLoader color="#3D873B" size={60} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-10">
        <p className="text-4xl font-extrabold mb-2">Update Account</p>
        <p className="text-sm text-gray-600">
          Fill in the form below to update this account.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account Code */}
        <div>
          <label className="block text-sm font-medium">Account Code</label>
          <input
            name="accountCode"
            readOnly
            onChange={(e) => {
              setFormData({ ...formData, accountCode: e.target.value });
              if (errors.accountCode) {
                setErrors((prev) => ({ ...prev, accountCode: "" }));
              }
            }}
            className={`w-full p-2 border rounded focus:border-[#3D873B] focus:border-2 outline-none bg-[#3D873B]/20 ${
              errors.accountCode ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter account code"
            value={formData.accountCode}
            required
          />
          {isCheckingAccount && (
            <div className="absolute right-3 top-2.5">
              <HashLoader color="#3D873B" size={20} />
            </div>
          )}
          {errors.accountCode && (
            <p className="text-red-500 text-xs mt-1">{errors.accountCode}</p>
          )}
        </div>

        {/* Account Name */}
        <div>
          <label className="block text-sm font-medium">Account Name</label>
          <input
            name="accountName"
            className="w-full p-2 border border-gray-300 rounded focus:border-[#3D873B] focus:border-2 outline-none"
            placeholder="Enter account name"
            value={formData.accountName}
            onChange={(e) =>
              setFormData({ ...formData, accountName: e.target.value })
            }
          />
        </div>

        {/* Account Type */}
        <div>
          <label className="block text-sm font-medium">Account Type</label>
          <select
            name="depositTypeCode"
            value={formData.depositTypeCode}
            disabled
            onChange={(e) =>
              setFormData({ ...formData, depositTypeCode: e.target.value })
            }
            className={`w-full p-2 border rounded bg-[#3D873B]/20 focus:border-[#3D873B] focus:border-2 outline-none ${
              errors.depositTypeCode ? "border-red-500" : "border-gray-300"
            }`}
            required
          >
            <option value="" disabled>
              Select Deposit Type
            </option>
            {accountTypes.map((type) => (
              <option key={type.code} value={type.code}>
                {type.name}
              </option>
            ))}
          </select>
          {errors.depositTypeCode && (
            <p className="text-red-500 text-xs mt-1">
              {errors.depositTypeCode}
            </p>
          )}
        </div>

        {/* Entity Type */}
        <div>
          <label className="block text-sm font-medium">Entity Type</label>
          <select
            name="entityTypeCode"
            value={formData.entityTypeCode}
            onChange={(e) =>
              setFormData({ ...formData, entityTypeCode: e.target.value })
            }
            className={`w-full p-2 border rounded focus:border-[#3D873B] focus:border-2 outline-none ${
              errors.entityTypeCode ? "border-red-500" : "border-gray-300"
            }`}
            required
          >
            <option value="" disabled>
              Select Entity Type
            </option>
            {entityTypes.map((et) => (
              <option key={et.code} value={et.code}>
                {et.name}
              </option>
            ))}
          </select>
          {errors.entityTypeCode && (
            <p className="text-red-500 text-xs mt-1">{errors.entityTypeCode}</p>
          )}
        </div>

        {/* Branch */}
        <div>
          <label className="block text-sm font-medium">Branch</label>
          <input
            type="text"
            value={branchName}
            disabled
            className="w-full p-2 border border-gray-300 rounded focus:border-[#3D873B] focus:border-2 outline-none bg-[#3D873B]/20"
          />
        </div>

        {/* Owners */}
        <div>
          <label className="block text-sm font-medium">Owners</label>
          <Select
            isClearable
            isSearchable
            isMulti
            noOptionsMessage={() => "No customer found"}
            options={clients.map((c) => ({
              label: `${c.firstName} ${c.lastName} (${c.clientId})`,
              value: c.clientId,
            }))}
            value={formData.owners}
            onChange={(selected) => {
              setFormData({ ...formData, owners: selected || [] });
              setErrors({ ...errors, owners: "" });
            }}
            className={`${errors.owners ? "border-red-500" : ""} basic-single`}
            classNamePrefix="select"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "42px",
                borderColor: errors.owners ? "#ef4444" : "#d1d5db",
                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                "&:hover": {
                  borderColor: errors.owners ? "#ef4444" : "#3D873B",
                },
              }),
            }}
          />
          {errors.owners && (
            <p className="text-red-500 text-xs mt-1">{errors.owners}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Updated By</label>
          <input
            type="text"
            value={formData.performedBy}
            disabled
            className="w-full p-2 border border-gray-300 rounded focus:border-[#3D873B] focus:border-2 outline-none bg-[#3D873B]/20"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => router.push("/Account")}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isloading}
            className="px-4 py-2 bg-[#3D873B] cursor-pointer text-white rounded hover:bg-green-700 disabled:bg-green-400"
          >
            {isloading ? "Updating..." : "Update Account"}
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default EditAccount;
