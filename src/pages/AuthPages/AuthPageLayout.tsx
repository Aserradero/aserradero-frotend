import React from "react";
import GridShape from "../../components/common/GridShape";
//import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import "./style.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row white:bg-green-500 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-white-800 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="relative w-full h-160">
            <div className="absolute inset-0 flex items-center justify-center bg-opacity-50">
            <p className="text-gray-100 text-2xl underline underline-offset-8 text-center font-bold text-shadow-custom">
              Bienvenido a la Unidad Económica Especializada de Aprovechamiento Forestal Comunal "San Mateo"
            </p>
            </div>

            <img
              className="w-full h-160 object-cover"
              src="/images/fondoPrinci.jpg"
              alt="Logo"
            />
             
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}