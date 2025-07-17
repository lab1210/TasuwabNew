import axios from "axios";
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/suppliers/products`;

const productService = {
  addProductToCategory: async (productData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}`, productData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to add product to category"
      );
    }
  },
  deleteProductFromCategory: async (productId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${productId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error.message ||
        "Failed to delete product from category"
      );
    }
  },
  getAllProducts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}`);
      return response.data.items;
    } catch (error) {
      throw (
        error.response?.data || error.message || "Failed to get all products"
      );
    }
  },
};
export default productService;
