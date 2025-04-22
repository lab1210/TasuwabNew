"use client";
import { useAuth } from "@/Services/authService";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { LuEye, LuEyeClosed } from "react-icons/lu";

const SetPassword = () => {
  const { initialPasswordSet } = useAuth(); // Use the initialPasswordSet function from the auth service
  const router = useRouter();
  const [showDefaultPassword, setShowDefaultPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [staffCode, setStaffCode] = useState("");
  const [defaultPassword, setDefaultPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleDefaultPasswordVisibility = () => {
    setShowDefaultPassword(!showDefaultPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!staffCode || !defaultPassword || !newPassword) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await initialPasswordSet(
        staffCode,
        defaultPassword,
        newPassword
      ); // Call initialPasswordSet
      if (response.success) {
        setSuccessMessage(
          response.message ||
            "Password has been set successfully. You can now login."
        );
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(response.message || "Failed to set password.");
      }
    } catch (err) {
      console.error("Error setting password:", err);
      setError(err.message || "Failed to set password."); // Access err.message if available
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[url(/loginbg.png)] shadow-md bg-cover bg-center w-screen h-screen flex justify-center p-8">
      <div className="flex flex-col">
        <div className="w-38 h-18 object-contain mb-3">
          <img src="/logo.png" alt="" className="w-full h-full" />
        </div>
        <p className="font-bold text-3xl mb-2">Set New Password</p>
        <p className="font-light text-sm mb-7">
          Please enter the details to set your new password.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="text-sm flex flex-col gap-1">
            <label className="text-[#999999]" htmlFor="emailOrStaffCode">
              Staff Code
            </label>
            <input
              type="text"
              id="staffCode"
              required
              value={staffCode}
              onChange={(e) => setStaffCode(e.target.value)}
              className="placeholder:text-xs border-b-2 outline-0 p-1 text-lg"
            />
          </div>
          <div className="text-sm flex flex-col gap-1">
            <label className="text-[#999999]" htmlFor="password">
              Default Password
            </label>
            <div className="relative">
              <input
                type={showDefaultPassword ? "text" : "password"}
                required
                value={defaultPassword}
                onChange={(e) => setDefaultPassword(e.target.value)}
                className="w-full placeholder:text-xs border-b-2 outline-0 p-1 text-lg"
              />
              {showDefaultPassword ? (
                <LuEye
                  size={25}
                  onClick={toggleDefaultPasswordVisibility}
                  className="absolute right-0 cursor-pointer top-0"
                />
              ) : (
                <LuEyeClosed
                  size={25}
                  onClick={toggleDefaultPasswordVisibility}
                  className="absolute right-0 cursor-pointer top-0"
                />
              )}
            </div>
          </div>
          <div className="text-sm flex flex-col gap-1">
            <label className="text-[#999999]" htmlFor="password">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="newPassword"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full placeholder:text-xs border-b-2 outline-0 p-1 text-lg"
              />
            </div>
          </div>
          {successMessage && (
            <p className="text-green-500 font-bold text-xs">{successMessage}</p>
          )}
          {error && <p className="text-red-500 font-bold text-xs">{error}</p>}
          <button
            disabled={isLoading}
            className="bg-[#50AA4E] text-white p-2 font-bold cursor-pointer hover:opacity-85 hover:shadow-md"
          >
            {isLoading ? "Setting Password..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;
