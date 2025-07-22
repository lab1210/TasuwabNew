"use client";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/Services/authService";
import branchService from "@/Services/branchService";
import LoanTypeService from "@/Services/loanTypeService";
import supplierService from "@/Services/supplierService";
import productService from "@/Services/productService";
import { useRouter } from "next/navigation";
import React, { act, useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Select from "react-select";
import useAccountService from "@/Services/accountService";
import loanService from "@/Services/loanService";

const roundUpToNearestNaira = (value) => {
  return Math.ceil(Number(value) || 0);
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(roundUpToNearestNaira(value));

const RequestForm = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    LoanRequest: {
      FileNo: "",
      AccountCode: "",
      BusinessName: "",
      EmployerId: "",
      BusinessOwnershipType: "",
      OtherInformation: "",
      NumberOfStaff: "",
      BusinessStartDate: "",
      InitialAmount: 0,
      Purpose: "",
      PaymentPeriodDays: 0,
      LoanTypeCode: "",
      BranchCode: user?.BranchCode || "",
      PerformedBy: user?.StaffCode || "",
      NeedSupplierRequest: false,
      SupplierId: "",
      AssetDescription: "",
      AssetName: "",
      AssetQuantity: 0,
      AssetPricePerUnit: 0,
      MinimumEquityContribution: 0,
      AdditionalClientContribution: 0,
      CostOfAssetFinanced: 0,
      AvgInflationRate: 0,
      InflationMultiplier: 0,
      PostInflationCost: 0,
      MarketRiskPremium: 0,
      OperationExpenses: 0,
      TotalRealOperationalCost: 0,
      ProfitMargin: 0,
      MinimumAssetFinancing: 0,
      EstimatedProfit: 0,
      PercentOfProfit: 0,
      Guarantor1Name: "",
      Guarantor1Occupation: "",
      Guarantor1Phone: "",
      Guarantor1Address: "",
      Guarantor1Relationship: "",
      Guarantor2Name: "",
      Guarantor2Occupation: "",
      Guarantor2Phone: "",
      Guarantor2Address: "",
      Guarantor2Relationship: "",
    },
    StatementOfAccountDoc: null,
    IdCardDoc: null,
    PassportDoc: null,
    LoanInvoiceDoc: null,
    FormDoc: null,
    Guarantor1IdCard: null,
    Guarantor1Passport: null,
    Guarantor1FormUpload: null,
    Guarantor2IdCard: null,
    Guarantor2Passport: null,
    Guarantor2FormUpload: null,
  });

  const roundToTwoDecimals = (value) => {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  };
  // Fetch initial data only once when component mounts
  useEffect(() => {
    if (hasFetchedInitialData) return;

    const fetchData = async () => {
      try {
        const [accountsData, loanTypesData, suppliersData] = await Promise.all([
          useAccountService.getAllAccounts(),
          LoanTypeService.getLoanTypes(),
          supplierService.getSuppliers(),
        ]);
        setAccounts(accountsData);
        setLoanTypes(loanTypesData);
        setSuppliers(suppliersData || []);
        setHasFetchedInitialData(true);
      } catch (error) {
        toast.error("Failed to load initial data");
        console.error(error);
      }
    };
    fetchData();
  }, [hasFetchedInitialData]);

  useEffect(() => {
    return () => {
      // Clean up all object URLs when component unmounts
      const fileFields = [
        "PassportDoc",
        "Guarantor1Passport",
        "Guarantor2Passport",
      ];

      fileFields.forEach((field) => {
        if (formData[field]?.preview) {
          URL.revokeObjectURL(formData[field].preview);
        }
      });
    };
  }, []);
  // Set user data and fetch branch (only once when user is available)
  useEffect(() => {
    if (!user || branchName) return;

    setFormData((prev) => ({
      ...prev,
      LoanRequest: {
        ...prev.LoanRequest,
        BranchCode: user.BranchCode || "",
        PerformedBy: user.StaffCode || "",
      },
    }));

    const fetchBranch = async () => {
      try {
        if (user.BranchCode) {
          const branch = await branchService.getBranchById(user.BranchCode);
          setBranchName(branch?.name || user.BranchCode);
        }
      } catch (error) {
        console.error("Error fetching branch:", error);
        setBranchName(user.BranchCode || "");
      }
    };
    fetchBranch();
  }, [user, branchName]);

  // Restore selected supplier when returning to asset tab
  useEffect(() => {
    if (formData.LoanRequest.SupplierId && !selectedSupplier) {
      const currentSupplier = suppliers.find(
        (s) => s.id === formData.LoanRequest.SupplierId
      );
      if (currentSupplier) {
        setSelectedSupplier(currentSupplier);
      }
    }
  }, [formData.LoanRequest.SupplierId, selectedSupplier, suppliers]);

  // Fetch products when supplier changes
  useEffect(() => {
    if (!selectedSupplier?.productPrices) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      // Skip if we already have products for this supplier
      if (
        products.length > 0 &&
        products[0].supplierId === selectedSupplier.id
      ) {
        return;
      }

      setIsLoadingProducts(true);
      try {
        const productIds = Object.keys(selectedSupplier.productPrices);
        const allProducts = await productService.getAllProducts();

        const productsWithDetails = productIds.map((productId) => {
          const product = allProducts.find((p) => p.id === productId) || {};
          return {
            id: productId,
            supplierId: selectedSupplier.id,
            name: product.name || `Product ${productId}`,
            price: selectedSupplier.productPrices[productId] || 0,
          };
        });

        setProducts(productsWithDetails);
      } catch (error) {
        toast.error("Failed to load products");
        console.error(error);
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [selectedSupplier]);

  // Financial calculations
  useEffect(() => {
    if (!isFormValid) return;

    const total = formData.LoanRequest.NeedSupplierRequest
      ? formData.LoanRequest.AssetPricePerUnit *
        formData.LoanRequest.AssetQuantity
      : Number(formData.LoanRequest.InitialAmount || 0);

    // Use the stored equity amount directly
    const equityAmount =
      Number(formData.LoanRequest.MinimumEquityContribution) || 0;
    const additional =
      Number(formData.LoanRequest.AdditionalClientContribution) || 0;
    const costFinanced = total - equityAmount - additional;

    // Rest of your calculations remain the same...
    const rateDecimal =
      Number(formData.LoanRequest.AvgInflationRate || 0) / 100;
    const years = Number(formData.LoanRequest.PaymentPeriodDays || 0) / 12;
    const inflationMultiplier =
      (1 + rateDecimal) ** formData.LoanRequest.PaymentPeriodDays;
    const postInflation = costFinanced * inflationMultiplier;

    const mrp = Number(formData.LoanRequest.MarketRiskPremium || 0) / 100;
    const opExp = Number(formData.LoanRequest.OperationExpenses || 0) / 100;
    const totalRealOpCost = postInflation * (1 + mrp + opExp);

    const minPrice = roundToTwoDecimals(
      totalRealOpCost /
        (1 - Number(formData.LoanRequest.ProfitMargin || 0) / 100)
    );
    const profit = roundToTwoDecimals(minPrice - costFinanced);
    const profitPct = roundToTwoDecimals((profit / costFinanced) * 100);

    setFormData((prev) => ({
      ...prev,
      LoanRequest: {
        ...prev.LoanRequest,
        InitialAmount: total,
        CostOfAssetFinanced: costFinanced >= 0 ? costFinanced : 0,
        InflationMultiplier: inflationMultiplier,
        PostInflationCost: postInflation,
        TotalRealOperationalCost: totalRealOpCost,
        MinimumAssetFinancing: minPrice,
        EstimatedProfit: profit,
        PercentOfProfit: profitPct,
      },
    }));
  }, [
    isFormValid,
    formData.LoanRequest.InitialAmount,
    formData.LoanRequest.AssetPricePerUnit,
    formData.LoanRequest.AssetQuantity,
    formData.LoanRequest.AdditionalClientContribution,
    formData.LoanRequest.PaymentPeriodDays,
    formData.LoanRequest.AvgInflationRate,
    formData.LoanRequest.MarketRiskPremium,
    formData.LoanRequest.OperationExpenses,
    formData.LoanRequest.ProfitMargin,
    formData.LoanRequest.MinimumEquityContribution,
    formData.LoanRequest.LoanTypeCode,
  ]);

  useEffect(() => {
    if (!formData.LoanRequest.LoanTypeCode) return;

    const type = loanTypes.find(
      (lt) => lt.code === formData.LoanRequest.LoanTypeCode
    );
    if (!type) return;

    const total = formData.LoanRequest.NeedSupplierRequest
      ? formData.LoanRequest.AssetPricePerUnit *
        formData.LoanRequest.AssetQuantity
      : Number(formData.LoanRequest.InitialAmount || 0);

    const equityAmount = (type.amount / 100) * total;

    setFormData((prev) => ({
      ...prev,
      LoanRequest: {
        ...prev.LoanRequest,
        MinimumEquityContribution: equityAmount,
      },
    }));
  }, [
    formData.LoanRequest.InitialAmount,
    formData.LoanRequest.AssetPricePerUnit,
    formData.LoanRequest.AssetQuantity,
    formData.LoanRequest.LoanTypeCode,
    formData.LoanRequest.NeedSupplierRequest,
    loanTypes,
  ]);

  // Form validation
  useEffect(() => {
    const validateForm = () => {
      const requiredFields = [
        "AccountCode",
        "Purpose",
        "PaymentPeriodDays",
        "LoanTypeCode",
        "FileNo",
        "InitialAmount",
        "PaymentPeriodDays",
        "BranchCode",
        "PerformedBy",
        "Guarantor1Name",
        "Guarantor1Occupation",
        "Guarantor1Phone",
        "Guarantor1Address",
        "Guarantor1Relationship",
        "Guarantor2Name",
        "Guarantor2Occupation",
        "Guarantor2Phone",
        "Guarantor2Address",
        "Guarantor2Relationship",
        "OtherInformation",
      ];

      const basicValidation = requiredFields.every((field) => {
        const value = formData.LoanRequest[field];
        return value !== null && value !== undefined && value !== "";
      });

      if (formData.LoanRequest.NeedSupplierRequest) {
        return (
          basicValidation &&
          formData.LoanRequest.SupplierId &&
          formData.LoanRequest.AssetName &&
          formData.LoanRequest.AssetQuantity > 0
        );
      } else {
        return basicValidation && formData.LoanRequest.InitialAmount > 0;
      }
    };
    setIsFormValid(validateForm());
  }, [formData]);

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Create object with file metadata
      const fileData = {
        file: file, // The actual File object
        name: file.name, // The filename for display
        preview: fieldName.includes("Passport")
          ? URL.createObjectURL(file)
          : null, // Preview for images
        lastModified: file.lastModified,
        size: file.size,
        type: file.type,
      };

      setFormData((prev) => ({
        ...prev,
        [fieldName]: fileData,
      }));
    }
  };

  const handleLoanTypeChange = (selectedOption) => {
    const type = loanTypes.find((lt) => lt.code === selectedOption.value);
    const equityPercentage = type?.amount || 0;

    // Calculate total amount based on current form state
    const total = formData.LoanRequest.NeedSupplierRequest
      ? formData.LoanRequest.AssetPricePerUnit *
        formData.LoanRequest.AssetQuantity
      : Number(formData.LoanRequest.InitialAmount || 0);

    // Calculate and store the actual equity amount
    const equityAmount = (equityPercentage / 100) * total;

    setFormData((prev) => ({
      ...prev,
      LoanRequest: {
        ...prev.LoanRequest,
        LoanTypeCode: selectedOption.value,
        MinimumEquityContribution: equityAmount,
      },
    }));
  };

  const handleAccountSelect = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      LoanRequest: {
        ...prev.LoanRequest,
        AccountCode: selectedOption.value,
      },
    }));
  };

  const handleSupplierChange = useCallback(
    (option) => {
      const newSupplier = option?.supplier || null;
      setSelectedSupplier(newSupplier);

      setFormData((prev) => ({
        ...prev,
        LoanRequest: {
          ...prev.LoanRequest,
          SupplierId: option?.value || "",
          // Only clear these if supplier actually changed
          ...(selectedSupplier?.id !== newSupplier?.id
            ? {
                AssetName: "",
                AssetDescription: "",
                AssetQuantity: 0,
                AssetPricePerUnit: 0,
              }
            : {}),
        },
      }));
    },
    [selectedSupplier]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      // Append all LoanRequest fields individually
      Object.entries(formData.LoanRequest).forEach(([key, value]) => {
        formDataToSend.append(`LoanRequest.${key}`, value);
      });

      // Append all files
      const fileFields = [
        "StatementOfAccountDoc",
        "IdCardDoc",
        "PassportDoc",
        "LoanInvoiceDoc",
        "FormDoc",
        "Guarantor1IdCard",
        "Guarantor1Passport",
        "Guarantor1FormUpload",
        "Guarantor2IdCard",
        "Guarantor2Passport",
        "Guarantor2FormUpload",
      ];

      fileFields.forEach((field) => {
        if (formData[field]?.file) {
          formDataToSend.append(
            field,
            formData[field].file,
            formData[field].name
          );
        }
      });

      await loanService.postLoan(formDataToSend);
      toast.success("Loan request submitted successfully!");
      router.push("/Loan");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderInputField = (
    label,
    name,
    value,
    onChange,
    type = "text",
    required = false,
    disabled = false,
    isCurrency = false
  ) => (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-sm text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`border ${
          disabled ? "bg-gray-100" : "bg-white"
        } rounded-md px-3 py-2 text-sm`}
      />
      {isCurrency && (
        <span className="text-lg text-[#3D873B] font-bold text-right">
          {formatCurrency(value || 0)}
        </span>
      )}
    </div>
  );
  const renderDateInputField = (
    label,
    name,
    value,
    onChange,
    required = false
  ) => {
    // Convert yyyymmdd to yyyy-mm-dd for the input[type="date"]
    const displayValue =
      value && value.length === 8
        ? `${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(
            6,
            8
          )}`
        : "";

    return (
      <div className="flex flex-col gap-1">
        <label className="font-medium text-sm text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          name={name}
          type="date"
          value={displayValue}
          onChange={(e) => {
            const dateValue = e.target.value;
            const formattedDate = dateValue ? dateValue.replace(/-/g, "") : "";
            onChange(formattedDate);
          }}
          required={required}
          className="border bg-white rounded-md px-3 py-2 text-sm"
        />
      </div>
    );
  };
  const renderSelectField = (
    label,
    name,
    options,
    value,
    onChange,
    required = false
  ) => (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-sm text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Select
        name={name}
        options={options}
        value={options.find((opt) => opt.value === value)}
        onChange={onChange}
        className="text-sm"
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "36px",
            fontSize: "14px",
          }),
        }}
      />
    </div>
  );

  const renderFileUpload = (
    label,
    name,
    onChange,
    accept = "*",
    fileData = null
  ) => (
    <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <label className="font-medium text-sm text-gray-700">{label}</label>
      <input
        type="file"
        name={name}
        accept={accept}
        onChange={onChange}
        className="block w-full text-sm text-gray-500
      file:mr-4 file:py-2 file:px-4
      file:rounded-md file:border-0
      file:text-sm file:font-semibold
      file:bg-green-50 file:text-green-700
      hover:file:bg-green-100"
      />
      {fileData && (
        <div className="mt-2 text-sm text-gray-600 flex items-center justify-between">
          <span>{fileData.name}</span>
          {fileData.preview && (
            <img
              src={fileData.preview}
              alt="Preview"
              className="h-10 w-10 rounded object-cover"
            />
          )}
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, [name]: null }));
              if (fileData.preview) URL.revokeObjectURL(fileData.preview);
            }}
            className="ml-2 text-red-500 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );

  const loanTypeOptions = loanTypes.map((lt) => ({
    label: lt.name,
    value: lt.code,
  }));

  const clientOptions = accounts.map((account) => ({
    label: `${account.accountCode} - ${account.accountName}`,
    value: account.accountCode,
  }));

  const renderAssetDetailsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supplier Selection */}
        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm text-gray-700">
            Supplier <span className="text-red-500">*</span>
          </label>
          <Select
            options={suppliers.map((s) => ({
              label: `${s.name}`,
              value: s.id,
              supplier: s,
            }))}
            value={
              selectedSupplier
                ? {
                    label: `${selectedSupplier.name}`,
                    value: selectedSupplier.id,
                  }
                : null
            }
            onChange={handleSupplierChange}
            placeholder="Select supplier"
            className="text-sm"
            isClearable
            required
          />
        </div>

        {/* Product Selection */}
        {selectedSupplier && (
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm text-gray-700">
              Product <span className="text-red-500">*</span>
            </label>
            <Select
              options={products.map((p) => ({
                label: `${p.name} - ${formatCurrency(p.price)}`,
                value: p.id,
                product: p,
              }))}
              value={products.find(
                (p) => p.name === formData.LoanRequest.AssetName
              )}
              onChange={(option) => {
                setFormData((prev) => ({
                  ...prev,
                  LoanRequest: {
                    ...prev.LoanRequest,
                    AssetName: option?.product?.name || "",
                    AssetPricePerUnit: option?.product?.price || 0,
                  },
                }));
              }}
              placeholder={
                isLoadingProducts ? "Loading products..." : "Select product"
              }
              isLoading={isLoadingProducts}
              className="text-sm"
              isClearable
              required
            />
            <div className="text-sm font-bold text-[#3D873B] mb-1">
              Selected Product:{" "}
              {formData.LoanRequest.AssetName +
                " - " +
                formatCurrency(formData.LoanRequest.AssetPricePerUnit)}
            </div>
          </div>
        )}

        {/* Product Description */}
        {selectedSupplier && formData.LoanRequest.AssetName && (
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm text-gray-700">
              Product Description
            </label>
            <input
              type="text"
              value={formData.LoanRequest.AssetDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  LoanRequest: {
                    ...prev.LoanRequest,
                    AssetDescription: e.target.value,
                  },
                }))
              }
              className="border rounded-md px-3 py-2 text-sm"
              placeholder="Enter product description"
            />
          </div>
        )}

        {/* Asset Quantity */}
        {selectedSupplier && formData.LoanRequest.AssetName && (
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm text-gray-700">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.LoanRequest.AssetQuantity || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  LoanRequest: {
                    ...prev.LoanRequest,
                    AssetQuantity: e.target.value,
                  },
                }))
              }
              className="border rounded-md px-3 py-2 text-sm"
              required
            />
          </div>
        )}

        {/* Display calculated total price */}
        {formData.LoanRequest.AssetQuantity > 0 && (
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm text-gray-700">
              Total Price
            </label>
            <div className="border bg-gray-50 rounded-md px-3 py-2 text-sm">
              {formatCurrency(
                formData.LoanRequest.AssetPricePerUnit *
                  formData.LoanRequest.AssetQuantity
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          disabled={
            !formData.LoanRequest.SupplierId ||
            !formData.LoanRequest.AssetName ||
            !formData.LoanRequest.AssetQuantity
          }
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="w-full">
        <div className="bg-white overflow-hidden">
          <div className="   text-[#333]">
            <h1 className="text-2xl font-bold">Loan Request Form</h1>
            <p className="text-gray-500">
              {branchName && `Branch: ${branchName}`}
            </p>
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab("general")}
                className={`py-3 px-4 border-b-2 font-medium text-sm ${
                  activeTab === "general"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500"
                }`}
              >
                General Information
              </button>
              {formData.LoanRequest.NeedSupplierRequest && (
                <button
                  onClick={() => setActiveTab("asset")}
                  className={`py-3 px-4 border-b-2 font-medium text-sm ${
                    activeTab === "asset"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500"
                  }`}
                  disabled={
                    !formData.LoanRequest.AccountCode ||
                    !formData.LoanRequest.Purpose ||
                    formData.LoanRequest.PaymentPeriodDays === 0 ||
                    !formData.LoanRequest.LoanTypeCode ||
                    !formData.LoanRequest.FileNo ||
                    (!formData.LoanRequest.InitialAmount &&
                      !formData.LoanRequest.NeedSupplierRequest) ||
                    !formData.LoanRequest.OtherInformation ||
                    (formData.LoanRequest.BusinessName &&
                      !formData.LoanRequest.BusinessStartDate &&
                      !formData.LoanRequest.BusinessOwnershipType &&
                      !formData.LoanRequest.NumberOfStaff)
                  }
                >
                  Asset Details
                </button>
              )}
              <button
                onClick={() => setActiveTab("documents")}
                className={`py-3 px-4 border-b-2 font-medium text-sm ${
                  activeTab === "documents"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500"
                }`}
                disabled={
                  !formData.LoanRequest.AccountCode ||
                  !formData.LoanRequest.Purpose ||
                  formData.LoanRequest.PaymentPeriodDays === 0 ||
                  !formData.LoanRequest.LoanTypeCode ||
                  !formData.LoanRequest.FileNo ||
                  (!formData.LoanRequest.InitialAmount &&
                    !formData.LoanRequest.NeedSupplierRequest) ||
                  !formData.LoanRequest.OtherInformation ||
                  (formData.LoanRequest.BusinessName &&
                    !formData.LoanRequest.BusinessStartDate &&
                    !formData.LoanRequest.BusinessOwnershipType &&
                    !formData.LoanRequest.NumberOfStaff)
                }
              >
                Documents
              </button>
              <button
                onClick={() => setActiveTab("guarantors")}
                className={`py-3 px-4 border-b-2 font-medium text-sm ${
                  activeTab === "guarantors"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500"
                }`}
              >
                Guarantors
              </button>
              {isFormValid && (
                <button
                  onClick={() => setActiveTab("pricing")}
                  className={`py-3 px-4 border-b-2 font-medium text-sm ${
                    activeTab === "pricing"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  Pricing Model
                </button>
              )}
            </nav>
          </div>

          <form className="p-6" onSubmit={handleSubmit}>
            <div
              className={`space-y-6 ${activeTab === "general" ? "" : "hidden"}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField(
                  "File No",
                  "FileNo",
                  formData.LoanRequest.FileNo,
                  (e) =>
                    setFormData((prev) => ({
                      ...prev,
                      LoanRequest: {
                        ...prev.LoanRequest,
                        FileNo: e.target.value,
                      },
                    })),
                  "text",
                  true
                )}
                {renderSelectField(
                  "Client",
                  "AccountCode",
                  clientOptions,
                  formData.LoanRequest.AccountCode,
                  handleAccountSelect,
                  true
                )}
                {renderInputField(
                  "Business Name",
                  "BusinessName",
                  formData.LoanRequest.BusinessName,
                  (e) =>
                    setFormData((prev) => ({
                      ...prev,
                      LoanRequest: {
                        ...prev.LoanRequest,
                        BusinessName: e.target.value,
                      },
                    }))
                )}
                {renderInputField(
                  "Employer ID",
                  "EmployerId",
                  formData.LoanRequest.EmployerId,
                  (e) =>
                    setFormData((prev) => ({
                      ...prev,
                      LoanRequest: {
                        ...prev.LoanRequest,
                        EmployerId: e.target.value,
                      },
                    })),
                  "text",
                  formData.LoanRequest.BusinessName ? true : false
                )}
                {renderSelectField(
                  "Ownership Type",
                  "BusinessOwnershipType",
                  [
                    {
                      label: "Sole Proprietorship",
                      value: "Sole Proprietorship",
                    },
                    { label: "Partnership", value: "Partnership" },
                    { label: "Corporation", value: "Corporation" },
                    { label: "Limited", value: "Limited" },
                  ],
                  formData.LoanRequest.BusinessOwnershipType,
                  (selectedOption) =>
                    setFormData((prev) => ({
                      ...prev,
                      LoanRequest: {
                        ...prev.LoanRequest,
                        BusinessOwnershipType: selectedOption.value,
                      },
                    })),
                  formData.LoanRequest.BusinessName ? true : false
                )}
                {renderInputField(
                  "Number of Staff",
                  "NumberOfStaff",
                  formData.LoanRequest.NumberOfStaff,
                  (e) =>
                    setFormData((prev) => ({
                      ...prev,
                      LoanRequest: {
                        ...prev.LoanRequest,
                        NumberOfStaff: e.target.value,
                      },
                    })),
                  "number",
                  formData.LoanRequest.BusinessName ? true : false
                )}
                {renderDateInputField(
                  "Business Start Date",
                  "BusinessStartDate",
                  formData.LoanRequest.BusinessStartDate,
                  (formattedDate) => {
                    setFormData((prev) => ({
                      ...prev,
                      LoanRequest: {
                        ...prev.LoanRequest,
                        BusinessStartDate: formattedDate,
                      },
                    }));
                  },
                  formData.LoanRequest.BusinessName ? true : false
                )}
                {renderInputField(
                  "Other Information",
                  "OtherInformation",
                  formData.LoanRequest.OtherInformation,
                  (e) =>
                    setFormData((prev) => ({
                      ...prev,
                      LoanRequest: {
                        ...prev.LoanRequest,
                        OtherInformation: e.target.value,
                      },
                    })),
                  "text",
                  true
                )}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="NeedSupplierRequest"
                    checked={formData.LoanRequest.NeedSupplierRequest}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        LoanRequest: {
                          ...prev.LoanRequest,
                          NeedSupplierRequest: e.target.checked,
                          ...(!e.target.checked && {
                            AssetName: "",
                            AssetDescription: "",
                            AssetQuantity: 0,
                            AssetPricePerUnit: 0,
                            SupplierId: "",
                          }),
                        },
                      }))
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="NeedSupplierRequest"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Need Supplier Request?
                  </label>
                </div>
                {!formData.LoanRequest.NeedSupplierRequest &&
                  renderInputField(
                    "Loan Amount",
                    "Amount",
                    formData.LoanRequest.InitialAmount,
                    (e) =>
                      setFormData((prev) => ({
                        ...prev,
                        LoanRequest: {
                          ...prev.LoanRequest,
                          InitialAmount: e.target.value,
                        },
                      })),
                    "number",
                    true,
                    false,
                    true
                  )}
                {renderInputField(
                  "Purpose",
                  "Purpose",
                  formData.LoanRequest.Purpose,
                  (e) =>
                    setFormData((prev) => ({
                      ...prev,
                      LoanRequest: {
                        ...prev.LoanRequest,
                        Purpose: e.target.value,
                      },
                    })),
                  "text",
                  true
                )}
                {renderInputField(
                  "Payment Period (months)",
                  "PaymentPeriodDays",
                  formData.LoanRequest.PaymentPeriodDays,
                  (e) =>
                    setFormData((prev) => ({
                      ...prev,
                      LoanRequest: {
                        ...prev.LoanRequest,
                        PaymentPeriodDays: e.target.value,
                      },
                    })),
                  "number",
                  true
                )}
                {renderSelectField(
                  "Loan Type",
                  "LoanTypeCode",
                  loanTypeOptions,
                  formData.LoanRequest.LoanTypeCode,
                  handleLoanTypeChange,
                  true
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      formData.LoanRequest.NeedSupplierRequest
                        ? "asset"
                        : "documents"
                    )
                  }
                  disabled={
                    !formData.LoanRequest.AccountCode ||
                    !formData.LoanRequest.Purpose ||
                    formData.LoanRequest.PaymentPeriodDays === 0 ||
                    !formData.LoanRequest.LoanTypeCode ||
                    !formData.LoanRequest.FileNo ||
                    (!formData.LoanRequest.InitialAmount &&
                      !formData.LoanRequest.NeedSupplierRequest) ||
                    !formData.LoanRequest.OtherInformation ||
                    (formData.LoanRequest.BusinessName &&
                      !formData.LoanRequest.BusinessStartDate &&
                      !formData.LoanRequest.BusinessOwnershipType &&
                      !formData.LoanRequest.NumberOfStaff)
                  }
                  title={
                    !formData.LoanRequest.AccountCode ||
                    !formData.LoanRequest.Purpose ||
                    formData.LoanRequest.PaymentPeriodDays === 0 ||
                    !formData.LoanRequest.LoanTypeCode ||
                    !formData.LoanRequest.FileNo ||
                    (!formData.LoanRequest.InitialAmount &&
                      !formData.LoanRequest.NeedSupplierRequest) ||
                    !formData.LoanRequest.OtherInformation ||
                    (formData.LoanRequest.BusinessName &&
                      !formData.LoanRequest.BusinessStartDate &&
                      !formData.LoanRequest.BusinessOwnershipType &&
                      !formData.LoanRequest.NumberOfStaff)
                      ? "Please fill out all required fields"
                      : ""
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Next
                </button>
              </div>
            </div>

            {activeTab === "asset" && renderAssetDetailsTab()}

            <div
              className={`space-y-6 ${
                activeTab === "documents" ? "" : "hidden"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFileUpload(
                  "Statement of Account",
                  "StatementOfAccountDoc",
                  (e) => handleFileChange(e, "StatementOfAccountDoc"),
                  ".pdf",
                  formData.StatementOfAccountDoc
                )}

                {renderFileUpload(
                  "ID Card",
                  "IdCardDoc",
                  (e) => handleFileChange(e, "IdCardDoc"),
                  ".pdf,.jpg,.jpeg,.png",
                  formData.IdCardDoc
                )}

                {renderFileUpload(
                  "Passport Photo",
                  "PassportDoc",
                  (e) => handleFileChange(e, "PassportDoc"),
                  ".jpg,.jpeg,.png",
                  formData.PassportDoc
                )}

                {renderFileUpload(
                  "Loan Invoice",
                  "LoanInvoiceDoc",
                  (e) => handleFileChange(e, "LoanInvoiceDoc"),
                  ".pdf",
                  formData.LoanInvoiceDoc
                )}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      formData.LoanRequest.NeedSupplierRequest
                        ? "asset"
                        : "general"
                    )
                  }
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("guarantors")}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Next
                </button>
              </div>
            </div>

            <div
              className={`space-y-6 ${
                activeTab === "guarantors" ? "" : "hidden"
              }`}
            >
              {[1, 2].map((num) => (
                <div key={num} className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Guarantor {num} Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField(
                      "Full Name",
                      `Guarantor${num}Name`,
                      formData.LoanRequest[`Guarantor${num}Name`],
                      (e) =>
                        setFormData((prev) => ({
                          ...prev,
                          LoanRequest: {
                            ...prev.LoanRequest,
                            [`Guarantor${num}Name`]: e.target.value,
                          },
                        })),
                      "text",
                      true
                    )}

                    {renderInputField(
                      "Occupation",
                      `Guarantor${num}Occupation`,
                      formData.LoanRequest[`Guarantor${num}Occupation`],
                      (e) =>
                        setFormData((prev) => ({
                          ...prev,
                          LoanRequest: {
                            ...prev.LoanRequest,
                            [`Guarantor${num}Occupation`]: e.target.value,
                          },
                        })),
                      "text",
                      true
                    )}

                    {renderInputField(
                      "Phone Number",
                      `Guarantor${num}Phone`,
                      formData.LoanRequest[`Guarantor${num}Phone`],
                      (e) =>
                        setFormData((prev) => ({
                          ...prev,
                          LoanRequest: {
                            ...prev.LoanRequest,
                            [`Guarantor${num}Phone`]: e.target.value,
                          },
                        })),
                      "tel",
                      true
                    )}

                    {renderInputField(
                      "Address",
                      `Guarantor${num}Address`,
                      formData.LoanRequest[`Guarantor${num}Address`],
                      (e) =>
                        setFormData((prev) => ({
                          ...prev,
                          LoanRequest: {
                            ...prev.LoanRequest,
                            [`Guarantor${num}Address`]: e.target.value,
                          },
                        })),
                      "text",
                      true
                    )}

                    {renderInputField(
                      "Relationship",
                      `Guarantor${num}Relationship`,
                      formData.LoanRequest[`Guarantor${num}Relationship`],
                      (e) =>
                        setFormData((prev) => ({
                          ...prev,
                          LoanRequest: {
                            ...prev.LoanRequest,
                            [`Guarantor${num}Relationship`]: e.target.value,
                          },
                        })),
                      "text",
                      true
                    )}

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderFileUpload(
                        "ID Card",
                        `Guarantor${num}IdCard`,
                        (e) => handleFileChange(e, `Guarantor${num}IdCard`),
                        ".pdf,.jpg,.jpeg,.png",
                        formData[`Guarantor${num}IdCard`]
                      )}

                      {renderFileUpload(
                        "Passport Photo",
                        `Guarantor${num}Passport`,
                        (e) => handleFileChange(e, `Guarantor${num}Passport`),
                        ".jpg,.jpeg,.png",
                        formData[`Guarantor${num}Passport`]
                      )}

                      {renderFileUpload(
                        "Guarantor Form",
                        `Guarantor${num}FormUpload`,
                        (e) => handleFileChange(e, `Guarantor${num}FormUpload`),
                        ".pdf",
                        formData[`Guarantor${num}FormUpload`]
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("documents")}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
                {isFormValid ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("pricing")}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    View Pricing
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
                  >
                    Complete Form for Pricing
                  </button>
                )}
              </div>
            </div>

            {activeTab === "pricing" && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-green-800 mb-4">
                    Pricing Summary
                  </h2>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium text-gray-700 mb-2">
                          Loan Details
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Loan Type:
                            </span>
                            <span className="text-sm font-medium">
                              {formData.LoanRequest.LoanTypeCode}
                            </span>
                          </div>
                          {formData.LoanRequest.NeedSupplierRequest && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Asset:
                                </span>
                                <span className="text-sm font-medium">
                                  {formData.LoanRequest.AssetName}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Quantity:
                                </span>
                                <span className="text-sm font-medium">
                                  {formData.LoanRequest.AssetQuantity}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="flex  items-center justify-between">
                            <label className="text-sm text-gray-600">
                              Term (months) (e):
                            </label>
                            <input
                              type="number"
                              value={formData.LoanRequest.PaymentPeriodDays}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  LoanRequest: {
                                    ...prev.LoanRequest,
                                    PaymentPeriodDays: e.target.value,
                                  },
                                }))
                              }
                              className="border rounded px-2 py-1 text-sm w-20"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium text-gray-700 mb-2">
                          Financial Summary
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-600">
                              Total Cost (a):
                            </label>
                            <span className="text-sm font-medium">
                              {formatCurrency(
                                formData.LoanRequest.InitialAmount
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Client Equity (b = equity * a):
                            </span>
                            <span className="text-sm font-medium">
                              {formatCurrency(
                                formData.LoanRequest.MinimumEquityContribution
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-600">
                              Additional Contribution (c):
                            </label>
                            <input
                              type="number"
                              value={
                                formData.LoanRequest
                                  .AdditionalClientContribution
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  LoanRequest: {
                                    ...prev.LoanRequest,
                                    AdditionalClientContribution:
                                      e.target.value,
                                  },
                                }))
                              }
                              className="border rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-2">
                            <span className="text-sm font-medium text-gray-700">
                              Amount Financed (d = a - b - c):
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(
                                formData.LoanRequest.CostOfAssetFinanced
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium text-gray-700 mb-2">
                          Cost Adjustments
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-600">
                              Inflation Rate (%) (f):
                            </label>
                            <input
                              type="number"
                              value={formData.LoanRequest.AvgInflationRate}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  LoanRequest: {
                                    ...prev.LoanRequest,
                                    AvgInflationRate: e.target.value,
                                  },
                                }))
                              }
                              className="border rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Inflation Multiplier (g = (1 + f)^e):
                            </span>
                            <span className="text-sm font-medium">
                              {Number(
                                formData.LoanRequest.InflationMultiplier
                              ).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Total Post Inflation Cost (h = (d * g)):
                            </span>
                            <span className="text-sm font-medium">
                              {formatCurrency(
                                formData.LoanRequest.PostInflationCost
                              )}
                            </span>
                          </div>

                          <div className="flex  items-center justify-between">
                            <label className="text-sm text-gray-600">
                              Market Risk Premium (%) (i):
                            </label>
                            <input
                              type="number"
                              value={formData.LoanRequest.MarketRiskPremium}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  LoanRequest: {
                                    ...prev.LoanRequest,
                                    MarketRiskPremium: e.target.value,
                                  },
                                }))
                              }
                              className="border rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div className="flex  items-center justify-between">
                            <label className="text-sm text-gray-600">
                              Operation Expenses (%) (j):
                            </label>
                            <input
                              type="number"
                              value={formData.LoanRequest.OperationExpenses}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  LoanRequest: {
                                    ...prev.LoanRequest,
                                    OperationExpenses: e.target.value,
                                  },
                                }))
                              }
                              className="border rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-2">
                            <span className="text-sm font-medium text-gray-700">
                              Total Real Operational Cost (k = h * (1 + (i +
                              j))):
                            </span>
                            <span className="text-sm font-medium text-blue-600">
                              {formatCurrency(
                                formData.LoanRequest.TotalRealOperationalCost
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium text-gray-700 mb-2">
                          Pricing Model
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Profit Margin (l):
                            </span>
                            <input
                              type="number"
                              value={formData.LoanRequest.ProfitMargin}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  LoanRequest: {
                                    ...prev.LoanRequest,
                                    ProfitMargin: e.target.value,
                                  },
                                }))
                              }
                              className="border rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Minimum Asset Financing Price (m = k / (1 - l)):
                            </span>
                            <span className="text-sm font-medium">
                              {formatCurrency(
                                formData.LoanRequest.MinimumAssetFinancing
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-2">
                            <span className="text-sm font-medium text-gray-700">
                              Estimated Profit (n = m - d):
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(
                                formData.LoanRequest.EstimatedProfit
                              )}{" "}
                              ({formData.LoanRequest.PercentOfProfit.toFixed(2)}
                              %)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveTab("guarantors")}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Back
                    </button>
                    <div className="space-x-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RequestForm;
