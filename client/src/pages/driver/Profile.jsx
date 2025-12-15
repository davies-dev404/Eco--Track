import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Shield, Key, FileText, CheckCircle, Upload, Heart, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Profile({ user }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(null); // track which field is uploading
  const fileInputRef = useRef(null);
  const [activeUploadField, setActiveUploadField] = useState(null);

  const [formData, setFormData] = useState({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      nextOfKin: {
          name: user.nextOfKin?.name || "",
          relation: user.nextOfKin?.relation || "",
          phone: user.nextOfKin?.phone || ""
      }

  });

  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "");

  // Simulated Document State (In real app, these would be URLs from DB)
  const [documents, setDocuments] = useState({
      idCard: user.documents?.idCard || "",
      license: user.documents?.license || "",
      goodConduct: user.documents?.goodConduct || ""
  });

  const handleSave = async (e) => {
      e.preventDefault();
      try {
          const { data } = await api.put("/auth/profile", {
              userId: user.id || user._id, 

              ...formData,
              avatar: avatarUrl,
              documents // sending updated docs
          });
          
          const updatedUser = { ...user, ...data };
          localStorage.setItem("user", JSON.stringify(updatedUser)); // Update local storage
          
          toast({ title: "Profile Updated", description: "Your details have been saved." });
          setIsEditing(false);
          // Force header update
          window.dispatchEvent(new Event("storage"));
      } catch (error) {
          toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
      }
  };

  // Handle File Selection Trigger
  const handleUploadClick = (field) => {
      setActiveUploadField(field);
      if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset
          fileInputRef.current.click();
      }
  };

  // Handle Actual File Upload
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
           
           // Update state based on field type (avatar vs documents)

           if (activeUploadField === 'avatar') {
               setAvatarUrl(data.url);
           } else {
               setDocuments(prev => ({ ...prev, [activeUploadField]: data.url }));
           }
           
           toast({ title: "Upload Success", description: "Document uploaded successfully." });
      } catch (error) {
           console.error(error);
           toast({ title: "Upload Failed", description: "Could not upload file.", variant: "destructive" });
      } finally {
           setUploading(null);
           setActiveUploadField(null);
      }
  };

  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      {/* Hidden Global File Input */}
      <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,application/pdf"
          onChange={handleFileChange}
      />
      <div className="flex items-center gap-4 mb-4">

          <div className="relative group cursor-pointer" onClick={() => handleUploadClick('avatar')}>
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg group-hover:opacity-80 transition-opacity">
                  <AvatarImage src={avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:5000${avatarUrl}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                   {uploading === 'avatar' ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Upload className="h-6 w-6 text-white" />}
              </div>
          </div>
          <div>
              <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
              <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Driver</Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                      <CheckCircle className="w-3 h-3 mr-1" /> Active
                  </Badge>
              </div>
          </div>
      </div>

      <div className="grid gap-6">
          <form onSubmit={handleSave}>
              <div className="space-y-6">
                  {/* Personal Details */}
                  <Card>
                      <CardHeader className="pb-3 border-b bg-slate-50/50">
                          <div className="flex justify-between items-center">
                              <CardTitle className="text-lg flex items-center gap-2">
                                  <User className="h-5 w-5 text-slate-500" /> Personal Information
                              </CardTitle>
                              {!isEditing && (
                                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                      Edit Details
                                  </Button>
                              )}
                          </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                          <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label>Full Name</Label>
                                  <Input 
                                      disabled={!isEditing}
                                      value={formData.name}
                                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label>Phone Number</Label>
                                  <Input 
                                      type="tel"
                                      disabled={!isEditing}
                                      value={formData.phone}
                                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                  />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                  <Label>Email Address</Label>
                                  <Input 
                                      type="email"
                                      disabled={true} 
                                      value={formData.email}
                                      className="bg-slate-50"
                                  />
                              </div>
                          </div>
                      </CardContent>
                  </Card>

                  {/* Next of Kin */}
                  <Card>
                      <CardHeader className="pb-3 border-b bg-slate-50/50">
                           <CardTitle className="text-lg flex items-center gap-2">
                               <Heart className="h-5 w-5 text-red-500" /> Next of Kin
                           </CardTitle>
                           <CardDescription>Emergency contact information.</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                          <div className="grid md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                  <Label>Name</Label>
                                  <Input 
                                      disabled={!isEditing}
                                      value={formData.nextOfKin.name}
                                      onChange={(e) => setFormData({
                                          ...formData, 
                                          nextOfKin: { ...formData.nextOfKin, name: e.target.value }
                                      })}
                                      placeholder="Full Name"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label>Relation</Label>
                                  <Input 
                                      disabled={!isEditing}
                                      value={formData.nextOfKin.relation}
                                      onChange={(e) => setFormData({
                                          ...formData, 
                                          nextOfKin: { ...formData.nextOfKin, relation: e.target.value }
                                      })}
                                      placeholder="e.g. Spouse, Sibling"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label>Phone</Label>
                                  <Input 
                                      type="tel"
                                      disabled={!isEditing}
                                      value={formData.nextOfKin.phone}
                                      onChange={(e) => setFormData({
                                          ...formData, 
                                          nextOfKin: { ...formData.nextOfKin, phone: e.target.value }
                                      })}
                                      placeholder="Mobile Number"
                                  />
                              </div>
                          </div>
                      </CardContent>
                  </Card>

                  {/* Documents */}
                  <Card>
                      <CardHeader className="pb-3 border-b bg-slate-50/50">
                           <CardTitle className="text-lg flex items-center gap-2">
                               <FileCheck className="h-5 w-5 text-blue-500" /> Personal Documents
                           </CardTitle>
                           <CardDescription>Upload your identification documents.</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                           <div className="space-y-4">
                               <div className="flex items-center justify-between p-3 border rounded-lg">
                                   <div className="flex items-center gap-3">
                                       <div className={`p-2 rounded-full ${documents.idCard ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                           <FileText className="h-5 w-5" />
                                       </div>
                                       <div>
                                           <p className="font-medium text-sm">National ID / Passport</p>
                                           <p className="text-xs text-slate-500">
                                               {documents.idCard ? (
                                                   <a href={`http://localhost:5000${documents.idCard}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Document</a>
                                               ) : "Required"}
                                           </p>
                                       </div>
                                   </div>
                                   {isEditing && (
                                       <Button type="button" variant="outline" size="sm" onClick={() => handleUploadClick('idCard')} disabled={uploading === 'idCard'}>
                                           {uploading === 'idCard' ? <Loader2 className="h-3 w-3 animate-spin" /> : (documents.idCard ? "Update" : "Upload")}
                                       </Button>
                                   )}
                               </div>

                               <div className="flex items-center justify-between p-3 border rounded-lg">
                                   <div className="flex items-center gap-3">
                                       <div className={`p-2 rounded-full ${documents.license ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                           <FileText className="h-5 w-5" />
                                       </div>
                                       <div>
                                           <p className="font-medium text-sm">Driving License</p>
                                           <p className="text-xs text-slate-500">
                                               {documents.license ? (
                                                   <a href={`http://localhost:5000${documents.license}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Document</a>
                                               ) : "Required"}
                                           </p>
                                       </div>
                                   </div>
                                   {isEditing && (
                                       <Button type="button" variant="outline" size="sm" onClick={() => handleUploadClick('license')} disabled={uploading === 'license'}>
                                           {uploading === 'license' ? <Loader2 className="h-3 w-3 animate-spin" /> : (documents.license ? "Update" : "Upload")}
                                       </Button>
                                   )}
                               </div>
                               
                               <div className="flex items-center justify-between p-3 border rounded-lg">
                                   <div className="flex items-center gap-3">
                                       <div className={`p-2 rounded-full ${documents.goodConduct ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                           <FileText className="h-5 w-5" />
                                       </div>
                                       <div>
                                           <p className="font-medium text-sm">Certificate of Good Conduct</p>
                                           <p className="text-xs text-slate-500">
                                               {documents.goodConduct ? (
                                                   <a href={`http://localhost:5000${documents.goodConduct}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Document</a>
                                               ) : "Optional"}
                                           </p>
                                       </div>
                                   </div>
                                   {isEditing && (
                                       <Button type="button" variant="outline" size="sm" onClick={() => handleUploadClick('goodConduct')} disabled={uploading === 'goodConduct'}>
                                          {uploading === 'goodConduct' ? <Loader2 className="h-3 w-3 animate-spin" /> : (documents.goodConduct ? "Update" : "Upload")}
                                       </Button>
                                   )}
                               </div>
                           </div>
                      </CardContent>
                  </Card>

                  {isEditing && (
                      <div className="flex gap-4 justify-end sticky bottom-4">
                          <Button type="button" variant="outline" className="shadow-lg bg-white" onClick={() => setIsEditing(false)}>Cancel</Button>
                          <Button type="submit" className="shadow-lg bg-slate-900">Save All Changes</Button>
                      </div>
                  )}
              </div>
          </form>
      </div>
    </div>
  );
}
