import { LucideProps } from "lucide-react";
import { ReactElement } from "react";

export interface IDistribution {
  gastosExtras: number;
  gananciaNeta: number;
  diasProcesados: number;
  pagoTrabajadores: number;
  pagoImpuestos: number;
  administradores: {
    total: number;
    alfonso: number;
    jose: number;
    carlos: number;
  };
  inversores: {
    total: number;
    senjudo: number;
    adalberto: number;
  };
  reinversion: number;
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

export interface IInventarioResponse {
  cantidadProductos: number;
  cantidadTotalEnInventario: number;
  productosConInventario: Array<{
    cost: number;
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
