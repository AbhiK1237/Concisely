import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/AppSidebar";
import { Outlet } from "react-router-dom";
import Navbar from '@/components/Navbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Track Sidebar state

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className={`transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`}>
          <AppSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 transition-all duration-300">
        
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Page Content */}
          <main className={`flex-1 w-full p-6 pt-[80px] transition-all duration-300`}>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
