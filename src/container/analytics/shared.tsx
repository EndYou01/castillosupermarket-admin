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
