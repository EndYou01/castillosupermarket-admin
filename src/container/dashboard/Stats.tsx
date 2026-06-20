import { useState } from "react";
import { DateTime } from "luxon";
import {
  IExtraccionesResponse,
  IVentasResponse,
} from "../../interfaces/interfaces";
import { getVentasDelDia, getExtraccionesRango } from "../../Api/castilloApi";
import { useCachedResource } from "../../hooks/useCachedResource";
import { DatePickerWithRange } from "../../components/shadcn/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { Button } from "../../components/shadcn/Button";
import LoadingSpin from "../../components/LoadingSpin";

const Stats = () => {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  // Rango aplicado (null = hoy). Cambiar la clave hace que el hook recargue
  // (o muestre al instante lo cacheado si ese rango ya se consultó).
  const [range, setRange] = useState<{ desde: string; hasta: string } | null>(
    null
  );

  const hoy = DateTime.now().setZone("America/Havana").toFormat("yyyy-MM-dd");
  const sufijo = range ? `${range.desde}:${range.hasta}` : hoy;

  const { data: ventas, loading, error } = useCachedResource<IVentasResponse>(
    `ventas:${sufijo}`,
    () =>
      range ? getVentasDelDia(range.desde, range.hasta) : getVentasDelDia(),
    { ttl: 120_000 }
  );
  const { data: extracciones } = useCachedResource<IExtraccionesResponse>(
    `extracciones:${sufijo}`,
    () =>
      range
        ? getExtraccionesRango(range.desde, range.hasta)
        : getExtraccionesRango(),
    { ttl: 120_000 }
  );

  const distribution = ventas?.distribucion ?? null;
  const metodosPago = ventas?.metodos_pago ?? [];
  const ventaNeta = ventas?.ventaNeta ?? 0;
  const gananciaBruta = ventas?.beneficioBruto ?? 0;
  const receiptsAmount = ventas?.recibosProcesados ?? 0;
  // Efectivo extraído de la caja en el rango (extracciones de capital).
  const extraido = extracciones?.total ?? 0;

  const handleSubmit = () => {
    if (!selectedRange?.from) return;
    const desde = selectedRange.from.toISOString().split("T")[0];
    const hasta = selectedRange.to
      ? selectedRange.to.toISOString().split("T")[0]
      : desde;
    setRange({ desde, hasta });
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
        <div className="mb-6 grid gap-2 md:gap-6">
          <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl flex flex-col">
            Resumen general
          </h2>
          <div className="flex flex-col w-full justify-start items-center md:w-2/3 md:flex-row md:justify-between gap-2">
            <div className="w-full">
              <DatePickerWithRange onDateChange={setSelectedRange} />
            </div>

            <Button
              onClick={handleSubmit}
              className="bg-amber-500/90 text-white px-4 py-2 rounded hover:bg-amber-600 transition w-full"
              disabled={loading}
            >
              Aplicar rango
            </Button>
          </div>
        </div>
        {loading ? (
          <LoadingSpin />
        ) : (
          <div>
            {!distribution ? (
              <p className="text-red-500">
                {error
                  ? "No se pudo cargar el resumen."
                  : "Sin datos para este rango."}
              </p>
            ) : (
              <div className="mx-auto max-w-7xl px-3 lg:px-8 mt-12">
                <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mt-14 mb-6 flex justify-between items-center">
                  Recibos procesados
                  <span className="sm:text-md font-thin">{receiptsAmount}</span>
                </h2>
                {/* ----------------------------- */}
                <dl className="grid grid-cols-4 gap-8 lg:grid-cols-6 items-start justify-start">
                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">Venta neta</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(ventaNeta)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Ganancia bruta{" "}
                      <span>
                        {ventaNeta
                          ? ((gananciaBruta / ventaNeta) * 100).toFixed(2)
                          : "0.00"}
                        %
                      </span>
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(gananciaBruta)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">Salarios</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(distribution.pagoTrabajadores)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">Impuestos</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(distribution.pagoImpuestos)}
                    </dd>
                  </div>

                  {distribution && distribution.gastosExtras > 0 && (
                    <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                      <dt className="text-base/7 text-amber-100">
                        Gastos extra
                      </dt>
                      <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                        {formatCurrency(distribution.gastosExtras)}
                      </dd>
                    </div>
                  )}

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-orange-400">
                      Ganancia neta
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-orange-400 sm:text-5xl">
                      {formatCurrency(distribution.gananciaNeta)}{" "}
                    </dd>
                  </div>
                </dl>

                {/* ----------------------------- */}
                <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mt-14 mb-6 flex justify-between items-center">
                  Caja
                </h2>
                <dl className="grid grid-cols-4 gap-8  lg:grid-cols-4">
                  {metodosPago.map((metodo) => {
                    const esEfectivoConExtraccion =
                      metodo.name === "Efectivo" && extraido > 0;
                    // En efectivo mostramos lo que REALMENTE hay en caja (ventas
                    // en efectivo menos lo extraído), no lo que habría sin extraer.
                    const valor = esEfectivoConExtraccion
                      ? metodo.money_amount - extraido
                      : metodo.money_amount;
                    return (
                      <div
                        key={metodo.name}
                        className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4"
                      >
                        <dt className="text-base/7 text-amber-100">
                          {metodo.name}
                        </dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                          {formatCurrency(valor)}
                        </dd>
                        {esEfectivoConExtraccion && (
                          <span className="-mt-2 text-sm text-amber-100/60">
                            Extracción: −{formatCurrency(extraido)}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Descuento fiscal
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(
                        metodosPago.find(
                          (metodo) => metodo.name === "Tarjeta Fiscal",
                        )?.descuento ?? 0,
                      )}{" "}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-orange-400">Total</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-orange-400 sm:text-5xl">
                      {formatCurrency(
                        metodosPago.reduce(
                          (sum, metodo) => sum + metodo.money_amount,
                          0,
                        ) - extraido,
                      )}{" "}
                    </dd>
                  </div>
                </dl>

                {/* ----------------------------- */}

                <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mt-14 mb-6 flex justify-between items-center">
                  Reinversión
                </h2>
                <dl className="grid grid-cols-4 gap-8 lg:grid-cols-6">
                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-orange-400">
                      Total reinversión
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-orange-400 sm:text-5xl">
                      {formatCurrency(distribution.reinversion)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Estímulo trabajadores
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(distribution.estimulo)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Limpieza (Mary)
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(distribution.limpieza)}
                    </dd>
                  </div>
                </dl>

                {/* ----------------------------- */}

                <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mt-14 mb-6 flex justify-between items-center">
                  Jefes
                </h2>
                <dl className="grid grid-cols-4 gap-8 lg:grid-cols-4">
                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Alfonso <span className="font-thin">25%</span>
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(distribution.jefes.alfonso)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Senjudo <span className="font-thin">25%</span>
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(distribution.jefes.senjudo)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Josse <span className="font-thin">25%</span>
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(distribution.jefes.josse)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-amber-100">
                      Julio <span className="font-thin">25%</span>
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
                      {formatCurrency(distribution.jefes.julio)}
                    </dd>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-y-4 col-span-2 border-l border-stone-50 pl-4">
                    <dt className="text-base/7 text-orange-400">Total jefes</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-orange-400 sm:text-5xl">
                      {formatCurrency(distribution.jefes.total)}
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
