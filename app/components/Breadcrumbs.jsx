import { usePathname } from "next/navigation";
import React from "react";
import useLoanStore from "./loanStore";

const menuStructure = {
  Home: {
    "/Dashboard": " View Dashboard",
  },
  "Branch Management": {
    "/Admin/Branch": " View Branch List",
  },
  "Role Management": {
    "/Admin/Role": " View Roles",
  },
  "Position Management": {
    "/Admin/Positions": " View Positions",
  },
  "Department Management": {
    "/Admin/Department": " View Departments",
  },
  "Staff Management": {
    "/Admin/Staff": " View Staff",
  },
  "Client Management": {
    "/Clients": " View Clients",
    "/Clients/AddClient": "Create Client",
    "/Clients/EditClient": "Edit Client", // Base path
  },
  Settings: {
    "/Settings/Configuration": "Configure Settings",
  },
  "Account Management": {
    "/Account": "View Account List",
    "/Account/AddAccount": "Create Account",
    "/Account/EditAccount": "Edit Account",
  },
  "Transaction ": {
    "/Account/Transaction": "View Transactions",
    "/Account/Transaction/AddTransaction": "Create Transactions",
  },
  "Asset Financing": {
    "/Loan": "Loan Requests",
    "/Loan/Request-Form": "Request Form",
    "/Loan/Accounts": "Loan Accounts",
    "/Loan/Accounts/TopUp": "Top Up History",
    "/Loan/Accounts/Transactions": "Loan Transactions",
    "/Loan/Update-Request-Form": "Update Request Form",
  },
  Approval: {
    "/Approval": "Approvals",
    "/Approval/Configuration": "Approval Configuration",
    "/Approved/Loan-Transactions": "Loan Transactions",
  },
  Active: {
    "/Active": "View Active Loans",
  },
  Pending: {
    "/Pending/Loans": "Pending Request Forms",
    "/Pending/Loan-Transactions": "Loan Transactions",
  },
  Enquiries: {
    "/Enquiries/Statement-of-account": "Statement of Account",
    "/Enquiries/loan": "Loan Enquiry",
    "/Enquiries/Deposit": "Deposit Enquiry",
    "/Enquiries/Loan-Interest-Income": "Loan Interest Income ",
  },
  "Approval Route": {
    "/Approver": "Pricing Model Approval",
    "/Approver/Supplier-Payments": "Supplier Payments Approval",
  },
  Suppliers: {
    "/Supplier/Suppliers": "View Suppliers",
    "/Supplier/Suppliers/Add-Supplier": "Add Supplier",
    "/Supplier/Suppliers/Edit-Supplier": "Edit Supplier",
    "/Supplier/Suppliers/View-Supplier": "Supplier Details",
    "/Supplier/Categories": "Manage Categories",
    "/Supplier/Transactions": "View Transactions",
    "/Supplier/Transactions/Pay-Supplier": "Pay Supplier",
    "/Supplier/Transactions/Completed-Payments": "Completed Supplier Payments",
    "/Supplier/Transactions/Pending-Payments": "Pending Supplier Payments",
  },
  Announcements: {
    "/Announcement": "Manage Announcements",
  },
  Notification: {
    "/Notifications": "View Notifications",
  },
};

const Breadcrumbs = () => {
  const pathName = usePathname();
  const currentPath = decodeURIComponent(pathName);
  let breadcrumbMenu = null;
  let breadcrumbSubmenu = null;

  Object.entries(menuStructure).forEach(([menu, submenus]) => {
    Object.entries(submenus).forEach(([submenuPath, submenuName]) => {
      // Exact match
      if (submenuPath === currentPath) {
        breadcrumbMenu = menu;
        breadcrumbSubmenu = submenuName;
      }
      // Check if the current path *starts with* the submenu path
      else if (currentPath.startsWith(submenuPath)) {
        breadcrumbMenu = menu;
        breadcrumbSubmenu = submenuName;
      }
    });
  });

  return (
    <nav>
      <ul className="flex gap-1.5">
        {breadcrumbMenu && (
          <>
            <li className="flex gap-2">
              <span>{breadcrumbMenu}</span>
              <span>/</span>
            </li>
            <li>
              <span className="text-[#3D873B]">{breadcrumbSubmenu}</span>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
