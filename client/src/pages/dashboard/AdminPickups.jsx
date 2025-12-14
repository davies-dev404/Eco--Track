import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Loader2, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";

export default function AdminPickups() {
  const [requests, setRequests] = useState([]);
  const [wasteLogs, setWasteLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pickupRes, wasteRes] = await Promise.all([
          api.get("/pickup/all"),
          api.get("/waste/all")
      ]);
      setRequests(pickupRes.data);
      setWasteLogs(wasteRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
      return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage pickups and view community waste logs.</p>
      </div>

      <Tabs defaultValue="pickups">
        <TabsList className="mb-4">
            <TabsTrigger value="pickups">Pickup Requests</TabsTrigger>
            <TabsTrigger value="waste">Waste Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="pickups">
            <Card>
                <CardHeader>
                <CardTitle>All Pickup Requests</CardTitle>
                <CardDescription>View and manage scheduled pickups.</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No pickup requests found.</div>
                    ) : (
                        requests.map((request) => (
                        <div key={request.id || request._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                            <div className="flex items-center gap-2">
                                <Badge variant={
                                    request.status === 'completed' ? 'success' :
                                    request.status === 'pending' ? 'warning' : 'secondary'
                                }>
                                    {request.status || 'pending'}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    {(() => {
                                        try {
                                            return format(new Date(request.date), "PPP");
                                        } catch(e) { return "Invalid Date"; }
                                    })()}
                                </span>
                            </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mt-2">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Location</p>
                                        <p className="text-sm text-muted-foreground">{request.address || "No address provided"}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Waste Types</p>
                                    <p className="text-sm text-muted-foreground">{request.wasteTypes?.join(', ') || "None specified"}</p>
                                </div>
                            </div>
                            
                            {request.notes && (
                                <div className="mt-3 text-sm bg-muted/50 p-2 rounded">
                                    <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Notes:</span> 
                                    <p className="italic text-muted-foreground">{request.notes}</p>
                                </div>
                            )}
                        </div>
                        ))
                    )}
                </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="waste">
            <Card>
                <CardHeader>
                    <CardTitle>Community Waste Logs</CardTitle>
                    <CardDescription>Track all waste logged by users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {wasteLogs.length === 0 ? (
                             <div className="text-center py-8 text-muted-foreground">No waste logs found.</div>
                        ) : (
                            wasteLogs.map((log) => (
                                <div key={log.id || log._id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-muted rounded-md mt-1">
                                            <Trash2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium capitalize">{log.type} Waste</p>
                                            <p className="text-sm text-muted-foreground">
                                                {(() => {
                                                    try {
                                                        return format(new Date(log.date), "PPP");
                                                    } catch(e) { return "Invalid Date"; }
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{log.weight} kg</p>
                                        <p className="text-xs text-green-600 font-medium">{log.carbonSaved}kg CO₂ saved</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
