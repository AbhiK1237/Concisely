import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "@/components/ui/sidebar"
  import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
  

  const items = [
    {title: 'Dashboard', url: '/' ,icon:Home},
    { title: 'Summaries', url: '/summaries' ,icon:Calendar},
    { title: 'Sources', url: '/sources' ,icon:Inbox},
    { title: 'Documents', url: '/documents' ,icon:Search},
    { title: 'Analytics', url: '/analytics' ,icon:Calendar},
    { title: 'Settings', url: '/settings' ,icon:Inbox},
    { title: 'Help', url: '/help' ,icon:Settings},
  ];

  export function AppSidebar() {

    return (
      <Sidebar>
        <SidebarHeader />
        <SidebarContent>
          <SidebarGroup >
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <a href={item.url}>
                                    {<item.icon />}
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    )
  }
  