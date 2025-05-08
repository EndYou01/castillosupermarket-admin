import { DateTime } from 'luxon';

export const getVentasDelDia = async () => {
  const storeId = import.meta.env.VITE_STORE_ID;
  
  const today = DateTime.now().setZone("America/Havana");

  // Convertimos a UTC y luego a formato ISO con 'Z'
  const desde = today.startOf('day').toUTC().toISO(); // Ej: 2025-05-07T04:00:00.000Z
  const hasta = today.endOf('day').toUTC().toISO();   // Ej: 2025-05-08T03:59:59.999Z


  const requestOptions = {
    method: "GET",
  };

  try {
    const response = await fetch(
      `https://castillosupermarket-backend.vercel.app/ventas/rango?store_id=${storeId}&desde=${desde}&hasta=${hasta}&limit=200`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log({data})
    return data;
  } catch (error) {
    console.error("Error obteniendo ventas del día:", error);
    return null;
  }
};
