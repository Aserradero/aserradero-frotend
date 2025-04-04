import React, { useRef, useState, useEffect } from "react";
import { Toast } from "primereact/toast";
import { Image } from "primereact/image";
import { Button } from "primereact/button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import axios from "axios";
import { useNavigate } from "react-router";

export default function UpdatePassForm() {
  // Usando toast para ver etiquetas flotantes
  const toast = useRef<Toast | null>(null);
  const navigate = useNavigate();

  // Estados
  const [email, setEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordDos, setShowPasswordDos] = useState(false);

  // Cargar correo desde localStorage al montar el componente
  useEffect(() => {
    const storedEmail = localStorage.getItem("correove");
    if (storedEmail) {
      setEmail(storedEmail); // Establecer el valor en el estado si hay algo en localStorage
    }
  }, []);

  // Manejar el cambio de la nueva contraseña
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  // Manejar el cambio de la confirmación de la contraseña
  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
  };

  // Función para enviar la solicitud de actualización de contraseña
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //validacion de 8 caracteres
    if (newPassword.length <= 8) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "La contraseña debe ser mayor a 8 caracteres.",
        life: 3000,
      });
      return;
    }
    // Validación de las contraseñas
    if (newPassword !== confirmPassword) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Las contraseñas no coinciden.",
        life: 3000,
      });
      return;
    }


    if (confirmPassword.length <= 8) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "La contraseña debe ser mayor a 8 caracteres.",
        life: 3000,
      });
      return;
    }

    try {
      const response = await axios.post(
        "https://api.uniecosanmateo.icu/api/update-pass",
        {
          email,
          new_password: newPassword,
        }
      );

      toast.current?.show({
        severity: "success",
        summary: "Contraseña actualizada",
        detail:
          response.data.message || "La contraseña se actualizó correctamente.",
        life: 1500,
      });

      // Redirigir al usuario a otra página después de la actualización (ej. login)
      setTimeout(() => {
        // Redirige a la página principal después de 2 segundos (2000 ms)
        navigate("/");
      }, 2000); // 2 segundos de espera antes de la redirección
    } catch (error) {
      console.error("Error al actualizar la contraseña", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Hubo un problema al actualizar la contraseña.",
        life: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <Toast ref={toast} />

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md text-center">
              Reestablece tu contraseña
            </h1>
          </div>
          <div className="card flex justify-center m-2">
            <Image src="/images/logo.png" alt="Image" width="150" preview />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Mostrar el correo */}
              <div className="sm:col-span-1 mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Correo
                </p>

                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={email} // El valor está vinculado al estado
                  disabled // El input es deshabilitado, pero puede ver el valor
                  className="mt-5"
                />
              </div>

              {/* Nueva Contraseña */}
              <div className="sm:col-span-1">
                <Label>
                  Contraseña<span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="password"
                    placeholder="Ingresa tu contraseña"
                    type={showPassword ? "text" : "password"}
                    value={newPassword} // Vinculamos el estado
                    onChange={handleNewPasswordChange}
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

              {/* Repetir Contraseña */}
              <div className="sm:col-span-1">
                <Label>
                  Repetir Contraseña<span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="password_confirmation"
                    placeholder="Repite tu contraseña"
                    type={showPasswordDos ? "text" : "password"}
                    value={confirmPassword} // Vinculamos el estado
                    onChange={handleConfirmPasswordChange}
                  />
                  <span
                    onClick={() => setShowPasswordDos(!showPasswordDos)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPasswordDos ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>

              {/* Botón para enviar el código */}
              <div>
                <Button
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-green-600 shadow-theme-xs hover:bg-green-700"
                  severity="success"
                  label="Actualizar Contraseña"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}