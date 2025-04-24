import React, { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children?: ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen, children }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 h-[64px] bg-background border-b flex items-center px-4 transition-all duration-300">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mr-4"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {children}
    </div>
  );
};

export default Navbar;