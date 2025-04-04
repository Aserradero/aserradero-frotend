import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const InactivityLogout: React.FC = () => {
  const [timer, setTimer] = useState<number | null>(null); // Cambiar a 'number' para navegador
  const navigate = useNavigate();

  // Definir el tiempo de inactividad (por ejemplo, 5 minutos = 300000 ms)
  const INACTIVITY_TIMEOUT = 300000;

  const resetTimer = () => {
    // Limpiar el timer anterior
    if (timer !== null) {
      clearTimeout(timer);
    }
    // Establecer un nuevo timer
    const newTimer = window.setTimeout(logoutUser, INACTIVITY_TIMEOUT); // Cambiar a window.setTimeout
    setTimer(newTimer);
  };

  const logoutUser = () => {
    // Redirigir al usuario a la ruta '/home' tras inactividad
    navigate("/");
  };

  useEffect(() => {
    // Registrar los eventos de actividad
    const events: string[] = [
      "mousemove",
      "keydown",
      "click",
      "touchstart",
      "touchmove",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Iniciar el temporizador cuando el componente se monte
    resetTimer();

    // Limpiar los eventos cuando el componente se desmonte
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [timer, navigate]);

  return null; // No se muestra contenido, solo maneja la lógica
};

export default InactivityLogout;
