import { SquareTerminal, Store } from "lucide-react";
import { INavigationRoute } from "../interfaces/interfaces";
import Dashboard from "../container/dashboard/Dashboard";
import Inventory from "../container/inventory/Inventory";

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
          element: <Inventory/>,
        },
      ],
      isActive: false,
    },
  ];
  