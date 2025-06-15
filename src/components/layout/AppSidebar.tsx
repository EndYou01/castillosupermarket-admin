import * as React from "react";

import { NavMain } from "./NavMain";
import { NavUser } from "./NavUser";
import { TeamSwitcher } from "./TeamSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "../shadcn/Sidebar";
import { NavigationRoutes } from "../../static/NavigationRoutes";
import castillo_imagotipo from "../../assets/castillo_imagotipo.png";

// This is sample data.
const user = {
  name: "catilloadmin",
  email: "castillosupermarket@gmail.com",
  avatar: castillo_imagotipo,
};
const teams = [
  {
    name: "Castillo",
    logo: "",
    plan: "Supermarket",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NavigationRoutes} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
