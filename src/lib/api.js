// src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://crud-cad-funcionario-api.onrender.com",
});

export default api;