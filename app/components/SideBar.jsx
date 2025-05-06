"use client";
import { useAuth } from "@/Services/authService";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { MdAccountBalance, MdOutlinePending } from "react-icons/md";
import { LuLayoutDashboard } from "react-icons/lu";
import { GrTransaction } from "react-icons/gr";
import {
  FaBriefcase,
  FaBuilding,
  FaCalculator,
  FaChartBar,
  FaChevronDown,
  FaChevronUp,
  FaCog,
  FaHistory,
  FaMoneyBill,
  FaQuestionCircle,
  FaRegCheckCircle,
  FaSignOutAlt,
  FaSitemap,
  FaUsers,
  FaUserTag,
} from "react-icons/fa";
import { HashLoader } from "react-spinners";
import roleService from "@/Services/roleService";
import Link from "next/link";
const SideBar = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [openMenus, setOpenMenus] = useState({});
  const [rolePrivileges, setRolePrivileges] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(false); // Initialize to false

  const handleLogout = () => {
    logout();
    router.push("/");
  };
  useEffect(() => {
    const fetchPrivileges = async () => {
      if (user?.role) {
        setLoadingPrivileges(true);
        try {
          const role = await roleService.getRoleById(user.role);
          setRolePrivileges(role?.privileges?.map((p) => p.name) || []);
        } catch (error) {
          console.error("Error fetching role by ID:", error);
          setRolePrivileges([]);
        } finally {
          setLoadingPrivileges(false);
        }
      } else {
        setRolePrivileges([]);
        setLoadingPrivileges(false);
      }
    };

    fetchPrivileges();
  }, [user?.role]);

  useEffect(() => {
    if (!loadingPrivileges && rolePrivileges.length > 0) {
      const allMenuItems = [
        {
          key: "home",
          label: "Home ",
          icon: <LuLayoutDashboard />,
          subItems: [
            {
              label: "Dashboard",
              href: "/Dashboard",
            },
          ],
        },
        {
          key: "branchManagement",
          label: "Branch ",
          icon: <FaBuilding />,
          subItems: [
            {
              label: "View Branch List",
              href: "/Admin/Branch",
              privilege: "ViewBranch",
            },
          ],
          privilege: "ViewBranch",
        },
        {
          key: "roleManagement",
          label: "Role ",
          icon: <FaUserTag />,
          subItems: [
            {
              label: "View Roles",
              href: "/Admin/Role",
              privilege: "ViewRoles",
            },
          ],
          privilege: "ViewRoles",
        },
        {
          key: "positionManagement",
          label: "Position ",
          icon: <FaBriefcase />,
          subItems: [
            {
              label: "View Positions",
              href: "/Admin/Positions",
              privilege: "ViewPositions",
            },
          ],
          privilege: "ViewPositions",
        },
        {
          key: "departmentManagement",
          label: "Department ",
          icon: <FaSitemap />,
          subItems: [
            {
              label: "View Departments",
              href: "/Admin/Department",
              privilege: "ViewDepartments",
            },
          ],
          privilege: "ViewDepartments",
        },
        {
          key: "staffManagement",
          label: "Staff ",
          icon: <FaUsers />,
          subItems: [
            {
              label: "View Staff List",
              href: "/Admin/Staff",
              privilege: "ViewStaffs",
            },
          ],
          privilege: "ViewStaffs",
        },

        {
          key: "clientManagement",
          label: "Client ",
          icon: <FaUsers />,
          subItems: [
            {
              label: "View Client List",
              href: "/Clients",
              privilege: "ViewClients",
            },
          ],
          privilege: "ViewClients",
        },
        {
          key: "accountmanagement",
          label: "Account ",
          icon: <MdAccountBalance />,
          subItems: [
            {
              label: "View Account List",
              href: "/Account",
              privilege: "ViewAccount",
            },
          ],
          privilege: "ViewAccount",
        },

        {
          key: "transactionManagement",
          label: "Transaction ",
          icon: <GrTransaction />,
          subItems: [
            {
              label: "View transactions",
              href: "/Account/Transaction",
              privilege: "ViewAccount",
            },
          ],
          privilege: "ViewAccount",
        },

        {
          key: "loanManagement",
          label: "Loan Management",
          icon: <FaMoneyBill />,
          subItems: [
            {
              label: "View Loan Applications",
              href: "/Loan",
              privilege: "ViewLoanApplications",
            },
            {
              label: "Approved Loan Applications",
              href: "/Approved/Loans",
              privilege: "SelectApprovedLoans",
            },

            {
              label: "Approved Loan Transactions",
              href: "/Approved/Loan-Transactions",
              privilege: "ViewApprovedTransactions",
            },
            {
              label: "Pending Loan Applications",
              href: "/Pending/Loans",
              privilege: "SelectApprovedLoans",
            },

            {
              label: "Pending Loan Transactions",
              href: "/Pending/Loan-Transactions",
              privilege: "ViewApprovedTransactions",
            },
          ],
          privilege: "ViewLoanApplications",
        },

        {
          key: "enquiries",
          label: "Enquiries",
          icon: <FaQuestionCircle />,
          subItems: [
            {
              label: "Client Statement of Account",
              href: "/Enquiries/Statement-of-account",
              privilege: "ViewEnquiry",
            },
            {
              label: "Client Loan Enquiry",
              href: "/Enquiries/loan",
              privilege: "ViewEnquiry",
            },
            {
              label: "Client Deposit Enquiry",
              href: "/Enquiries/Deposit",
              privilege: "ViewEnquiry",
            },
            {
              label: "Loan Interest Income Enquiry",
              href: "/Enquiries/Loan-Interest-Income",
              privilege: "ViewEnquiry",
            },
            {
              label: "Deposit Interest Expense Enquiry",
              href: "/Enquiries/Deposit-Interest-Expense",
              privilege: "ViewEnquiry",
            },
          ],
          privilege: "ViewEnquiry",
        },

        {
          key: "calculator",
          label: "Pricing and calculators",
          icon: <FaCalculator />,
          subItems: [
            {
              label: "Pricing Model Calculator",
              href: "/Pricing",
              comment: "Coming soon",
            },
          ],
        },
        {
          key: "approvalworkflow",
          label: "Approval Workflow",
          icon: <FaRegCheckCircle />,
          subItems: [
            {
              label: "Loan Application Approver Assignment",
              href: "/Approver/Loan-Application",
              privilege: "AssignApprovalRights",
            },
            {
              label: "Loan Transaction Approver Assignment",
              href: "/Approver/Loan-Transaction",
              privilege: "AssignApprovalRights",
            },
          ],
          privilege: "AssignApprovalRights",
        },
        {
          key: "settings",
          label: "Settings",
          icon: <FaCog />,
          subItems: [
            {
              label: "System Configuration",
              href: "/Settings/Configuration",
              privilege: "SystemConfiguration",
            },
          ],
          privilege: "SystemConfiguration",
        },
      ];

      const filteredMenuItems = allMenuItems.filter((item) => {
        if (item.privilege && !rolePrivileges.includes(item.privilege)) {
          return false;
        }
        if (item.subItems) {
          item.subItems = item.subItems.filter(
            (subItem) =>
              !subItem.privilege || rolePrivileges.includes(subItem.privilege)
          );
          return item.subItems.length > 0;
        }
        return true;
      });
      setMenuItems(filteredMenuItems);
    } else {
      setMenuItems([]);
    }
  }, [loadingPrivileges, rolePrivileges]);

  const toggleMenu = (menu) => {
    setOpenMenus((prevState) => ({
      ...prevState,
      [menu]: !prevState[menu],
    }));
  };

  return (
    <div className="bg-[#fdfefd] shadow-md flex flex-col overflow-y-scroll custom-scrollbar w-full">
      {authLoading || loadingPrivileges ? (
        <div>
          <HashLoader color="#333" size={60} />
        </div>
      ) : (
        <>
          <div className="w-45 h-20 object-contain pl-2 pt-2 sticky top-0 bg-[#fdfefd] z-10">
            <img className="w-full h-full" src="/logo.png" alt="" />
          </div>
          <ul className="p-5 pl-2 pr-2 w-full h-full flex justify-between flex-col">
            {menuItems.map((item) => (
              <li className="pb-5 w-full h-full cursor-pointer" key={item.key}>
                <span
                  className="p-3  rounded-md flex items-center gap-8 w-full  justify-between hover:text-white hover:bg-[#3D873B]"
                  onClick={() => toggleMenu(item.key)}
                >
                  {item.icon}
                  {item.label}
                  {openMenus[item.key] ? <FaChevronUp /> : <FaChevronDown />}
                </span>
                {openMenus[item.key] && item.subItems && (
                  <ul className="pt-5 text-center">
                    {item.subItems.map((subItem) => (
                      <li
                        className="hover:text-[#3D873B] mb-4 text-sm"
                        key={subItem.label}
                      >
                        <Link href={subItem.href}>{subItem.label}</Link>
                        <p className="text-xs font-bold text-red-500">
                          {subItem.comment}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}

            <li
              className="pb-5 w-full h-full cursor-pointer "
              onClick={handleLogout}
            >
              <span className="p-3  rounded-md flex items-center gap-8 w-full  justify-between hover:text-white hover:bg-red-500 text-red-500">
                <FaSignOutAlt />
                Logout
                <div></div>
              </span>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default SideBar;
