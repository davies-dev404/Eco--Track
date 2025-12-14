import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { 
    LayoutDashboard, Truck, Trash2, LogOut, Loader2, CheckCircle, XCircle, Edit, 
    User, UserCheck, UserX, BarChart3, TrendingUp, Map as MapIcon, Settings as SettingsIcon, 
    Save, Plus, Car
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { StatCard } from "@/components/ui/StatCard";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { Search, Filter } from "lucide-react";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("pickups"); 
  const { toast } = useToast();
  const [user, setUser] = useState(null);

  // Data states
  const [pickups, setPickups] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [wasteLogs, setWasteLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Settings State 
  const [settings, setSettings] = useState({
      pricing: { plastic: 0.5, paper: 0.2, glass: 0.1, metal: 0.8, ewaste: 1.5 },
      zones: ["Downtown", "North Suburbs", "Industrial District"]
  });

  // Edit states
  const [editingPickup, setEditingPickup] = useState(null);
  const [assigningVehicle, setAssigningVehicle] = useState(null);
  const [vehicleInput, setVehicleInput] = useState("");

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

    // Polling Interval (5 seconds)
    const intervalId = setInterval(() => {
        if (!isLoading) {
            fetchData(true); // true = silent refresh
        }
    }, 5000);

    return () => clearInterval(intervalId); // Cleanup
  }, [location, setLocation, toast]);

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

  const updateStatus = async (id, status) => {
      try {
          await api.put(`/pickup/${id}`, { status });
          toast({ title: "Updated", description: `Pickup marked as ${status}` });
          fetchData(true);
      } catch (error) {
          toast({ title: "Error", description: "Update failed", variant: "destructive" });
      }
  };

  const handleEditSave = async (e) => {
      e.preventDefault();
      if (!editingPickup) return;
      try {
          await api.put(`/pickup/${editingPickup._id}`, {
              notes: editingPickup.notes,
              date: editingPickup.date, 
              driverId: editingPickup.driverId,
              status: editingPickup.driverId && editingPickup.status === 'pending' ? 'assigned' : editingPickup.status
          });
          toast({ title: "Success", description: "Pickup updated" });
          setEditingPickup(null);
          fetchData(true);
      } catch (error) {
           toast({ title: "Error", description: "Update failed", variant: "destructive" });
      }
  };

  const handleVehicleAssign = async () => {
      if (!assigningVehicle) return;
      try {
          await api.put(`/auth/users/${assigningVehicle._id}`, { vehicleInfo: vehicleInput });
          toast({ title: "Vehicle Assigned", description: `Assigned ${vehicleInput} to ${assigningVehicle.name}` });
          setAssigningVehicle(null);
          setVehicleInput("");
          fetchData(true);
      } catch (error) {
           toast({ title: "Error", description: "Assignment failed", variant: "destructive" });
      }
  };

  const handleSettingsSave = async () => {
      try {
          await api.put("/settings", settings);
          toast({ title: "Settings Saved", description: "System configuration updated." });
      } catch (error) {
          toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
      }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLocation("/");
  };
  
  // Computed Metrics for KPIs
  const totalCollected = (pickups.reduce((acc, p) => acc + (p.actualWeight || 0), 0) + wasteLogs.reduce((acc, l) => acc + (l.weight || 0), 0)).toFixed(1);
  const completedCount = pickups.filter(p => p.status === 'completed' || p.status === 'collected').length;
  const activeCount = pickups.filter(p => ['assigned','accepted','in_progress'].includes(p.status)).length;
  const onlineDrivers = drivers.filter(d => d.availability === 'online').length;

  if (!user || isLoading) {
      return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  // Filtered Pickups
  const filteredPickups = pickups.filter(p => {
      const matchesSearch = p.address.toLowerCase().includes(searchQuery.toLowerCase()) || (p.city || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-10 border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900">
            <span className="font-heading font-bold text-xl text-white tracking-tight">Eco<span className="text-green-500">Track</span> Admin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
            {[
                { id: 'analytics', label: 'Executive Overview', icon: LayoutDashboard }, // Renamed
                { id: 'pickups', label: 'Pickups', icon: Truck },
                { id: 'livemap', label: 'Live Map', icon: MapIcon },
                { id: 'waste', label: 'Waste Logs', icon: Trash2 },
                { id: 'users', label: 'Users & Fleet', icon: User },
                { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map(item => (
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
                    {user.name[0]}
                </div>
                <div className="truncate">
                   <p className="text-sm font-medium text-white truncate">{user.name}</p>
                   <p className="text-xs text-slate-500">Super Admin</p>
                </div>
             </div>
             <Button variant="destructive" className="w-full shadow-md" onClick={handleLogout}>
                 <LogOut className="mr-2 h-4 w-4" /> Logout
             </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 capitalize">
                    {activeTab === 'livemap' ? 'Live Operations' : activeTab === 'analytics' ? 'Executive Overview' : activeTab}
                </h1>
                <p className="text-slate-500 mt-1">
                    System Intelligence & Management
                </p>
            </div>
            {activeTab === 'livemap' && (
                <div className="flex gap-2">
                     <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                         <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                         {onlineDrivers} Online
                     </Badge>
                     <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                         {pickups.filter(p => p.status === 'in_progress').length} In Transit
                     </Badge>
                </div>
            )}
            
            {(activeTab === 'pickups' || activeTab === 'waste') && (
                 <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                     const rows = [
                         ["Date", "Address", "Type", "Weight", "Status"],
                         ...pickups.map(p => [
                             new Date(p.date).toISOString().split('T')[0],
                             `"${p.address}"`,
                             p.wasteTypes.join(';'),
                             p.actualWeight || 0,
                             p.status
                         ])
                     ];
                     const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
                     const encodedUri = encodeURI(csvContent);
                     const link = document.createElement("a");
                     link.setAttribute("href", encodedUri);
                     link.setAttribute("download", "eco_track_data.csv");
                     document.body.appendChild(link);
                     link.click();
                 }}>
                     <Save className="h-4 w-4" /> Export CSV
                 </Button>
            )}
        </div>
        
        {/* EXECUTIVE DASHBOARD (Default Tab) */}
        {activeTab === 'analytics' && (
             <div className="space-y-6">
                 {/* Top KPI Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <StatCard 
                        title="Total Waste (kg)" 
                        value={totalCollected} 
                        icon={Trash2} 
                        trend={{ value: 12, direction: 'up' }}
                        subtext="All time volume"
                     />
                     <StatCard 
                        title="Completed Pickups" 
                        value={completedCount} 
                        icon={CheckCircle} 
                        trend={{ value: 5, direction: 'up' }}
                        subtext="Successful collections"
                     />
                      <StatCard 
                        title="Active Routes" 
                        value={activeCount} 
                        icon={Truck} 
                        trend={{ value: activeCount > 0 ? 'ON' : 'OFF', direction: 'neutral' }}
                        subtext="Currently listed"
                     />
                      <StatCard 
                        title="Registered Users" 
                        value={users.length} 
                        icon={User} 
                        trend={{ value: 8, direction: 'up' }}
                        subtext="Community members"
                     />
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <div className="lg:col-span-2 space-y-6">
                         {/* Real Data Trend Chart */}
                         <Card className="h-fit">
                            <CardHeader>
                                <CardTitle>Collection Trends</CardTitle>
                                <CardDescription>Waste volume (kg) over the last 7 entries</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={(() => {
                                            // Aggregate last 7 days from wasteLogs and pickups
                                            // Simplification: Just grouping by date string for now
                                            const combined = [
                                                ...wasteLogs.map(l => ({ date: new Date(l.date).toLocaleDateString(), weight: l.weight })),
                                                ...pickups.filter(p => p.actualWeight).map(p => ({ date: new Date(p.date).toLocaleDateString(), weight: p.actualWeight }))
                                            ];
                                            
                                            // Group by date
                                            const grouped = combined.reduce((acc, curr) => {
                                                acc[curr.date] = (acc[curr.date] || 0) + curr.weight;
                                                return acc;
                                            }, {});
                                            
                                            // Convert to array and sort
                                            return Object.entries(grouped)
                                                .map(([name, val]) => ({ name, val }))
                                                .sort((a,b) => new Date(a.name) - new Date(b.name))
                                                .slice(-7); // Last 7 days/entries
                                        })()}
                                    >
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                        <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="val" stroke="#22c55e" fillOpacity={1} fill="url(#colorVal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                         </Card>

                         {/* Driver Performance Chart (Moved from old view) */}
                         <Card>
                            <CardHeader>
                                <CardTitle>Driver Performance</CardTitle>
                                <CardDescription>Completed pickups per driver</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {drivers.map(d => {
                                        const count = pickups.filter(p => p.driverId === d._id && (p.status === 'completed' || p.status === 'collected')).length;
                                        return (
                                            <div key={d._id} className="flex items-center">
                                                <div className="w-full space-y-1">
                                                    <div className="flex justify-between text-sm font-medium">
                                                        <span>{d.name}</span>
                                                        <span>{count} jobs</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-blue-500" 
                                                            style={{ width: `${Math.min((count / 10) * 100, 100)}%` }} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                         </Card>
                     </div>

                     <div className="lg:col-span-1 space-y-6">
                         <ActivityFeed activities={activities} />
                         
                         {/* Waste Type Breakdown (Moved from old view) */}
                         <Card className="h-fit">
                            <CardHeader>
                                <CardTitle>Waste Type Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={Object.entries(
                                            [...pickups, ...wasteLogs.map(l => ({ wasteTypes: [l.type] }))]
                                                .flatMap(p => p.wasteTypes || [])
                                                .reduce((acc, type) => {
                                                    acc[type] = (acc[type] || 0) + 1;
                                                    return acc;
                                                }, {})
                                        ).map(([name, value]) => ({ name, value }))}
                                        layout="vertical"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={60} fontSize={12} />
                                        <Tooltip cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                         </Card>
                     </div>
                 </div>
             </div>
        )}

        {activeTab === 'pickups' && (
            <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                <CardHeader className="px-6 py-4 flex flex-row justify-between items-center border-b bg-slate-50/50">
                    <div>
                         <CardTitle className="text-base">Pickup Schedule</CardTitle>
                    </div>
                    <div className="flex gap-2 items-center">
                         <div className="relative">
                             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                             <Input 
                                placeholder="Search address, city..." 
                                className="pl-9 w-[250px] bg-white" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                             />
                         </div>
                         <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] bg-white">
                                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                         </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                     <div className="divide-y">
                         {filteredPickups.map(p => (
                             <div key={p._id} className="p-6 flex justify-between items-start hover:bg-slate-50 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={p.status === 'completed' ? 'success' : p.status === 'approved' ? 'default' : 'secondary'}>
                                            {p.status.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-sm text-slate-500">
                                            {format(new Date(p.date), "PPP - h:mm a")}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-lg text-slate-900">{p.address}</h3>
                                    <div className="flex gap-2 mt-2">
                                        {p.wasteTypes.map(t => <Badge key={t} variant="outline" className="font-normal text-xs">{t}</Badge>)}
                                    </div>
                                    {p.driverId ? (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full w-fit">
                                            <Truck className="h-3 w-3" />
                                            <span className="font-medium">{drivers.find(d => d._id === p.driverId)?.name || "Unknown Driver"}</span>
                                        </div>
                                    ) : (
                                        <div className="mt-3 text-sm text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full w-fit flex items-center gap-2">
                                             <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Unassigned
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => setEditingPickup(p)}>
                                                <Edit className="h-4 w-4 mr-2" /> Manage
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Manage Pickup</DialogTitle>
                                            </DialogHeader>
                                            {editingPickup && (
                                                <form onSubmit={handleEditSave} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Driver Assignment</Label>
                                                        <Select 
                                                            value={editingPickup.driverId || "unassigned"} 
                                                            onValueChange={(val) => setEditingPickup({...editingPickup, driverId: val === "unassigned" ? null : val})}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Assign a driver" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                                                                {drivers.map(driver => (
                                                                    <SelectItem key={driver._id} value={driver._id}>
                                                                        {driver.name} ({driver.vehicleInfo || 'No Vehicle'})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Admin Notes</Label>
                                                        <Input 
                                                            value={editingPickup.notes || ""} 
                                                            onChange={(e) => setEditingPickup({...editingPickup, notes: e.target.value})} 
                                                            placeholder="Internal notes..."
                                                        />
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="submit">Save Changes</Button>
                                                    </DialogFooter>
                                                </form>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                    
                                    {p.status === 'pending' && (
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(p._id, 'approved')}>
                                            Approve
                                        </Button>
                                    )}
                                </div>
                             </div>
                         ))}
                         {pickups.length === 0 && <div className="p-8 text-center text-slate-500">No pickup requests found.</div>}
                     </div>
                </CardContent>
            </Card>
        )}

        {activeTab === 'livemap' && (
            <div className="h-[600px] w-full bg-slate-100 rounded-xl border relative overflow-hidden flex flex-col items-center justify-center">
                 {/* This would be a real map (Google Maps / Mapbox) */}
                 <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-20 filter grayscale"></div>
                 
                 <div className="relative z-10 w-full h-full p-8 grid place-items-center">
                     <div className="text-center space-y-4">
                         <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md mx-auto">
                             <div className="flex items-center justify-center gap-3 mb-4">
                                 <div className="bg-blue-100 p-3 rounded-full animate-pulse">
                                     <MapIcon className="h-8 w-8 text-blue-600" />
                                 </div>
                             </div>
                             <h3 className="text-xl font-bold text-slate-900">Live Fleet Tracking</h3>
                             <p className="text-slate-500 text-sm mb-6">
                                 Visualization of active drivers and pending pickups is currently in simulation mode.
                             </p>
                             
                             <div className="space-y-3 text-left">
                                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                     <span className="flex items-center gap-2 text-sm font-medium"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online Drivers</span>
                                     <span className="font-bold">{drivers.filter(d => d.availability === 'online').length}</span>
                                 </div>
                                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                     <span className="flex items-center gap-2 text-sm font-medium"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Active Routes</span>
                                     <span className="font-bold">{pickups.filter(p => p.status === 'in_progress').length}</span>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>
        )}

        {activeTab === 'waste' && (
            <Card>
                <CardHeader>
                    <CardTitle>Global Waste Stream</CardTitle>
                    <CardDescription>Real-time log of all recycling activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {wasteLogs.map(log => (
                            <div key={log._id} className="flex justify-between items-center py-3 border-b last:border-0 hover:bg-slate-50 px-2 rounded">
                                <div className="flex items-center gap-4">
                                    <div className="bg-slate-100 p-2 rounded-lg font-bold text-slate-700 w-12 text-center">
                                        {log.type.slice(0,3).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 capitalize">{log.type}</p>
                                        <p className="text-xs text-slate-500">{format(new Date(log.date), "PPP p")}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">{log.weight} kg</p>
                                    <p className="text-xs text-green-600 font-medium">Verified</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )}

        {activeTab === 'users' && (
            <Card>
                <CardHeader>
                    <CardTitle>User & Fleet Management</CardTitle>
                    <CardDescription>Total Users: {users.length} | Drivers: {drivers.length}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users.map(u => (
                            <div key={u._id} className="flex flex-col md:flex-row justify-between items-center border-b pb-4 gap-4 last:border-0">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${u.role === 'admin' ? 'bg-purple-600' : u.role === 'driver' ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                        {u.name[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-slate-900">{u.name}</p>
                                            {u.role === 'driver' && <Badge variant="secondary">Driver</Badge>}
                                            {u.role === 'admin' && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">Admin</Badge>}
                                        </div>
                                        <p className="text-sm text-slate-500">{u.email}</p>
                                        {u.role === 'driver' && (
                                            <p className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                                                <Car className="h-3 w-3" /> {u.vehicleInfo || "No Vehicle Assigned"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {u.role === 'driver' && (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline" onClick={() => {
                                                    setAssigningVehicle(u);
                                                    setVehicleInput(u.vehicleInfo || "");
                                                }}>
                                                    <Car className="h-4 w-4 mr-2" /> Vehicle
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Assign Vehicle</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Vehicle Details</Label>
                                                        <Input 
                                                            placeholder="e.g. Ford Transit - PLATE 123"
                                                            value={vehicleInput}
                                                            onChange={(e) => setVehicleInput(e.target.value)}
                                                        />
                                                    </div>
                                                    <Button className="w-full" onClick={handleVehicleAssign}>Save Assignment</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={async () => {
                                             await api.put(`/auth/users/${u._id}`, { isActive: !u.isActive });
                                             toast({ title: "Updated", description: "User status changed" });
                                             fetchData();
                                        }}
                                        className={!u.isActive ? "text-red-600 border-red-200 bg-red-50" : ""}
                                    >
                                        {u.isActive ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )}
        
        {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing Configuration</CardTitle>
                        <CardDescription>Set the payout rates per kg for collected waste.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(settings.pricing).map(([type, price]) => (
                            <div key={type} className="flex items-center justify-between">
                                <Label className="capitalize">{type} ($/kg)</Label>
                                <Input 
                                    type="number" 
                                    className="w-24 text-right" 
                                    value={price}
                                    onChange={(e) => setSettings({...settings, pricing: {...settings.pricing, [type]: Number(e.target.value)}})}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Service Zones</CardTitle>
                        <CardDescription>Areas where pickups are available.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {settings.zones.map(z => (
                                <Badge key={z} variant="secondary" className="px-3 py-1 flex items-center gap-2">
                                    {z} <XCircle className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSettings({...settings, zones: settings.zones.filter(zone => zone !== z)})} />
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input placeholder="Add new zone..." id="new-zone" onKeyDown={(e) => {
                                if(e.key === 'Enter') {
                                    setSettings({...settings, zones: [...settings.zones, e.currentTarget.value]});
                                    e.currentTarget.value = '';
                                }
                            }} />
                            <Button variant="outline" onClick={() => {
                                const input = document.getElementById('new-zone');
                                if(input.value) {
                                    setSettings({...settings, zones: [...settings.zones, input.value]});
                                    input.value = '';
                                }
                            }}>Add</Button>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="flex justify-end">
                    <Button size="lg" className="gap-2" onClick={handleSettingsSave}>
                        <Save className="h-4 w-4" /> Save Configuration
                    </Button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}
