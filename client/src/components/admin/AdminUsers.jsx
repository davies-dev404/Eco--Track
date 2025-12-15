import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Car } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers({ users, drivers, onUpdate, viewMode = 'all', setViewMode }) {
    const { toast } = useToast();
    const [assigningVehicle, setAssigningVehicle] = useState(null);
    const [vehicleInput, setVehicleInput] = useState("");

    // INTERNAL FILTERING
    const getFilteredUsers = () => {
        if (viewMode === 'drivers') return users.filter(u => u.role === 'driver');
        if (viewMode === 'pending') return users.filter(u => !u.isActive || (u.role === 'driver' && !u.vehicleInfo));
        return users;
    };

    const filteredUsers = getFilteredUsers();

    const handleVehicleAssign = async () => {
        if (!assigningVehicle) return;
        try {
            await api.put(`/auth/users/${assigningVehicle._id}`, { vehicleInfo: vehicleInput, isActive: true }); // Auto-activate on assign
            toast({ title: "Vehicle Assigned & Driver Approved", description: `Assigned ${vehicleInput} to ${assigningVehicle.name}` });
            setAssigningVehicle(null);
            setVehicleInput("");
            onUpdate();
        } catch (error) {
             toast({ title: "Error", description: "Assignment failed", variant: "destructive" });
        }
    };

    const handleApprove = async (user) => {
        try {
            await api.put(`/auth/users/${user._id}`, { isActive: true });
            toast({ title: "User Approved", description: `${user.name} is now active.` });
            onUpdate();
        } catch (error) {
            toast({ title: "Error", description: "Approval failed" });
        }
    };

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle>User & Fleet Management</CardTitle>
                    <CardDescription>Total Users: {users.length} | Drivers: {drivers.length}</CardDescription>
                </div>
                {/* View Toggles */}
                 <div className="flex bg-slate-100 p-1 rounded-lg">
                     {['all', 'drivers', 'pending'].map(mode => (
                         <button
                             key={mode}
                             onClick={() => setViewMode(mode)}
                             className={`px-3 py-1 text-xs font-bold rounded-md transition-all uppercase tracking-wide ${
                                 viewMode === mode 
                                 ? 'bg-white text-slate-900 shadow-sm' 
                                 : 'text-slate-500 hover:text-slate-900'
                             }`}
                         >
                             {mode === 'pending' ? 'Pending Approval' : mode}
                         </button>
                     ))}
                 </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {filteredUsers.length === 0 && <p className="text-center text-slate-500 py-8 italic">No users found in this category.</p>}
                    
                    {filteredUsers.map(u => (
                        <div key={u._id} className="flex flex-col md:flex-row justify-between items-center border-b last:border-0 pb-4 gap-4 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ${u.isActive ? (u.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600') : 'bg-slate-300'}`}>
                                    {u.name[0]}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-900">{u.name}</p>
                                        {u.role === 'driver' && <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Driver</Badge>}
                                        {u.role === 'admin' && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">Admin</Badge>}
                                        {!u.isActive && <Badge variant="destructive" className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200">Pending</Badge>}
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
                                {/* Special Approve Button for Pending View */}
                                {!u.isActive && (
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(u)}>
                                        Approve Access
                                    </Button>
                                )}

                                {u.role === 'driver' && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" onClick={() => {
                                                setAssigningVehicle(u);
                                                setVehicleInput(u.vehicleInfo || "");
                                            }}>
                                                <Car className="h-4 w-4 mr-2" /> {u.vehicleInfo ? 'Edit Vehicle' : 'Assign Vehicle'}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Assign Vehicle & Approve</DialogTitle>
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
                                                <p className="text-xs text-slate-500">Note: Saving will automatically approve this driver.</p>
                                                <Button className="w-full" onClick={handleVehicleAssign}>Save & Approve</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                                
                                {u.isActive && (
                                    <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={async () => {
                                             await api.put(`/auth/users/${u._id}`, { isActive: !u.isActive });
                                             toast({ title: "User Deactivated" });
                                             onUpdate();
                                        }}
                                        className="text-slate-500 hover:text-red-600"
                                    >
                                        Deactivate
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
