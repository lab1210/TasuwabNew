"use client";
import React from "react";

const StatCard = ({
  icon: Icon,
  title,
  value,
  change,
  changeType,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "bg-[#3D873B]",
    green: "bg-green-600",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p
              className={`text-sm mt-2 ${
                changeType === "positive" ? "text-green-600" : "text-red-600"
              }`}
            >
              {changeType === "positive" ? "↗" : "↘"} {change} from last period
            </p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-4 rounded-full`}>
          <Icon className="text-white text-xl" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
