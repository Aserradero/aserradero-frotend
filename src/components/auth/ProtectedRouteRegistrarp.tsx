import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRouteRegistrarp: React.FC<ProtectedRouteProps> = ({ element }) => {
  const token = localStorage.getItem("token"); // Obtener el token del almacenamiento local

  // Si el token no existe, redirige al login
  if (!token) {
    return <Navigate to="/" />;
  }

  // Si el token existe, muestra el componente protegido
  return <>{element}</>;
};

export default ProtectedRouteRegistrarp;

