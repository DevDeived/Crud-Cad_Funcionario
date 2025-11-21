const API_URL = 
  import.meta.env.VITE_API_URL || 
  "https://crud-cad-funcionario-api.onrender.com"; // fallback

const api = {
  get: (url) => fetch(API_URL + url).then(res => res.json()),
  post: (url, data) => fetch(API_URL + url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(res => res.json())
};

export default api;