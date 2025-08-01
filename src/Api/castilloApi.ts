import { DateTime } from 'luxon';
import { IInventarioResponse, IVentasResponse } from '../interfaces/interfaces';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getVentasDelDia = async (desdeStr?: string, hastaStr?: string) => {
  
  const now = DateTime.now().setZone("America/Havana");

  const desde = desdeStr
    ? DateTime.fromISO(desdeStr).startOf('day').toUTC().toISO()
    : now.startOf('day').toUTC().toISO();

  const hasta = hastaStr
    ? DateTime.fromISO(hastaStr).endOf('day').toUTC().toISO()
    : now.endOf('day').toUTC().toISO();


  const requestOptions = {
    method: "GET",
  };

  try {
    const response = await fetch(
      `${API_BASE_URL}/ventas/rango?&desde=${desde}&hasta=${hasta}`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: IVentasResponse = await response.json();

    return data;
  } catch (error) {
    console.error("Error obteniendo ventas del día:", error);
    return null;
  }
};

export const getInventario = async () => {
  const requestOptions = {
    method: "GET",
  };

  try {
    const response = await fetch(
      `${API_BASE_URL}/productos/inventario`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: IInventarioResponse = await response.json();

    return data;
  } catch (error) {
    console.error("Error obteniendo inventario:", error);
    return null;
  }
};
