import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, User, MapPin, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export default function Settings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // Get user from local storage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || user?._id;

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      address: user?.address || "",
      phone: user?.phone || "",
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    try {
        const payload = {
            userId,
            ...values
        };
        const { data } = await api.put("/auth/profile", payload);
        
        // Update local storage
        localStorage.setItem("user", JSON.stringify(data));
        
        toast({
            title: "Profile updated",
            description: "Your settings have been saved.",
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to update profile.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  }

  async function onPromote() {
    if (!secretKey) return;
    setIsAdminLoading(true);
    try {
        const { data } = await api.put("/auth/promote", { userId, secretKey });
        
        // Update local storage
        localStorage.setItem("user", JSON.stringify(data.user));
        
        toast({
            title: "Success",
            description: "You are now an Admin. Refreshing...",
        });
        
        // Force reload to update sidebar
        setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
        toast({
            title: "Error",
            description: "Invalid secret key.",
            variant: "destructive",
        });
    } finally {
        setIsAdminLoading(false);
    }
  }

  if (!user) return <div className="p-8">Please log in to view settings.</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences.</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Your name" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                         <Input placeholder="Email address" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the email you use to login.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Your phone number" className="pl-9" {...field} />
                        </div>
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
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Full address" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Used for pickup requests.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {user?.role !== "admin" && (
            <Card className="mt-8 border-yellow-200 bg-yellow-50/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-yellow-600" />
                    Admin Access
                </CardTitle>
                <CardDescription>Enter the secret key to gain admin privileges.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    <Input 
                        type="password" 
                        placeholder="Enter secret key" 
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                    />
                    <Button 
                        disabled={!secretKey || isAdminLoading}
                        onClick={onPromote}
                        variant="outline"
                        className="border-yellow-200 hover:bg-yellow-50 hover:text-yellow-700"
                    >
                        {isAdminLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                    </Button>
                </div>
            </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
