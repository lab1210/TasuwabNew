"use client";
import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import { useAuth } from "@/Services/authService";
import { IoIosClose, IoMdLocate } from "react-icons/io";
import { FaRegBuilding, FaUserShield, FaUserTie } from "react-icons/fa";
import { HiOutlineIdentification } from "react-icons/hi2";
import { MdAlternateEmail, MdOutlinePhone } from "react-icons/md";
import { BsGenderMale } from "react-icons/bs";
import { BsGenderFemale } from "react-icons/bs";
import { LiaBirthdayCakeSolid, LiaSitemapSolid } from "react-icons/lia";
import {
  fetchBranchName,
  fetchDepartmentName,
  fetchPositionName,
} from "@/Services/nameService";
import { GoBriefcase } from "react-icons/go";
const Profile = ({ onClose, isProfileSidebarOpen }) => {
  const { user } = useAuth();

  const [branchName, setBranchName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [positionName, setPositionName] = useState("");

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const branch = user?.BranchCode
          ? await fetchBranchName(user?.BranchCode)
          : "N/A";
        const department = user?.DepartmentCode
          ? await fetchDepartmentName(user?.DepartmentCode)
          : "N/A";
        const position = user?.PositionCode
          ? await fetchPositionName(user?.PositionCode)
          : "N/A";

        setBranchName(branch || "N/A");
        setDepartmentName(department || "N/A");
        setPositionName(position || "N/A");
      } catch (error) {
        console.error("Error loading profile details:", error);
        setBranchName("N/A");
        setDepartmentName("N/A");
        setPositionName("N/A");
      }
    };

    loadDetails();
  }, [user?.branchCode, user?.departmentCode, user?.positionCode]);

  const formatDate = (dateNumber) => {
    if (!dateNumber) return "N/A";
    const year = Math.floor(dateNumber / 10000);
    const month = Math.floor((dateNumber % 10000) / 100);
    const day = dateNumber % 100;
    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  };

  if (!user) {
    return (
      <Layout>
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="w-12 h-12 border-4 border-[#333] border-t-[#3D873B] rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <div
      className={`fixed top-0 right-0 overflow-y-auto h-screen w-90 bg-white shadow-md z-20 transform transition-transform duration-300 ease-in-out ${
        isProfileSidebarOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-end cursor-pointer hover:text-red-500 ">
        <IoIosClose size={40} onClick={onClose} />
      </div>
      <div className="flex justify-center">
        <div className="flex items-center justify-center w-20 h-20 p-3 text-[#3D873B] rounded-full  bg-gray-100 object-contain">
          <FaUserTie className="w-full h-full" />
        </div>
      </div>
      <div className="text-center mt-3 text-lg font-bold pl-4 mb-2">
        <p>{user.firstName + " " + user.lastName}</p>
      </div>
      <hr className="text-gray-200 shadow-md" />

      <div className="flex flex-col p-5 gap-5 ">
        <div className="flex items-center gap-2 w-full">
          <div>
            <HiOutlineIdentification />
          </div>
          <p className="font-bold text-sm w-full flex items-center justify-between ">
            Staff Code{" "}
            <span className="font-normal min-w-40 text-center text-xs border border-gray-200 p-2 rounded-md ">
              {user.StaffCode}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <MdAlternateEmail />
          </div>
          <p className="font-bold text-sm w-full flex items-center justify-between ">
            Email
            <span className="font-normal min-w-40 text-center text-xs border border-gray-200 p-2 rounded-md ">
              {user.Email}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <MdOutlinePhone />
          </div>
          <p className="font-bold text-sm w-full flex items-center justify-between ">
            Phone
            <span className="font-normal min-w-40 text-center text-xs border border-gray-200 p-2 rounded-md ">
              {user.phone}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <LiaBirthdayCakeSolid />
          </div>
          <p className="font-bold text-sm w-full flex items-center justify-between ">
            DOB
            <span className="font-normal min-w-40 text-center text-xs border border-gray-200 p-2 rounded-md ">
              {formatDate(user.dateOfBirth)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div>
            {user.gender === "Female" ? <BsGenderFemale /> : <BsGenderMale />}
          </div>
          <p className="font-bold text-sm w-full flex items-center justify-between ">
            Gender
            <span className="font-normal min-w-40 text-center text-xs border border-gray-200 p-2 rounded-md ">
              {user.gender}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <IoMdLocate />
          </div>
          <p className="font-bold text-sm w-full flex items-center justify-between ">
            Address
            <span className="font-normal min-w-40 text-center text-xs border border-gray-200 p-2 rounded-md ">
              {user.address}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <GoBriefcase />
          </div>
          <p className="font-bold text-sm w-full flex items-center justify-between ">
            Position
            <span className="font-normal min-w-40 text-center text-xs border border-gray-200 p-2 rounded-md ">
              {positionName}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <LiaSitemapSolid />
          </div>
          <p className="font-bold text-sm w-full flex items-center justify-between ">
            Department
            <span className="font-normal min-w-40 text-center text-xs border border-gray-200 p-2 rounded-md ">
              {departmentName}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <FaRegBuilding />
          </div>
          <p className="font-bold text-sm w-full flex items-center justify-between ">
            Branch
            <span className="font-normal min-w-40 text-center text-xs border border-gray-200 p-2 rounded-md ">
              {branchName}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <FaUserShield />
          </div>
          <p className="font-bold text-sm w-full flex items-center justify-between ">
            Role
            <span className="font-normal min-w-40 text-center text-xs border border-gray-200 p-2 rounded-md ">
              {user.role}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
