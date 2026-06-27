import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  AlertTriangle,
  Lightbulb,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { getAnalitica, getAsistenteIA } from "../../Api/castilloApi";
import { IAnaliticaResponse } from "../../interfaces/interfaces";
import { useCachedResource } from "../../hooks/useCachedResource";
import { Button } from "../../components/shadcn/Button";
import LoadingSpin from "../../components/LoadingSpin";
import { fmtCup, Seccion, SelectorRango, Tabla } from "./shared";

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
          <SelectorRango dias={dias} setDias={setDias} />
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

            {/* ---------- Venta perdida por agotados ---------- */}
            {data.ventaPerdida.totalDia > 0 && (
              <div className="mb-8 flex flex-col gap-1 rounded-2xl border border-red-400/30 bg-red-500/10 p-5">
                <div className="flex items-center gap-2 text-red-300">
                  <TrendingDown className="size-5" />
                  <span className="text-sm font-medium uppercase tracking-wide">
                    Venta perdida por agotados
                  </span>
                </div>
                <p className="text-2xl font-semibold text-red-100 sm:text-3xl">
                  ~{fmtCup(data.ventaPerdida.totalDia)} / día
                </p>
                <p className="text-sm text-red-200/70">
                  ≈ {fmtCup(data.ventaPerdida.totalMes)} al mes que se escapan
                  por {data.ventaPerdida.items.length} producto(s) agotado(s)
                  con demanda.
                </p>
              </div>
            )}

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
                  "Pierde/día",
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
                    <span className="text-red-300">
                      {r.ventaPerdidaDia > 0 ? fmtCup(r.ventaPerdidaDia) : "—"}
                    </span>,
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
              subtitulo="Clase A = los que más ganancia dejan. GMROI = ganancia por cada CUP invertido en stock (mayor = mejor)."
            >
              <Tabla
                headers={[
                  "Producto",
                  "ABC",
                  "Margen",
                  "GMROI",
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
                    <span
                      className={
                        m.gmroi === null
                          ? "text-gray-500"
                          : m.gmroi >= 1
                          ? "text-emerald-300"
                          : "text-amber-300"
                      }
                    >
                      {m.gmroi === null ? "—" : `${m.gmroi.toFixed(2)}×`}
                    </span>,
                    <span className="text-gray-300">{m.unidadesVendidas}</span>,
                    <span className="text-emerald-300">
                      {fmtCup(m.ganancia)}
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
