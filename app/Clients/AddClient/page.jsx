"use client";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import branchService from "@/Services/branchService";
import clientService from "@/Services/clientService";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const AddClient = () => {
  const { user } = useAuth();
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
  });

  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [errorBranches, setErrorBranches] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await branchService.getAllBranches();
        setBranches(data);
      } catch (error) {
        setErrorBranches(error.message || "Failed to fetch branches");
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Format date to YYYYMMDD number
      let dateOfBirth = 0;
      if (formData.dateOfBirth) {
        const date = new Date(formData.dateOfBirth);
        dateOfBirth =
          date.getFullYear() * 10000 +
          (date.getMonth() + 1) * 100 +
          date.getDate();
      }

      const clientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        gender: formData.gender,
        martialStatus: formData.martialStatus,
        dateOfBirth: dateOfBirth,
        identificationType: formData.identificationType,
        identificationNumber: formData.identificationNumber,
        branchCode: formData.branchCode,
        performedBy: formData.performedBy || user?.StaffCode || "SYSTEM",
        occupation: formData.occupation || "",
        employer: formData.employer,
        employerAddress: formData.employerAddress,
      };

      console.log("Submitting:", clientData);

      // Either use the response or remove the assignment
      const response = await clientService.createClient(clientData);

      // Option 1: Use the response data
      console.log("Created client:", response.data);
      setSuccessMessage(`Client ${response.data} created successfully!`);

      setFormData({
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

      setTimeout(() => {
        router.push("/Clients");
      }, 2000);
    } catch (error) {
      console.error("Creation error:", error);
      setErrorMessage(
        error.response?.data?.title ||
          "Failed to create client. Please try again."
      );
    }
  };
  return (
    <Layout>
      <div className="w-full">
        <div>
          <p className="text-4xl font-extrabold mb-2">Create Client</p>
          <p className="text-sm text-gray-600">
            Fill in the form below to create a new client.
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
              <label className="font-bold text-sm" htmlFor="maritalStatus">
                Marital Status <span className="text-red-500">*</span>
              </label>
              <select
                name="maritalStatus"
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
              <label htmlFor="branchCode" className="font-bold text-sm">
                Branch<span className="text-red-500">*</span>
              </label>
              <select
                name="branchCode"
                value={formData.branchCode}
                onChange={handleChange}
                className="border-b border-b-gray-400 focus:border-b-green-400 shadow-md  outline-0  p-1"
                disabled={loadingBranches}
              >
                <option value="">Select Branch</option>
                {loadingBranches ? (
                  <option disabled>Loading branches...</option>
                ) : errorBranches ? (
                  <option disabled>{errorBranches}</option>
                ) : (
                  branches.map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.name}
                    </option>
                  ))
                )}
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
          <div>
            <button
              type="submit"
              className="bg-[#3D873B] text-white rounded-md w-full mt-6 p-2 cursor-pointer hover:shadow-lg hover:opacity-70 "
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddClient;
