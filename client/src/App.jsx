import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import About from "@/pages/About";
import Impact from "@/pages/Impact";
import Features from "@/pages/Features";
import Enterprise from "@/pages/Enterprise";
import Pricing from "@/pages/Pricing";
import CaseStudies from "@/pages/CaseStudies";
import Blog from "@/pages/Blog";
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";
import Auth from "@/pages/Auth";
import DashboardLayout from "@/pages/Dashboard";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";

function Router() {
  return (
    <Switch>
      {/* Main Pages */}
      <Route path="/" component={Landing} />
      <Route path="/about" component={About} />
      <Route path="/impact" component={Impact} />
      
      {/* Product & Solutions */}
      <Route path="/features" component={Features} />
      <Route path="/enterprise" component={Enterprise} />
      <Route path="/pricing" component={Pricing} />
      
      {/* Resources */}
      <Route path="/case-studies" component={CaseStudies} />
      <Route path="/blog" component={Blog} />
      <Route path="/careers" component={Careers} />
      <Route path="/contact" component={Contact} />
      
      {/* App & Legal */}
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard*" component={DashboardLayout} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
