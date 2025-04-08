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
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import { InputNumber} from 'primereact/inputnumber';
import { InputText} from 'primereact/inputtext';
import Label from "../form/Label";
import { Carousel } from 'primereact/carousel';

export default function MateriaPrima() {
  // Definir el tipo para los productos
  interface Product {
    id: number;
    calidad: string;
    cantidad: number;
    diametroUno: number;
    diametroDos: number;
    largo: number;
    metroCR: number;
  }
  interface Product1 {
    id: number;
    idMateria: number;
    stockIdeal: number;
    idUsuario: number;
    calidad: string;
    cantidad: number;
    diametroUno: number;
    diametroDos: number;
    largo: number;
    metroCR: number;
  }
  //const dt = useRef(null);
  const toast = useRef<Toast>(null); // Tipar la referencia del Toast
  // Estados para almacenar los productos 
  const [products, setProducts] = useState<Product[]>([]);
  const [products1, setProducts1] = useState<Product1[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  
  // useEffect para recargar el numero de produccion
  useEffect(() => {
    recargarProductos();
    recargarInventario();
  }, [products1]);

  // Función para recargar los datos de la API  
  const recargarProductos = async () => {
     try {
        const response = await axios.get<Product[]>(
          "https://api.uniecosanmateo.icu/api/rawMaterials"
        );
        setProducts(response.data);      
    } catch (error) {
      console.error("Error al obtener los productos", error);
    }
  };
  

  // Función para recargar los datos de la API
  const recargarInventario = async () => {
    try {
      const response = await axios.get<Product1[]>(
        "https://api.uniecosanmateo.icu/api/rawMaterialInventory"
      );
      setProducts1(response.data);
    } catch (error) {
      console.error("Error al obtener los productos", error);
    }
  };

  const totalPiezas = products1.length;

 // Función para actualizar los datos del producto e?: React.FormEvent  e?.preventDefault?.();
   const handleSave = async () => {   
    if (!selectedProduct || selectedProduct.stockIdeal === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Campo incompleto",
        detail: "Por favor, ingrese un stock ideal valido.",
        life: 3000,
      });
      return; // Evita enviar la solicitud si los campos no son válidos
    }
  
    try {
      // Hacer una solicitud PUT a la API para actualizar el producto
      const response = await axios.put(`http://localhost:8000/api/rawMaterialInventory/${selectedProduct.id}`,
        {
          id: selectedProduct.id, // Asignar el valor del precio
          stockIdeal: selectedProduct.stockIdeal, // Asignar el valor del stock ideal
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
        
      ); 
      if (response.status === 201) {
        console.log("Materia prima actualizada correctamente");
        console.log(selectedProduct); 
        // Si la actualización fue exitosa, se actualiza los productos en el estado
        setProducts1(products1.map((product) =>
          product.id === selectedProduct.id ? selectedProduct : product
        )
      );
        toast.current?.show({
            severity: "success",
            summary: "Producto actualizado exitoso",
            detail: "El producto ha sido actualizado.",
            life: 3000,
        });
      }
      closeModal();
    } catch (error) {
      console.error("Error al guardar los cambios", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Hubo un error al actualizar el producto.",
        life: 3000,
      });
    }
  };

  const openProductModal = (rowData: any) => {
    setSelectedProduct(rowData); // Asignar el producto seleccionado al estado
    console.log(rowData);
    openModal(); // Abrir el modal
  };

  interface Product {
    [key: string]: string | number; // Esto permite que se puedan tener propiedades dinámicas
  }

 // Función para mostrar la ventana de confirmación antes de eliminar el producto
    const confirmEliminar = (rowData: any) => {
      confirmDialog({
        message: "¿Desea eliminar este producto?",
        header: "Confirmación de eliminación",
        icon: "pi pi-exclamation-triangle",
        acceptLabel: "Sí",
        rejectLabel: "No",
        accept: () => eliminarProducto(rowData.id,rowData.idMateria), // Si el usuario acepta, eliminar el producto
        reject: () => {
          toast.current?.show({
            severity: "info",
            summary: "Cancelado",
            detail: "Eliminación cancelada.",
            life: 3000,
          });
        },
      });
    };
    const eliminarProducto = async (id: number, idMateria: number) => {
      eliminarProducto2(idMateria);
      try {
        // Eliminar el producto mediante una solicitud DELETE
        const response = await axios.delete(`https://api.uniecosanmateo.icu/api/rawMaterialInventory/${id}`);
        // Actualizar el estado filtrando el producto eliminado
        //setProducts1(products1.filter((product) => product.id !== id));
        
        toast.current?.show({
          severity: "success",
          summary: "Materia prima Eliminada",
          detail: "La materia prima ha sido eliminada correctamente del inventario.",
          life: 3000,
        });

        if (response.status === 201) {
          console.log("Materia prima eliminada correctamente");
          console.log(response.data.product);
          // Llamar a la función para registrar el inventario usando los ids de los productos
           //registrarInventario(response.data.productos);

          toast.current?.show({
              severity: "success",
              summary: "Elimnado exitoso",
              detail: "La materia prima han sido eliminada.",
              life: 3000,
          });
      }
      } catch (error) {
        console.error("Error al eliminar la materia prima ", error);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Hubo un error al eliminar la materia prima .",
          life: 3000,
        });
      }
    };

    
    const eliminarProducto2 = async (id: number) => {
      try {
        // Eliminar el producto mediante una solicitud DELETE
        const response = await axios.delete(`https://api.uniecosanmateo.icu/api/rawMaterial/${id}`);
        // Actualizar el estado filtrando el producto eliminado
        setProducts1(products1.filter((product) => product.id !== id));
        
        toast.current?.show({
          severity: "success",
          summary:"Materia prima eliminada de materias",
          detail: "La materia prima ha sido eliminado correctamente.",
          life: 3000,
        });

        if (response.status === 201) {
          console.log("Producto eliminado correctamente");
          console.log(response.data.product);
          // Llamar a la función para registrar el inventario usando los ids de los productos
           //registrarInventario(response.data.productos);

          toast.current?.show({
              severity: "success",
              summary: "Eliminado exitoso",
              detail: "El producto han sido eliminado.",
              life: 3000,
          });
      }
      } catch (error) {
        console.error("Error al eliminar el producto", error);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Hubo un error al eliminar el producto.",
          life: 3000,
        });
      }
    };    
  
    // Obtener todas las calidades únicas
    const Calidades = Array.from(new Set(products.map(product => product.calidad)));
  
    // Generar un objeto que contenga la suma de cantidades por calidad
    const calidadData = Calidades.map(calidad => {
      const totalCantidad = products
        .filter((product) => product.calidad === calidad)
        .reduce((suma, product) => suma + product.cantidad, 0);
  
      return { calidad, totalCantidad };
    });
  
    // Template para mostrar cada item del carrusel
    const productTemplate = (item: { calidad: string; totalCantidad: number }) => {
      return (
        <div className="rounded-2xl border border-green-400 bg-green-200 p-1 dark:border-gray-800 md:p-2 basis-1/2 ">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-sm dark:bg-gray-800">
            <i className="pi pi-box" style={{ color: "slateblue" }}></i>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Cantidad Total de {item.calidad}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {item.totalCantidad.toFixed(0)}
              </h4>
            </div>
            <Badge color="success">
              <ArrowUpIcon />
              piezas
            </Badge>
          </div>
        </div>
      );
    };
  

  return (
    <div className="container mx-auto p-2">
      <PageMeta
        title="Materia prima"
        description="Asigna el stock ideal de la materia prima"
      />
      <PageBreadcrumb pageTitle="Materia prima" />

      <div className="flex flex-wrap gap-8 justify-center">
        <div className="flex-auto">
          <label htmlFor="stacked-buttons" className="font-bold block mb-2">
            Asigna el stock ideal de la materia prima
          </label>
        </div>

      <div className="flex flex-row">

      <div  style={{width: '80%', maxWidth: '420px', height: '120px', margin: '0 auto', padding: '10px', }}>
      <Carousel 
        value={calidadData} // Si deseas múltiples carruseles con la misma información, por ejemplo.
        numVisible={1}
        numScroll={1}
        itemTemplate={productTemplate} 
      />
    </div>
        

          <div className="rounded-2xl border border-yellow-400 bg-yellow-100 p-2 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 basis-1/2 ml-1">
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
        <h2>MATERIA PRIMA</h2>
      </div>

      {/* DataTable para mostrar los productos disponibles */}
      <div className="card">    
      <ConfirmDialog />
        <DataTable
          value={products1}
          size="small"
          paginator
          rows={3}
          rowsPerPageOptions={[3, 6, 9, 12]}
          tableStyle={{ minWidth: "10rem" }}
          dataKey="id"
          emptyMessage="No hay materia prima para mostrar."
        >
          <Column
            field="stockIdeal"
            header="Stock Ideal"
            sortable
            style={{ width: "11%" }}
            body={(rowData) => `$ ${rowData.stockIdeal}`}
          ></Column>
          <Column
            field="calidad"
            header="Calidad"
            style={{ width: "10%" }}
            body={(rowData) =>
              rowData.rawmaterial ? rowData.rawmaterial.calidad : "N/A"
            }
          ></Column>
          <Column
            field="diametroUno"
            header="Diametro Uno"
            style={{ width: "11%" }}
            body={(rowData) =>
              rowData.rawmaterial ? rowData.rawmaterial.diametroUno : "N/A"
            }
          ></Column>
          <Column
            field="diametroDos"
            header="Diametro Dos"
            style={{ width: "11%" }}
            body={(rowData) =>
              rowData.rawmaterial ? rowData.rawmaterial.diametroDos : "N/A"
            }
          ></Column>
          <Column
            field="largo"
            header="Largo"
            style={{ width: "12%" }}
            body={(rowData) =>
              rowData.rawmaterial ? rowData.rawmaterial.largo : "N/A"
            }
          ></Column>
          <Column
            field="metroCR"
            header="Metros CR"
            style={{ width: "14%" }}
            body={(rowData) =>
            rowData.rawmaterial ? rowData.rawmaterial.metroCR : "N/A"
            }
          ></Column>
          <Column
           body={(rowData) => (
           <Button
              icon="pi pi-pencil"
              onClick={() => openProductModal(rowData)} // Al hacer clic, pasa los datos al modal
              className="p-button-rounded p-button-success"
            />
          )}
          header="Registrar"
          style={{ width: "10%" }} 
        />
        <Toast ref={toast} position="bottom-left" />
          <Column  body={(rowData) => (
           <Button
              icon="pi pi-trash"
              className="p-button-rounded p-button-danger"
              onClick={() => confirmEliminar(rowData)} // Al hacer clic, pasa los datos al modal
              
            />
          )}
          style={{ width: "10%" }}
          header="Eliminar" />          
        </DataTable>
        <Toast ref={toast} position="bottom-left" />
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                  <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                      Actualiza los datos de la mataeria prima
                    </h4>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                      Actualiza el stock ideal
                    </p>
                  </div>
                  <form className="flex flex-col">
                      <div className="mt-2">
        
                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                          <div className="col-span-2 lg:col-span-1">
                            <Label>Stock Ideal</Label>
                            <InputNumber 
                              inputId="minmax-buttons" 
                              value={selectedProduct?.stockIdeal ?? 0}
                              onValueChange={(e) =>setSelectedProduct({...selectedProduct!, stockIdeal: e.value ?? 0})}            
                              min={1} 
                              max={1000}
                              minFractionDigits={2} 
                              maxFractionDigits={2}                               
                            />
                          </div>
                              
        
                          <div className="col-span-3 lg:col-span-1">
                            <Label>Calidad</Label>
                            <InputText
                             value={selectedProduct?.rawmaterial.calidad}
                             readOnly
                            />
                          </div>
        
                          <div className="col-span-2 lg:col-span-1">
                            <Label>Diametro Uno</Label>
                            <InputNumber
                             value={selectedProduct?.rawmaterial.diametroUno}
                             readOnly
                            />
                          </div>

                          <div className="col-span-2 lg:col-span-1">
                            <Label>Diametro Dos</Label>
                            <InputNumber value={selectedProduct?.rawmaterial.diametroDos} readOnly />
                          </div>
                          <div className="col-span-2 lg:col-span-1">
                            <Label>Largo</Label>
                            <InputNumber value={selectedProduct?.rawmaterial.largo} readOnly />
                          </div>
                          <div className="col-span-2 lg:col-span-1">
                            <Label>MetrosCR</Label>
                            <InputNumber value={selectedProduct?.rawmaterial.metroCR} readOnly/>
                          </div>
                        </div>
                      </div>
                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                      <Button onClick={closeModal}>
                        Cerrar
                      </Button>
                      <Toast ref={toast} position="bottom-left" />
                      <Button onClick={handleSave}>
                        Guardar cambios
                      </Button>
                    </div>
                  </form>
                </div>
              </Modal>

      </div>
    </div>
  );
}
