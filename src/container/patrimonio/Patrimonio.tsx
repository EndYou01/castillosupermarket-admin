import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  getPatrimonio,
  getPatrimonioHistorial,
  guardarSnapshotPatrimonio,
} from "../../Api/castilloApi";
import {
  IPatrimonio,
  IPatrimonioSnapshot,
} from "../../interfaces/interfaces";
import { Button } from "../../components/shadcn/Button";
import LoadingSpin from "../../components/LoadingSpin";

const fmtCup = (n: number) =>
  new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(
    Math.floor(n)
  ) + " cup";

const fmtUsd = (n: number | null) =>
  n === null
    ? "—"
    : "$" +
      new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);

const Patrimonio = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IPatrimonio | null>(null);
  const [historial, setHistorial] = useState<IPatrimonioSnapshot[]>([]);
  const [saving, setSaving] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = async () => {
    const [p, h] = await Promise.all([
      getPatrimonio(),
      getPatrimonioHistorial(60),
    ]);
    setData(p);
    setHistorial(h);
    setLoading(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const guardar = async () => {
    setSaving(true);
    setAviso(null);
    const res = await guardarSnapshotPatrimonio();
    setSaving(false);
    if (res.ok) {
      setAviso("Foto guardada");
      cargar();
    } else {
      setAviso(res.error ?? "No se pudo guardar la foto");
    }
  };

  if (loading) return <LoadingSpin />;

  // Tendencia: comparar la foto más reciente con la anterior (en USD).
  const ultimaTendencia =
    historial.length >= 2 &&
    historial[0].totalUsd !== null &&
    historial[1].totalUsd !== null
      ? historial[0].totalUsd! - historial[1].totalUsd!
      : null;

  return (
    <div className="w-full min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl">
            Patrimonio
          </h2>
          <Button
            onClick={guardar}
            disabled={saving}
            className="bg-amber-500/90 text-white hover:bg-amber-600 w-fit"
          >
            {saving ? "Guardando..." : "Guardar foto"}
          </Button>
        </div>

        {!data ? (
          <p className="text-red-500">No se pudo cargar el patrimonio.</p>
        ) : (
          <>
            {/* Valor real en USD */}
            <div className="border-l-2 border-emerald-400 pl-6 py-4 mb-6">
              <dt className="text-base text-emerald-300 mb-2 flex items-center gap-2">
                Patrimonio real (USD)
                {ultimaTendencia !== null &&
                  (ultimaTendencia >= 0 ? (
                    <TrendingUp className="size-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="size-5 text-red-400" />
                  ))}
              </dt>
              <dd className="text-4xl sm:text-6xl font-semibold tracking-tight text-emerald-300">
                {fmtUsd(data.totalUsd)}
              </dd>
              <p className="text-sm text-amber-100/60 mt-2">
                {fmtCup(data.totalCup)}
                {data.tasaUsd
                  ? ` · dólar a ${Math.round(data.tasaUsd)}${
                      data.tasaEsRespaldo ? " (última tasa guardada)" : ""
                    }`
                  : ""}
              </p>
            </div>

            {data.totalUsd === null && (
              <p className="text-amber-300/90 text-sm mb-6 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3">
                No hay tasa del dólar disponible. Configura el token de eltoque
                (<code>EL_TOQUE_API_TOKEN</code>) para ver el patrimonio en USD.
              </p>
            )}

            {/* Desglose */}
            <dl className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <div className="border-l-2 border-stone-50 pl-4 py-2">
                <dt className="text-sm text-amber-100">Capital disponible</dt>
                <dd className="text-2xl sm:text-3xl font-semibold text-amber-50">
                  {fmtCup(data.capital)}
                </dd>
              </div>
              <div className="border-l-2 border-stone-50 pl-4 py-2">
                <dt className="text-sm text-amber-100">Inventario (al costo)</dt>
                <dd className="text-2xl sm:text-3xl font-semibold text-amber-50">
                  {fmtCup(data.inventario)}
                </dd>
              </div>
              <div className="border-l-2 border-orange-400 pl-4 py-2">
                <dt className="text-sm text-orange-400">Total (CUP)</dt>
                <dd className="text-2xl sm:text-3xl font-semibold text-orange-400">
                  {fmtCup(data.totalCup)}
                </dd>
              </div>
            </dl>

            {aviso && <p className="text-sm text-amber-200 mb-6">{aviso}</p>}

            {/* Tendencia */}
            <h3 className="text-xl sm:text-2xl font-semibold text-amber-50 mb-4">
              Tendencia
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-300">
                      <th className="text-left py-3 px-5 font-medium">Fecha</th>
                      <th className="text-right py-3 px-5 font-medium">
                        Total CUP
                      </th>
                      <th className="text-right py-3 px-5 font-medium">Dólar</th>
                      <th className="text-right py-3 px-5 font-medium">
                        Total USD
                      </th>
                      <th className="text-right py-3 px-5 font-medium">Δ USD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((s, i) => {
                      const prev = historial[i + 1];
                      const delta =
                        prev && s.totalUsd !== null && prev.totalUsd !== null
                          ? s.totalUsd - prev.totalUsd
                          : null;
                      return (
                        <tr
                          key={s.id}
                          className={`border-b border-white/5 ${
                            i % 2 === 0 ? "bg-white/[0.02]" : ""
                          }`}
                        >
                          <td className="py-3 px-5 text-gray-300">
                            {new Date(s.fecha).toLocaleDateString("es-MX")}
                          </td>
                          <td className="py-3 px-5 text-right text-amber-50">
                            {fmtCup(s.totalCup)}
                          </td>
                          <td className="py-3 px-5 text-right text-gray-400">
                            {s.tasaUsd ? Math.round(s.tasaUsd) : "—"}
                          </td>
                          <td className="py-3 px-5 text-right text-emerald-200">
                            {fmtUsd(s.totalUsd)}
                          </td>
                          <td
                            className={`py-3 px-5 text-right ${
                              delta === null
                                ? "text-gray-500"
                                : delta >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {delta === null
                              ? "—"
                              : (delta >= 0 ? "+" : "") + fmtUsd(delta)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {historial.length === 0 && (
                <p className="p-10 text-center text-gray-400">
                  Aún no hay fotos guardadas. Se guarda una automática cada
                  noche, o usa "Guardar foto".
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Patrimonio;
