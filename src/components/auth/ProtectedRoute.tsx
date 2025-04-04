import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const token = localStorage.getItem("token"); // Obtener el token del almacenamiento local

  // Si el token existe
  if (token) {
    return <Navigate to="/home" />; // Me manda a home
  }

  // Si el token no existe me manda al login 
  return <>{element}</>;
};

export default ProtectedRoute;
