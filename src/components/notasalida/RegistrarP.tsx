import PageBreadcrumb from "../common/PageBreadCrumb";
import { useState, useRef } from "react";
import { InputNumber } from "primereact/inputnumber";
//import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import PageMeta from "../common/PageMeta";
import { DataTable, DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Column, ColumnEditorOptions } from "primereact/column";
import axios from "axios";

interface ProductoGuardado {
  id: number;
  precioUnitario: number;
  stockIdealPT: number;
  idUsuario: number;
  // Puedes agregar más campos según sea necesario
}

// Definir el tipo para las opciones de calidad
interface Calidad {
  name: string;
  code: string;
}
export default function RegistrarP() {
  const [visible, setVisible] = useState<boolean>(false);
  const toast = useRef<Toast>(null);
  const [productosRegistrados, setProductosRegistrados] = useState<any[]>([]);

  // Estados para las medidas del producto
  const [value1, setValue1] = useState<number | null>(null); // Grosor
  const [value2, setValue2] = useState<number | null>(null); // Ancho
  const [value3, setValue3] = useState<number | null>(null); // Largo
  const [value4, setValue4] = useState<number | null>(null); // Cantidad

  // Estado para la calidad seleccionada
  const [selectedCalidad, setSelectedCalidad] = useState<Calidad | null>(null);

  // Opciones de calidad
  const calidad: Calidad[] = [
    { name: "Primera", code: "Primera" },
    { name: "Segunda", code: "Segunda" },
    { name: "Tercera", code: "Tercera" },
    { name: "Cuarta", code: "Cuarta" },
    { name: "Quinta", code: "Quinta" },
    { name: "Tableta", code: "Tableta" },
    { name: "Polin", code: "Polin" },
    { name: "Vigueta", code: "Vigueta" },
    { name: "Plagado", code: "Plagado" },
  ];

  // Función para manejar la edición de una fila
  const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
    let _productos = [...productosRegistrados];
    let { newData, index } = e;

    // Recalcular piesTabla después de la edición
    _productos[index] = {
      ...newData,
      piesTabla: (
        (newData.ancho * newData.largo * newData.grosor * newData.cantidad) /
        12
      ).toFixed(0),
    };

    setProductosRegistrados(_productos);
  };
  // Editor para campos numéricos
  const numberEditor = (options: ColumnEditorOptions) => {
    return (
      <InputNumber
        value={options.value}
        onValueChange={(e) => options.editorCallback!(e.value)}
        min={1}
        style={{ width: "2rem", padding: "8px" }}
      />
    );
  };

  const calidadEditor = (options: ColumnEditorOptions) => {
    return (
      <Dropdown
        value={options.value}
        options={calidad}
        onChange={(e: DropdownChangeEvent) =>
          options.editorCallback!(e.value.name)
        }
        optionLabel="name"
      />
    );
  };

  // Editor para texto
  /*const textEditor = (options: ColumnEditorOptions) => {
        return (
            <InputText
                type="text"
                value={options.value}
                onChange={(e) => options.editorCallback!(e.target.value)}
            />
        );
    };*/

  const accept = () => {
    toast.current?.show({
      severity: "info",
      summary: "Confirmado",
      detail: "Se registraron los productos",
      life: 3000,
    });
  };

  const reject = () => {
    toast.current?.show({
      severity: "warn",
      summary: "Denegado",
      detail: "Realice los cambios necesarios ",
      life: 3000,
    });
  };

  const agregarProducto = async () => {
    if (
      value1 === null ||
      value2 === null ||
      value3 === null ||
      value4 === null ||
      !selectedCalidad
    ) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos Vacíos",
        detail:
          "Por favor, complete todos los campos antes de registrar el producto.",
        life: 3000,
      });
      return; // Salir de la función si hay campos vacíos
    }
    const nuevoProducto = {
      id: Date.now(), // Genera un identificador único basado en el tiempo
      grosor: value1,
      ancho: value2,
      largo: value3,
      cantidad: value4,
      calidad: selectedCalidad?.name,
    };
    // Para agregar un producto a la lista
    setProductosRegistrados([...productosRegistrados, nuevoProducto]);
    toast.current?.show({
      severity: "success",
      summary: "Producto Registrado",
      detail: "El producto ha sido agregado a la lista.",
      life: 3000,
    });

    // Limpiar los campos después de agregar o actualizar
    setValue1(null);
    setValue2(null);
    setValue3(null);
    setValue4(null);
    setSelectedCalidad(null);
  };

  const actionTemplate = (rowData: any) => {
    return (
      <>
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => eliminarProducto(rowData)}
        />
      </>
    );
  };

  const eliminarProducto = (producto: any) => {
    const productosRestantes = productosRegistrados.filter(
      (p) => p !== producto
    );
    setProductosRegistrados(productosRestantes);
    toast.current?.show({
      severity: "info",
      summary: "Producto Eliminado",
      detail: "El producto ha sido eliminado de la lista.",
      life: 3000,
    });
  };
  // Estado para almacenar el número de producción
  const [numeroProduccion] = useState<number>(() =>
    parseInt(localStorage.getItem("numeroProduccion") ?? "1", 10)
  );

  const registrarProductos = async () => {
    if (productosRegistrados.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Sin productos",
        detail: "No hay productos para registrar.",
        life: 3000,
      });
      return;
    }

    // Convertir cada producto en el formato que espera la API
    const productosARegistrar = productosRegistrados.map((producto) => ({
      precio: 0,
      calidad: producto.calidad,
      cantidad: producto.cantidad,
      ancho: producto.ancho,
      grosor: producto.grosor,
      largo: producto.largo,
      piesTabla: Number(
        (
          (producto.ancho *
            producto.largo *
            producto.grosor *
            producto.cantidad) /
          12
        ).toFixed(1)
      ),
      fechaRegistro: new Date().toISOString().split("T")[0],
      user_id: 1,
      identificadorP: numeroProduccion - 1,
    }));

    console.log("Enviando los siguientes productos:", productosARegistrar);

    try {
      const response = await axios.post(
        "https://api.uniecosanmateo.icu/api/products",
        { productos: productosARegistrar }, // Enviar como objeto con array de productos
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.status === 201) {
        console.log("Productos registrados correctamente");
        registrarInventario(response.data.productos);
        toast.current?.show({
          severity: "success",
          summary: "Registro exitoso",
          detail:
            "Todos los productos han sido registrados en la base de datos.",
          life: 3000,
        });

        setProductosRegistrados([]);
      }

    } catch (error) {
      console.error("Error en la solicitud:", error);

      toast.current?.show({
        severity: "error",
        summary: "Error al registrar",
        detail: "Hubo un problema al registrar los productos.",
        life: 3000,
      });
    }
  };

  const registrarInventario = async ( 
    productosGuardados: ProductoGuardado[]
  ) => {
    if (productosGuardados.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Sin productos",
        detail: "No hay productos a registrar.",
        life: 3000,
      });
      return;
    }

    // Convertir cada producto en el formato que espera la API para inventarios
    const inventariosARegistrar = productosGuardados.map((producto) => ({
      idProducto: producto.id, // Este campo contiene el id del producto registrado
      precioUnitario: 0, // precioUnitario
      stockIdealPT: 0, // stockideal
      idUsuario: 1,
    }));

    console.log("Enviando los siguientes inventarios:", inventariosARegistrar);

    try {
      const response = await axios.post(
        "https://api.uniecosanmateo.icu/api/productsInventory",
        { productos: inventariosARegistrar }, // Enviar como objeto con array de productos
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.status === 201) {
        console.log("Inventario de productos registrado correctamente");

        toast.current?.show({
          severity: "success",
          summary: "Registro exitoso",
          detail:
            "El inventario de productos se ha registrado satisfactoriamente.",
          life: 3000,
        });

        setProductosRegistrados([]); // Limpiar los productos registrados
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);

      toast.current?.show({
        severity: "error",
        summary: "Error al registrar",
        detail: "Hubo un problema al registrar los inventarios.",
        life: 3000,
      });
    }
  };

  return (
    <>
      <PageMeta
        title="Registrar Productos"
        description="Registrar los productos terminados"
      />
      <PageBreadcrumb pageTitle="Registar las medidas del producto" />

      <div className="card flex flex-wrap gap-3 p-fluid mt-2">
        <div className="flex-auto">
          <label htmlFor="stacked-buttons" className="font-bold block mb-2">
            Grosor
          </label>
          <div className="p-inputgroup flex-1">
            <span className="p-inputgroup-addon">
              <i className="pi pi-sort-amount-up"></i>
            </span>
            <InputNumber
              inputId="minmax-buttons"
              value={value1}
              onValueChange={(e) => setValue1(e.value ?? null)}
              minFractionDigits={2}
              maxFractionDigits={5}
              min={0}
              showButtons
            />
          </div>
        </div>

        <div className="flex-auto">
          <label htmlFor="minmax-buttons" className="font-bold block mb-2">
            Ancho
          </label>
          <div className="p-inputgroup flex-1">
            <span className="p-inputgroup-addon">
              <i className="pi pi-arrow-up-right-and-arrow-down-left-from-center"></i>
            </span>
            <InputNumber
              inputId="minmax-buttons"
              value={value2}
              onValueChange={(e) => setValue2(e.value ?? null)}
              minFractionDigits={2}
              maxFractionDigits={5}
              min={0}
              showButtons
            />
          </div>
        </div>

        <div className="flex-auto">
          <label htmlFor="horizontal-buttons" className="font-bold block mb-2">
            Largo
          </label>
          <div className="p-inputgroup flex-1">
            <span className="p-inputgroup-addon">
              <i className="pi pi-arrow-right-arrow-left"></i>
            </span>
            <InputNumber
              inputId="minmax-buttons"
              value={value3}
              onValueChange={(e) => setValue3(e.value ?? null)}
              minFractionDigits={2}
              maxFractionDigits={5}
              min={0}
              showButtons
            />
          </div>
        </div>
      </div>

      <div className="card flex flex-wrap gap-3 p-fluid">
        <div className="flex-auto">
          <label htmlFor="stacked-buttons" className="font-bold block mb-2">
            Calidad de la madera
          </label>
          <div className="p-inputgroup flex-1">
            <span className="p-inputgroup-addon">
              <i className="pi pi-star-fill"></i>
            </span>
            <Dropdown
              value={selectedCalidad}
              onChange={(e) => setSelectedCalidad(e.value)}
              options={calidad}
              optionLabel="name"
              placeholder="Seleccione la calidad de la madera"
              className="w-full md:w-100rem"
              checkmark={true}
              highlightOnSelect={false}
            />
          </div>
        </div>
        <div className="flex-auto">
          <label htmlFor="stacked-buttons" className="font-bold block mb-2">
            Ingresar la cantidad de madera
          </label>
          <div className="p-inputgroup flex-1">
            <span className="p-inputgroup-addon">
              <i className="pi pi-chart-bar"></i>
            </span>
            <InputNumber
              inputId="minmax-buttons"
              value={value4}
              onValueChange={(e) => setValue4(e.value ?? null)}
              mode="decimal"
              showButtons
              min={0}
              max={1000}
              minFractionDigits={0}
              maxFractionDigits={0}
            />
          </div>
        </div>
      </div>

      <div className="card flex flex-wrap gap-3 p-fluid mt-2">
        <div className="ml-auto">
          <Toast ref={toast} position="bottom-left" />
          <ConfirmDialog
            group="declarative"
            visible={visible}
            onHide={() => setVisible(false)}
            message="Se registrará el producto terminado"
            header="Confirmación"
            icon="pi pi-exclamation-triangle"
            accept={accept}
            reject={reject}
            acceptLabel="Sí"
            rejectLabel="No"
          />
          <div className="card flex justify-content-center mt-3">
            <Toast ref={toast} position="bottom-left" />
            <Button
              onClick={agregarProducto}
              icon="pi pi-check"
              label="Agregar"
              severity="success"
              rounded
            />
          </div>
        </div>
      </div>
      <div className="card">
        <DataTable
          value={productosRegistrados}
          editMode="row"
          dataKey="id"
          onRowEditComplete={onRowEditComplete}
          size="small"
          paginator
          rows={3}
          rowsPerPageOptions={[3, 6]}
          header="Productos Registrados"
        >
          <Column
            field="cantidad"
            header="Cantidad"
            editor={(options) => numberEditor(options)}
          />

          <Column
            field="grosor"
            header="Grosor"
            editor={(options) => numberEditor(options)}
          />
          <Column
            field="ancho"
            header="Ancho"
            editor={(options) => numberEditor(options)}
          />
          <Column
            field="largo"
            header="Largo"
            editor={(options) => numberEditor(options)}
          />
          <Column
            field="calidad"
            header="Calidad"
            editor={(options) => calidadEditor(options)}
          />
          <Column
            header="Pies/Tabla"
            body={(rowData) => {
              // Realiza el cálculo
              const piesPorTabla =
                (rowData.ancho *
                  rowData.largo *
                  rowData.grosor *
                  rowData.cantidad) /
                12;
              return piesPorTabla.toFixed(0); // Limitar a dos decimales
            }}
          />
          <Column rowEditor header="Editar" bodyStyle={{ textAlign: "left" }} />
          <Column body={actionTemplate} header="Eliminar" />
        </DataTable>
      </div>
      <div className="card flex justify-end mt-5">
        <Button
          onClick={registrarProductos}
          icon="pi pi-cloud-upload"
          label="Registrar"
          severity="success"
          rounded
        />
      </div>
    </>
  );
}
