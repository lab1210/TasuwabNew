import staffService from "@/Services/staffService";
import React, { useEffect, useState } from "react";

const DetailStaff = ({ staffCode }) => {
  const [detailedStaff, setDetailedStaff] = useState({});
  const [loadingDetailedStaff, setLoadingDetailedStaff] = useState(null);
  const [errorDetailedStaff, setErrorDetailedStaff] = useState(null);

  const formatDate = (date) => {
    if (!date) return "";
    const year = Math.floor(date / 10000);
    const month = Math.floor((date % 10000) / 100);
    const day = date % 100;
    return `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    }`;
  };

  useEffect(() => {
    if (staffCode) {
      fetchDetailedStaff(staffCode);
    }
  }, [staffCode]); // Re-run effect when staffCode changes

  const fetchDetailedStaff = async (code) => {
    setLoadingDetailedStaff(true);
    setErrorDetailedStaff(null);
    try {
      const response = await staffService.getStaff(code);
      if (response?.staff && response?.user) {
        setDetailedStaff(response);
      } else {
        console.warn("Unexpected detailed staff data:", response);
        setErrorDetailedStaff("Failed to load detailed staff information.");
      }
    } catch (error) {
      console.error(`Error fetching details for ${code}:`, error);
      setErrorDetailedStaff(`Failed to load details for ${code}`);
    } finally {
      setLoadingDetailedStaff(false);
    }
  };

  if (!staffCode) {
    return <p>No staff selected to display details.</p>;
  }

  if (loadingDetailedStaff) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="w-12 h-12 border-4 border-[#333] border-t-[#3D873B] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorDetailedStaff) {
    return <p className="text-red-500">{errorDetailedStaff}</p>;
  }

  if (!detailedStaff) {
    return <p>No details available for this staff.</p>;
  }

  return (
    <div className="grid grid-cols-3 text-center">
      <p className="font-bold flex flex-col mb-2 items-start">
        Staff Code{" "}
        <span className="font-normal">{detailedStaff?.staff?.staffCode}</span>
      </p>
      <p className="font-bold flex flex-col mb-2 items-start">
        First Name{" "}
        <span className="font-normal">{detailedStaff?.staff?.firstName}</span>
      </p>
      <p className="font-bold flex flex-col mb-2 items-start">
        Last Name{" "}
        <span className="font-normal">{detailedStaff?.staff?.lastName}</span>
      </p>
      <p className="font-bold flex flex-col mb-2 items-start">
        Gender{" "}
        <span className="font-normal">{detailedStaff?.staff?.gender}</span>
      </p>
      <p className="font-bold flex flex-col mb-2 items-start">
        Marital Status{" "}
        <span className="font-normal">
          {detailedStaff?.staff?.martialStatus}
        </span>
      </p>
      <p className="font-bold flex flex-col mb-2 items-start">
        Date of Birth{" "}
        <span className="font-normal">
          {formatDate(detailedStaff?.staff?.dateOfBirth)}
        </span>
      </p>
      <p className="font-bold flex flex-col mb-2 items-start">
        Address{" "}
        <span className="font-normal">{detailedStaff?.staff?.address}</span>
      </p>
      <p className="font-bold flex flex-col mb-2 items-start">
        Phone <span className="font-normal">{detailedStaff?.staff?.phone}</span>
      </p>
      <p className="font-bold flex flex-col mb-2 items-start">
        Email <span className="font-normal">{detailedStaff?.user?.email}</span>
      </p>
      <p className="font-bold flex flex-col mb-2 items-start">
        Role Code{" "}
        <span className="font-normal">{detailedStaff?.user?.roleCode}</span>
      </p>
      <p className="font-bold flex flex-col mb-2 items-start">
        Position Code{" "}
        <span className="font-normal">{detailedStaff?.user?.positionCode}</span>
      </p>
      <p className="font-bold flex flex-col mb-2 items-start">
        Department Code{" "}
        <span className="font-normal">
          {detailedStaff?.user?.departmentCode}
        </span>
      </p>
      <p className="font-bold flex flex-col mb-2 items-start">
        Branch Code{" "}
        <span className="font-normal">{detailedStaff?.user?.branchCode}</span>
      </p>
      <p className="font-bold flex flex-col mb-2 items-start">
        Password Set{" "}
        <span className="font-normal">
          {detailedStaff?.user?.isPasswordSet ? "Yes" : "No"}
        </span>
      </p>
    </div>
  );
};

export default DetailStaff;
