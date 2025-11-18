// src/config/api.js
import axios from "axios";

const API_URL = "https://crud-cad-funcionario-api.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Opcional: intercepta erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na requisição:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;