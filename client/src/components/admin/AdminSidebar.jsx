import { Button } from "@/components/ui/button";
import { LogOut, ChevronLeft, ChevronRight, LayoutDashboard, Truck, Map as MapIcon, Trash2, User, Settings as SettingsIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminSidebar({ activeTab, setActiveTab, user, onLogout, isCollapsed, toggleCollapse }) {
    const navItems = [
        { id: 'analytics', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'pickups', label: 'Pickup Requests', icon: Truck },
        { id: 'map', label: 'Live Operations', icon: MapIcon },
        { id: 'users', label: 'Users & Fleet', icon: User },
        { id: 'settings', label: 'System Settings', icon: SettingsIcon },
    ];

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-800 transition-all duration-300`}>
                {!isCollapsed && (
                    <span className="font-bold text-xl text-white tracking-tight flex items-center gap-2">
                        Eco<span className="text-indigo-500">Track</span>
                    </span>
                )}
                {isCollapsed && <span className="font-bold text-xl text-indigo-500">ET</span>}
                <Button variant="ghost" size="icon" onClick={toggleCollapse} className="text-slate-400 hover:text-white hidden lg:flex">
                   {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>
            
            {/* Nav */}
            <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map(item => (
                    <Button 
                        key={item.id}
                        variant="ghost"
                        className={`w-full relative group transition-all duration-200 ${
                            activeTab === item.id 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        } ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-3`}
                        onClick={() => setActiveTab(item.id)}
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                        {activeTab === item.id && !isCollapsed && (
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full opacity-20"></div>
                        )}
                    </Button>
                ))}
            </nav>
        </div>
    );
}
