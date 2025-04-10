import { useState, useRef } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
//import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import axios, { AxiosError } from "axios";
import { Image } from "primereact/image";
import "./sig.css";
import { ProgressSpinner } from "primereact/progressspinner";

export default function SignInForm() {
  //utilizar un hook para redirigir
  const navigate = useNavigate();
  //usando toast para ver etiquetas flotantes
  const toast = useRef<Toast | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  //Establecer las variables y tipo de dato
  interface FormData {
    email: string;
    password: string;
  }

  //Establecer el valor de las variables
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  //Manejar los ambos imputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //  Manejar el login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario

    console.log("Email:", formData.email);
    console.log("Password:", formData.password);

    try {
      // Hacer la petición `POST` al backend (Laravel Sanctum)
      if (
        formData.email.trim().length > 0 &&
        formData.password.trim().length > 0
      ) {
        if (formData.password.trim().length >= 8) {
          const response = await axios.post(
            "https://api.uniecosanmateo.icu/api/user/login",
            {
              email: formData.email,
              password: formData.password,
            }
          );

          // Obtener token y usuario desde la respuesta
          const { token, user } = response.data;

          //  Guardar el token y usuario en `localStorage`
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          // Mostrar mensaje de éxito con Toast
          toast.current?.show({
            severity: "success",
            summary: "Bienvenido",
            detail: `Inicio de sesión exitoso, ${user.name}`,
            life: 1000,
          });
          // Redirigir al Dashboard después de 1.1 segundos
          setTimeout(() => navigate("/home"), 1100);
        } else {
          toast.current?.show({
            severity: "error",
            summary: "Acceso denegado",
            detail: "La contraseña no puede ser menor a 8 caracteres",
            life: 2000,
          });
          setLoading(false);
        }
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Acceso denegado",
          detail: "Ingrese sus credenciales",
          life: 1000,
        });
        setLoading(false);
      }
      setLoading(false);

    } catch (error) {
      // Usamos type assertion para decirle a TypeScript que 'error' es de tipo 'AxiosError'
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const statusCode = axiosError.response.status;

        // Mostrar un mensaje de error dependiendo del código de estado
        if (statusCode === 401) {
          toast.current?.show({
            severity: "error",
            summary: "Acceso denegado",
            detail: "Credenciales incorrectas",
            life: 2000,
          });
        } else if (statusCode === 422) {
          toast.current?.show({
            severity: "error",
            summary: "Datos incorrectos",
            detail: "Verifique los datos ingresados.",
            life: 2000,
          });
        } else if (statusCode === 403) {
          toast.current?.show({
            severity: "warn",
            summary: "Se tiene una sesión activa",
            detail: "Cierre la sesión en su otro dispositivo.",
            life: 2000,
          });
        }
      } else if (axiosError.request) {
        // Si no se recibe respuesta del servidor
        toast.current?.show({
          severity: "warn",
          summary: "Error de red",
          detail: "No se pudo conectar con el servidor.",
          life: 5000,
        });
      } else {
        // Si hay algún otro error en la configuración de la solicitud
        toast.current?.show({
          severity: "error",
          summary: "Error al realizar la solicitud",
          detail: axiosError.message,
          life: 5000,
        });
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent z-50">
          <ProgressSpinner
            aria-label="Loading"
            style={{ width: "50px", height: "50px" }}
            strokeWidth="8"
            fill="none"
            animationDuration=".5s"
          />
        </div>
      )}
      <Toast ref={toast} position="top-left" />
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md text-center">
              Inicia sesión
            </h1>

            <div className="card flex justify-center m-2">
              <Image src="/images/logo.png" alt="Image" width="150" preview />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¡Ingresa tu correo y contraseña para ingresar!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Correo de usuario <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="info@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>
                    Contraseña <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Link
                    to="/resetpassform"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div>
                  <Button
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-green-600 shadow-theme-xs hover:bg-green-700"
                    severity="success"
                    label="Ingresar"
                    onClick={() => setLoading(true)}
                  ></Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                ¿No tienes cuenta todavia? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Registrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
