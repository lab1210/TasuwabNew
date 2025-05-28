"use client";
import React, { useState } from "react";

const EquitySettings = () => {
  const [equity, setEquity] = useState("");
  const [isEditing, setIsEditing] = useState(true);

  const handleSetEquity = (e) => {
    e.preventDefault();
    setIsEditing(!isEditing); // toggle between edit and view mode
  };

  return (
    <form onSubmit={handleSetEquity} className="p-6 mt-6">
      <div className="mb-8 flex-col flex gap-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Minimum Equity Contribution (%)
        </label>
        <input
          type="number"
          min={1}
          readOnly={!isEditing}
          value={equity}
          required
          onChange={(e) => setEquity(e.target.value)}
          placeholder="Enter minimum equity contribution in %"
          className={`w-full px-4 py-2 border rounded focus:outline-none  ${
            isEditing ? " focus:border-green-600" : "bg-gray-100"
          }`}
        />
      </div>
      <div className="flex justify-end">
        <button className="bg-[#3D873B] text-white p-2 px-10 font-bold rounded-md hover:opacity-90 cursor-pointer">
          {isEditing ? "Set" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default EquitySettings;
