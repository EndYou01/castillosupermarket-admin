import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Minus } from "lucide-react";
import { registrarExtraccion, registrarInyeccion, registrarGasto } from "../../Api/castilloApi";
import { Button } from "../../components/shadcn/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/shadcn/Dialog";

type Tipo = "extraccion" | "inyeccion" | "gasto";

interface Props {
  tipo: Tipo;
  onClose: () => void;
  onDone: () => void;
}

const fieldClass =
  "w-full rounded-lg border border-amber-100/15 bg-black/20 px-4 text-amber-50 placeholder:text-amber-100/30 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/30";

const CONFIG: Record<
  Tipo,
  {
    title: string;
    description: string;
    icon: typeof ArrowUpFromLine;
    iconWrap: string;
    confirmClass: string;
    confirmLabel: string;
  }
> = {
  extraccion: {
    title: "Extracción de caja",
    description: "Pasa dinero de la caja al capital disponible para comprar.",
    icon: ArrowUpFromLine,
    iconWrap: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20",
    confirmClass:
      "bg-amber-500 text-white shadow-lg shadow-amber-900/30 hover:bg-amber-600",
    confirmLabel: "Registrar extracción",
  },
  inyeccion: {
    title: "Inyección de capital",
    description: "Mete dinero externo al capital disponible.",
    icon: ArrowDownToLine,
    iconWrap: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20",
    confirmClass:
      "bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-600",
    confirmLabel: "Registrar inyección",
  },
  gasto: {
    title: "Registrar gasto",
    description: "Resta dinero del capital disponible.",
    icon: Minus,
    iconWrap: "bg-red-500/15 text-red-300 ring-1 ring-red-400/20",
    confirmClass:
      "bg-red-500 text-white shadow-lg shadow-red-900/30 hover:bg-red-600",
    confirmLabel: "Registrar gasto",
  },
};

const CajaModal = ({ tipo, onClose, onDone }: Props) => {
  const cfg = CONFIG[tipo];
  const Icon = cfg.icon;
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) {
      setError("El monto debe ser mayor que 0");
      return;
    }

    setSubmitting(true);
    let fn;
    if (tipo === "extraccion") fn = registrarExtraccion;
    else if (tipo === "inyeccion") fn = registrarInyeccion;
    else fn = registrarGasto;
    const res = await fn(valor, descripcion.trim() || undefined);
    setSubmitting(false);

    if (res.ok) onDone();
    else setError(res.error ?? "No se pudo registrar");
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span
              className={`grid size-9 place-items-center rounded-lg ${cfg.iconWrap}`}
            >
              <Icon className="size-5" />
            </span>
            {cfg.title}
          </DialogTitle>
          <DialogDescription>{cfg.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-amber-100/80">
              Monto
            </label>
            <input
              type="number"
              autoFocus
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              min={0}
              placeholder="0"
              className={`${fieldClass} h-11`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-amber-100/80">
              Nota (opcional)
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Motivo o detalle"
              className={`${fieldClass} h-11`}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <DialogFooter className="mt-1">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-11 w-full text-amber-100/80 hover:bg-white/10 hover:text-amber-50 sm:h-9 sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={submitting}
            className={`h-11 w-full sm:h-9 sm:w-auto ${cfg.confirmClass}`}
          >
            {submitting ? "Procesando..." : cfg.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CajaModal;
