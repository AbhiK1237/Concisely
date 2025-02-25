import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
  return (
    <header 
      className={`fixed top-0 left-0 h-16 transition-all duration-300 bg-white dark:bg-black px-6 shadow z-50 flex items-center 
      ${sidebarOpen ? "w-[calc(100%-16rem)] ml-64" : "w-[calc(100%)]"}`}
    >
      {/* Sidebar Toggle Button (Left) */}
      <div className="flex items-center">
        <SidebarTrigger onClick={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Fixed Position Dashboard Title */}
      <div 
        className="fixed left-1/2 transform -translate-x-1/2 text-xl font-semibold text-gray-800 dark:text-white"
        style={{ width: 'fit-content' }}
      >
        Dashboard
      </div>

      {/* Right Section - Buttons */}
      <div className="ml-auto flex items-center space-x-4">
        <Button className='m-4' onClick={() => document.documentElement.classList.toggle('dark')}>
          Dark Mode
        </Button>
        <Button variant="outline">Notifications</Button>
        <Button variant="secondary">Profile</Button>
      </div>
    </header>
  );
}