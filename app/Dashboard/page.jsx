"use client";
import Layout from "@/app/components/Layout";
import React from "react";
import { FaUser } from "react-icons/fa";
import { GiPayMoney } from "react-icons/gi";
const AdminDashboard = () => {
  return (
    <Layout>
      <div className="grid grid-cols-3">
        <div className="shadow-md p-3">
          <div className="flex gap-2 items-center">
            <div className="bg-[#ebf6eb] rounded-full w-8 h-8 p-2 ">
              <GiPayMoney className="w-full h-full" />
            </div>
            <p className="text-lg">Number of Loans</p>
          </div>
          <p className="text-6xl font-extrabold text-[#3D873B] mt-3 pl-10">
            200
          </p>
        </div>
        <div className="shadow-md p-3">
          <div className="flex gap-2 items-center">
            <div className="bg-[#ebf6eb] rounded-full w-8 h-8 p-2 ">
              <FaUser className="w-full h-full" />
            </div>
            <p className="text-lg">Number of Clients</p>
          </div>

          <p className="text-6xl font-extrabold text-[#3D873B] mt-3 pl-10">
            30
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
