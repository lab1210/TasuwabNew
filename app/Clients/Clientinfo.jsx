import React, { useState } from "react";
import { BsGenderFemale, BsGenderMale } from "react-icons/bs";
import { FaRegBuilding, FaRegMap, FaUsers } from "react-icons/fa";
import { GiHutsVillage, GiRelationshipBounds } from "react-icons/gi";
import { HiOutlineIdentification } from "react-icons/hi2";
import { IoIosClose, IoMdLocate } from "react-icons/io";
import { LiaBirthdayCakeSolid } from "react-icons/lia";
import {
  MdAlternateEmail,
  MdOutlineHolidayVillage,
  MdOutlinePhone,
  MdWorkOutline,
} from "react-icons/md";

const Clientinfo = ({ client, onClose, isOpen }) => {
  const [activeTab, setActiveTab] = useState("personal");

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

  return (
    <div
      className={`fixed top-0 right-0 overflow-y-auto h-screen w-96 bg-white shadow-md z-20 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-end cursor-pointer hover:text-red-500 ">
        <IoIosClose size={40} onClick={onClose} />
      </div>

      <div className="flex justify-center">
        <div className="flex items-center justify-center w-20 h-20 p-3 text-[#3D873B] rounded-full bg-gray-100 object-contain">
          <FaUsers className="w-full h-full" />
        </div>
      </div>

      <div className="text-center mt-3 text-lg font-bold mb-4">
        <p>{client?.firstName + " " + client?.lastName}</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-around border-b border-b-gray-100">
        <div
          className={tabClass("personal")}
          onClick={() => setActiveTab("personal")}
        >
          Personal
        </div>
        <div
          className={tabClass("address")}
          onClick={() => setActiveTab("address")}
        >
          Address
        </div>
        <div
          className={tabClass("employment")}
          onClick={() => setActiveTab("employment")}
        >
          Employment
        </div>
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
              value={client?.phoneNumber}
            />
            <InfoItem
              icon={<LiaBirthdayCakeSolid />}
              label="DOB"
              value={formatDate(client?.dateOfBirth)}
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

        {activeTab === "address" && (
          <>
            <InfoItem
              icon={<IoMdLocate />}
              label="Address"
              value={client?.address}
            />
            <InfoItem
              icon={<GiHutsVillage />}
              label="Town"
              value={client?.town}
            />
            <InfoItem
              icon={<MdOutlineHolidayVillage />}
              label="State"
              value={client?.state}
            />
            <InfoItem
              icon={<FaRegMap />}
              label="Nationality"
              value={client?.nationality}
            />
          </>
        )}

        {activeTab === "employment" && (
          <>
            <InfoItem
              icon={<MdWorkOutline />}
              label="Occupation"
              value={client?.occupation}
            />
            <InfoItem
              icon={<FaRegBuilding />}
              label="Employer"
              value={client?.employer}
            />
            <InfoItem
              icon={<IoMdLocate />}
              label="Employer Address"
              value={client?.employerAddress}
            />
          </>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2">
    <div>{icon}</div>
    <p className="font-bold text-sm w-full flex items-center justify-between">
      {label}
      <span className="font-normal min-w-40 text-center text-xs border border-gray-200 p-2 rounded-md">
        {value || "N/A"}
      </span>
    </p>
  </div>
);

export default Clientinfo;
