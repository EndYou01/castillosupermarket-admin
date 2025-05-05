import castilloLogo from "./assets/castillo_logo.png";
import { useState, ChangeEvent } from "react";
import { FormData, IDistribution } from "./interfaces/interfaces";
import Stats from "./Stats";

function App() {
  const [formData, setFormData] = useState<FormData>({
    ventaNeta: "",
    gananciaBruta: "",
    fechaInicio: "",
    fechaFin: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showForm, setShowForm] = useState(false);
  const [distribution, setDistribution] = useState<IDistribution | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "ventaNeta" || name === "gananciaBruta") {
      if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));

        if (errors[name as keyof FormData]) {
          setErrors((prev) => ({
            ...prev,
            [name]: undefined,
          }));
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const calculateDistribution = () => {
    let kilos = 0;
    let pagoImpuestos = 2100; // Valor base diario

    // Calcular días si hay fechas seleccionadas
    if (formData.fechaInicio && formData.fechaFin) {
      const startDate = new Date(formData.fechaInicio);
      const endDate = new Date(formData.fechaFin);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
      pagoImpuestos *= diffDays;
    }

    const ventaNeta = parseFloat(formData.ventaNeta) || 0;
    const gananciaBruta = parseFloat(formData.gananciaBruta) || 0;

    // Cálculo de pagos
    const pagoTrabajadores = Math.max(ventaNeta * 0.04, 2400);
    const gananciaNeta = gananciaBruta - pagoTrabajadores - pagoImpuestos;

    const calculateKilos = (number: number, calculate?: boolean) => {
      const roundedNumber = Math.floor(number / 10) * 10;

      if (calculate) {
        kilos = kilos + (number - roundedNumber);
      }

      return roundedNumber;
    };

    // Distribución
    const distribucion: IDistribution = {
      gananciaNeta,
      pagoTrabajadores: calculateKilos(pagoTrabajadores, true),
      pagoImpuestos: calculateKilos(pagoImpuestos, true),
      administradores: {
        total: calculateKilos(gananciaNeta * 0.4),
        alfonso: calculateKilos(gananciaNeta * 0.2, true),
        jose: calculateKilos(gananciaNeta * 0.2, true),
      },
      inversores: {
        total: calculateKilos(gananciaNeta * 0.55),
        senjudo: calculateKilos(gananciaNeta * 0.2688, true),
        adalberto: calculateKilos(gananciaNeta * 0.2811, true),
      },
      reinversion: gananciaNeta * 0.05 + kilos,
    };

    return distribucion;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<FormData> = {};

    if (!formData.ventaNeta) {
      newErrors.ventaNeta = "Venta neta es requerida";
    }

    if (!formData.gananciaBruta) {
      newErrors.gananciaBruta = "Ganancia bruta es requerida";
    }

    // Validar que si una fecha está presente, la otra también lo esté
    if ((formData.fechaInicio && !formData.fechaFin) || (!formData.fechaInicio && formData.fechaFin)) {
      newErrors.fechaInicio = "Debes seleccionar ambas fechas o ninguna";
      newErrors.fechaFin = "Debes seleccionar ambas fechas o ninguna";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const distribucion = calculateDistribution();
    setDistribution(distribucion);
    setShowForm(true);
  };

  return (
    <div className="w-full h-full p-8">
      <div className="w-full mx-auto flex justify-center items-center">
        <img src={castilloLogo} className="w-2/3 md:w-1/3" alt="Castillo Logo" />
      </div>

      <div className="w-full flex justify-center items-center">
        {showForm && distribution ? (
          <Stats
            distribution={distribution}
            setShowForm={setShowForm}
            formData={formData}
          />
        ) : (
          <div className="w-full md:w-1/2 mx-auto mt-10 p-6">
            <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mb-6 text-center">
              Registro de Ventas
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="ventaNeta"
                  className="block  text-xl  text-amber-50 mb-1"
                >
                  Venta Neta
                </label>
                <input
                  type="text"
                  id="ventaNeta"
                  name="ventaNeta"
                  value={formData.ventaNeta}
                  onChange={handleInputChange}
                  className={`w-full bg-amber-50 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-stone-800 ${
                    errors.ventaNeta
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                  placeholder="0.00"
                />
                {errors.ventaNeta && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.ventaNeta}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="gananciaBruta"
                  className="block text-xl  text-amber-50 mb-1"
                >
                  Ganancia Bruta
                </label>
                <input
                  type="text"
                  id="gananciaBruta"
                  name="gananciaBruta"
                  value={formData.gananciaBruta}
                  onChange={handleInputChange}
                  className={`w-full bg-amber-50 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-stone-800 ${
                    errors.gananciaBruta
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                  placeholder="0.00"
                />
                {errors.gananciaBruta && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.gananciaBruta}
                  </p>
                )}
              </div>

              {/* <div className="pt-4">
                <h3 className="text-xl text-amber-50 mb-2">Rango de fechas (opcional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="fechaInicio"
                      className="block text-sm text-amber-50 mb-1"
                    >
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      id="fechaInicio"
                      name="fechaInicio"
                      value={formData.fechaInicio}
                      onChange={handleInputChange}
                      className="w-full bg-amber-50 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-stone-800"
                    />
                    {errors.fechaInicio && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.fechaInicio}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="fechaFin"
                      className="block text-sm text-amber-50 mb-1"
                    >
                      Fecha fin
                    </label>
                    <input
                      type="date"
                      id="fechaFin"
                      name="fechaFin"
                      value={formData.fechaFin}
                      onChange={handleInputChange}
                      className="w-full bg-amber-50 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-stone-800"
                    />
                    {errors.fechaFin && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.fechaFin}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-sm text-amber-100">
                  Si selecciona un rango de fechas, el pago de impuestos se multiplicará por la cantidad de días.
                </p>
              </div> */}

              <button
                type="submit"
                className="fixed bottom-10 right-10  bg-orange-400 hover:bg-orange-500 text-white font-medium py-2 px-4 rounded-md transition duration-200"
              >
                Calcular distribución
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;