import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";


const useIdleLogout = (timeout: number = 300000) => { // 5 minutos (300000 ms)
    const navigate = useNavigate();

    useEffect(() => {
        let logoutTimer: ReturnType<typeof setTimeout>;

        // Función para cerrar sesión
        const handleLogout = async () => {
            const token = localStorage.getItem("token"); // Obtener el token antes de eliminarlo
            console.log("el token es: ", token);

            try {
                await axios.post(
                    "https://api.uniecosanmateo.icu/api/logout",
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Incluye el token en la petición
                            Accept: "application/json",
                        },
                    }
                );

                console.log("Logout exitoso");
                // Eliminar token y usuario después de un logout exitoso
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/"); // Redirigir al home
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
            }
        };

        // Reiniciar el temporizador de inactividad
        const resetTimer = () => {
            clearTimeout(logoutTimer);
            logoutTimer = setTimeout(handleLogout, timeout); // Reiniciar temporizador
        };

        // Eventos que detectan actividad
        const activityEvents: string[] = [
            'mousemove',   // Movimiento del ratón (PC)
            'mousedown',   // Click del ratón (PC)
            'keypress',    // Presión de una tecla (PC/Móviles con teclado físico)
            'scroll',      // Desplazamiento en la página (PC/Móvil)
            'touchstart',  // Cuando el usuario toca la pantalla (Móvil/Tablet)
            'touchmove',   // Cuando el usuario desliza el dedo (Móvil/Tablet)
            'touchend',    // Cuando el usuario suelta el dedo (Móvil/Tablet)
            'click',       // Click o toque (PC/Móvil)
            'resize'       // Cambio de tamaño (como rotación de pantalla en móviles)
        ];
        // Agregar eventos para detectar actividad
        activityEvents.forEach((event) =>
            window.addEventListener(event, resetTimer)
        );

        // Iniciar el temporizador por primera vez
        resetTimer();

        // Limpiar los eventos al desmontar el componente
        return () => {
            clearTimeout(logoutTimer);
            activityEvents.forEach((event) =>
                window.removeEventListener(event, resetTimer)
            );
        };
    }, [navigate, timeout]);
};

export default useIdleLogout;
