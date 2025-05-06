import { usePathname } from "next/navigation";
import React from "react";

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
  },
  "Transaction Management": {
    "/Account/Transaction": "View Transactions",
  },
  "Loan Management": {
    "/Loan": "View Loans",
  },
  Approved: {
    "/Approved/Loans": "Loans",
    "/Approved/Loan-Transactions": "Loan Transactions",
  },
  Pending: {
    "/Pending/Loans": "Loans",
    "/Pending/Loan-Transactions": "Loan Transactions",
  },
  Enquiries: {
    "/Enquiries/Statement-of-account": "Statement of Account",
    "/Enquiries/loan": "Loan Enquiry",
    "/Enquiries/Deposit": "Deposit Enquiry",
    "/Enquiries/Loan-Interest-Income": "Loan Interest Income ",
  },
  "Approval Route": {
    "/Approver/Loan-Application": "Loan Application",
    "/Approver/Loan-Transaction": "Loan Transactions",
  },
};

const Breadcrumbs = () => {
  const pathName = usePathname();
  const currentPath = decodeURIComponent(pathName);
  let breadcrumbMenu = null;
  let breadcrumbSubmenu = null;

  console.log("Current Path:", currentPath);

  Object.entries(menuStructure).forEach(([menu, submenus]) => {
    console.log(`Checking Menu: ${menu}`);
    Object.entries(submenus).forEach(([submenuPath, submenuName]) => {
      console.log(
        `  Checking Submenu Path: ${submenuPath}, Name: ${submenuName}`
      );

      // Exact match
      if (submenuPath === currentPath) {
        breadcrumbMenu = menu;
        breadcrumbSubmenu = submenuName;
        console.log(
          "    Exact Match! Menu:",
          breadcrumbMenu,
          "Submenu:",
          breadcrumbSubmenu
        );
      }
      // Check if the current path *starts with* the submenu path
      else if (currentPath.startsWith(submenuPath)) {
        breadcrumbMenu = menu;
        breadcrumbSubmenu = submenuName;
        console.log(
          "    Starts With! Menu:",
          breadcrumbMenu,
          "Submenu:",
          breadcrumbSubmenu
        );
      }
    });
  });

  console.log("breadcrumbMenu:", breadcrumbMenu);
  console.log("breadcrumbSubmenu:", breadcrumbSubmenu);

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
