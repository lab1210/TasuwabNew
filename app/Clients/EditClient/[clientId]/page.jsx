"use client";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import branchService from "@/Services/branchService";
import clientService from "@/Services/clientService";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const EditClient = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "",
    martialStatus: "",
    dateOfBirth: "",
    identificationType: "",
    identificationNumber: "",
    branchCode: "",
    performedBy: user?.StaffCode || "SYSTEM",
    occupation: "",
    employer: "",
    employerAddress: "",
  });

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesData, clientData] = await Promise.all([
          branchService.getAllBranches(),
          clientService.getClientById(clientId),
        ]);

        setBranches(branchesData);

        const client = clientData;
        setFormData({
          firstName: client.firstName || "",
          lastName: client.lastName || "",
          email: client.email || "",
          phoneNumber: client.phoneNumber || "",
          address: client.address || "",
          gender: client.gender || "",
          martialStatus: client.martialStatus || "",
          dateOfBirth: client.dateOfBirth
            ? new Date(
                client.dateOfBirth
                  .toString()
                  .replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")
              )
                .toISOString()
                .split("T")[0]
            : "",
          identificationType: client.identificationType || "",
          identificationNumber: client.identificationNumber || "",
          branchCode: client.branchCode || "",
          performedBy: user?.StaffCode || "SYSTEM",
          occupation: client?.occupation || "",
          employer: client?.employer,
          employerAddress: client?.employerAddress,
        });
      } catch (err) {
        setErrorMessage("Failed to load client or branches.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchData();
    }
  }, [clientId, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let dateOfBirth = 0;
      if (formData.dateOfBirth) {
        const date = new Date(formData.dateOfBirth);
        dateOfBirth =
          date.getFullYear() * 10000 +
          (date.getMonth() + 1) * 100 +
          date.getDate();
      }

      const updatedClientData = {
        ...formData,
        dateOfBirth,
      };

      await clientService.updateClient(clientId, updatedClientData);

      setSuccessMessage("Client updated successfully!");
      setTimeout(() => router.push("/Clients"), 2000);
    } catch (error) {
      setErrorMessage("Failed to update client. Please try again.");
      console.error(error);
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="w-12 h-12 border-4 border-[#333] border-t-[#3D873B] rounded-full animate-spin"></div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="w-full">
        <div>
          <p className="text-4xl font-extrabold mb-2">Edit Client</p>
          <p className="text-sm text-gray-600">
            Update client information below.
          </p>
        </div>
        <form className="mt-6" onSubmit={handleSubmit}>
          {successMessage && (
            <p className="text-green-500 font-bold">{successMessage}</p>
          )}
          {errorMessage && (
            <p className="text-red-500 font-bold">{errorMessage}</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="phoneNumber">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="gender">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="martialStatus">
                Marital Status <span className="text-red-500">*</span>
              </label>
              <select
                name="martialStatus"
                value={formData.martialStatus}
                onChange={handleChange}
                required
                className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
              >
                <option value="">Select Marital Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="dateOfBirth">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="identificationType">
                Identification Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="identificationType"
                value={formData.identificationType}
                onChange={handleChange}
                required
                className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="font-bold text-sm"
                htmlFor="identificationNumber"
              >
                Identification Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="identificationNumber"
                value={formData.identificationNumber}
                onChange={handleChange}
                required
                className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full mt-3 mb-3">
            <label className="font-bold text-sm" htmlFor="address">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="occupation">
                Occupation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                required
                className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="employer">
                Employer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="employer"
                value={formData.employer}
                onChange={handleChange}
                required
                className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="employerAddress">
                Employer Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="employerAddress"
                value={formData.employerAddress}
                onChange={handleChange}
                required
                className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="branchCode">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                name="branchCode"
                value={formData.branchCode}
                onChange={handleChange}
                required
                className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.branch_id} value={branch.branch_id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="performedBy">
                Performed By
              </label>
              <input
                type="text"
                name="performedBy"
                value={formData.performedBy}
                readOnly
                className=" text-[#3D873B]  font-boldborder-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Update Client
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditClient;
