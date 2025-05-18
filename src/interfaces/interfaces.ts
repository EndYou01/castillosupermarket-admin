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
}

export interface IVentasResponse {
  ventaBruta: number;
  reembolsos: number;
  ventaNeta: number;
  costoTotal: number;
  beneficioBruto: number;
  recibosProcesados: number;
  distribucion: IDistribution;
}
