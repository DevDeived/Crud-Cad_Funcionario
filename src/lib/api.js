const API_URL = 
  import.meta.env.VITE_BASE_URL || 
  import.meta.env.VITE_APP_API_URL ||
  "https://crud-cad-funcionario-api.onrender.com";

const api = {
  get: (url) => fetch(`${API_URL}${url}`).then(r => r.json()),
  post: (url, data) => fetch(`${API_URL}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  put: (url, data) => fetch(`${API_URL}${url}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (url) => fetch(`${API_URL}${url}`, { method: "DELETE" }).then(r => r.json())
};

export default api;