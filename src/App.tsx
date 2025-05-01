import castilloLogo from "./assets/castillo_logo.png";
import { useState, ChangeEvent } from "react";
import { FormData, IDistribution } from "./interfaces/interfaces";
import Stats from "./Stats";

function App() {
  const [formData, setFormData] = useState<FormData>({
    ventaNeta: "",
    gananciaBruta: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showForm, setShowForm] = useState(false);
  const [distribution, setDistribution] = useState<IDistribution | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

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
  };

  const calculateDistribution = () => {
    let kilos = 0;

    const ventaNeta = parseFloat(formData.ventaNeta) || 0;
    const gananciaBruta = parseFloat(formData.gananciaBruta) || 0;

    // Cálculo de pagos
    const pagoTrabajadores = Math.max(ventaNeta * 0.04, 2400);
    const pagoImpuestos = 2100;
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
      <div className="w-full flex justify-center items-center">
        <img src={castilloLogo} className="w-2/3" alt="Castillo Logo" />
      </div>

      <div className="w-full flex justify-center items-center">
        {showForm && distribution ? (
          <Stats
            distribution={distribution}
            setShowForm={setShowForm}
            formData={formData}
          />
        ) : (
          <div className=" w-full mx-auto mt-10 p-6">
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
