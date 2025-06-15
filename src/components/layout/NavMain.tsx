import { Link, useLocation } from "react-router-dom";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../shadcn/Collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../shadcn/Sidebar";
import { findRouteByUrl } from "../../functions/global";
// import { cn } from "../../utils/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { pathname } = useLocation();
  const actualPathUrl = findRouteByUrl(pathname)?.items?.find(
    (item) => item.url === pathname
  )?.url;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Secciones</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  isCurrentPathActive={
                    !!actualPathUrl
                        ?.split("/")
                        .find((e) => e === item.url.split("/")[1]) 
                  }
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <p> {item.isActive}</p>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={actualPathUrl === subItem.url}
                        // className={cn(
                        //   actualPathUrl === subItem.url &&
                        //     "bg-sidebar-accent hover:bg-sidebar-accent-hover hover:text-sidebar-accent-text-active text-sidebar-accent-text-active [&>svg]:text-sidebar-accent-text-active",
                        //   !(actualPathUrl === subItem.url) &&
                        //     "hover:bg-orange-500/20 "
                        // )}
                      >
                        <Link to={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
