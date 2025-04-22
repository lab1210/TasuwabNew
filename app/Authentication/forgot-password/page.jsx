"use client";
import { useAuth } from "@/Services/authService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LuEye, LuEyeClosed } from "react-icons/lu";

const Forgot_Password = () => {
  const { resetPassword, resetForgottenPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [staffCode, setStaffCode] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetForgottenError, setResetForgottenError] = useState("");
  const [resetForgottenSuccess, setResetForgottenSuccess] = useState("");

  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    if (resetForgottenSuccess) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 2000); // Redirect after 2 seconds (adjust as needed)

      return () => clearTimeout(timer); // Clear the timer if the component unmounts
    }
  }, [resetForgottenSuccess, router]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);
    setEmailSubmitted(false); // Reset state when submitting again

    try {
      const result = await resetPassword(email);
      if (result && result.success) {
        setMessage(result.message);
        setEmailSubmitted(true); // Show the next form
      } else {
        setError(result?.message || "Failed to initiate password reset.");
      }
    } catch (err) {
      setError(err?.message || "Failed to initiate password reset.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForgottenPassword = async (e) => {
    e.preventDefault();
    setResetForgottenError("");
    setResetForgottenSuccess("");
    if (
      !staffCode ||
      !temporaryPassword ||
      !newPassword ||
      newPassword !== confirmNewPassword
    ) {
      setResetForgottenError(
        "Please fill in all fields and ensure passwords match."
      );
      return;
    }

    setResettingPassword(true);
    try {
      const result = await resetForgottenPassword(
        staffCode,
        temporaryPassword,
        newPassword
      );
      console.log("Password reset was successful!");
      console.log("Success message:", result.message);
      console.log("resetForgottenSuccess state:", resetForgottenSuccess);
      if (result && result.success) {
        setResetForgottenSuccess(
          result?.message || "Password reset successfully!"
        );
        setMessage(""); // Clear initial message
        setEmailSubmitted(false); // Go back to email form after success (optional)
        setEmail("");
        setStaffCode("");
        setTemporaryPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setResetForgottenError(
          result?.message ||
            "Failed to reset password. Please check your details."
        );
      }
    } catch (err) {
      setResetForgottenError(err?.message || "Failed to reset password.");
    } finally {
      setResettingPassword(false);
    }
  };

  if (!emailSubmitted) {
    return (
      <div className="bg-[url(/loginbg.png)] shadow-md bg-cover bg-center w-screen h-screen flex justify-center p-8">
        <div className="flex flex-col">
          <div className="w-38 h-18 object-contain mb-3">
            <img src="/logo.png" alt="" className="w-full h-full" />
          </div>
          <p className="font-bold text-3xl mb-2">Forgot Password</p>
          <p className="font-light text-sm mb-7">
            Enter your email address to receive a temporary password and set a
            new one.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-7">
            <div className="text-sm flex flex-col gap-2">
              <label className="text-[#999999]" htmlFor="emailOrStaffCode">
                Email Address
              </label>
              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                value={email}
                className="placeholder:text-xs border-b-2 outline-0 p-1 text-lg"
              />
            </div>
            {message && (
              <p className="text-green-500 font-bold text-xs">{message}</p>
            )}
            {error && <p className="text-red-500 font-bold text-xs">{error}</p>}
            <button
              disabled={isLoading}
              className="bg-[#50AA4E] text-white p-2 font-bold cursor-pointer hover:opacity-85 hover:shadow-md"
            >
              {isLoading ? "Sending..." : "Submit Email"}
            </button>
            <p>
              <Link
                className="hover:underline hover:underline-offset-1"
                href={"/"}
              >
                &lt; Back to Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    );
  }
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
        <form
          onSubmit={handleResetForgottenPassword}
          className="flex flex-col gap-5"
        >
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
              Temporary Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                id="temporaryPassword"
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                className="w-full placeholder:text-xs border-b-2 outline-0 p-1 text-lg"
              />
              {showPassword ? (
                <LuEye
                  size={25}
                  onClick={togglePasswordVisibility}
                  className="absolute right-0 cursor-pointer top-0"
                />
              ) : (
                <LuEyeClosed
                  size={25}
                  onClick={togglePasswordVisibility}
                  className="absolute right-0 cursor-pointer top-0"
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
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
            <div className="text-sm flex flex-col gap-1">
              <label className="text-[#999999]" htmlFor="password">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  id="confirmNewPassword"
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  value={confirmNewPassword}
                  className="w-full placeholder:text-xs border-b-2 outline-0 p-1 text-lg"
                />
              </div>
            </div>
          </div>
          {resetForgottenSuccess && (
            <p className="text-green-500 font-bold text-xs">
              {resetForgottenSuccess}
            </p>
          )}
          {resetForgottenError && (
            <p className="text-red-500 font-bold text-xs">
              {resetForgottenError}
            </p>
          )}
          <button
            disabled={resettingPassword}
            className="bg-[#50AA4E] text-white p-2 font-bold cursor-pointer hover:opacity-85 hover:shadow-md"
          >
            {resettingPassword ? "Resetting Password..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Forgot_Password;
