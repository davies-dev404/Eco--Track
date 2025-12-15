import { useState } from "react";
import { format } from "date-fns";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navigation, AlertCircle, Phone, Map, PackageCheck, Camera, Power, TrendingUp, Clock, MapPin, CheckCircle, Wallet } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Overview({ user, tasks, availableTasks, refreshData, toggleAvailability }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("active");

  // Local State for Actions
  const [collectingTask, setCollectingTask] = useState(null);
  const [collectionData, setCollectionData] = useState({ actualWeight: "", driverNotes: "" });
  const [collectionPhotos, setCollectionPhotos] = useState([]);
  const [rejectingTask, setRejectingTask] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const activeTasks = tasks.filter(t => ['assigned', 'accepted', 'in_progress'].includes(t.status));
  const completedTasks = tasks.filter(t => ['collected', 'completed'].includes(t.status));

  // Stats
  const totalWeight = completedTasks.reduce((acc, t) => acc + (t.actualWeight || 0), 0).toFixed(1);
  const todaysEarnings = 1250; // Mock or calculate

  // Time-based Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Analytics Logic (Mocked for visual)
  const weeklyData = [
      { day: 'Mon', weight: 45 },
      { day: 'Tue', weight: 120 },
      { day: 'Wed', weight: 80 },
      { day: 'Thu', weight: 150 },
      { day: 'Fri', weight: 200 },
      { day: 'Sat', weight: 180 },
      { day: 'Sun', weight: 60 },
  ];

  // Handlers (Simplified for brevity, logic remains same)
  const handleClaimTask = async (taskId) => {
      try {
          await api.put(`/pickup/${taskId}`, { 
              status: 'accepted',
              driverId: user.id || user._id,
              assignedAt: new Date()
          });
          toast({ title: "Job Claimed!", description: "Added to your active route." });
          refreshData();
          setActiveTab('active');
      } catch (error) {
          toast({ title: "Error", description: "Could not claim task", variant: "destructive" });
      }
  };

  const updateTaskStatus = async (taskId, status, extraData = {}) => {
      try {
          await api.put(`/pickup/${taskId}`, { status, ...extraData });
          toast({ title: "Status Updated", description: `Task marked as ${status.replace('_', ' ')}` });
          refreshData();
      } catch (error) {
          toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      }
  };

  const handleCollectionSubmit = async (e) => {
      e.preventDefault();
      if (!collectingTask) return;
      try {
          await api.put(`/pickup/${collectingTask._id}`, {
              status: 'collected',
              actualWeight: Number(collectionData.actualWeight),
              driverNotes: collectionData.driverNotes,
              collectedAt: new Date(),
              photos: collectionPhotos
          });
          toast({ title: "Collection Successful", description: "Pickup recorded." });
          setCollectingTask(null);
          setCollectionData({ actualWeight: "", driverNotes: "" });
          refreshData();
      } catch (error) {
          toast({ title: "Error", variant: "destructive", description: "Failed to submit collection" });
      }
  };

  return (
    <div className="space-y-8 pb-12">
        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            {/* Background Texture */}
            <div className="absolute top-0 right-0 p-12 opacity-10">
                <Navigation className="h-64 w-64 text-green-500" />
            </div>
            
            <div className="relative p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <Badge variant="outline" className="text-green-400 border-green-900/50 bg-green-900/10 px-3 py-1 mb-2">
                        {user.availability === 'online' ? '● System Online' : '○ You are Offline'}
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        {getGreeting()}, <span className="text-green-500">{user.name?.split(" ")[0]}</span>
                    </h1>
                    <p className="text-slate-400 max-w-sm">
                        You have <span className="text-white font-bold">{activeTasks.length} active jobs</span> to complete today.
                    </p>
                </div>

                <div className="flex gap-4">
                     <Button 
                        size="lg"
                        onClick={toggleAvailability}
                        className={`shadow-xl transition-all duration-300 ${
                            user.availability === "online" 
                            ? "bg-red-500 hover:bg-red-600 text-white" 
                            : "bg-green-500 hover:bg-green-600 text-white animate-pulse"
                        }`}
                     >
                        <Power className="mr-2 h-5 w-5" />
                        {user.availability === "online" ? "Go Offline" : "Go Online"}
                     </Button>
                </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-3 divide-x divide-slate-800 bg-slate-950/50 backdrop-blur-sm border-t border-slate-800">
                <div className="p-4 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Completed</p>
                    <p className="text-2xl font-bold text-white font-mono">{completedTasks.length}</p>
                </div>
                <div className="p-4 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Weight (Kg)</p>
                    <p className="text-2xl font-bold text-green-400 font-mono">{totalWeight}</p>
                </div>
                <div className="p-4 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Rating</p>
                    <p className="text-2xl font-bold text-amber-500 font-mono">4.9</p>
                </div>
            </div>
        </div>

        {/* ANALYTICS & TABS GRID */}
        <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column (Chart) */}
            <Card className="lg:col-span-1 border-slate-200 shadow-lg bg-white">
                <CardHeader>
                   <CardTitle className="text-lg flex items-center gap-2">
                       <TrendingUp className="h-5 w-5 text-green-600" /> Performance
                   </CardTitle>
                   <CardDescription>Collection weight trends</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Right Column (Tasks) */}
            <div className="lg:col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white p-1 rounded-full border border-slate-200 shadow-sm w-full max-w-md mx-auto grid grid-cols-2">
                        <TabsTrigger value="active" className="rounded-full data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">My Active Route</TabsTrigger>
                        <TabsTrigger value="available" className="rounded-full data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all relative">
                            Available Jobs
                            {availableTasks.length > 0 && <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        {activeTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                    <Navigation className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No active jobs</h3>
                                <p className="text-slate-500 max-w-xs mx-auto">You're all clear! Check the Available Jobs tab to pick up new work.</p>
                            </div>
                        ) : (
                            activeTasks.map(task => (
                                <Card key={task._id} className="border-l-4 border-l-blue-500 overflow-hidden hover:shadow-lg transition-shadow bg-white">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <Badge variant="secondary" className="mb-2 bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                    {task.status.replace("_", " ").toUpperCase()}
                                                </Badge>
                                                <h3 className="font-bold text-xl text-slate-800">{task.city || "Unknown Location"}</h3>
                                                <p className="text-slate-500 flex items-center gap-1 mt-1 text-sm">
                                                    <MapPin className="h-3 w-3" /> {task.address}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                 <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Est. Weight</p>
                                                 <p className="text-2xl font-mono font-bold text-slate-700">{task.estimatedWeight || "N/A"} kg</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <p className="text-xs text-slate-500 mb-1">Waste Types</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {task.wasteTypes?.map(w => (
                                                        <Badge key={w} variant="outline" className="text-xs bg-white">{w}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <p className="text-xs text-slate-500 mb-1">Customer Note</p>
                                                <p className="text-sm text-slate-700 italic line-clamp-2">"{task.notes || 'No notes provided'}"</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                             <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-green-200 shadow-lg" onClick={() => setCollectingTask(task)}>
                                                 <PackageCheck className="h-4 w-4 mr-2" /> Collect Waste
                                             </Button>
                                             <Button variant="outline" size="icon" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(task.address)}`)}>
                                                 <Navigation className="h-4 w-4 text-blue-600" />
                                             </Button>
                                             <Button variant="outline" size="icon">
                                                 <Phone className="h-4 w-4 text-slate-600" />
                                             </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="available" className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        {availableTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-slate-50/50">
                                <Clock className="h-10 w-10 text-slate-300 mb-3" />
                                <h3 className="text-lg font-semibold text-slate-900">No jobs nearby</h3>
                            </div>
                        ) : (
                            availableTasks.map(task => (
                                <Card key={task._id} className="group hover:border-green-500 transition-colors cursor-pointer bg-white">
                                    <div className="p-5 flex items-center justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-green-50 p-3 rounded-xl group-hover:bg-green-100 transition-colors">
                                                <MapPin className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{task.city || "New Pickup Request"}</h4>
                                                <p className="text-sm text-slate-500">{task.address}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="secondary" className="text-xs">{task.wasteTypes?.length || 1} items</Badge>
                                                    <span className="text-xs text-slate-400">• Posted {format(new Date(task.date), "h:mm a")}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button onClick={() => handleClaimTask(task._id)} variant="ghost" className="text-green-600 font-bold hover:text-green-700 hover:bg-green-50">
                                            ACCEPT
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>

        {/* Collection Modal */}
        <Dialog open={!!collectingTask} onOpenChange={(open) => !open && setCollectingTask(null)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Collection</DialogTitle>
                    <DialogDescription>Verify waste details to process rewards.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCollectionSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Measured Weight (kg)</Label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                step="0.1" 
                                placeholder="0.0" 
                                className="pl-10 text-lg font-mono font-bold"
                                value={collectionData.actualWeight}
                                onChange={(e) => setCollectionData({...collectionData, actualWeight: e.target.value})}
                                required
                            />
                            <div className="absolute left-3 top-2.5 text-slate-400 font-bold">Kg</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Driver Notes</Label>
                         <Textarea 
                            placeholder="Any issues with waste quality?" 
                            value={collectionData.driverNotes}
                            onChange={(e) => setCollectionData({...collectionData, driverNotes: e.target.value})}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Confirm & Finish</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
  );
}
