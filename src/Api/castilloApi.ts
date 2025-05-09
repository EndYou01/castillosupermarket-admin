import { DateTime } from 'luxon';

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
      `https://castillosupermarket-backend.vercel.app/ventas/rango?&desde=${desde}&hasta=${hasta}`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error obteniendo ventas del día:", error);
    return null;
  }
};
