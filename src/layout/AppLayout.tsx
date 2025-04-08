import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import AppSidebarAdmin from "./AppSidebarAdmin";
import useIdleLogout from "../hooks/useIdleLogout";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Obtener el rol del usuario desde localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role; // Aquí almacenamos el rol, por ejemplo, 'jefe de patio' o 'admin'
  console.log("El rol obtenido es ",userRole);
  // Verifica el rol y renderiza el componente adecuado
  const SidebarComponent = userRole === "admin" ? AppSidebarAdmin : AppSidebar;
  useIdleLogout();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        {/* Renderiza el sidebar correspondiente según el rol */}
        <SidebarComponent />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
