import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "../../utils/utils";

// Componente de gráficos de shadcn/ui (https://ui.shadcn.com/docs/components/chart)
// adaptado al proyecto. Provee un contenedor responsive + tooltip temático.

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

type ChartContextProps = { config: ChartConfig };
const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart debe usarse dentro de <ChartContainer>");
  }
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  // Inyecta variables CSS --color-<clave> para que las series usen los colores
  // definidos en la config (p. ej. fill="var(--color-ingresos)").
  const style = Object.fromEntries(
    Object.entries(config)
      .filter(([, v]) => v.color)
      .map(([k, v]) => [`--color-${k}`, v.color])
  ) as React.CSSProperties;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-amber-100/50 [&_.recharts-cartesian-grid_line]:stroke-white/10",
          className
        )}
        style={style}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = RechartsPrimitive.Tooltip;

// Tooltip con estilo shadcn (panel oscuro, etiqueta + valores por serie).
const ChartTooltipContent = ({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: {
  active?: boolean;
  payload?: any[];
  label?: any;
  formatter?: (value: number, name: string) => React.ReactNode;
  labelFormatter?: (label: any) => React.ReactNode;
}) => {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-[#0c2b22] px-3 py-2 text-xs shadow-xl">
      {label !== undefined && (
        <p className="mb-1 font-medium text-amber-50">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      {payload.map((item, i) => {
        const key = item.dataKey ?? item.name;
        const color = item.color || `var(--color-${key})`;
        return (
          <div key={i} className="flex items-center gap-2 text-amber-100/90">
            <span
              className="size-2.5 rounded-[2px]"
              style={{ background: color }}
            />
            <span className="text-amber-100/60">
              {config[key]?.label ?? item.name}
            </span>
            <span className="ml-auto font-medium text-amber-50">
              {formatter ? formatter(item.value, key) : item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export { ChartContainer, ChartTooltip, ChartTooltipContent, useChart };
