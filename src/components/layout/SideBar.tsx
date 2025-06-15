import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "../shadcn/Breadcrumb";
import {
    Separator,
  } from "../shadcn/Separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
  } from "../shadcn/Sidebar";
  import { Outlet, useLocation, useNavigate } from "react-router-dom";
  import { AppSidebar } from "./AppSidebar";
  import {
    findRouteByUrl,
    findSettingsItemByUrl,
    getUrlHierarchy,
  } from "../../functions/global";
  import React from "react";
  
  const Sidebar = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const route = findRouteByUrl(pathname);
  
    const breadcrumbItems = () => {
      if (!route) return null;
  
      const hierarchy = getUrlHierarchy(pathname);
      const items = findSettingsItemByUrl(route, route.url)?.items;
  
      if (!items) {
        const current = route.items.find((item) => item.url === pathname);
        return (
          <>
            <BreadcrumbSeparator  />
            <BreadcrumbItem>
              <BreadcrumbPage>{current?.title ?? "Start"}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        );
      }
  
      return hierarchy.map((path) => {
        const setting = findSettingsItemByUrl(route, path);
        return (
          <React.Fragment key={path}>
            <BreadcrumbSeparator  />
            <BreadcrumbItem
              className="cursor-pointer opacity-60"
              onClick={() => navigate(setting?.url ?? "")}
            >
              <BreadcrumbPage>{setting?.title ?? "Start"}</BreadcrumbPage>
            </BreadcrumbItem>
          </React.Fragment>
        );
      });
    };
  
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1 text-stone-200" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem >
                    <BreadcrumbLink href="#">
                      {route?.title ?? "Panel principal"}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbItems()}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {/* Contenido de la aplicacion */}
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  };
  
  export default Sidebar;
  