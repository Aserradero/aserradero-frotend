import React, { useRef, useState, useEffect } from "react";
import { Toast } from "primereact/toast";
import { Image } from "primereact/image";
import { Button } from "primereact/button";
import Input from "../form/input/InputField";
import axios from "axios";
import { InputOtp } from "primereact/inputotp";
import { useNavigate } from "react-router";

export default function ResetPassForm() {
  //usando toast para ver etiquetas flotantes
  const toast = useRef<Toast | null>(null);
  //usando una varible para guardar el correo
  const [email, setEmail] = useState<string>("");

  const [token, setTokens] = useState<string | number | undefined>("");

  const [codigo, setCodigo] = useState<number | null>(null); // Almacena el código

  const [emailVe, setEmailVe] = useState<string>("");
  //Utilizar hook para redirigir
  const navigate = useNavigate();

  //Actualizar el valor del correo que se ingreso en el input
  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  //ver el cambio en el input del correo
  useEffect(() => {
    console.log("Correo a enviar:", email);
  }, [email]); // Dependencia de emal

  //ver el cambio en el input del correo
  useEffect(() => {
    console.log("Token que se esta ingresando:", token);
  }, [token]); // Dependencia de emal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email !== "") {
      toast.current?.show({
        severity: "success",
        summary: "Se envio a su correo un codigo para restaurar su contraseña",
        detail: "Codigo enviado",
        life: 5000,
      });

      try {
        const response = await axios.post("https://api.uniecosanmateo.icu/api/email", {
          email,
        });

        const { emailVe, codigo } = response.data;

        // Actualizamos el estado
        setCodigo(codigo);
        setEmailVe(emailVe); // Guardamos el correo verificado en el estado

        // Comprobamos si el estado se actualizó correctamente
        console.log("Código enviado al correo: ", codigo);
        console.log("Correo verificado: ", emailVe); // Aquí debería salir el correo enviado en la respuesta JSON
        localStorage.setItem("correove", emailVe);
      } catch (error) {
        console.log("El correo no existe");
      }
    } else {
      toast.current?.show({
        severity: "error",
        summary: "No se ingreso ningun correo",
        detail: "Verifique",
        life: 2000,
      });
    }
  };

  const handleSubmitVerficar = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos a comparar");
    console.log("Email ingresado: ", email);
    console.log("Email verificado: ", emailVe);
    console.log("Codigo enviado el laravel: ", codigo);
    console.log("Condigo ingresado actualmente: ", token);
    if (
      email.trim() === emailVe.trim() &&
      String(codigo).trim() === String(token).trim() &&
      token !== undefined
    ) {
      navigate("/updatepass");
    } else {
      toast.current?.show({
        severity: "error",
        summary: "El codigo no es correcto",
        detail: "Verifique",
        life: 2000,
      });
    }
  };

   // Función para manejar la redirección
   const handleGoBack = () => {
    navigate("/"); // Redirige al usuario a la ruta "/"
  };

  return (
    <div className="flex flex-col flex-1">
      <Toast ref={toast} />

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md text-center">
              Recupera tu contraseña
            </h1>
          </div>
          <div className="card flex justify-center m-2">
            <Image src="/images/logo.png" alt="Image" width="150" preview />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              <div className="sm:col-span-1 mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Ingresa tu correo para recuperar tu contraseña
                </p>

                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Ingresa tu correo"
                  onChange={handleChangeEmail}
                  className="mt-5"
                />
              </div>

              <div>
                <Button
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-green-600 shadow-theme-xs hover:bg-green-700"
                  severity="success"
                  label="Enviar codigo"
                ></Button>
              </div>
            </div>
          </form>
          <form className="mt-5" onSubmit={handleSubmitVerficar}>
            <div className="flex justify-center items-center">
              <InputOtp
                value={token}
                onChange={(e) => setTokens(e.value ?? "")}
                mask
              />
            </div>
            <div className="flex justify-center items-center mt-4">
              <Button label="Verificar" link className="p-0"></Button>
            </div>
          </form>
          <div className="flex justify-center items-center mt-4">
            <Button label="Regresar" onClick={handleGoBack} link className="p-0"></Button>
          </div>
        </div>
      </div>
    </div>
  );
}