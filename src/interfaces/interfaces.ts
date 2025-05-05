export interface IDistribution {
  gananciaNeta: number;
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
  fechaInicio?: string,
  fechaFin?: string,
}