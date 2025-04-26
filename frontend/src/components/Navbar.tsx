import React, { ReactNode } from 'react';

interface NavbarProps {
  children?: ReactNode;
  sidebarWidth: string;
}

const Navbar: React.FC<NavbarProps> = ({ children, sidebarWidth }) => {
  return (
    <div
      className="fixed top-0 right-0 z-30 h-16 bg-background border-b flex items-center px-4 transition-all duration-300"
      style={{
        left: sidebarWidth
      }}
    >
      {children}
    </div>
  );
};

export default Navbar;