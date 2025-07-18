"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import categoryService from "@/Services/categoryService";
import productService from "@/Services/productService";
import Layout from "@/app/components/Layout";
import toast from "react-hot-toast";
import supplierService from "@/Services/supplierService";

const SupplierDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch supplier details
        const supplierRes = await supplierService.getSupplierbyId(id);
        setSupplier(supplierRes);

        // Fetch categories and products in parallel
        const [categoriesRes, productsRes] = await Promise.all([
          categoryService.getCategories(),
          productService.getAllProducts(),
        ]);
        setCategories(categoriesRes);
        setProducts(productsRes);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load supplier details");
        toast.error("Failed to load supplier details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || productId;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3D873B]"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.push("/Supplier/Suppliers")}
            className="mt-4 px-4 py-2 bg-[#3D873B] text-white rounded-md hover:bg-[#2d6e2b]"
          >
            Back to Suppliers
          </button>
        </div>
      </Layout>
    );
  }

  if (!supplier) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p>Supplier not found</p>
          <button
            onClick={() => router.push("/Supplier/Suppliers")}
            className="mt-4 px-4 py-2 bg-[#3D873B] text-white rounded-md hover:bg-[#2d6e2b]"
          >
            Back to Suppliers
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full p-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/Supplier/Suppliers")}
            className="flex items-center gap-1 text-[#3D873B] hover:text-[#2d6e2b]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Suppliers</span>
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-6">Supplier Details</h1>

        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-gray-900">{supplier.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{supplier.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-gray-900">{supplier.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-gray-900">{supplier.address || "-"}</p>
              </div>
            </div>
          </div>

          {/* Banking Information Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Banking Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Account Number
                </p>
                <p className="text-gray-900">
                  {supplier.supplierAccountNumber}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Bank Name</p>
                <p className="text-gray-900">{supplier.supplierBankName}</p>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            {supplier.categoryIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {supplier.categoryIds.map((categoryId) => (
                  <span
                    key={categoryId}
                    className="bg-gray-100 px-3 py-1 rounded-full"
                  >
                    {getCategoryName(categoryId)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No categories assigned</p>
            )}
          </div>

          {/* Products & Prices Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Products & Prices</h2>
            {Object.keys(supplier.productPrices).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(supplier.productPrices).map(
                      ([productId, price]) => {
                        const product = products.find(
                          (p) => p.id === productId
                        );
                        return (
                          <tr key={productId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {getProductName(productId)}
                              </div>
                              <div className="text-sm text-gray-500">
                                #{productId}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product
                                ? getCategoryName(product.categoryId)
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {price.toLocaleString("en-NG", {
                                style: "currency",
                                currency: "NGN",
                              })}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No product prices set</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupplierDetailsPage;
