"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import Cookies from "js-cookie"; // Import js-cookie

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/Authentication`;

const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

const checkTokenExpiry = (token) => {
  if (!token) return true;
  const decodedToken = decodeJwt(token);
  if (decodedToken && decodedToken.exp) {
    const expiryTime = decodedToken.exp * 1000;
    return Date.now() >= expiryTime;
  }
  return false;
};

const isTokenExpiringSoon = (token, thresholdSeconds = 60) => {
  if (!token) return false;
  const decodedToken = decodeJwt(token);
  if (decodedToken && decodedToken.exp) {
    const expiryTime = decodedToken.exp * 1000;
    const timeLeft = expiryTime - Date.now();
    return timeLeft <= thresholdSeconds * 1000 && timeLeft > 0;
  }
  return false;
};

// Create the AuthContext
const AuthContext = createContext();

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNeeded, setRefreshNeeded] = useState(false);
  const [isTokenExpiringWarningVisible, setIsTokenExpiringWarningVisible] =
    useState(false);

  const logout = useCallback(
    async (isExpired = false) => {
      try {
        // Only try to call logout API if token isn't expired
        if (!isExpired) {
          await axios.post(`${API_URL}/logout`);
        }

        // Clear client-side state regardless
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        Cookies.remove("refreshToken", { path: "/" });

        setUser(null);
        router.push("/");
      } catch (error) {
        console.error("Logout API Error:", error);
        // Even if API fails, clear client-side state
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        Cookies.remove("refreshToken", { path: "/" });
        setUser(null);
        router.push("/");
      }
    },
    [router]
  );

  const refreshTokenFn = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const response = await axios.post(`${API_URL}/refresh`);
      const newToken = response.data.token;
      localStorage.setItem("accessToken", newToken);
      setUser((prevUser) =>
        prevUser ? { ...prevUser, token: newToken } : { token: newToken }
      );
      setIsRefreshing(false);
      setRefreshNeeded(false); // Reset the flag
      setIsTokenExpiringWarningVisible(false); // Hide the warning on successful refresh
      return newToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      console.error("Refresh Error Response:", error.response?.data);
      setIsRefreshing(false);
      setRefreshNeeded(false);
      setIsTokenExpiringWarningVisible(false); // Hide warning on failure as well
      logout(); // Force logout on refresh failure
      throw error.response?.data?.message || "Token refresh failed";
    }
  }, [isRefreshing, logout]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userDetails = JSON.parse(localStorage.getItem("user"));

    if (token && userDetails) {
      setUser({ token, ...userDetails });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const token = localStorage.getItem("accessToken");
      if (token && isTokenExpiringSoon(token) && !isRefreshing) {
        setIsTokenExpiringWarningVisible(true);
        setTimeout(() => setRefreshNeeded(true), 3000);
      } else if (token && checkTokenExpiry(token)) {
        logout(true); // Pass true to indicate token is expired
      } else {
        setIsTokenExpiringWarningVisible(false);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isRefreshing, logout]);

  useEffect(() => {
    let isMounted = true;
    if (refreshNeeded && isMounted) {
      refreshTokenFn();
    }
    return () => {
      isMounted = false;
    };
  }, [refreshNeeded, refreshTokenFn]);

  const login = async (emailOrStaffCode, password) => {
    try {
      const response = await axios.post(`${API_URL}/Login`, {
        emailOrStaffCode,
        password,
      });

      console.log("Full Response Data:", response.data);

      const { token, isPasswordSet } = response.data;
      const StaffCode = response.data.staffCode;
      const Email = response.data.email;
      const role = response.data.role;
      const PositionCode = response.data.positionCode;
      const DepartmentCode = response.data.departmentCode;
      const BranchCode = response.data.branchCode;
      const StaffPersonalInformation = response.data.staffPersonalInformation;

      // Save the data in localStorage
      localStorage.setItem("accessToken", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          StaffCode,
          Email,
          role,
          PositionCode,
          DepartmentCode,
          BranchCode,
          isPasswordSet,
          firstName: StaffPersonalInformation?.firstName,
          lastName: StaffPersonalInformation?.lastName,
          gender: StaffPersonalInformation?.gender,
          martialStatus: StaffPersonalInformation?.martialStatus,
          dateOfBirth: StaffPersonalInformation?.dateOfBirth,
          address: StaffPersonalInformation?.address,
          emailPersonal: StaffPersonalInformation?.email,
          phone: StaffPersonalInformation?.phone,
          staffImage: StaffPersonalInformation?.staffImage,
        })
      );

      setUser({
        token,
        StaffCode,
        Email,
        role,
        PositionCode,
        DepartmentCode,
        BranchCode,
        isPasswordSet,
        firstName: StaffPersonalInformation?.firstName,
        lastName: StaffPersonalInformation?.lastName,
        gender: StaffPersonalInformation?.gender,
        martialStatus: StaffPersonalInformation?.martialStatus,
        dateOfBirth: StaffPersonalInformation?.dateOfBirth,
        address: StaffPersonalInformation?.address,
        emailPersonal: StaffPersonalInformation?.email,
        phone: StaffPersonalInformation?.phone,
        staffImage: StaffPersonalInformation?.staffImage,
      });

      // **Always redirect to the common dashboard after login**
      router.push("/Dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      throw error.response?.data?.message || "Login failed";
    }
  };

  const handleRefreshButtonClick = () => {
    refreshTokenFn();
  };

  const handleCancelButtonClick = () => {
    setIsTokenExpiringWarningVisible(false);
  };

  const resetPassword = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/ResetPassword`, { email });
      return response.data;
    } catch (error) {
      console.error("Reset Password Error:", error);
      throw (
        error.response?.data?.message || "Failed to initiate password reset."
      );
    }
  };

  const initialPasswordSet = async (
    staffCode,
    defaultPassword,
    newPassword
  ) => {
    try {
      const response = await axios.post(`${API_URL}/InitialPasswordSet`, {
        staffCode,
        defaultPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Initial Password Set Error:", error);
      throw error.response?.data?.message || "Failed to set initial password.";
    }
  };

  const resetForgottenPassword = async (
    staffCode,
    temporaryPassword,
    newPassword
  ) => {
    try {
      const response = await axios.post(`${API_URL}/ResetForgottenPassword`, {
        staffCode,
        temporaryPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Reset Forgotten Password Error:", error);
      throw (
        error.response?.data?.message || "Failed to reset forgotten password."
      );
    }
  };

  // Exposed functions
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        refreshToken: refreshTokenFn,
        resetPassword,
        initialPasswordSet,
        resetForgottenPassword,
      }}
    >
      {isTokenExpiringWarningVisible && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#f9a825", // Yellow for warning
            color: "#000000",
            padding: "15px 20px",
            borderRadius: "5px",
            zIndex: 1000,
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <span>Your session is about to expire.</span>
          <button
            style={{
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "3px",
              cursor: "pointer",
            }}
            onClick={handleRefreshButtonClick}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            style={{
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "3px",
              cursor: "pointer",
            }}
            onClick={handleCancelButtonClick}
          >
            Cancel
          </button>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use authentication context
export const useAuth = () => useContext(AuthContext);

// Axios Interceptors
axios.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("accessToken");
    const publicRoutes = [
      "/Authentication/Login",
      "/Authentication/ResetPassword",
      "/Authentication/ResetForgottenPassword",
      "/Authentication/InitialPasswordSet",
    ];
    const isPublicRoute = publicRoutes.some((route) =>
      config.url.includes(route)
    );

    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
