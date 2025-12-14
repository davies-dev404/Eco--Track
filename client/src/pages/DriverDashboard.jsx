import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Truck, LogOut, CheckCircle, MapPin, Calendar, CheckSquare, XCircle, Play, PackageCheck, Power, Phone, Map, Camera, Navigation, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DriverDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  // Collection Logic
  const [collectingTask, setCollectingTask] = useState(null);
  const [collectionData, setCollectionData] = useState({ actualWeight: "", driverNotes: "" });
  const [collectionPhotos, setCollectionPhotos] = useState([]);

  // Reject Logic
  const [rejectingTask, setRejectingTask] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [availableTasks, setAvailableTasks] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setLocation("/auth");
      return;
    }
    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role !== "driver") {
        toast({ title: "Access Denied", description: "This area is for riders only.", variant: "destructive" });
        setLocation("/dashboard");
        return;
    }
    setUser(parsedUser);
    fetchTasks(parsedUser.id);
    fetchAvailableTasks();

    // Polling
    const intervalId = setInterval(() => {
        if (!isLoading) {
            fetchTasks(parsedUser.id, true);
            fetchAvailableTasks(true);
        }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [location, setLocation]);

  const fetchTasks = async (driverId, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
        const { data } = await api.get(`/pickup/assigned?driverId=${driverId}`);
        setTasks(data);
    } catch (error) {
        if (!silent) toast({ title: "Error", description: "Failed to load assigned tasks", variant: "destructive" });
    } finally {
        if (!silent) setIsLoading(false);
    }
  };

  const fetchAvailableTasks = async (silent = false) => {
      try {
          const { data } = await api.get('/pickup/pending');
          setAvailableTasks(data);
      } catch (error) {
          console.error("Failed to load available tasks");
      }
  };

  const handleClaimTask = async (taskId) => {
      try {
          await api.put(`/pickup/${taskId}`, { 
              status: 'accepted',
              driverId: user.id,
              assignedAt: new Date()
          });
          toast({ title: "Job Claimed!", description: "Added to your active route." });
          fetchTasks(user.id);
          fetchAvailableTasks();
          setActiveTab('active');
      } catch (error) {
          toast({ title: "Error", description: "Could not claim task", variant: "destructive" });
      }
  };

  const updateTaskStatus = async (taskId, status, extraData = {}) => {
      try {
          await api.put(`/pickup/${taskId}`, { status, ...extraData });
          toast({ title: "Status Updated", description: `Task marked as ${status.replace('_', ' ')}` });
          fetchTasks(user.id);
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
              photos: collectionPhotos // Send array of photo URLs (stubbed)
          });
          toast({ title: "Collection Successful", description: "Pickup recorded." });
          setCollectingTask(null);
          setCollectionData({ actualWeight: "", driverNotes: "" });
          setCollectionPhotos([]);
          fetchTasks(user.id);
      } catch (error) {
          toast({ title: "Error", description: "Failed to record collection", variant: "destructive" });
      }
  };

  const handleRejectSubmit = async () => {
      if (!rejectingTask) return;
      await updateTaskStatus(rejectingTask._id, 'rejected', { driverNotes: `Reason: ${rejectReason}` });
      setRejectingTask(null);
      setRejectReason("");
  };

  const toggleAvailability = async () => {
      try {
           const newStatus = user.availability === 'online' ? 'offline' : 'online';
           // Optimistic update
           const updatedUser = { ...user, availability: newStatus };
           setUser(updatedUser);
           localStorage.setItem("user", JSON.stringify(updatedUser)); 

           await api.put(`/auth/users/${user.id}`, { availability: newStatus });
           toast({ title: newStatus === 'online' ? "You are Online" : "You are Offline" });
      } catch (error) {
          console.error(error);
          toast({ title: "Error", description: "Connection failed", variant: "destructive" });
      }
  };

  const handlePhotoUpload = (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
          const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
          setCollectionPhotos([...collectionPhotos, ...newPhotos]);
      }
  };

  const activeTasks = tasks.filter(t => ['assigned', 'accepted', 'in_progress'].includes(t.status));
  const completedTasks = tasks.filter(t => ['collected', 'completed'].includes(t.status));
  
  // Stats Calculation
  const totalWeight = completedTasks.reduce((acc, t) => acc + (t.actualWeight || 0), 0).toFixed(1);
  
  // Stub distance
  const totalDistance = (totalWeight * 0.8).toFixed(1); // 0.8km per kg avg (mock)

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLocation("/");
  };

  if (!user) return <div className="p-8 flex justify-center"><Power className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
       {/* Header */}
       <header className="bg-slate-900 text-white px-4 py-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
           <div className="flex items-center gap-3">
               <div className="bg-green-500/20 p-2 rounded-full backdrop-blur-sm border border-green-500/30">
                   <Truck className="h-5 w-5 text-green-400" />
               </div>
               <div>
                   <h1 className="font-bold text-lg leading-tight">Driver Portal</h1>
                   <div className="flex items-center gap-2 text-xs text-slate-400">
                       <span className="truncate max-w-[100px]">{user.vehicleInfo || "No Vehicle Assigned"}</span>
                       <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                       <span className={user.availability === 'online' ? "text-green-400 font-medium" : "text-slate-500"}>
                           {user.availability === 'online' ? 'Online' : 'Offline'}
                       </span>
                   </div>
               </div>
           </div>
           
           <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-white hover:bg-slate-800">
               <LogOut className="h-5 w-5" />
           </Button>
       </header>

       {/* Quick Actions Bar */}
       <div className={`px-4 py-3 bg-white border-b sticky top-[72px] z-10 flex justify-between items-center transition-colors ${
           user.availability === 'offline' ? 'bg-slate-100' : ''
       }`}>
           <span className="text-sm font-medium text-slate-600">
               {user.availability === 'online' ? 'Accepting Jobs' : 'Status: Offline'}
           </span>
            <div className="flex items-center gap-2">
               <span className="text-xs text-muted-foreground mr-1">Go {user.availability === 'online' ? 'Offline' : 'Online'}</span>
               <Button 
                    size="sm" 
                    className={`rounded-full shadow-lg ${user.availability === 'online' ? "bg-green-600 hover:bg-green-700" : "bg-slate-500"}`}
                    onClick={toggleAvailability}
               >
                   <Power className="h-4 w-4" />
               </Button>
            </div>
       </div>

       {/* Content */}
       <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-4 pb-20">
           
           {/* Stats Cards */}
           {activeTab === 'active' && (
               <div className="grid grid-cols-2 gap-3 mb-2">
                   <div className="bg-white p-3 rounded-xl border shadow-sm flex flex-col items-center">
                       <span className="text-2xl font-bold text-slate-900">{completedTasks.length}</span>
                       <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Jobs</span>
                   </div>
                   <div className="bg-white p-3 rounded-xl border shadow-sm flex flex-col items-center">
                       <span className="text-2xl font-bold text-slate-900">{totalWeight} <span className="text-sm text-slate-400 font-normal">kg</span></span>
                       <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Collected</span>
                   </div>
                   <div className="bg-white p-3 rounded-xl border shadow-sm flex flex-col items-center col-span-2">
                       <span className="text-2xl font-bold text-green-600">${completedTasks.reduce((acc, t) => acc + (t.earnedAmount || 0), 0).toFixed(2)}</span>
                       <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Earnings</span>
                   </div>
               </div>
           )}

           <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-200 p-1 rounded-xl">
                    <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Active ({activeTasks.length})</TabsTrigger>
                     <TabsTrigger value="available" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm relative">
                        Available 
                        {availableTasks.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">History</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4 pt-4">
                    {activeTasks.length === 0 && (
                        <div className="text-center py-16 px-4">
                            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Navigation className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
                            <p className="text-slate-500 mt-1 max-w-[200px] mx-auto">
                                You have no active pickups assigned. Check "Available" for new jobs.
                            </p>
                        </div>
                    )}
                    
                    {activeTasks.map(task => (
                        <Card key={task._id} className="overflow-hidden border-0 shadow-md ring-1 ring-slate-200">
                            {/* Status Stripe */}
                            <div className={`h-1.5 w-full ${
                                task.status === 'in_progress' ? 'bg-green-500' : 
                                task.status === 'accepted' ? 'bg-blue-500' : 'bg-amber-500'
                            }`} />
                            
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <Badge variant="outline" className="mb-2 uppercase text-[10px] tracking-wider font-semibold">
                                            {task.status.replace('_', ' ')}
                                        </Badge>
                                        <h3 className="font-bold text-xl leading-tight text-slate-900">{task.address}</h3>
                                        {task.city && <p className="text-sm text-slate-500">{task.city}</p>}
                                        {task.instructions && (
                                            <div className="bg-yellow-50 text-yellow-800 text-sm p-2 rounded mt-2 border border-yellow-100 flex gap-2 items-start">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>{task.instructions}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs font-medium text-slate-400">TIME</span>
                                        <span className="block font-bold text-slate-700">{format(new Date(task.date), "h:mm a")}</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-1.5 mb-6">
                                    {task.wasteTypes.map((t, i) => (
                                        <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                            {t}
                                        </span>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    {/* Primary Actions based on Status */}
                                    {task.status === 'assigned' ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button size="lg" className="w-full bg-slate-900" onClick={() => updateTaskStatus(task._id, 'accepted')}>
                                                Accept Job
                                            </Button>
                                            <Button size="lg" variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setRejectingTask(task)}>
                                                Reject
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <Button variant="outline" className="gap-2 h-12" onClick={() => window.open(`tel:1234567890`)}>
                                                <Phone className="h-4 w-4" /> Call
                                            </Button>
                                            {task.location && task.location.lat ? (
                                                <Button variant="outline" className="gap-2 h-12" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${task.location.lat},${task.location.lng}`)}>
                                                    <Map className="h-4 w-4" /> Map GPS
                                                </Button>
                                            ) : (
                                                <Button variant="outline" className="gap-2 h-12" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.address + " " + (task.city || ""))}`)}>
                                                    <Map className="h-4 w-4" /> Map Addr
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {/* Progression Actions */}
                                    {task.status === 'accepted' && (
                                        <Button size="lg" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 h-12 text-base shadow-lg shadow-blue-200" onClick={() => updateTaskStatus(task._id, 'in_progress')}>
                                            <Navigation className="h-5 w-5" /> Start Route
                                        </Button>
                                    )}
                                    
                                    {task.status === 'in_progress' && (
                                        <div className="space-y-3">
                                            <Button size="lg" className="w-full gap-2 bg-green-600 hover:bg-green-700 h-12 text-base shadow-lg shadow-green-200 animate-pulse-slow" onClick={() => setCollectingTask(task)}>
                                                <PackageCheck className="h-5 w-5" /> Arrived & Collect
                                            </Button>
                                            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => {
                                                setRejectingTask(task); // Re-use reject dialog logic but contextually as "Report Issue" if already active
                                                setRejectReason(""); 
                                            }}>
                                                <AlertCircle className="h-4 w-4 mr-2" /> Report Incident
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="available" className="space-y-4 pt-4">
                    {availableTasks.length === 0 && (
                        <div className="text-center py-16 px-4">
                            <p className="text-slate-500">No new jobs available right now.</p>
                        </div>
                    )}
                    {availableTasks.map(task => (
                        <Card key={task._id} className="border-l-4 border-l-slate-400">
                             <CardContent className="p-5">
                                 <div className="flex justify-between items-start mb-2">
                                     <h3 className="font-bold text-lg">{task.address}</h3>
                                     <Badge variant="outline">{format(new Date(task.date), "MMM d")}</Badge>
                                 </div>
                                 <p className="text-sm text-slate-500 mb-4">{task.city}</p>
                                 <div className="flex gap-2 mb-4">
                                     {task.wasteTypes.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                                 </div>
                                 <Button className="w-full bg-slate-900" onClick={() => handleClaimTask(task._id)}>
                                     Claim Job
                                 </Button>
                             </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="history" className="space-y-4 pt-4">
                     {completedTasks.length === 0 && <p className="text-center text-slate-400 py-8 italic">No history yet</p>}
                     {completedTasks.slice(0, 10).map(task => (
                        <div key={task._id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-slate-800">{task.address}</p>
                                <p className="text-xs text-slate-500">{format(new Date(task.date), "MMM d, h:mm a")}</p>
                            </div>
                            <div className="text-right">
                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                    {task.actualWeight} kg
                                </Badge>
                                <p className="text-[10px] text-green-600 font-medium mt-0.5">COMPLETE</p>
                            </div>
                        </div>
                     ))}
                </TabsContent>
           </Tabs>

           {/* Collection Dialog */}
           <Dialog open={!!collectingTask} onOpenChange={(open) => !open && setCollectingTask(null)}>
               <DialogContent className="max-w-sm sm:max-w-md">
                   <DialogHeader>
                       <DialogTitle>Complete Collection</DialogTitle>
                       <DialogDescription>Record weight and proof.</DialogDescription>
                   </DialogHeader>
                   <form onSubmit={handleCollectionSubmit} className="space-y-4 pt-2">
                       <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                               <Label>Weight (kg)</Label>
                               <Input 
                                    type="number" 
                                    step="0.1" 
                                    required
                                    className="text-lg font-bold"
                                    value={collectionData.actualWeight}
                                    onChange={(e) => setCollectionData({...collectionData, actualWeight: e.target.value})}
                                    placeholder="0.0"
                                    autoFocus
                               />
                           </div>
                           <div className="space-y-2">
                               <Label>Photo Proof</Label>
                               <div className="border-2 border-dashed rounded-md h-10 flex items-center justify-center cursor-pointer hover:bg-slate-50 relative overflow-hidden">
                                   <input type="file" className="opacity-0 absolute inset-0 cursor-pointer" accept="image/*" multiple onChange={handlePhotoUpload} />
                                   <Camera className="h-4 w-4 text-slate-400" />
                                   {collectionPhotos.length > 0 && <span className="absolute top-0 right-0 bg-green-500 w-2 h-2 rounded-full border border-white"></span>}
                               </div>
                               <p className="text-[10px] text-muted-foreground text-center">
                                   {collectionPhotos.length} photos added
                               </p>
                           </div>
                       </div>
                       
                       <div className="space-y-2">
                           <Label>Notes</Label>
                           <Textarea 
                                value={collectionData.driverNotes}
                                onChange={(e) => setCollectionData({...collectionData, driverNotes: e.target.value})}
                                placeholder="Any issues?"
                                className="resize-none h-20"
                           />
                       </div>

                       <DialogFooter>
                           <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700">Confirm & Complete</Button>
                       </DialogFooter>
                   </form>
               </DialogContent>
           </Dialog>
           
           {/* Reject Dialog */}
           <Dialog open={!!rejectingTask} onOpenChange={(open) => !open && setRejectingTask(null)}>
               <DialogContent className="max-w-sm">
                   <DialogHeader>
                       <DialogTitle className="text-red-600">Reject Assignment</DialogTitle>
                       <DialogDescription>Please specify why you cannot fulfill this request.</DialogDescription>
                   </DialogHeader>
                   <div className="space-y-4 py-2">
                       <Textarea 
                           value={rejectReason}
                           onChange={(e) => setRejectReason(e.target.value)}
                           placeholder="E.g. Vehicle breakdown, Too far, Hazard..."
                           className="h-24"
                       />
                       <Button 
                            onClick={handleRejectSubmit} 
                            disabled={!rejectReason} 
                            className="w-full bg-red-600 hover:bg-red-700"
                       >
                           Confirm Rejection
                       </Button>
                   </div>
               </DialogContent>
           </Dialog>

       </main>
    </div>
  );
}
