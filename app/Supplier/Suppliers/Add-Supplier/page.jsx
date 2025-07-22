"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import categoryService from "@/Services/categoryService";
import productService from "@/Services/productService";
import Layout from "@/app/components/Layout";
import toast from "react-hot-toast";
import bankService from "@/Services/bankService";
import dynamic from "next/dynamic";
import supplierService from "@/Services/supplierService";
import formatCurrency from "@/app/components/formatCurrency";

const Select = dynamic(() => import("react-select"), {
  ssr: false,
  loading: () => (
    <div className="min-w-[200px] h-[42px] border border-gray-400 rounded-md"></div>
  ),
});
const AddSupplierPage = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bankOptions, setBankOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    supplierAccountNumber: "",
    supplierBankName: "",
    categoryIds: [],
    productPrices: {},
  });

  useEffect(() => {
    const fetchNigerianBanks = async () => {
      setIsLoadingBanks(true);
      try {
        const data = await bankService.getNigerianBanks();
        const options = data.map((bank) => ({
          value: bank.name,
          label: bank.name,
          logo: bank.logo,
        }));
        setBankOptions(options);
      } catch (err) {
        toast.error("Failed to fetch bank list");
      } finally {
        setIsLoadingBanks(false);
      }
    };

    fetchNigerianBanks();
  }, []);

  const handleBankNameChange = (selectedOption, { action }) => {
    if (action === "select-option") {
      setFormData((prev) => ({
        ...prev,
        supplierBankName: selectedOption.value,
      }));
    } else if (action === "input-change") {
      setInputValue(selectedOption);
    } else if (action === "clear") {
      setFormData((prev) => ({
        ...prev,
        supplierBankName: "",
      }));
      setInputValue("");
    }
  };
  const handleInputBlur = () => {
    if (
      inputValue &&
      !bankOptions.some((option) => option.value === inputValue)
    ) {
      setFormData((prev) => ({
        ...prev,
        supplierBankName: inputValue,
      }));
    }
  };

  // Fetch categories and all products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, productsRes] = await Promise.all([
          categoryService.getCategories(),
          productService.getAllProducts(),
        ]);
        setCategories(categoriesRes);
        setProducts(productsRes);
      } catch (error) {
        toast.error("Failed to load initial data");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update available products when selected category changes
  useEffect(() => {
    if (selectedCategory) {
      const filteredProducts = products.filter(
        (product) => product.categoryId === selectedCategory
      );
      setAvailableProducts(filteredProducts);
    } else {
      setAvailableProducts([]);
    }
  }, [selectedCategory, products]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleAddCategory = () => {
    if (selectedCategory && !formData.categoryIds.includes(selectedCategory)) {
      setFormData({
        ...formData,
        categoryIds: [...formData.categoryIds, selectedCategory],
      });
      setSelectedCategory("");
    }
  };

  const handleRemoveCategory = (categoryId) => {
    setFormData({
      ...formData,
      categoryIds: formData.categoryIds.filter((id) => id !== categoryId),
      // Remove product prices for products in this category
      productPrices: Object.fromEntries(
        Object.entries(formData.productPrices).filter(([productId]) => {
          const product = products.find((p) => p.id === productId);
          return product?.categoryId !== categoryId;
        })
      ),
    });
  };

  const handlePriceChange = (productId, price) => {
    setFormData({
      ...formData,
      productPrices: {
        ...formData.productPrices,
        [productId]: parseFloat(price) || 0,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validate required fields
      if (
        !formData.name ||
        !formData.supplierAccountNumber ||
        !formData.supplierBankName ||
        formData.categoryIds.length === 0
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Validate at least one product price is entered
      if (Object.keys(formData.productPrices).length === 0) {
        toast.error("Please add at least one product with price");
        return;
      }

      const response = await supplierService.addSupplier(formData);

      toast.success("Supplier added successfully");
      router.push("/Supplier/Suppliers");
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to add supplier"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="w-full p-4">
        <h1 className="text-2xl font-bold mb-6">Add New Supplier</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Banking Information Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Banking Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="supplierAccountNumber"
                  value={formData.supplierAccountNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <Select
                  options={bankOptions}
                  value={
                    formData.supplierBankName
                      ? {
                          value: formData.supplierBankName,
                          label: formData.supplierBankName,
                        }
                      : null
                  }
                  onChange={handleBankNameChange}
                  onInputChange={(value) => setInputValue(value)}
                  onBlur={handleInputBlur}
                  isClearable
                  isSearchable
                  placeholder="Search or type bank name"
                  isLoading={isLoadingBanks}
                  noOptionsMessage={() => "Type to enter a custom bank name"}
                  formatOptionLabel={(bank, { context }) => (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {bank.logo && context === "menu" && (
                        <img
                          src={bank.logo}
                          alt={bank.label}
                          style={{
                            width: "20px",
                            height: "20px",
                            marginRight: "10px",
                          }}
                        />
                      )}
                      {bank.label}
                    </div>
                  )}
                  className="basic-single"
                  classNamePrefix="select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "42px",
                      borderColor: "#d1d5db",
                      boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                      "&:hover": {
                        borderColor: "#3D873B",
                      },
                    }),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <div className="flex items-end gap-2 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!selectedCategory}
                className="px-4 py-2 bg-[#333] text-white rounded-md hover:opacity-90 disabled:opacity-50"
              >
                Add Category
              </button>
            </div>

            {formData.categoryIds.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Selected Categories:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formData.categoryIds.map((categoryId) => {
                    const category = categories.find(
                      (c) => c.id === categoryId
                    );
                    return (
                      <div
                        key={categoryId}
                        className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                      >
                        <span>{category?.name || categoryId}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(categoryId)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Products Section */}
          {formData.categoryIds.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Products & Prices</h2>
              <div className="space-y-4">
                {formData.categoryIds.map((categoryId) => {
                  const category = categories.find((c) => c.id === categoryId);
                  const categoryProducts = products.filter(
                    (product) => product.categoryId === categoryId
                  );

                  return (
                    <div key={categoryId} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">{category?.name}</h3>
                      {categoryProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryProducts.map((product) => (
                            <div
                              key={product.id}
                              className="border p-3 rounded-md"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">
                                  {product.name}
                                </span>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                  Price
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                      formData.productPrices[product.id] || ""
                                    }
                                    onChange={(e) =>
                                      handlePriceChange(
                                        product.id,
                                        e.target.value
                                      )
                                    }
                                    className="w-full text-white p-2 border border-gray-300 rounded-md"
                                  />
                                  <span className="absolute left-0 translate-y-1/2 ml-2       font-bold">
                                    {formatCurrency(
                                      formData.productPrices[product.id] || 0
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No products found in this category
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Supplier"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddSupplierPage;
