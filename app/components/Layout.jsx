"use client";
import React, { useEffect, useRef, useState } from "react";
import SideBar from "./SideBar";
import Header from "./Header";
import { MdWarning } from "react-icons/md";
import Profile from "./Profile";
import { Toaster } from "react-hot-toast";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

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

  // 👉 Hover effect: open sidebar on left edge
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientX < 10 && !isSidebarOpen) {
        setIsSidebarOpen(true);
        localStorage.setItem("sidebarState", JSON.stringify(true));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isSidebarOpen]);

  // 👉 Auto-close when mouse leaves sidebar area
  const handleSidebarMouseLeave = () => {
    setIsSidebarOpen(false);
    localStorage.setItem("sidebarState", JSON.stringify(false));
  };

  const handleOpenProfileSidebar = () => {
    setIsProfileSidebarOpen(true);
  };

  const handleCloseProfileSidebar = () => {
    setIsProfileSidebarOpen(false);
  };

  if (isSmallScreen) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <MdWarning className="text-red-600 text-6xl mb-4" />
        <p className="text-lg font-bold text-[#1E1E2F]">
          Access is not available on small screens.
        </p>
        <p className="text-md text-gray-600">
          Please use a larger screen to continue.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`w-screen h-screen ${
        isSidebarOpen ? "grid grid-cols-[280px_1fr]" : "block"
      } overflow-hidden`}
    >
      {isSidebarOpen && (
        <div ref={sidebarRef} onMouseLeave={handleSidebarMouseLeave}>
          <SideBar />
        </div>
      )}
      <div className="h-screen w-full grid grid-rows-[80px_1fr]">
        <Header
          onToggleSidebar={() => {}}
          isSidebarOpen={isSidebarOpen}
          onOpenProfile={handleOpenProfileSidebar}
        />
        <Toaster />
        <div className="p-8 py-4 w-full h-full overflow-y-scroll custom-scrollbar">
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
