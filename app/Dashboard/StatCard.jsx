"use client";
import React from "react";

const StatCard = ({ icon: Icon, title, value, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-[#3D873B]",
    green: "bg-green-600",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-600",
  };

  return (
    <div className="bg-white   rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl text-left font-bold text-gray-900 mt-2">
            {value}
          </p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-full`}>
          <Icon className="text-white text-lg" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
