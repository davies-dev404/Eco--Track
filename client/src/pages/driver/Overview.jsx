import { useState } from "react";
import { format } from "date-fns";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navigation, AlertCircle, Phone, Map, PackageCheck, Camera, Power, TrendingUp, Menu, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  // Time-based Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Analytics Logic
  const getLast7Days = () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push(format(d, "EEE")); // Mon, Tue...
      }
      return days;
  };
  
  const weeklyData = getLast7Days().map(day => {
      // Find tasks for this day (simplified matching)
      const dayTasks = completedTasks.filter(t => format(new Date(t.date), "EEE") === day);
      return {
          day,
          weight: dayTasks.reduce((acc, t) => acc + (t.actualWeight || 0), 0)
      };
  });

  // Handlers
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
          setCollectionPhotos([]);
          refreshData();
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

  const handlePhotoUpload = (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
          const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
          setCollectionPhotos([...collectionPhotos, ...newPhotos]);
      }
  };

  return (
    <div className="space-y-6">
        {/* HERO SECTION */}
       <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl shadow-green-900/20 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-emerald-100 text-sm font-medium mb-1">{getGreeting()},</p>
                        <h2 className="text-3xl font-bold">{user.name.split(' ')[0]}</h2>
                    </div>
                     <div className={`p-1 rounded-full transition-colors duration-300 ${user.availability === 'online' ? 'bg-white/20' : 'bg-black/20'}`}>
                         <Button 
                            size="sm" 
                            variant="ghost"
                            className={`rounded-full h-10 px-4 font-semibold transition-all ${
                                user.availability === 'online' 
                                ? "bg-white text-green-700 hover:bg-white hover:text-green-800" 
                                : "bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                            onClick={toggleAvailability}
                         >
                            <Power className="h-4 w-4 mr-2" /> 
                            {user.availability === 'online' ? "Online" : "Offline"}
                        </Button>
                     </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                         <div className="flex items-center gap-2 text-emerald-100 mb-2">
                             <PackageCheck className="h-4 w-4" />
                             <span className="text-xs font-medium uppercase tracking-wider">Jobs</span>
                         </div>
                         <p className="text-2xl font-bold">{completedTasks.length}</p>
                     </div>
                     <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                         <div className="flex items-center gap-2 text-emerald-100 mb-2">
                             <TrendingUp className="h-4 w-4" />
                             <span className="text-xs font-medium uppercase tracking-wider">Weight</span>
                         </div>
                         <p className="text-2xl font-bold">{totalWeight}<span className="text-sm font-normal text-emerald-200 ml-1">kg</span></p>
                     </div>
                </div>
            </div>
            
            {/* Decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-900/50 to-transparent"></div>
       </div>

       {/* Stats Chart (Toggleable? Or smaller?) */}
       {activeTab === 'active' && (
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-700">Weekly Performance</h3>
                    <Badge variant="outline" className="rounded-full px-2 py-0 border-slate-200 text-slate-500 text-[10px]">7 Days</Badge>
                </div>
                <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} dy={5} />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                            />
                            <Bar dataKey="weight" fill="#10b981" radius={[4, 4, 4, 4]} barSize={12} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
       )}

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1.5 rounded-2xl h-12">
                <TabsTrigger value="active" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-700 font-medium text-xs transition-all duration-300">Active Route</TabsTrigger>
                 <TabsTrigger value="available" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-700 font-medium text-xs transition-all duration-300 relative">
                    Available 
                    {availableTasks.length > 0 && (
                        <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                            {availableTasks.length}
                        </span>
                    )}
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-700 font-medium text-xs transition-all duration-300">History</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTasks.length === 0 && (
                    <div className="text-center py-16 px-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <div className="bg-white w-16 h-16 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                             <Navigation className="h-6 w-6 text-slate-300" />
                        </div>
                        <h3 className="text-base font-bold text-slate-700">All Clear!</h3>
                        <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">You have no active pickups. Check "Available" to claim a new route.</p>
                    </div>
                )}
                
                {/* 1. New Assignments Section */}
                {activeTasks.some(t => t.status === 'assigned') && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pl-1">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Assignments</h3>
                        </div>
                        {activeTasks.filter(t => t.status === 'assigned').map(task => (
                            <Card key={task._id} className="overflow-hidden border-0 shadow-lg shadow-amber-500/10 ring-1 ring-amber-100 bg-white rounded-2xl">
                                <div className="bg-amber-50 px-5 py-3 flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wide border-b border-amber-100">
                                    <AlertCircle className="h-3 w-3" /> Action Required
                                </div>
                                <CardContent className="p-5">
                                    <div className="mb-5">
                                        <h3 className="font-bold text-lg leading-tight text-slate-900">{task.address}</h3>
                                        {task.city && <p className="text-sm text-slate-500 mt-1">{task.city}</p>}
                                        <div className="flex gap-2 mt-3">
                                            {task.wasteTypes.map(t => <Badge key={t} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-0">{t}</Badge>)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl h-11 shadow-lg shadow-slate-900/10" onClick={() => updateTaskStatus(task._id, 'accepted')}>
                                            Accept Job
                                        </Button>
                                        <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl h-11" onClick={() => setRejectingTask(task)}>
                                            Decline
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* 2. Active Route Section */}
                {activeTasks.filter(t => ['accepted', 'in_progress'].includes(t.status)).map(task => (
                    <Card key={task._id} className="overflow-hidden border-0 shadow-xl shadow-slate-200/50 bg-white rounded-3xl relative group">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${task.status === 'in_progress' ? 'bg-green-500' : 'bg-blue-500'}`} />
                        <CardContent className="p-0">
                            <div className="p-6 pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className={`uppercase text-[10px] tracking-wider font-bold border-0 px-2 py-1 rounded-lg ${task.status === 'in_progress' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {task.status.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-xs font-medium text-slate-400">Order #{task._id.slice(-4)}</span>
                                </div>
                                
                                <h3 className="font-bold text-xl leading-snug text-slate-900 mb-1">{task.address}</h3>
                                <p className="text-sm text-slate-500 mb-4">{task.city}</p>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {task.wasteTypes.map((t, i) => (
                                        <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-100">{t}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-4 border-t border-slate-100">
                                {task.status === 'accepted' ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-11" onClick={() => window.open(`tel:1234567890`)}>
                                            <Phone className="h-4 w-4 mr-2" /> Call
                                        </Button>
                                        <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-11" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.address)}`)}>
                                            <Map className="h-4 w-4 mr-2" /> Map
                                        </Button>
                                        <Button className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 shadow-lg shadow-blue-600/20 font-semibold" onClick={() => updateTaskStatus(task._id, 'in_progress')}>
                                            <Navigation className="h-4 w-4 mr-2" /> Start Navigation
                                        </Button>
                                    </div>
                                ) : (
                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 shadow-lg shadow-green-600/20 font-semibold animate-pulse-slow" onClick={() => setCollectingTask(task)}>
                                        <PackageCheck className="h-5 w-5 mr-2" /> Confirm Collection
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                 ))}
            </TabsContent>

            <TabsContent value="available" className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {availableTasks.length === 0 && (
                    <div className="text-center py-20 px-4">
                         <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Menu className="h-6 w-6 text-slate-300" />
                         </div>
                        <p className="text-slate-500 font-medium">No new jobs available.</p>
                        <p className="text-slate-400 text-xs mt-1">Check back later or enable notifications.</p>
                    </div>
                )}
                {availableTasks.map(task => (
                    <Card key={task._id} className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-l-4 border-slate-300 hover:border-green-500">
                         <CardContent className="p-5">
                             <div className="flex justify-between items-start mb-3">
                                 <div>
                                    <h3 className="font-bold text-base text-slate-800">{task.address}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{task.city}</p>
                                 </div>
                                 <div className="text-right">
                                    <span className="block text-xs font-bold text-slate-900">{format(new Date(task.date), "MMM d")}</span>
                                    <span className="text-[10px] text-slate-400">{format(new Date(task.date), "h:mm a")}</span>
                                 </div>
                             </div>
                             
                             <div className="flex gap-2 mb-4">
                                 {task.wasteTypes.map(t => <Badge key={t} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 pointer-events-none">{t}</Badge>)}
                             </div>
                             
                             <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl h-10 font-medium" onClick={() => handleClaimTask(task._id)}>
                                 Claim This Job
                             </Button>
                         </CardContent>
                    </Card>
                ))}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 {completedTasks.length === 0 && <p className="text-center text-slate-400 py-12 text-sm">No history yet</p>}
                 {completedTasks.slice(0, 10).map(task => (
                    <div key={task._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-slate-800">{task.address}</p>
                                <p className="text-[11px] text-slate-500 font-medium">{format(new Date(task.date), "MMM d, h:mm a")}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-sm text-slate-900">{task.actualWeight} kg</span>
                            <span className="text-[10px] text-green-600 font-medium">Completed</span>
                        </div>
                    </div>
                 ))}
            </TabsContent>
       </Tabs>

       {/* Collection Dialog */}
       <Dialog open={!!collectingTask} onOpenChange={(open) => !open && setCollectingTask(null)}>
           <DialogContent className="max-w-sm">
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
               </DialogHeader>
               <div className="space-y-4 py-2">
                   <Textarea 
                       value={rejectReason}
                       onChange={(e) => setRejectReason(e.target.value)}
                       placeholder="E.g. Vehicle breakdown, Too far, Hazard..."
                       className="h-24"
                   />
                   <Button onClick={handleRejectSubmit} disabled={!rejectReason} className="w-full bg-red-600 hover:bg-red-700">
                       Confirm Rejection
                   </Button>
               </div>
           </DialogContent>
       </Dialog>
    </div>
  );
}
