"use client";
import Layout from "@/app/components/Layout";
import useLoanStore from "@/app/components/loanStore";
import { useAuth } from "@/Services/authService";
import roleService from "@/Services/roleService";
import supplierService from "@/Services/supplierService";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const LoanCalculator = () => {
  const { loanFormData } = useLoanStore();
  const { user } = useAuth();
  const router = useRouter();
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionComment, setRejectionComment] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await supplierService.getSuppliers();
        setSuppliers(data);
      } catch (e) {
        toast.error(e.message);
      }
    };
    fetchSuppliers();
  }, []);

  const supplierOptions = suppliers.map((s) => ({
    label: s.name,
    value: s.name,
  }));

  useEffect(() => {
    const fetchPrivileges = async () => {
      if (user?.role) {
        try {
          const role = await roleService.getRoleById(user.role);
          setRolePrivileges(role?.privileges?.map((p) => p.name) || []);
        } catch (error) {
          console.error("Error fetching role by ID:", error);
          setRolePrivileges([]);
        }
      } else {
        setRolePrivileges([]);
      }
    };

    fetchPrivileges();
  }, [user?.role]);

  const hasPrivilege = (privilegeName) => {
    return rolePrivileges.includes(privilegeName);
  };
  const [formdata, setFormdata] = useState({
    fileName: "",
    dob: "",
    phone: "",
    email: "",
    staus: "Pending",
    address: "",
    businessName: "",
    date: "",
    loanDetails: "",
    ownershipType: "",
    otherInfo: "",
    employerId: "",
    numberOfStaffs: "",
    businessStartupDate: "",
    loanAmount: "",
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
    name: "",
    purpose: "",
    totalCostofAsset: 0,
    asset: "",
    assetdescription: "",
    assetQuantity: 0,
    assetPrice: 0,
    Supplier: "",
    equityContribution: 0,
    additionalClientContribution:
      loanFormData?.additionalClientContribution || 0,
    costOfAssetFinancedByTasuwab:
      loanFormData?.costOfAssetFinancedByTasuwab || 0,
    InstallmentPeriod: loanFormData?.InstallmentPeriod || 0,
    AverageInflationRate: loanFormData?.AverageInflationRate || 0,
    InflationMultiplier: loanFormData?.InflationMultiplier || 0,
    postInflationCost: loanFormData?.postInflationCost || 0,
    MarketRiskPremium: loanFormData?.MarketRiskPremium || 0,
    operationalExpenses: loanFormData?.operationalExpenses || 0,
    totalRealOperationalCost: loanFormData?.totalRealOperationalCost || 0,
    requiredProfitMargin: loanFormData?.requiredProfitMargin || 0,
    minimumAssetPrice: loanFormData?.minimumAssetPrice || 0,
    profitEstimate: loanFormData?.profitEstimate || 0,
    profitPercent: loanFormData?.profitPercent || 0,
  });

  const calculateMinimumAssetPrice = (
    totalRealOpCost,
    requiredProfitMargin
  ) => {
    const marginDecimal = requiredProfitMargin / 100;
    return totalRealOpCost / (1 - marginDecimal);
  };

  const calculateEstimatedProfit = (minimumAssetPrice, costFinanced) => {
    return minimumAssetPrice - costFinanced;
  };

  const calculateProfitPercent = (estimatedProfit, costFinanced) => {
    return (estimatedProfit / costFinanced) * 100;
  };

  // Update calculations whenever dependent values change
  useEffect(() => {
    if (
      formdata.totalRealOperationalCost > 0 &&
      formdata.requiredProfitMargin > 0
    ) {
      const minPrice = calculateMinimumAssetPrice(
        formdata.totalRealOperationalCost,
        formdata.requiredProfitMargin
      );

      const profit = calculateEstimatedProfit(
        minPrice,
        formdata.costOfAssetFinancedByTasuwab
      );

      const profitPct = calculateProfitPercent(
        profit,
        formdata.costOfAssetFinancedByTasuwab
      );

      setFormdata((prev) => ({
        ...prev,
        minimumAssetPrice: minPrice,
        profitEstimate: profit,
        profitPercent: profitPct,
      }));
    }
  }, [
    formdata.totalRealOperationalCost,
    formdata.requiredProfitMargin,
    formdata.costOfAssetFinancedByTasuwab,
  ]);

  // Update formdata when loanFormData changes
  useEffect(() => {
    if (loanFormData) {
      const loanAmount = Number(loanFormData.loanAmount || 0);
      const hasLoanAmount = loanAmount > 0;

      const total = hasLoanAmount
        ? loanAmount
        : Number(loanFormData.assetPrice || 0) *
          Number(loanFormData.assetQuantity || 0);

      const equity = 0.2 * total;
      const additionalClientContribution = 0;
      const costFinanced = total - equity - additionalClientContribution;

      setFormdata({
        ...formdata,
        fileName: loanFormData.filename || loanFormData.fileName || "",
        dob: loanFormData.dob || "",
        date: loanFormData.date || new Date().toISOString().split("T")[0],
        phone: loanFormData.phone || "",
        staus: "Pending",

        email: loanFormData.email || "",
        address: loanFormData.address || "",
        businessName: loanFormData.businessName || "NA",
        loanDetails: loanFormData.loanDetails || "",
        ownershipType: loanFormData.ownershipType || "NA",
        otherInfo: loanFormData.otherInfo || "NA",
        employerId: loanFormData.employerId || "NA",
        numberOfStaffs: loanFormData.numberOfStaffs || "NA",
        businessStartupDate: loanFormData.businessStartupDate || "NA",
        loanAmount: loanFormData.loanAmount || "NA",
        forms: { ...formdata.forms },
        guarantors: [...formdata.guarantors],
        name: loanFormData.name || "",
        purpose: loanFormData.loanType || loanFormData.purpose || "",
        totalCostofAsset: total,
        asset: hasLoanAmount
          ? "none"
          : loanFormData.assetName || loanFormData.asset || "",
        assetdescription: hasLoanAmount
          ? "NA"
          : loanFormData.assetDescription ||
            loanFormData.assetdescription ||
            "",
        assetPrice: loanFormData.assetPrice || 0,

        assetQuantity: hasLoanAmount ? 0 : loanFormData.assetQuantity || 0,
        Supplier: hasLoanAmount
          ? "NA"
          : loanFormData.preferredSupplier || loanFormData.Supplier || "",
        equityContribution: equity,
        additionalClientContribution:
          loanFormData.additionalClientContribution || 0,
        costOfAssetFinancedByTasuwab: costFinanced >= 0 ? costFinanced : 0,
        InstallmentPeriod:
          loanFormData.paymentPeriodInMonths ||
          loanFormData.InstallmentPeriod ||
          0,
        AverageInflationRate: loanFormData.AverageInflationRate || 0,
        InflationMultiplier: loanFormData.InflationMultiplier || 0,
        postInflationCost: loanFormData.postInflationCost || 0,
        MarketRiskPremium: loanFormData.MarketRiskPremium || 0,
        operationalExpenses: loanFormData.operationalExpenses || 0,
        totalRealOperationalCost: loanFormData.totalRealOperationalCost || 0,
        requiredProfitMargin: loanFormData.requiredProfitMargin || 0,
        minimumAssetPrice: loanFormData.minimumAssetPrice || 0,
        profitEstimate: loanFormData.profitEstimate || 0,
        profitPercent: loanFormData.profitPercent || 0,
      });
    }
  }, [loanFormData]);

  const calculateTotalRealOperationalCost = (
    postInflationCost,
    marketRiskPremiumPercent,
    operationalExpensesPercent
  ) => {
    const mrp = marketRiskPremiumPercent / 100;
    const opExp = operationalExpensesPercent / 100;
    return postInflationCost * (1 + mrp + opExp);
  };

  const handlesubmit = (e) => {
    e.preventDefault();

    toast.success("Loan Calculation Successful, sent for approval");
    router.push("/Loan");
    console.log(formdata);
  };

  const handleApprove = (e) => {
    e.preventDefault();

    toast.success("Loan Approved");
    router.push("/Approved/Loans");
    console.log(formdata);
  };

  const handleReject = (e) => {
    e.preventDefault();
    toast.success("Loan Rejected");
    router.push("/Pending/Loans");
    console.log(formdata);
  };
  if (!loanFormData) {
    return (
      <Layout>
        <div className="w-full">
          <div className="text-center py-8">
            <p className="text-xl text-gray-600 mb-4">No loan data available</p>
            <button
              onClick={() => router.push("/Loan/Request-Form")}
              className="px-4 py-2 bg-[#3D873B] text-white rounded"
            >
              Go to Request Form
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <form className="w-full">
        <div>
          <p className="text-4xl font-extrabold mb-2 text-[#3D873B]">
            Pricing Model for {formdata.name} - {formdata.fileName}
          </p>
          <p className="text-sm text-gray-600">
            Analyze and generate loan pricing structures based on client data.
          </p>
        </div>
        <div className="flex flex-col gap-3 mt-8">
          <div className="grid grid-cols-2 gap-y-1">
            <label className="font-bold " htmlFor="purpose">
              Purpose
            </label>
            <input
              name="purpose"
              type="text"
              value={formdata.purpose}
              readOnly
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
          {formdata.loanAmount === "NA" && (
            <>
              <div className="grid grid-cols-2 gap-y-1">
                <label className="font-bold " htmlFor="asset">
                  Asset Name
                </label>
                <input
                  name="asset"
                  type="text"
                  value={formdata.asset}
                  readOnly
                  className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-y-1">
                <label className="font-bold " htmlFor="assetdescription">
                  Asset Description
                </label>
                <input
                  type="text"
                  name="assetdescription"
                  value={formdata.assetdescription}
                  readOnly
                  className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-y-1">
                <label className="font-bold " htmlFor="assetQuantity">
                  Asset Quantity
                </label>
                <input
                  type="text"
                  name="assetQuantity"
                  value={formdata.assetQuantity}
                  readOnly
                  className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                />
              </div>
            </>
          )}
          {formdata.loanAmount === "NA" && (
            <div className="grid grid-cols-2 gap-y-1">
              <label className="font-bold " htmlFor="totalCostofAsset">
                Total Cost of Asset{" "}
                <span className="text-sm text-gray-500 ml-3">(a)</span>
              </label>
              <input
                name="totalCostofAsset"
                type="text"
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^0-9.]/g, ""); // remove commas, ₦
                  setFormdata({ ...formdata, totalCostofAsset: rawValue });
                }}
                value={formatCurrency(formdata.totalCostofAsset)}
                className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
              />
            </div>
          )}
          {formdata.loanAmount !== "NA" && (
            <div className="grid grid-cols-2 gap-y-1">
              <label className="font-bold" htmlFor="loanAmount">
                Loan Amount (Used as Total Cost)
                <span className="text-sm text-gray-500 ml-3">(a)</span>
              </label>
              <input
                name="loanAmount"
                type="text"
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^0-9.]/g, ""); // remove commas, ₦
                  setFormdata({ ...formdata, loanAmount: rawValue });
                }}
                value={formatCurrency(formdata.loanAmount)}
                className="border text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
              />
            </div>
          )}

          {formdata.loanAmount === "NA" && (
            <>
              <div className="grid grid-cols-2 gap-y-1">
                <label className="font-bold" htmlFor="Supplier">
                  Supplier
                </label>
                <div>
                  <CreatableSelect
                    isClearable
                    placeholder="Select or type supplier name"
                    options={supplierOptions}
                    value={
                      formdata.Supplier
                        ? { label: formdata.Supplier, value: formdata.Supplier }
                        : null
                    }
                    onChange={(selectedOption) =>
                      setFormdata((prev) => ({
                        ...prev,
                        Supplier: selectedOption ? selectedOption.value : "",
                      }))
                    }
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: "#ccc",
                        boxShadow: "none",
                        minHeight: "44px",
                        textAlign: "center",
                      }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </div>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-y-1">
            <label className="font-bold " htmlFor="equityContribution">
              Minimum Equity Contribution (20%)
              <span className="text-sm text-gray-500 ml-3">(b = 20% * a)</span>
            </label>
            <input
              type="text"
              name="equityContribution"
              value={new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(formdata.equityContribution)}
              readOnly
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <label
              className="font-bold "
              htmlFor="additionalClientContribution"
            >
              Additional Client Contribution
              <span className="text-sm text-gray-500 ml-3">(c)</span>
            </label>
            <input
              name="additionalClientContribution"
              type="number"
              step={100}
              value={formdata.additionalClientContribution}
              onChange={(e) => {
                const additional = parseFloat(e.target.value) || 0;
                const total = Number(formdata.totalCostofAsset);
                const equity = Number(formdata.equityContribution);
                const costFinanced = total - equity - additional;

                setFormdata({
                  ...formdata,
                  additionalClientContribution: additional,
                  costOfAssetFinancedByTasuwab:
                    costFinanced >= 0 ? costFinanced : 0,
                });
              }}
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <label
              className="font-bold "
              htmlFor="costOfAssetFinancedByTasuwab"
            >
              Cost of Asset Financed by Tasuwab
              <span className="text-sm text-gray-500 ml-3">
                (d = a - b - c)
              </span>
            </label>

            <input
              type="text"
              name="costOfAssetFinancedByTasuwab"
              value={new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(formdata.costOfAssetFinancedByTasuwab)}
              readOnly
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <label className="font-bold " htmlFor="InstallmentPeriod">
              Installment Period (Months)
              <span className="text-sm text-gray-500 ml-3">(e)</span>
            </label>

            <input
              name="InstallmentPeriod"
              type="text"
              value={formdata.InstallmentPeriod}
              readOnly
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <label className="font-bold " htmlFor="installmentPeriodYears">
              Installment Period (Years / Months / Days)
            </label>
            <input
              id="installmentPeriodYears"
              type="text"
              value={`${Math.floor(formdata.InstallmentPeriod / 12)} y / ${
                formdata.InstallmentPeriod % 12
              } m / 0 d`}
              readOnly
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <label className="font-bold " htmlFor="AverageInflationRate">
              Average Inflation Rate (%)
              <span className="text-sm text-gray-500 ml-3">(f)</span>
            </label>
            <input
              name="AverageInflationRate"
              type="number"
              value={formdata.AverageInflationRate}
              onChange={(e) => {
                const rateInput = parseFloat(e.target.value) || 0;
                const rateDecimal = rateInput / 100;
                const years = formdata.InstallmentPeriod;
                const inflationMultiplier = (1 + rateDecimal) ** years;

                const postInflation =
                  formdata.costOfAssetFinancedByTasuwab * inflationMultiplier;

                // also update total real operational cost
                const mrp = parseFloat(formdata.MarketRiskPremium) || 0;
                const opExp = parseFloat(formdata.operationalExpenses) || 0;
                const totalRealOpCost = calculateTotalRealOperationalCost(
                  postInflation,
                  mrp,
                  opExp
                );

                setFormdata({
                  ...formdata,
                  AverageInflationRate: rateInput,
                  InflationMultiplier: inflationMultiplier,
                  postInflationCost: postInflation,
                  totalRealOperationalCost: totalRealOpCost,
                });
              }}
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <label className="font-bold " htmlFor="InflationMultiplier">
              Inflation Multiplier
              <span className="text-sm text-gray-500 ml-3">
                (g = (1 + f) ^ e)
              </span>
            </label>
            <input
              type="text"
              value={Number(formdata.InflationMultiplier).toFixed(2)} // ✅ Correct
              readOnly
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <label className="font-bold " htmlFor="postInflationCost">
              Total Post Inflation Cost
              <span className="text-sm text-gray-500 ml-3">(h = d * g)</span>
            </label>
            <input
              type="text"
              value={new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(formdata.postInflationCost)}
              readOnly
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <label className="font-bold " htmlFor="MarketRiskPremium">
              Market Risk Premium
              <span className="text-sm text-gray-500 ml-3">(i)</span>
            </label>
            <input
              type="number"
              value={formdata.MarketRiskPremium}
              onChange={(e) => {
                const mrp = parseFloat(e.target.value) || 0;
                const opExp = parseFloat(formdata.operationalExpenses) || 0;
                const totalRealOpCost = calculateTotalRealOperationalCost(
                  formdata.postInflationCost,
                  mrp,
                  opExp
                );

                setFormdata({
                  ...formdata,
                  MarketRiskPremium: mrp,
                  totalRealOperationalCost: totalRealOpCost,
                });
              }}
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <label className="font-bold " htmlFor="operationalExpenses">
              Required Operational expenses
              <span className="text-sm text-gray-500 ml-3">(j)</span>
            </label>
            <input
              type="number"
              value={formdata.operationalExpenses}
              onChange={(e) => {
                const opExp = parseFloat(e.target.value) || 0;
                const mrp = parseFloat(formdata.MarketRiskPremium) || 0;
                const totalRealOpCost = calculateTotalRealOperationalCost(
                  formdata.postInflationCost,
                  mrp,
                  opExp
                );

                setFormdata({
                  ...formdata,
                  operationalExpenses: opExp,
                  totalRealOperationalCost: totalRealOpCost,
                  requiredProfitMargin: opExp,
                });
              }}
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <label className="font-bold " htmlFor="totalRealOperationalCost">
              Total Real Operational Cost
              <span className="text-sm text-gray-500 ml-3">
                (k = (h* (1 +(i + j ) ) ) )
              </span>
            </label>
            <input
              type="text"
              value={new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(formdata.totalRealOperationalCost)}
              readOnly
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <label className="font-bold " htmlFor="requiredProfitMargin">
              Required Profit Margin
              <span className="text-sm text-gray-500 ml-3">(l)</span>
            </label>
            <input
              type="text"
              value={formdata.requiredProfitMargin}
              readOnly
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <label className="font-bold" htmlFor="minimumAssetPrice">
              Minimum Asset Financing Price
              <span className="text-sm text-gray-500 ml-3">
                (m = k / ( 1 - l ))
              </span>
            </label>
            <input
              type="text"
              value={new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(formdata.minimumAssetPrice)}
              readOnly
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <label className="font-bold" htmlFor="profitEstimate">
              Estimated Profit
              <span className="text-sm text-gray-500 ml-3">(n = m - d)</span>
            </label>
            <input
              type="text"
              value={new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(formdata.profitEstimate)}
              readOnly
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-y-1">
            <label className="font-bold" htmlFor="profitPercent">
              % of Profit
              <span className="text-sm text-gray-500 ml-3">
                (o = n/d * 100)
              </span>
            </label>
            <input
              type="text"
              value={`${Number(formdata.profitPercent).toFixed(2)} %`}
              readOnly
              className="border focus:border-2 text-center border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
            />
          </div>
        </div>
        <div className="flex justify-end">
          {hasPrivilege("AssignApprovalRights") ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleApprove}
                className="px-4 py-2 bg-[#3D873B] cursor-pointer text-white rounded mt-8"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 bg-red-500 cursor-pointer text-white rounded mt-8"
              >
                Reject
              </button>
            </div>
          ) : (
            <button
              onClick={handlesubmit}
              className="px-4 py-2 bg-[#3D873B] cursor-pointer text-white rounded mt-8"
            >
              Send For approval
            </button>
          )}
        </div>
      </form>
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Reason for Rejection
            </h2>

            <textarea
              className="w-full border border-gray-300 p-2 rounded-md mb-4 focus:outline-none focus:border-red-500"
              placeholder="Enter your reason..."
              rows={4}
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Submit rejection logic here
                  console.log("Rejected with reason:", rejectionComment);
                  handleReject;
                  setShowRejectModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
export default LoanCalculator;
