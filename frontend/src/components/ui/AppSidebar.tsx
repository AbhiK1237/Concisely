import React from "react";
import { NavLink } from "react-router-dom";
import { BookOpen, BarChart2, Settings, FileText, Home } from "lucide-react";
import { useSidebar } from "./sidebar";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label }) => {
  const { collapsed } = useSidebar();

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground",
          collapsed && "justify-center px-0"
        )
      }
    >
      <div className="flex items-center">
        <div className={cn("flex-shrink-0", collapsed ? "w-16 flex justify-center" : "mr-3")}>
          {icon}
        </div>
        {!collapsed && <span>{label}</span>}
      </div>
    </NavLink>
  );
};

export function AppSidebar() {
  const { collapsed } = useSidebar();

  return (
    <div className="h-full flex flex-col pt-[16px]">
      <div className={cn("py-2 flex-1", collapsed ? "px-0" : "px-3")}>
        <div className={cn("space-y-1", collapsed ? "px-0" : "px-1")}>
          <SidebarItem to="/dashboard" icon={<Home size={18} />} label="Dashboard" />
          <SidebarItem to="/summaries" icon={<FileText size={18} />} label="Summaries" />
          <SidebarItem to="/sources" icon={<BookOpen size={18} />} label="Sources" />
          <SidebarItem to="/analytics" icon={<BarChart2 size={18} />} label="Analytics" />
          <SidebarItem to="/settings" icon={<Settings size={18} />} label="Settings" />
        </div>
      </div>
      <div className={cn("border-t border-sidebar-border p-3", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <p className="text-xs text-sidebar-foreground/60">
            Concisely v1.0
          </p>
        ) : (
          <p className="text-xs text-sidebar-foreground/60">v1.0</p>
        )}
      </div>
    </div>
  );
}
