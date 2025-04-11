import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import PageMeta from "../../components/common/PageMeta";

export default function NotaSalida() {
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
  const dt = useRef<DataTable<any> | null>(null);
  //const dt = useRef(null);
  //const dt = useRef< DataTable<Product[]> | []>; // Tipar la referencia del DataTable
  const toast = useRef<Toast>(null); // Tipar la referencia del Toast

  // Estados para almacenar los productos y productos seleccionados
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Estado para almacenar el número de producción
  const [numeroProduccion, setNumeroProduccion] = useState<number>(0);
  const [valor, setValor] = useState<string | undefined>(undefined);

  // Para asegurar que `acceso` es un string y no undefined
  const acceso: string = valor ?? 'Valor predeterminado';
  // useEffect para guardar el número de producción en localStorage
  useEffect(() => {
    recargarMateriaPrima();
  }, [numeroProduccion]);

  // Función para recargar los datos de la API
  const recargarMateriaPrima = async () => {
    try {
      const response = await axios.get<Product[]>(
        "https://api.uniecosanmateo.icu/api/rawMaterials"
      );
      const identificadorMa=response.data.reduce((max,current)=>{return (current.identificadorP>max.identificadorP)?current:max;},response.data[0]);
      console.log("Numero de produccion en la que va: ",identificadorMa.identificadorP+1);
      setProducts(response.data);
      setNumeroProduccion(identificadorMa.identificadorP+1);
    } catch (error) {
      console.error("Error al obtener los productos", error);
    }
  };


  //cambiara cuando acceso cambie
  useEffect(() => {
    localStorage.setItem("pasarT", acceso);
  }, [acceso]); // Solo se ejecutará cuando `acceso` cambie

  // Mostrar el modal de confirmación
  const showTemplate = () => {
    confirmDialog({
      group: "templating",
      header: "Confirmación",
      message: (
        <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
          <i className="pi pi-exclamation-circle text-6xl text-primary-500"></i>
          <span>¿Desea mandar a producción los rollos de madera?</span>
        </div>
      ),
      acceptLabel: "Si",
      accept: () => {
        if (selectedProducts?.length) {
          exportPdf();
          setNumeroProduccion(numeroProduccion + 1);
          cambiarEstadoMateriaPrimaUtilizada();
          setSelectedProducts([]);
          setValor("acceso");
        } else {
          toast.current?.show({
            severity: "error",
            summary: "Denegado",
            detail: "No hay materias primas para exportar.",
            life: 3000,
          });
        }
      },
      reject,
    });
  };

  // Función para cambiar el estado de los productos seleccionados
  const cambiarEstadoMateriaPrimaUtilizada = async () => {
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toLocaleString("sv-SE");
    if (selectedProducts && selectedProducts.length > 0) {
      try {
        const updatedProducts = selectedProducts.map((product) => ({
          ...product,
          identificadorP: numeroProduccion,
          updated_at: fechaFormateada,
        }));

        await axios.put(
          "https://api.uniecosanmateo.icu/api/rawMaterial/identificadorP",
          updatedProducts
        );
        console.log("Materias primas actualizadas en la API");
        await recargarMateriaPrima();
      } catch (error) {
        console.error("Error actualizando:", error);
      }
    }
  };

  // Función para exportar a PDF
  // Definir los tipos de las columnas que estás utilizando
  interface Column {
    title: string;
    dataKey: string;
  }

  interface Product {
    [key: string]: string | number; // Esto permite que se puedan tener propiedades dinámicas
  }

  const exportPdf = async (): Promise<void> => {
    const doc = new jsPDF();

    // URL de la imagen dentro de `public/img/`
    const imageUrl: string = `${window.location.origin}/images/logo.png`;

    // Función para convertir la imagen a Base64
    const toBase64 = async (url: string): Promise<string> => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string); // Se asegura que sea string
        reader.readAsDataURL(blob);
      });
    };

    // Esperar a que la imagen se convierta en Base64
    const logoBase64: string = await toBase64(imageUrl);

    // Función para agregar el encabezado
    const addHeader = (doc: jsPDF): void => {
      doc.addImage(logoBase64, "PNG", 10, 10, 30, 30); // (x, y, width, height)
      doc.setFont("times"); // Cambié la fuente a Arial
      doc.setFontSize(15);
      doc.text(
        "Unidad Económica Especializada de Aprovechamiento Forestal",
        50,
        20
      );
      doc.text("Comunal San Mateo", 95, 35);

      doc.setDrawColor(0, 128, 0); // Verde oscuro
      doc.setLineWidth(0.5);
      doc.line(10, 43, 200, 43);
    };

    // Crear un nuevo documento
    addHeader(doc);

    doc.setFontSize(14);
    doc.text("Lista de materia prima que se mandará a producción.", 10, 55);
    doc.text("Fecha: ", 10, 65);
    doc.text("Usuario: ", 10, 70);
    doc.text("Volumen total: ", 10, 75);
    doc.text("Total de piezas: ", 10, 80);

    // Aquí deberías definir `exportColumns` y `selectedProducts` correctamente.
    const exportColumns: Column[] = [
      { title: "Diametro 1", dataKey: "diametroUno" },
      { title: "Diametro 2", dataKey: "diametroDos" },
      { title: "Largo", dataKey: "largo" },
      { title: "Volumen", dataKey: "metroCR" },
    ];

    //Pasar los producto seleccionados
    const selectedProductsA = selectedProducts;
    //Poner en donde empezara a dibujarse la tabla
    let currentY = 90;

    // Agregando la tabla con `autoTable`
    autoTable(doc, {
      startY: currentY, // La posición Y de inicio de la tabla
      head: [exportColumns.map((col) => col.title)], // Cabeceras de la tabla
      body: selectedProductsA.map((row) =>
        exportColumns.map((col) => {
          if (
            col.dataKey === "diametroUno" ||
            col.dataKey === "diametroDos" ||
            col.dataKey === "largo"
          ) {
            return `${row[col.dataKey as keyof Product]} cm`; // Acceso más seguro con `keyof`
          } else if (col.dataKey === "metroCR") {
            return `${row[col.dataKey as keyof Product]} m³`; // Acceso más seguro con `keyof`
          }
          return row[col.dataKey as keyof Product] || ""; // Para otros campos, deja el valor normal
        })
      ),
      headStyles: {
        fillColor: [0, 128, 0], // Verde oscuro en el fondo de los encabezados
        textColor: [255, 255, 255], // Texto blanco en los encabezados
        fontStyle: "bold", // Texto en negrita
      },
      didDrawPage: () => {},
    });

    // Guardar el PDF
    doc.save("products.pdf");
  };
  // Función de rechazo del modal
  const reject = () => {
    toast.current?.show({
      severity: "error",
      summary: "Denegado",
      detail: "Operación cancelada",
      life: 3000,
    });
  };

  return (
    <div className="container mx-auto p-2">
      <PageMeta
        title="Nota Salida"
        description="Genera la nota de salida de la materia prima"
      />
      <PageBreadcrumb pageTitle="Nota Salida" />

      <div className="block bg-primary font-bold text-center p-1 border-round mb-1">
        <h2>MATERIA PRIMA DISPONIBLE</h2>
      </div>

      {/* DataTable para mostrar los productos disponibles */}
      <div className="card">
        <DataTable
          value={products.filter((product) => product.identificadorP === 0)}
          size="small"
          paginator
          rows={3}
          rowsPerPageOptions={[3, 6, 9, 12]}
          tableStyle={{ minWidth: "10rem" }}
          selectionMode="multiple"
          selection={selectedProducts}
          onSelectionChange={(e) => setSelectedProducts(e.value)}
          dataKey="id"
          emptyMessage="No hay datos para mostrar."
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "1rem" }}
          ></Column>
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
      </div>

      <div className="block bg-primary font-bold text-center p-1 border-round mb-1">
        <h2>SELECCIONASTE</h2>
      </div>

      <div className="card">
        <Tooltip target=".export-buttons>button" position="bottom" />
        <Toast ref={toast} position="bottom-left" />
        <DataTable
          ref={dt}
          value={selectedProducts}
          size="small"
          paginator
          rows={3}
          rowsPerPageOptions={[3, 6, 9, 12]}
          tableStyle={{ minWidth: "10rem" }}
          selectionMode="multiple"
          selection={selectedProducts}
          emptyMessage="No se seleccionó matería prima."
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
      </div>

      {/* Toast y ConfirmDialog para mostrar mensajes y el modal */}
      <ConfirmDialog group="templating" />

      {/* Visualizar el número de producción */}
      <div className="flex justify-end flex-wrap">
        <InputText
          id="numeroP"
          aria-describedby="username-help"
          value={String(numeroProduccion)}
          onChange={(e) => setNumeroProduccion(Number(e.target.value))}
          disabled={true}
          className="m-2"
        />

        <Button
          type="button"
          icon="pi pi-file-pdf"
          severity="success"
          rounded
          onClick={showTemplate}
          data-pr-tooltip="PDF"
          label="Generar nota"
        />
        {/* <Button label="Reiniciar" icon="pi pi-refresh" severity="warning" onClick={() => setNumeroProduccion(0)} />*/}
      </div>
    </div>
  );
}
