import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Bell, 
  Search, 
  Menu, 
  ChevronRight, 
  ShieldCheck, 
  LogOut,
  Settings as SettingsIcon,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/context/SocketContext";

// Modular Components
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminPickups from "@/components/admin/AdminPickups";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminLiveMap from "@/components/admin/AdminLiveMap";
import AdminProfile from "@/components/admin/AdminProfile";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("analytics"); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { toast } = useToast();
  const socket = useSocket();
  const [user, setUser] = useState(null);

  // Data states
  const [pickups, setPickups] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [wasteLogs, setWasteLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Settings State 
  const [timeFilter, setTimeFilter] = useState("7d"); 
  const [usersViewMode, setUsersViewMode] = useState('all'); 
  const [settings, setSettings] = useState({
      pricing: { plastic: 0.5, paper: 0.2, glass: 0.1, metal: 0.8, ewaste: 1.5 },
      zones: ["Downtown", "North Suburbs", "Industrial District"]
  });

  const fetchSettings = async () => {
      try {
          const { data } = await api.get("/settings");
          if (data && data.pricing) {
              setSettings({
                  pricing: { ...settings.pricing, ...data.pricing }, 
                  zones: data.zones || settings.zones
              });
          }
      } catch (error) {
          console.error("Failed to load settings");
      }
  };

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [pickupRes, wasteRes, driverRes, usersRes, activityRes] = await Promise.all([
        api.get("/pickup/all"),
        api.get("/waste/all"),
        api.get("/auth/drivers"),
        api.get("/auth/users"),
        api.get("/activity?limit=10")
      ]);
      setPickups(pickupRes.data);
      setWasteLogs(wasteRes.data);
      setDrivers(driverRes.data);
      setUsers(usersRes.data);
      setActivities(activityRes.data);
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auth Check
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setLocation("/auth");
      return;
    }
    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role !== "admin") {
        toast({ title: "Access Denied", description: "You need admin privileges.", variant: "destructive" });
        setLocation("/dashboard");
        return;
    }
    setUser(parsedUser);
    
    // Initial Fetch
    fetchData();
    fetchSettings();

    // Polling Interval
    const intervalId = setInterval(() => {
        if (!isLoading) {
            fetchData(true); 
        }
    }, 15000);

    return () => clearInterval(intervalId); 
  }, [location, setLocation, toast]);

  // Real-Time Listeners
  useEffect(() => {
      if (!socket) return;
      
      const handleUpdate = () => fetchData(true);

      socket.on("pickup_created", (data) => {
          toast({ title: "New Pickup Request", description: `${data.address} - ${data.wasteTypes.join(', ')}` });
          handleUpdate();
      });
      socket.on("pickup_updated", handleUpdate);
      socket.on("waste_logged", (data) => {
           toast({ title: "New Waste Logged", description: `${data.weight}kg of ${data.type}` });
           handleUpdate();
      });
      socket.on("driver_updated", (data) => {
          console.log("Socket received driver_updated:", data);
          toast({ title: "Driver Update", description: `${data.name} is now ${data.availability || 'offline'}` });
          handleUpdate();
      });

      return () => {
          socket.off("pickup_created");
          socket.off("pickup_updated");
          socket.off("waste_logged");
          socket.off("driver_updated");
      };
  }, [socket, toast]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLocation("/");
  };
  
  // Computed Metrics
  const totalCollected = (pickups.reduce((acc, p) => acc + (p.actualWeight || 0), 0) + wasteLogs.reduce((acc, l) => acc + (l.weight || 0), 0)).toFixed(1);
  const completedCount = pickups.filter(p => p.status === 'completed' || p.status === 'collected').length;
  const activeCount = pickups.filter(p => ['pending', 'assigned', 'accepted', 'in_progress'].includes(p.status)).length;
  const onlineDrivers = drivers.filter(d => d.availability === 'online').length;

  const renderContent = () => {
    switch(activeTab) {
      case 'analytics':
        return <AdminOverview 
                  pickups={pickups} 
                  wasteLogs={wasteLogs} 
                  users={users} 
                  drivers={drivers}
                  activities={activities}
                  totalCollected={totalCollected}
                  completedCount={completedCount}
                  activeCount={activeCount}
                  onlineDrivers={onlineDrivers}
                  timeFilter={timeFilter}
                  onNavigate={setActiveTab}
               />;
      case 'pickups':
        return <AdminPickups 
                  pickups={pickups} 
                  drivers={drivers}
                  onUpdate={() => fetchData(true)}
               />;
      case 'users':
        return <AdminUsers 
                  users={users} 
                  drivers={drivers}
                  viewMode={usersViewMode}
                  setViewMode={setUsersViewMode}
                  onUpdate={() => fetchData(true)}
               />;
      case 'settings':
        return <AdminSettings 
                  settings={settings}
                  onUpdate={fetchSettings}
               />;
      case 'map':
        return <AdminLiveMap pickups={pickups} drivers={drivers} />;
      case 'profile':
        return <AdminProfile user={user} />;
      default:
        return <AdminOverview />;
    }
  };

  const getPageTitle = () => {
      switch(activeTab) {
        case 'analytics': return 'Dashboard Overview';
        case 'pickups': return 'Pickup Management';
        case 'users': return 'User Management';
        case 'settings': return 'System Settings';
        case 'map': return 'Live Operations Map';
        case 'profile': return 'My Profile';
        default: return 'Dashboard';
      }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-2xl fixed h-full lg:relative hidden md:flex`}>
             <AdminSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isCollapsed={!isSidebarOpen} 
                toggleCollapse={() => setIsSidebarOpen(!isSidebarOpen)}
             />
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
            
            {/* HEADER */}
            <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                     <Button variant="ghost" size="icon" className="md:hidden text-slate-500" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <Menu className="h-6 w-6" />
                     </Button>
                     <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                           <span>Admin</span>
                           <ChevronRight className="h-3 w-3" />
                           <span>{activeTab}</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{getPageTitle()}</h1>
                     </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative hidden lg:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search data..." 
                            className="w-64 pl-10 bg-slate-100/50 border-transparent focus:bg-white focus:border-indigo-500 rounded-full h-10 transition-all" 
                        />
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </Button>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="pl-2 pr-4 py-1 h-auto hover:bg-slate-100 rounded-full flex items-center gap-3 border border-slate-200 bg-white">
                                    <Avatar className="h-8 w-8 border-2 border-indigo-100">
                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} />
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left hidden sm:block">
                                        <p className="text-sm font-bold text-slate-700 leading-none">{user?.name || "Admin"}</p>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Super Admin</p>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setActiveTab('settings')} className="cursor-pointer">
                                    <SettingsIcon className="mr-2 h-4 w-4" /> Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveTab('profile')} className="cursor-pointer">
                                    <UserIcon className="mr-2 h-4 w-4" /> Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                                    <LogOut className="mr-2 h-4 w-4" /> Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>
            
            {/* CONTENT CANVAS */}
            <main className="flex-1 overflow-auto p-8 custom-scrollbar bg-slate-50/50 relative">
                  {/* Decorative Background Blob */}
                  <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-0"></div>
                  
                  <div className="relative z-0 max-w-7xl mx-auto pb-20">
                    {/* Time Filter (Global) */}
                    {activeTab === 'analytics' && (
                        <div className="flex justify-end mb-6">
                             <div className="bg-white p-1 rounded-lg border shadow-sm inline-flex">
                                {['today', '7d', '30d', 'all'].map((t) => (
                                    <button 
                                        key={t}
                                        onClick={() => setTimeFilter(t)}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                                            timeFilter === t 
                                            ? 'bg-indigo-600 text-white shadow-md' 
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                    >
                                        {t === '7d' ? 'Week' : t === '30d' ? 'Month' : t.toUpperCase()}
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}

                    {renderContent()}
                  </div>
            </main>
        </div>
    </div>
  );
}
