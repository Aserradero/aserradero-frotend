import React, { useEffect } from "react";
import { useNavigate, Outlet } from "react-router";

const PrivateRoute: React.FC = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // 🔹 Hook para redireccionar

  console.log("El token es:", token);

  useEffect(() => {
    if (!token) {
      navigate("/404", { replace: true }); // 🔹 Redirigir si no hay token
    }
  }, [token, navigate]);

  return token ? <Outlet /> : null; // 🔹 Solo muestra el contenido si hay token
};

export default PrivateRoute;
