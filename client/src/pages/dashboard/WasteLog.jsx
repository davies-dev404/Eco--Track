import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { wasteTypeColors } from "@/lib/mockData";

const formSchema = z.object({
  type: z.enum(["plastic", "paper", "glass", "metal", "organic", "ewaste"], {
    required_error: "Please select a waste type.",
  }),
  weight: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Weight must be a positive number.",
  }),
  date: z.date({
    required_error: "A date of disposal is required.",
  }),
  notes: z.string().optional(),
});

import api from "@/lib/api";
import { useEffect } from "react";

// ... (keep imports)

export default function WasteLog() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState([]);
  
  // Get user from local storage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || user?._id; // Handle both id formats if needed

  useEffect(() => {
    if (userId) {
      fetchRecords();
    }
  }, [userId]);

  const fetchRecords = async () => {
    try {
      const { data } = await api.get(`/waste?userId=${userId}`);
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch records", error);
    }
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: "",
      notes: "",
    },
  });

  async function onSubmit(values) {
      if (!userId) {
        toast({
            title: "Error",
            description: "You must be logged in to log waste.",
            variant: "destructive",
        });
        return;
      }

    setIsLoading(true);
    
    try {
        const payload = {
            userId,
            type: values.type,
            weight: Number(values.weight),
            date: values.date, // Backend expects date object or string, Mongoose handles it
            notes: values.notes,
        };

        const { data } = await api.post("/waste", payload);
        
        setRecords([data, ...records]);
        form.reset({
            weight: "",
            notes: "",
        });
        
        toast({
            title: "Record added",
            description: `Successfully logged ${values.weight}kg of ${values.type}.`,
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to save record.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Log Waste</h1>
        <p className="text-muted-foreground">Record your recycling activities to track your impact.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Entry</CardTitle>
            <CardDescription>Enter the details of your recycled waste.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a waste type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="plastic">Plastic</SelectItem>
                          <SelectItem value="paper">Paper</SelectItem>
                          <SelectItem value="glass">Glass</SelectItem>
                          <SelectItem value="metal">Metal</SelectItem>
                          <SelectItem value="organic">Organic</SelectItem>
                          <SelectItem value="ewaste">E-Waste</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 2.5" {...field} />
                      </FormControl>
                      <FormDescription>
                        Approximate weight of the waste.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
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
                                <span>Pick a date</span>
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
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Add Record
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
            <CardDescription>Your recently logged items.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {records.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No records yet. Start logging!
                </div>
              ) : (
                records.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
                        style={{ backgroundColor: wasteTypeColors[record.type] }}
                      >
                        {record.type.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{record.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {(() => {
                            try {
                              return format(new Date(record.date), "PPP");
                            } catch (e) {
                              return "Invalid Date";
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{record.weight} kg</p>
                      <p className="text-xs text-green-600">-{record.carbonSaved}kg CO2</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
