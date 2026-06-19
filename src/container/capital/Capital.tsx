import { useEffect, useState } from "react";
import {
  getCapital,
  setCapital,
  registrarCierre,
} from "../../Api/castilloApi";
import { ICapitalResponse, IMovimientoCapital } from "../../interfaces/interfaces";
import { Button } from "../../components/shadcn/Button";
import LoadingSpin from "../../components/LoadingSpin";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.floor(amount)) + " cup";

const tipoLabel: Record<IMovimientoCapital["tipo"], string> = {
  CONTEO: "Conteo",
  CIERRE: "Cierre",
  BAJA: "Baja",
  COMPRA: "Compra",
  AJUSTE: "Ajuste",
};

const Capital = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ICapitalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [saving, setSaving] = useState(false);

  const [closing, setClosing] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = async () => {
    const res = await getCapital();
    if (res) setData(res);
    else setError("No se pudo cargar el capital");
    setLoading(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const guardarConteo = async () => {
    const monto = Number(nuevoMonto);
    if (!Number.isFinite(monto)) {
      setAviso("Escribe un número válido");
      return;
    }
    setSaving(true);
    setAviso(null);
    const res = await setCapital(monto, "Conteo manual");
    setSaving(false);
    if (res) {
      setData(res);
      setEditing(false);
      setNuevoMonto("");
    } else {
      setAviso("No se pudo guardar");
    }
  };

  const cerrarDia = async () => {
    setClosing(true);
    setAviso(null);
    const res = await registrarCierre();
    setClosing(false);
    if (res.ok) {
      setAviso("Cierre registrado");
      cargar();
    } else {
      setAviso(res.error ?? "No se pudo registrar el cierre");
    }
  };

  if (loading) return <LoadingSpin />;

  return (
    <div className="w-full min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-semibold tracking-tight text-amber-50 sm:text-5xl mb-8">
          Capital disponible
        </h2>

        {error && <p className="text-red-500">{error}</p>}

        {data && (
          <>
            {/* Monto principal */}
            <div className="border-l-2 border-orange-400 pl-6 py-4 mb-6">
              <dt className="text-base text-orange-400 mb-2">
                Dinero en el negocio
              </dt>
              {editing ? (
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <input
                    type="number"
                    value={nuevoMonto}
                    onChange={(e) => setNuevoMonto(e.target.value)}
                    placeholder={String(Math.floor(data.monto))}
                    className="w-full sm:w-64 rounded bg-white/10 border border-white/20 px-4 py-3 text-2xl text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={guardarConteo}
                      disabled={saving}
                      className="bg-amber-500/90 text-white hover:bg-amber-600"
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditing(false);
                        setNuevoMonto("");
                        setAviso(null);
                      }}
                      className="bg-white/10 text-amber-50 hover:bg-white/20"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <dd className="text-4xl sm:text-6xl font-semibold tracking-tight text-amber-50">
                    {formatCurrency(data.monto)}
                  </dd>
                  <Button
                    onClick={() => setEditing(true)}
                    className="bg-white/10 text-amber-50 hover:bg-white/20 w-fit"
                  >
                    Modificar
                  </Button>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3">
                Última actualización:{" "}
                {new Date(data.actualizadoEn).toLocaleString("es-MX")}
              </p>
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap gap-3 mb-4">
              <Button
                onClick={cerrarDia}
                disabled={closing}
                className="bg-orange-500/90 text-white hover:bg-orange-600"
              >
                {closing ? "Registrando..." : "Registrar cierre de hoy"}
              </Button>
            </div>
            {aviso && <p className="text-sm text-amber-200 mb-6">{aviso}</p>}

            {/* Movimientos */}
            <h3 className="text-xl sm:text-2xl font-semibold text-amber-50 mt-10 mb-4">
              Movimientos recientes
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/5">
              {data.movimientos.length === 0 && (
                <p className="p-6 text-gray-400">Aún no hay movimientos.</p>
              )}
              {data.movimientos.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wide text-amber-300/80">
                        {tipoLabel[m.tipo]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(m.fecha).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                    <p className="text-amber-50 truncate">{m.descripcion}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`font-semibold ${
                        m.monto >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {m.monto >= 0 ? "+" : ""}
                      {formatCurrency(m.monto)}
                    </div>
                    <div className="text-xs text-gray-400">
                      saldo: {formatCurrency(m.saldoResultante)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Capital;
