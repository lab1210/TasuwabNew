"use client";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import branchService from "@/Services/branchService";
import clientService from "@/Services/clientService";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaCamera, FaFileUpload, FaTimes, FaUser } from "react-icons/fa";

const AddClient = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    clientId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    state: "",
    town: "",
    gender: "",
    nationality: "",
    occupation: "",
    martialStatus: "",
    dateOfBirth: "",
    identificationType: "",
    identificationNumber: "",
    employer: "",
    employerAddress: "",
    branchCode: "",
    performedBy: user?.StaffCode,
  });
  const [clientIdError, setClientIdError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [errorBranches, setErrorBranches] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientPhoto, setClientPhoto] = useState(null);
  const [clientDocuments, setClientDocuments] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const docsInputRef = useRef(null);
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

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Check if the field being changed is clientId
    if (name === "clientId" && value.trim() !== "") {
      try {
        const exists = await clientService.checkExistingClient(value);
        if (exists) {
          setClientIdError("Client ID already exists");
          toast.error("Client ID already exists");
        } else {
          setClientIdError(null);
        }
      } catch (error) {
        console.error("Error checking client ID:", error);
        setClientIdError("Error checking client ID availability");
        toast.error("Error checking client ID availability");
      }
    }
  };
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setClientPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemovePhoto = () => {
    setClientPhoto(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0]; // Get only the first file
    if (file) {
      setClientDocuments(file);
    }
  };

  // Update document removal handler
  const handleRemoveDocument = () => {
    setClientDocuments(null);
    if (docsInputRef.current) {
      docsInputRef.current.value = "";
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (clientIdError) {
      toast.error("Please fix the client ID error before submitting");
      return;
    }
    setIsSubmitting(true);

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

      // Create FormData object for file uploads
      const formDataToSend = new FormData();

      // Append all regular form data
      Object.keys(formData).forEach((key) => {
        if (key !== "clientImage" && key !== "creationForm") {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append the files
      if (clientPhoto) {
        formDataToSend.append("clientImage", clientPhoto);
      }

      if (clientDocuments) {
        formDataToSend.append(`creationForm`, clientDocuments); // or use different field name if needed
      }

      // Update date of birth
      formDataToSend.set("dateOfBirth", dateOfBirth);

      console.log(
        "Submitting form data:",
        Object.fromEntries(formDataToSend.entries())
      );
      await clientService.createClient(formDataToSend);
      console.log("Created client:", formData.clientId);
      toast.success(`Client ${formData.clientId} created successfully!`);

      // Reset form
      setFormData({
        clientId: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        state: "",
        town: "",
        gender: "",
        nationality: "",
        occupation: "",
        martialStatus: "",
        dateOfBirth: "",
        identificationType: "",
        identificationNumber: "",
        employer: "",
        employerAddress: "",
        branchCode: "",
        performedBy: user?.StaffCode || "SYSTEM",
      });
      setClientPhoto(null);
      setPreviewImage(null);
      setClientDocuments(null);

      setTimeout(() => {
        router.push("/Clients");
      }, 2000);
    } catch (error) {
      console.error("Creation error:", error);
      toast.error(
        error.response?.data?.title ||
          "Failed to create client. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-extrabold mb-2">Create Client</p>
            <p className="text-sm text-gray-600">
              Fill in the form below to create a new client.
            </p>
          </div>
          <div className="relative group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
              id="clientPhoto"
            />
            <label htmlFor="clientPhoto" className="cursor-pointer">
              <div className="relative w-40 h-40 rounded-lg border-2 border-gray-200 hover:border-[#3D873B] transition-all duration-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                {previewImage ? (
                  <>
                    <img
                      src={previewImage}
                      alt="Client preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto();
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <FaUser
                      size={60}
                      className="text-[#3D873B] group-hover:text-[#3D873B] transition-colors"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-center">
                      <div className="w-full py-2 bg-[#3D873B] text-white flex items-center justify-center gap-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <FaCamera className="text-sm" />
                        <span className="text-xs font-medium">
                          Upload Photo
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>
        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="mt-6 mb-5">
            <h3 className="text-sm font-semibold mb-3">Physical Form Upload</h3>
            <div className="border border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                ref={docsInputRef}
                onChange={handleDocumentUpload}
                multiple
                className="hidden"
                id="clientDocuments"
              />
              <label
                htmlFor="clientDocuments"
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <FaFileUpload className="text-[#3D873B] text-3xl mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold text-[#3D873B]">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG (MAX. 5MB each)
                </p>
              </label>

              {/* Uploaded Documents List */}
              {clientDocuments && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">
                    Selected Documents:
                  </h4>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm truncate max-w-xs">
                      {clientDocuments.name}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveDocument}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="fileNumber">
                File Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
              />
            </div>
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
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
                name="martialStatus"
                value={formData.martialStatus}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="nationality">
                Nationality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="nationality">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="town">
                Town <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="town"
                value={formData.town}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
            />
          </div>
          <div className="grid md:grid-cols-3 gap-3 mb-3">
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="branchCode" className="font-bold text-sm">
                Branch<span className="text-red-500">*</span>
              </label>
              <select
                name="branchCode"
                value={formData.branchCode}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all bg-[#3D873B]/20"
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
