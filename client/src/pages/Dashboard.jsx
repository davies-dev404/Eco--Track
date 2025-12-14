import { useState } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Trash2, 
  Truck, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockUser } from "@/lib/mockData";
import DashboardOverview from "./dashboard/Overview";
import WasteLog from "./dashboard/WasteLog";
import PickupRequest from "./dashboard/PickupRequest";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Waste Log", href: "/dashboard/log", icon: Trash2 },
    { name: "Pickup Requests", href: "/dashboard/pickup", icon: Truck },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link href="/">
            <a className="flex items-center gap-2 font-heading font-bold text-xl text-sidebar-primary-foreground">
              <span className="text-sidebar-primary">Eco</span>Track
            </a>
          </Link>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}>
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-9 w-9 border border-sidebar-border">
              <AvatarImage src={mockUser.avatar} />
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{mockUser.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{mockUser.role}</p>
            </div>
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
                <LogOut className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:hidden ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <span className="font-heading font-bold text-xl text-sidebar-primary-foreground">EcoTrack</span>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="text-sidebar-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 py-6 px-3">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <a 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium mb-1 ${
                  location === item.href 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </a>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        <header className="h-16 sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 md:px-6 flex items-center justify-between lg:justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-4">
            <Link href="/dashboard/log">
              <Button size="sm" className="hidden sm:flex gap-2">
                <Plus className="h-4 w-4" /> Log Waste
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Switch>
            <Route path="/dashboard" component={DashboardOverview} />
            <Route path="/dashboard/log" component={WasteLog} />
            <Route path="/dashboard/pickup" component={PickupRequest} />
            <Route path="/dashboard/settings">
              <div className="flex items-center justify-center h-[50vh] text-muted-foreground">Settings Page Placeholder</div>
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}
