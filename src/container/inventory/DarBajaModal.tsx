import { useMemo, useState } from "react";
import { ArrowLeft, PackageMinus, Search } from "lucide-react";
import { darBaja } from "../../Api/castilloApi";
import { Button } from "../../components/shadcn/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/shadcn/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/shadcn/Select";

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

// shared input styling, tied to the green/amber system
const fieldClass =
  "w-full rounded-lg border border-amber-100/15 bg-black/20 px-4 text-amber-50 placeholder:text-amber-100/30 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/30";

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        style={{ backgroundColor: "#c2410c" }}
        className="border-orange-200/25"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-white/15 text-white ring-1 ring-white/25">
              <PackageMinus className="size-5" />
            </span>
            Dar baja
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {selected
              ? "Confirma la cantidad y el motivo de la baja."
              : "Busca y selecciona el producto a dar de baja."}
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
                        onClick={() => {
                          setSelected(p);
                          setError(null);
                        }}
                        className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-amber-400/[0.06]"
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
                  Stock: {selected.quantity} u · costo {selected.cost}
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-amber-100/80">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  min={0}
                  max={selected.quantity}
                  placeholder="0"
                  className={`${fieldClass} h-11`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-amber-100/80">
                  Parte pagada
                </label>
                <input
                  type="number"
                  value={partePagada}
                  onChange={(e) => setPartePagada(e.target.value)}
                  min={0}
                  placeholder="0"
                  className={`${fieldClass} h-11`}
                />
              </div>
            </div>
            <p className="-mt-2 text-xs text-amber-50/70">
              La parte pagada se suma al capital.
            </p>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-amber-100/80">
                Motivo
              </label>
              <Select value={motivo} onValueChange={setMotivo}>
                <SelectTrigger
                  className={`${fieldClass} h-11 w-full justify-between [&>span]:text-amber-50`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-amber-100/10 bg-[#0a3d27] text-amber-50">
                  {MOTIVOS.map((m) => (
                    <SelectItem
                      key={m}
                      value={m}
                      className="text-amber-50 focus:bg-amber-400/10 focus:text-white"
                    >
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              className="h-11 w-full bg-white font-semibold text-orange-700 shadow-lg shadow-orange-900/30 hover:bg-orange-50 sm:h-9 sm:w-auto"
            >
              {submitting ? "Procesando..." : "Confirmar baja"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DarBajaModal;
