import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/AppSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
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

  return (
    <SidebarProvider collapsed={!sidebarOpen}>
      <div className="flex min-h-screen">
        {/* Sidebar - using a fixed width instead of dynamic width transition */}
        <div className={`fixed left-0 top-0 bottom-0 z-20 transition-all duration-300 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%-64px)]'} bg-sidebar`}>
          <AppSidebar />
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
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
