import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Save, CheckCircle, Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export default function AdminProfile({ user, onUpdate }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        avatar: user?.avatar || "",
        currentPassword: "",
        newPassword: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append("file", file); // Matched with server expectation

        setIsUploading(true);
        try {
            const res = await api.post("/upload", uploadData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            // Assuming res.data.url contains the uploaded image path
            const newAvatarUrl = res.data.url || res.data.filePath; // Adapt based on actual response
            setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
            
            // Optional: Immediately verify update?
            toast({ title: "Photo Uploaded", description: "Your profile photo has been updated." });
        } catch (error) {
            console.error("Upload error:", error);
            toast({ title: "Upload Failed", description: "Could not upload image.", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Simulated update - replace with actual API endpoint if available
            // await api.put("/auth/profile", { name: formData.name, email: formData.email, avatar: formData.avatar });
            
             setTimeout(() => {
                toast({ title: "Profile Updated", description: "Your profile details have been saved." });
                setIsLoading(false);
             }, 800);

        } catch (error) {
            toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header Card */}
            <Card className="border-0 shadow-md overflow-hidden relative">
                 <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800"></div>
                 <div className="px-8 pb-8">
                     <div className="relative -mt-12 mb-4 group inline-block">
                         <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-lg cursor-pointer transition-opacity group-hover:opacity-90">
                                <AvatarImage src={formData.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=10b981&color=fff`} className="object-cover" />
                                <AvatarFallback className="bg-slate-900 text-white text-xl">AD</AvatarFallback>
                            </Avatar>
                            
                             {/* Upload Overlay */}
                            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                {isUploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
                            </label>
                            <input 
                                id="avatar-upload" 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleImageUpload}
                                disabled={isUploading}
                            />
                         </div>

                         <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white pointer-events-none" title="Online">
                             <div className="h-3 w-3 bg-white rounded-full"></div>
                         </div>
                     </div>
                     
                     <div className="flex justify-between items-start">
                         <div>
                             <h2 className="text-2xl font-bold text-slate-900">{formData.name || "Admin User"}</h2>
                             <p className="text-slate-500 flex items-center gap-2">
                                 <Mail className="h-4 w-4" /> {formData.email || "admin@ecotrack.com"}
                             </p>
                         </div>
                         <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200 px-3 py-1 text-sm">
                             <Shield className="h-3 w-3 mr-1" /> Super Admin
                         </Badge>
                     </div>
                 </div>
            </Card>

            {/* Edit Form */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Update your personal information and security credentials.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input 
                                        id="name" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        className="pl-9" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input 
                                        id="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        className="pl-9" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                             <h4 className="text-sm font-medium text-slate-900 mb-4">Security</h4>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input 
                                        id="currentPassword" 
                                        name="currentPassword" 
                                        type="password"
                                        placeholder="••••••••"
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input 
                                        id="newPassword" 
                                        name="newPassword" 
                                        type="password" 
                                        placeholder="••••••••"
                                        onChange={handleChange} 
                                    />
                                </div>
                             </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
                                {isLoading ? (
                                    <>Saving...</>
                                ) : (
                                    <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
