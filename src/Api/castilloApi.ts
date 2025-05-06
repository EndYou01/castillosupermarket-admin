export const getVentasDelDia = async () => {
  const storeId = import.meta.env.VITE_STORE_ID;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const desde = `${year}-${month}-${day}T00:00:00Z`;
  const hasta = `${year}-${month}-${day}T23:59:59Z`;

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
    return data;
  } catch (error) {
    console.error("Error obteniendo ventas del día:", error);
    return null;
  }
};
