import { useState } from "react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Leaf, Mail, Lock, User, Building2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import cityImage from "@assets/generated_images/eco-friendly_city_hero_image.png";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["individual", "organization"]),
});

export default function Auth() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Parse query params to set default tab
  const params = new URLSearchParams(window.location.search);
  const defaultTab = params.get("tab") || "login";

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "individual",
    },
  });

  async function onLogin(values) {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/login", values);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onRegister(values) {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/register", values);
      toast({
        title: "Account created",
        description: "Welcome to EcoTrack!",
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 grid lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-col relative bg-muted text-white p-10 justify-between overflow-hidden">
        <div className="absolute inset-0">
          <img src={cityImage} alt="Eco City" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
        </div>
        
        <div className="relative z-10 flex items-center gap-2">
          <Leaf className="h-8 w-8 text-white" />
          <span className="text-2xl font-heading font-bold">EcoTrack</span>
        </div>

        <div className="relative z-10 max-w-md">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed">
              &ldquo;EcoTrack has completely transformed how our community handles waste. We've reduced our landfill contribution by 40% in just six months.&rdquo;
            </p>
            <footer className="text-sm opacity-80">
              Sarah Chen, Community Organizer
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2 lg:text-left">
            <h1 className="text-3xl font-heading font-bold tracking-tight">
              {defaultTab === 'login' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-muted-foreground">
              Enter your details below to manage your eco-journey.
            </p>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="name@example.com" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign In
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="John Doe" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="name@example.com" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I am a...</FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                          <div 
                            className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center gap-2 hover:bg-muted transition-colors ${field.value === 'individual' ? 'border-primary bg-primary/5' : 'border-muted'}`}
                            onClick={() => field.onChange('individual')}
                          >
                            <User className={`h-6 w-6 ${field.value === 'individual' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="text-sm font-medium">Individual</span>
                          </div>
                          <div 
                            className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center gap-2 hover:bg-muted transition-colors ${field.value === 'organization' ? 'border-primary bg-primary/5' : 'border-muted'}`}
                            onClick={() => field.onChange('organization')}
                          >
                            <Building2 className={`h-6 w-6 ${field.value === 'organization' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="text-sm font-medium">Organization</span>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Account
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
