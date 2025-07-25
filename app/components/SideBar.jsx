"use client";
import { useAuth } from "@/Services/authService";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MdAccountBalance } from "react-icons/md";
import { LuLayoutDashboard } from "react-icons/lu";
import { GrTransaction } from "react-icons/gr";
import {
  FaBoxOpen,
  FaBriefcase,
  FaBuilding,
  FaChevronDown,
  FaChevronUp,
  FaCog,
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
import { IoMdMegaphone } from "react-icons/io";
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
          key: "accountmanagement",
          label: "Accounts ",
          icon: <MdAccountBalance />,
          subItems: [
            {
              label: "View Customer List",
              href: "/Clients",
              privilege: "ViewClients",
            },
            {
              label: "View Account List",
              href: "/Account",
              privilege: "ViewAccounts",
            },
          ],
          privilege: "ViewAccounts" || "ViewClients",
        },
        {
          key: "transactionManagement",
          label: "Transactions ",
          icon: <GrTransaction />,
          subItems: [
            {
              label: "View transactions",
              href: "/Account/Transaction",
              privilege: "ViewAccounts",
            },
          ],
          privilege: "ViewAccounts",
        },
        {
          key: "supplierManagement",
          label: "Suppliers ",
          icon: <FaBoxOpen />,
          subItems: [
            {
              label: "Manage Categories",
              href: "/Supplier/Categories",
              privilege: "ViewSuppliers",
            },

            {
              label: "View Supplier List",
              href: "/Supplier/Suppliers",

              privilege: "ViewSuppliers",
            },
            {
              label: " Supplier Transactions",
              href: "/Supplier/Transactions",

              privilege: "ViewSupplierReports",
            },
          ],
          privilege: "ViewSuppliers" || "ViewSupplierReports",
        },

        {
          key: "loanManagement",
          label: "Asset Financing",
          icon: <FaMoneyBill />,
          subItems: [
            {
              label: "View Loan Requests",
              href: "/Loan",
              privilege: "ViewLoanAccounts",
            },
            {
              label: "View Loan Accounts ",
              href: "/Loan/Accounts",
              privilege: "ViewLoanAccounts",
            },
            {
              label: "View Top up History ",
              href: "/Loan/Accounts/TopUp",
              privilege: "ViewLoanAccounts" || "ProcessLoanTopUps",
            },
            {
              label: "View Loan Transactions ",
              href: "/Loan/Accounts/Transactions",
              privilege: "ViewLoanTransactions",
            },

            {
              label: "Approved Applications",
              href: "/Approved/Loans",
              privilege: "SelectApprovedLoans",
            },

            {
              label: "Pending Applications",
              href: "/Pending/Loans",
              privilege: "SelectApprovedLoans",
            },
            {
              label: "Active Loans",
              href: "/Active",
              privilege: "SelectApprovedLoans",
            },
          ],
          privilege:
            "ManageLoanTransactions" ||
            "ViewLoanAccounts" ||
            "ProcessLoanTopUps",
        },
        {
          key: "enquiries",
          label: "Enquiries",
          icon: <FaQuestionCircle />,
          subItems: [
            {
              label: "Client Statement of Account",
              href: "/Enquiries/Statement-of-account",
              privilege: "ViewAccountReports",
            },
            {
              label: "Client Loan Enquiry",
              href: "/Enquiries/loan",
              privilege: "ViewLoanTransactions",
            },
            {
              label: "Supplier Payment History",
              href: "/Enquiries/SupplierPaymentHistory",
              privilege: "ViewSupplierReports",
            },

            {
              label: "Client Deposit Enquiry",
              href: "/Enquiries/Deposit",
              privilege: "ViewEnquiry",
            },
            {
              label: "Loan Profit Income Enquiry",
              href: "/Enquiries/Loan-Interest-Income",
              privilege: "ViewEnquiry",
            },
            {
              label: "Deposit Interest Expense Enquiry",
              href: "/Enquiries/Deposit-Interest-Expense",
              privilege: "ViewEnquiry",
            },
          ],
          privilege:
            "ViewAccountReports" ||
            "ViewLoanTransactions" ||
            "ViewSupplierReports",
        },

        {
          key: "approvalworkflow",
          label: "Approval",
          icon: <FaRegCheckCircle />,
          subItems: [
            {
              label: "Approval Configuration",
              href: "/Approval/Configuration/View",
              privilege: "ManageApprovalWorkflows",
            },
            {
              label: "Approval Requests",
              href: "/Approval",
              privilege: "ViewApprovals",
            },
            // {
            //   label: "Approve Loan Applications",
            //   href: "/Approver",
            //   privilege: "ApproveLoanApplication",
            // },
            // {
            //   label: "Approve Supplier Payments",
            //   href: "/Approver/Supplier-Payments",
            //   privilege: "ApproveSupplierPayment",
            // },
          ],
          privilege:
            "ViewApprovals" ||
            "ProcessApprovals" ||
            "ViewApprovalReports" ||
            "ManageApprovalWorkflows",
        },
        {
          key: "settings",
          label: "Settings",
          icon: <FaCog />,
          subItems: [
            {
              label: "System Configuration",
              href: "/Settings/Configuration",
              privilege: "ManageFinanceCodes",
            },
          ],
          privilege: "ManageFinanceCodes",
        },
        {
          key: "Announce",
          label: "Announcements",
          icon: <IoMdMegaphone />,
          subItems: [
            {
              label: "Manage Announcements",
              href: "/Announcement",
              privilege: "ManageCompanyAnnouncement",
            },
          ],
          privilege: "ManageCompanyAnnouncement",
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
    <div className="bg-[#eaf4ea] shadow-md flex flex-col w-full h-screen">
      {authLoading || loadingPrivileges ? (
        <div>
          <HashLoader color="#333" size={60} />
        </div>
      ) : (
        <>
          <div className="bg-[#eaf4ea] w-full h-20 object-contain pl-2 pt-2 sticky top-0 z-[1000]">
            <img className="w-45 h-full" src="/logo.png" alt="" />
          </div>
          <ul className="pt-5 pl-2 pr-2 w-full h-full overflow-y-auto max-h-screen flex justify-between  custom-scrollbar flex-col">
            {menuItems.map((item) => (
              <li className="pb-1 w-full h-full cursor-pointer" key={item.key}>
                <span
                  className="p-2.5  rounded-md flex items-center gap-8 w-full  justify-between hover:text-white hover:bg-[#3D873B]"
                  onClick={() => toggleMenu(item.key)}
                >
                  {item.icon}
                  {item.label}
                  {openMenus[item.key] ? <FaChevronUp /> : <FaChevronDown />}
                </span>
                {openMenus[item.key] && item.subItems && (
                  <ul className="pt-5 text-center">
                    {item.subItems.map((subItem) => (
                      <Link href={subItem.href} key={subItem.label}>
                        <li
                          className="hover:text-[#3D873B] mb-4 text-xs border border-gray-400 rounded-lg p-2 "
                          key={subItem.label}
                        >
                          {subItem.label}
                          <p className="text-xs font-bold text-red-500">
                            {subItem.comment}
                          </p>
                        </li>
                      </Link>
                    ))}
                  </ul>
                )}
              </li>
            ))}

            <li
              className="pb-5 w-full h-full cursor-pointer "
              onClick={handleLogout}
            >
              <span className="p-2.5  rounded-md flex items-center gap-8 w-full  justify-between hover:text-white hover:bg-red-500 text-red-500">
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
