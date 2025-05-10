import React, { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/AppSidebar";
import { AppNavbar } from "@/components/ui/AppNavbar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from '@/hooks/use-toast';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [pageTransition, setPageTransition] = useState(false);

  // Toggle sidebar state and save preference
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    localStorage.setItem('sidebarOpen', JSON.stringify(!sidebarOpen));
  };

  // Load sidebar preference
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      setSidebarOpen(JSON.parse(savedState));
    }
  }, []);

  // Handle page transitions
  useEffect(() => {
    setPageTransition(true);
    const timer = setTimeout(() => setPageTransition(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

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
    <SidebarProvider collapsed={!sidebarOpen} >
      <div className="flex min-h-screen overflow-hidden bg-gray-50" >
        {/* Sidebar */}
        <motion.div
          className="fixed left-0 top-0 bottom-0 z-20 h-screen shadow-sm"
          initial={false}
          animate={{
            width: sidebarOpen ? 220 : 80,
            transition: { duration: 0.3, ease: "easeInOut" }
          }}
        >
          <AppSidebar />
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          className="flex-1 transition-all duration-300"
          initial={false}
          animate={{
            marginLeft: sidebarOpen ? "220px" : "80px",
            transition: { duration: 0.3, ease: "easeInOut" }
          }}
        >
          {/* Navbar */}
          <motion.div
            className="fixed top-0 right-0 z-10"
            initial={false}
            animate={{
              width: `calc(100% - ${sidebarOpen ? 220 : 80}px)`,
              transition: { duration: 0.3, ease: "easeInOut" }
            }}
          >
            <AppNavbar
              onToggleSidebar={toggleSidebar}
              sidebarOpen={sidebarOpen}
              onLogout={handleLogout}
              user={user}
            />
          </motion.div>

          {/* Page Content with Animation */}
          <main className="pt-16 p-6 min-h-screen">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>

            {/* Loading indicator for page transitions */}
            {pageTransition && (
              <motion.div
                className="fixed top-16 left-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 z-50"
                initial={{ width: "0%", opacity: 1 }}
                animate={{ width: "100%", opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
              />
            )}
          </main>
        </motion.div>
      </div>
    </SidebarProvider>
  );
}