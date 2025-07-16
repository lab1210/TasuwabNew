"use client";
import React from "react";

const Table = ({ headers, rows }) => {
  return (
    <div className="mt-6">
      <table className="w-full table-auto divide-y divide-gray-200 shadow-lg rounded-md">
        <thead className="bg-gray-50 text-center text-gray-500 text-sm">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className=" py-3 px-4">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[0.77rem] text-center text-gray-700">
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {Object.values(row).map((cell, i) => (
                  <td key={i} className="py-3 px-4">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="px-4 py-2 text-gray-500 text-center"
              >
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
