import { useState } from "react";
import { DateTime } from "luxon";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "../../utils/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

interface Props {
  /** Selected month as "yyyy-MM" */
  value: string;
  /** Latest selectable month as "yyyy-MM" (inclusive) */
  max?: string;
  onChange: (value: string) => void;
  className?: string;
}

const MESES = [
  "ene.",
  "feb.",
  "mar.",
  "abr.",
  "may.",
  "jun.",
  "jul.",
  "ago.",
  "sep.",
  "oct.",
  "nov.",
  "dic.",
];

const toKey = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, "0")}`;

const MonthPicker = ({ value, max, onChange, className }: Props) => {
  const selected = DateTime.fromFormat(value, "yyyy-MM");
  const maxDate = max ? DateTime.fromFormat(max, "yyyy-MM") : null;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    selected.isValid ? selected.year : DateTime.now().year
  );

  const label = selected.isValid
    ? selected.setLocale("es").toFormat("LLLL 'de' yyyy")
    : "Seleccionar mes";

  const isDisabled = (month: number) => {
    if (!maxDate) return false;
    return DateTime.fromObject({ year: viewYear, month }) > maxDate;
  };

  const pick = (month: number) => {
    onChange(toKey(viewYear, month));
    setOpen(false);
  };

  const goToCurrent = () => {
    const now = DateTime.now();
    setViewYear(now.year);
    onChange(toKey(now.year, now.month));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex h-11 w-fit items-center gap-2 rounded-lg border border-amber-100/15 bg-black/20 px-4 text-amber-50 capitalize outline-none transition hover:border-amber-100/30 focus-visible:border-amber-400/60 focus-visible:ring-2 focus-visible:ring-amber-400/30",
          className
        )}
      >
        <CalendarDays className="size-4 text-amber-100/50" />
        <span>{label}</span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 rounded-xl border border-amber-100/10 bg-[#0a3d27] bg-gradient-to-b from-white/[0.04] to-transparent p-3 text-amber-50 shadow-2xl shadow-black/50"
      >
        {/* year nav */}
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewYear((y) => y - 1)}
            className="grid size-8 place-items-center rounded-md text-amber-100/60 transition hover:bg-white/10 hover:text-amber-50"
            aria-label="Año anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-semibold tracking-wide text-amber-50">
            {viewYear}
          </span>
          <button
            type="button"
            onClick={() => setViewYear((y) => y + 1)}
            className="grid size-8 place-items-center rounded-md text-amber-100/60 transition hover:bg-white/10 hover:text-amber-50"
            aria-label="Año siguiente"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* month grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {MESES.map((m, i) => {
            const month = i + 1;
            const isSel =
              selected.isValid &&
              selected.year === viewYear &&
              selected.month === month;
            const disabled = isDisabled(month);
            return (
              <button
                key={m}
                type="button"
                disabled={disabled}
                onClick={() => pick(month)}
                className={cn(
                  "rounded-lg py-2 text-sm capitalize transition",
                  disabled && "cursor-not-allowed text-amber-100/20",
                  !disabled &&
                    !isSel &&
                    "text-amber-100/80 hover:bg-amber-400/10 hover:text-amber-50",
                  isSel &&
                    "bg-orange-500 font-semibold text-white shadow-lg shadow-orange-900/30"
                )}
              >
                {m}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex justify-end border-t border-amber-100/10 pt-2">
          <button
            type="button"
            onClick={goToCurrent}
            className="rounded-md px-2 py-1 text-sm font-medium text-amber-300 transition hover:bg-amber-400/10 hover:text-amber-200"
          >
            Este mes
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { MonthPicker };
