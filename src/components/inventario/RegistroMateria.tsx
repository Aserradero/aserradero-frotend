import PageBreadcrumb from "../common/PageBreadCrumb";
import { useState, useRef } from "react";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import PageMeta from "../common/PageMeta";
import { DataTable, DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Column, ColumnEditorOptions } from "primereact/column";
import axios from "axios";

// Definir el tipo para las opciones de calidad
interface Calidad {
  name: string;
  code: string;
}
interface ProductoGuardado {
  id: number;
  precioUnitario: number;
  stockIdealPT: number;
  idUsuario: number;
  // Puedes agregar más campos según sea necesario
}
export default function RegistroMateria() {
  const [visible, setVisible] = useState<boolean>(false);
  const toast = useRef<Toast>(null);
  const [productosRegistrados, setProductosRegistrados] = useState<any[]>([]);

  // Estados para las medidas del producto
  const [value1, setValue1] = useState<number | null>(null); // Diametro1
  const [value2, setValue2] = useState<number | null>(null); // Diametro2
  const [value3, setValue3] = useState<number | null>(null); // Largo
  //const [value4, setValue4] = useState<number | null>(null);  // Cantidad

  // Estado para la calidad seleccionada
  const [selectedCalidad, setSelectedCalidad] = useState<Calidad | null>(null);

  // Obtener el valor almacenado en localStorage
  const userData = localStorage.getItem("user"); // Puede ser un string o null

  // Verificar si el valor no es null y luego parsearlo
  if (userData) {
    const user = JSON.parse(userData); // Convertir el string JSON en un objeto
    const userID = user.id;
    console.log(userID); // Ahora puedes usar el objeto `user`
  } else {
    console.log("No user data found.");
  }

  // Opciones de calidad
  const calidad: Calidad[] = [
    { name: "Primera", code: "Primera" },
    { name: "Segunda", code: "Segunda" },
    { name: "Tercera", code: "Tercera" },
  ];

  // Función para manejar la edición de una fila
  const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
    let _productos = [...productosRegistrados];
    let { newData, index } = e;

    // Recalcular piesTabla después de la edición
    _productos[index] = {
      ...newData,
      metroCR: (
        (((newData.diametroUno + newData.diametroDos) / 2) *
          ((newData.diametroUno + newData.diametroDos) / 2) *
          newData.largo *
          0.7854) /
        10
      ).toFixed(2),
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
      !selectedCalidad
    ) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos Vacíos",
        detail:
          "Por favor, complete todos los campos antes de registrar la materia prima.",
        life: 3000,
      });
      return; // Salir de la función si hay campos vacíos
    }
    const nuevoProducto = {
      id: Date.now(), // Genera un identificador único basado en el tiempo
      diametroUno: value1,
      diametroDos: value2,
      largo: value3,
      calidad: selectedCalidad?.name,
    };
    // Para agregar un producto a la lista
    setProductosRegistrados([...productosRegistrados, nuevoProducto]);
    toast.current?.show({
      severity: "success",
      summary: "Materia prima registrada",
      detail: "La materia prima se agrego a la lista.",
      life: 3000,
    });

    // Limpiar los campos después de agregar o actualizar
    setValue1(null);
    setValue2(null);
    setValue3(null);
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
      detail: "El producto se elimino de la lista.",
      life: 3000,
    });
  };

  const registrarProductos = async () => {
    if (productosRegistrados.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Sin materias primas",
        detail: "No hay materias primas ha registrar.",
        life: 3000,
      });
      return;
    }

    // Convertir cada producto en el formato que espera la API
    const productosARegistrar = productosRegistrados.map((producto) => ({
      cantidad: 0,
      diametroUno: producto.diametroUno,
      diametroDos: producto.diametroDos,
      largo: producto.largo,
      metroCR: Number(
        (
          (((producto.diametroUno + producto.diametroDos) / 2) *
            ((producto.diametroUno + producto.diametroDos) / 2) *
            producto.largo *
            0.7854) /
          10
        ).toFixed(2)
      ),
      fechaRegistro: new Date().toISOString().split("T")[0],
      calidad: producto.calidad,
      identificadorP: 0,
    }));

    console.log("Enviando las siguientes materias:", productosARegistrar);

    try {
      const response = await axios.post(
        "https://api.uniecosanmateo.icu/api/rawMaterials",
        { materials: productosARegistrar }, // Enviar como objeto con array de productos
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.status === 201) {
        console.log("Materias primas registradas correctamente");
        // Llamar a la función para registrar el inventario usando los ids de los productos
        registrarInventario(response.data.materials);

        toast.current?.show({
          severity: "success",
          summary: "Registro exitoso",
          detail: "Toda la materia prima ha sido registrada.",
          life: 3000,
        });

        //setProductosRegistrados([]);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);

      toast.current?.show({
        severity: "error",
        summary: "Error al registrar",
        detail: "Hubo un problema al registrar la materia prima.",
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
    const inventariosARegistrar = productosGuardados.map((materia) => ({
      idMateria: materia.id, // Este campo contiene el id del producto registrado
      stockIdeal: 0, // stockideal
      // Obtener el objeto del localStorage
      idUsuario: userData ? JSON.parse(userData).id : null, // id del usuario
    }));

    console.log(
      "Enviando la materia prima al inventario:",
      inventariosARegistrar
    );

    try {
      const response = await axios.post(
        "https://api.uniecosanmateo.icu/api/rawMaterialInventory",
        { materiales: inventariosARegistrar }, // Enviar como objeto con array de productos
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
            "El inventario de materia prima se ha registrado satisfactoriamente.",
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
        title="Registro de Materia prima"
        description="Registrar los productos faltantes"
      />
      <PageBreadcrumb pageTitle="Registro de la materia prima" />

      <div className="card flex flex-wrap gap-3 p-fluid mt-2">
        <div className="flex-auto">
          <label htmlFor="stacked-buttons" className="font-bold block mb-2">
            Diametro Uno
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
              maxFractionDigits={2}
              min={1}
              showButtons
              incrementButtonClassName="p-button-warning"
              decrementButtonClassName="p-button-warning"
            />
          </div>
        </div>

        <div className="flex-auto">
          <label htmlFor="minmax-buttons" className="font-bold block mb-2">
            Diametro Dos
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
              maxFractionDigits={2}
              min={1}
              showButtons
              incrementButtonClassName="p-button-warning"
              decrementButtonClassName="p-button-warning"
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
              maxFractionDigits={2}
              min={1}
              showButtons
              incrementButtonClassName="p-button-warning"
              decrementButtonClassName="p-button-warning"
            />
          </div>
        </div>
      </div>

      <div className="card flex flex-wrap gap-3 p-fluid">
        <div className="flex-auto">
          <label htmlFor="stacked-buttons" className="font-bold block mb-2">
            Calidad de la materia
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
              placeholder="Seleccione la calidad de la materia"
              className="w-full md:w-100rem"
              checkmark={true}
              highlightOnSelect={false}
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
      <div className="card p-fluid">
        <DataTable
          value={productosRegistrados}
          editMode="row"
          dataKey="id"
          onRowEditComplete={onRowEditComplete}
          size="small"
          paginator
          rows={3}
          rowsPerPageOptions={[3, 6]}
          header="Materia prima registrada"
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column
            field="diametroUno"
            header="Diametro Uno"
            editor={(options) => numberEditor(options)}
            style={{ width: "14.28%" }}
          />
          <Column
            field="diametroDos"
            header="Diametro Dos"
            editor={(options) => numberEditor(options)}
            style={{ width: "14.28%" }}
          />
          <Column
            field="largo"
            header="Largo"
            editor={(options) => numberEditor(options)}
            style={{ width: "14.28%" }}
          />
          <Column
            field="calidad"
            header="Calidad"
            editor={(options) => calidadEditor(options)}
            style={{ width: "14.28%" }}
          />
          <Column
            header="Metros CR"
            body={(rowData) => {
              // Realiza el cálculo
              const metroCR =
                (((rowData.diametroUno + rowData.diametroDos) / 2) *
                  ((rowData.diametroUno + rowData.diametroDos) / 2) *
                  rowData.largo *
                  0.7854) /
                10;
              return metroCR.toFixed(1);
            }}
            style={{ width: "14.28%" }}
          />
          <Column
            rowEditor
            header="Editar"
            bodyStyle={{ textAlign: "left" }}
            style={{ width: "14.28%" }}
          />
          <Column
            body={actionTemplate}
            header="Eliminar"
            style={{ width: "14.28%" }}
          />
        </DataTable>
      </div>
      <div className="card flex justify-end mt-5">
        <Button
          onClick={registrarProductos}
          icon="pi pi-shopping-cart"
          label="Registrar"
          severity="success"
          rounded
        />
      </div>
    </>
  );
}
