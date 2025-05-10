import React, { useState } from "react";
import { Bell, Search, User, Sparkles, X, Menu, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

interface AppNavbarProps {
    onToggleSidebar: () => void;
    sidebarOpen: boolean;
    onLogout: () => void;
    user: any;
}

export function AppNavbar({ onToggleSidebar, sidebarOpen, onLogout, user }: AppNavbarProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([
        { id: 1, text: "Your weekly newsletter is ready", isNew: true },
        { id: 2, text: "New summary from your sources", isNew: false },
    ]);

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes("dashboard")) return "Dashboard";
        if (path.includes("summaries")) return "Summaries";
        if (path.includes("sources")) return "Content Sources";
        if (path.includes("analytics")) return "Analytics";
        if (path.includes("settings")) return "Settings";
        return "Concisely";
    };

    const getUserInitials = () => {
        if (!user?.name) return "U";
        const nameParts = user.name.split(" ");
        if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isNew: false })));
    };

    const handleCreateContent = () => {
        navigate('/sources');
    };

    return (
        <div className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-4 relative z-10 shadow-sm">
            <AnimatePresence>
                {searchOpen ? (
                    <motion.div
                        initial={{ opacity: 0, width: "40%" }}
                        animate={{ opacity: 1, width: "100%" }}
                        exit={{ opacity: 0, width: "40%" }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-white flex items-center px-4 z-20"
                    >
                        <Search className="h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for summaries, topics, or content..."
                            className="flex-1 ml-2 h-full border-none outline-none text-sm"
                            autoFocus
                        />
                        <button
                            onClick={() => setSearchOpen(false)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <div className="flex items-center space-x-4">
                <button
                    onClick={onToggleSidebar}
                    className="mr-2 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                    <motion.div
                        animate={{ rotate: sidebarOpen ? 0 : 180 }}
                        transition={{ duration: 0.3 }}
                    >
                        {sidebarOpen ? <ChevronLeft className="h-5 w-5 text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
                    </motion.div>
                </button>

                <div>
                    <motion.h1
                        className="text-lg font-medium text-gray-800"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={getPageTitle()}
                        transition={{ duration: 0.2 }}
                    >
                        {getPageTitle()}
                    </motion.h1>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative">
                    <div
                        className={cn(
                            "w-8 h-8 rounded-full bg-purple-50 hover:bg-purple-100 flex items-center justify-center cursor-pointer transition-colors",
                            searchOpen && "opacity-0 pointer-events-none"
                        )}
                        onClick={() => setSearchOpen(true)}
                    >
                        <Search className="h-4 w-4 text-purple-600" />
                    </div>
                </div>

                <div className="relative group">
                    <div
                        className="w-8 h-8 rounded-full bg-purple-50 hover:bg-purple-100 flex items-center justify-center cursor-pointer transition-colors"
                    >
                        <Bell className="h-4 w-4 text-purple-600" />
                        {notifications.some(n => n.isNew) && (
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </div>

                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 py-2 hidden group-hover:block z-10">
                        <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                            <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                            <button
                                className="text-xs text-purple-600 hover:text-purple-800"
                                onClick={markAllAsRead}
                            >
                                Mark all as read
                            </button>
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-6 text-center">
                                    <p className="text-sm text-gray-500">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "px-4 py-2 hover:bg-purple-50 transition-colors cursor-pointer",
                                            notification.isNew && "bg-purple-50/50"
                                        )}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <Sparkles className="h-4 w-4 text-purple-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-700">{notification.text}</p>
                                                <p className="text-xs text-gray-500 mt-1">Just now</p>
                                            </div>
                                            {notification.isNew && (
                                                <div className="ml-auto">
                                                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="border-t border-gray-100 mt-1">
                            <button className="w-full text-center py-2 text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-colors">
                                View all notifications
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <div className="cursor-pointer">
                        <Avatar className="h-8 w-8 border border-gray-200 hover:border-purple-300 transition-colors">
                            <AvatarImage
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=8b5cf6&color=fff`}
                                alt={user?.name || 'User'}
                            />
                            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                                {getUserInitials()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 hidden group-hover:block z-10">
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-800">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                        </div>

                        <div className="py-1">
                            <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                                Your Profile
                            </a>
                            <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                                Settings
                            </a>
                        </div>

                        <div className="border-t border-gray-100 pt-1">
                            <button
                                onClick={onLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add visible logout button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 hidden md:flex"
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center"
                    >
                        <LogOut className="h-4 w-4 mr-1" />
                        Logout
                    </motion.div>
                </Button>

                <div className="border-l border-gray-100 pl-2 ml-2 hidden sm:block">
                    <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-md hover:from-purple-700 hover:to-blue-700 text-white"
                        onClick={handleCreateContent}
                    >
                        <Sparkles className="h-3 w-3 mr-1" /> New Content
                    </Button>
                </div>
            </div>
        </div>
    );
}
