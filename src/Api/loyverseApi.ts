export const getVentasDelDia = async () => {
    const res = await fetch('http://localhost:3000/ventas/dia');
    const data = await res.json();
    console.log('Venta neta:', data.ventaNeta);
    console.log('Beneficio bruto:', data.beneficioBruto);
  };