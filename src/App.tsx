import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
//Para rutas protegidas
import PrivateRoute from "./routes/PrivateRoute";
import "primereact/resources/themes/lara-light-indigo/theme.css"; // O cualquier otro tema
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css"; // Para íconos de PrimeReact
import "./index.css"; // Tu archivo donde Tailwind está configurado
import NotaSalida from "./components/notasalida/NotaSalida";
import RegistrarP from "./components/notasalida/RegistrarP";
import Fases from "./components/notasalida/fases";
import ResetPass from "./pages/AuthPages/ResetPass";
import UpdatePass from "./pages/AuthPages/UpdatePass";
import ProductosFaltantes from "./components/inventario/ProductosFaltantes";
import ProductosPrecio from "./components/inventario/ProductosPrecio";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedRouteRegistrarp from "./components/auth/ProtectedRouteRegistrarp";


export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />

        <Routes>
          {/* Dashboard Layout */}
          <Route index path="/" element={<ProtectedRoute element={<SignIn />} />} />
          <Route element={<AppLayout />}>
            <Route element={<PrivateRoute />}>
              <Route index path="/home" element={<Home />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />
              {/* Forms */}
              <Route path="/registrarp" element={<ProtectedRouteRegistrarp element={<RegistrarP />} />} />
              <Route path="/fases" element={<ProtectedRouteRegistrarp element={<Fases />} />} />
              <Route path="/notasalida" element={<ProtectedRouteRegistrarp element={<NotaSalida />} />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />
              <Route
                path="/productosfaltantes"
                element={<ProductosFaltantes />}
              />
              <Route path="/productosprecio" element={<ProtectedRouteRegistrarp element={<ProductosPrecio />} />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/resetpassform" element={<ResetPass />} />
          <Route path="/updatepass" element={<UpdatePass />} />

          {/* Fallback Route */}
          <Route path="/404" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
