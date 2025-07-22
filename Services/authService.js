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
import Cookies from "js-cookie";

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

// Modal Component
const SessionExpiryModal = ({
  onRefresh,
  onLogout,
  isRefreshing,
  timeLeft,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h3>Session About to Expire</h3>
        <p>
          Your session will expire in {Math.floor(timeLeft / 1000)} seconds.
          Would you like to continue?
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {isRefreshing ? "Refreshing..." : "Continue Session"}
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const userDetails = JSON.parse(localStorage.getItem("user"));

      if (token && userDetails) {
        if (!checkTokenExpiry(token)) {
          setUser({ token, ...userDetails });
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          Cookies.remove("refreshToken", { path: "/" });
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = useCallback(
    async (isExpired = false) => {
      try {
        if (!isExpired) {
          await axios.post(`${API_URL}/logout`);
        }

        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        Cookies.remove("refreshToken", { path: "/" });

        setUser(null);
        setShowSessionModal(false);
        router.push("/");
      } catch (error) {
        console.error("Logout API Error:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        Cookies.remove("refreshToken", { path: "/" });
        setUser(null);
        setShowSessionModal(false);
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
      setShowSessionModal(false);
      return newToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      throw error.response?.data?.message || "Token refresh failed";
    } finally {
      setIsRefreshing(false);
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
    const checkToken = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const decodedToken = decodeJwt(token);
      if (!decodedToken || !decodedToken.exp) return;

      const expiryTime = decodedToken.exp * 1000;
      const currentTime = Date.now();
      const remainingTime = expiryTime - currentTime;

      // Show modal when token is about to expire (last 60 seconds)
      if (remainingTime > 0 && remainingTime <= 60000) {
        setTimeLeft(remainingTime);
        setShowSessionModal(true);
      } else if (remainingTime <= 0) {
        logout(true);
      }
    };

    // Check immediately
    checkToken();

    // Then check every 5 seconds
    const interval = setInterval(checkToken, 5000);

    return () => clearInterval(interval);
  }, [logout]);

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

      router.push("/Dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      throw error.response?.data?.message || "Login failed";
    }
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
      {showSessionModal && (
        <SessionExpiryModal
          onRefresh={refreshTokenFn}
          onLogout={() => logout(false)}
          isRefreshing={isRefreshing}
          timeLeft={timeLeft}
        />
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

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
