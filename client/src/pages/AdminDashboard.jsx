import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, Save, Trash2, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/context/SocketContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

// Import Modular Components
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminPickups from "@/components/admin/AdminPickups";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminLiveMap from "@/components/admin/AdminLiveMap";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("analytics"); 
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
  const [usersViewMode, setUsersViewMode] = useState('all'); // 'all' | 'pending' | 'drivers'
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
  const activeCount = pickups.filter(p => ['assigned','accepted','in_progress'].includes(p.status)).length;
  const onlineDrivers = drivers.filter(d => d.availability === 'online').length;

  if (!user || isLoading) {
      return (
          <div className="min-h-screen flex bg-slate-50">
               <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />
               <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                   <div className="mb-8">
                       <h1 className="text-3xl font-bold tracking-tight text-slate-200 w-1/3 h-10 bg-slate-200 rounded animate-pulse mb-2"></h1>
                       <div className="h-4 w-1/4 bg-slate-200 rounded animate-pulse"></div>
                   </div>
                   <DashboardSkeleton />
               </main>
          </div>
      );
  }



  // Export CSV Helper
  // Export CSV Helper
  const handleExportCSV = () => {
     const rows = [
         ["Eco-Track System Export", `Generated: ${new Date().toISOString()}`],
         [],
         ["PICKUP REQUESTS"],
         ["Date", "Address", "Type", "Weight (kg)", "Status", "Driver ID"],
         ...pickups.map(p => [
             new Date(p.date).toISOString().split('T')[0],
             `"${p.address}"`,
             p.wasteTypes.join(';'),
             p.actualWeight || 0,
             p.status,
             p.driverId || "Unassigned"
         ]),
         [],
         ["WASTE LOGS"],
         ["Date", "User ID", "Type", "Weight (kg)"],
         ...wasteLogs.map(l => [
             new Date(l.date).toISOString().split('T')[0],
             l.userId,
             l.type,
             l.weight
         ])
     ];
     
     const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", `EcoTrack_Full_Data_${timeFilter}.csv`);
     document.body.appendChild(link);
     link.click();
  };



  // Report Generation Logic
  const handleGenerateReport = async () => {
      try {
          const loadingToast = toast({ title: "Generating Report...", description: "Capturing analytics and compiling data." });
          
          // Wait for UI to be fully rendered if switching tabs just happened (optional safety)
          await new Promise(r => setTimeout(r, 500));

          const doc = new jsPDF();
          
          // -- HEADER --
          doc.setFontSize(22);
          doc.setTextColor(22, 163, 74); // Green
          doc.text("Eco-Track System Report", 14, 20);
          
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
          doc.text(`Generated by: ${user?.name || "Admin"}`, 14, 33);
          
          doc.line(14, 38, 196, 38); // Horizontal line

          // -- SUMMARY STATS --
          doc.setFontSize(14);
          doc.setTextColor(0);
          doc.text("Executive Summary", 14, 48);
          
          const summaryData = [
              ["Total Collections", `${totalCollected} kg`],
              ["Completed Pickups", completedCount],
              ["Active Drivers", onlineDrivers],
              ["CO2 Saved", `${(totalCollected * 1.5).toFixed(1)} kg`],
              ["Pending Requests", pickups.filter(p => ['pending', 'assigned'].includes(p.status)).length]
          ];
          
          autoTable(doc, {
              startY: 53,
              head: [['Metric', 'Value']],
              body: summaryData,
              theme: 'striped',
              headStyles: { fillColor: [22, 163, 74] },
              styles: { fontSize: 10 }
          });
          
          let currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 80;

          // -- CHARTS (Monthly Analysis) --
          doc.text("Monthly Analysis", 14, currentY);
          currentY += 10;

          const trendsChart = document.getElementById('collection-trends-chart');
          const breakdownChart = document.getElementById('waste-breakdown-chart');

          if (trendsChart) {
              try {
                  const canvas = await html2canvas(trendsChart, { scale: 2 });
                  const imgData = canvas.toDataURL('image/png');
                  const imgWidth = 180; 
                  const imgHeight = (canvas.height * imgWidth) / canvas.width;
                  
                  doc.addImage(imgData, 'PNG', 15, currentY, imgWidth, imgHeight);
                  currentY += imgHeight + 10;
              } catch (e) {
                  console.error("Could not capture trends chart", e);
              }
          }

          if (breakdownChart && currentY < 250) { // Check space
              try {
                  const canvas = await html2canvas(breakdownChart, { scale: 2 });
                  const imgData = canvas.toDataURL('image/png');
                  const imgWidth = 180; 
                  const imgHeight = (canvas.height * imgWidth) / canvas.width;

                   // New page if needed
                   if (currentY + imgHeight > 280) {
                       doc.addPage();
                       currentY = 20;
                   }
                  
                  doc.addImage(imgData, 'PNG', 15, currentY, imgWidth, imgHeight);
                  currentY += imgHeight + 15;
              } catch (e) {
                  console.error("Could not capture breakdown chart", e);
              }
          }

          // Force new page for Tables if space is low
          if (currentY > 200) {
              doc.addPage();
              currentY = 20;
          }

          // -- PICKUPS TABLE --
          doc.text("Recent Pickups", 14, currentY);
          
          const pickupRows = pickups.slice(0, 20).map(p => [
              new Date(p.date).toLocaleDateString(),
              p.address,
              p.wasteTypes.join(", "),
              (p.status || "unknown").toUpperCase(),
              p.driverId ? drivers.find(d => d._id === p.driverId)?.name || "Unknown" : "Unassigned"
          ]);
          
          autoTable(doc, {
              startY: currentY + 5,
              head: [['Date', 'Address', 'Waste', 'Status', 'Driver']],
              body: pickupRows,
              theme: 'grid',
              headStyles: { fillColor: [30, 41, 59] }, // Slate 800
              styles: { fontSize: 8 }
          });

          // -- DRIVER FLEET --
          const finalY2 = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : currentY + 40;
           // Check page break for fleet table
           if (finalY2 > 250) {
                doc.addPage();
                doc.text("Fleet Status", 14, 20);
                autoTable(doc, {
                    startY: 25,
                    head: [['Driver', 'Vehicle', 'Status', 'Account']],
                    body: drivers.map(d => [
                        d.name,
                        d.vehicleInfo || "N/A",
                        (d.availability || "offline").toUpperCase(),
                        d.isActive ? "Active" : "Inactive"
                    ]),
                    theme: 'striped',
                    styles: { fontSize: 8 }
                });
           } else {
                doc.text("Fleet Status", 14, finalY2);
                autoTable(doc, {
                    startY: finalY2 + 5,
                    head: [['Driver', 'Vehicle', 'Status', 'Account']],
                    body: drivers.map(d => [
                        d.name,
                        d.vehicleInfo || "N/A",
                        (d.availability || "offline").toUpperCase(),
                        d.isActive ? "Active" : "Inactive"
                    ]),
                    theme: 'striped',
                    styles: { fontSize: 8 }
                });
           }

          // Save PDF
          doc.save(`EcoTrack_Report_${new Date().toISOString().split('T')[0]}.pdf`);
          
          // Toast for Email Simulation
          toast({ title: "Report Generated", description: "PDF with charts downloaded." });
      } catch (error) {
          console.error("Report Generation Failed:", error);
          toast({ title: "Generation Error", description: "Failed to create report. Please try again.", variant: "destructive" });
      }
  };



  const handleQuickAction = (action) => {
      if (action === 'report') {
          handleGenerateReport();
      } else if (action === 'vehicle' || action === 'driver') {
          setActiveTab('users');
          setUsersViewMode('pending'); // Auto-switch to pending view
          toast({ title: "Redirecting", description: "Showing pending approvals..." });
      }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 capitalize">
                    {activeTab === 'livemap' ? 'Live Operations' : activeTab === 'analytics' ? 'Executive Overview' : activeTab === 'waste' ? 'Waste Logs' : activeTab === 'users' ? 'User Management' : activeTab === 'pickups' ? 'Pickup Requests' : 'System Settings'}
                </h1>
                <p className="text-slate-500 mt-1">
                    System Intelligence & Management
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                 {/* Global Time Filter */}
                 {activeTab === 'analytics' && (
                     <div className="bg-white rounded-lg border p-1 flex items-center shadow-sm">
                         {['today', '7d', '30d', 'all'].map((filter) => (
                             <button
                                 key={filter}
                                 onClick={() => setTimeFilter(filter)}
                                 className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                                     timeFilter === filter 
                                     ? 'bg-slate-900 text-white shadow-sm' 
                                     : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                 }`}
                             >
                                 {filter === 'today' ? 'Today' : filter === '7d' ? '7 Days' : filter === '30d' ? '30 Days' : 'All Time'}
                             </button>
                         ))}
                     </div>
                 )}

                 {/* Quick Actions (Admin Control) */}
                 <Select onValueChange={handleQuickAction}>
                    <SelectTrigger className="w-[160px] bg-white border-slate-200 shadow-sm">
                        <SelectValue placeholder="Quick Actions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="report">📄 Generate Report</SelectItem>
                        <SelectItem value="vehicle">🚚 Approve Vehicle</SelectItem>
                        <SelectItem value="driver">👤 Approve Driver</SelectItem>
                    </SelectContent>
                 </Select>

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
                     <Button variant="outline" size="sm" className="gap-2 hover:border-slate-400" onClick={handleExportCSV}>
                         <Save className="h-4 w-4" /> Export CSV
                     </Button>
                )}
            </div>
        </div>
        
        {/* Content Area */}
        <div className="min-h-[500px]">
            {activeTab === 'analytics' && (
                <AdminOverview 
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
                    onNavigate={(tab) => setActiveTab(tab)}
                />
            )}

            {activeTab === 'pickups' && (
                <AdminPickups pickups={pickups} drivers={drivers} onUpdate={() => fetchData(true)} />
            )}

            {activeTab === 'livemap' && (
                <AdminLiveMap drivers={drivers} pickups={pickups} />
            )}

            {activeTab === 'waste' && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-green-600"/> Global Waste Stream</CardTitle>
                        <CardDescription>Real-time log of all recycling activities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {wasteLogs.map(log => (
                                <div key={log._id} className="flex justify-between items-center py-3 border-b last:border-0 hover:bg-slate-50 px-2 rounded transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-slate-100 p-2 rounded-lg font-bold text-slate-700 w-12 text-center group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                                            {log.type.slice(0,3).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 capitalize">{log.type}</p>
                                            <p className="text-xs text-slate-500">{format(new Date(log.date), "PPP p")}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">{log.weight} kg</p>
                                        <p className="text-xs text-green-600 font-medium flex items-center justify-end gap-1"><CheckCircle className="h-3 w-3"/> Verified</p>
                                    </div>
                                </div>
                            ))}
                            {wasteLogs.length === 0 && <div className="p-8 text-center text-slate-500">No waste logs found.</div>}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'users' && (
                <AdminUsers users={users} drivers={drivers} onUpdate={() => fetchData(true)} viewMode={usersViewMode} setViewMode={setUsersViewMode} />
            )}
            
            {activeTab === 'settings' && (
                <AdminSettings settings={settings} setSettings={setSettings} />
            )}
        </div>

      </main>
    </div>
  );
}
