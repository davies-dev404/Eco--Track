import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Filter, Truck, Edit } from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminPickups({ pickups, drivers, onUpdate }) {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [editingPickup, setEditingPickup] = useState(null);

    const filteredPickups = pickups.filter(p => {
        const matchesSearch = p.address.toLowerCase().includes(searchQuery.toLowerCase()) || (p.city || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleEditSave = async (e) => {
        e.preventDefault();
        if (!editingPickup) return;
        try {
            await api.put(`/pickup/${editingPickup._id}`, {
                notes: editingPickup.notes,
                date: editingPickup.date, 
                driverId: editingPickup.driverId,
                status: editingPickup.driverId && ['pending', 'approved'].includes(editingPickup.status) ? 'assigned' : editingPickup.status
            });
            toast({ title: "Success", description: "Pickup updated successfully" });
            setEditingPickup(null);
            onUpdate();
        } catch (error) {
             toast({ title: "Error", description: "Update failed", variant: "destructive" });
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/pickup/${id}`, { status });
            toast({ title: "Updated", description: `Pickup marked as ${status}` });
            onUpdate();
        } catch (error) {
            toast({ title: "Error", description: "Update failed", variant: "destructive" });
        }
    };

    return (
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="px-6 py-4 flex flex-row justify-between items-center border-b bg-slate-50/50">
                <div>
                     <CardTitle className="text-base">Pickup Schedule</CardTitle>
                </div>
                <div className="flex gap-2 items-center">
                     <div className="relative">
                         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                         <Input 
                            placeholder="Search address, city..." 
                            className="pl-9 w-[250px] bg-white transition-all focus:w-[300px]" 
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
                         <div key={p._id} className="p-6 flex justify-between items-start hover:bg-slate-50 transition-colors group">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant={p.status === 'completed' ? 'success' : p.status === 'approved' ? 'default' : 'secondary'} className="capitalize">
                                        {p.status.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-sm text-slate-500">
                                        {format(new Date(p.date), "PPP - h:mm a")}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-lg text-slate-900 group-hover:text-green-600 transition-colors">{p.address}</h3>
                                <div className="flex gap-2 mt-2">
                                    {p.wasteTypes.map(t => <Badge key={t} variant="outline" className="font-normal text-xs bg-white">{t}</Badge>)}
                                </div>
                                {p.driverId ? (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full w-fit border border-blue-100">
                                        <Truck className="h-3 w-3" />
                                        <span className="font-medium">{drivers.find(d => d._id === p.driverId)?.name || "Unknown Driver"}</span>
                                    </div>
                                ) : (
                                    <div className="mt-3 text-sm text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full w-fit flex items-center gap-2 border border-orange-100">
                                         <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div> Unassigned
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setEditingPickup(p)} className="hover:border-green-500 hover:text-green-600">
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
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 shadow-sm" onClick={() => updateStatus(p._id, 'approved')}>
                                        Approve
                                    </Button>
                                )}
                            </div>
                         </div>
                     ))}
                     {pickups.length === 0 && <div className="p-12 text-center text-slate-500">No pickup requests found.</div>}
                 </div>
            </CardContent>
        </Card>
    );
}
