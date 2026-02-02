import axios from "axios";
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL_TEST,
  withCredentials: true,
});

export default axiosClient;
