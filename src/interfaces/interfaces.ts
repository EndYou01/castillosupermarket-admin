import { LucideProps } from "lucide-react";
import { ReactElement } from "react";

export interface IDistribution {
  gastosExtras: number;
  gananciaNeta: number;
  diasProcesados: number;
  pagoTrabajadores: number;
  pagoImpuestos: number;
  reinversion: number;
  estimulo: number;
  limpieza: number;
  jefes: {
    total: number;
    alfonso: number;
    senjudo: number;
    josse: number;
    julio: number;
  };
}

export interface FormData {
  ventaNeta: string;
  gananciaBruta: string;
  fechaInicio?: string;
  fechaFin?: string;
  metodos_pago: IMetodoPago[]
}

export interface IVentasResponse {
  ventaBruta: number;
  reembolsos: number;
  ventaNeta: number;
  costoTotal: number;
  beneficioBruto: number;
  descuentoFiscal: number;
  recibosProcesados: number;
  distribucion: IDistribution;
  metodos_pago: IMetodoPago[];
}

interface IMetodoPago {
  name: string;
  money_amount: number;
  descuento: number;
}

export interface INavigationItems {
  title: string;
  url: string;
  element: ReactElement;
  items?: INavigationItems[];
  description?: string;
  icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}
export interface INavigationRoute {
  title: string;
  url: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  isActive: boolean;
  items: INavigationItems[];
  index?: boolean;
}

export interface IMovimientoCapital {
  id: number;
  tipo: "CONTEO" | "CIERRE" | "BAJA" | "COMPRA" | "AJUSTE";
  monto: number;
  saldoResultante: number;
  descripcion: string | null;
  metadata: Record<string, unknown> | null;
  fecha: string;
}

export interface ICapitalResponse {
  monto: number;
  actualizadoEn: string;
  movimientos: IMovimientoCapital[];
}

export interface IBaja {
  id: number;
  variantId: string;
  itemId: string | null;
  itemName: string;
  cantidad: number;
  costoUnitario: number;
  stockAntes: number | null;
  stockDespues: number | null;
  partePagada: number;
  motivo: string;
  fecha: string;
}

export interface IBajasResponse {
  mes: string;
  totalCosto: number;
  totalPartePagada: number;
  totalNeto: number;
  cantidadBajas: number;
  bajas: IBaja[];
}

export interface IDarBajaPayload {
  variantId: string;
  itemId?: string;
  itemName: string;
  cantidad: number;
  partePagada: number;
  costoUnitario?: number;
  motivo: string;
}

export interface IPatrimonio {
  capital: number;
  inventario: number;
  totalCup: number;
  tasaUsd: number | null;
  tasaEsRespaldo: boolean;
  totalUsd: number | null;
  fecha: string;
}

export interface IPatrimonioSnapshot {
  id: number;
  capital: number;
  inventario: number;
  totalCup: number;
  tasaUsd: number | null;
  totalUsd: number | null;
  fecha: string;
}

export interface IInflacion {
  tasaHoy: number | null;
  cambioPctDia: number;
  cambioPctVentana: number;
  diasVentana: number;
}

export interface IDarEntradaPayload {
  variantId: string;
  itemId: string;
  itemName: string;
  cantidad: number;
  nuevoCosto: number;
  nuevoPrecio: number;
}

export interface IInventarioResponse {
  cantidadProductos: number;
  cantidadTotalEnInventario: number;
  productosConInventario: Array<{
    cost: number;
    price: number;
    description: string;
    id: string;
    inventory_found: boolean;
    item_name: string;
    quantity: number;
    variant_id: string;
  }>;
  productosValidosCount: number;
  totalInvertido: number;
}
