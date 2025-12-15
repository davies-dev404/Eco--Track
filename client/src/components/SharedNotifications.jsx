import { useState, useEffect } from "react";
import { Bell, CheckCircle, Truck, AlertTriangle, UserPlus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSocket } from "@/context/SocketContext";
import { formatDistanceToNow } from "date-fns";

export default function SharedNotifications({ role = "user", userId }) {
    const socket = useSocket();
    const storageKey = `notifications_${role}_${userId || 'anon'}`;
    
    // Initialize from LocalStorage
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    // Persistence
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(notifications));
    }, [notifications, storageKey]);

    useEffect(() => {
        if (!socket) return;

        const addNotification = (notif) => {
            setNotifications(prev => [notif, ...prev]); 
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => {}); 
        };

        // EVENT LISTENERS BASED ON ROLE
        const handlePickupCreated = (data) => {
            if (role === 'admin') {
                addNotification({
                    id: Date.now(), title: "New Pickup Request",
                    desc: `${data.address?.substring(0, 20)}... requested pickup.`,
                    time: new Date(), type: 'pickup', read: false
                });
            } else if (role === 'driver' && data.status === 'pending') {
                addNotification({
                    id: Date.now(), title: "New Job Available",
                    desc: `New pickup in ${data.city || "your area"}.`,
                    time: new Date(), type: 'pickup', read: false
                });
            }
        };

        const handlePickupUpdated = (data) => {
            if (role === 'admin') {
                addNotification({
                    id: Date.now(), title: "Pickup Updated",
                    desc: `Pickup #${data._id.slice(-4)} is ${data.status}`,
                    time: new Date(), type: 'update', read: false
                });
            } else if (role === 'driver') {
                // If assigned to me OR was available
                if (data.driverId === userId || !data.driverId) {
                     addNotification({
                        id: Date.now(), title: "Job Update",
                        desc: `Task #${data._id.slice(-4)} status: ${data.status}`,
                        time: new Date(), type: 'update', read: false
                    });
                }
            } else if (role === 'user' && data.userId === userId) {
                 addNotification({
                    id: Date.now(), title: "Pickup Update",
                    desc: `Your request is now ${data.status}`,
                    time: new Date(), type: 'update', read: false
                });
            }
        };

        const handleWasteLogged = (data) => {
            if (role === 'admin') {
                addNotification({
                    id: Date.now(), title: "Waste Logged",
                    desc: `${data.weight}kg recorded.`,
                    time: new Date(), type: 'waste', read: false
                });
            }
        };

        const handleUserRegistered = (data) => {
            if (role === 'admin') {
                 addNotification({
                    id: Date.now(), title: "New User",
                    desc: `${data.name} joined.`,
                    time: new Date(), type: 'user', read: false
                });
            }
        };

        const handleDriverUpdated = (data) => {
             if (role === 'admin') {
                 addNotification({
                    id: Date.now(), title: "Driver Update",
                    desc: `${data.name} is ${data.availability}`,
                    time: new Date(), type: 'driver', read: false
                });
            }
        };

        socket.on("pickup_created", handlePickupCreated);
        socket.on("pickup_updated", handlePickupUpdated);
        socket.on("waste_logged", handleWasteLogged);
        socket.on("user_registered", handleUserRegistered);
        socket.on("driver_updated", handleDriverUpdated);

        return () => {
            socket.off("pickup_created", handlePickupCreated);
            socket.off("pickup_updated", handlePickupUpdated);
            socket.off("waste_logged", handleWasteLogged);
            socket.off("user_registered", handleUserRegistered);
            socket.off("driver_updated", handleDriverUpdated);
        };
    }, [socket, role, userId]);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = (e) => {
        e.stopPropagation();
        setNotifications([]);
    };

    const getIcon = (type) => {
        switch(type) {
            case 'pickup': return <Truck className="h-4 w-4 text-blue-500" />;
            case 'waste': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'user': return <UserPlus className="h-4 w-4 text-purple-500" />;
            case 'driver': return <Truck className="h-4 w-4 text-amber-500" />;
            default: return <Bell className="h-4 w-4 text-slate-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors" onClick={markAllRead}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden border-0 shadow-xl bg-white/95 backdrop-blur-md ring-1 ring-black/5 z-50">
                <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                         <span className="font-bold text-sm text-slate-800">Notifications</span>
                         {unreadCount > 0 && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>}
                    </div>
                    {notifications.length > 0 && (
                        <Button variant="ghost" size="xs" onClick={clearAll} className="h-6 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 px-2">
                            <Trash2 className="h-3 w-3 mr-1" /> Clear
                        </Button>
                    )}
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            No new notifications
                        </div>
                    ) : (
                        notifications.map((notif, i) => (
                            <DropdownMenuItem key={notif.id || i} className={`p-3 border-b border-slate-50 focus:bg-slate-50 cursor-default flex gap-3 ${!notif.read ? 'bg-green-50/30' : ''}`}>
                                <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${!notif.read ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <p className={`text-xs ${!notif.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'} truncate mr-2`}>{notif.title}</p>
                                        <span className="text-[10px] text-slate-400 flex-shrink-0">{formatDistanceToNow(new Date(notif.time), { addSuffix: true })}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.desc}</p>
                                </div>
                                {!notif.read && <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>}
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
