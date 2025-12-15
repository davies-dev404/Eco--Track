import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, MessageSquare, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UserSupport() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            toast({ 
                title: "Message Sent", 
                description: "Our support team will get back to you shortly." 
            });
            setIsSubmitting(false);
            e.target.reset();
        }, 1000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Contact Form */}
                <Card className="flex-1 border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                             <MessageSquare className="h-5 w-5 text-emerald-600" /> Contact Support
                        </CardTitle>
                        <CardDescription>We're here to help with any issues or questions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="e.g., Pickup Issue, App Bug" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Describe your issue in detail..." className="min-h-[120px]" required />
                            </div>
                            <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                {isSubmitting ? "Sending..." : <><Send className="mr-2 h-4 w-4" /> Send Message</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Contact Info & FAQ */}
                <div className="flex-1 space-y-6">
                    <Card className="bg-emerald-50 border-emerald-100 text-emerald-900">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full shadow-sm">
                                    <Mail className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600/70">Email Us</p>
                                    <p className="font-semibold">support@ecotrack.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full shadow-sm">
                                    <Phone className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600/70">Call Us</p>
                                    <p className="font-semibold">+254 700 123 456</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full shadow-sm">
                                    <MapPin className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600/70">Visit Us</p>
                                    <p className="font-semibold">Eco Plaza, Nairobi</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HelpCircle className="h-5 w-5 text-slate-500" /> FAQ
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>How are points calculated?</AccordionTrigger>
                                    <AccordionContent>
                                        You earn 10 points for every 1kg of waste recycled. Points can be redeemed for rewards in the marketplace.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>When will my pickup be collected?</AccordionTrigger>
                                    <AccordionContent>
                                        Once matched with a driver, pickups are usually collected within 24 hours. You can track status in the "Pickup Requests" tab.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>What types of waste do you accept?</AccordionTrigger>
                                    <AccordionContent>
                                        We currently accept Plastic, Paper, Metal, Glass, and E-Waste. Ensure waste is sorted before popup.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
