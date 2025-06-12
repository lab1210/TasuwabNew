import React, { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { HiOutlineIdentification } from "react-icons/hi2";
import { MdAlternateEmail, MdOutlinePhone } from "react-icons/md";
import { LiaBirthdayCakeSolid } from "react-icons/lia";
import { BsGenderFemale, BsGenderMale } from "react-icons/bs";
import { GiPayMoney, GiRelationshipBounds } from "react-icons/gi";
import {
  FaCashRegister,
  FaMinus,
  FaMoneyBill,
  FaPlus,
  FaUserShield,
} from "react-icons/fa";
import { RiFileDownloadLine } from "react-icons/ri";
import { TbNotebook } from "react-icons/tb";
import dummyClients from "./DummyClient";
import jsPDF from "jspdf";

const LoanInfo = ({ loans, onClose, isOpen }) => {
  const [activeTab, setActiveTab] = useState("personal");

  // State for filters
  const [filterDate, setFilterDate] = useState("");
  const [filterRepayment, setFilterRepayment] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterAmount, setFilterAmount] = useState("");
  const [filterDescription, setFilterDescription] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const tabClass = (tab) =>
    `px-4 py-2 rounded-t-md cursor-pointer font-medium ${
      activeTab === tab
        ? "bg-white text-[#3D873B] border-t-2 border-x border-gray-200"
        : "bg-gray-100 text-gray-500"
    }`;

  const downloadDocument = () => {
    const doc = new jsPDF();
    doc.save("loan_agreement.pdf"); // This will trigger the PDF download
  };

  // Filter transactions based on filters
  const filteredTransactions = loans?.repayment?.filter((transaction) => {
    return (
      (filterDate ? transaction.date.includes(filterDate) : true) &&
      (filterRepayment
        ? transaction.RepaymentDate.includes(filterRepayment)
        : true) &&
      (filterType
        ? transaction.DocNbr.toLowerCase().includes(filterType.toLowerCase())
        : true) &&
      (filterAmount
        ? transaction.Repaidamount.toString().includes(filterAmount)
        : true)
    );
  });
  const clearFilter = () => {
    setFilterDate("");
    setFilterRepayment("");
    setFilterType("");
    setFilterAmount("");
  };

  return (
    <div
      className={`overflow-x-hidden fixed top-0 right-0 overflow-y-auto h-screen w-full bg-white shadow-md z-20 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-end cursor-pointer hover:text-red-500">
        <IoIosClose size={40} onClick={onClose} />
      </div>

      <div className="flex justify-center">
        <div className="flex items-center justify-center w-20 h-20 p-3 text-[#3D873B] rounded-full bg-gray-100 object-contain">
          <GiPayMoney className="w-full h-full" />
        </div>
      </div>

      <div className="text-center mt-3 text-lg font-bold mb-4">
        <p>{loans?.name}</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-around border-b border-b-gray-100 text-sm hover:overflow-x-scroll">
        {[
          "personal",
          "business",
          loans?.purpose === "Asset Financing" ? "Asset Finance" : "Loan",
          "guarantor",
          loans?.status === "Approved" || loans?.status === "Active"
            ? "transactions"
            : null,
        ]
          .filter(Boolean)
          .map((tab) => (
            <div
              key={tab}
              className={tabClass(tab)}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          ))}
      </div>

      {/* Tab content */}
      <div className="p-5 flex flex-col gap-4">
        {activeTab === "personal" && (
          <>
            <InfoItem label="Client ID" value={loans?.clientId} />
            <InfoItem label="File Number" value={loans?.fileName} />
            <InfoItem label="Email" value={loans?.email} />
            <InfoItem label="Phone" value={loans?.phone} />
            <InfoItem label="DOB" value={formatDate(loans?.dob)} />
          </>
        )}

        {activeTab === "business" && (
          <>
            <InfoItem label="Business Name" value={loans?.businessName} />
            <InfoItem label="Ownership Type" value={loans?.ownershipType} />
            <InfoItem label="Employer ID" value={loans?.employerId} />
            <InfoItem label="Number of Staff" value={loans?.numberOfStaffs} />
            <InfoItem label="StartUp Date" value={loans?.businessStartupDate} />
          </>
        )}
        {activeTab === "Asset Finance" && (
          <>
            <InfoItem label="Loan details" value={loans?.loanDetails} />
            <InfoItem label="Loan Type" value={loans?.purpose} />
            <InfoItem label="Asset Name" value={loans?.asset} />
            <InfoItem
              label="Asset descriptions"
              value={loans?.assetdescription}
            />
            <InfoItem label="Asset Quantity" value={loans?.assetQuantity} />
            <InfoItem label="Asset Price" value={loans?.assetPrice} />
            <InfoItem label="Preferred Supplier" value={loans?.Supplier} />
            <InfoItem label="Supplier Quote" value={loans?.supplierQuote} />

            <InfoItem label="Cost of Asset" value={loans?.totalCostofAsset} />
            <InfoItem
              label="Equity Contribution"
              value={loans?.equityContribution}
            />
            <InfoItem
              label="Additional Client Contribution"
              value={loans?.additionalClientContribution}
            />
            <InfoItem
              label="Cost Financed by Tasuwab"
              value={loans?.costOfAssetFinancedByTasuwab}
            />
            <InfoItem
              label="Installment Period (months)"
              value={loans?.InstallmentPeriod}
            />
            <InfoItem
              label="Average inflation rate (%)"
              value={loans?.AverageInflationRate}
            />
            <InfoItem
              label="Inflation Multiplier (%)"
              value={loans?.InflationMultiplier}
            />
            <InfoItem
              label="Post Inflation Cost"
              value={loans?.postInflationCost}
            />
            <InfoItem
              label="Market Risk Premium (%)"
              value={loans?.MarketRiskPremium}
            />
            <InfoItem
              label="Operational Expenses (%)"
              value={loans?.operationalExpenses}
            />
            <InfoItem
              label="Total Real Operation Cost"
              value={loans?.totalRealOperationalCost}
            />
            <InfoItem
              label="Required Profit Margin (%)"
              value={loans?.requiredProfitMargin}
            />
            <InfoItem
              label="Minimum Loan Price"
              value={loans?.minimumAssetPrice}
            />
            <InfoItem label="Profit Estimate" value={loans?.profitEstimate} />
            <InfoItem label="Profit Percentage" value={loans?.profitPercent} />
            <InfoItem
              label="statement of account"
              value={loans?.forms.statementOfAccount}
            />
            <InfoItem label="ID card" value={loans?.forms.idCard} />
            <InfoItem label="Passport" value={loans?.forms.passport} />
            <InfoItem label="Loan Invoice" value={loans?.forms.loanInvoice} />
            <InfoItem
              label="Physical Form Upload"
              value={loans?.forms.physicalFormUpload}
            />
          </>
        )}
        {activeTab === "Loan" && (
          <>
            <InfoItem label="Loan details" value={loans?.loanDetails} />
            <InfoItem label="Loan Type" value={loans?.purpose} />
            <InfoItem label="Loan Amount" value={loans?.loanAmount} />
            <InfoItem
              label="Equity Contribution"
              value={loans?.equityContribution}
            />
            <InfoItem
              label="Additional Client Contribution"
              value={loans?.additionalClientContribution}
            />
            <InfoItem
              label="Cost Financed by Tasuwab"
              value={loans?.costOfAssetFinancedByTasuwab}
            />
            <InfoItem
              label="Installment Period (months)"
              value={loans?.InstallmentPeriod}
            />
            <InfoItem
              label="Average inflation rate (%)"
              value={loans?.AverageInflationRate}
            />
            <InfoItem
              label="Inflation Multiplier (%)"
              value={loans?.InflationMultiplier}
            />
            <InfoItem
              label="Post Inflation Cost"
              value={loans?.postInflationCost}
            />
            <InfoItem
              label="Market Risk Premium (%)"
              value={loans?.MarketRiskPremium}
            />
            <InfoItem
              label="Operational Expenses (%)"
              value={loans?.operationalExpenses}
            />
            <InfoItem
              label="Total Real Operation Cost"
              value={loans?.totalRealOperationalCost}
            />
            <InfoItem
              label="Required Profit Margin (%)"
              value={loans?.requiredProfitMargin}
            />
            <InfoItem
              label="Minimum Loan Price"
              value={loans?.minimumAssetPrice}
            />
            <InfoItem label="Profit Estimate" value={loans?.profitEstimate} />
            <InfoItem label="Profit Percentage" value={loans?.profitPercent} />
            <InfoItem
              label="statement of account"
              value={loans?.forms.statementOfAccount}
            />
            <InfoItem label="ID card" value={loans?.forms.idCard} />
            <InfoItem label="Passport" value={loans?.forms.passport} />
            <InfoItem label="Loan Invoice" value={loans?.forms.loanInvoice} />
            <InfoItem
              label="Physical Form Upload"
              value={loans?.forms.physicalFormUpload}
            />
          </>
        )}

        {activeTab === "guarantor" && (
          <>
            {loans?.guarantors.map((guarantor, index) => (
              <div key={index}>
                <InfoItem
                  label={`Guarantor ${index + 1} Name`}
                  value={guarantor?.name}
                />
                <InfoItem
                  label={`Guarantor ${index + 1} relationship with Client`}
                  value={guarantor?.relationship}
                />
                <InfoItem
                  label={`Guarantor ${index + 1} Phone`}
                  value={guarantor?.phone}
                />
                <InfoItem
                  label={`Guarantor ${index + 1} Email`}
                  value={guarantor?.email}
                />
                <InfoItem
                  label={`Guarantor ${index + 1} Address`}
                  value={guarantor?.address}
                />
                <InfoItem
                  label={`Guarantor ${index + 1} Occupation`}
                  value={guarantor?.occupation}
                />
                <InfoItem
                  label={`Guarantor ${index + 1} ID Card`}
                  value={guarantor?.forms.idCard}
                />
                <InfoItem
                  label={`Guarantor ${index + 1} passport`}
                  value={guarantor?.forms.passport}
                />
                <InfoItem
                  label={`Guarantor ${index + 1} Form Upload`}
                  value={guarantor?.forms.formUpload}
                />
                <hr className="mt-5 mb-5 border border-gray-300" />
              </div>
            ))}
          </>
        )}

        {activeTab === "transactions" && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-sm">Transaction History</p>
              <button
                onClick={() => clearFilter()}
                className="border border-gray-200  font-bold p-2 text-sm text-red-500 rounded-lg cursor-pointer hover:text-white hover:bg-red-500"
              >
                Clear Filter
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs" htmlFor="">
                  Created Date
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs" htmlFor="">
                  Repayment Date
                </label>
                <input
                  type="date"
                  value={filterRepayment}
                  onChange={(e) => setFilterRepayment(e.target.value)}
                  className="border border-gray-300 rounded-md p-2"
                />
              </div>
              <input
                type="text"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md p-2 outline-0"
                placeholder="Filter by DocNbr"
              />
              <input
                type="number"
                value={filterAmount}
                onChange={(e) => setFilterAmount(e.target.value)}
                className="border outline-0 border-gray-300 rounded-md p-2"
                placeholder="Filter by Repaid Amount"
              />
            </div>

            {/* Display filtered transactions */}
            {filteredTransactions?.map((transaction, index) => (
              <div key={index} className="border p-3 rounded-md mb-2">
                <p className="font-bold text-sm">{transaction.date}</p>
                <p className=" text-sm">
                  Repayment Date:
                  <span className="font-bold ml-2">
                    {transaction.RepaymentDate}
                  </span>
                </p>
                <p className=" text-sm">
                  DocNbr:
                  <span className="font-bold ml-2">{transaction.DocNbr}</span>
                </p>
                <p className=" text-sm">
                  Repaid Amount:
                  <span className="font-bold ml-2">
                    {transaction.Repaidamount.toLocaleString("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    })}
                  </span>
                </p>
                <p className=" text-sm">
                  Amount Remaining:
                  <span className="font-bold ml-2">
                    {transaction.amountRemaining.toLocaleString("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    })}
                  </span>
                </p>
                <p className=" text-sm">
                  Months Remaining:
                  <span className="font-bold ml-2">
                    {transaction.MonthsRemaining} months
                  </span>
                </p>
                <p className=" text-sm">
                  Created By :
                  <span className="font-bold ml-2">
                    {transaction.CreatedBy}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 mb-2">
    <p className=" font-bold">{label}:</p>
    <p className=" ">{value || "N/A"}</p>
  </div>
);

export default LoanInfo;
