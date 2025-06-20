import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "../shadcn/DropdownMenu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../shadcn/Sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: string
    plan: string
  }[]
}) {
  const [activeTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <img src={teams[0].logo} alt="logo"/>
              </div> */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
       
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
