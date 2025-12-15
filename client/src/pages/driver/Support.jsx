import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, LifeBuoy, MessageSquare, Phone, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Support({ user }) {
  const { toast } = useToast();
  const [ticket, setTicket] = useState({
      subject: "",
      category: "payment",
      message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
          setIsSubmitting(false);
          toast({ title: "Ticket Submitted", description: "Support team will contact you shortly." });
          setTicket({ subject: "", category: "payment", message: "" });
      }, 1500);
  };

  const handleEmergency = () => {
      if (confirm("Are you sure? This will alert admins and share your location.")) {
           navigator.geolocation.getCurrentPosition(() => {
                toast({ title: "EMERGENCY ALERT SENT", description: "Help is on the way.", variant: "destructive" });
           }, () => {
               toast({ title: "Error", description: "Turn on GPS for emergency support.", variant: "destructive" });
           });
      }
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <LifeBuoy className="h-6 w-6" /> Driver Support
      </h2>

      {/* Emergency Button */}
      <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-center justify-between">
              <div>
                  <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" /> Emergency Help
                  </h3>
                  <p className="text-red-600/80 text-sm">Vehicle breakdown or safety issue?</p>
              </div>
              <Button variant="destructive" size="lg" className="animate-pulse shadow-red-200 shadow-xl" onClick={handleEmergency}>
                  SOS - Alert Admin
              </Button>
          </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
         <Card>
             <CardHeader>
                 <CardTitle className="text-lg">Contact Info</CardTitle>
                 <CardDescription>Direct lines for urgent issues.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                 <div className="flex items-center gap-3">
                     <div className="bg-slate-100 p-2 rounded-full"><Phone className="h-4 w-4" /></div>
                     <div>
                         <p className="font-medium">Support Hotline</p>
                         <a href="tel:+254700000000" className="text-blue-600 text-sm hover:underline">+254 700 000 000</a>
                     </div>
                 </div>
                 <div className="flex items-center gap-3">
                     <div className="bg-slate-100 p-2 rounded-full"><MessageSquare className="h-4 w-4" /></div>
                     <div>
                         <p className="font-medium">WhatsApp</p>
                         <a href="#" className="text-green-600 text-sm hover:underline">Chat with Support</a>
                     </div>
                 </div>
             </CardContent>
         </Card>

         <Card>
             <CardHeader>
                 <CardTitle className="text-lg">FAQ</CardTitle>
                 <CardDescription>Common questions.</CardDescription>
             </CardHeader>
             <CardContent>
                 <ul className="list-disc ml-4 space-y-1 text-sm text-slate-600">
                     <li>How are earnings calculated?</li>
                     <li>Change vehicle details?</li>
                     <li>App not loading map?</li>
                 </ul>
                 <Button variant="link" className="px-0 h-auto mt-2 text-blue-600">Visit Help Center</Button>
             </CardContent>
         </Card>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Submit a Ticket</CardTitle>
              <CardDescription>For non-urgent inquiries.</CardDescription>
          </CardHeader>
          <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label>Subject</Label>
                          <Input 
                            value={ticket.subject} 
                            onChange={(e) => setTicket({...ticket, subject: e.target.value})}
                            required 
                            placeholder="Brief title"
                          />
                      </div>
                      <div className="space-y-2">
                          <Label>Category</Label>
                          <Select 
                            value={ticket.category} 
                            onValueChange={(val) => setTicket({...ticket, category: val})}
                          >
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="payment">Payments / Wallet</SelectItem>
                                  <SelectItem value="app">App Issue</SelectItem>
                                  <SelectItem value="pickup">Pickup Issue</SelectItem>
                                  <SelectItem value="account">Account Settings</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea 
                        value={ticket.message} 
                        onChange={(e) => setTicket({...ticket, message: e.target.value})}
                        required
                        placeholder="Describe the issue in detail..."
                        className="h-32"
                      />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                      <Send className="h-4 w-4 mr-2" /> Submit Ticket
                  </Button>
              </form>
          </CardContent>
      </Card>
    </div>
  );
}
