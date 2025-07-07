import axios from "axios";
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/Supplier/categories`;

const categoryService = {
  addCategory: async (categoryData) => {
    try {
      const response = await axios.post(API_BASE_URL, categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || "Failed to add category";
    }
  },
  getCategories: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || error.message || "Failed to fetch categories"
      );
    }
  },
  getallProductsunderCategory: async (categoryId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${categoryId}/products`
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to fetch products under category"
      );
    }
  },
};
export default categoryService;
