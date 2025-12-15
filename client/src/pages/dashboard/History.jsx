import { useState, useEffect } from "react";
import { format } from "date-fns";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Truck, Scale, FileText, CheckCircle, Clock } from "lucide-react";
import { wasteTypeColors } from "@/lib/constants";

export default function PickupHistory() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedPickup, setSelectedPickup] = useState(null);

  // Get user
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (userId) {
        api.get(`/pickup?userId=${userId}`)
           .then(({data}) => setRequests(data))
           .catch(err => console.error(err));
    }
  }, [userId]);

  const filteredRequests = requests.filter(r => {
      if (filter === 'all') return true;
      if (filter === 'completed') return ['completed', 'collected'].includes(r.status);
      if (filter === 'pending') return ['pending', 'assigned', 'accepted', 'in_progress'].includes(r.status);
      return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Pickup History</h1>
          <p className="text-muted-foreground">View past collections and receipts.</p>
        </div>
        <div className="w-full md:w-[200px]">
            <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Active / Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid gap-4">
          {filteredRequests.length === 0 && (
              <Card className="py-12 text-center">
                  <div className="flex flex-col items-center">
                      <Clock className="h-12 w-12 text-slate-200 mb-4" />
                      <h3 className="text-lg font-medium">No records found</h3>
                      <p className="text-muted-foreground">You haven't made any requests in this category yet.</p>
                  </div>
              </Card>
          )}
          
          {filteredRequests.map(request => (
              <Card key={request.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                  <Badge variant={['completed', 'collected'].includes(request.status) ? 'success' : 'secondary'}>
                                      {request.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                      {format(new Date(request.date), "PPP")}
                                  </span>
                              </div>
                              <h3 className="font-bold text-lg">{request.address || "Main Address"}</h3>
                              <div className="flex flex-wrap gap-2 mt-1">
                                  {request.wasteTypes.map(t => (
                                      <Badge key={t} variant="outline" className="text-xs font-normal">
                                          {t}
                                      </Badge>
                                  ))}
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                              {['completed', 'collected'].includes(request.status) && (
                                  <div className="text-right hidden md:block">
                                      <p className="font-bold text-xl">{request.actualWeight || 0} kg</p>
                                      <p className="text-xs text-green-600">Recycled</p>
                                  </div>
                              )}
                              <Button variant="outline" onClick={() => setSelectedPickup(request)}>
                                  View Details
                              </Button>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          ))}
      </div>

      {/* Receipt Dialog */}
      <Dialog open={!!selectedPickup} onOpenChange={(open) => !open && setSelectedPickup(null)}>
          <DialogContent className="max-w-md">
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" /> Collection Receipt
                  </DialogTitle>
                  <DialogDescription>
                      Pickup ID: #{selectedPickup?._id?.slice(-8).toUpperCase()}
                  </DialogDescription>
              </DialogHeader>
              
              {selectedPickup && (
                  <div className="space-y-6 py-4">
                      {/* Status Banner */}
                      <div className={`p-4 rounded-lg flex items-center justify-between ${
                          ['completed', 'collected'].includes(selectedPickup.status) 
                          ? 'bg-green-50 text-green-900' 
                          : 'bg-yellow-50 text-yellow-900'
                      }`}>
                          <span className="font-bold flex items-center gap-2">
                              {['completed', 'collected'].includes(selectedPickup.status) 
                                ? <CheckCircle className="h-5 w-5" /> 
                                : <Clock className="h-5 w-5" />
                              }
                              {selectedPickup.status.toUpperCase()}
                          </span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                              <p className="text-muted-foreground mb-1">Date Completed</p>
                              <p className="font-medium">
                                  {selectedPickup.collectedAt 
                                      ? format(new Date(selectedPickup.collectedAt), "PPP p") 
                                      : <span className="text-amber-600">Scheduled: {format(new Date(selectedPickup.date), "PPP")}</span>
                                  }
                              </p>
                          </div>
                          <div>
                              <p className="text-muted-foreground mb-1">Total Weight</p>
                              <p className="font-medium text-lg">{selectedPickup.actualWeight ? `${selectedPickup.actualWeight} kg` : "--"}</p>
                          </div>
                          <div>
                              <p className="text-muted-foreground mb-1">Driver</p>
                              <p className="font-medium flex items-center gap-1">
                                  <Truck className="h-3 w-3" />
                                  {selectedPickup.driverId ? (
                                      <span className="font-semibold text-blue-600">{selectedPickup.driverId.name || "Eco Partner"}</span>
                                  ) : "Waiting for assignment"}
                              </p>
                          </div>
                          <div>
                              <p className="text-muted-foreground mb-1">Waste Types</p>
                              <p className="font-medium capitalize">{selectedPickup.wasteTypes.join(', ')}</p>
                          </div>
                      </div>

                      {/* Impact Note */}
                      {['completed', 'collected'].includes(selectedPickup.status) && (
                          <div className="border-t pt-4">
                              <p className="text-sm text-center text-muted-foreground">
                                  You saved approximately <span className="font-bold text-green-600">{(selectedPickup.actualWeight * 1.5).toFixed(1)} kg</span> of CO2 with this pickup! 🌍
                              </p>
                          </div>
                      )}
                  </div>
              )}

              <DialogFooter>
                  <Button onClick={() => setSelectedPickup(null)}>Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
