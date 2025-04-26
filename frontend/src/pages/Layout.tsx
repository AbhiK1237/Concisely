import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/AppSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
      variant: "default",
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <SidebarProvider collapsed={!sidebarOpen}>
      <div className="flex min-h-screen">
        {/* Sidebar with toggle control */}
        <div className={`fixed left-0 top-0 bottom-0 z-20 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} bg-sidebar flex flex-col`}>
          {/* Sidebar toggle button */}
          <div className="h-17.5 flex items-center justify-end px-2 border-b border-sidebar-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-sidebar-foreground"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Sidebar content */}
          <AppSidebar />
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 w-full ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <Navbar sidebarWidth={sidebarOpen ? '16rem' : '4rem'}>
            {/* Add user info and logout button to navbar */}
            <div className="flex items-center ml-auto">
              <div className="mr-4 text-sm">
                <span className="font-medium">{user?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </Navbar>

          {/* Page Content */}
          <main className="flex-1 w-full p-6 pt-[80px] transition-all duration-300">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}