import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, CheckCircle, Truck, AlertCircle, User } from "lucide-react";

export function ActivityFeed({ activities = [] }) {
    
    const getIcon = (action) => {
        if (action.includes("COLLECTED")) return <CheckCircle className="h-4 w-4 text-green-500" />;
        if (action.includes("ASSIGNED")) return <Truck className="h-4 w-4 text-blue-500" />;
        if (action.includes("CREATED")) return <User className="h-4 w-4 text-orange-500" />;
        return <Activity className="h-4 w-4 text-slate-500" />;
    };

    const getMessage = (log) => {
         // Friendly text generation
         if (log.action === "PICKUP_CREATED") return "New pickup request created.";
         if (log.action === "DRIVER_ASSIGNED") return `Driver assigned to Pickup #${log.details?.pickupId?.slice(-4)}`;
         if (log.action === "PICKUP_COLLECTED") return `Pickup #${log.details?.pickupId?.slice(-4)} completed via Driver.`;
         return log.action.replace(/_/g, " "); // Fallback
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Live Activity</CardTitle>
                <CardDescription>Real-time system audit logs.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] w-full pr-4">
                    <div className="space-y-4">
                        {activities.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No recent activity.</p>}
                        {activities.map((log) => (
                            <div key={log._id} className="flex gap-3 items-start border-b pb-3 last:border-0 border-slate-100">
                                <div className="mt-0.5 bg-slate-50 p-1.5 rounded-full border border-slate-100 shadow-sm">
                                    {getIcon(log.action)}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium text-slate-900 leading-none">
                                        {getMessage(log)}
                                    </p>
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
