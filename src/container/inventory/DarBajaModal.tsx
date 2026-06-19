import { useMemo, useState } from "react";
import { darBaja } from "../../Api/castilloApi";
import { Button } from "../../components/shadcn/Button";

interface ProductoInventario {
  id: string;
  item_name: string;
  description: string;
  cost: number;
  quantity: number;
  variant_id: string | null;
}

interface Props {
  productos: ProductoInventario[];
  onClose: () => void;
  onDone: () => void;
}

const MOTIVOS = [
  "Merma / vencido / dañado",
  "Baja del local (padre del jefe)",
  "Ajuste de conteo",
];

const DarBajaModal = ({ productos, onClose, onDone }: Props) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProductoInventario | null>(null);
  const [cantidad, setCantidad] = useState("");
  const [partePagada, setPartePagada] = useState("");
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = productos.filter((p) => p.variant_id && p.quantity > 0);
    if (!q) return base.slice(0, 50);
    return base
      .filter((p) => p.item_name.toLowerCase().includes(q))
      .slice(0, 50);
  }, [productos, search]);

  const submit = async () => {
    setError(null);
    if (!selected || !selected.variant_id) {
      setError("Selecciona un producto");
      return;
    }
    const qty = Number(cantidad);
    const pagada = Number(partePagada || 0);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("La cantidad debe ser mayor que 0");
      return;
    }
    if (qty > selected.quantity) {
      setError(`Solo hay ${selected.quantity} en stock`);
      return;
    }
    if (!Number.isFinite(pagada) || pagada < 0) {
      setError("La parte pagada no es válida");
      return;
    }

    setSubmitting(true);
    const res = await darBaja({
      variantId: selected.variant_id,
      itemId: selected.id,
      itemName: selected.item_name,
      cantidad: qty,
      partePagada: pagada,
      costoUnitario: selected.cost,
      motivo,
    });
    setSubmitting(false);

    if (res.ok) {
      onDone();
    } else {
      setError(res.error ?? "No se pudo dar la baja");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-gray-900 border border-white/10 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-amber-50">Dar baja</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {!selected ? (
          <>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full rounded bg-white/10 border border-white/20 px-4 py-3 text-amber-50 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="divide-y divide-white/5 max-h-72 overflow-y-auto rounded border border-white/10">
              {filtrados.length === 0 && (
                <p className="p-4 text-gray-400 text-sm">Sin resultados.</p>
              )}
              {filtrados.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelected(p);
                    setError(null);
                  }}
                  className="w-full text-left p-3 hover:bg-white/5 flex justify-between gap-3"
                >
                  <span className="text-amber-50 truncate">{p.item_name}</span>
                  <span className="text-gray-400 text-sm shrink-0">
                    {p.quantity} u
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="rounded bg-white/5 border border-white/10 p-4 mb-4 flex justify-between items-center">
              <div>
                <p className="text-amber-50 font-medium">
                  {selected.item_name}
                </p>
                <p className="text-gray-400 text-sm">
                  Stock actual: {selected.quantity} u · costo {selected.cost}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-amber-300 text-sm hover:underline"
              >
                Cambiar
              </button>
            </div>

            <label className="block text-sm text-amber-100 mb-1">Cantidad</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              min={0}
              max={selected.quantity}
              className="w-full rounded bg-white/10 border border-white/20 px-4 py-2 text-amber-50 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <label className="block text-sm text-amber-100 mb-1">
              Parte del precio pagada (se suma al capital)
            </label>
            <input
              type="number"
              value={partePagada}
              onChange={(e) => setPartePagada(e.target.value)}
              min={0}
              placeholder="0"
              className="w-full rounded bg-white/10 border border-white/20 px-4 py-2 text-amber-50 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <label className="block text-sm text-amber-100 mb-1">Motivo</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full rounded bg-white/10 border border-white/20 px-4 py-2 text-amber-50 mb-5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {MOTIVOS.map((m) => (
                <option key={m} value={m} className="bg-gray-800">
                  {m}
                </option>
              ))}
            </select>

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            <div className="flex gap-2 justify-end">
              <Button
                onClick={onClose}
                className="bg-white/10 text-amber-50 hover:bg-white/20"
              >
                Cancelar
              </Button>
              <Button
                onClick={submit}
                disabled={submitting}
                className="bg-orange-500/90 text-white hover:bg-orange-600"
              >
                {submitting ? "Procesando..." : "Confirmar baja"}
              </Button>
            </div>
          </>
        )}

        {error && selected === null && (
          <p className="text-red-400 text-sm mt-3">{error}</p>
        )}
      </div>
    </div>
  );
};

export default DarBajaModal;
