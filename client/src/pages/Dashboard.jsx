import { useState } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import {
  LayoutDashboard, 
  Trash2, 
  Truck, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu,
  X,
  Plus,
  ShieldCheck,
  FileText,
  Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardOverview from "./dashboard/Overview";
import WasteLog from "./dashboard/WasteLog";
import PickupRequest from "./dashboard/PickupRequest";
import PickupHistory from "./dashboard/History";
import Impact from "./dashboard/Impact";
import Settings from "./dashboard/Settings";
import AdminPickups from "./dashboard/AdminPickups";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();

  // Get user from local storage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { name: "Guest", role: "Visitor", avatar: "" };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Log Waste", href: "/dashboard/log", icon: Trash2 },
    { name: "Pickup Requests", href: "/dashboard/pickup", icon: Truck },
    { name: "My History", href: "/dashboard/history", icon: FileText },
    { name: "Impact Report", href: "/dashboard/impact", icon: Leaf },
    { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
  ];

  if (user?.role === "admin") {
      navItems.push({ name: "Admin Panel", href: "/admin", icon: ShieldCheck });
  }

    // Helper to check if link is active
  const isLinkActive = (href) => {
      if (href === "/dashboard") {
          return location === "/dashboard";
      }
      return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-green-100 selection:text-green-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-50 bg-slate-900 text-slate-300 border-r border-slate-800 shadow-2xl">
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-8 border-b border-slate-800/50">
          <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-tr from-green-500 to-emerald-400 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-900/20">
                 <Leaf className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Eco<span className="text-emerald-400">Track</span></span>
          </Link>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 py-8 flex flex-col gap-2 px-4 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Menu</p>
          {navItems.map((item) => {
            const isActive = isLinkActive(item.href);
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive 
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-900/20" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}>
                  <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                  {item.name}
              </Link>
            );
          })}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <Avatar className="h-10 w-10 border-2 border-slate-700">
              <AvatarImage src={user.avatar} className="object-cover" />
              <AvatarFallback className="bg-slate-700 text-slate-300 font-bold">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-emerald-400 truncate font-medium">{user.role === 'admin' ? 'Administrator' : 'Eco Warrior'}</p>
            </div>
            <Link href="/" onClick={() => {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            }}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors">
                <LogOut className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transition-transform duration-300 lg:hidden shadow-2xl border-r border-slate-800 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
         <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
           <span className="font-bold text-xl flex items-center gap-2">Eco<span className="text-emerald-400">Track</span></span>
           <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">
             <X className="h-6 w-6" />
           </Button>
         </div>
         <div className="flex-1 py-6 px-4 space-y-2">
           {navItems.map((item) => (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    isLinkActive(item.href) 
                      ? "bg-emerald-600 text-white" 
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
              </Link>
           ))}
         </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col lg:pl-72 transition-all duration-300 h-screen overflow-hidden">
        {/* Glass Header */}
        <header className="h-20 sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" className="lg:hidden -ml-2 text-slate-600" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
              <h2 className="text-lg font-bold text-slate-800 hidden sm:block">
                  {navItems.find(i => isLinkActive(i.href))?.name || "Dashboard"}
              </h2>
          </div>

          <div className="flex items-center gap-4">
             <Button variant="outline" className="hidden sm:flex rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 gap-2">
                 <ShieldCheck className="h-4 w-4" /> Support
             </Button>
            <Link href="/dashboard/log">
              <Button size="sm" className="hidden sm:flex gap-2 rounded-full bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/10 px-6">
                <Plus className="h-4 w-4" /> Log Waste
              </Button>
            </Link>
             <div className="lg:hidden">
                 <Link href="/dashboard/log">
                    <Button size="icon" className="rounded-full bg-emerald-600 shadow-md">
                        <Plus className="h-5 w-5" />
                    </Button>
                 </Link>
             </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <div className="max-w-6xl mx-auto w-full pb-20">
              <Switch>
                <Route path="/dashboard" component={DashboardOverview} />
                <Route path="/dashboard/" component={DashboardOverview} />
                <Route path="/dashboard/log" component={WasteLog} />
                <Route path="/dashboard/pickup" component={PickupRequest} />
                <Route path="/dashboard/history" component={PickupHistory} />
                <Route path="/dashboard/impact" component={Impact} />
                <Route path="/dashboard/settings" component={Settings} />
                <Route path="/dashboard/admin" component={AdminPickups} />
                <Route>
                    <div className="flex flex-col items-center justify-center h-96 text-center">
                        <div className="bg-slate-100 p-4 rounded-full mb-4">
                            <Leaf className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Page Not Found</h3>
                        <p className="text-slate-500">The page you are looking for doesn't exist.</p>
                    </div>
                </Route>
              </Switch>
          </div>
        </main>
      </div>
    </div>
  );
}
