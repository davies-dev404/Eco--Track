import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, MapPin, Truck, Camera, Upload, Trash2, Crosshair, Navigation, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { wasteTypeColors } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

// Enhanced Waste Types with Icons
const wasteTypeItems = [
  { id: "plastic", label: "Plastic", color: "bg-blue-100 border-blue-200 text-blue-700" },
  { id: "paper", label: "Paper", color: "bg-yellow-100 border-yellow-200 text-yellow-700" },
  { id: "glass", label: "Glass", color: "bg-green-100 border-green-200 text-green-700" },
  { id: "metal", label: "Metal", color: "bg-gray-100 border-gray-200 text-gray-700" },
  { id: "ewaste", label: "E-Waste", color: "bg-purple-100 border-purple-200 text-purple-700" },
  { id: "organic", label: "Organic", color: "bg-lime-100 border-lime-200 text-lime-700" },
];

const formSchema = z.object({
  date: z.date({
    required_error: "A pickup date is required.",
  }),
  address: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  wasteTypes: z.array(z.string()).refine((value) => value.length > 0, {
    message: "Select at least one waste type.",
  }),
  instructions: z.string().optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
});


export default function PickupRequest() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [pendingLogs, setPendingLogs] = useState([]);
  const [selectedLogIds, setSelectedLogIds] = useState([]);

  // Get user from local storage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || user?._id;

  // Stub for photo upload
  const handlePhotoUpload = (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
          const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
          setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
          toast({ title: "Photo Added", description: "Image attached to request." });
      }
  };

  const removePhoto = (index) => {
      setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };


  useEffect(() => {
    if (userId) {
        api.get(`/pickup?userId=${userId}`)
           .then(({data}) => setRequests(data))
           .catch(err => console.error(err));
           
        api.get(`/waste?userId=${userId}&status=logged`)
           .then(({data}) => setPendingLogs(data))
           .catch(err => console.error(err));
    }
  }, [userId]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: user?.address || "",
      city: "",
      wasteTypes: [],
      instructions: "",
    },
  });
  
  const toggleLogSelection = (log) => {
      if (selectedLogIds.includes(log._id)) {
          // Unselect
          setSelectedLogIds(prev => prev.filter(id => id !== log._id));
      } else {
          // Select
          setSelectedLogIds(prev => [...prev, log._id]);
          // Auto-add type to form if not present
          const currentTypes = form.getValues("wasteTypes");
          if (!currentTypes.includes(log.type)) {
               form.setValue("wasteTypes", [...currentTypes, log.type]);
          }
      }
  };

  const handleGetLocation = () => {
      setIsLocating(true);
      if("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const { latitude, longitude } = position.coords;
                  form.setValue("location", { lat: latitude, lng: longitude });
                  toast({ title: "Location Found", description: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
                  setIsLocating(false);
              },
              (error) => {
                  console.error(error);
                  toast({ title: "Location Error", description: "Could not fetch GPS. Please enter address manually.", variant: "destructive" });
                  setIsLocating(false);
              }
          );
      } else {
          toast({ title: "Not Supported", description: "Geolocation is not supported by your browser.", variant: "destructive" });
          setIsLocating(false);
      }
  };

  async function onSubmit(values) {
    if (!userId) {
       toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
       return;
    }
    setIsLoading(true);
    
    try {
      const payload = {
        userId,
        date: values.date,
        address: values.address,
        city: values.city,
        street: values.address, // mapping address to street for backend
        location: values.location,
        wasteTypes: values.wasteTypes,
        instructions: values.instructions,
        wasteRecordIds: selectedLogIds,
        estimatedWeight: pendingLogs.filter(l => selectedLogIds.includes(l._id)).reduce((acc, curr) => acc + curr.weight, 0),
        photos: [] // Stub: would be URLs from uploadedPhotos
      };

      const { data } = await api.post("/pickup", payload);
      
      setRequests([...requests, data]); 
      setIsLoading(false);
      form.reset({
        address: "",
        city: "",
        wasteTypes: [],
        instructions: "",
      });
      setUploadedPhotos([]);
      setSelectedLogIds([]);
      // Refresh pending logs to remove the scheduled ones
      api.get(`/waste?userId=${userId}&status=logged`).then(({data}) => setPendingLogs(data));
      
      toast({
        title: "Pickup Scheduled",
        description: `Request for ${values.city} has been broadcast to drivers.`,
      });
    } catch (error) {
      setIsLoading(false);
       toast({
        title: "Error",
        description: "Failed to schedule pickup.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">New Request</h1>
        <p className="text-muted-foreground">Select waste types, upload photos, and schedule your pickup.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Request Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Pickup Details</CardTitle>
            <CardDescription>We collect between 8:00 AM and 5:00 PM.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Logged Waste Selection */}
                 {pendingLogs.length > 0 && (<>
                   <div className="space-y-3 p-4 border rounded-lg bg-slate-50/50">
                       <div className="flex items-center justify-between">
                           <div>
                               <Label className="text-base font-semibold">Select Logged Waste</Label>
                               <p className="text-sm text-muted-foreground">Attach items you've already logged.</p>
                           </div>
                           <Badge variant="secondary">{pendingLogs.length} Available</Badge>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                           {pendingLogs.map(log => {
                               const isChecked = selectedLogIds.includes(log._id);
                               return (
                                   <div 
                                       key={log._id} 
                                       className={cn(
                                           "flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all",
                                           isChecked ? "border-green-500 bg-white shadow-sm ring-1 ring-green-200" : "border-slate-200 bg-white hover:border-slate-300"
                                       )}
                                       onClick={() => toggleLogSelection(log)}
                                   >
                                       <div className="flex items-center gap-3">
                                            <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", isChecked ? "border-green-600 bg-green-600 text-white" : "border-slate-300")}>
                                                {isChecked && <CheckCircle className="h-3 w-3" />}
                                            </div>
                                            <div>
                                                <p className="font-medium capitalize text-sm">{log.type}</p>
                                                <p className="text-xs text-muted-foreground">{format(new Date(log.date), "MMM d")} • {log.weight}kg</p>
                                            </div>
                                       </div>
                                       <Badge variant={isChecked ? "default" : "outline"} className="text-xs">
                                           {isChecked ? "Attached" : "Add"}
                                       </Badge>
                                   </div>
                               );
                           })}
                       </div>
                   </div>
                   
                   {/* Summary of Selection */}
                   {selectedLogIds.length > 0 && (
                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                           <div className="bg-blue-100 p-2 rounded-full">
                               <CheckCircle className="h-4 w-4 text-blue-700" />
                           </div>
                           <div>
                               <p className="text-sm font-semibold text-blue-900">
                                   Ready to Pickup: {selectedLogIds.length} items (~{pendingLogs.filter(l => selectedLogIds.includes(l._id)).reduce((acc, curr) => acc + curr.weight, 0).toFixed(1)} kg)
                               </p>
                               <p className="text-xs text-blue-700">
                                   Weight details will be automatically sent to the driver. No need to re-enter.
                               </p>
                           </div>
                       </div>
                   )}
                   </>)}

                {/* Visual Waste Grid */}
                <FormField
                  control={form.control}
                  name="wasteTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">What are we collecting?</FormLabel>
                      <FormDescription>Click to select multiple items.</FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {wasteTypeItems.map((item) => {
                          const isSelected = field.value?.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                isSelected
                                  ? field.onChange(field.value?.filter((v) => v !== item.id))
                                  : field.onChange([...(field.value || []), item.id]);
                              }}
                              className={cn(
                                "cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center justify-center transition-all hover:bg-slate-50",
                                isSelected ? `border-green-500 bg-green-50` : "border-slate-100",
                                item.color.split(' ')[0] // approximate background tint
                              )}
                            >
                                <span className={cn("font-medium", isSelected ? "text-green-700" : "text-slate-600")}>
                                    {item.label}
                                </span>
                            </div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Photo Upload Stub */}
                <div className="space-y-2">
                    <Label>Photos (Optional)</Label>
                    <div className="flex items-center gap-4">
                        <Button type="button" variant="outline" className="relative cursor-pointer" asChild>
                             <label>
                                 <Camera className="mr-2 h-4 w-4" />
                                 Add Photo
                                 <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                             </label>
                        </Button>
                        <span className="text-xs text-muted-foreground">Max 3 photos</span>
                    </div>
                    {uploadedPhotos.length > 0 && (
                        <div className="flex gap-2 mt-2">
                            {uploadedPhotos.map((src, i) => (
                                <div key={i} className="relative h-16 w-16 rounded overflow-hidden border">
                                    <img src={src} alt="Upload preview" className="h-full w-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => removePhoto(i)}
                                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
                                    >
                                        <div className="h-3 w-3">×</div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Date Picker */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Scheduled Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Location & Instructions */}
                <div className="grid gap-4">
                    <div className="flex items-center gap-2">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm" 
                            className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100"
                            onClick={handleGetLocation}
                            disabled={isLocating}
                        >
                            {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Navigation className="mr-2 h-4 w-4" />}
                            {isLocating ? "Getting GPS..." : "Use My Precise Location"}
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City/Town</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Nairobi" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                        />
                        <FormField
                              control={form.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Street Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. 123 Moi Ave" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                        />
                    </div>

                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="E.g. Call upon arrival, beware of dog..." 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
                  Confirm Pickup Request
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Mini History Sidebar */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.slice(0, 3).map((request) => ( // Only show top 3
                <div key={request.id} className="border-l-2 pl-3 py-1 space-y-1 border-slate-200">
                    <p className="text-sm font-medium">{format(new Date(request.date), "MMM d, yyyy")}</p>
                    <div className="flex items-center gap-2">
                         <span className={cn("text-xs px-2 py-0.5 rounded-full capitalize", 
                            request.status === 'completed' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                         )}>
                             {request.status.replace("_"," ")}
                         </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{request.wasteTypes.join(', ')}</p>
                </div>
              ))}
              <Button variant="link" className="w-full text-xs">View Full History</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
