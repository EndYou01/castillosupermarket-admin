import { SquareTerminal, Store } from "lucide-react";
import { INavigationRoute } from "../interfaces/interfaces";
import Dashboard from "../container/dashboard/Dashboard";
import Inventory from "../container/inventory/Inventory";
import Capital from "../container/capital/Capital";
import Bajas from "../container/bajas/Bajas";

export const NavigationRoutes: INavigationRoute[] = [
  {
    title: "Panel principal",
    url: "/dashboard",
    icon: SquareTerminal,
    items: [
      {
        title: "Inicio",
        url: "/dashboard/start",
        element: <Dashboard />,
      },

    ],
    isActive: true,
    index: true,
  },
  {
    title: "Mercado",
    url: "/marketplace",
    icon: Store,
    items: [
      {
        title: "Inventario",
        url: "/marketplace/inventory",
        element: <Inventory />,
      },
      {
        title: "Bajas",
        url: "/marketplace/bajas",
        element: <Bajas />,
      },
      {
        title: "Capital",
        url: "/dashboard/capital",
        element: <Capital />,
      },
    ],
    isActive: false,
  },
];
