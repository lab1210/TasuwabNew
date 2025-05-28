"use client";
import Layout from "@/app/components/Layout";
import React, { useState } from "react";
import dummyClients from "../DummyClient";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import toast from "react-hot-toast";
import dummyLoans from "../DummyLoan";

const AddLoan = () => {
  const [isExistingClient, setIsExistingClient] = useState(false);
  const clientOptions = dummyClients.map((client) => ({
    label: `${client.firstName} ${client.lastName}`,
    value: client.clientId,
  }));
  const loanOptions = [
    { label: "New Loan", value: "New Loan" },
    { label: "Top-up Loan", value: "Top-up Loan" },
  ];

  const ownershipOptions = [
    { label: "Sole Proprietorship", value: "Sole Proprietorship" },
    { label: "Partnership", value: "Partnership" },
    { label: "Corporation", value: "Corporation" },
    { label: "Limited", value: "Limited" },
  ];

  const LoanTypes = [
    { label: "Emergency Loan", value: "Emergency Loan" },
    { label: "Personal Loan", value: "Personal Loan" },
    { label: "Business Loan", value: "Business Loan" },
    { label: "Current Deposit", value: "Current Deposit" },
  ];
  const [formData, setFormData] = useState({
    filename: "",
    name: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
    businessName: "",
    date: "",
    loanDetails: "",
    ownershipType: "",
    otherInfo: "",
    employerId: "",
    numberOfStaffs: "",
    businessStartupDate: "",
    loanType: "",
    loanAmount: "",
    paymentPeriodInMonths: "",
    status: "Pending",
    comments: "",
    approvedBy: "",
    approvedDate: "",
    forms: {
      statementOfAccount: null,
      idCard: null,
      passport: null,
      loanInvoice: null,
      physicalFormUpload: null,
    },
    guarantors: [
      {
        name: "",
        occupation: "",
        phone: "",
        address: "",
        relationship: "",
        forms: {
          idCard: null,
          passport: null,
          formUpload: null,
        },
      },
      {
        name: "",
        occupation: "",
        phone: "",
        address: "",
        relationship: "",
        forms: {
          idCard: null,
          passport: null,
          formUpload: null,
        },
      },
    ],
  });
  const handleFileChange = (event, formKey) => {
    const file = event.target.files[0];
    setFormData((prev) => ({
      ...prev,
      forms: {
        ...prev.forms,
        [formKey]: file,
      },
    }));
  };

  const handleGuarantorFileChange = (event, guarantorIndex, formKey) => {
    const file = event.target.files[0];
    setFormData((prev) => {
      const newGuarantors = [...prev.guarantors];
      newGuarantors[guarantorIndex] = {
        ...newGuarantors[guarantorIndex],
        forms: {
          ...newGuarantors[guarantorIndex].forms,
          [formKey]: file,
        },
      };
      return { ...prev, guarantors: newGuarantors };
    });
  };
  return (
    <Layout>
      <div className="w-full">
        <div>
          <p className="text-4xl font-extrabold mb-2">
            Asset Financing Request Form
          </p>
          <p className="text-sm text-gray-600">
            Fill in the form below to create an asset financing request.
          </p>
        </div>
        <form className="mt-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="name">
                File Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.filename}
                onChange={(e) => {
                  const userInput = e.target.value;
                  // If empty or already starts with TSBMLC, allow editing
                  if (!userInput || userInput.startsWith("TSBMLC")) {
                    setFormData((prev) => ({
                      ...prev,
                      filename: userInput,
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      filename: `TSBMLC ${userInput}`,
                    }));
                  }
                }}
                className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="name">
                Name <span className="text-red-500">*</span>
              </label>
              <CreatableSelect
                required
                isClearable
                options={clientOptions}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    // Find the client details by id
                    const selectedClient = dummyClients.find(
                      (c) => c.clientId === selectedOption.value
                    );
                    if (selectedClient) {
                      setFormData((prev) => ({
                        ...prev, // Keep all existing form data
                        name: `${selectedClient.firstName} ${selectedClient.lastName}`,
                        phone: selectedClient.phone,
                        email: selectedClient.email,
                        address: selectedClient.address,
                        dob: selectedClient.dob,
                      }));
                      setIsExistingClient(true); // lock other fields
                    }
                  } else {
                    // Cleared selection - reset form fields to empty, editable
                    setFormData((prev) => ({
                      ...prev, // Keep all other fields
                      name: "",
                      phone: "",
                      email: "",
                      address: "",
                      dob: "",
                    }));
                    setIsExistingClient(false);
                  }
                }}
                onInputChange={(inputValue, { action }) => {
                  // If user is typing (not selecting), unlock fields and update name
                  if (action === "input-change") {
                    setFormData((prev) => ({
                      ...prev,
                      name: inputValue,
                    }));
                    setIsExistingClient(false);
                  }
                }}
                value={
                  formData.name
                    ? { label: formData.name, value: formData.name }
                    : null
                }
                placeholder="Select or type client name"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? "#3D873B" : base.borderColor,
                    boxShadow: state.isFocused
                      ? "0 0 0 1px green"
                      : base.boxShadow,
                    "&:hover": {
                      borderColor: state.isFocused
                        ? "#3D873B"
                        : base.borderColor,
                    },
                  }),
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="address">
                DOB <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                id="dob"
                value={formData.dob}
                onChange={(e) =>
                  !isExistingClient &&
                  setFormData((prev) => ({ ...prev, dob: e.target.value }))
                }
                className={`border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md ${
                  isExistingClient ? "cursor-not-allowed" : ""
                }`}
                readOnly={isExistingClient}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="address">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  !isExistingClient &&
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className={`border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md ${
                  isExistingClient ? "cursor-not-allowed" : ""
                }`}
                readOnly={isExistingClient}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="address">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="address"
                id="address"
                required
                value={formData.address}
                onChange={(e) =>
                  !isExistingClient &&
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                className={`border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md ${
                  isExistingClient ? "cursor-not-allowed" : ""
                }`}
                readOnly={isExistingClient}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="name">
                Loan Details <span className="text-red-500">*</span>
              </label>
              <Select
                required
                isClearable
                options={loanOptions}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    const loanType = selectedOption.value;

                    setFormData((prev) => ({
                      ...prev,
                      loanDetails: loanType,
                    }));

                    if (loanType === "Top-up Loan" && formData.name) {
                      // Find client ID
                      const selectedClient = dummyClients.find(
                        (c) => `${c.firstName} ${c.lastName}` === formData.name
                      );

                      if (selectedClient) {
                        const existingLoan = dummyLoans.find(
                          (l) => l.clientId === selectedClient.clientId
                        );

                        if (existingLoan) {
                          toast.success(
                            "Existing loan details prefilled for top-up."
                          );
                          setFormData((prev) => ({
                            ...prev,
                            businessName: existingLoan.businessName,
                            ownershipType: existingLoan.ownershipType,
                            employerId: existingLoan.employerId,
                            loanAmount: existingLoan.loanAmount,
                            numberOfStaffs: existingLoan.numberOfStaffs,
                            paymentPeriodInMonths:
                              existingLoan.paymentPeriodInMonths,
                            businessStartupDate:
                              existingLoan.businessStartupDate,
                            loanType: existingLoan.loanType,
                            forms: {
                              statementOfAccount:
                                existingLoan.forms.statementOfAccount,
                              idCard: existingLoan.forms.idCard,
                              passport: existingLoan.forms.passport,
                              loanInvoice: existingLoan.forms.loanInvoice,
                              physicalFormUpload:
                                existingLoan.forms.physicalFormUpload,
                            },
                          }));
                        } else {
                          toast.error(
                            "No existing loan found for this client."
                          );
                        }
                      }
                    }
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      loanDetails: "",
                    }));
                  }
                }}
                placeholder="New or existing Loan"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? "#3D873B" : base.borderColor,
                    boxShadow: state.isFocused
                      ? "0 0 0 1px green"
                      : base.boxShadow,
                    "&:hover": {
                      borderColor: state.isFocused
                        ? "#3D873B"
                        : base.borderColor,
                    },
                  }),
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="businessName">
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                value={formData.businessName}
                onChange={(e) =>
                  formData.loanDetails === "Top-up Loan" &&
                  setFormData((prev) => ({
                    ...prev,
                    businessName: e.target.value,
                  }))
                }
                className={`border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md ${
                  formData.loanDetails === "Top-up Loan"
                    ? "cursor-not-allowed"
                    : ""
                }`}
                readOnly={formData.loanDetails === "Top-up Loan"}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="ownershipType">
                Ownership Type{" "}
                {formData.businessName && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <Select
                id="ownershipType"
                required={formData.businessName}
                isClearable
                options={ownershipOptions}
                value={
                  formData.ownershipType
                    ? ownershipOptions.find(
                        (opt) => opt.value === formData.ownershipType
                      )
                    : null
                }
                onChange={(selectedOption) => {
                  if (
                    selectedOption &&
                    formData.loanDetails !== "Top-up Loan"
                  ) {
                    const ownership = selectedOption.value;
                    setFormData((prev) => ({
                      ...prev,
                      ownershipType: ownership,
                    }));
                  }
                }}
                placeholder="Select Ownership type"
                isDisabled={formData.loanDetails === "Top-up Loan"} // <-- disable here
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? "#3D873B" : base.borderColor,
                    boxShadow: state.isFocused
                      ? "0 0 0 1px green"
                      : base.boxShadow,
                    "&:hover": {
                      borderColor: state.isFocused
                        ? "#3D873B"
                        : base.borderColor,
                    },
                  }),
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="ownershipType">
                Other Information
              </label>
              <input
                type="text"
                value={formData.otherInfo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    otherInfo: e.target.value,
                  }))
                }
                className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="ownershipType">
                Employer ID
                {formData.businessName && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <input
                type="text"
                readOnly={formData.loanDetails === "Top-up Loan"}
                value={formData.employerId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    employerId: e.target.value,
                  }))
                }
                className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="numberOfStaffs">
                Current Number of Staffs
                {formData.businessName && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <input
                min={formData.businessName ? 1 : 0}
                type="number"
                readOnly={formData.loanDetails === "Top-up Loan"}
                value={formData.numberOfStaffs}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    numberOfStaffs: e.target.value,
                  }))
                }
                className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="font-bold text-sm"
                htmlFor="businessStartupDate"
              >
                Business Start Up Date
                {formData.businessName && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <input
                type="date"
                readOnly={formData.loanDetails === "Top-up Loan"}
                value={formData.businessStartupDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    businessStartupDate: e.target.value,
                  }))
                }
                className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="name">
                Loan Type <span className="text-red-500">*</span>
              </label>
              <Select
                id="loanType"
                required
                isClearable
                isSearchable
                options={LoanTypes}
                value={
                  formData.loanType
                    ? LoanTypes.find((opt) => opt.value === formData.loanType)
                    : null
                }
                onChange={(selectedOption) => {
                  if (
                    selectedOption &&
                    formData.loanDetails !== "Top-up Loan"
                  ) {
                    const type = selectedOption.value;
                    setFormData((prev) => ({
                      ...prev,
                      loanType: type,
                    }));
                  }
                }}
                placeholder="Select Loan Type"
                isDisabled={formData.loanDetails === "Top-up Loan"} // <-- disable here
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? "#3D873B" : base.borderColor,
                    boxShadow: state.isFocused
                      ? "0 0 0 1px green"
                      : base.boxShadow,
                    "&:hover": {
                      borderColor: state.isFocused
                        ? "#3D873B"
                        : base.borderColor,
                    },
                  }),
                }}
              />
            </div>

            <div
              className={`${
                formData.loanDetails === "Top-up Loan"
                  ? "grid grid-cols-2 gap-3"
                  : ""
              }`}
            >
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="loanAmount">
                  Loan Amount Applied for
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  readOnly={formData.loanDetails === "Top-up Loan"}
                  value={formData.loanAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      loanAmount: e.target.value,
                    }))
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
              {formData.loanDetails === "Top-up Loan" && (
                <div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">Top-up Amount</label>
                    <input
                      type="number"
                      value={formData.topupAmount || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          topupAmount: e.target.value,
                        }))
                      }
                      className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>

            <div
              className={`${
                formData.loanDetails === "Top-up Loan"
                  ? "grid grid-cols-2 gap-3"
                  : ""
              }`}
            >
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="loanAmount">
                  Payment Period (months)
                  <span className="text-red-500">*</span>
                </label>
                <input
                  readOnly={formData.loanDetails === "Top-up Loan"}
                  type="number"
                  min={1}
                  value={formData.paymentPeriodInMonths}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentPeriodInMonths: e.target.value,
                    }))
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
              {formData.loanDetails === "Top-up Loan" && (
                <div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm">
                      New Payment Period (months)
                    </label>
                    <input
                      type="number"
                      value={formData.newPaymentPeriod || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          newPaymentPeriod: e.target.value,
                        }))
                      }
                      className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          {formData.forms &&
            [
              "statementOfAccount",
              "idCard",
              "passport",
              "loanInvoice",
              "physicalFormUpload",
            ].map((formKey) => {
              const file = formData.forms[formKey];
              const isFileObject = file && typeof file !== "string";
              const previewUrl = isFileObject
                ? URL.createObjectURL(file)
                : null;

              return (
                <div
                  key={formKey}
                  style={{
                    marginBottom: "1.5rem",
                    marginTop: "1.5rem",
                    padding: "12px 16px",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <label
                    htmlFor={formKey}
                    style={{
                      display: "block",
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: 16,
                      color: "#333",
                      textTransform: "capitalize",
                    }}
                  >
                    {formKey.replace(/([A-Z])/g, " $1")}
                  </label>

                  <input
                    type="file"
                    id={formKey}
                    name={formKey}
                    accept={
                      formKey === "passport" || formKey === "idCard"
                        ? ".pdf,.jpg,.jpeg,.png"
                        : ".pdf"
                    }
                    onChange={(e) => handleFileChange(e, formKey)}
                    style={{
                      display: "block",
                      marginBottom: "12px",
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1.5px solid #ccc",
                      cursor: "pointer",
                      transition: "border-color 0.3s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#007bff")}
                    onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                  />

                  {isFileObject && (
                    <div
                      style={{
                        display: "inline-block",
                        borderRadius: 8,
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      {file.type.startsWith("image/") && (
                        <img
                          src={previewUrl}
                          alt={`Preview of ${formKey}`}
                          style={{
                            width: 160,
                            height: "auto",
                            display: "block",
                          }}
                          onLoad={() => URL.revokeObjectURL(previewUrl)}
                        />
                      )}

                      {file.type === "application/pdf" && (
                        <embed
                          src={previewUrl}
                          type="application/pdf"
                          width={160}
                          height={210}
                          style={{ display: "block" }}
                        />
                      )}
                    </div>
                  )}

                  {!isFileObject && file && (
                    <p
                      style={{
                        marginTop: 8,
                        fontStyle: "italic",
                        color: "#555",
                        userSelect: "text",
                      }}
                    >
                      Uploaded file: {file}
                    </p>
                  )}
                </div>
              );
            })}
          <div>
            <p className="text-xl font-bold text-gray-800 mb-5">
              Guarantor 1 Details
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="name">
                  Guarantor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.guarantors[0].name}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const updatedGuarantors = [...prev.guarantors]; // Create a copy of the guarantors array
                      updatedGuarantors[0] = {
                        ...updatedGuarantors[0], // Copy all existing properties
                        name: e.target.value, // Update just the name
                      };
                      return {
                        ...prev, // Copy all other form data
                        guarantors: updatedGuarantors, // Update the guarantors array
                      };
                    })
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="name">
                  Occupation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.guarantors[0].occupation}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const updatedGuarantors = [...prev.guarantors]; // Create a copy of the guarantors array
                      updatedGuarantors[0] = {
                        ...updatedGuarantors[0], // Copy all existing properties
                        occupation: e.target.value, // Update just the name
                      };
                      return {
                        ...prev, // Copy all other form data
                        guarantors: updatedGuarantors, // Update the guarantors array
                      };
                    })
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="name">
                  Guarantor Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.guarantors[0].phone}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const updatedGuarantors = [...prev.guarantors]; // Create a copy of the guarantors array
                      updatedGuarantors[0] = {
                        ...updatedGuarantors[0], // Copy all existing properties
                        phone: e.target.value, // Update just the name
                      };
                      return {
                        ...prev, // Copy all other form data
                        guarantors: updatedGuarantors, // Update the guarantors array
                      };
                    })
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="name">
                  Guarantor Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.guarantors[0].address}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const updatedGuarantors = [...prev.guarantors]; // Create a copy of the guarantors array
                      updatedGuarantors[0] = {
                        ...updatedGuarantors[0], // Copy all existing properties
                        address: e.target.value, // Update just the name
                      };
                      return {
                        ...prev, // Copy all other form data
                        guarantors: updatedGuarantors, // Update the guarantors array
                      };
                    })
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="name">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.guarantors[0].relationship}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const updatedGuarantors = [...prev.guarantors]; // Create a copy of the guarantors array
                      updatedGuarantors[0] = {
                        ...updatedGuarantors[0], // Copy all existing properties
                        relationship: e.target.value, // Update just the name
                      };
                      return {
                        ...prev, // Copy all other form data
                        guarantors: updatedGuarantors, // Update the guarantors array
                      };
                    })
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
            </div>
            {formData.guarantors[0]?.forms &&
              ["idCard", "passport", "formUpload"].map((formKey) => {
                const file = formData.guarantors[0]?.forms[formKey];
                const isFileObject = file && typeof file !== "string";
                const previewUrl = isFileObject
                  ? URL.createObjectURL(file)
                  : null;

                return (
                  <div
                    key={formKey}
                    style={{
                      marginBottom: "1.5rem",
                      marginTop: "1.5rem",
                      padding: "12px 16px",
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <label
                      htmlFor={formKey}
                      style={{
                        display: "block",
                        fontWeight: 600,
                        marginBottom: 8,
                        fontSize: 16,
                        color: "#333",
                        textTransform: "capitalize",
                      }}
                    >
                      {formKey.replace(/([A-Z])/g, " $1")}
                    </label>

                    <input
                      type="file"
                      id={formKey}
                      name={formKey}
                      accept={
                        formKey === "passport" || formKey === "idCard"
                          ? ".pdf,.jpg,.jpeg,.png"
                          : ".pdf"
                      }
                      onChange={(e) => handleGuarantorFileChange(e, 0, formKey)}
                      style={{
                        display: "block",
                        marginBottom: "12px",
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1.5px solid #ccc",
                        cursor: "pointer",
                        transition: "border-color 0.3s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#007bff")}
                      onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                    />

                    {isFileObject && (
                      <div
                        style={{
                          display: "inline-block",
                          borderRadius: 8,
                          overflow: "hidden",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      >
                        {file.type.startsWith("image/") && (
                          <img
                            src={previewUrl}
                            alt={`Preview of ${formKey}`}
                            style={{
                              width: 160,
                              height: "auto",
                              display: "block",
                            }}
                            onLoad={() => URL.revokeObjectURL(previewUrl)}
                          />
                        )}

                        {file.type === "application/pdf" && (
                          <embed
                            src={previewUrl}
                            type="application/pdf"
                            width={160}
                            height={210}
                            style={{ display: "block" }}
                          />
                        )}
                      </div>
                    )}

                    {!isFileObject && file && (
                      <p
                        style={{
                          marginTop: 8,
                          fontStyle: "italic",
                          color: "#555",
                          userSelect: "text",
                        }}
                      >
                        Uploaded file: {file}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800 mb-5">
              Guarantor 2 Details
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="name">
                  Guarantor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.guarantors[1].name}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const updatedGuarantors = [...prev.guarantors]; // Create a copy of the guarantors array
                      updatedGuarantors[1] = {
                        ...updatedGuarantors[1], // Copy all existing properties
                        name: e.target.value, // Update just the name
                      };
                      return {
                        ...prev, // Copy all other form data
                        guarantors: updatedGuarantors, // Update the guarantors array
                      };
                    })
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="name">
                  Occupation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.guarantors[1].occupation}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const updatedGuarantors = [...prev.guarantors]; // Create a copy of the guarantors array
                      updatedGuarantors[1] = {
                        ...updatedGuarantors[1], // Copy all existing properties
                        occupation: e.target.value, // Update just the name
                      };
                      return {
                        ...prev, // Copy all other form data
                        guarantors: updatedGuarantors, // Update the guarantors array
                      };
                    })
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="name">
                  Guarantor Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.guarantors[1].phone}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const updatedGuarantors = [...prev.guarantors]; // Create a copy of the guarantors array
                      updatedGuarantors[1] = {
                        ...updatedGuarantors[1], // Copy all existing properties
                        phone: e.target.value, // Update just the name
                      };
                      return {
                        ...prev, // Copy all other form data
                        guarantors: updatedGuarantors, // Update the guarantors array
                      };
                    })
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="name">
                  Guarantor Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.guarantors[1].address}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const updatedGuarantors = [...prev.guarantors]; // Create a copy of the guarantors array
                      updatedGuarantors[1] = {
                        ...updatedGuarantors[1], // Copy all existing properties
                        address: e.target.value, // Update just the name
                      };
                      return {
                        ...prev, // Copy all other form data
                        guarantors: updatedGuarantors, // Update the guarantors array
                      };
                    })
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="name">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.guarantors[1].relationship}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const updatedGuarantors = [...prev.guarantors]; // Create a copy of the guarantors array
                      updatedGuarantors[1] = {
                        ...updatedGuarantors[1], // Copy all existing properties
                        relationship: e.target.value, // Update just the name
                      };
                      return {
                        ...prev, // Copy all other form data
                        guarantors: updatedGuarantors, // Update the guarantors array
                      };
                    })
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
            </div>
            {formData.guarantors[1]?.forms &&
              ["idCard", "passport", "formUpload"].map((formKey) => {
                const file = formData.guarantors[1]?.forms[formKey];
                const isFileObject = file && typeof file !== "string";
                const previewUrl = isFileObject
                  ? URL.createObjectURL(file)
                  : null;

                return (
                  <div
                    key={formKey}
                    style={{
                      marginBottom: "1.5rem",
                      marginTop: "1.5rem",
                      padding: "12px 16px",
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <label
                      htmlFor={formKey}
                      style={{
                        display: "block",
                        fontWeight: 600,
                        marginBottom: 8,
                        fontSize: 16,
                        color: "#333",
                        textTransform: "capitalize",
                      }}
                    >
                      {formKey.replace(/([A-Z])/g, " $1")}
                    </label>

                    <input
                      type="file"
                      id={formKey}
                      name={formKey}
                      accept={
                        formKey === "passport" || formKey === "idCard"
                          ? ".pdf,.jpg,.jpeg,.png"
                          : ".pdf"
                      }
                      onChange={(e) => handleGuarantorFileChange(e, 1, formKey)}
                      style={{
                        display: "block",
                        marginBottom: "12px",
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1.5px solid #ccc",
                        cursor: "pointer",
                        transition: "border-color 0.3s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#007bff")}
                      onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                    />

                    {isFileObject && (
                      <div
                        style={{
                          display: "inline-block",
                          borderRadius: 8,
                          overflow: "hidden",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      >
                        {file.type.startsWith("image/") && (
                          <img
                            src={previewUrl}
                            alt={`Preview of ${formKey}`}
                            style={{
                              width: 160,
                              height: "auto",
                              display: "block",
                            }}
                            onLoad={() => URL.revokeObjectURL(previewUrl)}
                          />
                        )}

                        {file.type === "application/pdf" && (
                          <embed
                            src={previewUrl}
                            type="application/pdf"
                            width={160}
                            height={210}
                            style={{ display: "block" }}
                          />
                        )}
                      </div>
                    )}

                    {!isFileObject && file && (
                      <p
                        style={{
                          marginTop: 8,
                          fontStyle: "italic",
                          color: "#555",
                          userSelect: "text",
                        }}
                      >
                        Uploaded file: {file}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
          <div className="flex justify-end">
            <button className="bg-[#3D873B] text-white font-bold py-2 px-4 rounded-md cursor-pointer">
              Add
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddLoan;
