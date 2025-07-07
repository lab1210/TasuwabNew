import axios from "axios";

export const setupAxiosInterceptor = () => {
  if (typeof window === "undefined") return;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 403) {
        window.dispatchEvent(new CustomEvent("forbidden403"));
      }
      return Promise.reject(error);
    }
  );
};
