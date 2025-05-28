"use client";
import React, { useState } from "react";
import DepositTypeConfiguration from "./DepositType";
import LoanTypeConfiguration from "./LoanType";
import DepositInterestTableConfiguration from "./DepositInterest";
import Layout from "@/app/components/Layout";
import EntityTypeTab from "./EntityType";
import LoanTransactionTypeTab from "./LoanTransactionType.";
import EquitySettings from "./Equity";

const SettingsTabs = () => {
  const [activeTab, setActiveTab] = useState("Interest Type Toggle");
  const [depositTypes, setDepositTypes] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [depositInterest, setDepositInterest] = useState([]);
  const [loanInterest, setLoanInterest] = useState([]);
  const [entityTypes, setEntityTypes] = useState([]);
  const [loanTransactionTypes, setLoanTransactionTypes] = useState([]);

  return (
    <Layout>
      <div className="flex gap-3 font-extrabold overflow-x-auto custom-scrollbar ">
        <button
          className={`${
            activeTab === "Interest Type Toggle"
              ? "text-[#3D873B] bg-gray-100 p-1 rounded-lg min-w-40"
              : "text-[#333] min-w-40"
          }`}
          onClick={() => setActiveTab("Interest Type Toggle")}
        >
          Equity Contribution
        </button>

        <button
          className={`${
            activeTab === "Deposit Type Configuration"
              ? "text-[#3D873B] min-w-40 bg-gray-100 p-1 rounded-lg"
              : "text-[#333] min-w-40"
          }`}
          onClick={() => setActiveTab("Deposit Type Configuration")}
        >
          Deposit Type Configuration
        </button>
        <button
          className={`${
            activeTab === "Entity Type Configuration"
              ? "text-[#3D873B] min-w-40 bg-gray-100 p-1 rounded-lg"
              : "text-[#333] min-w-40"
          }`}
          onClick={() => setActiveTab("Entity Type Configuration")}
        >
          Entity Type Configuration
        </button>
        <button
          className={`${
            activeTab === "Loan Type Configuration"
              ? "text-[#3D873B] min-w-40 bg-gray-100 p-1 rounded-lg"
              : "text-[#333] min-w-40"
          }`}
          onClick={() => setActiveTab("Loan Type Configuration")}
        >
          Loan Type Configuration
        </button>
        <button
          className={`${
            activeTab === "Deposit Interest Table Configuration"
              ? "text-[#3D873B] min-w-40 bg-gray-100 p-1 rounded-lg"
              : "text-[#333] min-w-40"
          }`}
          onClick={() => setActiveTab("Deposit Interest Table Configuration")}
        >
          Deposit Interest Table
        </button>
        <button
          className={`${
            activeTab === "Loan Transaction Type"
              ? "text-[#3D873B] min-w-40 bg-gray-100 p-1 rounded-lg"
              : "text-[#333] min-w-40"
          }`}
          onClick={() => setActiveTab("Loan Transaction Type")}
        >
          Transaction Type
        </button>
      </div>
      <div className="tab-content">
        {activeTab === "Interest Type Toggle" && <EquitySettings />}
        {activeTab === "Deposit Type Configuration" && (
          <DepositTypeConfiguration
            depositTypes={depositTypes}
            setDepositTypes={setDepositTypes}
          />
        )}
        {activeTab === "Entity Type Configuration" && (
          <EntityTypeTab
            entityTypes={entityTypes}
            setEntityTypes={setEntityTypes}
          />
        )}
        {activeTab === "Loan Type Configuration" && (
          <LoanTypeConfiguration
            loanTypes={loanTypes}
            setLoanTypes={setLoanTypes}
          />
        )}
        {activeTab === "Deposit Interest Table Configuration" && (
          <DepositInterestTableConfiguration
            depositTypes={depositTypes}
            depositInterest={depositInterest}
            setDepositInterest={setDepositInterest}
          />
        )}

        {activeTab === "Loan Transaction Type" && (
          <LoanTransactionTypeTab
            loanTransactionTypes={loanTransactionTypes}
            setLoanTransactionTypes={setLoanTransactionTypes}
          />
        )}
      </div>
    </Layout>
  );
};

export default SettingsTabs;
