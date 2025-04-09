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
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";

export default function HistorialP() {
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

  //const dt = useRef(null);
  const toast = useRef<Toast>(null); // Tipar la referencia del Toast
  //const [acceso, setAcceso] = useState<string | null>();
  // Estados para almacenar los productos y productos seleccionados
  const [products, setProducts] = useState<Product[]>([]);
  // Estado para almacenar el número de producción
  const [numeroProduccion, setNumeroProduccion] = useState<number>(0);
  // Estado para la fase seleccionada

  //obtener el número de producción en la que va

  // Función para recargar los datos de la API
  const recargarMateriaPrima = async () => {
    try {
      const response = await axios.get<Product[]>(
        "https://api.uniecosanmateo.icu/api/rawMaterials"
      );
      const identificadorMa = response.data.reduce((max, current) => {
        return current.identificadorP > max.identificadorP ? current : max;
      }, response.data[0]);
      console.log(
        "Numero de produccion en la que va: ",
        identificadorMa.identificadorP + 1
      );
      setProducts(response.data);
      setNumeroProduccion(identificadorMa.identificadorP + 1);
    } catch (error) {
      console.error("Error al obtener los productos", error);
    }
  };

  // Actualizar el progreso cuando se selecciona una fase

  const actionTemplate = (rowData: any) => {
    return (
      <>
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-warn"
          // onClick={() => eliminarProducto(rowData)}
        />
      </>
    );
  };

  return (
    <div className="container mx-auto p-2">
      <Toast ref={toast} position="bottom-left" />

      <PageMeta
        title="Historial de producción"
        description="Visualización del historial de producción"
      />
      <PageBreadcrumb pageTitle="Historial de Producción" />

      <div className="mt-2 p-2 block bg-primary font-bold text-center p-1 border-round mb-1">
        <h2>HISTORIAL DE LA PRODUCCION TERMINADA </h2>
      </div>

      <div className="flex flex-wrap gap-10 justify-center mt-5">
        <div className="flex flex-row">
          <div className="rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 basis-1/2 m-5 ">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-sm dark:bg-gray-800">
              <i className="pi pi-box" style={{ color: "slateblue" }}></i>
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Coeficiente de producción reciente
                </span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {30}
                </h4>
              </div>
              <Badge color="success">
                <ArrowUpIcon />%
              </Badge>
            </div>
          </div>

          <div className="card flex flex-wrap justify-content-center gap-2 m-5">
            <Tag severity="success" value=">50% eficiente"></Tag>
            <Tag severity="warning" value="49% riesgo"></Tag>
            <Tag severity="danger" value="<48% alto riesgo"></Tag>
          </div>
        </div>
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
            field="piesTB"
            header="Pies tabla total producción"
            style={{ width: "20%" }}
          ></Column>
          <Column
            field="mct"
            header="Metros cúbicos totales"
            style={{ width: "20%" }}
            body={(rowData) => `${rowData.diametroUno} cm`}
          ></Column>
          <Column
            field="coeficienteP"
            header="Coeficiente de producción"
            style={{ width: "20%" }}
            body={(rowData) => `${rowData.diametroDos} cm`}
          ></Column>
          <Column
            field="fecha"
            header="Fecha finalizacion"
            style={{ width: "20%" }}
            body={(rowData) => `${rowData.largo} cm`}
          ></Column>
          <Column body={actionTemplate} header="Editar" />
        </DataTable>
        <ConfirmDialog group="templating" />
      </div>
    </div>
  );
}
