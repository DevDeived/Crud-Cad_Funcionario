import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import RegisterAdmin from "./pages/admin/RegisterAdmin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="*" element={<Login />} />

      <Route path="/admin/register" element={<RegisterAdmin />} />
    </Routes>
  );
}

export default App;
