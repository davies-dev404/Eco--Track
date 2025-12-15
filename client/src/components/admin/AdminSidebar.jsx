import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { LayoutDashboard, Truck, Map as MapIcon, Trash2, User, Settings as SettingsIcon } from "lucide-react";

export default function AdminSidebar({ activeTab, setActiveTab, user, onLogout }) {
    const navItems = [
        { id: 'analytics', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'pickups', label: 'Pickups', icon: Truck },
        { id: 'livemap', label: 'Live Map', icon: MapIcon },
        { id: 'waste', label: 'Waste Logs', icon: Trash2 },
        { id: 'users', label: 'Users & Fleet', icon: User },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-10 border-r border-slate-800 shadow-xl">
            <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900">
                <span className="font-heading font-bold text-xl text-white tracking-tight">Eco<span className="text-green-500">Track</span> Admin</span>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(item => (
                    <Button 
                        key={item.id}
                        variant={activeTab === item.id ? "secondary" : "ghost"} 
                        className={`w-full justify-start ${activeTab === item.id ? 'bg-slate-800 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <item.icon className="mr-3 h-4 w-4" /> {item.label}
                    </Button>
                ))}
            </nav>
    
            <div className="p-4 border-t border-slate-800 bg-slate-900">
                 <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold shadow-lg">
                        {user?.name?.[0]}
                    </div>
                    <div className="truncate">
                       <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                       <p className="text-xs text-slate-500">Super Admin</p>
                    </div>
                 </div>
                 <Button variant="destructive" className="w-full shadow-md hover:bg-red-600" onClick={onLogout}>
                     <LogOut className="mr-2 h-4 w-4" /> Logout
                 </Button>
            </div>
        </aside>
    );
}
