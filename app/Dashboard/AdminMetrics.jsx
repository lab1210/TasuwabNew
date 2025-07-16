"use client";
import React, { useState, useEffect } from "react";
import { Users, Building, Briefcase, UserCog, Layers } from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import StatCard from "./StatCard";
import staffService from "@/Services/staffService";
import branchService from "@/Services/branchService";
import departmentService from "@/Services/departmentService";
import roleService from "@/Services/roleService";
import positionService from "@/Services/positionService";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const AdminMetrics = () => {
  const [staffs, setStaffs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [positions, setPositions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [staffData, branchData, deptData, roleData, positionData] =
          await Promise.all([
            staffService.getStaffs(),
            branchService.getAllBranches(),
            departmentService.getAllDepartments(),
            roleService.getAllRoles(),
            positionService.getAllPositions(),
          ]);

        setStaffs(staffData);
        setBranches(branchData);
        setDepartments(deptData);
        setRoles(roleData);
        setPositions(positionData);
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Create name-to-ID maps for branches and departments
  const branchNameToId = Object.fromEntries(
    branches.map((b) => [b.name, b.branch_id.toString()])
  );
  const deptNameToId = Object.fromEntries(
    departments.map((d) => [d.name, d.department_id.toString()])
  );

  // Enrich staff data with proper IDs
  const enrichedStaff = staffs.map((s) => {
    const branchID = branchNameToId[s.branchID] || null;
    const departmentID = deptNameToId[s.departmentID] || null;

    return {
      ...s,
      fullName: `${s.firstName} ${s.lastName}`,
      branchName: s.branchID || "Unknown",
      departmentName: s.departmentID || "Unknown",
      branchID,
      departmentID,
    };
  });

  // Apply filters
  const filteredStaff = enrichedStaff.filter((s) => {
    const branchMatch =
      selectedBranch === "All" || s.branchID === selectedBranch;
    const deptMatch = selectedDept === "All" || s.departmentID === selectedDept;
    return branchMatch && deptMatch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const chartStaff =
    selectedBranch === "All" && selectedDept === "All"
      ? enrichedStaff
      : filteredStaff;

  const stats = {
    staff: filteredStaff.length,
    branches: branches.length,
    departments: departments.length,
    roles: roles.length,
    positions: positions.length,
  };

  // Update your staffByDepartmentData configuration
  const staffByDepartmentData = {
    labels: departments.map((d) => d.name),
    datasets: [
      {
        label: "Staff by Department",
        data: departments.map(
          (d) =>
            chartStaff.filter(
              (s) => s.departmentID === d.department_id.toString()
            ).length
        ),
        backgroundColor: departments.map((_, index) => {
          // Base hue for green (~120°), spaced evenly
          const hue = (120 + (index * 360) / departments.length) % 360;
          return `hsl(${hue}, 70%, 60%)`; // Adjust saturation & lightness as needed
        }),
      },
    ],
  };

  const staffPerBranchData = {
    labels: branches.map((b) => b.name),
    datasets: [
      {
        label: "Staff Count",
        data: branches.map(
          (b) =>
            chartStaff.filter((s) => s.branchID === b.branch_id.toString())
              .length
        ),
        backgroundColor: "#3D873B",
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="relative w-14 h-14">
          <div className="absolute w-full h-full border-4 border-[#333] border-t-[#3D873B] rounded-full animate-spin"></div>

          <div className="absolute inset-0 flex items-center justify-center font-bold text-[#3D873B] text-xl">
            T
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards - Simplified without percentages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          title="Staff"
          value={stats.staff.toString()}
          color="blue"
        />
        <StatCard
          icon={Building}
          title="Branches"
          value={stats.branches.toString()}
          color="green"
        />
        <StatCard
          icon={Layers}
          title="Departments"
          value={stats.departments.toString()}
          color="purple"
        />
        <StatCard
          icon={UserCog}
          title="Roles"
          value={stats.roles.toString()}
          color="yellow"
        />
        <StatCard
          icon={Briefcase}
          title="Positions"
          value={stats.positions.toString()}
          color="red"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B]"
        >
          <option value="All">All Branches</option>
          {branches.map((b) => (
            <option key={b.branch_id} value={b.branch_id.toString()}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D873B]"
        >
          <option value="All">All Departments</option>
          {departments.map((d) => (
            <option key={d.department_id} value={d.department_id.toString()}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-md shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Staff By Department
          </h3>
          <div className="max-w-xs h-44 mx-auto">
            <Doughnut
              data={staffByDepartmentData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
        <div className="bg-white rounded-md shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Staff By Branch
          </h3>
          <div className="w-full h-44">
            <Bar
              data={staffPerBranchData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-md shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {selectedBranch !== "All" || selectedDept !== "All"
            ? "Filtered Staff"
            : "All Staff"}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-600 border-b text-center">
                <th className="py-2 px-2">S/N</th>
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Department</th>
                <th className="py-2 px-2">Branch</th>
                <th className="py-2 px-2">Role</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50 border-b">
                    <td className="py-2 px-2">
                      {i + 1 + (currentPage - 1) * itemsPerPage}
                    </td>
                    <td className="py-2 px-2">{s.fullName}</td>
                    <td className="py-2 px-2">{s.departmentName}</td>
                    <td className="py-2 px-2">{s.branchName}</td>
                    <td className="py-2 px-2">{s.roleID}</td>
                    <td className="py-3 px-4">
                      {s.isActive ? (
                        <p className="text-green-500 font-bold rounded-md bg-green-50 text-center p-1">
                          Active
                        </p>
                      ) : (
                        <p className="text-red-500 font-bold rounded-md bg-red-50 text-center p-1">
                          Inactive
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-3">
                    No staff found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredStaff.length > itemsPerPage && (
          <div className="flex justify-center mt-4">
            <nav className="flex items-center gap-1">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md border disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-md border ${
                      currentPage === number ? "bg-[#3D873B] text-white" : ""
                    }`}
                  >
                    {number}
                  </button>
                )
              )}

              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md border disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMetrics;
