import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  AlertTriangle,
  Boxes,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { getAnalitica, getAsistenteIA } from "../../Api/castilloApi";
import { IAnaliticaResponse } from "../../interfaces/interfaces";
import { useCachedResource } from "../../hooks/useCachedResource";
import { Button } from "../../components/shadcn/Button";
import LoadingSpin from "../../components/LoadingSpin";

const fmtCup = (n: number) =>
  new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(
    Math.round(n)
  ) + " cup";

const RANGOS = [
  { label: "7 días", dias: 7 },
  { label: "30 días", dias: 30 },
  { label: "90 días", dias: 90 },
];

const Analytics = () => {
  const [dias, setDias] = useState(30);

  const { data, loading, error } = useCachedResource<IAnaliticaResponse>(
    `analitica:${dias}`,
    () => getAnalitica(dias),
    { ttl: 300_000 }
  );

  // Estado del asistente IA.
  const [iaLoading, setIaLoading] = useState(false);
  const [iaTexto, setIaTexto] = useState<string | null>(null);

  const pedirIA = async () => {
    setIaLoading(true);
    setIaTexto(null);
    const res = await getAsistenteIA(dias);
    setIaTexto(res.mensaje);
    setIaLoading(false);
  };

  return (
    <div className="w-full min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Encabezado + selector de rango */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
            Analítica
          </h2>
          <div className="flex gap-2">
            {RANGOS.map((r) => (
              <Button
                key={r.dias}
                onClick={() => setDias(r.dias)}
                className={
                  dias === r.dias
                    ? "bg-amber-500/90 text-white hover:bg-amber-600"
                    : "bg-white/5 text-amber-100 hover:bg-white/10"
                }
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Botón asistente IA */}
        <div className="mb-8">
          <Button
            onClick={pedirIA}
            disabled={iaLoading}
            className="bg-emerald-600/90 text-white hover:bg-emerald-700 w-fit flex items-center gap-2"
          >
            <Sparkles className="size-4" />
            {iaLoading ? "Analizando..." : "Pregúntale a la IA"}
          </Button>
          {iaTexto && <RespuestaIA texto={iaTexto} />}
        </div>

        {loading && <LoadingSpin />}

        {!loading && error && !data && (
          <p className="text-red-400">
            No se pudo cargar el análisis. Intenta de nuevo.
          </p>
        )}

        {!loading && data && (
          <>
            <p className="text-sm text-amber-100/60 mb-8">
              {data.recibosAnalizados} ventas analizadas en {data.rango.dias}{" "}
              días.
            </p>

            {/* ---------- 1. Reposición ---------- */}
            <Seccion
              icono={<AlertTriangle className="size-5 text-amber-400" />}
              titulo="Hay que comprar"
              subtitulo={`Cobertura objetivo: ${data.coberturaObjetivoDias} días`}
            >
              <Tabla
                headers={[
                  "Producto",
                  "Stock",
                  "Vende/día",
                  "Se agota en",
                  "Comprar",
                ]}
                vacio="Sin datos de venta en este rango."
                filas={data.reposicion.map((r) => ({
                  key: r.variantId,
                  destacar: r.agotado || (r.diasParaAgotar ?? 99) <= 5,
                  celdas: [
                    <span className="text-amber-50">{r.itemName}</span>,
                    <span className="text-gray-300">{r.stock}</span>,
                    <span className="text-gray-300">{r.velocidadDia}</span>,
                    r.agotado ? (
                      <span className="text-red-400 font-medium">AGOTADO</span>
                    ) : r.diasParaAgotar === null ? (
                      <span className="text-gray-500">—</span>
                    ) : (
                      <span
                        className={
                          r.diasParaAgotar <= 5
                            ? "text-amber-400"
                            : "text-gray-300"
                        }
                      >
                        {r.diasParaAgotar} días
                      </span>
                    ),
                    <span className="text-emerald-300 font-medium">
                      {r.sugerenciaCompra > 0 ? `+${r.sugerenciaCompra}` : "—"}
                    </span>,
                  ],
                }))}
              />
            </Seccion>

            {/* ---------- 2. Márgenes / ABC ---------- */}
            <Seccion
              icono={<TrendingUp className="size-5 text-emerald-400" />}
              titulo="Márgenes y productos estrella"
              subtitulo="Clase A = los que más ganancia dejan (regla 80/15/5)"
            >
              <Tabla
                headers={[
                  "Producto",
                  "ABC",
                  "Margen",
                  "Vendidos",
                  "Ganancia",
                ]}
                vacio="Sin ventas en este rango."
                filas={data.margenes.items.map((m) => ({
                  key: m.variantId,
                  destacar: m.bajoMargen,
                  celdas: [
                    <span className="text-amber-50">{m.itemName}</span>,
                    <ChipABC clase={m.claseABC} />,
                    <span
                      className={
                        m.bajoMargen ? "text-red-400" : "text-gray-300"
                      }
                    >
                      {Math.round(m.margenPct * 100)}%
                      {m.precio <= m.costo ? " ⚠" : ""}
                    </span>,
                    <span className="text-gray-300">{m.unidadesVendidas}</span>,
                    <span className="text-emerald-300">
                      {fmtCup(m.ganancia)}
                    </span>,
                  ],
                }))}
              />
            </Seccion>

            {/* Capital parado */}
            <Seccion
              icono={<Boxes className="size-5 text-orange-400" />}
              titulo="Capital parado"
              subtitulo={`Total inmovilizado: ${fmtCup(
                data.margenes.totalCapitalParado
              )} en productos sin ventas`}
            >
              <Tabla
                headers={["Producto", "Stock", "Costo", "Inmovilizado"]}
                vacio="No hay capital parado. ¡Bien!"
                filas={data.margenes.capitalParado.map((c) => ({
                  key: c.variantId,
                  celdas: [
                    <span className="text-amber-50">{c.itemName}</span>,
                    <span className="text-gray-300">{c.stock}</span>,
                    <span className="text-gray-300">{fmtCup(c.costo)}</span>,
                    <span className="text-orange-300">
                      {fmtCup(c.capitalInmovilizado)}
                    </span>,
                  ],
                }))}
              />
            </Seccion>

            {/* ---------- 3. Combos ---------- */}
            <Seccion
              icono={<Lightbulb className="size-5 text-yellow-300" />}
              titulo="Combos para promociones"
              subtitulo="Productos que se compran juntos (lift > 1 = relación real)"
            >
              <Tabla
                headers={["Producto A", "Producto B", "Juntos", "Confianza", "Lift"]}
                vacio="Aún no hay suficientes datos para detectar combos."
                filas={data.combos.map((c, i) => ({
                  key: `${c.itemA}-${c.itemB}-${i}`,
                  celdas: [
                    <span className="text-amber-50">{c.itemA}</span>,
                    <span className="text-amber-50">{c.itemB}</span>,
                    <span className="text-gray-300">{c.veces}</span>,
                    <span className="text-gray-300">
                      {Math.round(c.confianza * 100)}%
                    </span>,
                    <span className="text-emerald-300 font-medium">
                      {c.lift}×
                    </span>,
                  ],
                }))}
              />
            </Seccion>
          </>
        )}
      </div>
    </div>
  );
};

// ---------- Subcomponentes de presentación ----------

const Seccion = ({
  icono,
  titulo,
  subtitulo,
  children,
}: {
  icono: React.ReactNode;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) => (
  <section className="mb-10">
    <div className="flex items-center gap-2 mb-1">
      {icono}
      <h3 className="text-xl sm:text-2xl font-semibold text-amber-50">
        {titulo}
      </h3>
    </div>
    {subtitulo && (
      <p className="text-sm text-amber-100/50 mb-4">{subtitulo}</p>
    )}
    {children}
  </section>
);

const Tabla = ({
  headers,
  filas,
  vacio,
  limite = 10,
}: {
  headers: string[];
  filas: { key: string; celdas: React.ReactNode[]; destacar?: boolean }[];
  vacio: string;
  limite?: number;
}) => {
  // Las filas ya vienen ordenadas por importancia desde el backend, así que
  // mostramos solo las primeras `limite` (las más relevantes) hasta expandir.
  const [expandido, setExpandido] = useState(false);
  const hayMas = filas.length > limite;
  const visibles = expandido ? filas : filas.slice(0, limite);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-gray-300">
              {headers.map((h, i) => (
                <th
                  key={h}
                  className={`py-3 px-5 font-medium ${
                    i === 0 ? "text-left" : "text-right"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibles.map((fila, idx) => (
              <tr
                key={fila.key}
                className={`border-b border-white/5 ${
                  fila.destacar
                    ? "bg-red-500/5"
                    : idx % 2 === 0
                    ? "bg-white/[0.02]"
                    : ""
                }`}
              >
                {fila.celdas.map((celda, i) => (
                  <td
                    key={i}
                    className={`py-3 px-5 ${
                      i === 0 ? "text-left" : "text-right"
                    }`}
                  >
                    {celda}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filas.length === 0 && (
        <p className="p-10 text-center text-gray-400">{vacio}</p>
      )}
      {hayMas && (
        <button
          onClick={() => setExpandido((v) => !v)}
          className="w-full py-3 text-sm font-medium text-amber-200 hover:bg-white/5 transition-colors border-t border-white/10"
        >
          {expandido
            ? "Ver menos"
            : `Ver más (${filas.length - limite} restantes)`}
        </button>
      )}
    </div>
  );
};

const ChipABC = ({ clase }: { clase: "A" | "B" | "C" | "-" }) => {
  const color =
    clase === "A"
      ? "bg-emerald-500/20 text-emerald-300"
      : clase === "B"
      ? "bg-amber-500/20 text-amber-300"
      : clase === "C"
      ? "bg-gray-500/20 text-gray-300"
      : "bg-transparent text-gray-500";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs ${color}`}>
      {clase}
    </span>
  );
};

// ---------- Respuesta del asistente IA (Markdown estilizado) ----------

const RespuestaIA = ({ texto }: { texto: string }) => (
  <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-gradient-to-b from-emerald-400/[0.07] to-emerald-400/[0.02] overflow-hidden">
    <div className="flex items-center gap-2 border-b border-emerald-400/15 bg-emerald-400/5 px-5 py-3">
      <Sparkles className="size-4 text-emerald-300" />
      <span className="text-sm font-semibold tracking-wide text-emerald-200">
        Análisis de la IA
      </span>
    </div>
    <div className="px-5 py-5 sm:px-6">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h3 className="mt-6 mb-3 text-lg font-semibold text-amber-50 first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="mt-6 mb-3 flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-emerald-300 first:mt-0">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-5 mb-2 text-sm font-semibold text-amber-100 first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-3 text-sm leading-relaxed text-emerald-50/90 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-amber-200">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-2 pl-5 marker:text-emerald-400/70 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-2 pl-5 marker:font-semibold marker:text-emerald-300/80 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1 text-sm leading-relaxed text-emerald-50/90">
              {children}
            </li>
          ),
          hr: () => <hr className="my-5 border-emerald-400/15" />,
          a: ({ children, href }) => (
            <a href={href} className="text-emerald-300 underline">
              {children}
            </a>
          ),
        }}
      >
        {texto}
      </ReactMarkdown>
    </div>
  </div>
);

export default Analytics;
