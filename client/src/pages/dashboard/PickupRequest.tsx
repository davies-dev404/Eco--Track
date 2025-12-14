import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, MapPin, Truck } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { mockPickupRequests } from "@/lib/mockData";

const wasteTypeItems = [
  { id: "plastic", label: "Plastic" },
  { id: "paper", label: "Paper" },
  { id: "glass", label: "Glass" },
  { id: "metal", label: "Metal" },
  { id: "ewaste", label: "E-Waste" },
  { id: "bulk", label: "Bulk Items" },
] as const;

const formSchema = z.object({
  date: z.date({
    required_error: "A pickup date is required.",
  }),
  wasteTypes: z.array(z.string()).refine((value) => value.length > 0, {
    message: "You have to select at least one waste type.",
  }),
  notes: z.string().optional(),
});

export default function PickupRequest() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState(mockPickupRequests);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wasteTypes: [],
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newRequest = {
        id: `p-${Date.now()}`,
        userId: 'u1',
        date: format(values.date, 'yyyy-MM-dd'),
        status: 'pending' as const,
        wasteTypes: values.wasteTypes,
        notes: values.notes,
      };
      
      setRequests([newRequest, ...requests]);
      setIsLoading(false);
      form.reset({
        wasteTypes: [],
        notes: "",
      });
      
      toast({
        title: "Pickup Scheduled",
        description: `Your pickup request for ${format(values.date, "PPP")} has been submitted.`,
      });
    }, 1500);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Schedule Pickup</h1>
        <p className="text-muted-foreground">Request a collection for bulk items or specific waste types.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Form</CardTitle>
            <CardDescription>Fill in the details for your waste collection.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="wasteTypes"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Waste Types</FormLabel>
                        <FormDescription>
                          Select the items you need collected.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {wasteTypeItems.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="wasteTypes"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Preferred Date</FormLabel>
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
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Pickups are usually processed between 8 AM and 5 PM.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="E.g. Gate code is 1234, pick up from back alley..." 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
                  Submit Request
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Pickup History</CardTitle>
            <CardDescription>Track the status of your requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                      request.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      request.status === 'scheduled' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {request.status}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {request.date}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Waste Collection</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Types: {request.wasteTypes.join(', ')}
                      </p>
                      {request.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          "{request.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
