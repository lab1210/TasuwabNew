"use client";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import branchService from "@/Services/branchService";
import clientService from "@/Services/clientService";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaCamera, FaFileUpload, FaTimes, FaUser } from "react-icons/fa";

const EditClient = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    ClientId: "",
    FirstName: "",
    LastName: "",
    Email: "",
    PhoneNumber: "",
    Address: "",
    State: "",
    Town: "",
    Gender: "",
    Nationality: "",
    Occupation: "",
    MartialStatus: "",
    DateOfBirth: "",
    IdentificationType: "",
    IdentificationNumber: "",
    Employer: "",
    EmployerAddress: "",
    BranchCode: "",
    PerformedBy: user?.StaffCode || "SYSTEM",
  });

  const [branches, setBranches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientPhoto, setClientPhoto] = useState(null);
  const [clientDocuments, setClientDocuments] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const docsInputRef = useRef(null);
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId;

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
          ClientId: client.clientId || "",
          FirstName: client.firstName || "",
          LastName: client.lastName || "",
          Email: client.email || "",
          PhoneNumber: client.phoneNumber || "",
          Address: client.address || "",
          State: client.state || "",
          Town: client.town || "",
          Gender: client.gender || "",
          Nationality: client.nationality || "",
          MartialStatus: client.martialStatus || "",
          DateOfBirth: client.dateOfBirth
            ? new Date(
                client.dateOfBirth
                  .toString()
                  .replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")
              )
                .toISOString()
                .split("T")[0]
            : "",
          IdentificationType: client.identificationType || "",
          IdentificationNumber: client.identificationNumber || "",
          BranchCode: client.branchCode || "",
          PerformedBy: user?.StaffCode || "SYSTEM",
          Occupation: client?.occupation || "",
          Employer: client?.employer,
          EmployerAddress: client?.employerAddress,
          clientImage: client?.clientImage,
          creationForm: client?.clientCreationForm,
        });
        if (client.clientImage) {
          setPreviewImage(client.clientImage);
        }

        if (client.clientCreationForm) {
          setClientDocuments(client.clientCreationForm);
        }
      } catch (err) {
        toast.error("Failed to load client or branches.");
        console.error(err);
      }
    };

    if (clientId) {
      fetchData();
    }
  }, [clientId, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleRemoveDocument = () => {
    setClientDocuments(null);
    if (docsInputRef.current) {
      docsInputRef.current.value = "";
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Format date to YYYYMMDD number
      let dateOfBirth = 0;
      if (formData.DateOfBirth) {
        const date = new Date(formData.DateOfBirth);
        dateOfBirth = parseInt(
          `${date.getFullYear()}${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}${String(date.getDate()).padStart(2, "0")}`,
          10
        );
      }

      // Create FormData object
      const formDataToSend = new FormData();

      // Append all fields with exact names the API expects
      formDataToSend.append("ClientId", formData.ClientId);
      formDataToSend.append("FirstName", formData.FirstName);
      formDataToSend.append("LastName", formData.LastName);
      formDataToSend.append("Email", formData.Email);
      formDataToSend.append("PhoneNumber", formData.PhoneNumber);
      formDataToSend.append("Address", formData.Address);
      formDataToSend.append("State", formData.State);
      formDataToSend.append("Town", formData.Town);
      formDataToSend.append("Gender", formData.Gender);
      formDataToSend.append("Nationality", formData.Nationality);
      formDataToSend.append("Occupation", formData.Occupation);
      formDataToSend.append("MartialStatus", formData.MartialStatus);
      formDataToSend.append("DateOfBirth", dateOfBirth.toString());
      formDataToSend.append("IdentificationType", formData.IdentificationType);
      formDataToSend.append(
        "IdentificationNumber",
        formData.IdentificationNumber
      );
      formDataToSend.append("Employer", formData.Employer);
      formDataToSend.append("EmployerAddress", formData.EmployerAddress);
      formDataToSend.append("BranchCode", formData.BranchCode);
      formDataToSend.append("PerformedBy", formData.PerformedBy);

      // Append files if they exist
      if (clientPhoto) {
        formDataToSend.append("clientImage", clientPhoto);
      }
      if (clientDocuments) {
        formDataToSend.append("creationForm", clientDocuments);
      }

      // Debug output
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      await clientService.updateClient(formDataToSend);
      toast.success(`Client ${formData.ClientId} updated successfully!`);
      setTimeout(() => router.push("/Clients"), 2000);
    } catch (error) {
      console.error("Update error:", error);
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(
          ([field, messages]) => {
            toast.error(`${field}: ${messages.join(", ")}`);
          }
        );
      } else {
        toast.error(error.response?.data?.title || "Failed to update client");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-extrabold mb-2">Edit Client</p>
            <p className="text-sm text-gray-600">
              Update client information below.
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
                className="hidden"
                id="clientDocuments"
              />
              <label
                htmlFor="clientDocument"
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
                  PDF, JPG, PNG (MAX. 5MB)
                </p>
              </label>

              {/* Show single document if exists */}
              {clientDocuments && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">
                    Selected Document:
                  </h4>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm truncate max-w-xs">
                      {clientDocuments || "Uploaded Document"}
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
                name="ClientId"
                value={formData.ClientId}
                onChange={handleChange}
                required
                disabled
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="FirstName"
                value={formData.FirstName}
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
                name="LastName"
                value={formData.LastName}
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
                type="email"
                name="Email"
                value={formData.Email}
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
                name="PhoneNumber"
                value={formData.PhoneNumber}
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
                name="Gender"
                value={formData.Gender}
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
                name="MartialStatus"
                value={formData.MartialStatus}
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
                name="DateOfBirth"
                value={formData.DateOfBirth}
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
                name="IdentificationType"
                value={formData.IdentificationType}
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
                name="IdentificationNumber"
                value={formData.IdentificationNumber}
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
                name="Nationality"
                value={formData.Nationality}
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
                name="State"
                value={formData.State}
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
                name="Town"
                value={formData.Town}
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
              name="Address"
              value={formData.Address}
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
                name="Occupation"
                value={formData.Occupation}
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
                name="Employer"
                value={formData.Employer}
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
                name="EmployerAddress"
                value={formData.EmployerAddress}
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
                name="BranchCode"
                value={formData.BranchCode}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B] focus:border-transparent transition-all"
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
                name="PerformedBy"
                value={formData.PerformedBy}
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
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditClient;
