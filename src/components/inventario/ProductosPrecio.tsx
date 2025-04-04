import PageBreadcrumb from "../common/PageBreadCrumb";
import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import axios from "axios";
import PageMeta from "../common/PageMeta";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon } from "../../icons";
import { Button } from "primereact/button";

export default function ProductosPrecio() {
  // Definir el tipo para los productos
  interface Product {
    id: number;
    precio: number;
    calidad: string;
    cantidad: number;
    ancho: number;
    grosor: number;
    largo: number;
    piesTabla: number;
    identificadorP: number;
  }
  interface Product1 {
    id: number;
    idProducto: number;
    precioUnitario: number;
    stockIdealPT: number;
    idUsuario: number;
  }
  //const dt = useRef(null);
  const toast = useRef<Toast>(null); // Tipar la referencia del Toast
  //const [acceso, setAcceso] = useState<string | null>();
  // Estados para almacenar los productos y productos seleccionados
  const [products, setProducts] = useState<Product[]>([]);
  const [products1, setProducts1] = useState<Product1[]>([]);
  const [cantidadMP, setCantidadMP] = useState<Number>(
    Number(localStorage.getItem("cantidadArreglo"))
  );

  // useEffect para recargar el numero de produccion
  useEffect(() => {
    //recargarProductos();
    recargarInventario();
  }, [products1]);

  //cambiara cuando la cantidad cambie
  useEffect(() => {
    localStorage.setItem("cantidadArreglo", String(cantidadMP));
  }, [cantidadMP]); // Solo se ejecutara cuando la cantidad cambie

  // Función para recargar los datos de la API
  /*
  const recargarProductos = async () => {
     try {
        const response = await axios.get<Product[]>(
          "http://localhost:8000/api/products"
        );
        setProducts(response.data);      
    } catch (error) {
      console.error("Error al obtener los productos", error);
    }
  };
  */

  // Función para recargar los datos de la API
  const recargarInventario = async () => {
    try {
      const response = await axios.get<Product1[]>(
        "https://api.uniecosanmateo.icu/api/productsInventory"
      );
      setProducts1(response.data);
    } catch (error) {
      console.error("Error al obtener los productos", error);
    }
  };

  // Mostrar el modal de confirmación
  const showTemplate = () => {
    confirmDialog({
      group: "templating",
      header: "Confirmación",
      message: (
        <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
          <i className="pi pi-exclamation-circle text-6xl text-primary-500"></i>
          <span>¿Desea terminar la producción de los rollos de madera?</span>
        </div>
      ),
      acceptLabel: "Si",
      accept: () => {
        if (products?.length) {
          actualizarFecha();

          console.log("Entro a si");
          toast.current?.show({
            severity: "success",
            summary: "Aceptado",
            detail: "Producción terminada.",
            life: 3000,
          });
        } else {
          toast.current?.show({
            severity: "error",
            summary: "Denegado",
            detail: "No hay productos para exportar.",
            life: 3000,
          });
          console.log("Entro a no");
        }
      },
      reject,
    });
  };

  const actualizarFecha = async () => {
    // Obtener la fecha actual
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toLocaleString("sv-SE");
    setCantidadMP(0);
    setProducts([]);

    try {
      const updatedProducts = products.map((product) => ({
        ...product,
        updated_at: fechaFormateada,
      }));

      await axios.put(
        "https://api.uniecosanmateo.icu/api/rawMaterial/identificadorP",
        updatedProducts
      );
      console.log("Productos actualizados en la API");

      setProducts([]);
      localStorage.removeItem("cantidadArreglo"); // <--- Limpia aquí
      localStorage.removeItem("pasarT"); // <--- Limpia aquí
    } catch (error) {
      console.error("Error al actualizar la fecha", error);
    }
  };

  interface Product {
    [key: string]: string | number; // Esto permite que se puedan tener propiedades dinámicas
  }

  // Función de rechazo del modal
  const reject = () => {
    toast.current?.show({
      severity: "error",
      summary: "Denegado",
      detail: "Operación cancelada",
      life: 3000,
    });
  };
  const totalPiezas = products.length;
  const volumen = products.reduce(
    (total, product) => total + product.piesTabla,
    2
  );

  return (
    <div className="container mx-auto p-2">
      <Toast ref={toast} position="bottom-left" />

      <PageMeta
        title="Asignar Precio"
        description="Asignar el precio del producto"
      />
      <PageBreadcrumb pageTitle="Productos terminados" />

      <div className="flex flex-wrap gap-10 justify-center">
        <div className="flex-auto">
          <label htmlFor="stacked-buttons" className="font-bold block mb-2">
            Asigna los precios de los productos
          </label>
        </div>

        <div className="flex flex-row">
          <div className="rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 basis-1/2 ">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-sm dark:bg-gray-800">
              <i className="pi pi-box" style={{ color: "slateblue" }}></i>
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Pies Tabla Total
                </span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {volumen.toFixed(2)}
                </h4>
              </div>
              <Badge color="success">
                <ArrowUpIcon />
                m3
              </Badge>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 basis-1/2 ml-1">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-sm dark:bg-gray-800">
              <i className="pi pi-bars" style={{ color: "slateblue" }}></i>
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Piezas Totales
                </span>
                <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {totalPiezas}
                </h4>
              </div>
              <Badge color="success">
                <ArrowUpIcon />
                piezas
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 p-2 block bg-primary font-bold text-center p-1 border-round mb-1">
        <h2>PRODUCTOS TERMINADOS CON PRECIO</h2>
      </div>

      {/* DataTable para mostrar los productos disponibles */}
      <div className="card">
        <DataTable
          value={products1}
          size="small"
          paginator
          rows={3}
          rowsPerPageOptions={[3, 6, 9, 12]}
          tableStyle={{ minWidth: "10rem" }}
          dataKey="id"
          emptyMessage="No hay productos para mostrar."
        >
          <Column
            field="precioUnitario"
            header="Precio unitario"
            style={{ width: "10%" }}
            body={(rowData) => `$ ${rowData.precioUnitario}`}
          ></Column>
          <Column
            field="calidad"
            header="Calidad"
            style={{ width: "10%" }}
            body={(rowData) =>
              rowData.product ? rowData.product.calidad : "N/A"
            }
          ></Column>
          <Column
            field="cantidad"
            header="Cantidad"
            style={{ width: "10%" }}
            body={(rowData) =>
              rowData.product ? rowData.product.cantidad : "N/A"
            }
          ></Column>
          <Column
            field="ancho"
            header="Ancho"
            style={{ width: "10%" }}
            body={(rowData) =>
              rowData.product ? rowData.product.ancho : "N/A"
            }
          ></Column>
          <Column
            field="grosor"
            header="Grosor"
            style={{ width: "10%" }}
            body={(rowData) =>
              rowData.product ? rowData.product.grosor : "N/A"
            }
          ></Column>
          <Column
            field="largo"
            header="Largo"
            style={{ width: "10%" }}
            body={(rowData) =>
              rowData.product ? rowData.product.largo : "N/A"
            }
          ></Column>
          <Column
            field="piestabla"
            header="Pies Tabla"
            style={{ width: "10%" }}
            body={(rowData) =>
              rowData.product ? rowData.product.piesTabla : "N/A"
            }
          ></Column>

          <Column
            field="stockIdealPT"
            header="Stock Ideal"
            style={{ width: "10%" }}
            body={(rowData) =>
              rowData.product ? rowData.stockIdealPT: "N/A"
            }
          ></Column>
        </DataTable>
        <ConfirmDialog group="templating" />

        <div className="card flex justify-end mt-5">
          <Button
            label="Registrar produccion"
            onClick={showTemplate}
            className="p-button-success mt-3"
          />
        </div>
      </div>
    </div>
  );
}
