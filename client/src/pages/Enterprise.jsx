import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Building2, TrendingUp, ShieldCheck, Users } from "lucide-react";
import enterpriseImage from "@assets/generated_images/sustainable_corporate_office.png";

export default function Enterprise() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="relative h-[60vh] min-h-[500px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={enterpriseImage} 
              alt="Enterprise Sustainability" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
          </div>
          
          <div className="container relative z-10 px-4 md:px-6 text-white">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-4xl md:text-6xl font-heading font-bold animate-in slide-in-from-bottom-5 duration-700">
                Sustainability at <span className="text-green-400">Scale</span>
              </h1>
              <p className="text-xl text-white/90 animate-in slide-in-from-bottom-5 duration-700 delay-100">
                Comprehensive waste management solutions for cities, municipalities, and multinational corporations.
              </p>
              <div className="flex gap-4 pt-4 animate-in slide-in-from-bottom-5 duration-700 delay-200">
                <Link href="/contact">
                  <Button size="lg" className="bg-white text-black hover:bg-white/90">Contact Sales</Button>
                </Link>
                <Link href="/case-studies">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">View Case Studies</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
              <div className="space-y-6">
                <h2 className="text-3xl font-heading font-bold">Why Top Organizations Choose EcoTrack</h2>
                <p className="text-lg text-muted-foreground">
                  Managing waste across multiple facilities requires robust tools. EcoTrack Enterprise provides a unified platform to oversee your entire environmental footprint.
                </p>
                <ul className="space-y-4">
                  {[
                    "Centralized dashboard for multi-site management",
                    "Custom API integrations with ERP systems",
                    "Automated ESG reporting and compliance",
                    "Dedicated success manager and 24/7 support",
                    "IoT sensor network deployment and maintenance"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <CheckIcon />
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/50 border-none">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <Building2 className="h-8 w-8 text-primary" />
                    <h3 className="font-bold">Multi-Site</h3>
                    <p className="text-sm text-muted-foreground">Manage hundreds of locations from one view</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50 border-none">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <h3 className="font-bold">Compliance</h3>
                    <p className="text-sm text-muted-foreground">Automated regulatory reporting</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50 border-none">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <h3 className="font-bold">Analytics</h3>
                    <p className="text-sm text-muted-foreground">Predictive waste generation models</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50 border-none">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <Users className="h-8 w-8 text-primary" />
                    <h3 className="font-bold">Access Control</h3>
                    <p className="text-sm text-muted-foreground">Granular role-based permissions</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-primary/5">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl font-heading font-bold mb-12">Trusted by Industry Leaders</h2>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale">
              {/* Placeholders for logos */}
              {['Acme Corp', 'Global Ind', 'EcoSystems', 'Future Tech', 'GreenLife'].map((logo, i) => (
                <div key={i} className="text-xl font-bold font-heading">{logo}</div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
