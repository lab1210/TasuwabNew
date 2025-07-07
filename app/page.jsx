"use client";
import { useAuth } from "@/Services/authService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { LuEyeClosed, LuEye } from "react-icons/lu";

const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrStaffCode, setEmailOrStaffCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  //Password Toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state before each attempt

    // Basic validation
    if (!emailOrStaffCode || !password) {
      setError("Please fill in both fields.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Attempting login with:", emailOrStaffCode, password);
      await login(emailOrStaffCode, password);
      console.log("Login successful, redirecting...");
      // After successful login, authService should handle redirection internally
    } catch (err) {
      if (typeof err === "string" && err.includes("Password not set")) {
        // Handle password not set scenario
        router.push("/Authentication/Set-Password");
      } else {
        // Display error message to user
        setError(
          typeof err === "string" ? err : "Login failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[url(/loginbg.png)]  bg-cover bg-center w-screen h-screen flex justify-center items-center p-8 sm:p-0">
      <div className="flex flex-col ">
        <div className="w-38 h-18 object-contain mb-3">
          <img src="/logo.png" alt="" className="w-full h-full" />
        </div>
        <p className="font-bold text-3xl mb-2">Organization Login</p>
        <p className="font-light text-sm mb-7">
          Please login here to access your organization account.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          <div className="text-sm flex flex-col gap-2">
            <label className="text-[#999999]" htmlFor="emailOrStaffCode">
              Email or Staff Code
            </label>
            <input
              id="emailOrStaffCode"
              type="text"
              value={emailOrStaffCode}
              required
              onChange={(e) => setEmailOrStaffCode(e.target.value)}
              className="border-b-2 outline-0 p-1 text-lg"
            />
          </div>
          <div className="text-sm flex flex-col gap-2">
            <label className="text-[#999999]" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b-2 outline-0 p-1 text-lg"
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
          {error && <p className="text-red-600 text-xs font-bold">{error}</p>}

          <Link href={"/Authentication/forgot-password"}>
            <p className="text-sm hover:underline-offset-2 hover:underline">
              Forgot Password?
            </p>
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-[#3D873B] text-white p-2 font-bold cursor-pointer hover:opacity-85 hover:shadow-md ${
              isLoading ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isLoading ? "Logging In..." : "login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
