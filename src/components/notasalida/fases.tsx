import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import axios from "axios";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon } from "../../icons";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";


export default function Fases() {
  // Definir el tipo para los productos
  interface Product {
    id: number;
    cantidad: number;
    diametroUno: number;
    diametroDos: number;
    largo: number;
    metroCR: number;
    calidad: string;
    identificadorP: number;
  }
  interface Fase {
    name: string;
    code: string;
  }
  //const dt = useRef(null);
  const toast = useRef<Toast>(null); // Tipar la referencia del Toast
  //const [acceso, setAcceso] = useState<string | null>();
  // Estados para almacenar los productos y productos seleccionados
  const [products, setProducts] = useState<Product[]>([]);
  // Estado para almacenar el número de producción
  const [numeroProduccion, setNumeroProduccion] = useState<number>(0);
  // Estado para la fase seleccionada
  const [selectedFase, setSelectedFase] = useState<Fase | null>(null);
  const [value, setValue] = useState<number>(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
  const [isUpdated, setIsUpdated] = useState(false);
  const faseProgreso: { [key: string]: number } = {
    "En espera de procesamiento": 0,
    "En aserrado": 20,
    Desorrillado: 40,
    "En cabezado de madera": 60,
    "En clasificacion y almacenamiento": 80,
    "Produccion finalizada": 100,
  };
  const [cantidadMP, setCantidadMP] = useState<Number>(
    Number(localStorage.getItem("cantidadArreglo"))
  );

  // Actualizar el progreso cuando se selecciona una fase
  useEffect(() => {
    if (selectedFase) {
      const newValue = faseProgreso[selectedFase.name];
      setValue(newValue);

      // Habilitar el botón cuando el progreso llega a 100%
      if (newValue === 100) {
        setIsButtonDisabled(false);
      } else {
        setIsButtonDisabled(true);
      }
    }
  }, [selectedFase]);

  // Opciones de calidad
  const calidad: Fase[] = [
    { name: "En espera de procesamiento", code: "En espera de procesamiento" },
    { name: "En aserrado", code: "En aserrado" },
    { name: "Desorrillado", code: "Desorillado" },
    { name: "En cabezado de madera", code: "En cabezado de madera" },
    { name: "En clasificacion y almacenamiento",
      code: "En clasificacion y almacenamiento",
    },
    { name: "Produccion finalizada", code: "Produccion finalizada" },
  ];

  // useEffect para recargar el numero de produccion
  useEffect(() => {
    recargarMateriaPrima();
    console.log(
      "Numero de produccion que se mostrara en la tabla de acuerdo a los productos: ",
      numeroProduccion
    );
  }, [numeroProduccion]);

  //cambiara cuando la cantidad cambie
  useEffect(() => {
    localStorage.setItem("cantidadArreglo", String(cantidadMP));
  }, [cantidadMP]); // Solo se ejecutara cuando la cantidad cambie

  // Función para recargar los datos de la API
  const recargarMateriaPrima = async () => {
    if (isUpdated) return;
    try {
      const accesoLocal = localStorage.getItem("pasarT");
      console.log("Se esta mostrando en el condicional: ", accesoLocal);
      setCantidadMP(
        products.filter(
          (product) => product.identificadorP === numeroProduccion
        ).length
      );

      if (
        (numeroProduccion == 0 && accesoLocal == "acceso") ||
        cantidadMP != 0
      ) {
        const response = await axios.get<Product[]>(
          "https://api.uniecosanmateo.icu/api/rawMaterials"
        );
        setProducts(response.data);
        const identificadorMa = response.data.reduce((max, current) => {
          return current.identificadorP > max.identificadorP ? current : max;
        }, response.data[0]);
        console.log(
          "Fase de produccion en la que esta la fase: ",
          identificadorMa.identificadorP
        );

        setNumeroProduccion(identificadorMa.identificadorP);
      }
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
          //setCantidadMP(-1);
          console.log(
            "Una vez terminada la produccion y seleccionado el boton el numero es: ",
            numeroProduccion
          );
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
      const updatedProducts = products
        .filter((product) => product.identificadorP === numeroProduccion)
        .map((product) => ({
          ...product,
          identificadorP: numeroProduccion,
          updated_at: fechaFormateada,
        }));

      await axios.put(
        "https://api.uniecosanmateo.icu/api/rawMaterial/identificadorP",
        updatedProducts
      );
      console.log("Productos actualizados en la API");
      setIsUpdated(true); // Marcar que la actualización se completó

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
  const totalPiezas = products.filter(
    (product) => product.identificadorP === numeroProduccion
  ).length;
  const volumen = products
    .filter((product) => product.identificadorP === numeroProduccion)
    .reduce((total, product) => total + product.metroCR, 0);

  return (
    <div className="container mx-auto p-2">
      <Toast ref={toast} position="bottom-left" />

      <PageMeta
        title="Fases de produccion"
        description="Cambia las fases de produccion"
      />
      <PageBreadcrumb pageTitle="Fases de produccion" />

      <div className="flex flex-wrap gap-10 justify-center">
        <div className="flex-auto">
          <label htmlFor="stacked-buttons" className="font-bold block mb-2">
            Selecciona la fase de los rollos de madera
          </label>
          <div className="p-inputgroup flex-1">
            <span className="p-inputgroup-addon">
              <i className="pi pi-spin pi-cog"></i>
            </span>
            <Dropdown
              value={selectedFase}
              onChange={(e) => setSelectedFase(e.value)}
              options={calidad}
              optionLabel="name"
              placeholder="Seleccione la fase"
              className="w-full md:w-100rem"
              checkmark={true}
              highlightOnSelect={false}
            />
          </div>
          <p className="mt-4">Progreso</p>
          <ProgressBar className="mt-2" value={value}></ProgressBar>
        </div>

        <div className="flex flex-row">
          <div className="rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 basis-1/2 ">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-sm dark:bg-gray-800">
              <i className="pi pi-box" style={{ color: "slateblue" }}></i>
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Volumen Total
                </span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {volumen.toFixed(1)}
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
        <h2>ENTRADA DE MATERIA PRIMA A PRODUCCION </h2>
      </div>

      {/* DataTable para mostrar los productos disponibles */}
      <div className="card">
        <DataTable
          value={products.filter(
            (product) => product.identificadorP === numeroProduccion
          )}
          size="small"
          paginator
          rows={3}
          rowsPerPageOptions={[3, 6]}
          tableStyle={{ minWidth: "10rem" }}
          emptyMessage="No hay materia prima para mostrar."
        >
          <Column
            field="calidad"
            header="Calidad"
            style={{ width: "20%" }}
          ></Column>
          <Column
            field="diametroUno"
            header="Diametro 1"
            style={{ width: "20%" }}
            body={(rowData) => `${rowData.diametroUno} cm`}
            
          ></Column>
          <Column
            field="diametroDos"
            header="Diametro 2"
            style={{ width: "20%" }}
            body={(rowData) => `${rowData.diametroDos} cm`}
          ></Column>
          <Column
            field="largo"
            header="Largo"
            style={{ width: "20%" }}
            body={(rowData) => `${rowData.largo} cm`}
          ></Column>
          <Column
            field="metroCR"
            header="Metro cúbico"
            style={{ width: "20%" }}
            body={(rowData) => `${rowData.metroCR} m³`}
          ></Column>
        </DataTable>
        <ConfirmDialog group="templating" />

        <div className="card flex justify-end mt-5">
          <Button
            label="Registrar produccion"
            disabled={isButtonDisabled}
            onClick={showTemplate}
            className="p-button-success mt-3"
          />
        </div>
      </div>
    </div>
  );
}
