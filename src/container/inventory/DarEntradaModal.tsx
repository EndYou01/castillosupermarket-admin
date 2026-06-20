import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, PackagePlus, Search, Sparkles } from "lucide-react";
import { darEntrada, getInflacion } from "../../Api/castilloApi";
import { IInflacion } from "../../interfaces/interfaces";
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

// shared input styling, tied to the green/amber system
const fieldClass =
  "w-full rounded-lg border border-amber-100/15 bg-black/20 px-4 text-amber-50 placeholder:text-amber-100/30 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/30";

const DarEntradaModal = ({ productos, onClose, onDone }: Props) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProductoInventario | null>(null);
  const [cantidad, setCantidad] = useState("");
  const [costo, setCosto] = useState("");
  const [precio, setPrecio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inflacion, setInflacion] = useState<IInflacion | null>(null);

  useEffect(() => {
    getInflacion().then(setInflacion);
  }, []);

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    // En entrada se puede reponer cualquier producto, incluso con stock 0.
    const base = productos.filter((p) => p.variant_id);
    if (!q) return base.slice(0, 50);
    return base
      .filter((p) => p.item_name.toLowerCase().includes(q))
      .slice(0, 50);
  }, [productos, search]);

  const elegir = (p: ProductoInventario) => {
    setSelected(p);
    setCosto(String(p.cost ?? 0));
    setPrecio(String(p.price ?? 0));
    setError(null);
  };

  const submit = async () => {
    setError(null);
    if (!selected || !selected.variant_id) {
      setError("Selecciona un producto");
      return;
    }
    const qty = Number(cantidad);
    const nuevoCosto = Number(costo);
    const nuevoPrecio = Number(precio);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("La cantidad debe ser mayor que 0");
      return;
    }
    if (!Number.isFinite(nuevoCosto) || nuevoCosto < 0) {
      setError("El costo no es válido");
      return;
    }
    if (!Number.isFinite(nuevoPrecio) || nuevoPrecio < 0) {
      setError("El precio no es válido");
      return;
    }

    setSubmitting(true);
    const res = await darEntrada({
      variantId: selected.variant_id,
      itemId: selected.id,
      itemName: selected.item_name,
      cantidad: qty,
      nuevoCosto,
      nuevoPrecio,
    });
    setSubmitting(false);

    if (res.ok) {
      onDone();
    } else {
      setError(res.error ?? "No se pudo dar la entrada");
    }
  };

  const costoTotal = Number(costo) * Number(cantidad || 0);

  // Recomendación de precio: mantiene tu margen actual sobre el costo nuevo y le
  // suma un colchón por la subida del dólar durante ~7 días de rotación.
  const HOLDING_DAYS = 4;
  const sugerencia = useMemo(() => {
    if (!selected || !inflacion || selected.cost <= 0) return null;
    const costoNum = Number(costo);
    if (!Number.isFinite(costoNum) || costoNum <= 0) return null;

    const markup = selected.price / selected.cost; // margen actual (ratio)
    const colchon = Math.pow(1 + inflacion.cambioPctDia, HOLDING_DAYS) - 1;
    const precioSugerido =
      Math.round((costoNum * markup * (1 + colchon)) / 5) * 5;

    return {
      precioSugerido,
      colchonPct: colchon * 100,
      costoReposicion: Math.round(
        selected.cost * (1 + inflacion.cambioPctVentana)
      ),
    };
  }, [selected, inflacion, costo]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20">
              <PackagePlus className="size-5" />
            </span>
            Dar entrada
          </DialogTitle>
          <DialogDescription>
            {selected
              ? "Confirma la cantidad, el costo y el precio."
              : "Busca y selecciona el producto a reponer."}
          </DialogDescription>
        </DialogHeader>

        {!selected ? (
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

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-100/10 bg-white/[0.04] p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-amber-50">
                  {selected.item_name}
                </p>
                <p className="text-sm text-amber-100/50">
                  Stock: {selected.quantity} u
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(null)}
                className="shrink-0 gap-1.5 text-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
              >
                <ArrowLeft className="size-4" />
                Cambiar
              </Button>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-amber-100/80">
                Cantidad a sumar
              </label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                min={0}
                placeholder="0"
                className={`${fieldClass} h-11`}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-amber-100/80">
                  Costo
                </label>
                <input
                  type="number"
                  value={costo}
                  onChange={(e) => setCosto(e.target.value)}
                  min={0}
                  className={`${fieldClass} h-11`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-amber-100/80">
                  Precio
                </label>
                <input
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  min={0}
                  className={`${fieldClass} h-11`}
                />
              </div>
            </div>
            <p className="-mt-2 text-xs text-amber-100/40">
              Se restará del capital el costo de la entrada
              {costoTotal > 0 ? `: ${Math.floor(costoTotal)} cup` : ""}.
            </p>

            {inflacion && inflacion.tasaHoy ? (
              <div className="space-y-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-200">
                  <Sparkles className="size-4 shrink-0" />
                  Sugerencia contra la inflación
                </div>
                <p className="text-xs text-amber-100/60">
                  Dólar a {Math.round(inflacion.tasaHoy)} ·{" "}
                  {inflacion.cambioPctVentana >= 0 ? "+" : ""}
                  {(inflacion.cambioPctVentana * 100).toFixed(1)}% en{" "}
                  {inflacion.diasVentana} días
                  {sugerencia ? ` · reposición ~${sugerencia.costoReposicion}` : ""}
                </p>
                {sugerencia && (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-amber-50">
                      Precio sugerido{" "}
                      <span className="font-semibold text-emerald-300">
                        {sugerencia.precioSugerido} cup
                      </span>
                      <span className="text-xs text-amber-100/50">
                        {" "}· +{sugerencia.colchonPct.toFixed(1)}% colchón (4 días)
                      </span>
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        setPrecio(String(sugerencia.precioSugerido))
                      }
                      className="h-8 bg-amber-500/90 text-white hover:bg-amber-600"
                    >
                      Usar
                    </Button>
                  </div>
                )}
              </div>
            ) : null}

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        )}

        <DialogFooter className="mt-1">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-11 w-full text-amber-100/80 hover:bg-white/10 hover:text-amber-50 sm:h-9 sm:w-auto"
          >
            Cancelar
          </Button>
          {selected && (
            <Button
              onClick={submit}
              disabled={submitting}
              className="h-11 w-full bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-600 sm:h-9 sm:w-auto"
            >
              {submitting ? "Procesando..." : "Confirmar entrada"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DarEntradaModal;
