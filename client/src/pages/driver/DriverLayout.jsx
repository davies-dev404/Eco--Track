import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Truck, Wallet, FileText, Settings, LogOut, LayoutDashboard, LifeBuoy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";

export default function DriverLayout({ children, user }) {
    const [location, setLocation] = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLocation("/");
    };

    const navItems = [
        { icon: LayoutDashboard, label: "Overview", path: "/driver/" },
        { icon: Truck, label: "Vehicle", path: "/driver/vehicle" },
        { icon: Wallet, label: "Wallet", path: "/driver/wallet" },
        { icon: FileText, label: "Certificate", path: "/driver/certificate" },
        { icon: LifeBuoy, label: "Support", path: "/driver/support" },
        { icon: Settings, label: "Profile", path: "/driver/profile" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
             {/* Mobile Header (Sticky) */}
             <header className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="bg-green-600 p-2 rounded-full border-2 border-green-400 shadow-sm relative">
                        <UserAvatar name={user?.name} className="h-full w-full object-cover" />
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                            <Truck className="h-3 w-3 text-slate-900" />
                        </div>
                    </div>
                    <div>
                        <h1 className="font-bold text-sm leading-tight text-white">{user?.name || "Driver"}</h1>
                        <div className="flex items-center gap-2 text-[10px] text-slate-300 font-medium uppercase tracking-wide">
                            <span>{user?.vehiclePlate || "No Vehicle"}</span>
                            <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                            <span className="flex items-center text-yellow-400"><Star className="h-3 w-3 mr-0.5 fill-current" /> 4.9</span>
                        </div>
                    </div>
                </div>
                
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full">
                    <LogOut className="h-5 w-5" />
                </Button>
            </header>

            {/* Content Area */}
            <main className="flex-1 pb-20">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-around items-center z-50 pb-safe">
                {navItems.map((item) => {
                    const isActive = location === item.path;
                    return (
                        <Link key={item.path} href={item.path} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? "text-green-600" : "text-slate-400 hover:text-slate-600"}`}>
                                <item.icon className={`h-6 w-6 ${isActive ? "fill-current/10" : ""}`} />
                                <span className="text-[10px] font-medium mt-1">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    );
}
