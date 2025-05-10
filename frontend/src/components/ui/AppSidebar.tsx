import React from "react";
import { NavLink } from "react-router-dom";
import { BookOpen, BarChart2, Settings, FileText, Home, Sparkles } from "lucide-react";
import { useSidebar } from "./sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
          "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden group",
          "hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50",
          "hover:shadow-sm hover:text-purple-600",
          isActive
            ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-600 shadow-sm"
            : "text-gray-600",
          collapsed ? "justify-center px-2 mx-auto w-12 h-12" : "w-full mb-1"
        )
      }
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute right-0 bottom-0 w-20 h-20 -mr-8 -mb-8 bg-purple-200 rounded-full opacity-20"></div>
      </div>

      <div className="flex items-center relative z-10">
        <div className={cn(
          "flex-shrink-0 transition-all duration-300 ease-in-out",
          collapsed ? "w-auto p-1" : "mr-3"
        )}>
          <motion.div
            initial={false}
            animate={collapsed ? "collapsed" : "expanded"}
            variants={{
              collapsed: { scale: 1.2 },
              expanded: { scale: 1 }
            }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        </div>

        {!collapsed && (
          <motion.span
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            {label}
          </motion.span>
        )}
      </div>
    </NavLink>
  );
};

export function AppSidebar() {
  const { collapsed } = useSidebar();

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-100">
      <div className="p-4 flex items-center justify-center border-b border-gray-100">
        <motion.div
          animate={{ scale: collapsed ? 1.2 : 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>

          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="ml-3 font-bold text-gray-800"
            >
              Concisely
            </motion.span>
          )}
        </motion.div>
      </div>

      <div className="flex-1 px-2 py-6 overflow-y-auto">
        <div className="space-y-2">
          <SidebarItem to="/dashboard" icon={<Home size={18} />} label="Dashboard" />
          <SidebarItem to="/summaries" icon={<FileText size={18} />} label="Summaries" />
          <SidebarItem to="/sources" icon={<BookOpen size={18} />} label="Sources" />
          <SidebarItem to="/analytics" icon={<BarChart2 size={18} />} label="Analytics" />
          <SidebarItem to="/settings" icon={<Settings size={18} />} label="Settings" />
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 text-center">
        <motion.p
          className="text-xs text-gray-400"
          animate={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
        >
          {collapsed ? "v1.0" : "Concisely v1.0"}
        </motion.p>
      </div>
    </div>
  );
}
