import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Truck, Wallet, FileText, Settings, LogOut, LayoutDashboard, LifeBuoy, Star, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function DriverLayout({ children, user }) {
    const [location, setLocation] = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLocation("/");
    };

    const navItems = [
        { icon: LayoutDashboard, label: "Home", path: "/driver/" },
        { icon: Truck, label: "Vehicle", path: "/driver/vehicle" },
        { icon: Wallet, label: "Wallet", path: "/driver/wallet" },
        { icon: Settings, label: "Profile", path: "/driver/profile" },
    ];

    const secondaryNav = [
        { icon: FileText, label: "Certificates", path: "/driver/certificate" },
        { icon: LifeBuoy, label: "Help & Support", path: "/driver/support" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-green-100 selection:text-green-900">
             {/* Premium Sticky Header */}
             <header className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xl shadow-slate-900/5 backdrop-blur-md bg-slate-900/95 transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="bg-gradient-to-tr from-green-500 to-emerald-600 p-[2px] rounded-full">
                            <UserAvatar name={user?.name} className="h-10 w-10 border-2 border-slate-900" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5">
                            <div className="bg-green-500 w-3 h-3 rounded-full border-2 border-slate-900 animate-pulse"></div>
                        </div>
                    </div>
                    <div>
                        <h1 className="font-bold text-base leading-none text-white tracking-tight">{user?.name || "Driver"}</h1>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-1">
                            <span className="flex items-center text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-full"><Star className="h-3 w-3 mr-1 fill-current" /> 4.9</span>
                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                            <span className="uppercase tracking-wider">{user?.vehiclePlate || "No Vehicle"}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
                    </Button>
                    
                    <Sheet>
                        <SheetTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="bg-slate-900 border-l-slate-800 text-slate-100">
                            <div className="mt-8 space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Menu</h3>
                                    {secondaryNav.map(item => (
                                        <Link key={item.path} href={item.path}>
                                            <a className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 text-slate-300 transition-colors">
                                                <item.icon className="h-5 w-5" />
                                                {item.label}
                                            </a>
                                        </Link>
                                    ))}
                                </div>
                                <div className="pt-6 border-t border-slate-800">
                                    <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 pb-24 px-4 pt-6 max-w-lg mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                {children}
            </main>

            {/* Mobile Bottom Nav (Floating Pill) */}
            <div className="fixed bottom-6 left-4 right-4 z-50 max-w-lg mx-auto">
                <nav className="bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl shadow-slate-900/20 px-2 py-3 flex justify-around items-center border border-white/10">
                    {navItems.map((item) => {
                        const isActive = location === item.path || (location.startsWith(item.path) && item.path !== '/driver/');
                        return (
                            <Link key={item.path} href={item.path}>
                                <div className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16 relative cursor-pointer group ${isActive ? "text-green-400 bg-white/10" : "text-slate-400 hover:text-slate-200"}`}>
                                        <item.icon className={`h-6 w-6 mb-1 transition-transform group-active:scale-95 ${isActive ? "fill-current/20" : ""}`} />
                                        {isActive && (
                                            <span className="absolute -bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>
                                        )}
                                </div>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    );
}
