import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, User, MapPin, Phone, Shield, Lock, Camera, Upload } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  address: z.string().optional(),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function Settings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Get user from local storage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || user?._id;

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      address: user?.address || "",
      phone: user?.phone || "",
    },
  });

  const passwordForm = useForm({
      resolver: zodResolver(passwordSchema),
      defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" }
  });

  async function onSubmit(values) {
    setIsLoading(true);
    try {
        const payload = {
            userId,
            ...values,
            avatar: avatarPreview 
        };
        const { data } = await api.put("/auth/profile", payload);
        
        localStorage.setItem("user", JSON.stringify(data));
        
        toast({ title: "Profile updated", description: "Your settings have been saved." });
        // Force header update
        window.dispatchEvent(new Event("storage"));
    } catch (error) {
        toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setAvatarPreview(reader.result);
          };
          reader.readAsDataURL(file);
      }
  };

  async function onPasswordSubmit(values) {
      try {
          await api.put("/auth/change-password", {
              userId,
              currentPassword: values.currentPassword,
              newPassword: values.newPassword
          });
          toast({ title: "Success", description: "Password changed successfully." });
          passwordForm.reset();
      } catch (error) {
          toast({ title: "Error", description: error.response?.data?.message || "Failed to change password", variant: "destructive" });
      }
  }

  async function onPromote() {
    if (!secretKey) return;
    setIsAdminLoading(true);
    try {
        const { data } = await api.put("/auth/promote", { userId, secretKey });
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({ title: "Success", description: "You are now an Admin. Refreshing..." });
        setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
        toast({ title: "Error", description: "Invalid secret key.", variant: "destructive" });
    } finally {
        setIsAdminLoading(false);
    }
  }

  if (!user) return <div className="p-8">Please log in to view settings.</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and security.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your public profile details.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                              
                              {/* Avatar Section */}
                              <div className="flex flex-col items-center sm:flex-row gap-6 p-4 border rounded-lg bg-slate-50/50">
                                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                      <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                                          <AvatarImage src={avatarPreview} className="object-cover" />
                                          <AvatarFallback className="text-2xl bg-slate-200">{user.name?.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Camera className="h-8 w-8 text-white" />
                                      </div>
                                  </div>
                                  <div className="space-y-2 text-center sm:text-left">
                                      <h3 className="font-medium">Profile Photo</h3>
                                      <p className="text-xs text-muted-foreground">Click the image to upload a new photo.</p>
                                      <input 
                                          type="file" 
                                          ref={fileInputRef} 
                                          className="hidden" 
                                          accept="image/*"
                                          onChange={handleFileChange}
                                      />
                                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                          <Upload className="h-3 w-3 mr-2" /> Upload New
                                      </Button>
                                  </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                  <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" {...field} />
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
                                            <Input {...field} disabled className="bg-slate-50" />
                                        </FormControl>
                                        <FormDescription>Email cannot be changed.</FormDescription>
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
                                                <Input className="pl-9" {...field} />
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
                                        <FormLabel>Default Address</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                              </div>

                              <div className="flex justify-end">
                                  <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                  </Button>
                              </div>
                          </form>
                      </Form>
                  </CardContent>
              </Card>

              {user?.role !== "admin" && (
                <Card className="border-yellow-200 bg-yellow-50/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Shield className="h-4 w-4 text-yellow-600" />
                        Admin Access
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input 
                            type="password" 
                            placeholder="Enter secret key" 
                            value={secretKey}
                            onChange={(e) => setSecretKey(e.target.value)}
                            className="max-w-xs"
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
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Password & Security</CardTitle>
                      <CardDescription>Manage your account credentials.</CardDescription>
                  </CardHeader>
                  <CardContent>
                        <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                                <FormField
                                    control={passwordForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input type="password" className="pl-9" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={passwordForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input type="password" className="pl-9" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={passwordForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input type="password" className="pl-9" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Update Password</Button>
                            </form>
                        </Form>
                  </CardContent>
              </Card>
          </TabsContent>
      </Tabs>
    </div>
  );
}
