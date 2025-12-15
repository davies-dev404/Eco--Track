import { useState, useEffect } from "react";
import { Bell, CheckCircle, Truck, AlertTriangle, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSocket } from "@/context/SocketContext";
import { formatDistanceToNow } from "date-fns";

export default function AdminNotifications() {
    const socket = useSocket();
    
    // Initialize from LocalStorage or default
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem("admin_notifications");
        return saved ? JSON.parse(saved) : [
             { id: 1, title: "System Online", desc: "Dashboard initialized", time: new Date(), type: 'system', read: false }
        ];
    });

    const [unreadCount, setUnreadCount] = useState(() => {
        const saved = localStorage.getItem("admin_notifications");
        return saved ? JSON.parse(saved).filter(n => !n.read).length : 1;
    });

    // Persistence
    useEffect(() => {
        localStorage.setItem("admin_notifications", JSON.stringify(notifications));
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

    useEffect(() => {
        if (!socket) return;

        const addNotification = (notif) => {
            setNotifications(prev => [notif, ...prev]); // No limit
            // Play sound
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => {}); 
        };

        socket.on("pickup_created", (data) => {
            addNotification({
                id: Date.now(),
                title: "New Pickup Request",
                desc: `${data.address.substring(0, 20)}... requested pickup.`,
                time: new Date(),
                type: 'pickup',
                read: false
            });
        });

        socket.on("pickup_updated", (data) => {
            addNotification({
                id: Date.now(),
                title: "Pickup Status Update",
                desc: `Pickup #${data._id.slice(-4)} is now ${data.status}`,
                time: new Date(),
                type: 'update',
                read: false
            });
        });
        
        socket.on("waste_logged", (data) => {
            addNotification({
                id: Date.now(),
                title: "Waste Logged",
                desc: `${data.weight}kg of ${data.type} recorded.`,
                time: new Date(),
                type: 'waste',
                read: false
            });
        });

        socket.on("user_registered", (data) => {
             addNotification({
                id: Date.now(),
                title: "New Registration",
                desc: `${data.name} joined as ${data.role}`,
                time: new Date(),
                type: 'user',
                read: false
            });
        });

        socket.on("driver_updated", (data) => {
             addNotification({
                id: Date.now(),
                title: "Fleet Update",
                desc: `${data.name} is now ${data.availability || 'offline'}`,
                time: new Date(),
                type: 'driver',
                read: false
            });
        });

        return () => {
            socket.off("pickup_created");
            socket.off("pickup_updated");
            socket.off("waste_logged");
            socket.off("user_registered");
            socket.off("driver_updated");
        };
    }, [socket]);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = (e) => {
        e.stopPropagation(); // Prevent closing dropdown immediately
        setNotifications([]);
    };

    const getIcon = (type) => {
        switch(type) {
            case 'pickup': return <Truck className="h-4 w-4 text-blue-500" />;
            case 'waste': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'user': return <UserPlus className="h-4 w-4 text-purple-500" />;
            case 'system': return <CheckCircle className="h-4 w-4 text-slate-500" />;
            default: return <Bell className="h-4 w-4 text-amber-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" onClick={markAllRead}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 p-0 overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-xl ring-1 ring-slate-200">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
                    <div className="flex items-center gap-2">
                         <span className="font-bold text-sm text-slate-800">Notifications</span>
                         {unreadCount > 0 && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>}
                    </div>
                    {notifications.length > 0 && (
                        <Button variant="ghost" size="xs" onClick={clearAll} className="h-6 text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-3 w-3 mr-1" /> Clear All
                        </Button>
                    )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                            <Bell className="h-12 w-12 mb-3 stroke-1" />
                            <p className="text-sm">No new notifications</p>
                        </div>
                    ) : (
                        notifications.map((notif, i) => (
                            <DropdownMenuItem key={notif.id || i} className={`p-4 border-b border-slate-50 focus:bg-slate-50 cursor-default flex gap-4 items-start ${!notif.read ? 'bg-indigo-50/40' : ''}`}>
                                <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <p className={`text-sm ${!notif.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{notif.title}</p>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{formatDistanceToNow(new Date(notif.time), { addSuffix: true })}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">{notif.desc}</p>
                                </div>
                                {!notif.read && <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2"></div>}
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
