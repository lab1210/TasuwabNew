"use client";
import React, { useEffect, useState } from "react";
import SideBar from "./SideBar";
import Header from "./Header";
import { MdWarning } from "react-icons/md";
import Profile from "./Profile";
import { Toaster } from "react-hot-toast";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarState");
    if (savedState !== null) {
      setIsSidebarOpen(JSON.parse(savedState));
    }
  }, []);
  const handleOpenProfileSidebar = () => {
    setIsProfileSidebarOpen(true);
  };

  const handleCloseProfileSidebar = () => {
    setIsProfileSidebarOpen(false);
  };

  if (isSmallScreen) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          textAlign: "center",
          paddingLeft: "4px",
          paddingRight: "4px",
        }}
      >
        <MdWarning
          style={{ color: "red", fontSize: "3.75rem", marginBottom: "4px" }}
        />
        <p
          style={{
            fontSize: "1.125rem",
            fontWeight: "bold",
            color: "oklch(0.577 0.245 27.325)",
          }}
        >
          Access is not available on small screens.
        </p>
        <p className="text-md text-gray-600">
          Please use a larger screen to continue.
        </p>
      </div>
    );
  }
  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      localStorage.setItem("sidebarState", JSON.stringify(!prev));
      return !prev;
    });
  };
  return (
    <div
      className={`w-screen h-screen ${
        isSidebarOpen ? "grid grid-cols-[280px_1fr]" : "block"
      } overflow-hidden`}
    >
      {isSidebarOpen && <SideBar />}
      <div className="h-screen w-full grid grid-rows-[80px_1fr]">
        <Header
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
          onOpenProfile={handleOpenProfileSidebar}
        />
        <Toaster />
        <div className="p-8 w-full h-full  overflow-y-scroll custom-scrollbar">
          {children}
        </div>
      </div>
      {isProfileSidebarOpen && (
        <Profile
          onClose={handleCloseProfileSidebar}
          isProfileSidebarOpen={isProfileSidebarOpen}
        />
      )}
    </div>
  );
};

export default Layout;
