import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, CheckCircle, Truck, AlertCircle, User, Eye, Flag } from "lucide-react";

export function ActivityFeed({ activities = [] }) {
    const [isLive, setIsLive] = useState(true);

    const getIcon = (action) => {
        if (action.includes("COLLECTED")) return <CheckCircle className="h-4 w-4 text-green-500" />;
        if (action.includes("ASSIGNED")) return <Truck className="h-4 w-4 text-blue-500" />;
        if (action.includes("CREATED")) return <User className="h-4 w-4 text-orange-500" />;
        return <Activity className="h-4 w-4 text-slate-500" />;
    };

    const getMessage = (log) => {
         if (log.action === "PICKUP_CREATED") return "New pickup request created.";
         if (log.action === "DRIVER_ASSIGNED") return `Driver assigned to Pickup #${log.details?.pickupId?.slice(-4) || '...'}`;
         if (log.action === "PICKUP_COLLECTED") return `Pickup #${log.details?.pickupId?.slice(-4) || '...'} completed via Driver.`;
         return log.action.replace(/_/g, " ");
    };

    return (
        <Card className="h-full animate-in fade-in slide-in-from-right-4 duration-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle>Live Activity</CardTitle>
                    <CardDescription>Real-time system audit logs.</CardDescription>
                </div>
                <div onClick={() => setIsLive(!isLive)} className="cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                    <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{isLive ? 'Live' : 'Paused'}</span>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[350px] w-full pr-4">
                    <div className="space-y-4">
                        {activities.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No recent activity.</p>}
                        {activities.map((log) => (
                            <div key={log._id} className="flex gap-3 items-start border-b pb-3 last:border-0 border-slate-100 group relative">
                                <div className="mt-0.5 bg-slate-50 p-1.5 rounded-full border border-slate-100 shadow-sm group-hover:bg-white group-hover:shadow-md transition-all">
                                    {getIcon(log.action)}
                                </div>
                                <div className="space-y-0.5 flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-slate-900 leading-none">
                                            {getMessage(log)}
                                        </p>
                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 absolute right-0 top-0 bg-white pl-2 shadow-sm rounded-l-md">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-500">
                                                <Eye className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500">
                                                <Flag className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {format(new Date(log.createdAt), "h:mm a · MMM d")}
                                        {log.user?.name && <span className="text-slate-400"> · by {log.user.name.split(' ')[0]}</span>}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
