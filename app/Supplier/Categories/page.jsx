"use client";
import Layout from "@/app/components/Layout";
import categoryService from "@/Services/categoryService";
import productService from "@/Services/productService";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaTrashAlt } from "react-icons/fa";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (e) {
        toast.error(e.message);
      }
    };
    fetchCategories();
  }, []);

  async function handleAddCategory() {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    // Check if category already exists
    const categoryExists = categories.some(
      (cat) => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );

    if (categoryExists) {
      toast.error(`Category "${newCategoryName}" already exists!`);
      return;
    }

    try {
      await categoryService.addCategory({ name: newCategoryName.trim() });
      const updatedCategories = await categoryService.getCategories();
      setCategories(updatedCategories);
      toast.success(
        `Category "${newCategoryName}" added click dropdown below to view!`
      );
      setNewCategoryName("");
    } catch (e) {
      toast.error(e.message);
    }
  }
  async function handleAddProduct() {
    if (!selectedCategoryId) {
      toast.error("Select a category first");
      return;
    }
    if (!newProductName.trim()) {
      toast.error("Product name cannot be empty");
      return;
    }

    const selectedCategory = categories.find(
      (cat) => String(cat.id) === selectedCategoryId
    );

    if (!selectedCategory) {
      toast.error("Selected category not found.");
      return;
    }

    const existingProduct = selectedCategory.products?.find(
      (p) => p.name.toLowerCase() === newProductName.trim().toLowerCase()
    );

    if (existingProduct) {
      toast.error("This product already exists in the selected category");
      return;
    }

    try {
      await productService.addProductToCategory({
        categoryId: selectedCategoryId,
        name: newProductName.trim(),
      });
      toast.success(`Product "${newProductName}" added!`);
      setNewProductName("");
      setCurrentPage(1);

      const updatedAllProducts = await productService.getAllProducts();
      const filteredProducts = updatedAllProducts.filter(
        (product) => product.categoryId === selectedCategoryId
      );
      setAllProducts(filteredProducts);
    } catch (e) {
      toast.error(e.message || "Failed to add product");
    }
  }

  async function handleRemoveProduct(productId) {
    if (window.confirm("Remove this product?")) {
      try {
        await productService.deleteProductFromCategory(productId);
        toast.success("Product removed");

        setAllProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== productId)
        );

        setCurrentPage(1);
      } catch (e) {
        toast.error(e.message);
      }
    }
  }
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
  }, [selectedCategoryId]);

  // const selectedCategory = categories.find(
  //   (cat) => String(cat.id) === selectedCategoryId
  // );

  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function goToPreviousPage() {
    setCurrentPage((page) => Math.max(page - 1, 1));
  }

  function goToNextPage() {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  }

  return (
    <Layout>
      <div className="w-full mx-auto p-6">
        <div className="flex flex-col gap-1 mb-6">
          <h2 className="text-3xl font-semibold">Supplier Categories</h2>
          <p>View all categories and add products to them</p>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            className="flex-grow p-3 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-500"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New Category Name"
          />
          <button
            onClick={handleAddCategory}
            className="px-5 py-3 bg-[#3D873B] cursor-pointer hover:bg-green-600 rounded text-white font-bold transition"
          >
            Add Category
          </button>
        </div>

        <hr className="border-gray-700 mb-6" />

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-500">
            Select Category:
          </label>
          <select
            className="w-full p-3 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-500"
            value={selectedCategoryId || ""}
            onChange={async (e) => {
              const value = e.target.value;
              setSelectedCategoryId(value);
              try {
                // First get all products
                const allProducts = await productService.getAllProducts();

                // Then filter by category if a category is selected
                const filteredProducts = value
                  ? allProducts.filter(
                      (product) => product.categoryId === value
                    )
                  : allProducts;

                setAllProducts(filteredProducts);
              } catch (err) {
                toast.error("Failed to load products");
                setAllProducts([]);
              }
            }}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCategoryId && (
          <>
            <div className="flex gap-3 mb-6">
              <input
                className="flex-grow p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-200"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="New Product Name"
              />
              <button
                onClick={handleAddProduct}
                className="px-5 py-3 bg-[#3D873B] cursor-pointer hover:bg-green-600 rounded text-white font-bold transition"
              >
                Add Product
              </button>
            </div>

            {/* Product Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full mb-4 p-3 rounded bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <table className="w-full table-auto divide-y divide-gray-200 shadow-lg rounded-md">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4">S/N</th>
                  <th className="text-left py-3 px-4">Product Name</th>
                  <th className="text-left py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-3 px-4">
                      No products found
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                          aria-label={`Remove ${product.name}`}
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {filteredProducts.length > pageSize && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded ${
                    currentPage === 1
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
