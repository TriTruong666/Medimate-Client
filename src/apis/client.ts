import axios from "axios";

const base_rag_url = import.meta.env.VITE_PY_API_URL;
const base_net_url = import.meta.env.VITE_NET_API_URL;

export const axiosRAGClient = axios.create({
  baseURL: base_rag_url,
  withCredentials: true,
});

export const axiosNETClient = axios.create({
  baseURL: base_net_url,
  withCredentials: true,
});
