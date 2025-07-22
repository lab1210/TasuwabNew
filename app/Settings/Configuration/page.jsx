"use client";
import React, { useEffect, useState } from "react";
import DepositTypeConfiguration from "./DepositType";
import LoanTypeConfiguration from "./LoanType";
import DepositInterestTableConfiguration from "./DepositInterest";
import Layout from "@/app/components/Layout";
import EntityTypeTab from "./EntityType";
import LoanTransactionTypeTab from "./LoanTransactionType.";
import Bank from "./Bank";
import Charges from "./Charges";

const SettingsTabs = () => {
  const [activeTab, setActiveTab] = useState("Bank Toggle");

  return (
    <Layout>
      <div className="grid lg:grid-cols-7 md:grid-cols-4 grid-cols-2  gap-3 font-extrabold overflow-x-auto custom-scrollbar ">
        <button
          className={`${
            activeTab === "Bank Toggle"
              ? "text-[#3D873B] font-extrabold bg-green-100 p-2 rounded-lg "
              : "text-[#333]  bg-gray-100 rounded-lg p-2"
          }`}
          onClick={() => setActiveTab("Bank Toggle")}
        >
          Company Banks
        </button>
        <button
          className={`${
            activeTab === "Deposit Interest Table Configuration"
              ? "text-[#3D873B] font-extrabold  bg-green-100 p-2 rounded-lg"
              : "text-[#333]  bg-gray-100 rounded-lg p-2"
          }`}
          onClick={() => setActiveTab("Deposit Interest Table Configuration")}
        >
          Interest Type
        </button>
        <button
          className={`${
            activeTab === "Deposit Type Configuration"
              ? "text-[#3D873B] font-extrabold  bg-green-100 p-2 rounded-lg"
              : "text-[#333]  bg-gray-100 rounded-lg p-2 "
          }`}
          onClick={() => setActiveTab("Deposit Type Configuration")}
        >
          Deposit Type
        </button>
        <button
          className={`${
            activeTab === "Entity Type Configuration"
              ? "text-[#3D873B] font-extrabold  bg-green-100 p-2 rounded-lg"
              : "text-[#333]  bg-gray-100 rounded-lg p-2"
          }`}
          onClick={() => setActiveTab("Entity Type Configuration")}
        >
          Entity Type
        </button>
        <button
          className={`${
            activeTab === "Charges"
              ? "text-[#3D873B] font-extrabold  bg-green-100 p-2 rounded-lg"
              : "text-[#333]  bg-gray-100 rounded-lg p-2"
          }`}
          onClick={() => setActiveTab("Charges")}
        >
          Charges
        </button>
        <button
          className={`${
            activeTab === "Loan Transaction Type"
              ? "text-[#3D873B] font-extrabold  bg-green-100 p-2 rounded-lg"
              : "text-[#333]  bg-gray-100 rounded-lg p-2"
          }`}
          onClick={() => setActiveTab("Loan Transaction Type")}
        >
          Transaction Type
        </button>
        <button
          className={`${
            activeTab === "Loan Type Configuration"
              ? "text-[#3D873B] font-extrabold  bg-green-100 p-2 rounded-lg"
              : "text-[#333]  bg-gray-100 rounded-lg p-2"
          }`}
          onClick={() => setActiveTab("Loan Type Configuration")}
        >
          Loan Type
        </button>
      </div>
      <div className="tab-content">
        {activeTab === "Bank Toggle" && <Bank />}

        {activeTab === "Deposit Type Configuration" && (
          <DepositTypeConfiguration />
        )}
        {activeTab === "Entity Type Configuration" && <EntityTypeTab />}
        {activeTab === "Deposit Interest Table Configuration" && (
          <DepositInterestTableConfiguration />
        )}
        {activeTab === "Charges" && <Charges />}

        {activeTab === "Loan Transaction Type" && <LoanTransactionTypeTab />}
        {activeTab === "Loan Type Configuration" && <LoanTypeConfiguration />}
      </div>
    </Layout>
  );
};

export default SettingsTabs;
