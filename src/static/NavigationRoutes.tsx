import { SquareTerminal, Store } from "lucide-react";
import { INavigationRoute } from "../interfaces/interfaces";
import Dashboard from "../container/dashboard/Dashboard";
import Inventory from "../container/inventory/Inventory";

export const NavigationRoutes: INavigationRoute[] = [
    {
      title: "Dashboard",
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
      title: "Marketplace",
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
  