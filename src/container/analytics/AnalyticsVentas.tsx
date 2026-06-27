import { useState } from "react";
import {
  Boxes,
  CalendarDays,
  Clock,
  PieChart,
  Receipt,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { getAnalitica, getInventarioInmovil } from "../../Api/castilloApi";
import {
  IAnaliticaResponse,
  IInventarioInmovilResponse,
} from "../../interfaces/interfaces";
import { useCachedResource } from "../../hooks/useCachedResource";
import LoadingSpin from "../../components/LoadingSpin";
import { fmtCup, Seccion, SelectorRango, Tabla } from "./shared";

const AnalyticsVentas = () => {
  const [dias, setDias] = useState(30);

  // Comparte caché con la pantalla "Resumen" (misma clave por rango).
  const { data, loading, error } = useCachedResource<IAnaliticaResponse>(
    `analitica:${dias}`,
    () => getAnalitica(dias),
    { ttl: 300_000 }
  );

  // Inventario inmóvil: recurso aparte (pesado), no bloquea el resto.
  const {
    data: inmovil,
    loading: inmovilLoading,
  } = useCachedResource<IInventarioInmovilResponse>(
    "analitica:inmovil",
    () => getInventarioInmovil(),
    { ttl: 3_600_000 }
  );

  return (
    <div className="w-full min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Encabezado + selector de rango */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
            Ventas
          </h2>
          <SelectorRango dias={dias} setDias={setDias} />
        </div>

        {loading && <LoadingSpin />}

        {!loading && error && !data && (
          <p className="text-red-400">
            No se pudo cargar el análisis. Intenta de nuevo.
          </p>
        )}

        {!loading && data && (
          <>
            {/* ---------- KPIs ---------- */}
            <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <KpiCard
                icono={<Receipt className="size-5 text-amber-300" />}
                etiqueta="Ticket promedio"
                valor={fmtCup(data.ticket.promedio)}
                pie={
                  <Tendencia pct={data.ticket.tendenciaPct} />
                }
              />
              <KpiCard
                icono={<Clock className="size-5 text-emerald-300" />}
                etiqueta="Hora pico"
                valor={`${data.temporal.horaPico}:00`}
                pie={
                  <span className="text-amber-100/50">
                    La hora que más factura
                  </span>
                }
              />
              <KpiCard
                icono={<CalendarDays className="size-5 text-sky-300" />}
                etiqueta="Día pico"
                valor={data.temporal.diaPico}
                pie={
                  <span className="text-amber-100/50">
                    El día que más factura
                  </span>
                }
              />
            </div>

            {/* ---------- ¿Cuándo se vende más? ---------- */}
            <Seccion
              icono={<Clock className="size-5 text-emerald-400" />}
              titulo="¿Cuándo se vende más?"
              subtitulo="Ingresos por hora del día y por día de la semana."
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Barras
                  titulo="Por hora"
                  datos={data.temporal.porHora.map((h) => ({
                    etiqueta: `${h.hora}`,
                    valor: h.ingresos,
                    destacado: h.hora === data.temporal.horaPico,
                  }))}
                />
                <Barras
                  titulo="Por día de la semana"
                  datos={data.temporal.porDia.map((d) => ({
                    etiqueta: d.nombre.slice(0, 3),
                    valor: d.ingresos,
                    destacado: d.nombre === data.temporal.diaPico,
                  }))}
                />
              </div>
            </Seccion>

            {/* ---------- Evolución del ticket / ingresos ---------- */}
            <Seccion
              icono={<TrendingUp className="size-5 text-emerald-400" />}
              titulo="Evolución de las ventas"
              subtitulo="Ingresos por día en el rango seleccionado."
            >
              <Barras
                titulo=""
                datos={data.ticket.serie.map((s) => ({
                  etiqueta: s.fecha.slice(5), // MM-DD
                  valor: s.ingresos,
                  destacado: false,
                }))}
                compacta
              />
            </Seccion>

            {/* ---------- Concentración (Pareto) ---------- */}
            <Seccion
              icono={<PieChart className="size-5 text-yellow-300" />}
              titulo="Concentración de ventas"
              subtitulo="Cuánto dependes de pocos productos (regla de Pareto)."
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <MiniStat
                  valor={`${data.concentracion.productosPara80pct}`}
                  etiqueta="productos hacen el 80% de los ingresos"
                  destacar
                />
                <MiniStat
                  valor={`${data.concentracion.pctTop5}%`}
                  etiqueta="lo aportan los top 5"
                />
                <MiniStat
                  valor={`${data.concentracion.pctTop10}%`}
                  etiqueta="lo aportan los top 10"
                />
                <MiniStat
                  valor={`${data.concentracion.pctTop20}%`}
                  etiqueta="lo aportan los top 20"
                />
              </div>
              <p className="mt-3 text-sm text-amber-100/50">
                {data.concentracion.totalProductosVendidos} productos distintos
                vendidos. Si pocos concentran casi todo, un solo agotado te tumba
                la facturación: protege esos productos.
              </p>
            </Seccion>

            {/* ---------- Inventario inmóvil (recurso aparte) ---------- */}
            <Seccion
              icono={<Boxes className="size-5 text-orange-400" />}
              titulo="Inventario inmóvil"
              subtitulo={
                inmovil
                  ? `${fmtCup(
                      inmovil.totalCapital
                    )} inmovilizados en productos sin vender (mira ${
                      inmovil.lookbackDias
                    } días atrás).`
                  : "Stock que no se vende, por antigüedad."
              }
            >
              {inmovilLoading && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-amber-100/60">
                  Calculando antigüedad del inventario… (puede tardar la primera
                  vez)
                </div>
              )}
              {!inmovilLoading && inmovil && inmovil.buckets.length === 0 && (
                <p className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-emerald-300">
                  No hay inventario inmóvil. ¡Bien!
                </p>
              )}
              {!inmovilLoading &&
                inmovil &&
                inmovil.buckets.map((b) => (
                  <div key={b.etiqueta} className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-orange-200">
                        {b.etiqueta}
                      </h4>
                      <span className="text-sm text-orange-300/80">
                        {fmtCup(b.totalCapital)} inmovilizados
                      </span>
                    </div>
                    <Tabla
                      headers={[
                        "Producto",
                        "Stock",
                        "Última venta",
                        "Inmovilizado",
                      ]}
                      vacio="—"
                      filas={b.items.map((i) => ({
                        key: i.variantId,
                        celdas: [
                          <span className="text-amber-50">{i.itemName}</span>,
                          <span className="text-gray-300">{i.stock}</span>,
                          <span className="text-gray-300">
                            {i.diasSinVenta === null
                              ? "Nunca / +120d"
                              : `hace ${i.diasSinVenta} días`}
                          </span>,
                          <span className="text-orange-300">
                            {fmtCup(i.capitalInmovilizado)}
                          </span>,
                        ],
                      }))}
                    />
                  </div>
                ))}
            </Seccion>
          </>
        )}
      </div>
    </div>
  );
};

// ---------- Subcomponentes ----------

const KpiCard = ({
  icono,
  etiqueta,
  valor,
  pie,
}: {
  icono: React.ReactNode;
  etiqueta: string;
  valor: string;
  pie?: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <div className="mb-2 flex items-center gap-2 text-sm text-amber-100/60">
      {icono}
      {etiqueta}
    </div>
    <p className="text-2xl font-semibold text-amber-50 sm:text-3xl">{valor}</p>
    {pie && <p className="mt-1 text-xs">{pie}</p>}
  </div>
);

const Tendencia = ({ pct }: { pct: number }) => {
  if (pct === 0)
    return <span className="text-amber-100/50">Estable vs. inicio</span>;
  const sube = pct > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 ${
        sube ? "text-emerald-300" : "text-red-300"
      }`}
    >
      {sube ? (
        <TrendingUp className="size-3.5" />
      ) : (
        <TrendingDown className="size-3.5" />
      )}
      {Math.abs(pct)}% vs. inicio del rango
    </span>
  );
};

const MiniStat = ({
  valor,
  etiqueta,
  destacar,
}: {
  valor: string;
  etiqueta: string;
  destacar?: boolean;
}) => (
  <div
    className={`rounded-xl border p-4 ${
      destacar
        ? "border-yellow-400/30 bg-yellow-400/10"
        : "border-white/10 bg-white/5"
    }`}
  >
    <p
      className={`text-2xl font-semibold ${
        destacar ? "text-yellow-200" : "text-amber-50"
      }`}
    >
      {valor}
    </p>
    <p className="mt-1 text-xs text-amber-100/60">{etiqueta}</p>
  </div>
);

// Gráfico de barras vertical sencillo (CSS puro), normalizado al máximo.
const Barras = ({
  titulo,
  datos,
  compacta,
}: {
  titulo: string;
  datos: { etiqueta: string; valor: number; destacado?: boolean }[];
  compacta?: boolean;
}) => {
  const max = Math.max(1, ...datos.map((d) => d.valor));
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      {titulo && (
        <p className="mb-3 text-sm font-medium text-amber-100/80">{titulo}</p>
      )}
      <div className="flex h-40 items-end gap-1 overflow-x-auto">
        {datos.map((d, i) => (
          <div
            key={i}
            className="group flex min-w-0 flex-1 flex-col items-center justify-end"
            title={`${d.etiqueta}: ${fmtCup(d.valor)}`}
          >
            <div
              className={`w-full rounded-t transition-all ${
                d.destacado
                  ? "bg-amber-400/90"
                  : "bg-emerald-500/50 group-hover:bg-emerald-400/70"
              }`}
              style={{
                height: `${Math.max(2, (d.valor / max) * 100)}%`,
                minWidth: compacta ? 4 : 8,
              }}
            />
            {!compacta && (
              <span className="mt-1 text-[10px] text-amber-100/50">
                {d.etiqueta}
              </span>
            )}
          </div>
        ))}
      </div>
      {compacta && (
        <div className="mt-1 flex justify-between text-[10px] text-amber-100/40">
          <span>{datos[0]?.etiqueta}</span>
          <span>{datos[datos.length - 1]?.etiqueta}</span>
        </div>
      )}
    </div>
  );
};

export default AnalyticsVentas;
