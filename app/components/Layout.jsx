"use client";
import React, { useEffect, useRef, useState } from "react";
import SideBar from "./SideBar";
import Header from "./Header";
import { MdWarning, MdTask } from "react-icons/md";
import Profile from "./Profile";
import { Toaster, toast } from "react-hot-toast";
import announcementService from "@/Services/announcementService";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [shownAnnouncements, setShownAnnouncements] = useState(new Set());

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 520);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarState");
    if (savedState !== null) {
      setIsSidebarOpen(JSON.parse(savedState));
    }
  }, []);

  // Sidebar hover effect
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

  // Auto-close sidebar
  const handleSidebarMouseLeave = () => {
    setIsSidebarOpen(false);
    localStorage.setItem("sidebarState", JSON.stringify(false));
  };

  // Profile sidebar handlers
  const handleOpenProfileSidebar = () => {
    setIsProfileSidebarOpen(true);
  };

  const handleCloseProfileSidebar = () => {
    setIsProfileSidebarOpen(false);
  };

  // Check for task reminders
  const checkTaskReminders = async () => {
    try {
      const response = await announcementService.getAnnouncements();
      const announcements = Array.isArray(response) ? response : [];

      announcements.forEach((announcement) => {
        if (!announcement.expirationDate) return;

        const deadline = new Date(announcement.expirationDate);
        const now = new Date();
        const hoursRemaining = (deadline - now) / (1000 * 60 * 60);

        if (
          hoursRemaining > 0 &&
          hoursRemaining <= 24 &&
          !shownAnnouncements.has(announcement.id)
        ) {
          toast.custom(
            (t) => (
              <div
                className={`${t.visible ? "animate-enter" : "animate-leave"}
              max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <MdTask className="h-6 w-6 text-[#3D873B]" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-[#333]">
                        Task Reminder
                      </p>
                      <p className="mt-1 text-sm text-[#333]">
                        {announcement.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Due:{" "}
                        {new Date(announcement.expirationDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[#3D873B] hover:text-[#2d6b2a] focus:outline-none"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ),
            {
              duration: 10000,
              position: "bottom-right",
            }
          );

          setShownAnnouncements((prev) => new Set(prev).add(announcement.id));
        }
      });
    } catch (err) {
      console.error("Failed to check task reminders", err);
    }
  };

  // Set up interval for checking reminders
  useEffect(() => {
    checkTaskReminders();
    const interval = setInterval(checkTaskReminders, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [shownAnnouncements]);

  // Small screen warning
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
      <div className="h-screen w-full grid grid-rows-[60px_1fr]">
        <Header
          onToggleSidebar={() => {}}
          isSidebarOpen={isSidebarOpen}
          onOpenProfile={handleOpenProfileSidebar}
        />
        <div className="md:p-3 md:py-5 p-2 py-4 w-full h-full overflow-y-scroll custom-scrollbar">
          {children}
        </div>
      </div>
      {isProfileSidebarOpen && (
        <Profile
          onClose={handleCloseProfileSidebar}
          isProfileSidebarOpen={isProfileSidebarOpen}
        />
      )}
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;
