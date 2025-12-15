import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Truck, CheckCircle, AlertTriangle, FileText, Upload, Plus, Loader2 } from "lucide-react";
import { useRef } from "react";

export default function VehicleManager({ user }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(null);
  const fileInputRef = useRef(null);
  const [activeUploadField, setActiveUploadField] = useState(null);
  const [formData, setFormData] = useState({
      type: "Truck",
      energyType: "Fuel",
      plate: "",
      model: "",
      capacity: "",
      color: ""
  });
  
  const [docs, setDocs] = useState({
      logbook: "",
      insurance: ""
  });

  useEffect(() => {
      // Sync from user object
      if (user && user.vehicle) {
          setFormData({
              type: user.vehicle.type || "Truck",
              energyType: user.vehicle.energyType || "Fuel",
              plate: user.vehicle.plate || user.vehiclePlate || "",
              model: user.vehicle.model || "",
              capacity: user.vehicle.capacity || "",
              color: user.vehicle.color || ""
          });
          setDocs({
              logbook: user.vehicle.documents?.logbook || "",
              insurance: user.vehicle.documents?.insurance || ""
          });
      } else if (user && user.vehiclePlate) {
          // Fallback legacy
           setFormData(prev => ({ ...prev, plate: user.vehiclePlate }));
      }
  }, [user]);

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          await api.put("/auth/profile", {
              userId: user.id || user._id,
              vehicle: { 
                  ...formData, 
                  status: 'pending', // Reset verification on edit
                  documents: docs
              }
          });
          toast({ title: "Vehicle Details Updated", description: "Changes saved successfully." });
          setIsEditing(false);
          // Force refresh
          window.dispatchEvent(new Event("storage"));
      } catch (error) {
          toast({ title: "Error", description: "Could not save details", variant: "destructive" });
      }
  };


  const handleUploadClick = (field) => {
      setActiveUploadField(field);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
          fileInputRef.current.click();
      }
  };

  const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file || !activeUploadField) return;

      const formData = new FormData();
      formData.append("file", file);

      setUploading(activeUploadField);
      try {
           const { data } = await api.post("/upload", formData, {
               headers: { "Content-Type": "multipart/form-data" }
           });
           setDocs(prev => ({ ...prev, [activeUploadField]: data.url }));
           toast({ title: "Upload Success", description: "Document uploaded successfully." });
      } catch (error) {
           toast({ title: "Upload Failed", description: "Could not upload file.", variant: "destructive" });
      } finally {
           setUploading(null);
           setActiveUploadField(null);
      }
  };

  const getStatusColor = (status) => {
      if (status === 'approved') return "bg-green-100 text-green-700 border-green-200";
      if (status === 'rejected') return "bg-red-100 text-red-700 border-red-200";
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5">
      <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,application/pdf"
          onChange={handleFileChange}
      />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Truck className="h-6 w-6" /> Vehicle Management
        </h2>
        {formData.energyType === 'Electric' && (
            <Badge className="bg-green-600 hover:bg-green-700 gap-1 pl-1 pr-2">
                <span className="bg-white text-green-600 text-[10px] rounded-full px-1 py-0.5 mr-1">ECO</span>
                Electric
            </Badge>
        )}
      </div>
      
      {/* Current Vehicle Status Card */}
      <Card className="border-l-4 border-l-slate-900 shadow-md overflow-hidden">
        <div className={`p-1 text-center text-xs font-bold uppercase tracking-widest ${getStatusColor(user.vehicle?.status || 'pending')}`}>
            STATUS: {user.vehicle?.status || 'Pending Verification'}
        </div>
        <CardHeader className="pb-2">
             <CardTitle className="text-xl flex justify-between">
                <span>{formData.plate || "No Plate"}</span>
                <span className="text-base font-normal text-slate-500">{formData.model || "Unknown Model"}</span>
             </CardTitle>
             <CardDescription>Registered Vehicle</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mt-2">
                 <div className="space-y-1">
                     <span className="text-slate-500 text-xs uppercase font-bold">Type</span>
                     <p className="font-medium flex items-center gap-2">
                         {formData.type}
                     </p>
                 </div>
                 <div className="space-y-1">
                     <span className="text-slate-500 text-xs uppercase font-bold">Capacity</span>
                     <p className="font-medium">{formData.capacity ? `${formData.capacity} kg` : "Not set"}</p>
                 </div>
                 <div className="space-y-1">
                     <span className="text-slate-500 text-xs uppercase font-bold">Energy</span>
                     <p className="font-medium">{formData.energyType}</p>
                 </div>
                 <div className="space-y-1">
                     <span className="text-slate-500 text-xs uppercase font-bold">Color</span>
                     <p className="font-medium">{formData.color || "-"}</p>
                 </div>
             </div>
             
             {!isEditing && (
                 <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4">
                     <div className={`p-3 rounded-lg border flex items-center gap-3 ${docs.logbook ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-100'}`}>
                         <FileText className={`h-4 w-4 ${docs.logbook ? 'text-slate-500' : 'text-red-400'}`} />
                         <span className="text-xs font-medium">{docs.logbook ? "Logbook Uploaded" : "Missing Logbook"}</span>
                     </div>
                     <div className={`p-3 rounded-lg border flex items-center gap-3 ${docs.insurance ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-100'}`}>
                         <FileText className={`h-4 w-4 ${docs.insurance ? 'text-slate-500' : 'text-red-400'}`} />
                         <span className="text-xs font-medium">{docs.insurance ? "Insurance Uploaded" : "Missing Insurance"}</span>
                     </div>
                 </div>
             )}
        </CardContent>
        <CardFooter className="bg-slate-50/50 border-t p-3">
             <Button variant={isEditing ? "ghost" : "outline"} className="w-full" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Cancel Edit" : "Edit Vehicle & Docs"}
             </Button>
        </CardFooter>
      </Card>
      
      {isEditing && (
          <Card className="animate-in slide-in-from-top-2 border-2 border-slate-200">
             <CardHeader>
                 <CardTitle>Edit Details</CardTitle>
                 <CardDescription>Update your vehicle information and documents.</CardDescription>
             </CardHeader>
             <CardContent>
                 <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                             <Label>Vehicle Type</Label>
                             <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                                 <SelectTrigger><SelectValue /></SelectTrigger>
                                 <SelectContent>
                                     <SelectItem value="Truck">Truck</SelectItem>
                                     <SelectItem value="Lorry">Lorry</SelectItem>
                                     <SelectItem value="Van">Van</SelectItem>
                                     <SelectItem value="Car">Car</SelectItem>
                                     <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                                     <SelectItem value="TukTuk">TukTuk</SelectItem>
                                 </SelectContent>
                             </Select>
                         </div>
                         <div className="space-y-2">
                             <Label>Energy Source</Label>
                             <Select value={formData.energyType} onValueChange={(val) => setFormData({...formData, energyType: val})}>
                                 <SelectTrigger><SelectValue /></SelectTrigger>
                                 <SelectContent>
                                     <SelectItem value="Fuel">Fuel (Diesel/Petrol)</SelectItem>
                                     <SelectItem value="Electric">Electric (EV)</SelectItem>
                                 </SelectContent>
                             </Select>
                         </div>
                     </div>

                     <div className="space-y-2">
                         <Label>Plate Number</Label>
                         <Input 
                            value={formData.plate} 
                            onChange={(e) => setFormData({...formData, plate: e.target.value.toUpperCase()})}
                            placeholder="KCA 123X"
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                             <Label>Make / Model</Label>
                             <Input 
                                value={formData.model} 
                                onChange={(e) => setFormData({...formData, model: e.target.value})}
                                placeholder="e.g. Isuzu FRR"
                            />
                         </div>
                         <div className="space-y-2">
                             <Label>Color</Label>
                             <Input 
                                value={formData.color} 
                                onChange={(e) => setFormData({...formData, color: e.target.value})}
                                placeholder="e.g. White"
                            />
                         </div>
                     </div>

                     <div className="space-y-2">
                         <Label>Load Capacity (kg)</Label>
                         <Input 
                            type="number"
                            value={formData.capacity} 
                            onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
                            placeholder="e.g. 5000"
                        />
                     </div>

                     <Separator className="my-2" />
                     
                     <div className="space-y-4">
                         <Label className="text-slate-900 font-bold">Vehicle Documents</Label>
                         <div className="grid gap-3">
                             {/* Logbook Upload */}
                             <div className="flex items-center justify-between p-3 border rounded-md">
                                 <div className="flex items-center gap-3">
                                      <FileText className="h-5 w-5 text-slate-400" />
                                      <div className="flex flex-col">
                                          <span className="text-sm font-medium">Logbook Scanned Copy</span>
                                          <span className="text-xs text-slate-500">
                                              {docs.logbook ? (
                                                   <a href={`http://localhost:5000${docs.logbook}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Document</a>
                                               ) : "Not uploaded"}
                                          </span>
                                      </div>
                                 </div>
                                 <Button type="button" variant="outline" size="sm" onClick={() => handleUploadClick('logbook')} disabled={uploading === 'logbook'}>
                                     {uploading === 'logbook' ? <Loader2 className="h-3 w-3 animate-spin" /> : (docs.logbook ? "Change" : "Upload")}
                                 </Button>
                             </div>
                             
                             {/* Insurance Upload */}
                             <div className="flex items-center justify-between p-3 border rounded-md">
                                 <div className="flex items-center gap-3">
                                      <FileText className="h-5 w-5 text-slate-400" />
                                      <div className="flex flex-col">
                                          <span className="text-sm font-medium">Insurance Certificate</span>
                                          <span className="text-xs text-slate-500">
                                              {docs.insurance ? (
                                                   <a href={`http://localhost:5000${docs.insurance}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Document</a>
                                               ) : "Not uploaded"}
                                          </span>
                                      </div>
                                 </div>
                                 <Button type="button" variant="outline" size="sm" onClick={() => handleUploadClick('insurance')} disabled={uploading === 'insurance'}>
                                     {uploading === 'insurance' ? <Loader2 className="h-3 w-3 animate-spin" /> : (docs.insurance ? "Change" : "Upload")}
                                 </Button>
                             </div>
                         </div>
                     </div>

                     <Button type="submit" className="w-full bg-slate-900 mt-2">Save Vehicle & Documents</Button>
                 </form>
             </CardContent>
          </Card>
      )}
    </div>
  );
}
