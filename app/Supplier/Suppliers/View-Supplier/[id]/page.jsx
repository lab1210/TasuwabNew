"use client";
import Layout from "@/app/components/Layout";
import { getSupplierById } from "@/Services/supplierService";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CiCircleInfo } from "react-icons/ci";

const SupplierDetails = () => {
  const pathname = usePathname();
  const supplierId = pathname.split("/")[4];
  const [supplier, setSuppliers] = useState({});

  // Fetch data for the supplier
  const fetchSupplierData = async (id) => {
    try {
      const data = await getSupplierById(id);
      setSuppliers(data);
      console.log("Fetched supplier data:", data);
    } catch (error) {
      console.error("Failed to fetch supplier data", error);
    }
  };

  useEffect(() => {
    if (supplierId) {
      fetchSupplierData(supplierId);
    } else {
      console.error("No supplier ID found in the URL");
    }
  }, []);

  return (
    <Layout>
      <div className="w-full">
        <div className="mb-10">
          <p className="text-4xl font-extrabold mb-2">Supplier Details</p>
          <p className="text-sm text-gray-600">
            View detailed information about the supplier.
          </p>
        </div>
        <div className="flex flex-col gap-5 ">
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="flex items-center gap-2 text-lg font-bold">
              <span>
                <CiCircleInfo size={20} className="text-[#3D873B]" />
              </span>
              Basic Information
            </p>
            <ul className=" pl-6 mt-3 flex flex-col gap-y-3">
              <li className="flex items-center gap-10">
                {" "}
                <span className="text-gray-500 w-50 text-sm ">Name:</span>
                {supplier.name}
              </li>
              <li className="flex items-center gap-10">
                {" "}
                <span className="text-gray-500 w-50 text-sm">Email:</span>
                {supplier.email}
              </li>
              <li className="flex items-center gap-10">
                {" "}
                <span className="text-gray-500 w-50 text-sm">Contact:</span>
                {supplier.phone}
              </li>
              <li className="flex items-center gap-10">
                {" "}
                <span className="text-gray-500 w-50 text-sm">Location:</span>
                {supplier.address}
              </li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="flex items-center gap-2 text-lg font-bold">
              <span>
                <CiCircleInfo size={20} className="text-[#3D873B]" />
              </span>
              Bank Information
            </p>
            <ul className=" pl-6 mt-3 flex flex-col gap-y-3">
              <li className="flex items-center gap-10">
                {" "}
                <span className="text-gray-500 w-50 text-sm">Bank:</span>
                {supplier.bank}
              </li>
              <li className="flex items-center gap-10">
                {" "}
                <span className="text-gray-500 w-50 text-sm">
                  Account Number:
                </span>
                {supplier.accountNumber}
              </li>
              <li className="flex items-center gap-10">
                {" "}
                <span className="text-gray-500 w-50 text-sm">
                  Account Name:
                </span>
                {supplier.accountName}
              </li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="flex items-center gap-2 text-lg font-bold">
              <span>
                <CiCircleInfo size={20} className="text-[#3D873B]" />
              </span>
              Asset Information
            </p>
            {supplier.categories?.length > 0 ? (
              <ul className="pl-6 mt-3 flex flex-col gap-y-5">
                {supplier.categories.map((category, index) => (
                  <li key={index}>
                    <p className="font-semibold text-gray-700">
                      {category.name}
                    </p>
                    <ul className="pl-4 mt-1 list-disc text-sm text-gray-600">
                      {category.products.map((product, idx) => (
                        <li key={idx}>
                          {product.name} - ₦{product.price?.toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mt-3">
                No categories or products listed.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupplierDetails;
