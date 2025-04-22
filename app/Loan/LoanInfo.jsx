import React, { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { HiOutlineIdentification } from "react-icons/hi2";
import { MdAlternateEmail, MdOutlinePhone } from "react-icons/md";
import { LiaBirthdayCakeSolid } from "react-icons/lia";
import { BsGenderFemale, BsGenderMale } from "react-icons/bs";
import { GiPayMoney, GiRelationshipBounds } from "react-icons/gi";
import {
  FaCashRegister,
  FaMoneyBill,
  FaPlus,
  FaUniversity,
  FaUsers,
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
  const [filterType, setFilterType] = useState("");
  const [filterAmount, setFilterAmount] = useState("");
  const [filterDescription, setFilterDescription] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const client = dummyClients.find((c) => c.clientId === loans?.clientId);

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
  const filteredTransactions = loans?.transactions?.filter((transaction) => {
    return (
      (filterDate ? transaction.date.includes(filterDate) : true) &&
      (filterType
        ? transaction.type.toLowerCase().includes(filterType.toLowerCase())
        : true) &&
      (filterAmount
        ? transaction.amount.toString().includes(filterAmount)
        : true) &&
      (filterDescription
        ? transaction.description
            .toLowerCase()
            .includes(filterDescription.toLowerCase())
        : true)
    );
  });
  const clearFilter = () => {
    setFilterDate("");
    setFilterType("");
    setFilterAmount("");
    setFilterDescription("");
  };

  return (
    <div
      className={`overflow-x-hidden fixed top-0 right-0 overflow-y-auto h-screen w-96 bg-white shadow-md z-20 transform transition-transform duration-300 ease-in-out ${
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
        <p>{client?.firstName + " " + client?.lastName}</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-around border-b border-b-gray-100 text-sm hover:overflow-x-scroll">
        {[
          "personal",
          "bank",
          "guarantor",
          "document",
          "memo",
          "transactions",
        ].map((tab) => (
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
            <InfoItem
              icon={<HiOutlineIdentification />}
              label="Client ID"
              value={client?.clientId}
            />
            <InfoItem
              icon={<MdAlternateEmail />}
              label="Email"
              value={client?.email}
            />
            <InfoItem
              icon={<MdOutlinePhone />}
              label="Phone"
              value={client?.phone}
            />
            <InfoItem
              icon={<LiaBirthdayCakeSolid />}
              label="DOB"
              value={formatDate(client?.dob)}
            />
            <InfoItem
              icon={
                client?.gender === "Female" ? (
                  <BsGenderFemale />
                ) : (
                  <BsGenderMale />
                )
              }
              label="Gender"
              value={client?.gender}
            />
            <InfoItem
              icon={<GiRelationshipBounds />}
              label="Marital Status"
              value={client?.maritalStatus}
            />
          </>
        )}

        {activeTab === "bank" && (
          <>
            <InfoItem
              icon={<FaUniversity />}
              label="Bank Name"
              value={loans?.bank}
            />
            <InfoItem
              icon={<HiOutlineIdentification />}
              label="Account Number"
              value={loans?.bankAccount}
            />
            <InfoItem
              icon={<FaCashRegister />}
              label="Loan Amount"
              value={loans?.loanAmount}
            />
            <InfoItem
              icon={<FaMoneyBill />}
              label="Equity Contribution"
              value={loans?.Equity + "%"}
            />
            <InfoItem
              icon={<FaPlus />}
              label="Interest"
              value={loans?.interestRate + "%"}
            />
          </>
        )}

        {activeTab === "guarantor" && (
          <>
            {loans?.guarantors.map((guarantor, index) => (
              <div key={index}>
                <InfoItem
                  icon={<FaUserShield />}
                  label={`Guarantor ${index + 1} Name`}
                  value={guarantor?.name}
                />
                <InfoItem
                  icon={<MdOutlinePhone />}
                  label={`Guarantor ${index + 1} Phone`}
                  value={guarantor?.phone}
                />
                <InfoItem
                  icon={<MdAlternateEmail />}
                  label={`Guarantor ${index + 1} Email`}
                  value={guarantor?.email}
                />
                <InfoItem
                  icon={<TbNotebook />}
                  label={`Guarantor ${index + 1} Address`}
                  value={guarantor?.address}
                />
              </div>
            ))}
          </>
        )}

        {activeTab === "document" && (
          <div className="flex items-center justify-between border p-3 rounded-md">
            <p className="text-sm">Loan Agreement</p>
            <button
              className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
              onClick={downloadDocument}
            >
              <RiFileDownloadLine /> Download PDF
            </button>
          </div>
        )}

        {activeTab === "memo" && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="memo"
              className="font-semibold text-sm flex items-center gap-2"
            >
              <TbNotebook /> Memo
            </label>
            <p className="font-normal min-w-40 text-center text-xs border border-gray-200 p-2 rounded-md">
              {loans.memo}
            </p>
          </div>
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
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border border-gray-300 rounded-md p-2"
                placeholder="Filter by Date"
              />
              <input
                type="text"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md p-2 outline-0"
                placeholder="Filter by Type"
              />
              <input
                type="number"
                value={filterAmount}
                onChange={(e) => setFilterAmount(e.target.value)}
                className="border outline-0 border-gray-300 rounded-md p-2"
                placeholder="Filter by Amount"
              />
              <input
                type="text"
                value={filterDescription}
                onChange={(e) => setFilterDescription(e.target.value)}
                className="border outline-0 border-gray-300 rounded-md p-2"
                placeholder="Filter by Description"
              />
            </div>

            {/* Display filtered transactions */}
            {filteredTransactions?.map((transaction, index) => (
              <div key={index} className="border p-3 rounded-md mb-2">
                <p className="font-bold text-sm">{transaction.date}</p>
                <p className="text-sm">Type: {transaction.type}</p>
                <p className="text-sm">Amount: {transaction.amount}</p>
                <p className="text-sm">
                  Description: {transaction.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 mb-2">
    <div className="text-[#3D873B]">{icon}</div>
    <p className="text-sm font-medium">{label}:</p>
    <p className="text-sm font-normal">{value || "N/A"}</p>
  </div>
);

export default LoanInfo;
