import axios from "axios";
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/Supplier/products`;

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
};
export default productService;
