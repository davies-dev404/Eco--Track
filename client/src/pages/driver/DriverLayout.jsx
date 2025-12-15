import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Truck, Wallet, FileText, Settings, LogOut, LayoutDashboard, LifeBuoy, Star, Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SharedNotifications from "@/components/SharedNotifications";

export default function DriverLayout({ children, user }) {
    const [location, setLocation] = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLocation("/");
    };

    const allNavItems = [
        { icon: LayoutDashboard, label: "Overview", path: "/driver/" },
        { icon: Truck, label: "My Vehicle", path: "/driver/vehicle" },
        { icon: Wallet, label: "Earnings & Wallet", path: "/driver/wallet" },
        { icon: FileText, label: "Certificates", path: "/driver/certificate" },
        { icon: LifeBuoy, label: "Help & Support", path: "/driver/support" },
        { icon: Settings, label: "Profile Settings", path: "/driver/profile" },
    ];

    const mobileBottomNav = [
        { icon: LayoutDashboard, path: "/driver/" },
        { icon: Truck, path: "/driver/vehicle" },
        { icon: Wallet, path: "/driver/wallet" },
        { icon: FileText, path: "/driver/certificate" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-green-100 selection:text-green-900">
            
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 fixed inset-y-0 left-0 z-50 border-r border-slate-800 shadow-2xl">
                <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
                    <span className="font-bold text-xl flex items-center gap-2 text-white">
                        <Truck className="h-6 w-6 text-green-500" />
                        Eco<span className="text-green-500">Track</span>
                    </span>
                </div>

                <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Driver Console</p>
                    {allNavItems.map((item) => {
                        const isActive = location === item.path || (location !== '/driver/' && location.startsWith(item.path));
                        return (
                            <Link key={item.path} href={item.path}>
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                                    isActive 
                                    ? "bg-green-600 text-white shadow-lg shadow-green-900/20" 
                                    : "hover:bg-slate-800 hover:text-white"
                                }`}>
                                    <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <UserAvatar name={user?.name} className="h-10 w-10 border-2 border-slate-700" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <Button variant="destructive" className="w-full justify-start text-sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </Button>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300 min-h-screen">
                
                {/* HEADER (Mobile & Desktop) */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between">
                    <div className="lg:hidden flex items-center gap-4">
                        <span className="font-bold text-lg text-slate-800">EcoTrack Driver</span>
                    </div>

                    {/* Desktop Heading */}
                    <div className="hidden lg:block">
                        <h2 className="text-xl font-bold text-slate-800">
                            {allNavItems.find(i => i.path === location)?.label || "Dashboard"}
                        </h2>
                        <p className="text-sm text-slate-500">Welcome back, {user?.name?.split(" ")[0]}</p>
                    </div>

                    <div className="flex items-center gap-3">
                         <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                            <span className="flex items-center text-amber-500 font-bold text-sm">
                                <Star className="h-4 w-4 mr-1 fill-current" /> 4.9
                            </span>
                            <span className="w-px h-4 bg-slate-300"></span>
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{user?.vehiclePlate || "No Vehicle"}</span>
                        </div>

                        <SharedNotifications role="driver" userId={user?.id || user?._id} />

                         {/* Mobile Menu Trigger */}
                         <div className="lg:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="bg-slate-900 text-white border-r-slate-800 w-72 p-0">
                                   <div className="p-6 border-b border-slate-800">
                                       <span className="font-bold text-xl flex items-center gap-2 text-white">
                                            <Truck className="h-6 w-6 text-green-500" />
                                            Eco<span className="text-green-500">Track</span>
                                        </span>
                                   </div>
                                   <div className="p-4 space-y-1">
                                       {allNavItems.map((item) => (
                                           <Link key={item.path} href={item.path}>
                                               <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 cursor-pointer text-slate-300">
                                                   <item.icon className="h-5 w-5" />
                                                   {item.label}
                                               </div>
                                           </Link>
                                       ))}
                                        <div className="pt-4 mt-4 border-t border-slate-800">
                                            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                                                <LogOut className="h-4 w-4 mr-2" /> Sign Out
                                            </Button>
                                        </div>
                                   </div>
                                </SheetContent>
                            </Sheet>
                         </div>
                    </div>
                </header>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 p-6 lg:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
                     {children}
                </main>

                {/* MOBILE BOTTOM NAV */}
                <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
                    <nav className="bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl shadow-slate-900/20 px-2 py-3 flex justify-around items-center border border-white/10">
                        {mobileBottomNav.map((item) => {
                            const isActive = location === item.path;
                            return (
                                <Link key={item.path} href={item.path}>
                                    <div className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-14 relative cursor-pointer ${isActive ? "text-green-400 bg-white/10" : "text-slate-400"}`}>
                                            <item.icon className="h-6 w-6" />
                                            {isActive && <span className="absolute -bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>}
                                    </div>
                                </Link>
                            )
                        })}
                         <Link href="/driver/support">
                            <div className={`flex flex-col items-center justify-center p-2 rounded-xl w-14 relative cursor-pointer ${location === '/driver/support' ? "text-green-400 bg-white/10" : "text-slate-400"}`}>
                                <LifeBuoy className="h-6 w-6" />
                            </div>
                        </Link>
                    </nav>
                </div>

            </div>
        </div>
    );
}
