import { DateTime } from 'luxon';
import {
  ICapitalResponse,
  IDarBajaPayload,
  IInventarioResponse,
  IVentasResponse,
} from '../interfaces/interfaces';

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

// ----------------------- Capital disponible -----------------------

export const getCapital = async (): Promise<ICapitalResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/capital`, { method: "GET" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error obteniendo capital:", error);
    return null;
  }
};

// Fija el capital a un valor absoluto (botón "Modificar" tras un conteo).
export const setCapital = async (
  monto: number,
  descripcion?: string
): Promise<ICapitalResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/capital`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monto, descripcion }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await getCapital();
  } catch (error) {
    console.error("Error fijando capital:", error);
    return null;
  }
};

// Registra el cierre de un día (suma venta neta − reparto al capital).
export const registrarCierre = async (
  fecha?: string
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/capital/cierre`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { ok: false, error: body?.message || `Error ${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    console.error("Error registrando cierre:", error);
    return { ok: false, error: "No se pudo conectar con el servidor" };
  }
};

// Da baja a un producto (rebaja stock en Loyverse + suma la parte pagada).
export const darBaja = async (
  payload: IDarBajaPayload
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/capital/baja`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { ok: false, error: body?.message || `Error ${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    console.error("Error dando baja:", error);
    return { ok: false, error: "No se pudo conectar con el servidor" };
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
