import { useMemo, useState } from "react";
import { ArrowRight, Repeat, Search } from "lucide-react";
import { transformarProducto } from "../../Api/castilloApi";
import { Button } from "../../components/shadcn/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/shadcn/Dialog";

interface ProductoInventario {
  id: string;
  item_name: string;
  description: string;
  cost: number;
  price: number;
  quantity: number;
  variant_id: string | null;
}

interface Props {
  productos: ProductoInventario[];
  onClose: () => void;
  onDone: () => void;
}

const fieldClass =
  "w-full rounded-lg border border-amber-100/15 bg-black/20 px-4 text-amber-50 placeholder:text-amber-100/30 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/30";

const TransformarModal = ({ productos, onClose, onDone }: Props) => {
  const [picking, setPicking] = useState<"x" | "y" | null>("x");
  const [search, setSearch] = useState("");
  const [x, setX] = useState<ProductoInventario | null>(null);
  const [y, setY] = useState<ProductoInventario | null>(null);
  const [cantidad, setCantidad] = useState("");
  const [cantidadDestino, setCantidadDestino] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = productos.filter((p) => p.variant_id);
    const f = q
      ? base.filter((p) => p.item_name.toLowerCase().includes(q))
      : base;
    return f.slice(0, 50);
  }, [productos, search]);

  const elegir = (p: ProductoInventario) => {
    if (picking === "x") setX(p);
    else if (picking === "y") setY(p);
    setPicking(null);
    setSearch("");
    setError(null);
  };

  const submit = async () => {
    setError(null);
    if (!x || !y || !x.variant_id || !y.variant_id) {
      setError("Selecciona ambos productos");
      return;
    }
    if (x.variant_id === y.variant_id) {
      setError("Deben ser productos distintos");
      return;
    }
    const qty = Number(cantidad);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("La cantidad a transformar debe ser mayor que 0");
      return;
    }
    if (qty > x.quantity) {
      setError(`Solo hay ${x.quantity} de ${x.item_name}`);
      return;
    }
    const qtyDestino = Number(cantidadDestino);
    if (!Number.isFinite(qtyDestino) || qtyDestino <= 0) {
      setError("La cantidad resultante debe ser mayor que 0");
      return;
    }

    setSubmitting(true);
    const res = await transformarProducto({
      variantXId: x.variant_id,
      variantYId: y.variant_id,
      cantidad: qty,
      cantidadDestino: qtyDestino,
      itemXName: x.item_name,
      itemYName: y.item_name,
    });
    setSubmitting(false);
    if (res.ok) onDone();
    else setError(res.error ?? "No se pudo transformar");
  };

  const Slot = ({
    label,
    prod,
    onPick,
  }: {
    label: string;
    prod: ProductoInventario | null;
    onPick: () => void;
  }) => (
    <button
      onClick={onPick}
      className="w-full rounded-xl border border-amber-100/10 bg-white/[0.04] p-3 text-left transition-colors hover:bg-amber-400/[0.06]"
    >
      <p className="text-xs text-amber-100/50">{label}</p>
      {prod ? (
        <>
          <p className="truncate font-medium text-amber-50">{prod.item_name}</p>
          <p className="text-xs text-amber-100/50">Stock: {prod.quantity} u</p>
        </>
      ) : (
        <p className="text-amber-300">Elegir producto…</p>
      )}
    </button>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20">
              <Repeat className="size-5" />
            </span>
            Transformar producto
          </DialogTitle>
          <DialogDescription>
            {picking
              ? "Busca y selecciona el producto."
              : "Define cuántas unidades de un producto se convierten en otro."}
          </DialogDescription>
        </DialogHeader>

        {picking ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-amber-100/40" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto..."
                className={`${fieldClass} h-12 pl-10`}
              />
            </div>
            <div className="max-h-[42vh] overflow-y-auto rounded-xl border border-amber-100/10 bg-black/15 sm:max-h-72">
              {filtrados.length === 0 ? (
                <p className="p-6 text-center text-sm text-amber-100/40">
                  Sin resultados.
                </p>
              ) : (
                <ul className="divide-y divide-amber-100/5">
                  {filtrados.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => elegir(p)}
                        className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-emerald-400/[0.06]"
                      >
                        <span className="truncate text-amber-50 group-hover:text-white">
                          {p.item_name}
                        </span>
                        <span className="shrink-0 rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-amber-100/70">
                          {p.quantity} u
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button
              variant="ghost"
              onClick={() => setPicking(null)}
              className="text-amber-100/70 hover:bg-white/10 hover:text-amber-50"
            >
              Volver
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Slot
                  label="Producto a transformar"
                  prod={x}
                  onPick={() => setPicking("x")}
                />
              </div>
              <ArrowRight className="size-5 shrink-0 text-amber-100/40" />
              <div className="flex-1">
                <Slot
                  label="Se convierte en"
                  prod={y}
                  onPick={() => setPicking("y")}
                />
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-amber-100/80">
                  Cantidad a transformar
                </label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  min={0}
                  max={x?.quantity}
                  placeholder="0"
                  className={`${fieldClass} h-11`}
                />
              </div>
              <ArrowRight className="mb-3 size-5 shrink-0 text-amber-100/40" />
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-amber-100/80">
                  Unidades resultantes
                </label>
                <input
                  type="number"
                  value={cantidadDestino}
                  onChange={(e) => setCantidadDestino(e.target.value)}
                  min={0}
                  placeholder="0"
                  className={`${fieldClass} h-11`}
                />
              </div>
            </div>
            {x && y && (
              <p className="text-xs text-amber-100/40">
                {x.item_name} baja {cantidad || 0} · {y.item_name} sube{" "}
                {cantidadDestino || 0}
              </p>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        )}

        {!picking && (
          <DialogFooter className="mt-1">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-amber-100/80 hover:bg-white/10 hover:text-amber-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={submit}
              disabled={submitting}
              className="bg-sky-500 text-white shadow-lg shadow-sky-900/30 hover:bg-sky-600"
            >
              {submitting ? "Procesando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransformarModal;
