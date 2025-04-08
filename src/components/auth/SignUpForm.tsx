import React, { useState, useRef, useEffect } from "react";
//import { Link, Navigate } from "react-router";
import { Link } from "react-router";

import { useNavigate } from "react-router";
//import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import { EyeCloseIcon, EyeIcon } from "../../icons";

import Label from "../form/Label";
import Input from "../form/input/InputField";
//import Checkbox from "../form/input/Checkbox";
import axios from "axios";
import { Toast } from "primereact/toast";
//Botton para el modal
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";

//creamos la interfaz para los datos del formulariom
export interface FormData {
  name: string;
  apellidos: string;
  telefono: string;
  genero: string;
  rol: string;
  nombreUsuario: string;
  email: string;
  password: string;
}

export interface User {
  name: string;
  apellidos: string;
  telefono: string;
  genero: string;
  rol: string;
  nombreUsuario: string;
  email: string;
  password: string;
}

export default function SignUpForm() {
  //Declaramos el toast
  const toast = useRef<Toast>(null);
  //Utilizar hook para redirigir
  const navigate = useNavigate();

  //ver la contraseña o no

  const [showPassword, setShowPassword] = useState(false);

  //ver la segunda contrasena

  const [showPasswordDos, setShowPasswordDos] = useState(false);

  //ver la clave de seguridad

  const [showPasswordTres, setShowPasswordTres] = useState(false);

  //valor para guardar el valor de repetir contraseña
  const [repetirCon, setRepetirCon] = useState<string>("");

  //Ingresar la clave de seguridad en los inputs
  const [claveS, setClaveS] = useState<string>("");

  const [loading, setLoading] = useState(false);

  //Obtener a todos los ususarios
  const [users, setUsers] = useState<User[]>([]);

  const [correoR, setCorreoR] = useState<Boolean>();

  //use state para guardar los datos

  const [formData, setFormData] = useState<FormData>({
    name: "",
    apellidos: "",
    telefono: "",
    genero: "",
    rol: "",
    nombreUsuario: "",
    email: "",
    password: "",
  });
  //Viendo si el  usuario ya fue autenticado
  const [autenUsuario, setautenUsuario] = useState<Boolean>();

  //Manejar los cambios en los inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //Actualizar el valor de la contraseña repetir
  const handleChangeRP = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepetirCon(e.target.value);
  };

  //Actualiazar clave de seguridad
  const handleChangeCS = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClaveS(e.target.value);
  };
  //Haceer que los cambios se vean en automatico con usseEfect
  // useEffect se ejecuta cada vez que repetirCon cambia
  useEffect(() => {
    console.log("Contraseña:", formData.password);
  }, [formData.password]); // Dependencia repetirCon

  //Haceer que los cambios se vean en automatico con usseEfect
  // useEffect se ejecuta cada vez que repetirCon cambia
  useEffect(() => {
    console.log("Repetir contraseña:", repetirCon);
  }, [repetirCon]); // Dependencia repetirCon

  useEffect(() => {
    console.log("El email es: ", formData.email);
  }, [formData.email]); // Dependencia repetirCon

  useEffect(() => {
    console.log("Clave de seguridad", claveS);
    console.log("Rol", formData.rol);
  }, [claveS]);

  useEffect(() => {
    setCorreoR(correoR);
    console.log("El valor del condicional es: ", correoR);
  }, [correoR]);
  //Establecer la clave de seguridad para el jefe de patio
  const [claveJP] = useState<String>("JefePatioAcceso06");

  //Establecer la clave de seguridad para el jefe de patio
  const [claveAd] = useState<String>("AdministradorAcceso06");

  const [user, setUser] = useState<User>();

  useEffect(() => {
    setUser(user);
  }, [user]);

  useEffect(() => {
    console.log("Los usuarios que estan son, ", users);
  }, [users]);

  //Validaciones
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
  };

  const obtenerUsuarios = async () => {
    try {
      const usersResponse = await axios.get(
        "https://api.uniecosanmateo.icu/api/users", // API para obtener todos los usuarios
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setUsers(usersResponse.data);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  const validarAutenticacion = async () => {
    console.log("Formata data mail que se obtiene: ", formData.email);
    if (
      formData.email !== "" &&
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email) &&
      validateFormAntesEnviarCorreo()
    ) {
      try {
        const responseAuten = await axios.post(
          "https://api.uniecosanmateo.icu/api/verify-email",
          { email: formData.email }
        );
        // Actualizamos el estado de autenUsuario con el valor de la autenticación
        setautenUsuario(responseAuten.data.acceso);
        console.log(
          "Respuesta del servidor a la autenticación: ",
          responseAuten.data.acceso
        );
        setLoading(false);
        if (responseAuten.data.acceso === false) {
          toast.current?.show({
            severity: "warn",
            summary: "Verificación enviada",
            detail: "Revise su correo, se envió un enlace de autenticación.",
            life: 5000,
          });
          setautenUsuario(false);
          console.log("Cambio a autenUsuario a : ", autenUsuario);
        } else {
          toast.current?.show({
            severity: "warn",
            summary: "El usuario ya esta autenticado",
            detail: "Ya no tiene que realizar la autenticación.",
            life: 5000,
          });
          setautenUsuario(true);
          console.log("Cambio a autenUsuario a : ", autenUsuario);
        }
      } catch (error) {
        // Verifica si el error es un error de Axios
        if (axios.isAxiosError(error)) {
          // Si es un error de Axios, accede a la respuesta y otros detalles
          const errorMessage = error.response?.data?.message;

          // Mostrar mensajes específicos según el error recibido
          if (errorMessage === "Formato de correo electrónico inválido") {
            toast.current?.show({
              severity: "error",
              summary: "El correo electrónico no tiene un formato válido.",
              detail: "Verifica.",
              life: 2500,
            });
            setLoading(false);
          } else if (
            errorMessage ===
            "El dominio del correo no tiene registros MX o es inválido."
          ) {
            toast.current?.show({
              severity: "error",
              summary:
                "El dominio del correo no es válido o no tiene registros MX.",
              detail: "Verifica.",
              life: 2500,
            });
            setLoading(false);
          } else {
            toast.current?.show({
              severity: "error",
              summary: "Ocurrió un error al intentar verificar el correo.",
              detail: "Verifica.",
              life: 2500,
            });
            setLoading(false);
          }
        } else {
          toast.current?.show({
            severity: "error",
            summary: "Ocurrió un error inesperado.",
            detail: "Verifica.",
            life: 2500,
          });
          setLoading(false);
        }
      }
    }
  };

  // useEffect que maneja la autenticación y la ejecución posterior
  useEffect(() => {
    const checkAuthAndRegister = async () => {
      if (autenUsuario !== undefined) {
        console.log("La autenticación del usuario es: ", autenUsuario);
        // if (validateForm()) {
        console.log("Llego aca pero no entro");
        if (autenUsuario && validateFormDos()) {
          // Procedemos con el registro si autenUsuario es true
          console.log("Usuario autenticado, continuar con el registro.");
          try {
            const response = await axios.put(
              `https://api.uniecosanmateo.icu/api/user/updateRegister/${formData.email}`,
              {
                name: formData.name,
                apellidos: formData.apellidos,
                telefono: formData.telefono,
                genero: formData.genero,
                rol: formData.rol,
                nombreUsuario: formData.nombreUsuario,
                password: formData.password,
              }
            );
            console.log("Usuario creado:", response.data);
            toast.current?.show({
              severity: "success",
              summary: "Usuario registrado",
              detail: "Registro exitoso",
              life: 1000,
            });

            setTimeout(() => navigate("/"), 1110);
          } catch (error) {
            toast.current?.show({
              severity: "error",
              summary: "Error",
              detail: "No se pudo registrar el usuario.",
              life: 2500,
            });
            setLoading(false);
          }
        } else {
          // Si no está autenticado, podemos hacer algo o mostrar un mensaje
          console.log("El usuario no está autenticado.");
        }
        //}
      }
    };

    checkAuthAndRegister(); // Llamamos a la función asincrónica dentro de useEffect
  }, [autenUsuario]); // Este useEffect se ejecutará cada vez que autenUsuario cambie

  //  Validaciones antes de enviar
  const validateForm = () => {
    let newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    }
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son obligatorios.";
    }
    if (formData.telefono.toString().length !== 10) {
      newErrors.telefono = "El teléfono debe tener exactamente 10 dígitos.";
    }
    if (
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = "Ingrese un correo válido.";
    }
    /*
    console.log("Los usuarios que obtnego en la condidicional :", users);
    const emailExists = users.some((user) => user.email === formData.email);
    if (emailExists) {
      newErrors.genero = "El correo electrónico ya existe.";
    }
      */

    if (!formData.genero) {
      newErrors.genero = "Seleccione su género.";
    }
    if (!formData.rol) {
      newErrors.rol = "Seleccione su rol.";
    }
    if (!formData.nombreUsuario.trim() || formData.nombreUsuario.length <= 5) {
      newErrors.nombreUsuario = "El usuario debe tener más de 5 caracteres.";
    }

    if (formData.password.length <= 8) {
      newErrors.password = "La contraseña debe tener más de 8 caracteres.";
    }

    if (formData.password !== repetirCon) {
      newErrors.password = "Las contraseñas que ingresaste deben ser iguales.";
    }

    if (
      (claveJP.trim() === claveS.trim() && formData.rol === "jefepatio") ||
      (claveAd.trim() === claveS.trim() && formData.rol === "admin")
    ) {
      console.log("Se manda el rol: ", formData.rol);
    } else {
      newErrors.password = "La clave de seguridad no es válida.";
    }

    if (Object.keys(newErrors).length > 0) {
      //  **Mostrar el primer error con Toast**
      const firstErrorKey = Object.keys(newErrors)[0];
      toast.current?.show({
        severity: "error", // "warn" para advertencias, "error" para errores
        summary: "Verifique los datos",
        detail: newErrors[firstErrorKey],
        life: 3000,
      });
      setLoading(false);
      return false;
    }

    return true;
  };

  const validateFormAntesEnviarCorreo = () => {
    let newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    }
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son obligatorios.";
    }
    if (formData.telefono.toString().length !== 10) {
      newErrors.telefono = "El teléfono debe tener exactamente 10 dígitos.";
    }
    if (
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = "Ingrese un correo válido.";
    }
    /*
    console.log("Los usuarios que obtnego en la condidicional :", users);
    const emailExists = users.some((user) => user.email === formData.email);
    if (emailExists) {
      newErrors.genero = "El correo electrónico ya existe.";
    }
      */

    if (!formData.genero) {
      newErrors.genero = "Seleccione su género.";
    }
    if (!formData.rol) {
      newErrors.rol = "Seleccione su rol.";
    }
    if (!formData.nombreUsuario.trim() || formData.nombreUsuario.length <= 5) {
      newErrors.nombreUsuario = "El usuario debe tener más de 5 caracteres.";
    }

    if (formData.password.length <= 8) {
      newErrors.password = "La contraseña debe tener más de 8 caracteres.";
    }

    if (formData.password !== repetirCon) {
      newErrors.password = "Las contraseñas que ingresaste deben ser iguales.";
    }

    if (
      (claveJP.trim() === claveS.trim() && formData.rol === "jefepatio") ||
      (claveAd.trim() === claveS.trim() && formData.rol === "admin")
    ) {
      console.log("Se manda el rol: ", formData.rol);
    } else {
      newErrors.password = "La clave de seguridad no es válida.";
    }

    if (Object.keys(newErrors).length > 0) {
      //  **Mostrar el primer error con Toast**
      // const firstErrorKey = Object.keys(newErrors)[0];
      /*
      toast.current?.show({
        severity: "error", // "warn" para advertencias, "error" para errores
        summary: "Verifique los datos",
        detail: newErrors[firstErrorKey],
        life: 3000,
      });
      */
      setLoading(false);
      return false;
    }

    return true;
  };

  //  Validaciones antes de enviar
  const validateFormDos = () => {
    let newErrors: { [key: string]: string } = {};

    console.log("Los usuarios que obtnego en la condicional :", users);
    const emailExists = users.some(
      (user) => user.email === formData.email && user.nombreUsuario !== null
    );
    //const emailCo= users.find((user)=> user.email===formData.email && user.nombreUsuario!=="" );
    if (emailExists) {
      newErrors.genero = "El correo electrónico ya existe.";
    }
    console.log("Lo que obtengo si el usuario ya existe: ", emailExists);

    if (Object.keys(newErrors).length > 0) {
      //  **Mostrar el primer error con Toast**

      const firstErrorKey = Object.keys(newErrors)[0];
      toast.current?.show({
        severity: "error", // "warn" para advertencias, "error" para errores
        summary: "Verifique los datos",
        detail: newErrors[firstErrorKey],
        life: 5000,
      });

      setLoading(false);
      return false;
    }
    return true;
  };

  const handleVerifyEmail = async () => {
    // Si el correo no está en uso, validar autenticación
    await validarAutenticacion();
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
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
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Registrate
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¡Ingresa tus datos para registrarte!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Nombre<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Ingresa tu nombre"
                      onChange={handleChange}
                      value={formData.name}
                    />
                  </div>
                  {/* <!-- Last Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Apellidos<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="apellidos"
                      name="apellidos"
                      placeholder="Ingresa tus apellidos"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                {/* <!-- Email --> */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <Label>
                      Telefono<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      id="telefono"
                      name="telefono"
                      placeholder="Ingresa tu telefono"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Label>
                      Correo<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Ingresa tu correo"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <Label>
                      Género<span className="text-error-500">*</span>
                    </Label>
                    <select
                      id="genero"
                      name="genero"
                      className="w-full border rounded p-2"
                      onChange={handleChange}
                    >
                      <option value="">Selecciona tu género</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                  <div className="sm:col-span-1">
                    <Label>
                      Rol<span className="text-error-500">*</span>
                    </Label>
                    <select
                      id="rol"
                      name="rol"
                      className="w-full border rounded p-2"
                      onChange={handleChange}
                    >
                      <option value="">Selecciona tu rol</option>
                      <option value="jefepatio">Jefe de patio</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                {/* <!-- Password --> */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <Label>
                      Usuario<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="usuario"
                      name="nombreUsuario"
                      placeholder="Ingresa tu usuario"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <Label>
                      Ingresa la clave de seguridad
                      <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        name="claveSeguridad"
                        placeholder="Clave de seguridad"
                        type={showPasswordTres ? "text" : "password"}
                        onChange={handleChangeCS}
                        value={claveS}
                      />
                      <span
                        onClick={() => setShowPasswordTres(!showPasswordTres)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPasswordTres ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <Label>
                      Contraseña<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        name="password"
                        placeholder="Ingresa tu contraseña"
                        type={showPassword ? "text" : "password"}
                        onChange={handleChange}
                        value={formData.password}
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

                  <div className="sm:col-span-1">
                    <Label>
                      Contraseña<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        name="repetirPassword"
                        placeholder="Repite tu contraseña"
                        type={showPasswordDos ? "text" : "password"}
                        onChange={handleChangeRP}
                        value={repetirCon}
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
                </div>

                {/* <!-- Button --> */}

                <div>
                  <div className="card flex justify-content-center">
                    <Button
                      className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-green-600 shadow-theme-xs hover:bg-green-700"
                      severity="success"
                      label="Registrar"
                      onClick={async () => {
                        obtenerUsuarios();
                        setLoading(true); // Empieza el estado de carga
                        handleVerifyEmail(); // Llama a la función para verificar el correo
                      }}
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                ¿Ya estas registrado? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

