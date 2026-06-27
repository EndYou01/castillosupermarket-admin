import { useState } from "react";

// Formatea un número como "1.234 cup" (sin decimales).
export const fmtCup = (n: number) =>
  new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(
    Math.round(n)
  ) + " cup";

// Rangos de tiempo disponibles en el selector de ambas pantallas.
export const RANGOS = [
  { label: "7 días", dias: 7 },
  { label: "30 días", dias: 30 },
  { label: "90 días", dias: 90 },
];

// Encabezado de sección con icono, título y subtítulo opcional.
export const Seccion = ({
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
    {subtitulo && <p className="text-sm text-amber-100/50 mb-4">{subtitulo}</p>}
    {children}
  </section>
);

// Tabla con límite de filas + botón "Ver más". Las filas deben venir ya
// ordenadas por importancia desde el backend (mostramos las primeras `limite`).
export const Tabla = ({
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

// Texto en negrita inline: convierte **negrita** en <strong> dentro de una línea.
const inline = (texto: string): React.ReactNode[] =>
  texto.split(/(\*\*[^*]+\*\*)/g).map((trozo, i) => {
    if (trozo.startsWith("**") && trozo.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-amber-200">
          {trozo.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{trozo}</span>;
  });

// Mini-renderer de Markdown (sin dependencias) para la respuesta de la IA.
// Soporta: encabezados ##/###, viñetas "- "/"* ", listas numeradas, --- y **negrita**.
export const MiniMarkdown = ({ texto }: { texto: string }) => {
  const lineas = texto.replace(/\r/g, "").split("\n");
  const bloques: React.ReactNode[] = [];
  let lista: { tipo: "ul" | "ol"; items: string[] } | null = null;
  let key = 0;

  const cerrarLista = () => {
    if (!lista) return;
    const items = lista.items.map((t, i) => (
      <li key={i} className="pl-1 text-sm leading-relaxed text-emerald-50/90">
        {inline(t)}
      </li>
    ));
    bloques.push(
      lista.tipo === "ol" ? (
        <ol
          key={key++}
          className="mb-4 list-decimal space-y-2 pl-5 marker:font-semibold marker:text-emerald-300/80"
        >
          {items}
        </ol>
      ) : (
        <ul
          key={key++}
          className="mb-4 list-disc space-y-2 pl-5 marker:text-emerald-400/70"
        >
          {items}
        </ul>
      )
    );
    lista = null;
  };

  for (const cruda of lineas) {
    const linea = cruda.trim();
    if (!linea) {
      cerrarLista();
      continue;
    }
    // Separadores horizontales.
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(linea)) {
      cerrarLista();
      bloques.push(<hr key={key++} className="my-5 border-emerald-400/15" />);
      continue;
    }
    // Encabezados.
    const h = linea.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      cerrarLista();
      const nivel = h[1].length;
      bloques.push(
        nivel <= 2 ? (
          <h3
            key={key++}
            className="mt-6 mb-3 text-base font-semibold uppercase tracking-wide text-emerald-300 first:mt-0"
          >
            {inline(h[2])}
          </h3>
        ) : (
          <h4
            key={key++}
            className="mt-5 mb-2 text-sm font-semibold text-amber-100 first:mt-0"
          >
            {inline(h[2])}
          </h4>
        )
      );
      continue;
    }
    // Viñetas.
    const vi = linea.match(/^[-*]\s+(.*)$/);
    if (vi) {
      if (!lista || lista.tipo !== "ul") {
        cerrarLista();
        lista = { tipo: "ul", items: [] };
      }
      lista.items.push(vi[1]);
      continue;
    }
    // Lista numerada.
    const nu = linea.match(/^\d+[.)]\s+(.*)$/);
    if (nu) {
      if (!lista || lista.tipo !== "ol") {
        cerrarLista();
        lista = { tipo: "ol", items: [] };
      }
      lista.items.push(nu[1]);
      continue;
    }
    // Párrafo normal.
    cerrarLista();
    bloques.push(
      <p key={key++} className="mb-3 text-sm leading-relaxed text-emerald-50/90">
        {inline(linea)}
      </p>
    );
  }
  cerrarLista();

  return <>{bloques}</>;
};

// Selector de rango (7 / 30 / 90 días) compartido por ambas pantallas.
export const SelectorRango = ({
  dias,
  setDias,
}: {
  dias: number;
  setDias: (d: number) => void;
}) => (
  <div className="flex gap-2">
    {RANGOS.map((r) => (
      <button
        key={r.dias}
        onClick={() => setDias(r.dias)}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          dias === r.dias
            ? "bg-amber-500/90 text-white hover:bg-amber-600"
            : "bg-white/5 text-amber-100 hover:bg-white/10"
        }`}
      >
        {r.label}
      </button>
    ))}
  </div>
);
