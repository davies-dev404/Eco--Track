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
import { Navigation, AlertCircle, Phone, Map, PackageCheck, Camera, Power, TrendingUp } from "lucide-react";
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
    <div className="p-4 space-y-6 max-w-xl mx-auto pb-24">
        {/* Quick Actions / Status Bar */}
       <div className={`px-4 py-3 bg-white rounded-xl border shadow-sm flex justify-between items-center transition-colors ${
            user.availability === 'offline' ? 'bg-slate-100' : ''
       }`}>
            <div>
                 <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Current Status</p>
                 <span className={`text-sm font-bold ${user.availability === 'online' ? "text-green-600" : "text-slate-500"}`}>
                    {user.availability === 'online' ? 'Online & Accepting' : 'Offline'}
                 </span>
            </div>
             <Button 
                size="sm" 
                variant={user.availability === 'online' ? "default" : "secondary"}
                className={`rounded-full h-8 ${user.availability === 'online' ? "bg-green-600 hover:bg-green-700" : ""}`}
                onClick={toggleAvailability}
             >
                <Power className="h-4 w-4 mr-2" /> {user.availability === 'online' ? "Go Offline" : "Go Online"}
            </Button>
       </div>

       {/* Stats Cards & Analytics */}
       {activeTab === 'active' && (
            <>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border shadow-sm flex flex-col items-center">
                        <span className="text-2xl font-bold text-slate-900">{completedTasks.length}</span>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Jobs Done</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border shadow-sm flex flex-col items-center">
                        <span className="text-2xl font-bold text-slate-900">{totalWeight} <span className="text-sm text-slate-400 font-normal">kg</span></span>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Collected</span>
                    </div>
                </div>

                {/* Weekly Activity Chart */}
                <Card className="border-0 shadow-none bg-transparent">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <TrendingUp className="h-4 w-4 text-slate-500" />
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Weekly Activity</h3>
                    </div>
                    <div className="h-48 w-full bg-white rounded-xl border p-2 shadow-sm">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} dy={5} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="weight" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </>
       )}

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-200 p-1 rounded-xl">
                <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Active</TabsTrigger>
                 <TabsTrigger value="available" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm relative gap-2">
                    Available 
                    {availableTasks.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                            {availableTasks.length}
                        </span>
                    )}
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">History</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6 pt-4">
                {activeTasks.length === 0 && (
                    <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border">
                             <Navigation className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">You're all caught up!</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">No active routes right now. Check "Available" to claim new jobs.</p>
                    </div>
                )}
                
                {/* 1. New Assignments Section */}
                {activeTasks.some(t => t.status === 'assigned') && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                            New Assignments
                        </h3>
                        {activeTasks.filter(t => t.status === 'assigned').map(task => (
                            <Card key={task._id} className="overflow-hidden border-2 border-amber-400 shadow-lg ring-4 ring-amber-50">
                                <div className="bg-amber-100 px-4 py-2 flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wide">
                                    <AlertCircle className="h-3 w-3" /> Waiting for acceptance
                                </div>
                                <CardContent className="p-5">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-lg leading-tight text-slate-900">{task.address}</h3>
                                        {task.city && <p className="text-sm text-slate-500">{task.city}</p>}
                                        <div className="flex gap-2 mt-2">
                                            {task.wasteTypes.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800" onClick={() => updateTaskStatus(task._id, 'accepted')}>
                                            Accept
                                        </Button>
                                        <Button size="sm" variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50" onClick={() => setRejectingTask(task)}>
                                            Reject
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* 2. Active Route Section */}
                {activeTasks.filter(t => ['accepted', 'in_progress'].includes(t.status)).map(task => (
                    <Card key={task._id} className="overflow-hidden border-0 shadow-md ring-1 ring-slate-200">
                        <div className={`h-1.5 w-full ${task.status === 'in_progress' ? 'bg-green-500' : 'bg-blue-500'}`} />
                        <CardContent className="p-5">
                            <Badge variant="outline" className="mb-2 uppercase text-[10px] tracking-wider font-semibold">
                                {task.status.replace('_', ' ')}
                            </Badge>
                            <h3 className="font-bold text-lg leading-tight text-slate-900 mb-1">{task.address}</h3>
                            {task.city && <p className="text-sm text-slate-500">{task.city}</p>}
                            
                            <div className="flex flex-wrap gap-1.5 my-3">
                                {task.wasteTypes.map((t, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">{t}</span>
                                ))}
                            </div>

                            <div className="space-y-3 pt-2">
                                {task.status === 'accepted' ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(`tel:1234567890`)}>
                                            <Phone className="h-3 w-3" /> Call
                                        </Button>
                                        <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.address)}`)}>
                                            <Map className="h-3 w-3" /> Map
                                        </Button>
                                        <Button className="col-span-2 gap-2 bg-blue-600 hover:bg-blue-700 shadow-md" onClick={() => updateTaskStatus(task._id, 'in_progress')}>
                                            <Navigation className="h-4 w-4" /> Start Route
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 shadow-md animate-pulse-slow" onClick={() => setCollectingTask(task)}>
                                            <PackageCheck className="h-4 w-4" /> Arrived & Collect
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
                    <div className="text-center py-12 px-4">
                        <p className="text-slate-500 text-sm">No new jobs available right now.</p>
                    </div>
                )}
                {availableTasks.map(task => (
                    <Card key={task._id} className="border-l-4 border-l-slate-400">
                         <CardContent className="p-4">
                             <div className="flex justify-between items-start mb-2">
                                 <h3 className="font-bold text-base">{task.address}</h3>
                                 <Badge variant="outline">{format(new Date(task.date), "MMM d")}</Badge>
                             </div>
                             <p className="text-xs text-slate-500 mb-3">{task.city}</p>
                             <div className="flex gap-2 mb-3">
                                 {task.wasteTypes.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                             </div>
                             <Button size="sm" className="w-full bg-slate-900" onClick={() => handleClaimTask(task._id)}>
                                 Claim Job
                             </Button>
                         </CardContent>
                    </Card>
                ))}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 pt-4">
                 {completedTasks.length === 0 && <p className="text-center text-slate-400 py-8 italic text-sm">No history yet</p>}
                 {completedTasks.slice(0, 5).map(task => (
                    <div key={task._id} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-sm text-slate-800">{task.address}</p>
                            <p className="text-[10px] text-slate-500">{format(new Date(task.date), "MMM d, h:mm a")}</p>
                        </div>
                        <div className="text-right">
                            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                {task.actualWeight} kg
                            </Badge>
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
