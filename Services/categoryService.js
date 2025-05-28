// categoryService.js
"use client";
const STORAGE_KEY = "categoriesData";

let categories = [];
let nextCategoryId = 1;
let nextProductId = 1;

// Load categories from localStorage or init dummy data
function loadCategories() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      categories = JSON.parse(stored);

      // Find max ids to continue incrementing correctly
      nextCategoryId =
        categories.reduce((maxId, cat) => Math.max(maxId, cat.id), 0) + 1;
      nextProductId =
        categories.reduce((maxProdId, cat) => {
          const maxInCat = cat.products.reduce(
            (maxP, p) => Math.max(maxP, p.id),
            0
          );
          return Math.max(maxProdId, maxInCat);
        }, 0) + 1;
    } catch {
      console.warn("Failed to parse stored categories, loading dummy data");
      initDummyData();
    }
  } else {
    initDummyData();
  }
}

function saveCategories() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

function initDummyData() {
  categories = [
    {
      id: 1,
      name: "Electronics",
      products: [
        { id: 1, name: "Smartphone" },
        { id: 2, name: "Laptop" },
      ],
    },
    {
      id: 2,
      name: "Books",
      products: [
        { id: 3, name: "Novel" },
        { id: 4, name: "Biography" },
      ],
    },
    {
      id: 3,
      name: "Clothing",
      products: [
        { id: 5, name: "T-Shirt" },
        { id: 6, name: "Jeans" },
      ],
    },
  ];
  nextCategoryId = 4;
  nextProductId = 7;
  saveCategories();
}

loadCategories();

const categoryService = {
  getAllCategories() {
    return categories;
  },

  findCategoryById(id) {
    return categories.find((cat) => cat.id === id);
  },

  addCategory(name) {
    if (!name || typeof name !== "string") {
      throw new Error("Category name must be a non-empty string");
    }
    const newCategory = {
      id: nextCategoryId++,
      name,
      products: [],
    };
    categories.push(newCategory);
    saveCategories();
    return newCategory;
  },

  editCategory(id, newName) {
    const category = this.findCategoryById(id);
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }
    if (!newName || typeof newName !== "string") {
      throw new Error("New category name must be a non-empty string");
    }
    category.name = newName;
    saveCategories();
    return category;
  },

  deleteCategory(id) {
    const index = categories.findIndex((cat) => cat.id === id);
    if (index === -1) {
      throw new Error(`Category with id ${id} not found`);
    }
    const deleted = categories.splice(index, 1);
    saveCategories();
    return deleted[0];
  },

  addProductToCategory(categoryId, productName) {
    const category = this.findCategoryById(categoryId);
    if (!category) {
      throw new Error(`Category with id ${categoryId} not found`);
    }
    if (!productName || typeof productName !== "string") {
      throw new Error("Product name must be a non-empty string");
    }
    const newProduct = {
      id: nextProductId++,
      name: productName,
    };
    category.products.push(newProduct);
    saveCategories();
    return newProduct;
  },

  removeProductFromCategory(categoryId, productId) {
    const category = this.findCategoryById(categoryId);
    if (!category) {
      throw new Error(`Category with id ${categoryId} not found`);
    }
    const index = category.products.findIndex((p) => p.id === productId);
    if (index === -1) {
      throw new Error(
        `Product with id ${productId} not found in category ${categoryId}`
      );
    }
    const removed = category.products.splice(index, 1);
    saveCategories();
    return removed[0];
  },
};

export default categoryService;
