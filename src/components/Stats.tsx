import { useEffect, useState } from "react";
import { FormData, IDistribution } from "../interfaces/interfaces";
import { getVentasDelDia } from "../Api/castilloApi";
import { DatePickerWithRange } from "./shadcn/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { Button } from "./shadcn/Button";

const Stats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    ventaNeta: "",
    gananciaBruta: "",
    fechaInicio: "",
    fechaFin: "",
  });
  const [distribution, setDistribution] = useState<IDistribution | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const loadVentas = async () => {
      try {
        const data = await getVentasDelDia();
        setFormData((prev) => ({
          ...prev,
          ventaNeta: data.ventaNeta.toString(),
          gananciaBruta: data.beneficioBruto.toString(),
        }));
        setDistribution(data.distribucion);
      } catch (error) {
        console.error("Error cargando ventas:", error);
        setError(JSON.stringify(error));
      } finally {
        setLoading(false);
      }
    };
    loadVentas();
  }, []);

  const handleSubmit = async () => {
    if (!selectedRange?.from) return;

    setLoading(true);
    try {
      const desde = selectedRange.from.toISOString().split("T")[0];
      const hasta = selectedRange.to
        ? selectedRange.to.toISOString().split("T")[0]
        : desde;
      const data = await getVentasDelDia(desde, hasta);
      setFormData({
        ventaNeta: data.ventaNeta.toString(),
        gananciaBruta: data.beneficioBruto.toString(),
        fechaInicio: desde,
        fechaFin: hasta,
      });
      setDistribution(data.distribucion);
    } catch (error) {
      console.error("Error cargando ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-MX", {
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.floor(amount)) + " cup";

  return (
    <div className="flex flex-col">
      <div>
        <div className="mb-6 grid gap-2">
          <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl flex flex-col">
            Resumen general
          </h2>
          <DatePickerWithRange onDateChange={setSelectedRange} />

          <Button
            onClick={handleSubmit}
            className="bg-amber-500/90 text-white px-4 py-2 rounded mt-2 hover:bg-amber-600 transition"
            disabled={loading}
          >
            Aplicar rango
          </Button>
        </div>
        {loading ? (
          <div className="mt-20 flex flex-col items-center justify-center text-white text-xl">
            <svg
              className="animate-spin h-10 w-10 text-amber-400 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span>Cargando datos del día...</span>
          </div>
        ) : (
          <div>
            {error || !distribution ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="mx-auto max-w-7xl px-3 lg:px-8 mt-12">
                {/* ----------------------------- */}

                <dl className="grid grid-cols-4 gap-8 lg:grid-cols-4 items-start justify-start">
                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">Venta neta</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(+formData.ventaNeta)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Ganancia bruta{" "}
                      <span>
                        {(
                          (Number(formData.gananciaBruta) /
                            Number(formData.ventaNeta)) *
                          100
                        ).toFixed(2)}
                        %
                      </span>
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(+formData.gananciaBruta)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Pago trabajadores
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(distribution.pagoTrabajadores)}
                    </dd>
                    <div className="order-first font-thin tracking-tight text-amber-50 sm:text-5xl flex w-full">
                      {formatCurrency(distribution.pagoTrabajadores / 2)}{" "}
                      <span className="ml-2">C / U</span>
                    </div>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Pago impuestos
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(distribution.pagoImpuestos)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
                    <dt className="text-base/7 text-orange-400">
                      Ganancia neta
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-orange-400 sm:text-5xl">
                      {formatCurrency(distribution.gananciaNeta)}{" "}
                    </dd>
                  </div>
                </dl>

                {/* ----------------------------- */}

                <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mt-14 mb-6 flex justify-between">
                  Administradores{" "}
                  <span className="sm:text-md font-thin">40%</span>
                </h2>
                <dl className="grid grid-cols-4 gap-8  lg:grid-cols-4">
                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Jose <span className="font-thin">20%</span>
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(distribution.administradores.jose)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Alfonso <span className="font-thin">20%</span>
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(distribution.administradores.alfonso)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
                    <dt className="text-base/7 text-orange-400">
                      Total administradores
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-orange-400 sm:text-5xl">
                      {formatCurrency(
                        distribution.administradores.jose +
                          distribution.administradores.alfonso
                      )}
                    </dd>
                  </div>
                </dl>

                {/* ----------------------------- */}

                <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mt-14 mb-6 flex justify-between">
                  Inversores <span className="sm:text-md font-thin">55%</span>
                </h2>
                <dl className="grid grid-cols-4 gap-8  lg:grid-cols-4">
                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Alber <span className="font-thin">28.11%</span>
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(distribution.inversores.adalberto)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Senjudo <span className="font-thin">26.88%</span>
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(distribution.inversores.senjudo)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
                    <dt className="text-base/7 text-orange-400">
                      Total inversores
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-orange-400 sm:text-5xl">
                      {formatCurrency(
                        distribution.inversores.adalberto +
                          distribution.inversores.senjudo
                      )}
                    </dd>
                  </div>
                </dl>

                {/* ----------------------------- */}
                <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mt-14 mb-6 flex justify-between">
                  Reinversión <span className="sm:text-md font-thin">5%</span>
                </h2>
                <dl className="grid grid-cols-4 gap-8  lg:grid-cols-4">
                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l-1 border-stone-50 pl-4">
                    <dt className="text-base/7 text-orange-400">
                      Total reinversión
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-orange-400 sm:text-5xl">
                      {formatCurrency(distribution.reinversion)}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
