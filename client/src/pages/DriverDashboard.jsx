import { useState, useEffect } from "react";
import { useLocation, Route, Switch } from "wouter";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/context/SocketContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Components
import DriverLayout from "@/pages/driver/DriverLayout";
import Overview from "@/pages/driver/Overview";
import VehicleManager from "@/pages/driver/VehicleManager";
import Wallet from "@/pages/driver/Wallet";
import Certificate from "@/pages/driver/Certificate";
import Support from "@/pages/driver/Support";
import Profile from "@/pages/driver/Profile";

export default function DriverDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const socket = useSocket();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Vehicle Registration Logic (Global Check)
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
     vehicleType: "Truck",
     vehiclePlate: "",
     phone: ""
  });

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
    const driverId = parsedUser.id || parsedUser._id;
    if (!driverId) {
         toast({ title: "Error", description: "Driver profile corrupted. Please re-login.", variant: "destructive" });
         return;
    }
    setUser(parsedUser);
    fetchTasks(driverId);
    fetchAvailableTasks();

    // Polling
    const intervalId = setInterval(() => {
        const pollingId = parsedUser.id || parsedUser._id;
        if(pollingId) fetchTasks(pollingId, true);
        fetchAvailableTasks(true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [setLocation]);

  // Vehicle Modal Trigger
  useEffect(() => {
    if (user && user.role === 'driver') {
        if (!user.vehiclePlate || user.vehiclePlate === "") {
            setShowVehicleForm(true);
            setVehicleForm(prev => ({ ...prev, phone: user.phone || "" }));
        }
    }
  }, [user]);

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

  // Socket Listeners (Global)
  useEffect(() => {
    if (!socket || !user) return;
    socket.on("pickup_created", (newPickup) => {
        if (newPickup.status === 'pending') {
            setAvailableTasks(prev => {
                if (prev.find(t => t._id === newPickup._id)) return prev;
                toast({ title: "New Job Available!", description: `${newPickup.city}` });
                return [...prev, newPickup];
            });
        }
    });
    socket.on("pickup_updated", (updatedPickup) => {
        if (updatedPickup.status !== 'pending') {
            setAvailableTasks(prev => prev.filter(t => t._id !== updatedPickup._id));
        } else {
             setAvailableTasks(prev => {
                if (prev.find(t => t._id === updatedPickup._id)) return prev;
                return [...prev, updatedPickup];
             });
        }
        const currentUserId = user.id || user._id;
        if (updatedPickup.driverId === currentUserId) {
             setTasks(prev => {
                 const exists = prev.find(t => t._id === updatedPickup._id);
                 if (exists) {
                     return prev.map(t => t._id === updatedPickup._id ? updatedPickup : t);
                 } else {
                     toast({ title: "New Assignment", description: "You have been assigned a pickup." });
                     return [...prev, updatedPickup];
                 }
             });
        }
    });
    return () => {
        socket.off("pickup_created");
        socket.off("pickup_updated");
    };
  }, [socket, user, toast]);

  const toggleAvailability = async () => {
      try {
           const newStatus = user.availability === 'online' ? 'offline' : 'online';
           const updatedUser = { ...user, availability: newStatus };
           setUser(updatedUser);
           localStorage.setItem("user", JSON.stringify(updatedUser)); 
           await api.put(`/auth/users/${user.id || user._id}`, { availability: newStatus });
           toast({ title: newStatus === 'online' ? "You are Online" : "You are Offline" });
      } catch (error) {
          toast({ title: "Error", description: "Connection failed", variant: "destructive" });
      }
  };

  const handleVehicleSubmit = async (e) => {
     e.preventDefault();
     try {
         const { data } = await api.put("/auth/profile", {
             userId: user.id || user._id, 
             ...vehicleForm
         });
         const updatedUser = { ...user, ...data };
         setUser(updatedUser);
         localStorage.setItem("user", JSON.stringify(updatedUser)); 
         toast({ title: "Profile Completed", description: "You are ready to accept jobs." });
         setShowVehicleForm(false);
     } catch (error) {
         toast({ title: "Error", variant: "destructive", description: "Failed to save details" });
     }
  };

  if (!user) return null;

  return (
    <DriverLayout user={user}>
        {/* Global Registration Modal (Persists across views) */}
        <Dialog open={showVehicleForm} onOpenChange={() => {}}>
            <DialogContent className="max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Complete Your Profile</DialogTitle>
                    <DialogDescription>
                        To start accepting jobs, please register your vehicle and contact details.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleVehicleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Vehicle Type</Label>
                        <Select value={vehicleForm.vehicleType} onValueChange={(val) => setVehicleForm({...vehicleForm, vehicleType: val})}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Truck">Truck (Large)</SelectItem>
                                <SelectItem value="Van">Van (Medium)</SelectItem>
                                <SelectItem value="Car">Car (Small)</SelectItem>
                                <SelectItem value="Bike">Bike / Motorcycle</SelectItem>
                                <SelectItem value="TukTuk">TukTuk / 3-Wheeler</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Vehicle Registration / Plate Number</Label>
                        <Input required placeholder="e.g. KCA 123X" value={vehicleForm.vehiclePlate} onChange={(e) => setVehicleForm({...vehicleForm, vehiclePlate: e.target.value.toUpperCase()})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input required type="tel" placeholder="+254..." value={vehicleForm.phone} onChange={(e) => setVehicleForm({...vehicleForm, phone: e.target.value})} />
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="w-full">Save & Continue</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {/* Sub-Routes */}
        <Switch>
            <Route path="/driver/">
                <Overview 
                    user={user} 
                    tasks={tasks} 
                    availableTasks={availableTasks} 
                    refreshData={() => {
                        const uid = user.id || user._id;
                        if(uid) fetchTasks(uid, true);
                        fetchAvailableTasks(true);
                    }}
                    toggleAvailability={toggleAvailability}
                />
            </Route>
            <Route path="/driver/vehicle">
                <VehicleManager user={user} />
            </Route>
            <Route path="/driver/wallet">
                <Wallet user={user} tasks={tasks} />
            </Route>
            <Route path="/driver/certificate">
                <Certificate user={user} tasks={tasks} />
            </Route>
            <Route path="/driver/support">
                <Support user={user} />
            </Route>
            <Route path="/driver/profile">
                <Profile user={user} />
            </Route>
            <Route>
                <div className="p-8 text-center text-slate-500">Page Not Found</div>
            </Route>
        </Switch>
    </DriverLayout>
  );
}
