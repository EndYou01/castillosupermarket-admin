import { useState } from "react";
import { DateTime } from "luxon";
import { getBajas } from "../../Api/castilloApi";
import { IBajasResponse } from "../../interfaces/interfaces";
import { useCachedResource } from "../../hooks/useCachedResource";
import LoadingSpin from "../../components/LoadingSpin";
import { MonthPicker } from "../../components/shadcn/MonthPicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/shadcn/Select";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.floor(amount)) + " cup";

const Bajas = () => {
  const mesActual = DateTime.now().setZone("America/Havana").toFormat("yyyy-MM");
  const [mes, setMes] = useState(mesActual);
  const [motivoFilter, setMotivoFilter] = useState<string>("todos");

  // Las bajas de un mes cambian poco; las cacheamos con TTL largo.
  const { data, loading, error } = useCachedResource<IBajasResponse>(
    `bajas:${mes}`,
    () => getBajas(mes),
    { ttl: 300_000 }
  );

  // Obtener motivos únicos para el filtro
  const motivosUnicos = data 
    ? Array.from(new Set(data.bajas.map((b) => b.motivo))).sort()
    : [];

  // Filtrar bajas por motivo
  const bajasFiltradas = data
    ? motivoFilter === "todos"
      ? data.bajas
      : data.bajas.filter((b) => b.motivo === motivoFilter)
    : [];

  return (
    <div className="w-full min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
            Movimientos de bajas
          </h2>
          <div className="flex items-center gap-3">
            <Select value={motivoFilter} onValueChange={setMotivoFilter}>
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="Todos los motivos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los motivos</SelectItem>
                {motivosUnicos.map((motivo) => (
                  <SelectItem key={motivo} value={motivo}>
                    {motivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <MonthPicker value={mes} max={mesActual} onChange={setMes} />
          </div>
        </div>

        {loading ? (
          <LoadingSpin />
        ) : data ? (
          <>
            {/* Totales */}
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="border-l-2 border-orange-400 pl-4 py-2">
                <dt className="text-sm text-orange-400">Valor en bajas (costo)</dt>
                <dd className="text-3xl sm:text-4xl font-semibold text-orange-400">
                  {formatCurrency(data.totalCosto)}
                </dd>
              </div>
              <div className="border-l-2 border-stone-50 pl-4 py-2">
                <dt className="text-sm text-amber-100">Parte pagada</dt>
                <dd className="text-3xl sm:text-4xl font-semibold text-amber-50">
                  {formatCurrency(data.totalPartePagada)}
                </dd>
              </div>
              <div className="border-l-2 border-stone-50 pl-4 py-2">
                <dt className="text-sm text-amber-100">Pérdida neta</dt>
                <dd className="text-3xl sm:text-4xl font-semibold text-amber-50">
                  {formatCurrency(data.totalNeto)}
                </dd>
              </div>
              <div className="border-l-2 border-stone-50 pl-4 py-2">
                <dt className="text-sm text-amber-100">Cantidad de bajas</dt>
                <dd className="text-3xl sm:text-4xl font-semibold text-amber-50">
                  {data.cantidadBajas}
                </dd>
              </div>
            </dl>

            {/* Lista */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {/* Tabla desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-300">
                      <th className="text-left py-3 px-5 font-medium">Fecha</th>
                      <th className="text-left py-3 px-5 font-medium">Producto</th>
                      <th className="text-left py-3 px-5 font-medium">Motivo</th>
                      <th className="text-right py-3 px-5 font-medium">Cant.</th>
                      <th className="text-right py-3 px-5 font-medium">Costo</th>
                      <th className="text-right py-3 px-5 font-medium">Pagado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bajasFiltradas.map((b, i) => (
                      <tr
                        key={b.id}
                        className={`border-b border-white/5 ${
                          i % 2 === 0 ? "bg-white/2" : ""
                        }`}
                      >
                        <td className="py-3 px-5 text-gray-300">
                          {new Date(b.fecha).toLocaleDateString("es-MX")}
                        </td>
                        <td className="py-3 px-5 text-amber-50">{b.itemName}</td>
                        <td className="py-3 px-5 text-gray-300">{b.motivo}</td>
                        <td className="py-3 px-5 text-right text-white">
                          {b.cantidad}
                        </td>
                        <td className="py-3 px-5 text-right text-orange-300">
                          {formatCurrency(b.costoUnitario * b.cantidad)}
                        </td>
                        <td className="py-3 px-5 text-right text-emerald-300">
                          {formatCurrency(b.partePagada)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards móvil */}
              <div className="md:hidden divide-y divide-white/5">
                {bajasFiltradas.map((b) => (
                  <div key={b.id} className="p-4">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="text-amber-50 font-medium">
                        {b.itemName}
                      </span>
                      <span className="text-orange-300 font-semibold shrink-0">
                        {formatCurrency(b.costoUnitario * b.cantidad)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 flex flex-wrap gap-x-3">
                      <span>{new Date(b.fecha).toLocaleDateString("es-MX")}</span>
                      <span>{b.cantidad} u</span>
                      <span>{b.motivo}</span>
                      {b.partePagada > 0 && (
                        <span className="text-emerald-300">
                          pagado {formatCurrency(b.partePagada)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {bajasFiltradas.length === 0 && (
                <p className="p-10 text-center text-gray-400">
                  {motivoFilter === "todos" 
                    ? "No hay bajas registradas en este mes."
                    : "No hay bajas con este motivo."}
                </p>
              )}
            </div>
          </>
        ) : error ? (
          <p className="text-red-500">No se pudieron cargar las bajas.</p>
        ) : null}
      </div>
    </div>
  );
};

export default Bajas;
