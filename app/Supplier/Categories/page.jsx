"use client";
import Layout from "@/app/components/Layout";
import categoryService from "@/Services/categoryService";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaTrashAlt } from "react-icons/fa";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setCategories(categoryService.getAllCategories());
  }, []);

  function refreshCategories() {
    setCategories([...categoryService.getAllCategories()]);
  }

  function handleAddCategory() {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    try {
      categoryService.addCategory(newCategoryName.trim());
      toast.success(`Category "${newCategoryName}" added!`);
      setNewCategoryName("");
      refreshCategories();
    } catch (e) {
      toast.error(e.message);
    }
  }

  function handleAddProduct() {
    if (!selectedCategoryId) {
      toast.error("Select a category first");
      return;
    }
    if (!newProductName.trim()) {
      toast.error("Product name cannot be empty");
      return;
    }

    const existingProduct = selectedCategory?.products.find(
      (p) => p.name.toLowerCase() === newProductName.trim().toLowerCase()
    );

    if (existingProduct) {
      toast.error("This product already exists in the selected category");
      return;
    }

    try {
      categoryService.addProductToCategory(
        selectedCategoryId,
        newProductName.trim()
      );
      toast.success(`Product "${newProductName}" added!`);
      setNewProductName("");
      refreshCategories();
      setCurrentPage(1); // reset to first page after adding product
    } catch (e) {
      toast.error(e.message);
    }
  }

  function handleDeleteCategory(id) {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        categoryService.deleteCategory(id);
        toast.success("Category deleted");
        if (selectedCategoryId === id) setSelectedCategoryId(null);
        refreshCategories();
        setCurrentPage(1);
      } catch (e) {
        toast.error(e.message);
      }
    }
  }

  function handleRemoveProduct(categoryId, productId) {
    if (window.confirm("Remove this product?")) {
      try {
        categoryService.removeProductFromCategory(categoryId, productId);
        toast.success("Product removed");
        refreshCategories();
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

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );

  const allProducts = selectedCategory?.products || [];

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
            className="w-full p-3 rounded   border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-500"
            value={selectedCategoryId || ""}
            onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
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
                          onClick={() =>
                            handleRemoveProduct(selectedCategoryId, product.id)
                          }
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

            <button
              onClick={() => handleDeleteCategory(selectedCategoryId)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 rounded text-white font-semibold transition mt-6"
            >
              Delete This Category
            </button>
          </>
        )}
      </div>
    </Layout>
  );
}
