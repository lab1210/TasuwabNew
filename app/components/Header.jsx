"use client";
import { useAuth } from "@/Services/authService";
import roleService from "@/Services/roleService";
import React, { useEffect, useState } from "react";
import Breadcrumbs from "./Breadcrumbs";
import Link from "next/link";
import { LuCircleUser } from "react-icons/lu";
import { RxActivityLog } from "react-icons/rx";
import { IoIosNotificationsOutline } from "react-icons/io";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";

const Header = ({ isSidebarOpen, onToggleSidebar, onOpenProfile }) => {
  const { user } = useAuth();
  const [roleName, setRoleName] = useState(null);
  const userNameCaps = user?.firstName?.toUpperCase() || "";

  useEffect(() => {
    const fetchRoleName = async () => {
      if (user?.role) {
        try {
          const role = await roleService.getRoleById(user.role);
          setRoleName(role?.name || null);
        } catch (error) {
          console.error("Failed to fetch role name:", error);
        }
      }
    };

    fetchRoleName();
  }, [user?.role]);

  return (
    <div className="flex items-center justify-between pl-3 pr-3 bg-[#fdfefd] w-full shadow-md sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="lg:mr-0 mr-5 cursor-pointer" onClick={onToggleSidebar}>
          {isSidebarOpen ? (
            <GoSidebarExpand size={20} />
          ) : (
            <GoSidebarCollapse size={20} />
          )}
        </div>
        <div className="hidden lg:block">
          <Breadcrumbs />
        </div>
      </div>
      <div className="flex w-full lg:w-fit justify-between items-center gap-10">
        <div>
          Welcome,<span className="text-[#3D873B] ml-1">{userNameCaps}</span>
        </div>
        <div className="flex justify-between items-center gap-5">
          <div onClick={onOpenProfile} className="cursor-pointer">
            <LuCircleUser size={24} />
          </div>
          <Link href={`/Activity-Log`}>
            <RxActivityLog size={24} />
          </Link>
          <Link href={`/Notifications`}>
            <IoIosNotificationsOutline size={24} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
