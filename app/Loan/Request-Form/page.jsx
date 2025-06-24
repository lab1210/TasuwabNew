"use client";
import Layout from "@/app/components/Layout";
import React, { useEffect, useState } from "react";
import dummyClients from "../DummyClient";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import toast from "react-hot-toast";
import dummyLoans from "../DummyLoan";
import { useRouter } from "next/navigation";
import useLoanStore from "@/app/components/loanStore";

const AddLoan = () => {
  const [isExistingClient, setIsExistingClient] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
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
    { label: "Asset Financing", value: "Asset Financing" },
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
    assetName: "",
    assetDescription: "",
    assetQuantity: "",
    assetPrice: "",
    preferredSupplier: "",
    supplierQuote: "",
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
        email: "",
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
        email: "",
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

  const { loanFormData, setLoanFormData, createEmptyFormData } = useLoanStore();
  useEffect(() => {
    // If there's saved data, restore it into local form state
    if (loanFormData) {
      setFormData(loanFormData);
    }
  }, []);

  const validateForm = () => {
    const requiredFields = [
      "filename",
      "name",
      "dob",
      "phone",
      "email",
      "address",
      "loanDetails",
      "loanType",
      ...(formData.loanType !== "Asset Financing" ? ["loanAmount"] : []),
      "paymentPeriodInMonths",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill the "${field}" field.`);
        return false;
      }
    }

    // Additional checks for "Asset Financing"
    if (formData.loanType === "Asset Financing") {
      const assetFields = [
        "assetName",
        "assetDescription",
        "assetQuantity",
        "assetPrice",
      ];
      for (let field of assetFields) {
        if (!formData[field]) {
          toast.error(`Please fill the "${field}" field.`);
          return false;
        }
      }
    }

    return true;
  };

  const handleMoveToPricing = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoanFormData(formData);
    router.push(`/Pricing/${formData.filename}`);
  };

  return (
    <Layout>
      <div className="w-full">
        <div>
          <p className="text-4xl font-extrabold mb-2">Loan Request Form</p>
          <p className="text-sm text-gray-600">
            Fill in the form below to create an asset financing request.
          </p>
        </div>
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("general")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "general"
                    ? "border-[#3D873B] text-[#3D873B]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                General Information
              </button>
              {formData.loanType === "Asset Financing" && (
                <button
                  onClick={() => setActiveTab("asset")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "asset"
                      ? "border-[#3D873B] text-[#3D873B]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Asset Financing Details
                </button>
              )}
              <button
                onClick={() => setActiveTab("Form Upload")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "Form Upload"
                    ? "border-[#3D873B] text-[#3D873B]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Form Upload
              </button>
              <button
                onClick={() => setActiveTab("Guarantor")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "Guarantor"
                    ? "border-[#3D873B] text-[#3D873B]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Guarantor Information
              </button>
            </nav>
          </div>
        </div>

        <form className="mt-6">
          {activeTab === "general" && (
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
                        filename: `TSBMLC${userInput}`,
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
                      borderColor: state.isFocused
                        ? "#3D873B"
                        : base.borderColor,
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
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
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
                  value={
                    formData.loanDetails
                      ? loanOptions.find(
                          (opt) => opt.value === formData.loanDetails
                        )
                      : null
                  }
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
                          (c) =>
                            `${c.firstName} ${c.lastName}` === formData.name
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
                      borderColor: state.isFocused
                        ? "#3D873B"
                        : base.borderColor,
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
                      borderColor: state.isFocused
                        ? "#3D873B"
                        : base.borderColor,
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
                      borderColor: state.isFocused
                        ? "#3D873B"
                        : base.borderColor,
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
                {formData.loanType !== "Asset Financing" && (
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
                )}
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
          )}

          {activeTab === "asset" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="assetName">
                  Asset Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="assetName"
                  required
                  value={formData.assetName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assetName: e.target.value,
                    }))
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="assetDescription">
                  Asset Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="assetDescription"
                  required
                  rows={1}
                  value={formData.assetDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assetDescription: e.target.value,
                    }))
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="assetQuantity">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="assetQuantity"
                  required
                  min="1"
                  value={formData.assetQuantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assetQuantity: e.target.value,
                    }))
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="assetPrice">
                  Asset Price (per unit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="assetPrice"
                  required
                  min="0"
                  step="0.01"
                  value={formData.assetPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assetPrice: e.target.value,
                    }))
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>

              <div className="flex flex-col gap-2 ">
                <label
                  className="font-bold text-sm"
                  htmlFor="preferredSupplier"
                >
                  Preferred Supplier
                </label>
                <input
                  type="text"
                  id="preferredSupplier"
                  required
                  value={formData.preferredSupplier}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredSupplier: e.target.value,
                    }))
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm" htmlFor="assetPrice">
                  Supplier Quote
                </label>
                <input
                  type="number"
                  id="supplierQuote"
                  required
                  min="0"
                  step="0.01"
                  value={formData.supplierQuote}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      supplierQuote: e.target.value,
                    }))
                  }
                  className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
            </div>
          )}

          {activeTab === "Form Upload" &&
            formData.forms &&
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
          {activeTab === "Guarantor" && (
            <>
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
                      Guarantor Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.guarantors[0].email}
                      onChange={(e) =>
                        setFormData((prev) => {
                          const updatedGuarantors = [...prev.guarantors]; // Create a copy of the guarantors array
                          updatedGuarantors[0] = {
                            ...updatedGuarantors[0], // Copy all existing properties
                            email: e.target.value, // Update just the name
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
                          onChange={(e) =>
                            handleGuarantorFileChange(e, 0, formKey)
                          }
                          style={{
                            display: "block",
                            marginBottom: "12px",
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1.5px solid #ccc",
                            cursor: "pointer",
                            transition: "border-color 0.3s",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#007bff")
                          }
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
                          onChange={(e) =>
                            handleGuarantorFileChange(e, 1, formKey)
                          }
                          style={{
                            display: "block",
                            marginBottom: "12px",
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1.5px solid #ccc",
                            cursor: "pointer",
                            transition: "border-color 0.3s",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#007bff")
                          }
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
            </>
          )}
          {activeTab === "Guarantor" && (
            <div className="flex justify-end">
              <button
                onClick={handleMoveToPricing}
                className="bg-[#3D873B] text-white font-bold py-2 px-4 rounded-md cursor-pointer"
              >
                Move to Pricing Model
              </button>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default AddLoan;
